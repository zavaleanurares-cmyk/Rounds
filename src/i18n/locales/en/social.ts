import type { Message } from '../../types';

/** C-01 · Circle: friends, crews, requests and the invite code. */
export const social = {
  'social.title': 'Circle',
  'social.notifications': 'Notifications',

  // night one
  'social.emptyTitle': 'Nobody here yet',
  'social.emptyBody':
    'ROUNDS is better with the people you actually go out with. Find them by username, or match your contacts — numbers are hashed on your phone and never sent.',
  'social.findPeople': 'Find people',
  'social.yourCode': 'YOUR CODE',
  'social.handle': '@{username}',
  'social.usernameFallback': 'you',
  'social.shareIt': 'Share it',
  'social.shareMessage': 'Add me on ROUNDS: @{username}',

  // the list
  'social.friendRequests': {
    one: '{count} friend request',
    other: '{count} friend requests',
  },
  'social.outRightNow': 'OUT RIGHT NOW',
  'social.outNowLabel': '{name}, out right now',
  'social.outNow': 'out now',
  'social.crews': 'CREWS',
  'social.makeCrew': 'Make a crew',
  'social.friendsHeader': {
    one: 'FRIENDS · {count}',
    other: 'FRIENDS · {count}',
  },
  'social.nightsTogether': {
    one: '{count} night together',
    other: '{count} nights together',
  },
  'social.noNightsTogether': 'no nights together yet',
  'social.joinNight': 'Join a night',

  // C-02 · find people
  'social.username': 'Username',
  'social.usernamePlaceholder': 'anam',
  'social.rateLimited': "You've sent a lot of requests today. Try again tomorrow.",
  'social.handleCrews': '@{username} · {crews}',
  'social.add': 'Add',
  'social.requestSent': 'Sent',
  'social.noResults': 'No one with that username.',
  'social.matchContacts': 'Match my contacts',

  // C-03 · person profile
  'social.profileTitle': 'Profile',
  'social.personUnavailableTitle': 'Not available',
  'social.personUnavailableBody': "This person isn't visible to you.",
  'social.handleLevel': '@{username} · level {level}',
  'social.addFriend': 'Add friend',
  'social.removeFriend': 'Remove friend',
  'social.block': 'Block',
  'social.unblock': 'Unblock',
  'social.report': 'Report',
  'social.blockConfirmTitle': 'Block {name}?',
  'social.blockConfirmBody':
    "They won't be able to find you, see your nights, or appear anywhere in your app. They aren't told.",
  'social.nightsTogetherLabel': 'Nights together',
  'social.mutualCrews': 'Mutual crews',
  'social.whatYouDontSee': "WHAT YOU DON'T SEE HERE",
  'social.whatYouDontSeeBody':
    'How much they drink, their streaks, or any comparison with you. ROUNDS never ranks people on anything countable about alcohol.',

  // C-04 · contact match
  'social.contactsTitle': 'Find friends from contacts',
  'social.contactsPrivacy':
    "Your phone numbers are hashed on this device before anything is sent. The raw numbers never leave your phone, and we don't store your contact list.",
  'social.contactsNone': 'Nobody in your contacts is on ROUNDS yet.',

  // C-09 · crew detail
  'social.crewTitle': 'Crew',
  'social.crewNotFoundTitle': 'Not found',
  'social.crewNotFoundBody': 'No crew with that name.',
  'social.planSomething': 'Plan something',
  'social.plans': 'PLANS',
  'social.crewNoPlans': 'Nothing in the calendar. A crew without a plan in it is just a group chat.',
  'social.crewPlanWhen': '{day} {time}',
  'social.together': 'TOGETHER',
  'social.togetherNote': 'Nights out together, places explored, quests done. Never drinks.',
  'social.you': 'You',
  'social.boardPlaces': { one: '{count} place', other: '{count} places' },
  'social.boardRow': {
    one: '{count} night · {places}',
    other: '{count} nights · {places}',
  },
  'social.members': 'MEMBERS',

  // C-10 · create crew
  'social.newCrewTitle': 'New crew',
  'social.create': 'Create',
  'social.crewCreated': '{name} created',
  'social.crewNameLabel': 'Name',
  'social.crewNamePlaceholder': 'Vineri',
  'social.mark': 'MARK',
  'social.colour': 'COLOUR',
  'social.colourIndex': 'Colour {index}',

  // C-11 · join crew
  'social.joinCrewTitle': 'Join a crew',
  'social.join': 'Join',
  'social.joinCrewUnknown': 'No crew with that code. Check it with whoever sent it.',
  'social.joinedCrew': "You're in {name}",
  'social.crewCodeLabel': 'Crew code or link',
  'social.crewCodeHint': 'Whoever runs the crew can send you one from the crew screen.',

  // C-12 · friend requests
  'social.requestsTitle': 'Requests',
  'social.requestsEmptyTitle': 'Nothing waiting',
  'social.requestsEmptyBody':
    'Friend requests show up here, both the ones you get and the ones you send.',
  'social.incoming': 'INCOMING',
  'social.accept': 'Accept',
  'social.decline': 'No',
  'social.sentHeader': 'SENT',

  // Y-02 · what friends see
  'social.previewTitle': 'What friends see',
  'social.previewSubtitle': 'Your profile, from the other side.',
  'social.perPerson': 'per person',
  'social.whatTheyCannotSee': 'WHAT THEY CANNOT SEE',
  'social.bulletLine': '· {line}',
  'social.cannotSeeVolume': 'How much you drink, ever',
  'social.cannotSeePace': 'Your pace, your estimate, your pace curve',
  'social.cannotSeeSpend': 'Your spend, your goals, your streaks',
  'social.cannotSeeNights': {
    one: 'Any of your {count} night unless they were there or you shared it',
    other: 'Any of your {count} nights unless they were there or you shared it',
  },
  'social.cannotSeeBody': 'Your body basics, your date of birth, your location',
  'social.notABenchmark': 'A friend is not a benchmark. There is nothing here to compare.',
  'social.leaveCrew': 'Leave this crew',
  'social.leaveCrewTitle': 'Leave {name}?',
  'social.leaveCrewBody': 'You stop seeing its plans. The crew carries on for everybody else, and you can be added back.',
  'social.contactsRefused': 'No problem — ROUNDS cannot read your contacts without permission. You can still add people by handle.',
  'social.beFindable': 'BE FINDABLE',
  'social.beFindableBody': 'Separate on purpose. Looking your friends up does not make you findable to everyone who has your number.',
  'social.yourNumber': 'Your number',
  'social.numberHint': 'Hashed on this phone. The number itself is never sent and never stored.',
  'social.findableSaved': 'Saved. People with your number can find you.',
  'social.makeFindable': 'Make me findable',
  'social.numberPlaceholder': '+40 700 000 000',

  // a friend request the server declined
  'social.requestSelf': "That's you.",
  'social.searchOffline': "Can't search right now. Check your connection.",
} satisfies Record<string, Message>;
