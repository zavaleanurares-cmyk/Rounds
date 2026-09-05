import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * The service-role client. Bypasses RLS, so it is confined to edge functions
 * and never reaches a device — the `outbound` table has no client policy at all
 * precisely so this is the only way in.
 */
export function admin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
