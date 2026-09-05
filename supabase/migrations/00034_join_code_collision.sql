/**
 * A join-code collision must not cost somebody their night.
 *
 * `join_code` is `text unique` — globally, and forever, since ended sessions
 * keep theirs. The code is minted on the device, which is not negotiable: it is
 * on screen and being read aloud to somebody before there is any network. Eight
 * hex characters is 4.3e9 codes, so by the birthday bound a corpus of a million
 * nights expects on the order of a hundred collisions.
 *
 * That was a hundred nights silently lost. The offline queue would send the
 * session, Postgres would reject it with 23505, the queue would retry it eight
 * times and then drop it to avoid blocking every later write — so the night,
 * and every drink logged in it, existed on one phone only. Nothing failed
 * visibly. The screen showed the night exactly as it always does.
 *
 * The server now re-mints instead of rejecting. The odds of the shown code
 * changing under somebody are the odds of the collision itself, and a code that
 * changes on sync is a far smaller harm than a night that never arrives.
 */
create or replace function public.dedupe_join_code()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare tries integer := 0;
begin
  if new.join_code is null then return new; end if;
  -- An UPDATE that leaves the code alone must not re-mint it.
  if tg_op = 'UPDATE' and new.join_code is not distinct from old.join_code then return new; end if;

  while exists (select 1 from public.sessions s where s.join_code = new.join_code and s.id <> new.id) loop
    tries := tries + 1;
    -- Bounded: at eight collisions in a row something is wrong with the random
    -- source, and looping forever inside a trigger is worse than failing.
    if tries > 8 then
      raise exception 'could not find a free join code after % attempts', tries;
    end if;
    new.join_code := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8));
  end loop;

  return new;
end;
$$;

drop trigger if exists sessions_dedupe_join_code on public.sessions;
create trigger sessions_dedupe_join_code
  before insert or update of join_code on public.sessions
  for each row execute function public.dedupe_join_code();

/**
 * The same reasoning inside `ensure_join_code`, which minted once and hoped.
 * It is the path for a night that started private and was opened up later, so
 * it needs a free code rather than a random one.
 */
create or replace function public.ensure_join_code(p_session uuid)
returns text
language plpgsql security definer set search_path = public
as $$
declare code text;
begin
  select join_code into code from public.sessions where id = p_session and owner_id = auth.uid();
  if code is not null then return code; end if;

  -- The trigger above guarantees uniqueness; this just has to propose one.
  code := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8));
  update public.sessions set join_code = code where id = p_session and owner_id = auth.uid()
  returning join_code into code;
  return code;
end;
$$;
