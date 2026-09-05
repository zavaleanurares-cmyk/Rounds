import type { Message } from '../../types';

export const discover = {
  'discover.searchVenues': 'Busca sitios',
  'discover.searchPlaceholder': 'Busca bares y discotecas',
  // The three filter chips. "Ya visitados" agrees with the sitios it filters,
  // never with the reader.
  'discover.filterFriends': 'Amigos de marcha',
  'discover.filterBeen': 'Ya visitados',
  'discover.filterOpen': 'Abiertos ahora',
  'discover.stale':
    'Mostramos sitios que ya has visto — no hemos podido conectar con el servicio de sitios.',
  'discover.findMe': 'Encuéntrame',

  // peek
  'discover.peekMetaDistance': '{meta} · {distance}',
  'discover.startHere': 'Empieza aquí',
  'discover.details': 'Detalles',

  // location denied or unavailable
  'discover.locationOffTitle': 'La ubicación está desactivada',
  'discover.locationOffBody':
    'No pasa nada — busca el sitio por su nombre. Todo lo demás en ROUNDS funciona igual.',

  // friends layer
  // Same wording as social.outRightNow — it is the same row of people.
  'discover.outRightNow': 'DE MARCHA AHORA MISMO',
  'discover.friendsNearby': '{names} · cerca',
  'discover.approximate': 'Solo ubicación aproximada, así que las distancias están ocultas.',

  // D-02 · Venue detail
  'discover.venueFallbackTitle': 'Sitio',
  // The impersonal form agrees with nothing, so it works for un sitio, un plan
  // y una peña.
  'discover.venueNotFound': 'No se encuentra',
  'discover.venueNotFoundBody': 'Ese sitio no existe.',
  'discover.startNightHere': 'Empieza una noche aquí',
  'discover.notVisitedTitle': 'No has estado aquí',
  'discover.notVisitedBody':
    'En cuanto apuntes una noche aquí, esto se rellena con lo que bebes, lo que te cuesta y tu última visita.',
  'discover.visits': 'Visitas',
  'discover.typicalSpend': 'Gasto habitual',
  'discover.yourHistoryHere': 'TU HISTORIAL AQUÍ',
  'discover.usualLabel': 'Lo de siempre:',
  'discover.lastVisitLabel': 'Última visita:',
  'discover.totalHereLabel': 'Total aquí:',
  'discover.dateAtTime': '{date}, {time}',
  'discover.whosBeen': 'QUIÉN HA ESTADO',
  'discover.friendsOnly': 'Solo amigos. Nunca desconocidos.',
  // "Registrada" is the participle stats.nightsRecorded already uses.
  'discover.nightsRecorded': {
    one: '{count} noche registrada aquí.',
    other: '{count} noches registradas aquí.',
  },

  // D-03 · Venue search
  'discover.findAPlace': 'Busca un sitio',
  'discover.searchLabel': 'Buscar',
  'discover.searchExamples': 'Enigma, Roots…',
  'discover.noResults': 'Nada que se llame «{q}» cerca de ti.',
  'discover.addItYourself': 'Añádelo tú',

  // D-04 · Add a place
  'discover.addPlaceTitle': 'Añadir un sitio',
  'discover.addIt': 'Añádelo',
  'discover.venueName': 'Nombre',
  'discover.venueArea': 'Zona',
  'discover.venueAdded': '{name} añadido',
  'discover.addPlaceNote':
    'Los sitios que añades solo los ves tú, hasta que apunte allí suficiente gente.',
  'discover.whosBeenNobody': "Todavía nadie.",
  'discover.whosBeenUnknown': "No se puede comprobar ahora.",
} satisfies Record<string, Message>;
