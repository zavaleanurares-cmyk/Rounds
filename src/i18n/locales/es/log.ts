import type { Message } from '../../types';

export const log = {
  // L-01 · log sheet — read at 1am, so every chip and button stays short.
  'log.title': 'Apuntar una copa',
  // Quotes the chip in tonight.quickSameAgain — the two must stay spelled the
  // same way.
  'log.sameAgain': 'Otra igual · {drink}',
  'log.sameAgainHint': 'Apunta la misma copa que la última vez, al momento',
  'log.logWater': 'Apuntar agua',
  // The drink name can be any gender, so the participle never sits after it —
  // "Negroni apuntada" would agree with copa and read wrong.
  'log.drinkLogged': 'Apuntado: {drink}',
  // Three drinks that are actually in the catalogue, picked so a Spanish
  // reader recognises at least one on sight.
  'log.searchPlaceholder': 'Negroni, IPA, cava…',
  'log.searchLabel': 'Buscar copas',
  'log.clearSearch': 'Borrar la búsqueda',
  // Same wording as discover.noResults.
  'log.noResults': 'Nada que se llame «{query}».',
  'log.addCustom': 'Añádela como copa personalizada',
  'log.drinkMeta': '{volume}ml · {abv}% · {units}',
  // A screen-reader hint, so the symbols are spelled out — the same way
  // stats.drinkSpec spells them.
  'log.drinkHint': '{volume} mililitros al {abv} por ciento, {units}',
  // Same words as discover.usualLabel.
  'log.yourUsual': 'LO DE SIEMPRE',
  'log.popularAt': 'POPULARES EN {venue}',
  // The ampersand is not idiomatic in Spanish headers, so "y" — the same
  // choice common.categoryBeer makes.
  'log.sizeAndPrice': 'TAMAÑO Y PRECIO',
  // Same word as stats.size.
  'log.sizeLabel': 'Tamaño',
  'log.sizeSmall': 'Pequeña',
  'log.sizeRegular': 'Normal',
  'log.sizeLarge': 'Grande',
  'log.priceOptional': 'Precio (opcional)',
  'log.priceLabel': 'Precio',
  'log.timeLabel': 'Hora: {time}. Toca para retroceder media hora.',
  'log.browse': 'EXPLORAR',
  'log.somethingElse': 'Otra cosa',
  // Same verb as common.achRoundBuyerHint — se paga una ronda.
  'log.buyingARound': 'Pagar una ronda',
  'log.savedLocally': 'Se guarda primero en este teléfono. Aquí nada espera a la red.',

  // L-02 · custom drink
  'log.logIt': 'Apuntar',
  'log.nameLabel': 'Nombre',
  'log.namePlaceholder': 'Sidra, 0,5',
  'log.categoryLabel': 'Categoría',
  // Four segments in one row, so these are the singular short forms, not the
  // section headers in common.category*.
  'log.categoryBeer': 'Cerveza',
  'log.categoryWine': 'Vino',
  'log.categorySpirit': 'Licor',
  'log.categoryCocktail': 'Cóctel',
  'log.volumeLabel': 'Volumen (ml)',
  // "ABV" is an English abbreviation; a Spanish label says the strength.
  'log.abvLabel': 'Alcohol (%)',
  'log.customUnits': '{units} · {grams} g de alcohol',

  // L-03 · round builder
  'log.roundSubtitle': 'Apunta la tuya ahora y pregunta a los demás.',
  // Both forms are the same string, as in English — nothing here agrees with
  // the count.
  'log.roundAction': {
    one: 'Apunto la mía · pregunto a {count}',
    other: 'Apunto la mía · pregunto a {count}',
  },
  // "{count} avisados" would gender the group; naming the people keeps it
  // neutral, and "persona" is feminine whoever it is.
  'log.roundLogged': {
    one: 'Apuntado: {drink}, {count} persona avisada',
    other: 'Apuntado: {drink}, {count} personas avisadas',
  },
  'log.what': 'QUÉ',
  // "Quién está en ella" reads oddly next to "ronda"; naming who the round is
  // for is what the list actually is.
  'log.whosInIt': 'PARA QUIÉN',
  'log.noFriends': 'Añade amigos primero y aparecerán aquí.',

  // L-04 · edit log
  // Same wording as plan.notFoundTitle — the impersonal form agrees with
  // nothing, so it works for una copa, un plan y un sitio alike.
  'log.notFoundTitle': 'No se encuentra',
  'log.notFoundBody': 'Esa copa ya no existe.',
  'log.editTitle': 'Editar',
  // Agrees with copa, the thing that was logged.
  'log.loggedAt': 'Apuntada a las {time}',
  'log.deleteLog': 'Borrar esta copa',
  'log.logRemoved': 'Copa borrada',
  'log.drinkSection': 'COPA',
  'log.timeSection': 'HORA',
  'log.asLogged': 'Como se apuntó',
  // A bare offset on a chip — no noun to agree with, so both forms match. The
  // minus is U+2212, as in English; "min" is what formatDuration uses.
  'log.minusMinutes': { one: '−{count}min', other: '−{count}min' },
} satisfies Record<string, Message>;
