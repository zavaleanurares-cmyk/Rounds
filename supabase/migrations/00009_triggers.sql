-- 00009 · Triggers.

/**
 * A new auth user gets a profile row immediately; nothing else in the app works
 * without one, so this trigger failing means signup failing.
 *
 * The placeholder username is drawn from random bytes and RETRIED on conflict.
 * Deriving it from a prefix of the user's UUID looks fine and is fine in
 * production — until a fixture, a seed or a migration mints ids that share a
 * prefix, and then signup starts failing on a unique violation with a stack
 * trace pointing at a trigger nobody has read in a year.
 */
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  candidate text;
  attempts  integer := 0;
begin
  loop
    candidate := 'u' || substr(encode(gen_random_bytes(8), 'hex'), 1, 10);
    exit when not exists (select 1 from public.profiles where username = candidate);
    attempts := attempts + 1;
    if attempts > 12 then
      -- Astronomically unlikely; fall back to something guaranteed unique
      -- rather than raising and taking signup down with it.
      candidate := 'u' || replace(gen_random_uuid()::text, '-', '');
      exit;
    end if;
  end loop;

  insert into public.profiles (id, username, display_name)
       values (new.id, candidate, coalesce(new.raw_user_meta_data->>'name', 'New'))
  on conflict (id) do nothing;

  insert into public.profiles_private (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/** Ending a night ends its live-location sharing in the same transaction. */
create or replace function public.expire_session_locations()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.ended_at is not null and old.ended_at is null then
    delete from public.session_locations where session_id = new.id;
  end if;
  return new;
end;
$$;
