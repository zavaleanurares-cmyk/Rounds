import type { Message } from '../../types';

/** Y-04 · Morning after — five cards, read at 10am, in bed. */
export const morning = {
  'morning.notFoundTitle': 'Nothing to show',
  'morning.notFoundBody': "That night isn't on this device.",
  'morning.header': 'YOUR MORNING',

  // card 1 · last night
  'morning.lastNight': 'Last night',
  'morning.outAcross': {
    one: 'You were out {duration} across {count} place.',
    other: 'You were out {duration} across {count} places.',
  },
  'morning.homeAt': 'Home at {time}.',

  // card 2 · fill the gaps
  'morning.fillTheGaps': 'FILL THE GAPS',
  'morning.gapsHeadline': {
    one: 'You were out {duration} for {count} logged drink.',
    other: 'You were out {duration} for {count} logged drinks.',
  },
  'morning.gapsBody': {
    one: "Roughly {count} probably didn't get logged. Adding them now is what keeps every number after this honest.",
    other: "Roughly {count} probably didn't get logged. Adding them now is what keeps every number after this honest.",
  },
  'morning.addN': { one: '+{count}', other: '+{count}' },
  'morning.nothingMore': 'Nothing more',
  'morning.letMeAddThem': 'Let me add them',
  'morning.addedConfirm': {
    one: 'Added {count}. Your pace, spend and streaks have already updated.',
    other: 'Added {count}. Your pace, spend and streaks have already updated.',
  },

  // card 3 · how do you feel, against the forecast
  'morning.howDoYouFeel': 'HOW DO YOU FEEL',
  'morning.weGuessed':
    'We guessed "{band}". Every time you answer this, the guess gets closer to you specifically.',
  // The forecast bands, as they read inside that sentence.
  'morning.bandFine': 'fine',
  'morning.bandTender': 'tender',
  'morning.bandRough': 'rough',

  // card 4 · numbers
  'morning.drinks': 'Drinks',
  'morning.water': 'Water',
  'morning.spend': 'Spend',
  'morning.home': 'Home',

  // card 5 · exactly one next line
  'morning.noWaterNote':
    'No water logged last night — one glass between rounds is the single thing that changes how the morning feels.',
  'morning.dryNightsNote': 'Two dry nights this week would put you back under your weekly goal.',

  'morning.seeTheFullNight': 'See the full night',
} satisfies Record<string, Message>;
