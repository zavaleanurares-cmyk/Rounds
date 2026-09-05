/**
 * Search returns the six columns a search result needs, not the whole row.
 *
 * `search_profiles` returned `setof public.profiles` — every column, to anyone
 * who typed three letters, from a `security definer` function where RLS does
 * not apply. Nothing catastrophic is in that table (dob, weight, sex and home
 * address all live in `profiles_private`), but `deletion_requested_at` is
 * nobody's business, and the shape of the leak is the problem rather than
 * today's contents: `p.*` means every column added from here on is published
 * to strangers by default, silently, by a migration whose author is thinking
 * about something else entirely.
 *
 * The same reasoning as the explicit `people` list in `sync_pull`: in a
 * definer function, columns are opt-in.
 */
drop function if exists public.search_profiles(text);

create or replace function public.search_profiles(term text)
returns table (
  id uuid,
  username citext,
  display_name text,
  avatar_url text,
  avatar_tint smallint,
  level integer
)
language sql stable security definer set search_path = public
as $$
  select p.id, p.username, p.display_name, p.avatar_url, p.avatar_tint, p.level
    from public.profiles p
   where p.username ilike term || '%'
     and p.id <> auth.uid()
     and not p.private_account
     and not public.is_blocked(auth.uid(), p.id)
   limit 20;
$$;

revoke all on function public.search_profiles(text) from public;
grant execute on function public.search_profiles(text) to authenticated;
