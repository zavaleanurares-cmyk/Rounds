import type { Message } from '../../types';

/**
 * Y-10 · Get home safe, plus S-09 trusted contacts and S-10 the armed check-in.
 *
 * This is the copy a person reads when something has gone wrong, so every
 * sentence here is a whole sentence: nothing is assembled from fragments, and
 * the escalation wording is one message rather than a count glued to a noun.
 */
export const safety = {
  // Y-10 · Get home safe
  'safety.title': 'Get home safe',
  'safety.checkInArmed': 'CHECK-IN ARMED',
  'safety.dueNow': 'due now',
  'safety.armedIntro': "If you don't check in, we'll ask you first.",
  'safety.armedEscalation': {
    one: 'Fifteen minutes later, {count} trusted contact gets your message and your last venue.',
    other: 'Fifteen minutes later, {count} trusted contacts get your message and your last venue.',
  },
  'safety.armedEscalationNoContacts':
    'Fifteen minutes later, your trusted contacts get your message and your last venue.',
  'safety.imHomeSafe': "I'm home safe",
  'safety.anotherHour': 'Give me another hour',
  'safety.nothingArmed': 'Nothing armed',
  'safety.nothingArmedBody':
    "Set a time you expect to be home. If you don't check in by then, we ask you before we ask anyone else — and you can always see the exact message first.",
  'safety.armCheckIn': 'Arm a check-in',
  'safety.rideHome': 'Ride home',
  'safety.walkIt': 'Walk it',
  'safety.checkOnMe': 'Check on me',
  'safety.shareLocation': 'SHARE MY LOCATION',
  'safety.shareLocationBody': 'Timed, with your trusted contacts only. It stops on its own.',
  'safety.hours': { one: '{count}h', other: '{count}h' },
  'safety.callEmergencyTitle': 'Call {number}?',
  'safety.callEmergencyBody': 'This dials emergency services.',
  'safety.callEmergencyConfirm': 'Call {number}',
  'safety.callEmergencyLabel': 'Call emergency services, {number}',
  'safety.emergency': 'Emergency · {number}',
  'safety.freeForever':
    'Everything on this screen is free, always. ROUNDS never puts a subscription in front of it.',

  // S-10 · Arm a check-in
  'safety.when': 'WHEN',
  'safety.checkOnMeIn': { one: 'Check on me in {count}h', other: 'Check on me in {count}h' },
  'safety.messageLabel': "What they'd be sent",
  'safety.messageDefault':
    "{name} asked ROUNDS to check they got home and hasn't answered. Last seen out tonight.",
  'safety.messageDefaultNoName':
    "Your friend asked ROUNDS to check they got home and hasn't answered. Last seen out tonight.",
  'safety.gracePeriod': 'At the deadline you get a notification with a fifteen-minute grace period.',
  'safety.onlyThenNamed': 'Only if that goes unanswered do {names} hear anything.',
  'safety.onlyThen': 'Only if that goes unanswered do your trusted contacts hear anything.',
  'safety.noContactsWarning':
    "You haven't added any trusted contacts yet — add one so this can actually reach someone.",

  // S-09 · Trusted contacts
  'safety.contactsTitle': 'Trusted contacts',
  'safety.contactsSubtitle': "Up to three. They're only contacted if you don't answer.",
  'safety.contactsEmptyTitle': 'Nobody yet',
  'safety.contactsEmptyBody':
    "Pick people who'd actually pick up at 3am. They aren't told they're on the list until something happens.",
  'safety.removeContact': 'Remove {name}',
  'safety.contactName': 'Name',
  'safety.contactPhone': 'Phone',
  'safety.addContact': 'Add contact',
  'safety.threeMax': 'Three is the maximum.',
} satisfies Record<string, Message>;
