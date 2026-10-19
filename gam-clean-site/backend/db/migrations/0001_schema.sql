-- ============================================================================
-- GAM CLEAN — Schéma initial (PostgreSQL 15+ / Supabase)
-- ----------------------------------------------------------------------------
-- Principes d'optimisation appliqués à toutes les tables :
--   1. Types au plus juste : smallint pour les petites tables de référence
--      (clés étrangères sur 2 octets), bigint identity pour les tables qui
--      grossissent, enum (4 octets) pour les listes fermées, timestamptz partout.
--   2. Colonnes ordonnées par alignement (8 → 4 → 2 → 1 octet → longueur
--      variable) pour éviter les octets de remplissage dans chaque ligne.
--   3. Intégrité garantie par la base : NOT NULL, CHECK (formats, longueurs,
--      bornes), clés étrangères avec action de suppression explicite.
--   4. Index uniquement pour les requêtes réellement exécutées (voir
--      docs/BASE-DE-DONNEES.md) : composites alignés sur le tri, partiels,
--      trigrammes pour la recherche, BRIN pour le journal append-only.
--      Index chronologiques en ordre CROISSANT : les nouvelles lignes arrivent
--      en fin d'index (découpages de pages à 90/10, pages pleines) et
--      PostgreSQL les lit à rebours pour les tris « plus récent d'abord ».
--   5. fillfactor réduit sur les tables souvent mises à jour (mises à jour HOT).
-- ============================================================================

set local search_path = gam, extensions, public;

create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

create schema if not exists gam;
comment on schema gam is 'Données de l''application GAM CLEAN. Schéma non exposé par l''API REST de Supabase.';

-- ----------------------------------------------------------------------------
-- Types énumérés (listes fermées, 4 octets, validés par la base)
-- ----------------------------------------------------------------------------
create type gam.lead_type as enum ('quote', 'contact');
create type gam.lead_status as enum ('new', 'in_progress', 'quote_sent', 'won', 'lost', 'spam');
create type gam.lead_frequency as enum ('one_off', 'recurring', 'undecided');
create type gam.client_profile as enum (
  'company', 'retail', 'industry', 'condominium', 'public_sector',
  'healthcare', 'construction', 'individual', 'other'
);
create type gam.lead_event_kind as enum ('status_change', 'note', 'assignment', 'notification', 'review_request');
create type gam.admin_role as enum ('owner', 'editor', 'sales');
create type gam.review_status as enum ('pending', 'published', 'rejected');
create type gam.service_icon as enum (
  'building', 'store', 'factory', 'facade', 'hardhat', 'droplets', 'layers', 'flask',
  'waves', 'road', 'flame', 'truck', 'city', 'landmark', 'medical'
);

-- ----------------------------------------------------------------------------
-- Fonctions de recherche (minuscules + sans accents), évaluées pour chaque
-- ligne examinée par une recherche : elles doivent être rapides.
--   · IMMUTABLE, pour être utilisables dans un index sur expression.
--   · Corps SQL standard (RETURN) : analysé et lié aux objets dès la création,
--     donc insensible au search_path à l'exécution (même protection qu'un
--     SET search_path) sans le coût d'un SET à chaque appel — mesuré sur
--     100 000 lignes : 15 µs par ligne avec SET, 3 µs sans (voir
--     docs/BASE-DE-DONNEES.md). lead_search_document devient en outre
--     « inlinable » par le planificateur.
-- Le schéma de l'extension unaccent est résolu dynamiquement (Supabase
-- l'installe dans « extensions », une base locale peut l'avoir ailleurs).
-- ----------------------------------------------------------------------------
do $$
declare
  ext_schema text;
begin
  select n.nspname into ext_schema
  from pg_extension e join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'unaccent';

  execute format(
    'create function gam.normalize_search(input text) returns text '
    || 'language sql immutable strict parallel safe '
    || 'return pg_catalog.lower(%I.unaccent(%L::regdictionary, input))',
    ext_schema, quote_ident(ext_schema) || '.unaccent');
end
$$;
comment on function gam.normalize_search(text) is 'Minuscules et suppression des accents, pour la recherche par trigrammes.';

-- Texte recherché dans une demande. Indexé par expression (index trigrammes) :
-- rien n'est stocké en double dans la table.
create function gam.lead_search_document(name text, email text, company text, location text, phone text)
  returns text
  language sql immutable parallel safe
  return gam.normalize_search(
    name || ' ' || email || coalesce(' ' || company, '') || coalesce(' ' || location, '') || coalesce(' ' || phone, ''));
