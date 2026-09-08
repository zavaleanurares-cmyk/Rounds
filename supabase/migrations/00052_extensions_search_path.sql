-- 00052 · The extensions schema, which only exists on Supabase.

/**
 * Signup has been failing on the deployed project since the beginning, with
 * "Database error saving new user", and nothing in this repository could see it.
 *
 * `pgcrypto` is created in 00001, so `gen_random_bytes` exists. On a stock
 * Postgres — which is what `supabase/tests/run.sh` and the CI service container
 * are — `create extension` puts it in `public`, and every function here pins
 * `search_path = public`, so the call resolves and 269 assertions pass.
 *
 * Supabase installs extensions into a schema called `extensions`. Same
 * database, same extension, different schema — and `search_path = public` now
 * excludes the only place the function lives. Every call becomes
 * "function gen_random_bytes(integer) does not exist" at runtime.
 *
 * The pin is not the mistake; it is there on purpose, because a SECURITY
 * DEFINER function with a mutable search_path is a privilege-escalation route.
 * The mistake is that the pin was written against the wrong catalogue.
 *
 * Three functions call into pgcrypto, and between them they own two flows the
 * product cannot do without:
 *
 *   handle_new_user     every signup, on the auth.users insert trigger
 *   ensure_join_code    the code that lets anyone join a night
 *   dedupe_join_code    the collision trigger behind it
 *
 * `public, extensions` rather than schema-qualifying the call: qualifying it as
 * `extensions.gen_random_bytes` would hard-code Supabase's layout and break the
 * local harness, where the extension really is in `public`. This resolves in
 * both, and `public` still wins on anything defined in both schemas.
 *
 * ALTER rather than CREATE OR REPLACE so the bodies are not restated here.
 * A copy of a function body in a later migration is a copy that drifts.
 */

alter function public.handle_new_user()          set search_path = public, extensions;
alter function public.ensure_join_code(uuid)     set search_path = public, extensions;
alter function public.dedupe_join_code()         set search_path = public, extensions;

/**
 * Fails loudly here rather than silently at 2am on someone's first signup.
 *
 * `to_regprocedure` resolves against the CURRENT search_path, so this asserts
 * exactly what the three functions above will experience: that the name is
 * reachable from `public, extensions` on whatever database this is applied to.
 */
do $$
begin
  perform set_config('search_path', 'public, extensions', true);
  if to_regprocedure('gen_random_bytes(integer)') is null then
    raise exception
      'gen_random_bytes is not reachable from search_path "public, extensions" — '
      'pgcrypto is missing or installed somewhere else. Signup and join codes '
      'will fail at runtime if this migration is allowed to pass.';
  end if;
end
$$;
