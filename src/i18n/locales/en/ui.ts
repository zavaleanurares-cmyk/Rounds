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
  'ui.selected': 'selected',
  'ui.nice': 'Nice',
  'ui.achievement': 'Achievement',
  'ui.level': 'Level {level}',
  'ui.levelProgress': 'Level {level}, {into} of {span} to the next',
  'ui.people': {
    one: '{count} person',
    other: '{count} people',
  },
} satisfies Record<string, Message>;
