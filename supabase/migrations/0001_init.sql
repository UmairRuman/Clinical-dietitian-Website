-- Dn. Bushra Naseem website – initial schema
-- Security model:
--   * RLS is ON for every table. Nothing is exposed by default (auto-expose is disabled on the project).
--   * Visitors (anon) can only SELECT public site content and the public_submissions view.
--   * All visitor WRITES (enquiries, reviews) go through server code with the secret key after Turnstile/rate-limit checks.
--   * Admin = a row in admin_users. Admin policies are a second line of defence; admin server code also checks.

-- ───────────── enums ─────────────
create type meeting_source as enum ('teams','whatsapp','zoom','google_meet','voice_call','office','other');
create type appointment_status as enum ('scheduled','confirmed','completed','cancelled','no_show');
create type session_type as enum ('first_consultation','follow_up');
create type request_status as enum ('new','converted','closed');
create type submission_type as enum ('review','story');
create type name_pref as enum ('full','first','anonymous');
create type submission_status as enum ('pending','approved','featured','rejected','hidden','deleted');
create type link_kind as enum ('social','button');

-- ───────────── helpers ─────────────
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','assistant')),
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_users where user_id = auth.uid() and role = 'admin');
$$;

-- ───────────── site content ─────────────
create table profile (
  id int primary key default 1 check (id = 1),
  name text not null,
  experience_line text not null,
  tagline text not null,
  bio text not null,
  about_long text,
  photo_path text,
  photo_alt text,
  contact_email text not null,
  contact_phone text not null,
  whatsapp_number text,
  address text,
  updated_at timestamptz not null default now()
);

create table profile_photos (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index profile_photos_one_current on profile_photos (is_current) where is_current;

create table links (
  id uuid primary key default gen_random_uuid(),
  kind link_kind not null,
  key text not null unique,
  label text not null,
  url text,
  icon text,
  action text not null default 'url' check (action in ('url','about','services','stories','contact')),
  visible boolean not null default true,
  sort_order int not null default 0
);

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short text not null,
  icon text not null,
  intro text not null,
  who_for text[] not null default '{}',
  approach text[] not null default '{}',
  you_get text[] not null default '{}',
  faqs jsonb not null default '[]',
  visible boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  visible boolean not null default true,
  sort_order int not null default 0
);

create table settings (
  id int primary key default 1 check (id = 1),
  notification_email text not null,
  working_hours jsonb not null default '{}',
  days_off jsonb not null default '[]',
  buffer_min int not null default 10,
  durations int[] not null default '{30,45,60}',
  meeting_defaults jsonb not null default '{}',
  card_text text not null default 'Please join 5 minutes early.',
  updated_at timestamptz not null default now()
);

-- ───────────── bookings ─────────────
create sequence appointment_seq;

