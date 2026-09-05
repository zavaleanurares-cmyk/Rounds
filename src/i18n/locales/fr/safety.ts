import type { Message } from '../../types';

/**
 * La sécurité, en français.
 *
 * Deux règles pour tout ce fichier :
 *
 *  · Chaque phrase est entière. Rien n'est assemblé à partir de fragments,
 *    parce que l'ordre des mots change d'une langue à l'autre et qu'une phrase
 *    recollée en anglais ne se traduit pas.
 *  · Le ton reste calme. C'est le texte qu'on lit quand quelque chose s'est mal
 *    passé — il informe, il ne dramatise pas et il ne culpabilise personne.
 */
export const safety = {
  'safety.title': 'Rentrer sain et sauf',
  'safety.checkInArmed': 'SIGNE DE VIE ARMÉ',
  'safety.dueNow': "c'est l'heure",
  'safety.armedIntro': "Si tu ne donnes pas signe de vie, on te demande d'abord à toi.",
  'safety.armedEscalation': {
    // Le zéro tombe dans « one » en français : « 0 contact de confiance ».
    one: 'Quinze minutes plus tard, {count} contact de confiance reçoit ton message et ton dernier lieu.',
    other: 'Quinze minutes plus tard, {count} contacts de confiance reçoivent ton message et ton dernier lieu.',
  },
  'safety.armedEscalationNoContacts':
    'Quinze minutes plus tard, tes contacts de confiance reçoivent ton message et ton dernier lieu.',
  // Sans participe accordé : « je suis rentré(e) » genrerait le lecteur.
  'safety.imHomeSafe': 'Je suis bien chez moi',
  'safety.anotherHour': 'Encore une heure',
  'safety.nothingArmed': 'Rien d’armé',
  'safety.nothingArmedBody':
    "Indique l'heure à laquelle tu penses être chez toi. Sans signe de vie, on te demande à toi avant de demander à qui que ce soit d'autre — et tu peux toujours voir le message exact avant.",
  'safety.armCheckIn': 'Armer un signe de vie',
  'safety.rideHome': 'Rentrer en voiture',
  'safety.walkIt': 'Rentrer à pied',
  'safety.checkOnMe': 'Prends de mes nouvelles',
  'safety.shareLocation': 'PARTAGER MA POSITION',
  'safety.shareLocationBody':
    "Pour une durée limitée, avec les gens de ta soirée. Ça s'arrête tout seul, et la donnée est supprimée, pas seulement cachée.",
  'safety.hours': { one: '{count} h', other: '{count} h' },
  'safety.callEmergencyTitle': 'Appeler le {number} ?',
  'safety.callEmergencyBody': "Ceci appelle les secours.",
  'safety.callEmergencyConfirm': 'Appeler le {number}',
  'safety.callEmergencyLabel': 'Appeler les secours, {number}',
  'safety.emergency': 'Urgences · {number}',
  'safety.freeForever':
    "Tout ce qui est sur cet écran est gratuit, toujours. ROUNDS ne met jamais d'abonnement devant.",

  'safety.when': 'QUAND',
  'safety.checkOnMeIn': {
    one: 'Prends de mes nouvelles dans {count} h',
    other: 'Prends de mes nouvelles dans {count} h',
  },
  'safety.messageLabel': "Ce qu'ils recevraient",
  // Écrit à la troisième personne : c'est quelqu'un d'autre qui le lit, peut-être
  // un parent. Le registre est neutre, pas complice.
  'safety.messageDefault':
    "{name} a demandé à ROUNDS de vérifier son retour et n'a pas répondu. Dernière sortie connue : ce soir.",
  'safety.messageDefaultNoName':
    "Quelqu'un a demandé à ROUNDS de vérifier son retour et n'a pas répondu. Dernière sortie connue : ce soir.",
  'safety.gracePeriod':
    "À l'heure dite tu reçois une notification, avec quinze minutes de battement.",
  'safety.onlyThenNamed': "{names} n'entendent parler de rien tant que tu réponds.",
  'safety.onlyThen': "Tes contacts de confiance n'entendent parler de rien tant que tu réponds.",
  'safety.noContactsWarning':
    "Tu n'as encore ajouté aucun contact de confiance — ajoutes-en un pour que ça puisse vraiment prévenir quelqu'un.",

  'safety.contactsTitle': 'Contacts de confiance',
  'safety.contactsSubtitle': "Trois au maximum. On les contacte seulement si tu ne réponds pas.",
  'safety.contactsEmptyTitle': 'Personne pour l’instant',
  'safety.contactsEmptyBody':
    "Choisis des gens qui décrocheraient vraiment à 3h du matin. Ils ne savent pas qu'ils sont sur la liste tant qu'il ne se passe rien.",
  'safety.removeContact': 'Retirer {name}',
  'safety.contactName': 'Nom',
  'safety.contactPhone': 'Téléphone',
  'safety.addContact': 'Ajouter un contact',
  'safety.threeMax': 'Trois au maximum.',
  'safety.sharingUntil': 'Partagée avec ta soirée jusqu’à {time}.',
  'safety.stopSharing': 'Arrêter le partage',
  'safety.shareNeedsNight': 'Commence une soirée d’abord — ta position est partagée avec les gens avec qui tu sors.',
} satisfies Record<string, Message>;
