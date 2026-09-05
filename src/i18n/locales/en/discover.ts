import type { Message } from '../../types';

/** D-01 · Map: search, layer chips, the venue peek and the location states. */
export const discover = {
  'discover.searchVenues': 'Search venues',
  'discover.searchPlaceholder': 'Search bars and clubs',
  'discover.filterFriends': 'Friends out',
  'discover.filterBeen': 'Been here',
  'discover.filterOpen': 'Open now',
  'discover.stale': "Showing places you've seen before — we couldn't reach the venue service.",
  'discover.findMe': 'Find me',

  // peek
  'discover.peekMetaDistance': '{meta} · {distance}',
  'discover.startHere': 'Start here',
  'discover.details': 'Details',

  // location denied or unavailable
  'discover.locationOffTitle': 'Location is off',
  'discover.locationOffBody':
    "That's fine — search for the place by name instead. Everything else in ROUNDS works exactly the same.",

  // friends layer
  'discover.outRightNow': 'OUT RIGHT NOW',
  'discover.friendsNearby': '{names} · nearby',
  'discover.approximate': 'Approximate location only, so distances are hidden.',

  // D-02 · Venue detail
  'discover.venueFallbackTitle': 'Venue',
  'discover.venueNotFound': 'Not found',
  'discover.venueNotFoundBody': 'No such venue.',
  'discover.startNightHere': 'Start a night here',
  'discover.notVisitedTitle': "You haven't been here",
  'discover.notVisitedBody':
    'Once you log a night here, this fills in with what you drink, what it costs you, and when you last came.',
  'discover.visits': 'Visits',
  'discover.typicalSpend': 'Typical spend',
  'discover.yourHistoryHere': 'YOUR HISTORY HERE',
  'discover.usualLabel': 'Usual:',
  'discover.lastVisitLabel': 'Last visit:',
  'discover.totalHereLabel': 'Total here:',
  'discover.dateAtTime': '{date}, {time}',
  'discover.whosBeen': "WHO'S BEEN",
  'discover.friendsOnly': 'Friends only. Never strangers.',
  'discover.nightsRecorded': {
    one: '{count} night recorded here.',
    other: '{count} nights recorded here.',
  },

  // D-03 · Venue search
  'discover.findAPlace': 'Find a place',
  'discover.searchLabel': 'Search',
  'discover.searchExamples': 'Enigma, Roots…',
  'discover.noResults': 'Nothing called "{q}" near you.',
  'discover.addItYourself': 'Add it yourself',

  // D-04 · Add a place
  'discover.addPlaceTitle': 'Add a place',
  'discover.addIt': 'Add it',
  'discover.venueName': 'Name',
  'discover.venueArea': 'Area',
  'discover.venueAdded': '{name} added',
  'discover.addPlaceNote': 'Places you add are only visible to you until enough people log there.',
  'discover.whosBeenNobody': "Nobody yet.",
  'discover.whosBeenUnknown': "Can't check right now.",
} satisfies Record<string, Message>;
