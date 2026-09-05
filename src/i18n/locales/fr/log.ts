import type { Message } from '../../types';

export const log = {
  // L-01 · log sheet — read at 1am, so every chip and button stays short.
  'log.title': 'Noter un verre',
  // Quotes the chip in tonight.quickSameAgain — the two must stay spelled the
  // same way.
  'log.sameAgain': 'La même · {drink}',
  'log.sameAgainHint': 'Note le même verre que la dernière fois, tout de suite',
  'log.logWater': "Noter de l'eau",
  // The drink name can be any gender, so the participle never sits after it.
  'log.drinkLogged': 'Noté : {drink}',
  // Three drinks that are actually in the catalogue, picked so a French reader
  // recognises at least one on sight.
  'log.searchPlaceholder': 'Negroni, IPA, limoncello…',
  'log.searchLabel': 'Rechercher des verres',
  'log.clearSearch': 'Effacer la recherche',
  // Same wording as discover.noResults.
  'log.noResults': "Rien qui s'appelle « {query} ».",
  'log.addCustom': "L'ajouter comme verre perso",
  'log.drinkMeta': '{volume}ml · {abv}% · {units}',
  // A screen-reader hint, so the symbols are spelled out — the same way
  // stats.drinkSpec spells them.
  'log.drinkHint': '{volume} millilitres à {abv} pour cent, {units}',
  // Same word as discover.usualLabel.
  'log.yourUsual': 'TON HABITUEL',
  'log.popularAt': 'POPULAIRES À {venue}',
  'log.sizeAndPrice': 'TAILLE & PRIX',
  'log.sizeLabel': 'Taille',
  'log.sizeSmall': 'Petit',
  'log.sizeRegular': 'Normal',
  'log.sizeLarge': 'Grand',
  'log.priceOptional': 'Prix (optionnel)',
  'log.priceLabel': 'Prix',
  'log.timeLabel': "Heure : {time}. Appuie pour reculer d'une demi-heure.",
  'log.browse': 'PARCOURIR',
  'log.somethingElse': 'Autre chose',
  // Same verb as common.achRoundBuyerHint — on paie une tournée.
  'log.buyingARound': 'Payer une tournée',
  'log.savedLocally': "Enregistré d'abord sur ce téléphone. Rien ici n'attend le réseau.",

  // L-02 · custom drink
  'log.logIt': 'Noter',
  'log.nameLabel': 'Nom',
  'log.namePlaceholder': 'Cidre, 0,5',
  'log.categoryLabel': 'Catégorie',
  // Four segments in one row, so these are the singular short forms, not the
  // section headers in common.category*.
  'log.categoryBeer': 'Bière',
  'log.categoryWine': 'Vin',
  'log.categorySpirit': 'Spiritueux',
  'log.categoryCocktail': 'Cocktail',
  'log.volumeLabel': 'Volume (ml)',
  // "ABV" is an English abbreviation; a French label says the strength.
  'log.abvLabel': 'Alcool (%)',
  'log.customUnits': "{units} · {grams} g d'alcool",

  // L-03 · round builder
  'log.roundSubtitle': 'Ça note le tien maintenant, ça demande aux autres.',
  // Both forms are the same string, as in English — nothing here agrees with
  // the count.
  'log.roundAction': {
    one: 'Note le mien · demande à {count}',
    other: 'Note le mien · demande à {count}',
  },
  // "{count} prévenus" would gender the group; naming the people keeps it
  // neutral, and "personne" is feminine whoever it is.
  'log.roundLogged': {
    one: 'Noté : {drink}, {count} personne prévenue',
    other: 'Noté : {drink}, {count} personnes prévenues',
  },
  'log.what': 'QUOI',
  'log.whosInIt': 'QUI EST DEDANS',
  'log.noFriends': "Ajoute d'abord des amis et ils apparaîtront ici.",

  // L-04 · edit log
  // Same word as plan.notFoundTitle — "introuvable" is invariable, so it works
  // for un verre, un plan et un lieu.
  'log.notFoundTitle': 'Introuvable',
  'log.notFoundBody': "Ce verre n'existe plus.",
  'log.editTitle': 'Modifier',
  'log.loggedAt': 'Noté à {time}',
  'log.deleteLog': 'Supprimer ce verre',
  'log.logRemoved': 'Verre supprimé',
  'log.drinkSection': 'VERRE',
  'log.timeSection': 'HEURE',
  'log.asLogged': 'Comme noté',
  // A bare offset on a chip — no noun to agree with, so both forms match. The
  // minus is U+2212, as in English.
  'log.minusMinutes': { one: '−{count}min', other: '−{count}min' },
} satisfies Record<string, Message>;
