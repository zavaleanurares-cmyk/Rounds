import type { Message } from '../../types';

export const billing = {
  // The tier name. Left as it is in every language, like the brand it extends.
  'billing.plus': 'ROUNDS+',

  // S-14 · Paywall
  'billing.subtitle': 'Todo lo de seguridad sigue siendo gratis, para siempre.',
  // Same imperative as tonight.startNight — the app says "Empieza".
  'billing.startPlus': 'Empieza ROUNDS+',
  'billing.restorePurchases': 'Restaurar compras',

  // The refusal to sell during a live night.
  'billing.notNowTitle': 'Ahora no',
  // Same phrase as tonight.out.
  'billing.youreOut': 'Estás de marcha',
  'billing.notDuringNight':
    'ROUNDS no te vende nada durante una noche. Esto seguirá aquí mañana.',
  // "Esta noche" names the tab, so it keeps its capital — same as
  // stats.backToTonight.
  'billing.backToTonight': 'Volver a Esta noche',

  'billing.whatYouGet': 'LO QUE TE LLEVAS',
  'billing.includedHistory': 'Todo tu historial, no los últimos 90 días',
  'billing.includedSpend': 'Gasto por sitio, por mes y proyectado al año',
  // Same two words as stats.predictedVsActual.
  'billing.includedCalibration': 'Calibrado de la resaca, prevista vs real',
  // "Wrapped" is stats.wrapped's own name in Spanish, and a slide is a pantalla
  // — the same word stats.nextSlide uses.
  'billing.includedWrapped': 'Tu año, todas las pantallas, exportable',
  // "Crew Pass" is the name of a store product (crew.pass), so it is left as
  // it is, like ROUNDS+.
  'billing.includedCrewPass': 'Crew Pass — lo tienen todos los de una peña',

  'billing.freeForever': 'GRATIS PARA SIEMPRE',
  // Same phrasing as settings.safetyFreeNote, and the feature keeps its name.
  'billing.freeSafety': 'Todo lo de Vuelve a casa a salvo',
  'billing.freeLogging': 'Apuntar, el ritmo y la mañana siguiente',
  'billing.freeSocial': 'Planes, peñas y noches compartidas',

  // A product row, spoken. The title and the price both come from the store,
  // already in the reader's own language and currency.
  'billing.productLabel': '{title}, {price}',

  // What you are charged for, under the product's name. Each shape is a whole
  // phrase: "per {period}" cannot be assembled in a language that inflects the
  // noun after its preposition.
  'billing.periodOnce': 'una vez',
  'billing.periodMonth': 'al mes',
  'billing.periodYear': 'al año',
  'billing.periodOnceNote': 'una vez · {note}',
  'billing.periodMonthNote': 'al mes · {note}',
  'billing.periodYearNote': 'al año · {note}',

  'billing.testBuildNote':
    'En este build el botón desbloquea las pantallas de pago para probarlas sin cobrar nada.',
  // Legal copy — translated literally, qualifier by qualifier. "Terms" and
  // "Privacy Policy" keep the names settings.termsOfService and
  // settings.privacyPolicy give them; the two store names are never translated.
  'billing.renewalNote':
    'Las suscripciones se renuevan automáticamente hasta que se cancelen. Gestiónalas o cancélalas en tu cuenta de App Store o Google Play. Se aplican los Términos del servicio y la Política de privacidad.',

  // Toasts
  'billing.toastPlusOn': 'ROUNDS+ está activado',
  'billing.toastTestUnlock': 'Desbloqueado para pruebas — no se ha hecho ninguna compra',
  // Same opening as common.authDidNotGoThrough; the second sentence is about
  // money, so it says so.
  'billing.toastPurchaseFailed': 'No ha funcionado. No se ha cobrado nada.',
  'billing.toastRestored': 'Restaurado.',
  'billing.toastNothingToRestore': 'No hay nada que restaurar en esta cuenta.',

  // S-08 · Subscription
  'billing.subscriptionTitle': 'Suscripción',
  'billing.statusHeader': 'ESTADO',
  'billing.statusFree': 'Gratis',
  // "Wrapped" keeps stats.wrapped's name here too.
  'billing.plusBody': 'Todo el historial, el desglose del gasto, el calibrado y Tu año.',
  // "Insights" is stats.insights — Tendencias.
  'billing.freeBody':
    'Todo lo que necesitas para usar ROUNDS. Las Tendencias y el historial se quedan en 90 días.',
  'billing.manageInStore': 'Gestionar en la App Store',
  'billing.cancelPlus': 'Cancelar ROUNDS+',
  'billing.seePlus': 'Ver ROUNDS+',
  // StoreKit 2 and Google Play Billing are API names, left alone. "Derechos de
  // acceso" is the same term as settings.diagEntitlement.
  'billing.entitlementNote':
    'Los derechos de acceso se verifican en el servidor desde StoreKit 2 y Google Play Billing. El cliente nunca es la fuente de verdad de lo que has pagado.',

  // The Wrapped upsell slide.
  'billing.upgradeTitle': 'El resto es ROUNDS+',
  // "Stories" is Instagram's own name for them, so it is left as it is.
  'billing.upgradeBody': 'Dos pantallas más, y la versión que puedes exportar para Stories.',
  'billing.seeItAll': 'Verlo todo',
  'billing.productMonthly': 'Mensual',
  'billing.productAnnual': 'Anual',
  'billing.productLifetime': 'Para siempre',
  'billing.productSave': 'ahorra un 40%',
} satisfies Record<string, Message>;
