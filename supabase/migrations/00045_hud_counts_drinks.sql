/**
 * The shared HUD counts drinks. It was counting rows.
 *
 * `enqueue_hud_refresh` fired on every insert into `consumption_logs` and
 * counted them all, so a glass of water bumped the number on everybody else's
 * lock screen and shipped `lastDrink: "Water"` to it. Every other count in the
 * product is `ethanolG > 0` — the pace model, the night summary, the streaks —
 * so the shared HUD and the app disagreed by however many waters somebody had
 * had, on the one surface where several people are looking at the same figure.
 *
 * 00043 made that worse by turning it into a privacy problem rather than an
 * arithmetic one. Nicotine is now loggable, the module is off by default and
 * deliberately private, and a cigarette logged in a shared night was pushing
 * `lastDrink: "Cigarette"` to the phones of everybody in it.
 *
 * `ethanol_g` is GENERATED, so `> 0` is the same test the client uses and
 * cannot drift from it. Water and nicotine no longer fan out at all: a log that
 * changes nothing on the HUD has nothing to tell anybody.
 */
create or replace function public.enqueue_hud_refresh()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  drinks integer;
begin
  if new.session_id is null or new.deleted_at is not null then
    return new;
  end if;

  -- Nothing to refresh, and nothing anybody else needs to know about.
  if new.ethanol_g <= 0 then
    return new;
  end if;

  select count(*) into drinks
    from public.consumption_logs l
   where l.session_id = new.session_id
     and l.deleted_at is null
     and l.ethanol_g > 0;

  insert into public.outbound (user_id, channel, category, payload)
  select lat.user_id,
         case when lat.platform = 'ios' then 'live_activity' else 'push' end,
         'live',
         jsonb_build_object(
           'sessionId', new.session_id,
           'token',     lat.token,
           'drinks',    drinks,
           'lastDrink', new.drink_name,
           'byUserId',  new.user_id,
           'at',        (extract(epoch from new.consumed_at) * 1000)::bigint
         )
    from public.live_activity_tokens lat
   where lat.session_id = new.session_id
     and lat.user_id <> new.user_id
     -- Unchanged from 00029: a token can only exist for somebody in the night,
     -- but the fan-out re-checks rather than trusting a row that outlived a
     -- leave.
     and public.in_session(new.session_id, lat.user_id);

  return new;
end;
$$;
