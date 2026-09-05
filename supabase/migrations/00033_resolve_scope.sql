/**
 * `resolve_safe_arrival` cancelled other people's messages.
 *
 * The function is `security definer`, so RLS does not apply inside it and every
 * scope has to be written by hand. The UPDATE had one — `user_id = auth.uid()`,
 * so you can only resolve your own check. The DELETE did not:
 *
 *     delete from public.outbound
 *      where sent_at is null and category = 'safety'
 *        and payload->>'checkId' = p_check::text;
 *
 * `p_check` is whatever the caller passed. Anyone signed in could call this
 * with somebody else's check id and delete the staged SMS to that person's
 * trusted contacts — the escalation would then run out of things to send, and
 * the check would sit unresolved with nobody ever told. Silently: the caller's
 * own check is untouched, so nothing on their device looks wrong, and the
 * victim's app shows a check still counting down.
 *
 * Of every hole in this schema that is the one that matters most, because the
 * feature it disables is the one somebody is relying on while walking home.
 *
 * The fix is the ownership lookup and the early return: a check that is not
 * yours reaches neither the update nor the delete, so both halves now refuse
 * exactly the same set of ids. `user_id = owner` on the delete is a second lock
 * on the same door — it changes nothing today, because the early return has
 * already established whose check this is, and it is deliberately kept anyway:
 * this function runs as `security definer`, where an unscoped DELETE is one
 * edit away from being a hole again. The test asserts the early return, which
 * is the part that can actually fail.
 */
create or replace function public.resolve_safe_arrival(p_check uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare owner uuid;
begin
  select user_id into owner
    from public.safe_arrival_checks
   where id = p_check and user_id = auth.uid();

  -- Not yours, or not a check at all: do nothing, and say nothing about
  -- whether it exists.
  if owner is null then return; end if;

  update public.safe_arrival_checks
     set resolved_at = now()
   where id = p_check and user_id = owner;

  delete from public.outbound
   where sent_at is null
     and category = 'safety'
     and user_id = owner
     and payload->>'checkId' = p_check::text;
end;
$$;

revoke all on function public.resolve_safe_arrival(uuid) from public;
grant execute on function public.resolve_safe_arrival(uuid) to authenticated;
