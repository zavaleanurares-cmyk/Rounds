import type { Message } from '../../types';

export const billing = {
  // The tier name. Left as it is in every language, like the brand it extends,
  // and never declined.
  'billing.plus': 'ROUNDS+',

  // S-14 · Paywall
  'billing.subtitle': 'Tot ce ține de siguranță rămâne gratuit, pentru totdeauna.',
  // Same imperative as tonight.startNight — the app says "Începe".
  'billing.startPlus': 'Începe ROUNDS+',
  'billing.restorePurchases': 'Restaurează cumpărăturile',

  // The refusal to sell during a live night.
  'billing.notNowTitle': 'Nu acum',
  // Same phrase as tonight.out.
  'billing.youreOut': 'Ești în oraș',
  'billing.notDuringNight':
    'ROUNDS nu îți vinde nimic în timpul unei seri. O să fie tot aici și mâine.',
  // "Diseară" names the tab, so it keeps its capital — same as
  // stats.backToTonight.
  'billing.backToTonight': 'Înapoi la Diseară',

  'billing.whatYouGet': 'CE PRIMEȘTI',
  // Above nineteen the noun takes "de": "90 de zile", the same way
  // stats.insightsLast90 writes it.
  'billing.includedHistory': 'Tot istoricul tău, nu ultimele 90 de zile',
  'billing.includedSpend': 'Cheltuielile pe local, pe lună și proiectate pe an',
  // Same two words as stats.predictedVsActual.
  'billing.includedCalibration': 'Calibrarea mahmurelii, estimată vs reală',
  // "Wrapped" is stats.wrapped's own name in Romanian, and a slide is an ecran
  // — the same word stats.nextSlide uses.
  'billing.includedWrapped': 'Anul tău, toate ecranele, exportabil',
  // "Crew Pass" is the name of a store product (crew.pass), so it is left as
  // it is, like ROUNDS+.
  'billing.includedCrewPass': 'Crew Pass — îl primesc toți dintr-o gașcă',

  'billing.freeForever': 'GRATUIT PENTRU TOTDEAUNA',
  // Same phrasing as settings.safetyFreeNote, and the feature keeps its name.
  'billing.freeSafety': 'Tot ce ține de Ajungi acasă cu bine',
  'billing.freeLogging': 'Notatul, ritmul și dimineața de după',
  // Same words as settings.socialFeaturesSubtitle.
  'billing.freeSocial': 'Planuri, găști și seri în comun',

  // A product row, spoken. The title and the price both come from the store,
  // already in the reader's own language and currency.
  'billing.productLabel': '{title}, {price}',

  // What you are charged for, under the product's name. Each shape is a whole
  // phrase: "per {period}" cannot be assembled in a language that inflects the
  // noun after its preposition.
  'billing.periodOnce': 'o dată',
  'billing.periodMonth': 'pe lună',
  'billing.periodYear': 'pe an',
  'billing.periodOnceNote': 'o dată · {note}',
  'billing.periodMonthNote': 'pe lună · {note}',
  'billing.periodYearNote': 'pe an · {note}',

  'billing.testBuildNote':
    'În buildul ăsta, butonul deblochează ecranele plătite pentru testare, fără să se perceapă nimic.',
  // Legal copy — translated literally, qualifier by qualifier. "Terms" and
  // "Privacy Policy" keep the names settings.termsOfService and
  // settings.privacyPolicy give them; the two store names are never translated.
  'billing.renewalNote':
    'Abonamentele se reînnoiesc automat până la anulare. Gestionează-le sau anulează-le din contul tău App Store sau Google Play. Se aplică Termenii și condițiile și Politica de confidențialitate.',

  // Toasts
  'billing.toastPlusOn': 'ROUNDS+ e activat',
  'billing.toastTestUnlock': 'Deblocat pentru testare — nu s-a făcut nicio cumpărare',
  // Same opening as common.authDidNotGoThrough; the second sentence is about
  // money, so it says so.
  'billing.toastPurchaseFailed': 'Nu a mers. Nu s-a perceput nimic.',
  'billing.toastRestored': 'Restaurat.',
  'billing.toastNothingToRestore': 'Nu e nimic de restaurat pe contul ăsta.',

  // S-08 · Subscription
  'billing.subscriptionTitle': 'Abonament',
  'billing.statusHeader': 'STARE',
  'billing.statusFree': 'Gratuit',
  // "Wrapped" keeps stats.wrapped's name here too.
  'billing.plusBody': 'Tot istoricul, cheltuielile detaliate, calibrarea și Anul tău.',
  // "Insights" is stats.insights — Tendințe.
  'billing.freeBody':
    'Tot ce îți trebuie ca să folosești ROUNDS. Tendințele și istoricul se opresc la 90 de zile.',
  'billing.manageInStore': 'Gestionează în App Store',
  'billing.cancelPlus': 'Anulează ROUNDS+',
  'billing.seePlus': 'Vezi ROUNDS+',
  // StoreKit 2 and Google Play Billing are API names, left alone. "Drepturile
  // de acces" is the same term as settings.diagEntitlement.
  'billing.entitlementNote':
    'Drepturile de acces sunt verificate pe server din StoreKit 2 și Google Play Billing. Clientul nu e niciodată sursa de adevăr pentru ce ai plătit.',

  // The Wrapped upsell slide.
  'billing.upgradeTitle': 'Restul e ROUNDS+',
  // "Stories" is Instagram's own name for them, so it is left as it is.
  'billing.upgradeBody': 'Încă două ecrane și versiunea pe care o poți exporta pentru Stories.',
  'billing.seeItAll': 'Vezi tot',
  'billing.productMonthly': 'Lunar',
  'billing.productAnnual': 'Anual',
  'billing.productLifetime': 'Pe viață',
  'billing.productSave': 'economisești 40%',
} satisfies Record<string, Message>;
