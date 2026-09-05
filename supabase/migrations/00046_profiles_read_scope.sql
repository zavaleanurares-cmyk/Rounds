/**
 * `profiles` was readable in full, by everybody.
 *
 *     create policy "profiles are readable" on public.profiles for select using (true);
 *
 * 00036 narrowed `search_profiles` from `setof profiles` to six columns, on the
 * reasoning that a definer function publishes every column it returns and
 * `deletion_requested_at` is nobody's business. That reasoning was right and
 * the hardening was pointless: anybody signed in could `select * from profiles`
 * over the anon key and get every column of every row directly. And the two
 * migrations after it added more — `locale` (00037) and `notification_prefs`
 * (00038) — to that same open table, so a stranger could read which
 * notifications somebody had turned off.
 *
 * What actually needs a direct read, rather than one of the definer functions:
 *
 *   · your own row — the profile screen, the onboarding check;
 *   · somebody you have a relationship with, which is what the person screen
 *     and every avatar in the app renders.
 *
 * Strangers come through `search_profiles`, which is prefix-matched, capped at
 * twenty, excludes private accounts and returns six columns. That is the seam
 * where "a person you have not met" belongs, and it is now the only one.
 *
 * `sync_pull` is unaffected: it is `security definer` and hand-scopes its own
 * `people` list, which is why it lists six columns explicitly rather than
 * leaning on this policy.
 */
drop policy if exists "profiles are readable" on public.profiles;

/**
 * Every reference to the row being tested is written `profiles.id`, never a
 * bare `id`.
 *
 * The first version of this used `id` unqualified, and the clause that joins
 * `sessions` to `session_participants` therefore resolved it to `sessions.id`
 * — the innermost scope that has a column by that name. It compiled, ran, and
 * quietly matched nothing, so a host could not read the name of somebody in
 * their own night. A subquery in a policy that silently means something else is
 * the worst shape this kind of bug takes: it fails closed here, and the next
 * one like it might not.
 */
create policy "read your own profile and the people you know"
  on public.profiles for select
  using (
    profiles.id = auth.uid()
    or (
      not public.is_blocked(auth.uid(), profiles.id)
      and (
        -- a friend, or somebody with a request open in either direction
        exists (
          select 1 from public.friendships f
           where profiles.id in (f.requester_id, f.addressee_id)
             and auth.uid() in (f.requester_id, f.addressee_id)
        )
        -- a crew-mate
        or public.share_a_crew(auth.uid(), profiles.id)
        -- somebody in a night you are in, or who is in yours
        or exists (
          select 1 from public.session_participants mine
            join public.session_participants theirs on theirs.session_id = mine.session_id
           where mine.user_id = auth.uid() and theirs.user_id = profiles.id
        )
        -- …including from either side of the host relationship. `startSession`
        -- does add the host as a participant, but a host who cannot see the
        -- name of somebody who scanned into their own night, because one row
        -- failed to sync, is a worse failure than this clause is a cost.
        or exists (
          select 1 from public.sessions s
            join public.session_participants sp on sp.session_id = s.id
           where (s.owner_id = auth.uid() and sp.user_id = profiles.id)
              or (s.owner_id = profiles.id and sp.user_id = auth.uid())
        )
        -- somebody invited to a plan you are on
        or exists (
          select 1 from public.plan_invitees mine
            join public.plan_invitees theirs on theirs.plan_id = mine.plan_id
           where mine.user_id = auth.uid() and theirs.user_id = profiles.id
        )
      )
    )
  );
