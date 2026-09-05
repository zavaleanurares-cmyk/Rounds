import type { Message } from '../../types';

/** L-01…L-04 · The log sheet, the custom drink, the round builder and the log editor. */
export const log = {
  // L-01 · log sheet
  'log.title': 'Log a drink',
  'log.sameAgain': 'Same again · {drink}',
  'log.sameAgainHint': 'Logs the same drink as last time, immediately',
  'log.logWater': 'Log water',
  'log.drinkLogged': '{drink} logged',
  'log.searchPlaceholder': 'Negroni, IPA, pălincă…',
  'log.searchLabel': 'Search drinks',
  'log.clearSearch': 'Clear search',
  'log.noResults': 'Nothing called "{query}".',
  'log.addCustom': 'Add it as a custom drink',
  // Volume and strength read the same way in every language ROUNDS speaks; the
  // separators around them do not, so the whole line is one message.
  'log.drinkMeta': '{volume}ml · {abv}% · {units}',
  'log.drinkHint': '{volume}ml at {abv}%, {units}',
  'log.yourUsual': 'YOUR USUAL',
  'log.popularAt': 'POPULAR AT {venue}',
  'log.sizeAndPrice': 'SIZE & PRICE',
  'log.sizeLabel': 'Size',
  'log.sizeSmall': 'Small',
  'log.sizeRegular': 'Regular',
  'log.sizeLarge': 'Large',
  'log.priceOptional': 'Price (optional)',
  'log.priceLabel': 'Price',
  'log.timeLabel': 'Time: {time}. Tap to move back half an hour.',
  'log.browse': 'BROWSE',
  'log.somethingElse': 'Something else',
  'log.buyingARound': 'Buying a round',
  'log.savedLocally': 'Saved on this phone first. Nothing here waits for a network.',

  // L-02 · custom drink
  'log.logIt': 'Log it',
  'log.nameLabel': 'Name',
  'log.namePlaceholder': 'Cider, 0.5',
  'log.categoryLabel': 'Category',
  'log.categoryBeer': 'Beer',
  'log.categoryWine': 'Wine',
  'log.categorySpirit': 'Spirit',
  'log.categoryCocktail': 'Cocktail',
  'log.volumeLabel': 'Volume (ml)',
  'log.abvLabel': 'ABV (%)',
  'log.customUnits': '{units} · {grams}g of alcohol',

  // L-03 · round builder
  'log.roundSubtitle': 'Logs yours now, asks the others.',
  'log.roundAction': { one: 'Log mine · ask {count}', other: 'Log mine · ask {count}' },
  'log.roundLogged': {
    one: '{drink} logged, {count} asked',
    other: '{drink} logged, {count} asked',
  },
  'log.what': 'WHAT',
  'log.whosInIt': "WHO'S IN IT",
  'log.noFriends': "Add some friends first and they'll show up here.",

  // L-04 · edit log
  'log.notFoundTitle': 'Not found',
  'log.notFoundBody': 'That log is gone.',
  'log.editTitle': 'Edit',
  'log.loggedAt': 'Logged at {time}',
  'log.deleteLog': 'Delete this log',
  'log.logRemoved': 'Log removed',
  'log.drinkSection': 'DRINK',
  'log.timeSection': 'TIME',
  'log.asLogged': 'As logged',
  'log.minusMinutes': { one: '−{count}m', other: '−{count}m' },
} satisfies Record<string, Message>;
