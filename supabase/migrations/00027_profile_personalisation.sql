-- 00027 · Making a profile someone's own.
--
-- Until now a profile was a name, a handle and a hashed avatar colour nobody
-- chose. These four columns are the whole of what a person can say about
-- themselves, and the shape of that list is deliberate:
--
--   · `bio` is short. 140 characters is enough for a line about yourself and
--     not enough for a wall.
--   · `avatar_tint` is an INDEX into the app's palette, not a hex value. A user
--     cannot pick a colour that fails contrast against white initials, and a
--     future palette change moves every avatar with it.
--   · `home_city` is free text and coarse by construction. There is no
--     coordinate here and there never will be: this is "Bucharest", not a
--     location.
--   · `signature_drink_id` points at the catalogue, so a profile can show a
--     drawn glyph rather than another line of text.
--
-- Everything here is nullable. A person who fills none of it in has a complete,
-- working profile — personalisation is an invitation, not a form to clear.

alter table public.profiles
  add column if not exists bio text,
  add column if not exists avatar_tint smallint,
  add column if not exists home_city text,
  add column if not exists signature_drink_id text;

alter table public.profiles
  drop constraint if exists profiles_bio_length;
alter table public.profiles
  add constraint profiles_bio_length check (bio is null or char_length(bio) <= 140);

alter table public.profiles
  drop constraint if exists profiles_avatar_tint_range;
alter table public.profiles
  add constraint profiles_avatar_tint_range check (avatar_tint is null or (avatar_tint >= 0 and avatar_tint <= 11));

alter table public.profiles
  drop constraint if exists profiles_home_city_length;
alter table public.profiles
  add constraint profiles_home_city_length check (home_city is null or char_length(home_city) <= 60);

comment on column public.profiles.avatar_tint is
  'Index into the app avatar palette. Not a hex colour: the app owns the palette so contrast is guaranteed.';
comment on column public.profiles.home_city is
  'Coarse, user-typed city name. Never a coordinate.';

-- Handle availability, without exposing the profiles table to enumeration
-- beyond what it already allows. Returns only a boolean; the caller learns
-- whether a name is free and nothing else about whoever holds it.
create or replace function public.username_available(p_username citext)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_username ~ '^[a-z0-9_]{3,20}$'
     and not exists (
       select 1 from public.profiles
        where username = p_username
          and id <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
     );
$$;

revoke all on function public.username_available(citext) from public;
grant execute on function public.username_available(citext) to authenticated;
