-- 00006 · The visibility functions.
--
-- Every social read in the app goes through one of these. They are defined here
-- WITHOUT the blocked clause, and 00024 replaces them with versions that carry
-- it — the migration order is deliberate, so the RLS matrix can prove the
-- difference the block makes rather than assume it.

create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester_id = a and f.addressee_id = b)
        or (f.requester_id = b and f.addressee_id = a))
  );
$$;

create or replace function public.share_a_crew(a uuid, b uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.crew_members x
      join public.crew_members y on y.crew_id = x.crew_id
     where x.user_id = a and y.user_id = b
  );
$$;

create or replace function public.can_view_session(s_id uuid, viewer uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.sessions s
     where s.id = s_id
       and (
            s.owner_id = viewer
         or exists (select 1 from public.session_participants sp
                     where sp.session_id = s.id and sp.user_id = viewer)
         or (s.visibility = 'friends' and public.are_friends(viewer, s.owner_id))
         or (s.visibility = 'crew'    and public.share_a_crew(viewer, s.owner_id))
         or s.visibility = 'link'
       )
  );
$$;

alter table public.sessions enable row level security;
alter table public.session_participants enable row level security;

create policy "see sessions you may view" on public.sessions for select
  using (public.can_view_session(id, auth.uid()));
create policy "start your own night"      on public.sessions for insert with check (auth.uid() = owner_id);
create policy "edit your own night"       on public.sessions for update using (auth.uid() = owner_id);
create policy "delete your own night"     on public.sessions for delete using (auth.uid() = owner_id);

create policy "see participants of visible sessions" on public.session_participants for select
  using (public.can_view_session(session_id, auth.uid()));
create policy "join a night"  on public.session_participants for insert with check (auth.uid() = user_id);
create policy "leave a night" on public.session_participants for delete
  using (auth.uid() = user_id
      or exists (select 1 from public.sessions s where s.id = session_id and s.owner_id = auth.uid()));

create or replace function public.search_profiles(term text)
returns setof public.profiles
language sql stable security definer set search_path = public
as $$
  select p.* from public.profiles p
   where p.username ilike term || '%'
     and p.id <> auth.uid()
     and not p.private_account
   limit 20;
$$;
