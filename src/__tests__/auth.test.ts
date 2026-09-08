/**
 * The Google sign-in result mapping, executed rather than described.
 *
 * Everything that has gone wrong on this path went wrong in the same place:
 * the two or three lines that turn a provider's outcome into something the
 * sign-in screen can show. Both previous failures — the missing nonce and the
 * missing `maybeCompleteAuthSession()` — were invisible in exactly this
 * region, and neither was catchable by the existing suite, because the only
 * assertions covering it read the file as text.
 *
 * `signInWithGoogle` takes `promptAsync` as an argument, which makes the whole
 * mapping testable with no browser, no Google project and no Supabase client:
 * hand it a function that resolves or throws, and assert what comes back. The
 * exchange itself is skipped without a client, so `ok` here means "got as far
 * as the exchange", which is the part these tests are about.
 */
import { readFileSync } from 'node:fs';

/**
 * The data layer reaches AsyncStorage's native module at import time, which is
 * null under jest — which is why nothing in this suite had ever imported this
 * module before, and why the only assertions covering it read the file as
 * text. Stubbing the one function `signInWithGoogle` calls is enough to get
 * the module loaded, and it keeps these tests on the mapping rather than on an
 * exchange that is skipped without a Supabase client anyway.
 */
jest.mock('@/data/remote', () => ({
  signInWithIdToken: jest.fn().mockResolvedValue(null),
  signInWithPassword: jest.fn().mockResolvedValue(null),
  signUpWithPassword: jest.fn().mockResolvedValue({ session: null, needsConfirmation: false }),
}));

// eslint-disable-next-line import/first
import {
  createAccountWithPassword, emailSignInReason, MIN_PASSWORD, passwordReason, signInWithGoogle,
} from '@/services/auth';

/** The shape `expo-web-browser` throws: a CodedError carries `code`. */
const coded = (code: string, message = code) => Object.assign(new Error(message), { code });

