-- 00008 · RPCs the client actually calls.

/**
 * Contact matching. Numbers are hashed on the device with a salt; only hashes
 * arrive here. This function never sees, stores or returns a phone number.
 */
create table if not exists public.phone_hashes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  hash    text not null unique
);
alter table public.phone_hashes enable row level security;
create policy "own hash only" on public.phone_hashes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.match_phone_hashes(hashes text[])
returns table (id uuid, username citext, display_name text, avatar_url text)
language sql stable security definer set search_path = public
as $$
  select p.id, p.username, p.display_name, p.avatar_url
    from public.phone_hashes h
    join public.profiles p on p.id = h.user_id
   where h.hash = any(hashes)
     and p.id <> auth.uid()
     and not p.private_account
   limit 200;
$$;

/**
 * Friend requests are rate limited SERVER-SIDE. The UI shows "you've sent a lot
 * of requests today" rather than failing silently — but the limit itself cannot
 * live in the UI.
 */
create or replace function public.request_friendship(target uuid)
returns text
language plpgsql security definer set search_path = public
as $$
declare sent_today integer;
begin
  if target = auth.uid() then return 'self'; end if;

  select count(*) into sent_today
    from public.friendships
   where requester_id = auth.uid() and created_at > now() - interval '24 hours';
  if sent_today >= 25 then return 'rate_limited'; end if;

  insert into public.friendships (requester_id, addressee_id, status)
       values (auth.uid(), target, 'pending')
  on conflict (requester_id, addressee_id) do nothing;
  return 'sent';
end;
$$;

/**
 * Achievements are evaluated set-based in ONE pass, server-side. Doing it
 * per-achievement on the client is how you get 24 round trips and a badge that
 * appears three days late.
 */
create or replace function public.evaluate_achievements()
returns integer
language plpgsql security definer set search_path = public
as $$
declare inserted integer;
begin
  with stats as (
    select
      (select count(*) from public.sessions s where s.owner_id = auth.uid() and s.ended_at is not null) as nights,
      (select count(distinct l.venue_id) from public.consumption_logs l
        where l.user_id = auth.uid() and l.deleted_at is null and l.venue_id is not null) as venues,
      (select count(*) from public.sessions s where s.owner_id = auth.uid() and s.mood is not null) as moods,
      (select count(*) from public.friendships f
        where f.status = 'accepted' and auth.uid() in (f.requester_id, f.addressee_id)) as friends,
      (select count(*) from public.crew_members m where m.user_id = auth.uid()) as crews
  ),
  earned as (
    select code from (
      select 'first-night' as code, (select nights from stats) >= 1 as ok
      union all select 'five-venues',   (select venues from stats) >= 5
      union all select 'ten-venues',    (select venues from stats) >= 10
      union all select 'morning-person',(select moods  from stats) >= 5
      union all select 'first-friend',  (select friends from stats) >= 1
      union all select 'crew-founder',  (select crews  from stats) >= 1
    ) t where ok
  ),
  ins as (
    insert into public.achievements (user_id, code)
    select auth.uid(), code from earned
    on conflict (user_id, code) do nothing
    returning 1
  )
  select count(*) into inserted from ins;
  return inserted;
end;
$$;

/** The whole pull-sync in one round trip. */
create or replace function public.sync_pull(since timestamptz default 'epoch')
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'profile',  (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
    'logs',     coalesce((select jsonb_agg(to_jsonb(l)) from public.consumption_logs l
                           where l.user_id = auth.uid() and l.created_at > since), '[]'::jsonb),
    'sessions', coalesce((select jsonb_agg(to_jsonb(s)) from public.sessions s
                           where s.owner_id = auth.uid()), '[]'::jsonb),
    'goals',    coalesce((select jsonb_agg(to_jsonb(g)) from public.goals g
                           where g.user_id = auth.uid()), '[]'::jsonb),
    'server_time', now()
  );
$$;
