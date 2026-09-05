import type { Message } from '../../types';

export const morning = {
  'morning.notFoundTitle': 'Nimic de arătat',
  'morning.notFoundBody': 'Seara aia nu e pe dispozitivul ăsta.',
  'morning.header': 'DIMINEAȚA TA',

  // card 1 · last night
  'morning.lastNight': 'Aseară',
  // "Ai fost plecat" would agree with the reader's gender. Making the seară the
  // subject keeps the line neutral and keeps the same order as the English.
  'morning.outAcross': {
    one: 'Seara ta a ținut {duration}, într-un singur local.',
    // 0 and 2–19
    few: 'Seara ta a ținut {duration}, în {count} localuri.',
    // 20 and up — takes "de"
    other: 'Seara ta a ținut {duration}, în {count} de localuri.',
  },
  // Appended to the line above, so it starts as its own short sentence.
  'morning.homeAt': 'Acasă la {time}.',

  // card 2 · fill the gaps
  'morning.fillTheGaps': 'COMPLETEAZĂ GOLURILE',
  'morning.gapsHeadline': {
    one: 'Seara a ținut {duration} și ai notat o singură băutură.',
    few: 'Seara a ținut {duration} și ai notat {count} băuturi.',
    other: 'Seara a ținut {duration} și ai notat {count} de băuturi.',
  },
  // Both hedges of the English — "roughly" and "probably" — are kept.
  'morning.gapsBody': {
    one: 'Cam o băutură probabil nu a fost notată. Dacă o adaugi acum, fiecare cifră de după rămâne corectă.',
    few: 'Cam {count} băuturi probabil nu au fost notate. Dacă le adaugi acum, fiecare cifră de după rămâne corectă.',
    other:
      'Cam {count} de băuturi probabil nu au fost notate. Dacă le adaugi acum, fiecare cifră de după rămâne corectă.',
  },
  // A bare number on a chip — no noun to agree with, so all three forms match.
  'morning.addN': { one: '+{count}', few: '+{count}', other: '+{count}' },
  'morning.nothingMore': 'Nimic în plus',
  'morning.letMeAddThem': 'Le adaug eu',
  'morning.addedConfirm': {
    one: 'O băutură adăugată. Ritmul, cheltuielile și seriile tale s-au actualizat deja.',
    few: '{count} băuturi adăugate. Ritmul, cheltuielile și seriile tale s-au actualizat deja.',
    other: '{count} de băuturi adăugate. Ritmul, cheltuielile și seriile tale s-au actualizat deja.',
  },

  // card 3 · how do you feel, against the forecast
  'morning.howDoYouFeel': 'CUM TE SIMȚI',
  'morning.weGuessed':
    'Noi am zis „{band}”. De fiecare dată când răspunzi, estimarea se apropie mai mult de tine.',
  // The forecast bands, as they read inside that sentence. Same words as
  // stats.bandFine / bandTender / bandRough.
  'morning.bandFine': 'bine',
  'morning.bandTender': 'fragil',
  'morning.bandRough': 'greu',

  // card 4 · numbers
  'morning.drinks': 'Băuturi',
  'morning.water': 'Apă',
  'morning.spend': 'Cheltuieli',
  'morning.home': 'Acasă',

  // card 5 · exactly one next line
  'morning.noWaterNote':
    'Aseară nu ai notat apă — un pahar de apă între rânduri e singurul lucru care schimbă cum e dimineața.',
  'morning.dryNightsNote':
    'Două seri fără alcool săptămâna asta te-ar pune la loc sub obiectivul tău săptămânal.',

  'morning.seeTheFullNight': 'Vezi toată seara',
} satisfies Record<string, Message>;
