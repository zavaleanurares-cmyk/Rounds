-- 00001 · Foundation: extensions, enums, profiles.
--
-- Two profile tables on purpose. `profiles` is what other people can see;
-- `profiles_private` holds date of birth, body basics and intent, and NOTHING
-- selects it but the owner. Splitting them means a careless join can leak a
-- display name but never a date of birth.

create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.unit_system   as enum ('UK', 'US', 'EU');
create type public.visibility    as enum ('private', 'friends', 'crew', 'link');
create type public.mood          as enum ('great', 'good', 'rough', 'bad');
create type public.drink_category as enum ('beer', 'wine', 'spirit', 'cocktail', 'shot', 'soft', 'water');
create type public.friend_status  as enum ('pending', 'accepted', 'declined');

create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  username          citext unique not null,
  display_name      text not null,
  avatar_url        text,
  level             integer not null default 1,
  unit_system       public.unit_system not null default 'EU',
  currency          text not null default 'EUR',
  region            text not null default 'RO',
  private_account   boolean not null default false,
  default_visibility public.visibility not null default 'friends',
  onboarded         boolean not null default false,
  created_at        timestamptz not null default now(),
  constraint profiles_username_shape check (username ~ '^[a-z0-9_]{3,20}$')
);

-- Date of birth and body basics never leave this table, and this table is never
-- readable by anyone but its owner.
create table if not exists public.profiles_private (
  id          uuid primary key references auth.users(id) on delete cascade,
  dob         date,
  age_verified_at timestamptz,
  weight_kg   numeric(5,1),
  sex         text check (sex in ('male', 'female', 'unspecified')),
  intent      text[] not null default '{}',
  modules     jsonb not null default '{"nicotine": false, "social": true}'::jsonb,
  home_address text,
  constraint weight_sane check (weight_kg is null or (weight_kg between 30 and 300))
);

alter table public.profiles enable row level security;
alter table public.profiles_private enable row level security;

create policy "profiles are readable"     on public.profiles for select using (true);
create policy "insert your own profile"   on public.profiles for insert with check (auth.uid() = id);
create policy "update your own profile"   on public.profiles for update using (auth.uid() = id);

create policy "private is yours alone"    on public.profiles_private for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- Age is checked SERVER-SIDE and the result is stored, so a reinstall cannot
-- reset it. The client never decides whether someone is old enough.
create or replace function public.verify_age(p_dob date)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  minimum integer;
  ok boolean;
begin
  select case when region = 'US' then 21 else 18 end into minimum
    from public.profiles where id = auth.uid();
  minimum := coalesce(minimum, 18);
  ok := p_dob <= (current_date - (minimum || ' years')::interval);

  insert into public.profiles_private (id, dob, age_verified_at)
       values (auth.uid(), p_dob, case when ok then now() else null end)
  on conflict (id) do update
     set dob = excluded.dob,
         age_verified_at = case when ok then now() else null end;

  return ok;
end;
$$;

create or replace function public.username_available(p_username citext)
returns boolean
language sql stable security definer set search_path = public
as $$ select not exists (select 1 from public.profiles where username = p_username); $$;
