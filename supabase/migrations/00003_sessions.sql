-- 00003 · Sessions and participants.
--
-- A session is a night. `night_key` is generated, not passed in — the 04:00
-- boundary is a property of the data, not a thing each client remembers to
-- apply. `join_code` only exists for non-private nights.

create or replace function public.night_key(ts timestamptz, tz text default 'UTC')
returns date
language sql immutable
as $$ select ((ts at time zone tz) - interval '4 hours')::date; $$;

create table if not exists public.sessions (
  id           uuid primary key,            -- client-generated
  owner_id     uuid not null references auth.users(id) on delete cascade,
  plan_id      uuid,
  venue_id     uuid references public.venues(id) on delete set null,
  title        text,
  visibility   public.visibility not null default 'friends',
  join_code    text unique,
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,
  safe_home_at timestamptz,
  mood         public.mood,
  accent_index smallint not null default 0,
  night_key    date generated always as (public.night_key(started_at)) stored,
  constraint session_ends_after_it_starts check (ended_at is null or ended_at >= started_at),
  constraint private_nights_have_no_code check (visibility <> 'private' or join_code is null)
);

create index if not exists sessions_owner_idx on public.sessions (owner_id, started_at desc);
create index if not exists sessions_live_idx  on public.sessions (owner_id) where ended_at is null;
create index if not exists sessions_night_idx on public.sessions (owner_id, night_key);

create table if not exists public.session_participants (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  is_host    boolean not null default false,
  primary key (session_id, user_id)
);

create index if not exists participants_user_idx on public.session_participants (user_id);

create or replace function public.ensure_join_code(p_session uuid)
returns text
language plpgsql security definer set search_path = public
as $$
declare code text;
begin
  select join_code into code from public.sessions where id = p_session and owner_id = auth.uid();
  if code is not null then return code; end if;
  code := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8));
  update public.sessions set join_code = code where id = p_session and owner_id = auth.uid();
  return code;
end;
$$;
