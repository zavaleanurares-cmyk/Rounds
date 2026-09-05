import type { Message } from '../../types';

export const live = {
  // C-05 · join a night
  'live.joinTitle': 'Rejoindre une soirée',
  // "L'hôte" is ambiguous in French — it means the guest as often as the host —
  // and "organisateur" would gender the person, so the whole catalogue says
  // "la personne qui organise".
  'live.joinSubtitle': 'Vise le code de la personne qui organise.',
  'live.join': 'Rejoindre',
  'live.unknownCode':
    "On ne connaît pas ce code. Vérifie-le sur l'écran de la personne qui organise.",
  'live.nightEnded': 'Cette soirée est déjà terminée.',
  'live.cameraDenied':
    "L'accès à la caméra est coupé. Tape le code ci-dessous à la place — ça marche aussi bien.",
  'live.cameraAsking': 'Demande de la caméra…',
  'live.codeLabel': 'Ou tape le code à 8 caractères',
  'live.codePlaceholder': 'ABCD1234',
  // "Ce soir" is the tab's own name, so it keeps its capital.
  'live.codeHint': "La personne qui organise le trouve sur son écran Ce soir.",
  'live.signInNote': 'Tu te connectes une fois — tout le reste peut attendre demain.',

  // C-06 · live room
  'live.title': 'En direct',
  'live.overTitle': 'Cette soirée est terminée',
  'live.overBody': 'Le code a expiré quand la personne qui organise a terminé la soirée.',
  'live.codeLine': 'code {code}',
  'live.shareCode': 'Partager le code',
  'live.shareMessage': 'Rejoins ma soirée sur ROUNDS : {code}',
  'live.hereHeader': {
    one: 'EN DIRECT · {count} ICI',
    other: 'EN DIRECT · {count} ICI',
  },
  'live.reconnecting': 'reconnexion',
  'live.you': 'Toi',
  // A roster row, so it stays as short as the English. "Noté" agrees with the
  // verre it elides.
  'live.drinksLogged': { one: '{count} noté', other: '{count} notés' },
  'live.rosterLabel': {
    one: '{name}, rythme {state}, {count} verre',
    other: '{name}, rythme {state}, {count} verres',
  },
  'live.whereEveryoneIs': 'OÙ EST TOUT LE MONDE',
  'live.locationOn':
    "Partagée avec cette soirée seulement. S'arrête toute seule à la fin de la soirée.",
  'live.locationOff': 'Coupée. Personne dans cette soirée ne voit où tu es.',
  'live.stopSharingLocation': 'Arrêter de partager ma position',
  'live.shareLocation': 'Partager ma position avec cette soirée',
  'live.chat': 'CHAT',
  'live.chatPlaceholder': 'Dis un truc',
  'live.send': 'Envoyer',
  // Seeded room chatter, so a room opened cold is not empty.
  'live.sampleMessageOne': 'on est au fond, après le bar',
  'live.sampleMessageTwo': "je commande, quelqu'un veut quelque chose",
  'live.partyMode': 'Mode fête : bingo de soirée',

  // C-07 · night bingo
  'live.bingoTitle': 'Bingo de soirée',
  'live.bingoSubtitle': 'Rien ici ne compte les verres.',
  'live.bingoJacket': "Quelqu'un perd sa veste",
  'live.bingoRound': 'Une tournée que personne ne se rappelle avoir payée',
  'live.bingoDj': 'Le DJ la met',
  'live.bingoPhoto': 'Photo de groupe, 3e tentative',
  'live.bingoOneMore': "Quelqu'un dit « encore un »",
  'live.bingoTaxi': 'Débat sur le taxi',
  'live.bingoKebab': 'Décision kebab',
  'live.bingoBattery': 'Téléphone à 4%',
  'live.bingoSmoking': 'Ana trouve le coin fumeurs',
  'live.bingoProgress': { one: '{count} sur {total}', other: '{count} sur {total}' },
} satisfies Record<string, Message>;
