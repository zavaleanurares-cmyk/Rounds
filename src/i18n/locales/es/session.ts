import type { Message } from '../../types';

export const session = {
  // T-06 · start night
  // Same wording as tonight.startTheNight — it is the same action.
  'session.startTitle': 'Empieza la noche',
  'session.start': 'Empezar',
  'session.nameLabel': 'Ponle nombre (opcional)',
  // The same example noche as plan.whatPlaceholder.
  'session.namePlaceholder': 'Viernes, en condiciones',
  // A header over a row of venue chips, so it is where the noche starts, not
  // when.
  'session.startingAt': 'EMPIEZAS EN',
  'session.searchVenue': 'Buscar…',
  'session.whoCanSeeIt': 'QUIÉN PUEDE VERLA',
  'session.visibilityLabel': 'Visibilidad',
  // The same four labels as settings.visibility* — the two screens set the
  // same field, so they must read the same.
  'session.visibilityPrivate': 'Privada',
  'session.visibilityFriends': 'Amigos',
  'session.visibilityCrew': 'La peña',
  'session.visibilityLink': 'Enlace',
  'session.visibilityPrivateNote': 'Nadie ve esta noche y no se crea ningún código para unirse.',
  'session.visibilitySharedNote':
    'Se crea un código para unirse, para que la gente pueda escanearlo. Caduca cuando termina la noche.',
  'session.tellTheCrew': 'Avisa a la peña',
  'session.crewNotified': '{crew} recibe una notificación',
  'session.crewsNotified': 'Tus peñas reciben una notificación',

  // T-08 · night detail
  'session.nightTitle': 'Noche',
  // Same wording as plan.notFoundTitle — the impersonal form agrees with
  // nothing, so it works for una noche as well as un plan.
  'session.notFoundTitle': 'No se encuentra',
  // Same sentence as morning.notFoundBody and stats.shareEmptyBody.
  'session.notFoundBody': 'Esa noche no está en este dispositivo.',
  'session.aNightOut': 'Una noche',
  'session.nightDate': '{weekday} {date}',
  // Same wording as stats.shareTitle.
  'session.shareLabel': 'Comparte esta noche',
  // THE SHARE CARD. Where you were and how long, nothing else — never what you
  // drank, never the estimate.
  'session.shareMessage': {
    one: '{place} · {duration} · {count} sitio',
    other: '{place} · {duration} · {count} sitios',
  },
  // A tile label above the duration. Same phrase as tonight.out.
  'session.outFor': 'De marcha',
  'session.drinks': 'Copas',
  // The unit word itself comes from the profile's unit system, not from here.
  'session.unitsCaption': '{units} {unit}',
  'session.water': 'Agua',
  'session.spend': 'Gasto',
  // Same word as stats.view.
  'session.viewLabel': 'Vista',
  'session.tabTimeline': 'Cronología',
  'session.tabPace': 'Curva del ritmo',
  'session.timelineEmpty': 'En esta noche no se apuntó nada.',
  'session.logRowLabel': '{drink} a las {time}',
  'session.paceHeader': 'EL RITMO A LO LARGO DE LA NOCHE',
  // The last sentence is the disclaimer, word for word as in
  // settings.paceDisclaimer. No softening, no conditional.
  'session.paceNote':
    'Solo la forma. Estimación de ritmo — no la uses nunca para decidir si conduces.',
  'session.whoWasThere': 'QUIÉN ESTABA',
  'session.editNight': 'Edita esta noche',
  'session.makePrivateLabel': 'Haz privada esta noche',
  'session.makePrivateHint': 'Tiene efecto inmediato',
  'session.makePrivate': 'Hazla privada',
  'session.isPrivate': 'Esta noche es privada. Nadie más puede verla.',

  // T-09 · edit night
  'session.editNightTitle': 'Editar noche',
  'session.notFoundShort': 'No se encuentra.',
  'session.editNightSubtitle': 'Corregirlo aquí corrige todos los números que salen de ahí.',
  'session.moveEarlier': 'Mueve {drink} media hora antes',
  // The minus is U+2212, as in English; "min" is what formatDuration uses, the
  // same way log.minusMinutes writes it.
  'session.minus30': '−30min',
  'session.removeDrink': 'Quita {drink}',
  'session.editEmpty': 'Todavía no hay nada apuntado en esta noche.',
  'session.addADrink': 'AÑADE UNA COPA',
  'session.addMissedDrink': 'Añadir una copa que se me pasó',

  // T-07 · end night
  // Same sentence as live.nightEnded.
  'session.alreadyEnded': 'Esa noche ya ha terminado.',
  // Same wording as tonight.endNight.
  'session.endTitle': 'Terminar la noche',
  'session.endIt': 'Terminar',
  // A section header, so no ¿…? — the same way morning.howDoYouFeel drops them.
  'session.howWasIt': 'QUÉ TAL HA IDO',
  // "Has llegado" does not agree with the reader's gender, so this one can stay
  // as literal as the English.
  'session.gotHomeSafe': '¿Has llegado bien a casa?',
  'session.anythingForgot': '¿Se te ha olvidado algo?',
  // "Has estado fuera" would need no agreement, but making the noche the
  // subject keeps the same shape as morning.gapsHeadline. "Only" is in the
  // plural of the English and not in the singular, and that stays true here.
  'session.gapsBody': {
    one: 'Tu noche ha durado un buen rato y has apuntado {count} copa. Puedes rellenar los huecos ahora, o por la mañana, cuando es más fácil.',
    other:
      'Tu noche ha durado un buen rato y solo has apuntado {count} copas. Puedes rellenar los huecos ahora, o por la mañana, cuando es más fácil.',
  },
  'session.doItInMorning': 'Lo haré por la mañana',
} satisfies Record<string, Message>;
