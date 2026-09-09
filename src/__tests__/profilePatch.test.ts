/**
 * The pull's profile patch, EXECUTED.
 *
 * `remote.ts` reaches AsyncStorage at import time, which is why nothing in this
 * suite had ever imported it and why the assertions covering this function read
 * the file as text. Text-matching is how the bug below survived: the rule was
 * described in a comment and in a test that reimplemented it, and neither ran
 * the shipped code.
 *
 * The official AsyncStorage jest mock is enough to load the module. That makes
 * this the first test in the repository that actually calls the function which
 * decides what a sync does to your identity.
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

// eslint-disable-next-line import/first
import { toProfilePatch } from '@/data/remote';

const row = (over: Record<string, unknown> = {}) => ({
  id: 'u1',
  display_name: 'Rares',
  username: 'ucedf0136a',
  onboarded: false,
  ...over,
});

describe('the patch carries what the server knows, not nulls for what it does not', () => {
  /**
   * The loop this prevents.
   *
   * `AuthGate` checks `!profile?.dob` before anything else. `verify_age` writes
   * the dob server-side and is called fire-and-forget, so until it lands the
   * private row has none. Emitting `dob: null` then blanked a date of birth the
   * device already knew, the gate sent the person to `(onboarding)/age`, then
   * to `identity` under the `u…` placeholder username the signup trigger mints
   * — on every launch, with nothing in the app able to break out.
   *
   * A date of birth is write-once. An absent server value is "not yet".
   */
  it('omits dob entirely when the server has not got one', () => {
    const patch = toProfilePatch(row(), { dob: null, modules: null, intent: null });

    expect('dob' in patch).toBe(false);
  });

  it('so spreading it over a local profile leaves the local dob standing', () => {
    const local = { dob: '1998-01-01', onboarded: true };
    const merged = { ...local, ...toProfilePatch(row(), { dob: null }) };

    expect(merged.dob).toBe('1998-01-01');
  });

  it('and carries the dob once the server does have it', () => {
    const patch = toProfilePatch(row(), { dob: '1997-05-05' });

    expect(patch.dob).toBe('1997-05-05');
  });

  it('a missing private row carries no private fields at all', () => {
    const patch = toProfilePatch(row(), null);

    expect('dob' in patch).toBe(false);
    expect('weightKg' in patch).toBe(false);
    expect('modules' in patch).toBe(false);
  });

  /**
   * Weight and sex are NOT given the same treatment, and the asymmetry is the
   * point: null there is a real answer. Somebody who declined to give a weight
   * has null on the server, and a pull has to be able to say so.
   */
  it('still lets the server report a declined weight or sex', () => {
    const patch = toProfilePatch(row(), { dob: '1997-05-05', weight_kg: null, sex: null });

    expect(patch.weightKg).toBeNull();
    expect(patch.sex).toBeNull();
  });
});
