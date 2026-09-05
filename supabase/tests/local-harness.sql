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
