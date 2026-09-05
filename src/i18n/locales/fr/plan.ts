import type { Message } from '../../types';

export const plan = {
  // D-06 · plan detail
  'plan.title': 'Plan',
  // "Introuvable" is invariable, so it works for un plan, une bande et un lieu.
  'plan.notFoundTitle': 'Introuvable',
  'plan.notFoundBody': "Ce plan n'existe plus.",
  'plan.detailWhen': '{day} {time}',
  'plan.invite': 'Inviter',
  'plan.shareMessage': '{title} — {url}',
  'plan.startTheNight': 'Commence la soirée',
  // English leaves the question mark off its headers; French cannot read this
  // one as anything but a question, so it keeps the mark. No space before it —
  // see the glossary.
  'plan.areYouIn': 'TU VIENS?',
  'plan.rsvpLabel': 'Réponse',
  // The three answers share one verb with plan.whosIn and plan.inviteWhen.
  'plan.rsvpIn': 'Je viens',
  'plan.rsvpMaybe': 'Peut-être',
  'plan.rsvpOut': 'Je passe',
  'plan.rsvpNoAnswer': 'Sans réponse',
  'plan.whereOneVote': 'OÙ · UNE VOIX CHACUN',
  'plan.venueVotesLabel': {
    // French counts zero as singular, so "one" also covers 0.
    one: '{name}, {count} vote',
    other: '{name}, {count} votes',
  },
  'plan.whosIn': {
    one: 'QUI VIENT · {count}',
    other: 'QUI VIENT · {count}',
  },

  // D-07 · create plan
  'plan.newTitle': 'Nouveau plan',
  'plan.createIt': 'Crée-le',
  'plan.whatLabel': "C'est quoi",
  // The same example plan as common.demoPlanNotificationBody.
  'plan.whatPlaceholder': 'Vendredi, pour de vrai',
  'plan.when': 'QUAND',
  'plan.tonight': 'Ce soir',
  'plan.whereVote': 'OÙ · OU LAISSE-LES VOTER',
  'plan.who': 'QUI',
  'plan.noFriends': "Ajoute d'abord des amis, ou partage le lien une fois qu'il existe.",

  // D-08 · plan invite
  'plan.shareLink': 'Partager le lien',
  'plan.aPlan': 'Un plan',
  'plan.theyllSee': "CE QU'ILS VERRONT",
  // "{count} présents" would gender the group; the verb does not.
  'plan.inviteWhen': {
    one: '{day} {time} · {count} vient',
    other: '{day} {time} · {count} viennent',
  },
  'plan.invitePageNote':
    "Les gens qui n'ont pas l'app tombent sur une vraie page, pas sur une redirection vers le store. Ils peuvent répondre depuis là.",
} satisfies Record<string, Message>;
