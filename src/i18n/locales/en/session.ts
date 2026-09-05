import type { Message } from '../../types';

/** T-06…T-09 · Starting a night, the night itself, editing it and ending it. */
export const session = {
  // T-06 · start night
  'session.startTitle': 'Start the night',
  'session.start': 'Start',
  'session.nameLabel': 'Name it (optional)',
  'session.namePlaceholder': 'Friday, properly',
  'session.startingAt': 'STARTING AT',
  'session.searchVenue': 'Search…',
  'session.whoCanSeeIt': 'WHO CAN SEE IT',
  'session.visibilityLabel': 'Visibility',
  'session.visibilityPrivate': 'Private',
  'session.visibilityFriends': 'Friends',
  'session.visibilityCrew': 'Crew',
  'session.visibilityLink': 'Link',
  'session.visibilityPrivateNote': 'Nobody sees this night, and no join code is created.',
  'session.visibilitySharedNote':
    'A join code is created so people can scan in. It expires when the night ends.',
  'session.tellTheCrew': 'Tell the crew',
  'session.crewNotified': '{crew} gets a notification',
  'session.crewsNotified': 'Your crews get a notification',

  // T-08 · night detail
  'session.nightTitle': 'Night',
  'session.notFoundTitle': 'Not found',
  'session.notFoundBody': "That night isn't on this device.",
  'session.aNightOut': 'A night out',
  'session.nightDate': '{weekday} {date}',
  'session.shareLabel': 'Share this night',
  'session.shareMessage': {
    one: '{place} · {duration} · {count} venue',
    other: '{place} · {duration} · {count} venues',
  },
  'session.outFor': 'Out for',
  'session.drinks': 'Drinks',
  // The unit word itself comes from the profile's unit system, not from here.
  'session.unitsCaption': '{units} {unit}',
  'session.water': 'Water',
  'session.spend': 'Spend',
  'session.viewLabel': 'View',
  'session.tabTimeline': 'Timeline',
  'session.tabPace': 'Pace curve',
  'session.timelineEmpty': 'Nothing was logged on this night.',
  'session.logRowLabel': '{drink} at {time}',
  'session.paceHeader': 'PACE THROUGH THE NIGHT',
  'session.paceNote': 'Shape only. Pacing estimate — never use it to decide whether to drive.',
  'session.whoWasThere': 'WHO WAS THERE',
  'session.editNight': 'Edit this night',
  'session.makePrivateLabel': 'Make this night private',
  'session.makePrivateHint': 'Takes effect immediately',
  'session.makePrivate': 'Make this private',
  'session.isPrivate': 'This night is private. Nobody else can see it.',

  // T-09 · edit night
  'session.editNightTitle': 'Edit night',
  'session.notFoundShort': 'Not found.',
  'session.editNightSubtitle': 'Fixing it here fixes every number that comes from it.',
  'session.moveEarlier': 'Move {drink} half an hour earlier',
  'session.minus30': '−30m',
  'session.removeDrink': 'Remove {drink}',
  'session.editEmpty': 'Nothing logged on this night yet.',
  'session.addADrink': 'ADD A DRINK',
  'session.addMissedDrink': 'Add a drink I missed',

  // T-07 · end night
  'session.alreadyEnded': 'That night has already ended.',
  'session.endTitle': 'End the night',
  'session.endIt': 'End it',
  'session.howWasIt': 'HOW WAS IT',
  'session.gotHomeSafe': 'Did you get home safe?',
  'session.anythingForgot': 'Anything you forgot?',
  'session.gapsBody': {
    one: "You were out a while and logged {count} drink. You can fill the gaps now, or in the morning when it's easier.",
    other: "You were out a while and logged only {count} drinks. You can fill the gaps now, or in the morning when it's easier.",
  },
  'session.doItInMorning': "I'll do it in the morning",
} satisfies Record<string, Message>;
