-- 00024 · Retrofit the blocked clause onto every social predicate.
--
-- This is the migration that makes blocking real. A block that is not in
-- `can_view_session`, `are_friends` and `search_profiles` is decoration.

create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select not public.is_blocked(a, b)
     and exists (
       select 1 from public.friendships f
       where f.status = 'accepted'
         and ((f.requester_id = a and f.addressee_id = b)
           or (f.requester_id = b and f.addressee_id = a))
     );
$$;

-- Roles, in the order the matrix asserts them:
--   owner · participant · friend · crew-mate · stranger · BLOCKED
-- The sixth role is the one this whole migration exists for.
create or replace function public.can_view_session(s_id uuid, viewer uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
      from public.sessions s
     where s.id = s_id
       and not public.is_blocked(viewer, s.owner_id)
       and (
            s.owner_id = viewer
         or exists (select 1 from public.session_participants sp
                     where sp.session_id = s.id and sp.user_id = viewer)
         or (s.visibility = 'friends' and public.are_friends(viewer, s.owner_id))
         or (s.visibility = 'crew' and exists (
               select 1 from public.crew_members cm
                join public.crew_members mine on mine.crew_id = cm.crew_id
               where cm.user_id = s.owner_id and mine.user_id = viewer))
         or s.visibility = 'link'
       )
  );
$$;

create or replace function public.search_profiles(term text)
returns setof public.profiles
language sql stable security definer set search_path = public
as $$
  select p.*
    from public.profiles p
   where p.username ilike term || '%'
     and p.id <> auth.uid()
     and not p.private_account
     and not public.is_blocked(auth.uid(), p.id)
   limit 20;
$$;