create table booking_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  preferred_date date,
  preferred_time time,
  concern text,
  message text,
  status request_status not null default 'new',
  created_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default
    ('BN-' || to_char(now() at time zone 'Asia/Karachi', 'YYMM') || '-' || lpad(nextval('appointment_seq')::text, 4, '0')),
  client_name text not null,
  client_phone text not null,
  client_email text,
  starts_at timestamptz not null,
  duration_min int not null check (duration_min between 5 and 480),
  ends_at timestamptz not null,                  -- kept in sync by trigger (generated columns can't use timestamptz + interval)
  meeting_source meeting_source not null,
  meeting_source_other text,
  meeting_link text,
  location text,
  service text,
  session_type session_type,
  internal_notes text,
  status appointment_status not null default 'scheduled',
  cancel_reason text,
  request_id uuid references booking_requests(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index appointments_starts_idx on appointments (starts_at);

create table appointment_cards (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  version int not null default 1,
  path text,
  generated_at timestamptz not null default now(),
  superseded_at timestamptz
);

-- ───────────── reviews & stories ─────────────
create table submissions (
  id uuid primary key default gen_random_uuid(),
  type submission_type not null,
  display_name text not null,
  name_pref name_pref not null default 'first',
  private_contact text not null,                 -- never exposed publicly
  rating int check (rating between 1 and 5),
  body text not null check (char_length(body) between 30 and 1000),
  original_body text not null,
  result_summary text,
  consent_publish boolean not null check (consent_publish),
  consent_photos boolean not null default false,
  consent_at timestamptz not null default now(),
  status submission_status not null default 'pending',
  featured_order int,
  rejection_reason text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index submissions_status_idx on submissions (status, created_at desc);

create table submission_images (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  path text not null,
  width int,
  height int,
  alt text,
  sort_order int not null default 0
);

-- Public projection: approved/featured only, no private contact, no internal fields.
create view public_submissions as
  select s.id, s.type, s.display_name, s.name_pref, s.rating, s.body, s.result_summary,
         (s.status = 'featured') as featured, s.featured_order, s.created_at,
         coalesce(
           (select jsonb_agg(jsonb_build_object('path', i.path, 'alt', i.alt, 'width', i.width, 'height', i.height) order by i.sort_order)
              from submission_images i where i.submission_id = s.id),
           '[]'::jsonb) as images
  from submissions s
  where s.status in ('approved','featured') and s.deleted_at is null;

-- ───────────── ops tables ─────────────
create table rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits int not null default 1,
  primary key (key, window_start)
);

create table audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  target text,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ───────────── updated_at triggers ─────────────
create trigger t_profile before update on profile for each row execute function set_updated_at();
create trigger t_services before update on services for each row execute function set_updated_at();
create trigger t_settings before update on settings for each row execute function set_updated_at();
create trigger t_appointments before update on appointments for each row execute function set_updated_at();

create or replace function set_appointment_end() returns trigger language plpgsql as $$
begin new.ends_at = new.starts_at + make_interval(mins => new.duration_min); return new; end $$;
create trigger t_appointments_end before insert or update of starts_at, duration_min on appointments
  for each row execute function set_appointment_end();
create trigger t_submissions before update on submissions for each row execute function set_updated_at();

-- ───────────── Row Level Security ─────────────
alter table admin_users enable row level security;
alter table profile enable row level security;
alter table profile_photos enable row level security;
alter table links enable row level security;
alter table services enable row level security;
alter table faqs enable row level security;
alter table settings enable row level security;
alter table booking_requests enable row level security;
alter table appointments enable row level security;
alter table appointment_cards enable row level security;
alter table submissions enable row level security;
alter table submission_images enable row level security;
alter table rate_limits enable row level security;
alter table audit_log enable row level security;

-- public content: visitors may read
create policy "public read profile" on profile for select to anon, authenticated using (true);
create policy "public read visible links" on links for select to anon, authenticated using (visible);
create policy "public read visible services" on services for select to anon, authenticated using (visible);
create policy "public read visible faqs" on faqs for select to anon, authenticated using (visible);

-- admin: full access to everything (never anon)
do $$
declare t text;
begin
  foreach t in array array['profile','profile_photos','links','services','faqs','settings','booking_requests',
                           'appointments','appointment_cards','submissions','submission_images','audit_log','admin_users']
  loop
    execute format('create policy "admin all %1$s" on %1$I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;
-- rate_limits: no policies at all -> only the secret key (bypasses RLS) can touch it.

-- ───────────── grants (explicit, because auto-expose is OFF) ─────────────
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

grant select on profile, links, services, faqs to anon;
grant select on public_submissions to anon, authenticated;
grant select, insert, update, delete on
  profile, profile_photos, links, services, faqs, settings, booking_requests,
  appointments, appointment_cards, submissions, submission_images, audit_log, admin_users
  to authenticated;
grant usage on all sequences in schema public to authenticated;
grant execute on function is_admin() to authenticated;

-- ───────────── storage buckets ─────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('profile',         'profile',         true,  5242880, array['image/jpeg','image/png','image/webp']),
  ('stories',         'stories',         true,  5242880, array['image/webp','image/jpeg','image/png']),
  ('stories-pending', 'stories-pending', false, 5242880, array['image/webp','image/jpeg','image/png']),
  ('cards',           'cards',           false, 5242880, array['image/png','application/pdf'])
on conflict (id) do nothing;
-- Public buckets serve files by URL. Writes happen only from server code with the secret key.
