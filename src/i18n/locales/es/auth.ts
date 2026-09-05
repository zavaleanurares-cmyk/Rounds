import type { Message } from '../../types';

export const auth = {
  // A-01 · Welcome
  'auth.tagline': 'Conoce tu noche.',
  'auth.welcomeBody':
    'Ábrela antes de salir, míratela a la mañana siguiente. Te marca el ritmo, mantiene a tu peña junta y te lleva a casa.',
  'auth.getStarted': 'Empieza',
  'auth.haveAccount': 'Ya tengo cuenta',
  // The ages are the law, not copy: 18 and 21 stay exactly as they are.
  'auth.ageAndPaceNote':
    '18+ en la UE y el Reino Unido · 21+ en Estados Unidos. ROUNDS estima el ritmo — nunca es una medida de si estás en condiciones de conducir.',
  'auth.supportResources': 'Recursos de ayuda con el alcohol',

  // A-02 · Sign in
  // "Bienvenido de nuevo" would agree with the reader's gender; this does not.
  'auth.welcomeBack': 'Hola de nuevo',
  'auth.signIn': 'Iniciar sesión',
  'auth.continueWithApple': 'Continuar con Apple',
  'auth.continueWithGoogle': 'Continuar con Google',
  'auth.or': 'o',
  'auth.email': 'Correo',
  'auth.emailLabel': 'Dirección de correo',
  'auth.sendMeACode': 'Mándame un código',
  'auth.invalidEmail': 'Eso no parece una dirección de correo.',
  'auth.rateLimited': 'Demasiados intentos. Inténtalo otra vez en un minuto.',
  'auth.providerFailed': 'No ha funcionado.',
  // "client ID" is the name of the field in the console, so it is left alone.
  'auth.providersUnconfigured':
    'El inicio de sesión con Apple y con Google aparece cuando estén configurados sus client IDs. El correo funciona igual.',
  'auth.terms': 'Si continúas, aceptas los Términos y la Política de privacidad.',

  // A-03 · Verify
  'auth.checkYourEmail': 'Mira tu correo',
  'auth.verificationCode': 'Código de verificación',
  'auth.codeWrong': 'Ese código no ha funcionado. Mira el último correo que te hemos mandado.',
  // A countdown, so both forms are the same string — as in English.
  'auth.resendIn': { one: 'Reenviar en {count}s', other: 'Reenviar en {count}s' },
  'auth.sendAnotherCode': 'Mandar otro código',
  'auth.otpBuildNote':
    'En esta build funcionan seis dígitos cualesquiera — la llamada OTP va a Supabase detrás de la misma función.',
} satisfies Record<string, Message>;
