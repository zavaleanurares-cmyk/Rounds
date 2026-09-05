import type { Message } from '../../types';

export const auth = {
  // A-01 · Welcome
  'auth.tagline': 'Cunoaște-ți seara.',
  'auth.welcomeBody':
    'Deschide-o înainte să ieși, uită-te la ea a doua zi dimineața. Îți ține ritmul, îți ține gașca laolaltă și te duce acasă.',
  'auth.getStarted': 'Începe',
  'auth.haveAccount': 'Am deja cont',
  // The ages are the law, not copy: 18 and 21 stay exactly as they are.
  'auth.ageAndPaceNote':
    '18+ în UE și în Regatul Unit · 21+ în Statele Unite. ROUNDS estimează ritmul — nu e niciodată o măsură a faptului că poți sau nu să conduci.',
  'auth.supportResources': 'Resurse de ajutor cu alcoolul',

  // A-02 · Sign in
  'auth.welcomeBack': 'Bine ai revenit',
  'auth.signIn': 'Conectează-te',
  'auth.continueWithApple': 'Continuă cu Apple',
  'auth.continueWithGoogle': 'Continuă cu Google',
  'auth.or': 'sau',
  'auth.email': 'E-mail',
  'auth.emailLabel': 'Adresă de e-mail',
  'auth.sendMeACode': 'Trimite-mi un cod',
  'auth.invalidEmail': 'Nu prea arată a adresă de e-mail.',
  'auth.rateLimited': 'Prea multe încercări. Încearcă din nou într-un minut.',
  'auth.providerFailed': 'Nu a mers.',
  // "client ID" is the name of the field in the console, so it is left alone.
  'auth.providersUnconfigured':
    'Conectarea cu Apple și cu Google apare după ce le sunt configurate client ID-urile. E-mailul merge oricum.',
  'auth.terms': 'Dacă mergi mai departe, accepți Termenii și condițiile și Politica de confidențialitate.',

  // A-03 · Verify
  'auth.checkYourEmail': 'Verifică-ți e-mailul',
  'auth.verificationCode': 'Cod de verificare',
  'auth.codeWrong': 'Codul ăsta nu a mers. Uită-te la ultimul e-mail pe care ți l-am trimis.',
  // A countdown, so all three forms are the same string — as in English, where
  // both forms are the same. The seconds never take "de" here because the "s"
  // is a symbol, not the noun "secunde".
  'auth.resendIn': {
    one: 'Retrimite în {count}s',
    few: 'Retrimite în {count}s',
    other: 'Retrimite în {count}s',
  },
  'auth.sendAnotherCode': 'Trimite alt cod',
  'auth.otpBuildNote':
    'În buildul ăsta merge orice combinație de șase cifre — apelul OTP e legat la Supabase în spatele aceleiași funcții.',
} satisfies Record<string, Message>;
