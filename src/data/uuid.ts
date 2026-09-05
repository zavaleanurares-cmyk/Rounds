import * as Crypto from 'expo-crypto';

/**
 * Client-generated UUIDs are the backbone of the offline queue — see queue.ts.
 * `expo-crypto` gives a real v4 on device and in the browser; the fallback is
 * only for environments without it (tests, older web).
 */
export function uuid(): string {
  try {
    return Crypto.randomUUID();
  } catch {
    return fallback();
  }
}

function fallback(): string {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) out += '-';
    else if (i === 14) out += '4';
    else if (i === 19) out += hex[(Math.random() * 4) | 8];
    else out += hex[(Math.random() * 16) | 0];
  }
  return out;
}
