-- ============================================================================
-- GAM CLEAN — Fonctions et triggers
-- Toutes les fonctions fixent search_path = '' et qualifient leurs objets
-- (recommandation de sécurité Supabase / PostgreSQL).
-- ============================================================================

-- Identifiant de l'administrateur à l'origine de la modification en cours.
-- L'application le fixe dans chaque transaction : set_config('gam.actor_id', '<id>', true).
create function gam.current_actor() returns smallint
  language sql stable parallel safe
  set search_path = ''
  as $$ select nullif(current_setting('gam.actor_id', true), '')::smallint $$;
comment on function gam.current_actor() is 'Administrateur courant (fixé par l''application pour la transaction), NULL sinon.';

-- ----------------------------------------------------------------------------
-- updated_at automatique
-- ----------------------------------------------------------------------------
create function gam.touch_updated_at() returns trigger
  language plpgsql
  set search_path = ''
  as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger admin_users_touch before update on gam.admin_users
  for each row execute function gam.touch_updated_at();
create trigger site_settings_touch before update on gam.site_settings
  for each row execute function gam.touch_updated_at();
create trigger claims_touch before update on gam.claims
  for each row execute function gam.touch_updated_at();
create trigger services_touch before update on gam.services
  for each row execute function gam.touch_updated_at();
create trigger faq_items_touch before update on gam.faq_items
  for each row execute function gam.touch_updated_at();
create trigger sectors_touch before update on gam.sectors
  for each row execute function gam.touch_updated_at();

-- ----------------------------------------------------------------------------
-- Demandes : dates de suivi + historique automatique des statuts et assignations
-- ----------------------------------------------------------------------------
create function gam.leads_before_update() returns trigger
  language plpgsql
  set search_path = ''
  as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end
$$;

create trigger leads_before_update before update on gam.leads
  for each row execute function gam.leads_before_update();

create function gam.leads_log_changes() returns trigger
  language plpgsql
  set search_path = ''
  as $$
begin
  if new.status is distinct from old.status then
    insert into gam.lead_events (lead_id, kind, from_status, to_status, actor_id)
    values (new.id, 'status_change', old.status, new.status, gam.current_actor());
  end if;
  if new.assigned_to is distinct from old.assigned_to then
    insert into gam.lead_events (lead_id, kind, actor_id, assignee_id)
    values (new.id, 'assignment', gam.current_actor(), new.assigned_to);
  end if;
  return null;
end
$$;

-- Ne se déclenche que si statut ou assignation changent réellement.
create trigger leads_log_changes after update of status, assigned_to on gam.leads
  for each row
  when (old.status is distinct from new.status or old.assigned_to is distinct from new.assigned_to)
  execute function gam.leads_log_changes();

-- ----------------------------------------------------------------------------
-- Avis : contenu immuable (authenticité) + date et auteur de modération
-- ----------------------------------------------------------------------------
create function gam.reviews_before_update() returns trigger
  language plpgsql
  set search_path = ''
  as $$
begin
  if (new.created_at, new.rating, new.rating_quality, new.rating_punctuality, new.rating_communication,
      new.consent_publish, new.author_name, new.author_company, new.comment)
     is distinct from
     (old.created_at, old.rating, old.rating_quality, old.rating_punctuality, old.rating_communication,
      old.consent_publish, old.author_name, old.author_company, old.comment) then
    raise exception using
      errcode = 'P0001',
      message = 'Le contenu d''un avis client ne peut pas être modifié.',
      hint = 'Seule la modération (publier / refuser) est possible. Un avis peut être supprimé à la demande de son auteur.';
  end if;
  if new.status is distinct from old.status then
    new.moderated_at := now();
    new.moderated_by := coalesce(gam.current_actor(), new.moderated_by);
  end if;
  return new;
end
$$;

create trigger reviews_before_update before update on gam.reviews
  for each row execute function gam.reviews_before_update();

-- ----------------------------------------------------------------------------
-- Limitation de débit atomique (fenêtre fixe), partagée entre instances.
-- Retourne le nombre d'appels dans la fenêtre courante, appel inclus.
-- ----------------------------------------------------------------------------
create function gam.rate_limit_hit(p_bucket bytea, p_window interval) returns integer
  language sql volatile
  set search_path = ''
  as $$
  insert into gam.rate_limits as r (bucket_key, window_start, hits)
  values (p_bucket, now(), 1)
  on conflict (bucket_key) do update
    set hits = case when r.window_start <= now() - p_window then 1 else r.hits + 1 end,
        window_start = case when r.window_start <= now() - p_window then now() else r.window_start end
  returning hits
$$;
comment on function gam.rate_limit_hit(bytea, interval) is 'Incrémente atomiquement un compteur anti-abus et renvoie le total de la fenêtre.';

-- ----------------------------------------------------------------------------
-- Purge (RGPD + hygiène) — appelée quotidiennement par la tâche de maintenance.
-- ----------------------------------------------------------------------------
create function gam.purge_expired_data() returns jsonb
  language plpgsql volatile
  set search_path = ''
  as $$
declare
  retention_months smallint;
  n_leads bigint;
  n_sessions bigint;
  n_requests bigint;
  n_rate bigint;
  n_audit bigint;
begin
  select s.lead_retention_months into retention_months from gam.site_settings s where s.id;
  retention_months := coalesce(retention_months, 36);

  -- Demandes sans activité depuis la durée de conservation (événements et prestations liés supprimés en cascade).
  delete from gam.leads l
  where l.updated_at < now() - make_interval(months => retention_months);
  get diagnostics n_leads = row_count;

  delete from gam.admin_sessions where expires_at < now();
  get diagnostics n_sessions = row_count;

  -- Invitations à laisser un avis jamais utilisées et expirées depuis 30 jours.
  delete from gam.review_requests where used_at is null and expires_at < now() - interval '30 days';
  get diagnostics n_requests = row_count;

  delete from gam.rate_limits where window_start < now() - interval '1 day';
  get diagnostics n_rate = row_count;

  delete from gam.audit_log where created_at < now() - interval '24 months';
  get diagnostics n_audit = row_count;

  return jsonb_build_object(
    'leads', n_leads,
    'sessions', n_sessions,
    'review_requests', n_requests,
    'rate_limits', n_rate,
    'audit_log', n_audit,
    'retention_months', retention_months
  );
end
$$;
comment on function gam.purge_expired_data() is 'Supprime les données arrivées à échéance (demandes inactives, sessions, invitations, compteurs, journal > 24 mois).';
