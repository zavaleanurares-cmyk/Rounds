import type { Message } from '../../types';

export const billing = {
  // The tier name. Left as it is in every language, like the brand it extends.
  'billing.plus': 'ROUNDS+',

  // S-14 · Paywall
  'billing.subtitle': 'Tout ce qui touche à la sécurité reste gratuit, pour toujours.',
  // Same imperative as tonight.startNight — the app says "Commence", not
  // "Commencer", when it asks the reader to do something.
  'billing.startPlus': 'Commence ROUNDS+',
  'billing.restorePurchases': 'Restaurer les achats',

  // The refusal to sell during a live night.
  'billing.notNowTitle': 'Pas maintenant',
  // Same phrase as tonight.out.
  'billing.youreOut': 'Tu es de sortie',
  'billing.notDuringNight':
    'ROUNDS ne te vend rien pendant une soirée. Ce sera encore là demain.',
  // "Ce soir" names the tab, so it keeps its capital — same as
  // stats.backToTonight.
  'billing.backToTonight': 'Retour à Ce soir',

  'billing.whatYouGet': 'CE QUE TU OBTIENS',
  'billing.includedHistory': 'Tout ton historique, pas les 90 derniers jours',
  'billing.includedSpend': "Les dépenses par lieu, par mois et projetées sur l'année",
  // Same two words as stats.predictedVsActual.
  'billing.includedCalibration': 'Calibrage de la gueule de bois, prévue vs réelle',
  // "Wrapped" is stats.wrapped's own name in French, and a slide is an écran —
  // the same word stats.nextSlide uses.
  'billing.includedWrapped': 'Ton année, tous les écrans, exportable',
  // "Crew Pass" is the name of a store product (crew.pass), so it is left as
  // it is, like ROUNDS+.
  'billing.includedCrewPass': "Crew Pass — tout le monde dans une bande l'a",

  'billing.freeForever': 'GRATUIT POUR TOUJOURS',
  // Same phrasing as settings.safetyFreeNote, and the feature keeps its name.
  'billing.freeSafety': "Tout ce qu'il y a dans Rentrer sain et sauf",
  'billing.freeLogging': 'Noter, le rythme et le lendemain matin',
  'billing.freeSocial': 'Les plans, les bandes et les soirées partagées',

  // A product row, spoken. The title and the price both come from the store,
  // already in the reader's own language and currency.
  'billing.productLabel': '{title}, {price}',

  // What you are charged for, under the product's name. Each shape is a whole
  // phrase: "per {period}" cannot be assembled in a language that inflects the
  // noun after its preposition.
  'billing.periodOnce': 'une fois',
  'billing.periodMonth': 'par mois',
  'billing.periodYear': 'par an',
  'billing.periodOnceNote': 'une fois · {note}',
  'billing.periodMonthNote': 'par mois · {note}',
  'billing.periodYearNote': 'par an · {note}',

  'billing.testBuildNote':
    'Dans ce build, le bouton déverrouille les écrans payants pour les tests sans rien facturer.',
  // Legal copy — translated literally, qualifier by qualifier. "Terms" and
  // "Privacy Policy" keep the names settings.termsOfService and
  // settings.privacyPolicy give them; the two store names are never translated.
  'billing.renewalNote':
    "Les abonnements se renouvellent automatiquement jusqu'à leur résiliation. Gère-les ou résilie-les dans ton compte App Store ou Google Play. Les Conditions d'utilisation et la Politique de confidentialité s'appliquent.",

  // Toasts
  'billing.toastPlusOn': 'ROUNDS+ est activé',
  'billing.toastTestUnlock': "Déverrouillé pour les tests — aucun achat n'a été fait",
  // Same opening as common.authDidNotGoThrough; the second sentence is about
  // money, so it says so.
  'billing.toastPurchaseFailed': "Ça n'a pas marché. Rien n'a été débité.",
  'billing.toastRestored': 'Restauré.',
  'billing.toastNothingToRestore': 'Rien à restaurer sur ce compte.',

  // S-08 · Subscription
  'billing.subscriptionTitle': 'Abonnement',
  'billing.statusHeader': 'STATUT',
  'billing.statusFree': 'Gratuit',
  // "Wrapped" keeps stats.wrapped's name here too.
  'billing.plusBody': 'Tout ton historique, le détail des dépenses, le calibrage et Ton année.',
  // "Insights" is stats.insights — Tendances.
  'billing.freeBody':
    "Tout ce qu'il faut pour utiliser ROUNDS. Les Tendances et l'historique s'arrêtent à 90 jours.",
  'billing.manageInStore': "Gérer dans l'App Store",
  'billing.cancelPlus': 'Résilier ROUNDS+',
  'billing.seePlus': 'Voir ROUNDS+',
  // StoreKit 2 and Google Play Billing are API names, left alone. "Droits
  // d'accès" is the same term as settings.diagEntitlement.
  'billing.entitlementNote':
    "Les droits d'accès sont vérifiés côté serveur depuis StoreKit 2 et Google Play Billing. Le client n'est jamais la source de vérité pour ce que tu as payé.",

  // The Wrapped upsell slide.
  'billing.upgradeTitle': "La suite, c'est ROUNDS+",
  // "Stories" is Instagram's own name for them, so it is left as it is.
  'billing.upgradeBody': 'Deux écrans de plus, et la version que tu peux exporter pour les Stories.',
  'billing.seeItAll': 'Tout voir',
  'billing.productMonthly': 'Mensuel',
  'billing.productAnnual': 'Annuel',
  'billing.productLifetime': 'À vie',
  // "40 %" with a space is the French convention in prose, the same choice
  // settings.outsideShare makes.
  'billing.productSave': 'économise 40 %',
} satisfies Record<string, Message>;
