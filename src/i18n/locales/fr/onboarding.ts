import type { Message } from '../../types';

export const onboarding = {
  // shared
  'onboarding.continue': 'Continuer',

  // A-04 · Age gate
  // "Tu es né quand?" would agree with the reader's gender, and the title is a
  // single line at 34pt — the noun phrase is neutral and shorter.
  'onboarding.ageTitle': 'Ta date de naissance',
  'onboarding.ageSubtitle':
    "ROUNDS est réservé aux personnes en âge légal de boire. On vérifie une fois et on garde la réponse.",
  'onboarding.day': 'Jour',
  'onboarding.month': 'Mois',
  'onboarding.year': 'Année',
  // The ages are the law, not copy: 18 and 21 stay exactly as they are, and the
  // wording is the same as auth.ageAndPaceNote.
  'onboarding.ageNote': "18+ dans l'UE et au Royaume-Uni · 21+ aux États-Unis.",
  // French does not abbreviate every month to three letters — "juin" and
  // "juil." are the conventional forms and a forced "jui" would be ambiguous.
  // These are the abbreviations a French reader expects on a date wheel.
  'onboarding.monthJan': 'janv.',
  'onboarding.monthFeb': 'févr.',
  'onboarding.monthMar': 'mars',
  'onboarding.monthApr': 'avr.',
  'onboarding.monthMay': 'mai',
  'onboarding.monthJun': 'juin',
  'onboarding.monthJul': 'juil.',
  'onboarding.monthAug': 'août',
  'onboarding.monthSep': 'sept.',
  'onboarding.monthOct': 'oct.',
  'onboarding.monthNov': 'nov.',
  'onboarding.monthDec': 'déc.',

  // A-12 · Underage block
  'onboarding.blockedTitle': "ROUNDS n'est pas encore pour toi",
  'onboarding.blockedBody':
    "Il faut avoir l'âge légal pour boire dans ta région pour utiliser ROUNDS. On garde cette réponse, donc il n'y a rien à réessayer ici.",
  'onboarding.blockedLink': "Informations sur l'alcool et les jeunes",

  // A-05 · Identity
  // No space before "?" — see the glossary.
  'onboarding.identityTitle': 'Tu es qui?',
  'onboarding.identitySubtitle': "Tes amis verront ça. Rien d'autre n'est public.",
  'onboarding.monogramNote': 'Sans photo, tu as un monogramme coloré.',
  'onboarding.displayName': 'Nom affiché',
  // A first name, kept as it is — the same example person the app uses
  // everywhere else.
  'onboarding.displayNamePlaceholder': 'Rareș',
  // Same word as profile.handleLabel — the field people call "pseudo".
  'onboarding.username': 'Pseudo',
  'onboarding.usernamePlaceholder': 'rares',
  'onboarding.usernameChecking': 'Vérification…',
  'onboarding.usernameTaken': "Quelqu'un l'a déjà.",
  'onboarding.usernameInvalid': '3–20 caractères, lettres, chiffres et tirets bas.',
  'onboarding.usernameFree': 'À toi.',
  'onboarding.usernameHint': "C'est comme ça que tes amis te trouvent.",

  // A-07 · Region and units
  'onboarding.regionTitle': 'Tu bois où?',
  'onboarding.regionSubtitle':
    "Une « unité » ne veut pas dire la même chose partout. Choisis la tienne.",
  'onboarding.standardDrink': 'Verre standard',
  'onboarding.unitSystem': "Système d'unités",
  // These name the standard-drink standard, not the region — left as they are,
  // the same way an API name is.
  'onboarding.unitSystemEU': 'EU',
  'onboarding.unitSystemUK': 'UK',
  'onboarding.unitSystemUS': 'US',
  'onboarding.standardDrinkUS': "Un verre = {grams} g d'alcool.",
  'onboarding.standardDrinkUnit': "Une unité = {grams} g d'alcool.",
  'onboarding.standardDrinkNote':
    "Tout ce que tu notes est stocké en grammes et converti ici, donc changer ça plus tard ne réécrit jamais ton historique.",
  'onboarding.currency': 'Devise',
  'onboarding.currencyNote':
    "Les dépenses, c'est le chiffre pour lequel les gens se modèrent vraiment. C'est optionnel à chaque fois.",

  // A-06 · Body basics
  // Same words as social.cannotSeeBody — it is the same data, named once.
  'onboarding.bodyTitle': 'Données corporelles',
  // The two promises of the English — on this phone only, for the estimate only
  // — both survive, and in the same order.
  'onboarding.bodySubtitle': "Seulement sur ce téléphone, seulement pour l'estimation du rythme.",
  'onboarding.skipThis': 'Passer',
  'onboarding.sex': 'Sexe',
  'onboarding.sexFemale': 'Femme',
  'onboarding.sexMale': 'Homme',
  // The English is the reader's own choice, not a missing value, so the French
  // keeps the first person rather than a neutral "Non précisé".
  'onboarding.sexUnspecified': 'Je préfère pas',
  'onboarding.weight': 'Poids',
  'onboarding.decreaseWeight': 'Diminuer le poids',
  'onboarding.increaseWeight': 'Augmenter le poids',
  'onboarding.weightUnitKg': 'kg',
  'onboarding.weightUnitLb': 'lb',
  'onboarding.bodyNote':
    "Ton anneau de rythme devient bien plus juste avec ça. Tu peux les ajouter quand tu veux.",

  // A-08 · Intent
  'onboarding.intentTitle': "C'est pour quoi?",
  'onboarding.intentSubtitle':
    "Choisis ce qui est vrai. Ça change ce qu'on te montre la première semaine, rien d'autre.",
  'onboarding.intentTrack': 'Suivre mes soirées',
  'onboarding.intentSocial': 'Sortir avec des gens',
  // "Boire moins" makes a claim the English does not; "lever le pied" is the
  // same hedged idiom as "take it easier".
  'onboarding.intentEasier': 'Lever le pied',
  'onboarding.intentNote': 'Tu peux en choisir plusieurs, ou aucun.',

  // A-09 · Modules
  'onboarding.modulesTitle': 'Autre chose?',
  'onboarding.modulesSubtitle':
    'Les deux sont optionnels. Tu peux changer ça quand tu veux dans les Réglages.',
  // Same names as settings.nicotineTracking and settings.socialFeatures.
  'onboarding.nicotineTitle': 'Suivi de la nicotine',
  'onboarding.nicotineSubtitle':
    'Cigarettes, vapes et sachets, avec le coût et les séries de jours sans.',
  'onboarding.socialTitle': 'Fonctions sociales',
  'onboarding.socialSubtitle':
    'Amis, bandes, soirées partagées et plans. Désactiver ça rend ROUNDS entièrement privé.',
  'onboarding.modulesNote':
    "Sans le social, tu gardes le rythme, les dépenses, l'historique et tout ce qu'il y a dans Rentrer sain et sauf.",

  // A-10 · Notification primer
  // "Trois choses qu'on enverrait" does not fit the single-line 34pt title; the
  // three cards under it already do the counting.
  'onboarding.permissionsTitle': "Ce qu'on enverrait",
  'onboarding.permissionsSubtitle':
    'Jamais pendant une soirée en cours. Limité à trois par semaine par défaut.',
  'onboarding.pushMorningTitle': 'Ton lendemain',
  'onboarding.pushMorningBody':
    "Une notif à ton heure de réveil habituelle, avec la soirée et les trous à combler.",
  'onboarding.pushSafetyTitle': 'Signe de vie',
  'onboarding.pushSafetyBody':
    "Si tu as armé un signe de vie et que l'heure passe, on te demande à toi avant de demander à quelqu'un d'autre.",
  'onboarding.pushPlansTitle': 'Plans',
  'onboarding.pushPlansBody': "Quand quelqu'un t'invite ou qu'un plan va commencer.",
  'onboarding.allowNotifications': 'Autoriser les notifications',
  'onboarding.notNow': 'Pas maintenant',
  'onboarding.androidNote':
    "Android va te demander juste après. Refuser ne pose pas de problème — les signes de vie marchent toujours dans l'app.",

  // A-11 · Ready
  // "Tu es prêt" would agree with the reader's gender; "tout" does not.
  'onboarding.doneTitle': 'Tout est prêt',
  'onboarding.doneSubtitle': 'Trois choses à savoir avant ta première soirée.',
  'onboarding.takeMeIn': 'On y va',
  // "Ce soir" is the tab's name, so it is spelled the way common.tabTonight
  // spells it.
  'onboarding.markTonight':
    'Ce soir change de forme au fil de la soirée — plan, en cours, fin de soirée, matin.',
  'onboarding.markLog':
    "Le bouton du milieu note un verre. Depuis l'écran verrouillé, c'est un seul appui.",
  'onboarding.markSafety': 'Rentrer sain et sauf est accessible de partout et toujours gratuit.',
} satisfies Record<string, Message>;
