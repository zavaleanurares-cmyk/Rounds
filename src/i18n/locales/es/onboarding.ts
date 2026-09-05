import type { Message } from '../../types';

export const onboarding = {
  // shared
  'onboarding.continue': 'Continuar',

  // A-04 · Age gate
  // "Naciste" does not agree with the reader's gender, so Spanish is the one
  // language of the three that can keep the English's question.
  'onboarding.ageTitle': '¿Cuándo naciste?',
  'onboarding.ageSubtitle':
    'ROUNDS es para gente con la edad legal para beber. Lo comprobamos una vez y guardamos la respuesta.',
  'onboarding.day': 'Día',
  'onboarding.month': 'Mes',
  'onboarding.year': 'Año',
  // The ages are the law, not copy: 18 and 21 stay exactly as they are, and the
  // wording is the same as auth.ageAndPaceNote.
  'onboarding.ageNote': '18+ en la UE y el Reino Unido · 21+ en Estados Unidos.',
  // Three letters, lowercase — the same shape as the weekday abbreviations in
  // stats.dayShort*.
  'onboarding.monthJan': 'ene',
  'onboarding.monthFeb': 'feb',
  'onboarding.monthMar': 'mar',
  'onboarding.monthApr': 'abr',
  'onboarding.monthMay': 'may',
  'onboarding.monthJun': 'jun',
  'onboarding.monthJul': 'jul',
  'onboarding.monthAug': 'ago',
  'onboarding.monthSep': 'sep',
  'onboarding.monthOct': 'oct',
  'onboarding.monthNov': 'nov',
  'onboarding.monthDec': 'dic',

  // A-12 · Underage block
  'onboarding.blockedTitle': 'ROUNDS todavía no es para ti',
  'onboarding.blockedBody':
    'Para usar ROUNDS tienes que tener la edad legal para beber en tu región. Guardamos esta respuesta, así que aquí no hay nada que reintentar.',
  'onboarding.blockedLink': 'Información sobre el alcohol y los jóvenes',

  // A-05 · Identity
  'onboarding.identityTitle': '¿Quién eres?',
  'onboarding.identitySubtitle': 'Esto lo verán tus amigos. Nada más es público.',
  'onboarding.monogramNote': 'Sin foto, te ponemos un monograma de color.',
  'onboarding.displayName': 'Nombre visible',
  // A first name, kept as it is — the same example person the app uses
  // everywhere else.
  'onboarding.displayNamePlaceholder': 'Rareș',
  // Same word as profile.handleLabel.
  'onboarding.username': 'Usuario',
  'onboarding.usernamePlaceholder': 'rares',
  'onboarding.usernameChecking': 'Comprobando…',
  'onboarding.usernameTaken': 'Ya lo tiene alguien.',
  'onboarding.usernameInvalid': '3–20 caracteres, letras, números y guiones bajos.',
  'onboarding.usernameFree': 'Tuyo.',
  'onboarding.usernameHint': 'Así te encuentran tus amigos.',

  // A-07 · Region and units
  'onboarding.regionTitle': '¿Dónde bebes?',
  'onboarding.regionSubtitle':
    'Una «unidad» no significa lo mismo en todas partes. Elige la tuya.',
  'onboarding.standardDrink': 'Copa estándar',
  'onboarding.unitSystem': 'Sistema de unidades',
  // These name the standard-drink standard, not the region — left as they are,
  // the same way an API name is.
  'onboarding.unitSystemEU': 'EU',
  'onboarding.unitSystemUK': 'UK',
  'onboarding.unitSystemUS': 'US',
  'onboarding.standardDrinkUS': 'Una copa = {grams} g de alcohol.',
  'onboarding.standardDrinkUnit': 'Una unidad = {grams} g de alcohol.',
  'onboarding.standardDrinkNote':
    'Todo lo que apuntas se guarda en gramos y se convierte aquí, así que cambiar esto más adelante nunca reescribe tu historial.',
  'onboarding.currency': 'Moneda',
  'onboarding.currencyNote':
    'El gasto es el número por el que la gente se modera de verdad. Es opcional en cada apunte.',

  // A-06 · Body basics
  // Same words as social.cannotSeeBody — it is the same data, named once.
  'onboarding.bodyTitle': 'Datos corporales',
  // Both promises of the English — solo en este teléfono, solo para la
  // estimación — survive, and in the same order.
  'onboarding.bodySubtitle': 'Solo se usan en este teléfono, solo para la estimación del ritmo.',
  'onboarding.skipThis': 'Sáltatelo',
  'onboarding.sex': 'Sexo',
  'onboarding.sexFemale': 'Mujer',
  'onboarding.sexMale': 'Hombre',
  // The English is the reader's own choice, not a missing value, so it stays in
  // the first person rather than becoming a neutral "Sin especificar". It is
  // the longest of the three segments — worth a width check on a small phone.
  'onboarding.sexUnspecified': 'Prefiero no decirlo',
  'onboarding.weight': 'Peso',
  'onboarding.decreaseWeight': 'Bajar el peso',
  'onboarding.increaseWeight': 'Subir el peso',
  'onboarding.weightUnitKg': 'kg',
  'onboarding.weightUnitLb': 'lb',
  'onboarding.bodyNote':
    'Tu anillo de ritmo es mucho más preciso con esto. Puedes añadirlo cuando quieras.',

  // A-08 · Intent
  'onboarding.intentTitle': '¿Para qué es?',
  'onboarding.intentSubtitle':
    'Elige lo que sea verdad. Cambia lo que te enseñamos la primera semana, nada más.',
  'onboarding.intentTrack': 'Llevar la cuenta',
  'onboarding.intentSocial': 'Salir con gente',
  // "Beber menos" makes a claim the English does not; "tomármelo con calma" is
  // the same hedged idiom as "take it easier", and it avoids "ritmo", which is
  // the pace word.
  'onboarding.intentEasier': 'Tomármelo con calma',
  'onboarding.intentNote': 'Puedes elegir más de uno, o ninguno.',

  // A-09 · Modules
  'onboarding.modulesTitle': '¿Algo más?',
  'onboarding.modulesSubtitle':
    'Las dos son opcionales. Puedes cambiarlas cuando quieras en Ajustes.',
  // Same names as settings.nicotineTracking and settings.socialFeatures.
  'onboarding.nicotineTitle': 'Seguimiento de nicotina',
  'onboarding.nicotineSubtitle':
    'Cigarrillos, vapes y bolsitas, con el coste y las rachas de días sin.',
  'onboarding.socialTitle': 'Funciones sociales',
  'onboarding.socialSubtitle':
    'Amigos, peñas, noches compartidas y planes. Si lo desactivas, ROUNDS es totalmente privado.',
  'onboarding.modulesNote':
    'Con lo social desactivado, mantienes el ritmo, el gasto, el historial y todo lo de Vuelve a casa a salvo.',

  // A-10 · Notification primer
  // "Tres cosas que te enviaríamos" does not fit the single-line 34pt title;
  // the three cards under it already do the counting.
  'onboarding.permissionsTitle': 'Lo que enviaríamos',
  'onboarding.permissionsSubtitle':
    'Nunca durante una noche en directo. Como mucho tres por semana por defecto.',
  'onboarding.pushMorningTitle': 'Tu mañana siguiente',
  // "aviso" is reserved for a safety check-in, so a push is "notificación" —
  // the same split settings.morningRecapSubtitle makes.
  'onboarding.pushMorningBody':
    'Una notificación a tu hora habitual de despertarte, con la noche y los huecos que rellenar.',
  'onboarding.pushSafetyTitle': 'Aviso de llegada',
  'onboarding.pushSafetyBody':
    'Si has armado un aviso y pasa la hora, te preguntamos a ti antes que a nadie.',
  'onboarding.pushPlansTitle': 'Planes',
  'onboarding.pushPlansBody': 'Cuando alguien te invita o un plan está a punto de empezar.',
  'onboarding.allowNotifications': 'Permitir notificaciones',
  'onboarding.notNow': 'Ahora no',
  'onboarding.androidNote':
    'Android te lo pedirá justo después. Puedes decir que no — los avisos de seguridad siguen funcionando en la app.',

  // A-11 · Ready
  // "Listo" would agree with the reader's gender; "Ya está" does not.
  'onboarding.doneTitle': 'Ya está',
  'onboarding.doneSubtitle': 'Tres cosas que conviene saber antes de tu primera noche.',
  'onboarding.takeMeIn': 'Vamos allá',
  // "Esta noche" is the tab's name, so it is spelled the way common.tabTonight
  // spells it.
  'onboarding.markTonight':
    'Esta noche cambia de forma a lo largo de la noche — plan, en directo, recta final, mañana.',
  'onboarding.markLog':
    'El botón del medio apunta una copa. Desde la pantalla de bloqueo es un solo toque.',
  'onboarding.markSafety':
    'Vuelve a casa a salvo está a mano desde cualquier sitio y siempre es gratis.',
} satisfies Record<string, Message>;
