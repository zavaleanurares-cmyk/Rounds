import { readFileSync } from 'node:fs';

// The service reaches the Supabase client, which reaches AsyncStorage. Same
// stand-in the queue tests use.
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}));

import { normalise } from '@/services/contacts';

/**
 * Contact matching makes one promise: a raw phone number never leaves the
 * device. These assert the two halves of that — the normaliser that decides
 * what a number even is, and the source itself, because the promise is
 * structural and cannot be observed from outside.
 */

describe('normalising a phone number', () => {
  it('keeps an international number and strips the formatting', () => {
    expect(normalise('+40 700 000 000')).toBe('+40700000000');
    expect(normalise('+40-700-000-000')).toBe('+40700000000');
    expect(normalise('+40 (700) 000 000')).toBe('+40700000000');
  });

  it('agrees with itself however the same number was typed', () => {
    const written = ['+34 600 00 00 00', '+34600000000', '+34-600-00-00-00', '+34 (600) 000000'];
    const hashed = new Set(written.map(normalise));
    expect(hashed.size).toBe(1);
  });

  /**
   * The conservative half. A number with no country code cannot be matched
   * without guessing one, and a guess produces confident WRONG matches — which
   * in this feature means introducing somebody to a stranger who happens to
   * share their local digits. A miss is much better.
   */
  it('refuses a number with no country code rather than guessing one', () => {
    expect(normalise('0700 000 000')).toBeNull();
    expect(normalise('700000000')).toBeNull();
    expect(normalise('020 7946 0958')).toBeNull();
  });

  it('refuses anything too short or too long to be a number', () => {
    expect(normalise('+4070')).toBeNull();
    expect(normalise('+4070000000000000000')).toBeNull();
  });

  it('refuses junk without throwing', () => {
    for (const junk of ['', '   ', 'not a number', '+', '++', 'null', '☎']) {
      expect(() => normalise(junk)).not.toThrow();
      expect(normalise(junk)).toBeNull();
    }
  });
});

describe('the privacy promise', () => {
  const src = readFileSync('src/services/contacts.ts', 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('hashes before anything is sent', () => {
    expect(code).toContain('digestStringAsync');
    expect(code).toContain('SHA256');
  });

  it('sends hashes, never numbers', () => {
    // Both outbound calls — the lookup and the registration — must carry a
    // hash. A `number` reaching either would be the whole feature betrayed.
    const rpc = code.match(/rpc\('match_phone_hashes'[^)]*\)/)?.[0] ?? '';
    expect(rpc).toBeTruthy();
    expect(rpc).toContain('hashes');
    expect(rpc).not.toMatch(/\bnumbers?\b/);

    const upsert = code.match(/from\('phone_hashes'\)[\s\S]{0,200}?\)/)?.[0] ?? '';
    expect(upsert).toBeTruthy();
    expect(upsert).toContain('sha256');
    expect(upsert).not.toMatch(/number:/);
  });

  it('never stores the number on the device either', () => {
    // No AsyncStorage, no key in the store. Nothing to leak from a backup.
    expect(code).not.toContain('AsyncStorage');
    expect(code).not.toContain('writeJson');
    const types = readFileSync('src/domain/types.ts', 'utf8');
    const profile = types.match(/export interface Profile \{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(profile).toBeTruthy();
    expect(profile).not.toMatch(/\bphone\b/);
  });

  it('is honest in its own comments about what the salt does not do', () => {
    // A shared salt cannot be secret — the phone-number space is enumerable.
    // Documenting that is the difference between a limitation and a lie.
    expect(src).toMatch(/app-wide/i);
    expect(src).toMatch(/not secret|not be secret|enumerate/i);
  });

  it('keeps finding people separate from being findable', () => {
    // Looking your friends up must not silently make you findable to everybody
    // who happens to have your number.
    expect(code).toContain('export async function findFriends');
    expect(code).toContain('export async function makeFindable');
    // Slice the lookup's body out by its neighbours rather than by a brace
    // regex, which cannot tell a nested block from the end of a function.
    const from = code.indexOf('export async function findFriends');
    const to = code.indexOf('export async function makeFindable');
    expect(from).toBeGreaterThan(-1);
    expect(to).toBeGreaterThan(from);
    // Looking people up must not touch the TABLE that makes you findable. The
    // RPC it calls is named match_phone_hashes, so the check is on the table
    // access rather than on the substring.
    expect(code.slice(from, to)).not.toContain("from('phone_hashes')");
  });

  it('can be undone', () => {
    expect(code).toContain('export async function stopBeingFindable');
  });
});
