import type { Message } from '../../types';

export const morning = {
  'morning.notFoundTitle': 'Rien à montrer',
  'morning.notFoundBody': "Cette soirée n'est pas sur cet appareil.",
  'morning.header': 'TA MATINÉE',

  // card 1 · last night
  'morning.lastNight': 'Hier soir',
  // "Tu es sorti" would agree with the reader's gender. Making the soirée the
  // subject keeps the line neutral and keeps the same order as the English.
  'morning.outAcross': {
    one: 'Ta soirée a duré {duration}, dans {count} lieu.',
    other: 'Ta soirée a duré {duration}, dans {count} lieux.',
  },
  // Appended to the line above, so it starts as its own short sentence.
  'morning.homeAt': 'Chez toi à {time}.',

  // card 2 · fill the gaps
  'morning.fillTheGaps': 'COMBLE LES TROUS',
  'morning.gapsHeadline': {
    one: 'Ta soirée a duré {duration} et tu as noté {count} verre.',
    other: 'Ta soirée a duré {duration} et tu as noté {count} verres.',
  },
  // Both hedges of the English — "roughly" and "probably" — are kept.
  'morning.gapsBody': {
    one: "Environ {count} verre n'a sans doute pas été noté. L'ajouter maintenant, c'est ce qui garde honnête chaque chiffre qui suit.",
    other:
      "Environ {count} verres n'ont sans doute pas été notés. Les ajouter maintenant, c'est ce qui garde honnête chaque chiffre qui suit.",
  },
  'morning.addN': { one: '+{count}', other: '+{count}' },
  'morning.nothingMore': 'Rien de plus',
  'morning.letMeAddThem': 'Je les ajoute',
  'morning.addedConfirm': {
    one: '{count} verre ajouté. Ton rythme, tes dépenses et tes séries sont déjà à jour.',
    other: '{count} verres ajoutés. Ton rythme, tes dépenses et tes séries sont déjà à jour.',
  },

  // card 3 · how do you feel, against the forecast
  'morning.howDoYouFeel': 'COMMENT TU TE SENS',
  'morning.weGuessed':
    "On avait dit « {band} ». Chaque fois que tu réponds, l'estimation se rapproche de toi en particulier.",
  // The forecast bands, as they read inside that sentence. Same words as
  // stats.bandFine / bandTender / bandRough.
  'morning.bandFine': 'bien',
  'morning.bandTender': 'vaseux',
  'morning.bandRough': 'rude',

  // card 4 · numbers
  'morning.drinks': 'Verres',
  'morning.water': 'Eau',
  'morning.spend': 'Dépenses',
  // A tile showing the time you got in, so the label is the arrival, not the place.
  'morning.home': 'Retour',

  // card 5 · exactly one next line
  'morning.noWaterNote':
    "Pas d'eau notée hier soir — un verre d'eau entre deux tournées, c'est la seule chose qui change la façon dont on se réveille.",
  'morning.dryNightsNote':
    'Deux soirées sans alcool cette semaine te remettraient sous ton objectif hebdo.',

  'morning.seeTheFullNight': 'Voir toute la soirée',
} satisfies Record<string, Message>;
