-- 00022 · Safety: trusted contacts, safe-arrival checks, live location.
--
-- Nothing in this file is ever gated on an entitlement. Safety is free forever;
-- there is deliberately no `subscriptions` join anywhere below.

create table if not exists public.trusted_contacts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  phone       text not null,
  created_at  timestamptz not null default now()
);

-- Three is the maximum. More than three and nobody feels responsible.
create or replace function public.enforce_contact_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.trusted_contacts where user_id = new.user_id) >= 3 then
    raise exception 'A maximum of three trusted contacts is allowed';
  end if;
  return new;
end;
$$;

drop trigger if exists trusted_contacts_limit on public.trusted_contacts;
create trigger trusted_contacts_limit
  before insert on public.trusted_contacts
  for each row execute function public.enforce_contact_limit();

create table if not exists public.safe_arrival_checks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  session_id    uuid references public.sessions(id) on delete set null,
  armed_at      timestamptz not null default now(),
  deadline_at   timestamptz not null,
  grace_until   timestamptz,
  resolved_at   timestamptz,
  escalated_at  timestamptz,
  message       text not null
);

create index if not exists safe_arrival_due_idx
  on public.safe_arrival_checks (deadline_at) where resolved_at is null;

-- Live location: participant-scoped and TTL'd. Expired rows are DELETED by a
-- scheduled job, not merely hidden — location is the one thing that has to
-- actually leave the database when it expires.
create table if not exists public.session_locations (
  session_id  uuid not null references public.sessions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  lat         double precision not null,
  lng         double precision not null,
  updated_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  primary key (session_id, user_id)
);

alter table public.trusted_contacts    enable row level security;
alter table public.safe_arrival_checks enable row level security;
alter table public.session_locations   enable row level security;

create policy "own contacts only" on public.trusted_contacts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own checks only" on public.safe_arrival_checks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Visible to participants of the same session, never to friends at large, and
-- never past its TTL — not even to a participant.
create policy "participants see live location" on public.session_locations for select
  using (
    expires_at > now()
    and exists (
      select 1 from public.session_participants sp
      where sp.session_id = session_locations.session_id and sp.user_id = auth.uid()
    )
    and not public.is_blocked(auth.uid(), session_locations.user_id)
  );

create policy "share your own location"  on public.session_locations for insert with check (auth.uid() = user_id);
create policy "update your own location" on public.session_locations for update using (auth.uid() = user_id);
create policy "stop sharing"             on public.session_locations for delete using (auth.uid() = user_id);

create or replace function public.purge_expired_locations()
returns integer language plpgsql security definer set search_path = public as $$
declare removed integer;
begin
  with gone as (delete from public.session_locations where expires_at <= now() returning 1)
  select count(*) into removed from gone;
  return removed;
end;
$$;
