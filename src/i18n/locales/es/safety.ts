import type { Message } from '../../types';

/**
 * La seguridad, en español.
 *
 * Dos reglas para todo el archivo:
 *
 *  · Cada frase está entera. Nada se arma con fragmentos, porque el orden de
 *    las palabras cambia de una lengua a otra y una frase pegada en inglés no
 *    se puede traducir.
 *  · El tono es tranquilo. Este es el texto que se lee cuando algo ha salido
 *    mal: informa, no dramatiza y no regaña a nadie.
 */
export const safety = {
  'safety.title': 'Vuelve a casa a salvo',
  'safety.checkInArmed': 'AVISO ACTIVADO',
  'safety.dueNow': 'ahora mismo',
  'safety.armedIntro': 'Si no das señales, primero te preguntamos a ti.',
  'safety.armedEscalation': {
    one: 'Quince minutos después, {count} contacto de confianza recibe tu mensaje y el último sitio.',
    other: 'Quince minutos después, {count} contactos de confianza reciben tu mensaje y el último sitio.',
  },
  'safety.armedEscalationNoContacts':
    'Quince minutos después, tus contactos de confianza reciben tu mensaje y el último sitio.',
  // Sin participio concordado: "he llegado" no marca género.
  'safety.imHomeSafe': 'He llegado bien a casa',
  'safety.anotherHour': 'Dame una hora más',
  'safety.nothingArmed': 'Nada activado',
  'safety.nothingArmedBody':
    'Pon la hora a la que crees que estarás en casa. Si no das señales para entonces, te preguntamos a ti antes que a nadie — y siempre puedes ver antes el mensaje exacto.',
  'safety.armCheckIn': 'Activar un aviso',
  'safety.rideHome': 'Volver en coche',
  'safety.walkIt': 'Volver andando',
  'safety.checkOnMe': 'Mira cómo estoy',
  'safety.shareLocation': 'COMPARTIR MI UBICACIÓN',
  'safety.shareLocationBody':
    'Con tiempo limitado, con la gente de tu noche. Se para sola, y el dato se borra en vez de ocultarse.',
  'safety.hours': { one: '{count} h', other: '{count} h' },
  'safety.callEmergencyTitle': '¿Llamar al {number}?',
  'safety.callEmergencyBody': 'Esto llama a los servicios de emergencia.',
  'safety.callEmergencyConfirm': 'Llamar al {number}',
  'safety.callEmergencyLabel': 'Llamar a los servicios de emergencia, {number}',
  'safety.emergency': 'Emergencias · {number}',
  'safety.freeForever':
    'Todo lo de esta pantalla es gratis, siempre. ROUNDS nunca pone una suscripción delante.',

  'safety.when': 'CUÁNDO',
  'safety.checkOnMeIn': {
    one: 'Mira cómo estoy en {count} h',
    other: 'Mira cómo estoy en {count} h',
  },
  'safety.messageLabel': 'Lo que les llegaría',
  // En tercera persona: lo lee otra persona, quizá un padre o una madre. Tono
  // neutro, no cómplice.
  'safety.messageDefault':
    '{name} le pidió a ROUNDS que comprobara si había llegado a casa y no ha contestado. Última salida conocida: esta noche.',
  'safety.messageDefaultNoName':
    'Alguien le pidió a ROUNDS que comprobara si había llegado a casa y no ha contestado. Última salida conocida: esta noche.',
  'safety.gracePeriod':
    'A la hora fijada recibes una notificación, con quince minutos de margen.',
  'safety.onlyThenNamed': 'Solo si eso queda sin respuesta se entera {names} de algo.',
  'safety.onlyThen': 'Solo si eso queda sin respuesta se enteran de algo tus contactos de confianza.',
  'safety.noContactsWarning':
    'Todavía no has añadido ningún contacto de confianza — añade uno para que esto pueda avisar a alguien de verdad.',

  'safety.contactsTitle': 'Contactos de confianza',
  'safety.contactsSubtitle': 'Hasta tres. Solo se les avisa si no contestas.',
  'safety.contactsEmptyTitle': 'Nadie todavía',
  'safety.contactsEmptyBody':
    'Elige gente que de verdad cogería el teléfono a las 3 de la mañana. No saben que están en la lista hasta que pasa algo.',
  'safety.removeContact': 'Quitar a {name}',
  'safety.contactName': 'Nombre',
  'safety.contactPhone': 'Teléfono',
  'safety.addContact': 'Añadir contacto',
  'safety.threeMax': 'Tres es el máximo.',
  'safety.sharingUntil': 'Se comparte con tu noche hasta las {time}.',
  'safety.stopSharing': 'Dejar de compartir',
  'safety.shareNeedsNight': 'Empieza una noche primero — tu ubicación se comparte con la gente con la que sales.',
} satisfies Record<string, Message>;
