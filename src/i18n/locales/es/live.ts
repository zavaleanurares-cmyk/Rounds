import type { Message } from '../../types';

export const live = {
  // C-05 · join a night
  'live.joinTitle': 'Únete a una noche',
  // "El anfitrión" would gender the host, so the whole catalogue says "quien
  // organiza".
  'live.joinSubtitle': 'Apunta la cámara al código de quien organiza.',
  'live.join': 'Unirme',
  'live.unknownCode': 'No conocemos ese código. Compruébalo en la pantalla de quien organiza.',
  'live.nightEnded': 'Esa noche ya ha terminado.',
  'live.cameraDenied':
    'El acceso a la cámara está desactivado. Escribe el código de abajo — funciona igual de bien.',
  'live.cameraAsking': 'Pidiendo la cámara…',
  'live.codeLabel': 'O escribe el código de 8 caracteres',
  'live.codePlaceholder': 'ABCD1234',
  // "Esta noche" names the tab, so it keeps its capital.
  'live.codeHint': 'Quien organiza lo encuentra en su pantalla Esta noche.',
  'live.signInNote': 'Inicias sesión una vez — todo lo demás puede esperar a mañana.',

  // C-06 · live room
  'live.title': 'En directo',
  'live.overTitle': 'Esa noche se ha acabado',
  'live.overBody': 'El código caducó cuando quien organiza terminó la noche.',
  'live.codeLine': 'código {code}',
  'live.shareCode': 'Comparte el código',
  'live.shareMessage': 'Únete a mi noche en ROUNDS: {code}',
  'live.hereHeader': {
    one: 'EN DIRECTO · {count} AQUÍ',
    other: 'EN DIRECTO · {count} AQUÍ',
  },
  'live.reconnecting': 'reconectando',
  'live.you': 'Tú',
  // A roster row, so it stays as short as the English. "Apuntada" agrees with
  // the copa it elides.
  'live.drinksLogged': { one: '{count} apuntada', other: '{count} apuntadas' },
  'live.rosterLabel': {
    one: '{name}, ritmo {state}, {count} copa',
    other: '{name}, ritmo {state}, {count} copas',
  },
  'live.whereEveryoneIs': 'DÓNDE ESTÁ CADA UNO',
  'live.locationOn': 'Se comparte solo con esta noche. Se para sola cuando la noche acaba.',
  'live.locationOff': 'Desactivada. Nadie de esta noche ve dónde estás.',
  'live.stopSharingLocation': 'Dejar de compartir mi ubicación',
  'live.shareLocation': 'Compartir mi ubicación con esta noche',
  'live.chat': 'CHAT',
  'live.chatPlaceholder': 'Di algo',
  'live.send': 'Enviar',
  'live.someone': 'Alguien',
  'live.partyMode': 'Modo fiesta: bingo de noche',

  // C-07 · night bingo
  'live.bingoTitle': 'Bingo de noche',
  'live.bingoSubtitle': 'Aquí nada cuenta copas.',
  'live.bingoJacket': 'Alguien pierde la chaqueta',
  'live.bingoRound': 'Una ronda que nadie recuerda haber pagado',
  'live.bingoDj': 'El DJ la pone',
  'live.bingoPhoto': 'Foto de grupo, tercer intento',
  // "Una" agrees with copa — it is one more drink, not one more of anything.
  'live.bingoOneMore': 'Alguien dice «una más»',
  'live.bingoTaxi': 'Debate del taxi',
  'live.bingoKebab': 'Decisión de kebab',
  'live.bingoBattery': 'Móvil al 4%',
  'live.bingoSmoking': 'Ana encuentra la zona de fumadores',
  'live.bingoProgress': { one: '{count} de {total}', other: '{count} de {total}' },
  'live.leaveNight': 'Salir de esta noche',
  'live.leaveNightTitle': '¿Salir de la noche?',
  'live.leaveNightBody': 'Sigue sin ti y lo que has apuntado sigue siendo tuyo. Puedes volver a entrar con el código.',
  'live.hereNow': "Aquí",
  'live.rosterHereLabel': "{name}, aquí esta noche",
  'live.mapLabel': {
    one: 'Mapa: {count} persona compartiendo su ubicación',
    other: 'Mapa: {count} personas compartiendo su ubicación',
  },
  'live.notInvited': "Esa noche no está abierta para ti.",
  'live.joinOffline': "No se puede comprobar ese código ahora.",
} satisfies Record<string, Message>;
