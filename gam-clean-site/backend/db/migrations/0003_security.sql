-- ============================================================================
-- GAM CLEAN — Cloisonnement des accès
-- ----------------------------------------------------------------------------
-- Trois barrières indépendantes protègent les données :
--   1. Le schéma « gam » n'est pas exposé par l'API REST automatique de Supabase
--      (seuls « public » et « graphql_public » le sont par défaut).
--   2. Les rôles publics de Supabase (anon, authenticated, service_role) n'ont
--      aucun droit sur le schéma, même s'il était exposé par erreur.
--   3. La sécurité au niveau des lignes (RLS) est activée sur chaque table :
--      sans politique, tout rôle autre que le propriétaire est refusé.
--      Seul le rôle applicatif « gam_app » reçoit une politique d'accès.
-- L'application se connecte soit avec le rôle propriétaire (configuration
-- simple), soit avec un rôle de connexion membre de « gam_app » (moindre
-- privilège, recommandé — voir docs/BASE-DE-DONNEES.md).
-- ============================================================================

-- 1–2. Retrait de tous les droits par défaut.
revoke all on schema gam from public;
revoke all on all tables in schema gam from public;
revoke all on all sequences in schema gam from public;
revoke all on all functions in schema gam from public;
alter default privileges in schema gam revoke all on tables from public;
alter default privileges in schema gam revoke all on sequences from public;
alter default privileges in schema gam revoke execute on functions from public;

do $$
declare
  r text;
begin
  foreach r in array array['anon', 'authenticated', 'service_role'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on schema gam from %I', r);
      execute format('revoke all on all tables in schema gam from %I', r);
      execute format('revoke all on all sequences in schema gam from %I', r);
      execute format('revoke all on all functions in schema gam from %I', r);
    end if;
  end loop;
end
$$;

-- Rôle applicatif (sans connexion directe) : uniquement les opérations de données.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'gam_app') then
    create role gam_app nologin;
  end if;
end
$$;

grant usage on schema gam to gam_app;
grant select, insert, update, delete on all tables in schema gam to gam_app;
grant usage, select on all sequences in schema gam to gam_app;
grant execute on all functions in schema gam to gam_app;
alter default privileges in schema gam grant select, insert, update, delete on tables to gam_app;
alter default privileges in schema gam grant usage, select on sequences to gam_app;
alter default privileges in schema gam grant execute on functions to gam_app;

-- Le registre des migrations (créé par backend/db/migrate.ts) reste réservé au propriétaire.
do $$
begin
  if to_regclass('gam.schema_migrations') is not null then
    revoke all on table gam.schema_migrations from gam_app;
  end if;
end
$$;

-- 3. RLS sur toutes les tables + politique réservée au rôle applicatif
--    (aucune politique sur le registre des migrations : refus pour tous sauf le propriétaire).
do $$
declare
  t text;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'gam' and c.relkind = 'r'
  loop
    execute format('alter table gam.%I enable row level security', t);
    if t <> 'schema_migrations' then
      execute format('drop policy if exists gam_app_all on gam.%I', t);
      execute format(
        'create policy gam_app_all on gam.%I as permissive for all to gam_app using (true) with check (true)', t
      );
    end if;
  end loop;
end
$$;
