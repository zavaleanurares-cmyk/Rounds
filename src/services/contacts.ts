import { getClient } from '@/data/remote';

/**
 * Contact matching.
 *
 * The rule, and the reason this file is careful: a raw phone number never
 * leaves the device. Numbers are normalised and hashed here, and only hashes
 * are sent. `match_phone_hashes` (00008) takes an array of hashes and returns
 * profiles; it never sees, stores or returns a number.
 *
 * WHAT THIS BUYS, AND WHAT IT DOES NOT. The salt is app-wide, because it has to
 * be: two people must hash the same number to the same value or nothing
 * matches. That means the hashes are not secret against somebody who has this
 * source and wants to test whether a specific number has an account — the
 * phone-number space is small enough to enumerate. Every contact-matching
 * implementation has this property; pretending otherwise would be worse than
 * saying it. What it does prevent is the server holding a list of everybody's
 * address book in the clear, which is the thing that actually leaks at scale.
 *
 * Which is why appearing in other people's results is OPT-IN and separate:
 * finding your friends does not require being findable yourself.
 */

/** Not a secret; see the note above. It exists to bind hashes to this app. */
const SALT = 'rounds.contact.v1';

async function sha256(input: string): Promise<string> {
  const Crypto = require('expo-crypto') as typeof import('expo-crypto');
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${SALT}:${input}`);
}

/**
 * Reduces a written number to something two devices agree on.
 *
 * Deliberately conservative: strip everything that is not a digit or a leading
 * `+`, and drop anything too short to be a real number. Guessing a country code
 * for a local-format number would produce confident wrong matches, so a number
 * without one simply does not match — a miss is much better than introducing
 * somebody to a stranger who happens to share their local digits.
 */
export function normalise(raw: string): string | null {
  const trimmed = raw.replace(/[^\d+]/g, '');
  const plus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  if (!plus) return null;
  return `+${digits}`;
}

export interface Match {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

/**
 * Asks for contacts, hashes them, and returns the people who have an account.
 *
 * Returns `null` when permission was refused, so the caller can tell "you said
 * no" apart from "nobody matched" — two very different things to put on screen.
 */
export async function findFriends(): Promise<Match[] | null> {
  const supabase = getClient();
  if (!supabase) return [];
  try {
    const Contacts = require('expo-contacts') as typeof import('expo-contacts');
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') return null;

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    const numbers = new Set<string>();
    for (const contact of data ?? []) {
      for (const p of contact.phoneNumbers ?? []) {
        const n = normalise(p.number ?? '');
        if (n) numbers.add(n);
      }
    }
    if (numbers.size === 0) return [];

    // A cap, because a 4,000-contact address book is one enormous request and
    // the RPC returns at most 200 anyway.
    const hashes = await Promise.all([...numbers].slice(0, 2000).map(sha256));

    const { data: rows, error } = await supabase.rpc('match_phone_hashes', { hashes });
    if (error) return [];
    return (rows ?? []).map((r: Record<string, any>) => ({
      id: r.id,
      username: r.username ?? '',
      displayName: r.display_name ?? '',
      avatarUrl: r.avatar_url ?? null,
    }));
  } catch {
    return [];
  }
}

/**
 * Makes this account findable by the number given — opt-in, and separate from
 * looking your own friends up.
 *
 * The number is hashed before it goes anywhere and is not stored on the device
 * either: there is no field in `Profile` for it, on purpose.
 */
export async function makeFindable(number: string): Promise<boolean> {
  const supabase = getClient();
  const normalised = normalise(number);
  if (!supabase || !normalised) return false;
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) return false;
    const { error } = await supabase
      .from('phone_hashes')
      .upsert({ user_id: userId, hash: await sha256(normalised) }, { onConflict: 'user_id' });
    return !error;
  } catch {
    return false;
  }
}

/** Stops this account appearing in anybody's results. */
export async function stopBeingFindable(): Promise<void> {
  const supabase = getClient();
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) return;
    await supabase.from('phone_hashes').delete().eq('user_id', userId);
  } catch {
    /* best effort */
  }
}
