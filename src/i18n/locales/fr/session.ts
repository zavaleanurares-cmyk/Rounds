import type { Message } from '../../types';

export const session = {
  // T-06 · start night
  // Same wording as tonight.startTheNight — it is the same action.
  'session.startTitle': 'Commence la soirée',
  'session.start': 'Commencer',
  'session.nameLabel': 'Donne-lui un nom (facultatif)',
  // The same example soirée as plan.whatPlaceholder.
  'session.namePlaceholder': 'Vendredi, pour de vrai',
  // A header over a row of venue chips, so it is where the soirée starts, not
  // when. "On" is the app's voice, per the glossary.
  'session.startingAt': 'ON COMMENCE À',
  'session.searchVenue': 'Chercher…',
  'session.whoCanSeeIt': 'QUI PEUT LA VOIR',
  'session.visibilityLabel': 'Visibilité',
  // The same four labels as settings.visibility* — the two screens set the
  // same field, so they must read the same.
  'session.visibilityPrivate': 'Privé',
  'session.visibilityFriends': 'Amis',
  'session.visibilityCrew': 'Ma bande',
  'session.visibilityLink': 'Lien',
  'session.visibilityPrivateNote':
    "Personne ne voit cette soirée, et aucun code pour la rejoindre n'est créé.",
  'session.visibilitySharedNote':
    'Un code pour la rejoindre est créé, pour que les gens puissent le scanner. Il expire à la fin de la soirée.',
  'session.tellTheCrew': 'Préviens ta bande',
  'session.crewNotified': '{crew} reçoit une notification',
  'session.crewsNotified': 'Tes bandes reçoivent une notification',

  // T-08 · night detail
  'session.nightTitle': 'Soirée',
  // Same word as plan.notFoundTitle — "introuvable" is invariable, so it works
  // for une soirée as well as un plan.
  'session.notFoundTitle': 'Introuvable',
  // Same sentence as morning.notFoundBody and stats.shareEmptyBody.
  'session.notFoundBody': "Cette soirée n'est pas sur cet appareil.",
  'session.aNightOut': 'Une soirée',
  'session.nightDate': '{weekday} {date}',
  // Same wording as stats.shareTitle.
  'session.shareLabel': 'Partager cette soirée',
  // THE SHARE CARD. Where you were and how long, nothing else — never what you
  // drank, never the estimate. French counts zero as singular, so "one" also
  // covers 0.
  'session.shareMessage': {
    one: '{place} · {duration} · {count} lieu',
    other: '{place} · {duration} · {count} lieux',
  },
  // A tile label above the duration. Same phrase as tonight.out.
  'session.outFor': 'De sortie',
  'session.drinks': 'Verres',
  // The unit word itself comes from the profile's unit system, not from here.
  'session.unitsCaption': '{units} {unit}',
  'session.water': 'Eau',
  'session.spend': 'Dépenses',
  // Same word as stats.view.
  'session.viewLabel': 'Affichage',
  'session.tabTimeline': 'Chronologie',
  'session.tabPace': 'Courbe du rythme',
  'session.timelineEmpty': "Rien n'a été noté pendant cette soirée.",
  'session.logRowLabel': '{drink} à {time}',
  'session.paceHeader': 'LE RYTHME AU FIL DE LA SOIRÉE',
  // The last sentence is the disclaimer, word for word as in
  // settings.paceDisclaimer. No softening, no conditional.
  'session.paceNote':
    "La forme seulement. Estimation du rythme — ne t'en sers jamais pour décider si tu peux conduire.",
  'session.whoWasThere': 'QUI ÉTAIT LÀ',
  'session.editNight': 'Modifier cette soirée',
  'session.makePrivateLabel': 'Rendre cette soirée privée',
  'session.makePrivateHint': 'Prend effet immédiatement',
  'session.makePrivate': 'Rendre privée',
  'session.isPrivate': "Cette soirée est privée. Personne d'autre ne peut la voir.",

  // T-09 · edit night
  'session.editNightTitle': 'Modifier la soirée',
  'session.notFoundShort': 'Introuvable.',
  'session.editNightSubtitle': 'Corriger ici corrige tous les chiffres qui en découlent.',
  'session.moveEarlier': "Reculer {drink} d'une demi-heure",
  // The minus is U+2212, as in English; "min" is what formatDuration uses, the
  // same way log.minusMinutes writes it.
  'session.minus30': '−30min',
  'session.removeDrink': 'Supprimer {drink}',
  'session.editEmpty': "Rien de noté pour cette soirée pour l'instant.",
  'session.addADrink': 'AJOUTER UN VERRE',
  'session.addMissedDrink': "Ajouter un verre que j'ai oublié",

  // T-07 · end night
  // Same sentence as live.nightEnded.
  'session.alreadyEnded': 'Cette soirée est déjà terminée.',
  // Same wording as tonight.endNight.
  'session.endTitle': 'Terminer la soirée',
  'session.endIt': 'Terminer',
  'session.howWasIt': "C'ÉTAIT COMMENT",
  // "Tu es bien rentré" would gender the reader, so this asks the same question
  // common.pushSafetyTitle asks, in the same words.
  'session.gotHomeSafe': 'Tu es chez toi?',
  'session.anythingForgot': 'Tu as oublié quelque chose?',
  // "Tu es sorti" would gender the reader; making the soirée the subject does
  // not — the same choice morning.outAcross makes. "Only" is in the plural of
  // the English and not in the singular, and that stays true here.
  'session.gapsBody': {
    one: 'Ta soirée a duré un moment et tu as noté {count} verre. Tu peux combler les trous maintenant, ou demain matin quand ce sera plus facile.',
    other:
      "Ta soirée a duré un moment et tu n'as noté que {count} verres. Tu peux combler les trous maintenant, ou demain matin quand ce sera plus facile.",
  },
  'session.doItInMorning': 'Je le ferai demain matin',
} satisfies Record<string, Message>;