comment on function gam.lead_search_document(text, text, text, text, text) is 'Document de recherche d''une demande (nom, e-mail, société, ville, téléphone), normalisé.';

-- ============================================================================
-- COMPTES D'ADMINISTRATION
-- ============================================================================
create table gam.admin_users (
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  last_login_at         timestamptz,
  locked_until          timestamptz,
  password_changed_at   timestamptz not null default now(),
  role                  gam.admin_role not null default 'sales',
  id                    smallint generated always as identity primary key,
  failed_logins         smallint not null default 0 check (failed_logins between 0 and 1000),
  is_active             boolean not null default true,
  must_change_password  boolean not null default true,
  email                 text not null check (
                          char_length(email) <= 254
                          and email = lower(email)
                          and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  display_name          text not null check (char_length(display_name) between 2 and 80),
  password_hash         text not null check (password_hash like 'scrypt$%')
);
create unique index admin_users_email_key on gam.admin_users (email);
comment on table gam.admin_users is 'Comptes nominatifs du back-office. Mots de passe hachés (scrypt), jamais stockés en clair.';
comment on column gam.admin_users.role is 'owner : tous les droits et gestion des comptes · editor : contenus, avis, demandes · sales : demandes uniquement.';

create table gam.admin_sessions (
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  last_seen_at  timestamptz not null default now(),
  id            bigint generated always as identity primary key,
  user_id       smallint not null references gam.admin_users (id) on delete cascade,
  token_hash    bytea not null check (octet_length(token_hash) = 32),
  user_agent    text check (char_length(user_agent) <= 300),
  check (expires_at > created_at)
) with (fillfactor = 90);
create unique index admin_sessions_token_hash_key on gam.admin_sessions (token_hash);
create index admin_sessions_user_id_idx on gam.admin_sessions (user_id);
create index admin_sessions_expires_at_idx on gam.admin_sessions (expires_at);
comment on table gam.admin_sessions is 'Sessions du back-office. Seule l''empreinte SHA-256 du jeton est stockée. last_seen_at n''est pas indexé : ses mises à jour restent HOT (fillfactor 90).';

-- ============================================================================
-- CONTENUS ÉDITABLES
-- ============================================================================
create table gam.site_settings (
  updated_at             timestamptz not null default now(),
  updated_by             smallint references gam.admin_users (id) on delete set null,
  founded_year           smallint check (founded_year between 1900 and 2100),
  lead_retention_months  smallint not null default 36 check (lead_retention_months between 6 and 120),
  id                     boolean primary key default true check (id),
  linkedin_confirmed     boolean not null default false,
  company_name           text not null check (char_length(company_name) between 2 and 80),
  legal_name             text not null check (char_length(legal_name) between 2 and 120),
  legal_form             text check (char_length(legal_form) <= 60),
  share_capital          text check (char_length(share_capital) <= 40),
  siret                  text not null check (siret ~ '^[0-9]{14}$'),
  vat_number             text check (vat_number ~ '^FR[0-9A-Z]{2}[0-9]{9}$'),
  registration           text check (char_length(registration) <= 120),
  ape_code               text check (ape_code ~ '^[0-9]{2}\.[0-9]{2}[A-Z]$'),
  publication_director   text check (char_length(publication_director) <= 120),
  phone_display          text not null check (char_length(phone_display) between 6 and 30),
  phone_e164             text not null check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  email                  text not null check (
                           char_length(email) <= 254
                           and email = lower(email)
                           and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  street                 text check (char_length(street) <= 160),
  postal_code            text not null check (postal_code ~ '^[0-9]{5}$'),
  city                   text not null check (char_length(city) between 2 and 80),
  department             text not null check (char_length(department) between 2 and 80),
  department_code        text not null check (department_code ~ '^(2A|2B|[0-9]{2,3})$'),
  region                 text not null check (char_length(region) between 2 and 80),
  service_area_short     text not null check (char_length(service_area_short) between 2 and 80),
  service_area_long      text not null check (char_length(service_area_long) between 10 and 300),
  service_areas          text[] not null default '{}' check (cardinality(service_areas) <= 20),
  opening_hours          jsonb check (opening_hours is null or jsonb_typeof(opening_hours) = 'array'),
  response_time          text check (char_length(response_time) <= 80),
  linkedin_url           text check (linkedin_url ~ '^https://([a-z]+\.)?linkedin\.com/'),
  host_name              text not null default 'Vercel Inc.' check (char_length(host_name) between 2 and 120),
  host_address           text check (char_length(host_address) <= 200),
  host_website           text check (host_website ~ '^https://')
);
comment on table gam.site_settings is 'Coordonnées et informations légales (une seule ligne, garantie par la contrainte id = true).';
comment on column gam.site_settings.lead_retention_months is 'Durée de conservation des demandes inactives, appliquée par gam.purge_expired_data().';

create table gam.claims (
  updated_at    timestamptz not null default now(),
  updated_by    smallint references gam.admin_users (id) on delete set null,
  position      smallint not null default 0,
  is_confirmed  boolean not null default false,
  key           text primary key check (key ~ '^[a-z][a-zA-Z0-9]{1,39}$'),
  title         text not null check (char_length(title) between 3 and 80),
  body          text not null check (char_length(body) between 5 and 300)
);
comment on table gam.claims is 'Affirmations commerciales. Publiées sur le site uniquement si is_confirmed (preuve détenue par GAM CLEAN).';

create table gam.services (
  updated_at        timestamptz not null default now(),
  id                smallint generated always as identity primary key,
  position          smallint not null default 0,
  updated_by        smallint references gam.admin_users (id) on delete set null,
  icon              gam.service_icon not null,
  is_featured       boolean not null default false,
  is_published      boolean not null default true,
  slug              text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  name              text not null check (char_length(name) between 2 and 60),
  summary           text not null check (char_length(summary) between 10 and 220),
  h1                text not null check (char_length(h1) between 5 and 110),
  meta_title        text not null check (char_length(meta_title) between 10 and 70),
  meta_description  text not null check (char_length(meta_description) between 50 and 170),
  image_key         text check (image_key ~ '^[a-z0-9-]{2,60}$'),
  image_alt         text check (char_length(image_alt) <= 200),
  photo_brief       text check (char_length(photo_brief) <= 300),
  intro             text[] not null default '{}' check (cardinality(intro) between 1 and 6),
  includes          text[] not null default '{}' check (cardinality(includes) <= 20),
  for_whom          text[] not null default '{}' check (cardinality(for_whom) <= 12),
  how_it_works      jsonb not null default '[]' check (jsonb_typeof(how_it_works) = 'array' and jsonb_array_length(how_it_works) <= 6),
  groups            jsonb not null default '[]' check (jsonb_typeof(groups) = 'array' and jsonb_array_length(groups) <= 12)
);
create unique index services_slug_key on gam.services (slug);
-- Pas d'index d'ordre d'affichage : quelques lignes, lues en entier (plus rapide qu'un index à cette taille).
comment on table gam.services is 'Prestations affichées sur le site. Listes ordonnées sans identité propre stockées en text[] / jsonb (pas de jointure à la lecture).';

create table gam.service_relations (
  service_id  smallint not null references gam.services (id) on delete cascade,
  related_id  smallint not null references gam.services (id) on delete cascade,
  position    smallint not null default 0,
  primary key (service_id, related_id),
  check (service_id <> related_id)
);
create index service_relations_related_id_idx on gam.service_relations (related_id);
comment on table gam.service_relations is 'Prestations complémentaires affichées en bas de chaque page de prestation.';

create table gam.faq_items (
  updated_at    timestamptz not null default now(),
  id            smallint generated always as identity primary key,
  service_id    smallint references gam.services (id) on delete cascade,
  position      smallint not null default 0,
  updated_by    smallint references gam.admin_users (id) on delete set null,
  is_published  boolean not null default true,
  question      text not null check (char_length(question) between 5 and 200),
  answer        text not null check (char_length(answer) between 5 and 1500)
);
-- Couvre la clé étrangère (suppression en cascade d'une prestation) et l'ordre d'affichage.
create index faq_items_scope_position_idx on gam.faq_items (service_id, position, id);
comment on table gam.faq_items is 'Questions fréquentes : service_id NULL = FAQ générale, sinon FAQ propre à une prestation.';

create table gam.sectors (
  updated_at    timestamptz not null default now(),
  id            smallint generated always as identity primary key,
  position      smallint not null default 0,
  updated_by    smallint references gam.admin_users (id) on delete set null,
  icon          gam.service_icon not null,
  is_published  boolean not null default true,
  slug          text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  name          text not null check (char_length(name) between 2 and 60),
  challenge     text not null check (char_length(challenge) between 10 and 400),
  approach      text not null check (char_length(approach) between 10 and 400),
  examples      text[] not null default '{}' check (cardinality(examples) <= 10)
);
create unique index sectors_slug_key on gam.sectors (slug);

create table gam.sector_services (
  sector_id   smallint not null references gam.sectors (id) on delete cascade,
  service_id  smallint not null references gam.services (id) on delete cascade,
  position    smallint not null default 0,
  primary key (sector_id, service_id)
);
create index sector_services_service_id_idx on gam.sector_services (service_id);

-- ============================================================================
-- DEMANDES (devis et contact)
-- ============================================================================
create table gam.leads (
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  status_changed_at  timestamptz not null default now(),
  notified_at        timestamptz,
  id                 bigint generated always as identity primary key,
  surface_m2         integer check (surface_m2 between 1 and 1000000),
  type               gam.lead_type not null,
  status             gam.lead_status not null default 'new',
  frequency          gam.lead_frequency,
  profile            gam.client_profile,
  assigned_to        smallint references gam.admin_users (id) on delete set null,
  notify_attempts    smallint not null default 0 check (notify_attempts between 0 and 100),
  other_need         boolean not null default false,
  name               text not null check (char_length(name) between 2 and 100),
  company            text check (char_length(company) <= 120),
  email              text not null check (
                       char_length(email) <= 254
                       and email = lower(email)
                       and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  phone_e164         text check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  location           text check (char_length(location) between 2 and 100),
  message            text check (char_length(message) <= 3000),
  source_path        text check (char_length(source_path) <= 200),
  constraint leads_quote_requires_location check (type <> 'quote' or location is not null),
  constraint leads_quote_requires_phone check (type <> 'quote' or phone_e164 is not null),
  constraint leads_contact_requires_message check (type <> 'contact' or coalesce(char_length(message), 0) >= 10)
) with (fillfactor = 90);

-- Liste du back-office : filtre par statut + tri antéchronologique + pagination par curseur.
-- Sert aussi le compteur « nouvelles demandes » par lecture de l'index seul.
create index leads_status_created_idx on gam.leads (status, created_at, id);
-- Liste « toutes les demandes » triée + pagination par curseur (lue à rebours).
create index leads_created_idx on gam.leads (created_at, id);
-- Recherche tolérante (nom, e-mail, société, ville, téléphone) : index trigrammes
-- sur expression, sans colonne stockée en double.
create index leads_search_trgm_idx on gam.leads
  using gin (gam.lead_search_document(name, email, company, location, phone_e164) gin_trgm_ops);
-- Demandes assignées à un membre de l'équipe.
create index leads_assigned_to_idx on gam.leads (assigned_to, created_at) where assigned_to is not null;
-- Relance des notifications e-mail en échec (index minuscule : ne contient que les demandes non notifiées).
create index leads_pending_notification_idx on gam.leads (created_at) where notified_at is null;

comment on table gam.leads is 'Demandes de devis et de contact reçues par le site. Conservées selon site_settings.lead_retention_months.';
comment on column gam.leads.notified_at is 'Date d''envoi de l''e-mail de notification. NULL = à renvoyer (tâche de maintenance).';

create table gam.lead_services (
  lead_id     bigint not null references gam.leads (id) on delete cascade,
  service_id  smallint not null references gam.services (id) on delete restrict,
  primary key (lead_id, service_id)
);
create index lead_services_service_id_idx on gam.lead_services (service_id);
comment on table gam.lead_services is 'Prestations demandées (n-n). Une prestation déjà demandée ne peut pas être supprimée : la dépublier.';

create table gam.lead_events (
  created_at   timestamptz not null default now(),
  id           bigint generated always as identity primary key,
  lead_id      bigint not null references gam.leads (id) on delete cascade,
  kind         gam.lead_event_kind not null,
  from_status  gam.lead_status,
  to_status    gam.lead_status,
  actor_id     smallint references gam.admin_users (id) on delete set null,
  assignee_id  smallint references gam.admin_users (id) on delete set null,
  body         text check (char_length(body) <= 2000),
  constraint lead_events_status_change_complete check (kind <> 'status_change' or to_status is not null),
  constraint lead_events_note_has_body check (kind <> 'note' or coalesce(char_length(body), 0) >= 1)
);
create index lead_events_lead_created_idx on gam.lead_events (lead_id, created_at);
comment on table gam.lead_events is 'Historique de chaque demande : changements de statut (automatiques, par trigger), notes, assignations.';

-- ============================================================================
-- AVIS CLIENTS
-- ============================================================================
create table gam.review_requests (
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  used_at       timestamptz,
  id            bigint generated always as identity primary key,
  lead_id       bigint references gam.leads (id) on delete set null,
  created_by    smallint references gam.admin_users (id) on delete set null,
  token_hash    bytea not null check (octet_length(token_hash) = 32),
  client_name   text not null check (char_length(client_name) between 2 and 100),
  client_email  text check (
                  char_length(client_email) <= 254
                  and client_email = lower(client_email)
                  and client_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  check (expires_at > created_at)
);
create unique index review_requests_token_hash_key on gam.review_requests (token_hash);
create index review_requests_lead_id_idx on gam.review_requests (lead_id) where lead_id is not null;
create index review_requests_created_idx on gam.review_requests (created_at);
comment on table gam.review_requests is 'Invitations à laisser un avis : lien personnel à usage unique (seule l''empreinte du jeton est stockée).';

create table gam.reviews (
  created_at            timestamptz not null default now(),
  moderated_at          timestamptz,
  id                    bigint generated always as identity primary key,
  request_id            bigint references gam.review_requests (id) on delete set null,
  status                gam.review_status not null default 'pending',
  service_id            smallint references gam.services (id) on delete set null,
  moderated_by          smallint references gam.admin_users (id) on delete set null,
  rating                smallint not null check (rating between 1 and 5),
  rating_quality        smallint check (rating_quality between 1 and 5),
  rating_punctuality    smallint check (rating_punctuality between 1 and 5),
  rating_communication  smallint check (rating_communication between 1 and 5),
  consent_publish       boolean not null,
  author_name           text not null check (char_length(author_name) between 2 and 80),
  author_company        text check (char_length(author_company) <= 120),
  comment               text not null check (char_length(comment) between 10 and 2000),
  rejection_reason      text check (char_length(rejection_reason) <= 300),
  constraint reviews_publish_requires_consent check (status <> 'published' or consent_publish)
);
create unique index reviews_request_id_key on gam.reviews (request_id) where request_id is not null;
create index reviews_published_idx on gam.reviews (moderated_at, id) where status = 'published';
create index reviews_pending_idx on gam.reviews (created_at, id) where status = 'pending';
create index reviews_created_idx on gam.reviews (created_at, id);
comment on table gam.reviews is 'Avis clients. Le contenu est immuable (trigger) ; seule la modération change. Publication impossible sans consentement (contrainte).';

-- ============================================================================
-- JOURNAL D'AUDIT ET LIMITATION DE DÉBIT
-- ============================================================================
create table gam.audit_log (
  created_at   timestamptz not null default now(),
  id           bigint generated always as identity primary key,
  actor_id     smallint references gam.admin_users (id) on delete set null,
  action       text not null check (action ~ '^[a-z_]+\.[a-z_]+$'),
  entity_type  text check (entity_type ~ '^[a-z_]{2,40}$'),
  entity_id    text check (char_length(entity_id) <= 80),
  details      jsonb check (details is null or jsonb_typeof(details) = 'object')
);
-- Journal en ajout seul : BRIN (quelques Ko) pour la purge par date, la clé
-- primaire (croissante) sert l'affichage des dernières entrées. Pas d'index
-- par auteur : aucune requête ne filtre le journal ainsi, et chaque index
-- ralentirait toutes les écritures.
create index audit_log_created_brin on gam.audit_log using brin (created_at);
comment on table gam.audit_log is 'Traçabilité des actions du back-office (qui a fait quoi, quand).';

create unlogged table gam.rate_limits (
  window_start  timestamptz not null,
  hits          integer not null check (hits >= 0),
  bucket_key    bytea primary key check (octet_length(bucket_key) = 32)
);
comment on table gam.rate_limits is 'Compteurs anti-abus partagés entre instances serverless. UNLOGGED : écritures rapides, contenu jetable.';
