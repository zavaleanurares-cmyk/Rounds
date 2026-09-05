import type { Message } from '../../types';

/** D-06…D-08 · Plans: the detail screen, creating one, and the invite. */
export const plan = {
  // D-06 · plan detail
  'plan.title': 'Plan',
  'plan.notFoundTitle': 'Not found',
  'plan.notFoundBody': 'That plan is gone.',
  'plan.detailWhen': '{day} {time}',
  'plan.invite': 'Invite',
  'plan.shareMessage': '{title} — {url}',
  'plan.startTheNight': 'Start the night',
  'plan.areYouIn': 'ARE YOU IN',
  'plan.rsvpLabel': 'RSVP',
  'plan.rsvpIn': 'In',
  'plan.rsvpMaybe': 'Maybe',
  'plan.rsvpOut': 'Out',
  'plan.rsvpNoAnswer': 'No answer',
  'plan.whereOneVote': 'WHERE · ONE VOTE EACH',
  'plan.venueVotesLabel': {
    one: '{name}, {count} vote',
    other: '{name}, {count} votes',
  },
  'plan.whosIn': {
    one: "WHO'S IN · {count}",
    other: "WHO'S IN · {count}",
  },

  // D-07 · create plan
  'plan.newTitle': 'New plan',
  'plan.createIt': 'Create it',
  'plan.whatLabel': 'What is it',
  'plan.whatPlaceholder': 'Friday, properly',
  'plan.when': 'WHEN',
  'plan.tonight': 'Tonight',
  'plan.whereVote': 'WHERE · OR LET THEM VOTE',
  'plan.who': 'WHO',
  'plan.noFriends': 'Add friends first, or share the link once it exists.',

  // D-08 · plan invite
  'plan.shareLink': 'Share the link',
  'plan.aPlan': 'A plan',
  'plan.theyllSee': "THEY'LL SEE",
  'plan.inviteWhen': {
    one: '{day} {time} · {count} in',
    other: '{day} {time} · {count} in',
  },
  'plan.invitePageNote':
    'People without the app get a real page, not a store redirect. They can RSVP from it.',
} satisfies Record<string, Message>;
