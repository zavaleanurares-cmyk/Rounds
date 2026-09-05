import type { Message } from '../../types';

/** Shared components: states, toasts, the scaffold, the pace ring. */
export const ui = {
  'ui.loading': 'Loading',
  'ui.back': 'Back',
  'ui.dismiss': 'Dismiss',
  'ui.close': 'Close',
  'ui.done': 'Done',
  'ui.cancel': 'Cancel',
  'ui.save': 'Save',
  'ui.saving': 'Saving…',
  'ui.undo': 'Undo',
  'ui.retry': 'Try again',
  'ui.errorTitle': "That didn't load",
  'ui.errorBody': "We couldn't reach ROUNDS just now. Your logs are safe on this phone.",
  'ui.offline': 'Offline',
  'ui.offlineWaiting': 'Offline · {count} waiting',
  'ui.offlineLabel': 'Offline',
  'ui.offlineLabelPending': {
    one: 'Offline, {count} log waiting to sync',
    other: 'Offline, {count} logs waiting to sync',
  },
  'ui.settings': 'Settings',
  'ui.share': 'Share',
  'ui.more': 'More',
  'ui.nice': 'Nice',
  'ui.achievement': 'Achievement',
  'ui.level': 'Level {level}',
  'ui.levelProgress': 'Level {level}, {into} of {span} to the next',
  'ui.people': {
    one: '{count} person',
    other: '{count} people',
  },

  // Avatar
  'ui.avatarPhoto': "{name}'s photo",
  'ui.outRightNow': 'out right now',

  // Tile — the label and the figure, read as one thing by a screen reader.
  'ui.tileLabel': '{label}, {value}',

  // The tab bar's raised action.
  'ui.logDrink': 'Log a drink',
  'ui.logDrinkHint': 'Opens the log sheet. One tap logs the same again.',

  // The estimate, beneath the pace ring. Never a hero, always with its note.
  'ui.paceEstimate': 'Estimate ≈ {value}‰',
  'ui.paceEstimateNote': 'Pacing estimate. Never use this to decide whether to drive.',

  // The four moods, on the wind-down and the end-of-night sheet.
  // One set of words for the four moods, used by both the end-of-night sheet
  // and the morning-after screen. They used to disagree — you picked "Tender"
  // in the morning and the same night showed as "Rough" on the end sheet.
  'ui.moodGreat': 'Fine',
  'ui.moodGood': 'Okay',
  'ui.moodRough': 'Tender',
  'ui.moodBad': 'Rough',

  // The five reactions in a live room.
  'ui.reactionCheers': 'Cheers',
  'ui.reactionFire': 'Going off',
  'ui.reactionLaugh': 'Laughing',
  'ui.reactionHeart': 'Love it',
  'ui.reactionEyes': 'Watching',
} satisfies Record<string, Message>;
