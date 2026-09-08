-- 00051 · Hand-added venues could never reach the server.
--
-- `00002` created the table with
--
--   created_by uuid references auth.users(id) on delete set null
--   create policy "add a venue" ... with check (auth.uid() = created_by)
--
-- and the client's `upsert_venue` sent id, provider_id, name, area, lat, lng,
-- price_band and category — never `created_by`. So the column was null, the
-- insert failed the policy, and every venue anyone added by hand was rejected
-- on every sync attempt, silently, forever. It also failed the SELECT policy
-- for the same reason, so even a row that had somehow landed would have been
-- invisible to the person who created it.
--
-- The default is the fix rather than a client change, because a client that
-- must remember to send its own user id is a client that will forget again —
-- and `auth.uid()` is the one value the server can be certain of.
alter table public.venues alter column created_by set default auth.uid();

-- The second half of the same bug. `upsert(..., { onConflict: 'id' })` becomes
-- an UPDATE when the row exists, and there was no update policy at all — so
-- correcting a typo in a venue you added yourself was refused with the same
-- silence. Scoped to your own rows: a provider venue is shared data and is not
-- editable from a phone.
drop policy if exists "edit your own venue" on public.venues;
create policy "edit your own venue" on public.venues for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());
