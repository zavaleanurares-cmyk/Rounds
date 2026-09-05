import type { Message } from '../../types';

/** S-08 · Subscription, S-14 · Paywall, and the Wrapped upsell slide. */
export const billing = {
  // The tier name. Left as it is in every language, like the brand it extends.
  'billing.plus': 'ROUNDS+',

  // S-14 · Paywall
  'billing.subtitle': 'Everything about safety stays free, forever.',
  'billing.startPlus': 'Start ROUNDS+',
  'billing.restorePurchases': 'Restore purchases',

  // The refusal to sell during a live night.
  'billing.notNowTitle': 'Not now',
  'billing.youreOut': "You're out",
  'billing.notDuringNight':
    "ROUNDS doesn't sell you anything during a night. This will still be here tomorrow.",
  'billing.backToTonight': 'Back to tonight',

  'billing.whatYouGet': 'WHAT YOU GET',
  'billing.includedHistory': 'Your full history, not the last 90 days',
  'billing.includedSpend': 'Spend by venue, month and projected year',
  'billing.includedCalibration': 'Predicted vs actual hangover calibration',
  'billing.includedWrapped': 'Wrapped, all slides, exportable',
  'billing.includedCrewPass': 'Crew Pass — everyone in one crew gets it',

  'billing.freeForever': 'FREE FOREVER',
  'billing.freeSafety': 'Everything in Get home safe',
  'billing.freeLogging': 'Logging, pace and the morning after',
  'billing.freeSocial': 'Plans, crews and shared nights',

  // A product row, spoken. The title and the price both come from the store,
  // already in the reader's own language and currency.
  'billing.productLabel': '{title}, {price}',

  // What you are charged for, under the product's name. Each shape is a whole
  // phrase: "per {period}" cannot be assembled in a language that inflects the
  // noun after its preposition.
  'billing.periodOnce': 'once',
  'billing.periodMonth': 'per month',
  'billing.periodYear': 'per year',
  'billing.periodOnceNote': 'once · {note}',
  'billing.periodMonthNote': 'per month · {note}',
  'billing.periodYearNote': 'per year · {note}',

  'billing.testBuildNote':
    'In this build the button unlocks the paid screens for testing without charging anything.',
  'billing.renewalNote':
    'Subscriptions renew automatically until cancelled. Manage or cancel in your App Store or Google Play account. Terms and Privacy Policy apply.',

  // Toasts
  'billing.toastPlusOn': 'ROUNDS+ is on',
  'billing.toastTestUnlock': 'Unlocked for testing — no purchase was made',
  'billing.toastPurchaseFailed': "That didn't go through. Nothing was charged.",
  'billing.toastRestored': 'Restored.',
  'billing.toastNothingToRestore': 'Nothing to restore on this account.',

  // S-08 · Subscription
  'billing.subscriptionTitle': 'Subscription',
  'billing.statusHeader': 'STATUS',
  'billing.statusFree': 'Free',
  'billing.plusBody': 'Full history, spend breakdowns, calibration and Wrapped.',
  'billing.freeBody':
    'Everything you need to use ROUNDS. Insights and history are capped at 90 days.',
  'billing.manageInStore': 'Manage in the App Store',
  'billing.cancelPlus': 'Cancel ROUNDS+',
  'billing.seePlus': 'See ROUNDS+',
  'billing.entitlementNote':
    "Entitlements are verified server-side from StoreKit 2 and Google Play Billing. The client is never the source of truth for what you've paid for.",

  // The Wrapped upsell slide.
  'billing.upgradeTitle': 'The rest is ROUNDS+',
  'billing.upgradeBody': 'Two more slides, and the version you can export for Stories.',
  'billing.seeItAll': 'See it all',
  'billing.productMonthly': 'Monthly',
  'billing.productAnnual': 'Annual',
  'billing.productLifetime': 'Lifetime',
  'billing.productSave': 'save 40%',
} satisfies Record<string, Message>;
