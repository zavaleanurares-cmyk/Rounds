import type { Message } from '../../types';

export const discover = {
  'discover.searchVenues': 'Caută localuri',
  'discover.searchPlaceholder': 'Caută baruri și cluburi',
  // The three filter chips. "Deja vizitate" agrees with the localuri it
  // filters, never with the reader.
  'discover.filterFriends': 'Prieteni în oraș',
  'discover.filterBeen': 'Deja vizitate',
  'discover.filterOpen': 'Deschise acum',
  'discover.stale':
    'Arătăm localuri pe care le-ai mai văzut — nu am putut ajunge la serviciul de localuri.',
  'discover.findMe': 'Găsește-mă',

  // peek
  'discover.peekMetaDistance': '{meta} · {distance}',
  'discover.startHere': 'Începe aici',
  'discover.details': 'Detalii',

  // location denied or unavailable
  'discover.locationOffTitle': 'Locația e oprită',
  'discover.locationOffBody':
    'Nicio problemă — caută localul după nume. Tot restul din ROUNDS merge exact la fel.',

  // friends layer
  // Same wording as social.outRightNow — it is the same row of people.
  'discover.outRightNow': 'ÎN ORAȘ ACUM',
  'discover.friendsNearby': '{names} · în apropiere',
  'discover.approximate': 'Doar locație aproximativă, așa că distanțele sunt ascunse.',

  // D-02 · Venue detail
  'discover.venueFallbackTitle': 'Local',
  // The impersonal form agrees with nothing, so it works for un local, un plan
  // și o gașcă.
  'discover.venueNotFound': 'Nu am găsit nimic',
  'discover.venueNotFoundBody': 'Nu există localul ăsta.',
  'discover.startNightHere': 'Începe o seară aici',
  'discover.notVisitedTitle': 'N-ai fost aici',
  'discover.notVisitedBody':
    'După ce notezi o seară aici, se completează cu ce bei, cât te costă și ultima ta vizită.',
  'discover.visits': 'Vizite',
  'discover.typicalSpend': 'Cheltuiala obișnuită',
  'discover.yourHistoryHere': 'ISTORICUL TĂU AICI',
  'discover.usualLabel': 'De obicei:',
  'discover.lastVisitLabel': 'Ultima vizită:',
  'discover.totalHereLabel': 'Total aici:',
  'discover.dateAtTime': '{date}, {time}',
  'discover.whosBeen': 'CINE A FOST',
  'discover.friendsOnly': 'Doar prieteni. Niciodată necunoscuți.',
  'discover.nightsRecorded': {
    one: 'o seară înregistrată aici.',
    // 0 and 2–19
    few: '{count} seri înregistrate aici.',
    // 20 and up — takes "de"
    other: '{count} de seri înregistrate aici.',
  },

  // D-03 · Venue search
  'discover.findAPlace': 'Găsește un local',
  'discover.searchLabel': 'Caută',
  'discover.searchExamples': 'Enigma, Roots…',
  'discover.noResults': 'Nimic cu numele „{q}” pe lângă tine.',
  'discover.addItYourself': 'Adaugă-l tu',

  // D-04 · Add a place
  'discover.addPlaceTitle': 'Adaugă un local',
  'discover.addIt': 'Adaugă-l',
  'discover.venueName': 'Nume',
  'discover.venueArea': 'Zonă',
  'discover.venueAdded': 'Am adăugat {name}',
  'discover.addPlaceNote':
    'Localurile pe care le adaugi se văd doar de tine, până când notează destui oameni acolo.',
  'discover.whosBeenNobody': "Încă nimeni.",
  'discover.whosBeenUnknown': "Nu putem verifica acum.",
} satisfies Record<string, Message>;
