import type { Message } from '../../types';

export const log = {
  // L-01 · log sheet — read at 1am, so every chip and button stays short.
  'log.title': 'Notează o băutură',
  // Quotes the chip in tonight.quickSameAgain — the two must stay spelled the
  // same way.
  'log.sameAgain': 'Încă una · {drink}',
  'log.sameAgainHint': 'Notează aceeași băutură ca data trecută, imediat',
  'log.logWater': 'Notează apă',
  // The drink name can be any gender, so the participle never sits after it —
  // the same construction discover.venueAdded uses.
  'log.drinkLogged': 'Am notat {drink}',
  // Three drinks that are actually in the catalogue. "Țuică" rather than
  // "pălincă" because it is the one more people search for.
  'log.searchPlaceholder': 'Negroni, IPA, țuică…',
  'log.searchLabel': 'Caută băuturi',
  'log.clearSearch': 'Șterge căutarea',
  // Same wording as discover.noResults.
  'log.noResults': 'Nimic cu numele „{query}”.',
  'log.addCustom': 'Adaug-o ca băutură personalizată',
  'log.drinkMeta': '{volume}ml · {abv}% · {units}',
  // A screen-reader hint, so the symbols are spelled out — the same way
  // stats.drinkSpec spells them.
  'log.drinkHint': '{volume} mililitri, {abv} la sută, {units}',
  // Same words as discover.usualLabel.
  'log.yourUsual': 'DE OBICEI',
  'log.popularAt': 'POPULARE LA {venue}',
  'log.sizeAndPrice': 'MĂRIME & PREȚ',
  // Same word as stats.size.
  'log.sizeLabel': 'Mărime',
  'log.sizeSmall': 'Mică',
  'log.sizeRegular': 'Normală',
  'log.sizeLarge': 'Mare',
  'log.priceOptional': 'Preț (opțional)',
  'log.priceLabel': 'Preț',
  'log.timeLabel': 'Ora: {time}. Atinge ca să dai înapoi cu jumătate de oră.',
  'log.browse': 'RĂSFOIEȘTE',
  'log.somethingElse': 'Altceva',
  // Same verb as common.achRoundBuyerHint — faci cinste cu un rând.
  'log.buyingARound': 'Faci cinste cu un rând',
  'log.savedLocally': 'Salvat întâi pe telefonul ăsta. Nimic de aici nu așteaptă rețeaua.',

  // L-02 · custom drink
  'log.logIt': 'Notează',
  'log.nameLabel': 'Nume',
  'log.namePlaceholder': 'Cidru, 0,5',
  'log.categoryLabel': 'Categorie',
  // Four segments in one row, so these are the singular short forms, not the
  // section headers in common.category*.
  'log.categoryBeer': 'Bere',
  'log.categoryWine': 'Vin',
  'log.categorySpirit': 'Tărie',
  'log.categoryCocktail': 'Cocktail',
  'log.volumeLabel': 'Volum (ml)',
  // "ABV" is an English abbreviation; a Romanian label says the strength.
  'log.abvLabel': 'Alcool (%)',
  'log.customUnits': '{units} · {grams} g de alcool',

  // L-03 · round builder
  'log.roundSubtitle': 'Ți-o notează pe a ta acum și îi întreabă pe ceilalți.',
  // Both forms are the same string, as in English — nothing here agrees with
  // the count. First person keeps it inside one line on the button; the
  // imperative "Notează-o pe a mea" does not fit.
  'log.roundAction': {
    one: 'O notez pe a mea · întreb {count}',
    few: 'O notez pe a mea · întreb {count}',
    other: 'O notez pe a mea · întreb {count}',
  },
  // "{count} întrebați" would gender the group; naming the people keeps it
  // neutral — and brings back the "de" above nineteen.
  'log.roundLogged': {
    one: 'Am notat {drink}, am întrebat o persoană',
    few: 'Am notat {drink}, am întrebat {count} persoane',
    other: 'Am notat {drink}, am întrebat {count} de persoane',
  },
  'log.what': 'CE',
  // "Cine e în rând" reads as a queue; the round is what people are being
  // bought a drink for, so the header names them that way.
  'log.whosInIt': 'PENTRU CINE',
  'log.noFriends': 'Adaugă întâi prieteni și o să apară aici.',

  // L-04 · edit log
  // The impersonal form agrees with nothing, so it works for o băutură, un
  // plan și un local alike — the same wording as plan.notFoundTitle.
  'log.notFoundTitle': 'Nu am găsit nimic',
  'log.notFoundBody': 'Băutura aia nu mai există.',
  'log.editTitle': 'Editează',
  // Agrees with băutura, the thing that was logged.
  'log.loggedAt': 'Notată la {time}',
  'log.deleteLog': 'Șterge băutura asta',
  'log.logRemoved': 'Am șters băutura',
  'log.drinkSection': 'BĂUTURA',
  'log.timeSection': 'ORA',
  'log.asLogged': 'Ora notată',
  // A bare offset on a chip — no noun to agree with, so all three forms match.
  // The minus is U+2212, as in English; "min" is what formatDuration uses.
  'log.minusMinutes': {
    one: '−{count}min',
    few: '−{count}min',
    other: '−{count}min',
  },
} satisfies Record<string, Message>;
