import type { Message } from '../../types';

export const morning = {
  'morning.notFoundTitle': 'Nada que mostrar',
  'morning.notFoundBody': 'Esa noche no está en este dispositivo.',
  'morning.header': 'TU MAÑANA',

  // card 1 · last night
  'morning.lastNight': 'Anoche',
  // Making the noche the subject keeps the line from having to agree with the
  // reader's gender, and keeps the same order as the English.
  'morning.outAcross': {
    one: 'Tu noche ha durado {duration}, en {count} sitio.',
    other: 'Tu noche ha durado {duration}, en {count} sitios.',
  },
  // Appended to the line above, so it starts as its own short sentence.
  'morning.homeAt': 'En casa a las {time}.',

  // card 2 · fill the gaps
  'morning.fillTheGaps': 'RELLENA LOS HUECOS',
  'morning.gapsHeadline': {
    one: 'Tu noche ha durado {duration} y has apuntado {count} copa.',
    other: 'Tu noche ha durado {duration} y has apuntado {count} copas.',
  },
  // Both hedges of the English — "roughly" and "probably" — are kept.
  'morning.gapsBody': {
    one: 'Más o menos {count} copa seguramente no se ha apuntado. Añadirla ahora es lo que mantiene honesto cada número que venga después.',
    other:
      'Más o menos {count} copas seguramente no se han apuntado. Añadirlas ahora es lo que mantiene honesto cada número que venga después.',
  },
  'morning.addN': { one: '+{count}', other: '+{count}' },
  'morning.nothingMore': 'Nada más',
  'morning.letMeAddThem': 'Las añado yo',
  'morning.addedConfirm': {
    one: '{count} copa añadida. Tu ritmo, tu gasto y tus rachas ya se han actualizado.',
    other: '{count} copas añadidas. Tu ritmo, tu gasto y tus rachas ya se han actualizado.',
  },

  // card 3 · how do you feel, against the forecast
  'morning.howDoYouFeel': 'CÓMO TE SIENTES',
  'morning.weGuessed':
    'Habíamos dicho «{band}». Cada vez que respondes, la estimación se acerca más a ti en concreto.',
  // The forecast bands, as they read inside that sentence. Same words as
  // stats.bandFine / bandTender / bandRough.
  'morning.bandFine': 'bien',
  'morning.bandTender': 'tocado',
  'morning.bandRough': 'fatal',

  // card 4 · numbers
  'morning.drinks': 'Copas',
  'morning.water': 'Agua',
  'morning.spend': 'Gasto',
  'morning.home': 'En casa',

  // card 5 · exactly one next line
  'morning.noWaterNote':
    'Anoche no has apuntado agua — un vaso de agua entre rondas es lo único que cambia cómo te levantas.',
  'morning.dryNightsNote':
    'Dos noches sin alcohol esta semana te devolverían por debajo de tu objetivo semanal.',

  'morning.seeTheFullNight': 'Ver la noche entera',
} satisfies Record<string, Message>;
