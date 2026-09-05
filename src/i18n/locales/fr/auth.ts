import type { Message } from '../../types';

export const auth = {
  // A-01 · Welcome
  'auth.tagline': 'Connais ta soirée.',
  'auth.welcomeBody':
    "Ouvre-la avant de sortir, regarde-la le lendemain matin. Elle suit ton rythme, garde ta bande ensemble, et te ramène chez toi.",
  'auth.getStarted': "C'est parti",
  'auth.haveAccount': "J'ai déjà un compte",
  // The ages are the law, not copy: 18 and 21 stay exactly as they are.
  'auth.ageAndPaceNote':
    "18+ dans l'UE et au Royaume-Uni · 21+ aux États-Unis. ROUNDS estime le rythme — ce n'est jamais une mesure de ton aptitude à conduire.",
  'auth.supportResources': "Ressources d'aide sur l'alcool",

  // A-02 · Sign in
  // "Content de te revoir" would agree with the reader's gender; "Te revoilà"
  // does not.
  'auth.welcomeBack': 'Te revoilà',
  'auth.signIn': 'Se connecter',
  'auth.continueWithApple': 'Continuer avec Apple',
  'auth.continueWithGoogle': 'Continuer avec Google',
  'auth.or': 'ou',
  'auth.email': 'E-mail',
  'auth.emailLabel': 'Adresse e-mail',
  'auth.sendMeACode': 'Envoie-moi un code',
  'auth.invalidEmail': "Ça ne ressemble pas à une adresse e-mail.",
  'auth.rateLimited': "Trop d'essais. Réessaie dans une minute.",
  'auth.providerFailed': "Ça n'a pas marché.",
  // "client ID" is the name of the field in the console, so it is left alone.
  'auth.providersUnconfigured':
    "La connexion Apple et Google apparaît une fois leurs client IDs configurés. L'e-mail marche dans tous les cas.",
  'auth.terms':
    "En continuant, tu acceptes les Conditions d'utilisation et la Politique de confidentialité.",

  // A-03 · Verify
  'auth.checkYourEmail': 'Regarde tes e-mails',
  'auth.verificationCode': 'Code de vérification',
  'auth.codeWrong': "Ce code n'a pas marché. Regarde le dernier e-mail qu'on t'a envoyé.",
  // A countdown, so both forms are the same string — as in English.
  'auth.resendIn': { one: 'Renvoyer dans {count}s', other: 'Renvoyer dans {count}s' },
  'auth.sendAnotherCode': 'Envoyer un autre code',
  'auth.otpBuildNote':
    "Dans ce build, six chiffres quelconques marchent — l'appel OTP passe par Supabase derrière la même fonction.",
} satisfies Record<string, Message>;
