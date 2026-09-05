import type { Message } from '../../types';

export const plan = {
  // D-06 · plan detail
  'plan.title': 'Plan',
  // The impersonal form agrees with nothing, so it works for un plan, una peña
  // y un sitio.
  'plan.notFoundTitle': 'No se encuentra',
  'plan.notFoundBody': 'Ese plan ya no existe.',
  'plan.detailWhen': '{day} {time}',
  'plan.invite': 'Invitar',
  'plan.shareMessage': '{title} — {url}',
  'plan.startTheNight': 'Empieza la noche',
  // English leaves the question mark off its headers; Spanish orthography
  // needs both marks once the line reads as a question.
  'plan.areYouIn': '¿TE APUNTAS?',
  'plan.rsvpLabel': 'Respuesta',
  // The three answers share one verb with plan.whosIn and plan.inviteWhen.
  'plan.rsvpIn': 'Me apunto',
  'plan.rsvpMaybe': 'Quizá',
  'plan.rsvpOut': 'Paso',
  'plan.rsvpNoAnswer': 'Sin respuesta',
  'plan.whereOneVote': 'DÓNDE · UN VOTO CADA UNO',
  'plan.venueVotesLabel': {
    one: '{name}, {count} voto',
    other: '{name}, {count} votos',
  },
  'plan.whosIn': {
    one: 'QUIÉN SE APUNTA · {count}',
    other: 'QUIÉN SE APUNTA · {count}',
  },

  // D-07 · create plan
  'plan.newTitle': 'Plan nuevo',
  'plan.createIt': 'Créalo',
  'plan.whatLabel': 'Qué es',
  // The same example plan as common.demoPlanNotificationBody.
  'plan.whatPlaceholder': 'Viernes, en condiciones',
  'plan.when': 'CUÁNDO',
  'plan.tonight': 'Esta noche',
  'plan.whereVote': 'DÓNDE · O DEJA QUE VOTEN',
  'plan.who': 'QUIÉN',
  'plan.noFriends': 'Añade amigos primero o comparte el enlace cuando exista.',

  // D-08 · plan invite
  'plan.shareLink': 'Comparte el enlace',
  'plan.aPlan': 'Un plan',
  'plan.theyllSee': 'LO QUE VERÁN',
  // "{count} apuntados" would gender the group; the verb does not.
  'plan.inviteWhen': {
    one: '{day} {time} · {count} se apunta',
    other: '{day} {time} · {count} se apuntan',
  },
  'plan.invitePageNote':
    'La gente que no tiene la app llega a una página de verdad, no a una redirección a la tienda. Puede responder desde ahí.',
} satisfies Record<string, Message>;
