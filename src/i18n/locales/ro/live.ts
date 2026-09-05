import type { Message } from '../../types';

export const live = {
  // C-05 · join a night
  'live.joinTitle': 'Intră într-o seară',
  // "Gazda" is a feminine noun whoever the host is, so it never genders them.
  'live.joinSubtitle': 'Îndreaptă camera spre codul gazdei.',
  'live.join': 'Intră',
  'live.unknownCode': 'Nu știm codul ăsta. Verifică-l pe ecranul gazdei.',
  'live.nightEnded': 'Seara aia s-a terminat deja.',
  'live.cameraDenied': 'Accesul la cameră e oprit. Scrie codul mai jos — merge la fel de bine.',
  'live.cameraAsking': 'Se cere accesul la cameră…',
  'live.codeLabel': 'Sau scrie codul de 8 caractere',
  'live.codePlaceholder': 'ABCD1234',
  // "Diseară" names the tab, so it keeps its capital.
  'live.codeHint': 'Gazda îl găsește pe ecranul Diseară.',
  'live.signInNote': 'Te conectezi o dată — restul poate aștepta până mâine.',

  // C-06 · live room
  // "Live" is the ordinary Romanian word for this, the same way common.ts
  // keeps "Offline". "În direct" belongs to television.
  'live.title': 'Live',
  'live.overTitle': 'Seara aia s-a terminat',
  'live.overBody': 'Codul a expirat când gazda a încheiat seara.',
  'live.codeLine': 'codul {code}',
  'live.shareCode': 'Trimite codul',
  'live.shareMessage': 'Intră în seara mea pe ROUNDS: {code}',
  'live.hereHeader': {
    one: 'LIVE · {count} AICI',
    few: 'LIVE · {count} AICI',
    other: 'LIVE · {count} AICI',
  },
  'live.reconnecting': 'se reconectează',
  'live.you': 'Tu',
  // A bare "{count} notate" leaves the gender of what was noted hanging, so
  // the noun stays — and with it the "de" above nineteen.
  'live.drinksLogged': {
    one: 'o băutură notată',
    few: '{count} băuturi notate',
    other: '{count} de băuturi notate',
  },
  'live.rosterLabel': {
    one: '{name}, ritm {state}, o băutură',
    few: '{name}, ritm {state}, {count} băuturi',
    other: '{name}, ritm {state}, {count} de băuturi',
  },
  'live.whereEveryoneIs': 'UNDE E FIECARE',
  'live.locationOn': 'Se împarte doar cu seara asta. Se oprește singură când se termină seara.',
  'live.locationOff': 'Oprită. Nimeni din seara asta nu vede unde ești.',
  'live.stopSharingLocation': 'Oprește partajarea locației',
  'live.shareLocation': 'Partajează-mi locația cu seara asta',
  'live.chat': 'CHAT',
  'live.chatPlaceholder': 'Zi ceva',
  'live.send': 'Trimite',
  'live.someone': 'Cineva',
  'live.partyMode': 'Mod petrecere: bingo de seară',

  // C-07 · night bingo
  'live.bingoTitle': 'Bingo de seară',
  'live.bingoSubtitle': 'Nimic de aici nu numără băuturi.',
  'live.bingoJacket': 'Cineva își pierde geaca',
  'live.bingoRound': 'Un rând pe care nimeni nu-și amintește să-l fi plătit',
  'live.bingoDj': 'DJ-ul o pune',
  'live.bingoPhoto': 'Poză de grup, a treia încercare',
  // "Una" agrees with băutură — it is one more drink, not one more of anything.
  'live.bingoOneMore': 'Cineva zice „încă una”',
  'live.bingoTaxi': 'Discuția cu taxiul',
  'live.bingoKebab': 'Decizia cu kebabul',
  'live.bingoBattery': 'Telefonul la 4%',
  'live.bingoSmoking': 'Ana găsește locul de fumat',
  'live.bingoProgress': {
    one: '{count} din {total}',
    few: '{count} din {total}',
    other: '{count} din {total}',
  },
  'live.leaveNight': 'Ieși din seara asta',
  'live.leaveNightTitle': 'Ieși din seară?',
  'live.leaveNightBody': 'Merge mai departe fără tine, iar ce ai notat rămâne al tău. Poți intra înapoi cu codul.',
  'live.hereNow': "Aici",
  'live.rosterHereLabel': "{name}, aici în seara asta",
  'live.mapLabel': {
    one: 'Hartă: {count} persoană își partajează locația',
    few: 'Hartă: {count} persoane își partajează locația',
    other: 'Hartă: {count} de persoane își partajează locația',
  },
} satisfies Record<string, Message>;
