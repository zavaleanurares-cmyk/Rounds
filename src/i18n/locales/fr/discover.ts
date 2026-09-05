import type { Message } from '../../types';

export const discover = {
  'discover.searchVenues': 'Chercher des lieux',
  'discover.searchPlaceholder': 'Cherche des bars et des clubs',
  // The three filter chips. "Déjà visités" agrees with the lieux it filters,
  // never with the reader.
  'discover.filterFriends': 'Amis de sortie',
  'discover.filterBeen': 'Déjà visités',
  'discover.filterOpen': 'Ouverts maintenant',
  'discover.stale':
    "On affiche des lieux que tu as déjà vus — on n'a pas pu joindre le service des lieux.",
  'discover.findMe': 'Me localiser',

  // peek
  'discover.peekMetaDistance': '{meta} · {distance}',
  'discover.startHere': 'Commence ici',
  'discover.details': 'Détails',

  // location denied or unavailable
  'discover.locationOffTitle': 'La position est coupée',
  'discover.locationOffBody':
    'Pas grave — cherche le lieu par son nom à la place. Tout le reste dans ROUNDS marche exactement pareil.',

  // friends layer
  // Same wording as social.outRightNow — it is the same row of people.
  'discover.outRightNow': 'DE SORTIE EN CE MOMENT',
  'discover.friendsNearby': '{names} · à côté',
  'discover.approximate': 'Position approximative seulement, donc les distances sont masquées.',

  // D-02 · Venue detail
  'discover.venueFallbackTitle': 'Lieu',
  'discover.venueNotFound': 'Introuvable',
  'discover.venueNotFoundBody': "Ce lieu n'existe pas.",
  'discover.startNightHere': 'Commence une soirée ici',
  // The participle of être is invariable, so this does not gender the reader.
  'discover.notVisitedTitle': "Tu n'as jamais été ici",
  'discover.notVisitedBody':
    "Dès que tu notes une soirée ici, ça se remplit avec ce que tu bois, ce que ça te coûte et ta dernière visite.",
  'discover.visits': 'Visites',
  'discover.typicalSpend': 'Dépense habituelle',
  'discover.yourHistoryHere': 'TON HISTORIQUE ICI',
  'discover.usualLabel': 'Habituel :',
  'discover.lastVisitLabel': 'Dernière visite :',
  'discover.totalHereLabel': 'Total ici :',
  'discover.dateAtTime': '{date}, {time}',
  'discover.whosBeen': 'QUI Y A ÉTÉ',
  'discover.friendsOnly': 'Seulement des amis. Jamais des inconnus.',
  'discover.nightsRecorded': {
    // French counts zero as singular, so "one" also covers 0.
    one: '{count} soirée enregistrée ici.',
    other: '{count} soirées enregistrées ici.',
  },

  // D-03 · Venue search
  'discover.findAPlace': 'Trouve un lieu',
  'discover.searchLabel': 'Recherche',
  'discover.searchExamples': 'Enigma, Roots…',
  'discover.noResults': "Rien qui s'appelle « {q} » près de toi.",
  'discover.addItYourself': 'Ajoute-le toi-même',

  // D-04 · Add a place
  'discover.addPlaceTitle': 'Ajouter un lieu',
  'discover.addIt': 'Ajoute-le',
  'discover.venueName': 'Nom',
  'discover.venueArea': 'Quartier',
  'discover.venueAdded': '{name} ajouté',
  'discover.addPlaceNote':
    "Les lieux que tu ajoutes ne sont visibles que par toi, jusqu'à ce qu'assez de gens y notent quelque chose.",
  'discover.whosBeenNobody': "Personne pour l’instant.",
  'discover.whosBeenUnknown': "Impossible de vérifier maintenant.",
} satisfies Record<string, Message>;