let warn: jest.SpyInstance;
beforeEach(() => {
  // The fix deliberately logs in development, and jest runs with __DEV__ true.
  // Silence it here so a passing run stays readable, but spy rather than
  // stub — one test below asserts the logging actually happens.
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

describe('a blocked pop-up is reported as a blocked pop-up', () => {
  /**
   * This is the one failure on this path the person can act on, and until now
   * it was folded into the same sentence as every other failure: "that did not
   * go through, nothing was changed". True, and useless — it names no cause and
   * suggests no action, while the actual fix is one click in the address bar.
   */
  it('maps ERR_WEB_BROWSER_BLOCKED to its own message', async () => {
    const result = await signInWithGoogle(() => Promise.reject(coded('ERR_WEB_BROWSER_BLOCKED')));

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('common.authPopupBlocked');
    // Not cancelled: the person did not change their mind, so the screen must
    // not take the silent path it takes for a dismissed sheet.
    expect(result.cancelled).toBeFalsy();
  });

  /**
   * The assertion that catches an upgrade rather than a regression.
   *
   * The code string is a contract with a dependency, not with this repository.
   * If a future `expo-web-browser` renames it, the branch above goes quietly
   * dead — the generic message returns and nobody learns why — so read the
   * string out of the installed module and fail loudly instead.
   */
  it('is the code expo-web-browser actually throws', () => {
    const source = readFileSync(
      require.resolve('expo-web-browser/build/ExpoWebBrowser.web.js'),
      'utf8'
    );
    expect(source).toContain('ERR_WEB_BROWSER_BLOCKED');
  });
});

describe('every other outcome keeps the behaviour it had', () => {
  it('an unrecognised throw is still the generic message', async () => {
    const result = await signInWithGoogle(() => Promise.reject(new Error('network down')));

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('common.authDidNotGoThrough');
  });

  it('a dismissed sheet is cancelled, and carries no message to show', async () => {
    // Somebody who closes a sheet does not need to be told they closed it.
    const result = await signInWithGoogle(() => Promise.resolve({ type: 'dismiss' }));

    expect(result.cancelled).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('a success with no id_token is reported, not treated as signed in', async () => {
    const result = await signInWithGoogle(() => Promise.resolve({ type: 'success', params: {} }));

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('common.authGoogleNoToken');
  });

  it('no promptAsync at all means Google is not configured in this build', async () => {
    const result = await signInWithGoogle(undefined);

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('common.authGoogleNotConfigured');
  });
});

describe('the failure is not swallowed', () => {
  /**
   * The bare `catch {}` this replaces is why the previous two bugs on this path
   * took a person signing in and saying "nothing happens" to find. The error
   * object is the only thing that distinguishes them, and it was being thrown
   * away before anything could look at it.
   */
  it('keeps the error in development instead of discarding it', async () => {
    const err = coded('ERR_WEB_BROWSER_BLOCKED');
    await signInWithGoogle(() => Promise.reject(err));

    expect(warn).toHaveBeenCalledWith('[auth] Google sign-in failed', err);
  });
});

describe('the email code failure says what actually happened', () => {
  /**
   * This screen answered every failure with "Too many attempts. Try again in a
   * minute." A rate limit is one of the rarer things that goes wrong here; a
   * refused user insert and a rejected SMTP sender both arrived wearing the
   * same sentence, and the only actionable part of it — wait a minute — was
   * the part that was certainly wrong.
   */
  it('a 429 really is a rate limit', () => {
    expect(emailSignInReason({ status: 429 })).toBe('auth.rateLimited');
  });

  it("GoTrue's own code for it counts too", () => {
    expect(emailSignInReason({ code: 'over_email_send_rate_limit' })).toBe('auth.rateLimited');
  });

  it('a database error is not a rate limit', () => {
    // The real one, verbatim, from the deployed project.
    expect(emailSignInReason({ status: 500, message: 'Database error saving new user' }))
      .toBe('common.authDidNotGoThrough');
  });

  it('a failing mail provider is not a rate limit either', () => {
    expect(emailSignInReason({ status: 500, message: 'Error sending confirmation email' }))
      .toBe('common.authDidNotGoThrough');
  });

  it('and neither is nothing at all', () => {
    expect(emailSignInReason(null)).toBe('common.authDidNotGoThrough');
    expect(emailSignInReason(new Error('offline'))).toBe('common.authDidNotGoThrough');
  });
});

describe('passwords say what actually went wrong', () => {
  /**
   * GoTrue answers "Invalid login credentials" both for a wrong password and
   * for an address with no account, deliberately — telling them apart would let
   * anyone enumerate who has an account here. So one message has to cover both,
   * and it has to be true of both: the pair does not match.
   */
  it('a wrong password and an unknown account get the same, honest message', () => {
    expect(passwordReason({ status: 400, message: 'Invalid login credentials' }))
      .toBe('auth.wrongPassword');
  });

  it('an address that already has an account says so', () => {
    expect(passwordReason({ code: 'user_already_exists' })).toBe('auth.accountExists');
    expect(passwordReason({ message: 'User already registered' })).toBe('auth.accountExists');
  });

  it('a rate limit is still a rate limit here too', () => {
    expect(passwordReason({ status: 429 })).toBe('auth.rateLimited');
  });

  it('anything else does not invent a cause', () => {
    expect(passwordReason({ status: 500, message: 'Error sending confirmation email' }))
      .toBe('common.authDidNotGoThrough');
    expect(passwordReason(null)).toBe('common.authDidNotGoThrough');
  });

  it('a short password never reaches the network', async () => {
    const remote = require('@/data/remote');
    remote.signUpWithPassword.mockClear();

    const result = await createAccountWithPassword('a@b.co', 'short');

    expect(result.reason).toBe('auth.passwordTooShort');
    expect(remote.signUpWithPassword).not.toHaveBeenCalled();
  });

  it('an unconfirmed new account is not treated as signed in', async () => {
    // Supabase returns a user and NO session when email confirmation is on.
    // Reporting `ok` there leaves somebody with no account and a UI insisting
    // they have one.
    const remote = require('@/data/remote');
    remote.signUpWithPassword.mockResolvedValueOnce({ session: null, needsConfirmation: true });

    const result = await createAccountWithPassword('a@b.co', 'x'.repeat(MIN_PASSWORD));

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('auth.checkYourEmail');
  });
});
