import type { Message } from '../../types';

/** C-05…C-07 · Joining a night, the live room, and night bingo. */
export const live = {
  // C-05 · join a night
  'live.joinTitle': 'Join a night',
  'live.joinSubtitle': "Point the camera at the host's code.",
  'live.join': 'Join',
  'live.unknownCode': "We don't know that code. Check it against the host's screen.",
  'live.nightEnded': 'That night has already ended.',
  'live.cameraDenied': 'Camera access is off. Type the code below instead — it works just as well.',
  'live.cameraAsking': 'Asking for the camera…',
  'live.codeLabel': 'Or type the 8-character code',
  'live.codePlaceholder': 'ABCD1234',
  'live.codeHint': 'The host finds it on their Tonight screen.',
  'live.signInNote': "You'll sign in once — everything else can wait until tomorrow.",

  // C-06 · live room
  'live.title': 'Live',
  'live.overTitle': "That night's over",
  'live.overBody': 'The code expired when the host ended the night.',
  'live.codeLine': 'code {code}',
  'live.shareCode': 'Share the code',
  'live.shareMessage': 'Join my night on ROUNDS: {code}',
  'live.hereHeader': {
    one: 'LIVE · {count} HERE',
    other: 'LIVE · {count} HERE',
  },
  'live.reconnecting': 'reconnecting',
  'live.you': 'You',
  'live.drinksLogged': { one: '{count} logged', other: '{count} logged' },
  'live.rosterLabel': {
    one: '{name}, pace {state}, {count} drink',
    other: '{name}, pace {state}, {count} drinks',
  },
  'live.whereEveryoneIs': 'WHERE EVERYONE IS',
  'live.locationOn': 'Sharing with this night only. Stops automatically when the night ends.',
  'live.locationOff': 'Off. Nobody in this night can see where you are.',
  'live.stopSharingLocation': 'Stop sharing my location',
  'live.shareLocation': 'Share my location with this night',
  'live.chat': 'CHAT',
  'live.chatPlaceholder': 'Say something',
  'live.send': 'Send',
  // Whoever posted it, when this device does not yet know their name — a
  // friend of a friend in the same night. Never a raw user id on screen.
  'live.someone': 'Someone',
  'live.partyMode': 'Party mode: night bingo',

  // C-07 · night bingo
  'live.bingoTitle': 'Night bingo',
  'live.bingoSubtitle': 'Nothing here counts drinks.',
  'live.bingoJacket': 'Someone loses a jacket',
  'live.bingoRound': 'Round nobody remembers buying',
  'live.bingoDj': 'The DJ plays it',
  'live.bingoPhoto': 'Group photo attempt #3',
  'live.bingoOneMore': 'Someone says "one more"',
  'live.bingoTaxi': 'Taxi debate',
  'live.bingoKebab': 'Kebab decision',
  'live.bingoBattery': 'Phone at 4%',
  'live.bingoSmoking': 'Ana finds the smoking area',
  'live.bingoProgress': { one: '{count} of {total}', other: '{count} of {total}' },
  'live.leaveNight': 'Leave this night',
  'live.leaveNightTitle': 'Leave the night?',
  'live.leaveNightBody': 'It carries on without you and what you logged stays yours. You can scan back in with the code.',
  'live.hereNow': "Here",
  'live.rosterHereLabel': "{name}, here tonight",
  'live.mapLabel': {
    one: 'Map with {count} person sharing their location',
    other: 'Map with {count} people sharing their location',
  },
  'live.notInvited': "That night isn't open to you.",
  'live.joinOffline': "Can't check that code right now.",
} satisfies Record<string, Message>;
