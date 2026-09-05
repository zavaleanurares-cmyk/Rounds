-- Minimal stand-ins for the Supabase-managed bits, so the migrations can be run
-- and asserted against a plain Postgres in CI or on a laptop without Docker.
-- Supabase provides all of this in a real project.

create schema if not exists auth;

create table if not exists auth.users (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique,
  raw_user_meta_data  jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

-- auth.uid() reads the JWT claim. Locally it reads a session setting, which is
-- what lets the matrix impersonate each of the six roles.
create or replace function auth.uid()
returns uuid language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid; $$;

create or replace function public.set_current_user(u uuid)
returns void language sql
as $$ select set_config('request.jwt.claim.sub', u::text, false); $$;

-- Storage. Supabase manages this schema; the stub below is only enough for the
-- avatar bucket migration to apply and for its policies to be asserted. The
-- column list mirrors the real `storage.objects` for the fields the policies
-- touch, and nothing else.
create schema if not exists storage;

create table if not exists storage.buckets (
  id                 text primary key,
  name               text not null,
  public             boolean not null default false,
  file_size_limit    bigint,
  allowed_mime_types text[],
  created_at         timestamptz not null default now()
);

create table if not exists storage.objects (
  id        uuid primary key default gen_random_uuid(),
  bucket_id text not null references storage.buckets(id),
  name      text not null,
  owner     uuid,
  created_at timestamptz not null default now()
);

alter table storage.objects enable row level security;

-- `storage.foldername('a/b/c.jpg')` is `{a,b}` — the path minus the filename.
create or replace function storage.foldername(name text)
returns text[] language sql immutable
as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1]; $$;

-- The real project grants these to the API roles; the harness must too, or the
-- matrix cannot even reach the bucket to prove its policies work.
grant usage on schema storage to authenticated;
grant select on storage.buckets to authenticated;
grant select, insert, update, delete on storage.objects to authenticated;
grant execute on function storage.foldername(text) to authenticated;
