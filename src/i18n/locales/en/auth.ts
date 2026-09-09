import type { Message } from '../../types';

/** A-01…A-03 · Welcome, sign in and the six-digit code. */
export const auth = {
  // A-01 · Welcome
  'auth.tagline': 'Know your night.',
  'auth.welcomeBody':
    'Open it before you go out, check it the next morning. It keeps your pace, keeps your group together, and gets you home.',
  'auth.getStarted': 'Get started',
  'auth.haveAccount': 'I already have an account',
  'auth.ageAndPaceNote':
    '18+ in the EU and the UK · 21+ in the United States. ROUNDS estimates pace — it is never a measure of whether you are fit to drive.',
  'auth.supportResources': 'Drinking support resources',

  // A-02 · Sign in
  'auth.welcomeBack': 'Welcome back',
  'auth.signIn': 'Sign in',
  'auth.continueWithApple': 'Continue with Apple',
  'auth.continueWithGoogle': 'Continue with Google',
  'auth.or': 'or',
  'auth.email': 'Email',
  'auth.emailLabel': 'Email address',
  'auth.sendMeACode': 'Send me a code',

  // A-02b · Password, for people who would rather have one
  'auth.usePassword': 'Use a password',
  'auth.useCodeInstead': 'Email me a code instead',
  'auth.passwordLabel': 'Password',
  'auth.passwordHint': 'At least 8 characters',
  'auth.createAccount': 'Create an account',
  'auth.passwordTooShort': 'Use at least 8 characters.',
  'auth.wrongPassword': "That email and password don't match.",
  'auth.accountExists': 'There is already an account with this email. Sign in instead.',
  'auth.invalidEmail': "That doesn't look like an email address.",
  'auth.rateLimited': 'Too many attempts. Try again in a minute.',
  'auth.providerFailed': "That didn't go through.",
  'auth.providersUnconfigured':
    'Apple and Google sign-in appear once their client IDs are configured. Email works either way.',
  'auth.terms': 'By continuing you agree to the Terms and Privacy Policy.',

  // A-03 · Verify
  'auth.checkYourEmail': 'Check your email',
  'auth.verificationCode': 'Verification code',
  'auth.codeWrong': "That code didn't work. Check the last email we sent.",
  'auth.resendIn': { one: 'Resend in {count}s', other: 'Resend in {count}s' },
  'auth.sendAnotherCode': 'Send another code',
  'auth.otpBuildNote':
    'In this build any six digits work — the OTP call is wired to Supabase behind the same function.',
  'auth.useThisCode': 'Use this code',
} satisfies Record<string, Message>;
