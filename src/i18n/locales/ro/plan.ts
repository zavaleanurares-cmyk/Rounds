import type { Message } from '../../types';

export const plan = {
  // D-06 · plan detail
  'plan.title': 'Plan',
  // The impersonal form agrees with nothing, so it works for un plan, o gașcă
  // și un local alike.
  'plan.notFoundTitle': 'Nu am găsit nimic',
  'plan.notFoundBody': 'Planul ăla nu mai există.',
  'plan.detailWhen': '{day} {time}',
  'plan.invite': 'Invită',
  'plan.shareMessage': '{title} — {url}',
  'plan.startTheNight': 'Începe seara',
  // English leaves the question mark off its headers; Romanian cannot read
  // this one as anything but a question, so it keeps the mark.
  'plan.areYouIn': 'VII?',
  'plan.rsvpLabel': 'Răspuns',
  // The three answers share one verb with plan.whosIn and plan.inviteWhen.
  'plan.rsvpIn': 'Vin',
  'plan.rsvpMaybe': 'Poate',
  'plan.rsvpOut': 'Nu vin',
  'plan.rsvpNoAnswer': 'Fără răspuns',
  'plan.whereOneVote': 'UNDE · UN VOT DE FIECARE',
  'plan.venueVotesLabel': {
    one: '{name}, un vot',
    // 0 and 2–19
    few: '{name}, {count} voturi',
    // 20 and up — takes "de"
    other: '{name}, {count} de voturi',
  },
  // Nothing here agrees with the count — the number just sits after the
  // header — so all three forms are the same string.
  'plan.whosIn': {
    one: 'CINE VINE · {count}',
    few: 'CINE VINE · {count}',
    other: 'CINE VINE · {count}',
  },

  // D-07 · create plan
  'plan.newTitle': 'Plan nou',
  'plan.createIt': 'Creează-l',
  'plan.whatLabel': 'Ce e',
  // The same example plan as common.demoPlanNotificationBody.
  'plan.whatPlaceholder': 'Vineri, ca lumea',
  'plan.when': 'CÂND',
  'plan.tonight': 'Diseară',
  'plan.whereVote': 'UNDE · SAU LASĂ-I SĂ VOTEZE',
  'plan.who': 'CINE',
  'plan.noFriends': 'Adaugă întâi prieteni sau trimite linkul după ce există.',

  // D-08 · plan invite
  'plan.shareLink': 'Trimite linkul',
  'plan.aPlan': 'Un plan',
  'plan.theyllSee': 'CE VOR VEDEA',
  // "{count} confirmați" would gender the group. Naming the people instead
  // keeps it neutral — and brings back the "de" above nineteen.
  'plan.inviteWhen': {
    one: '{day} {time} · vine o persoană',
    few: '{day} {time} · vin {count} persoane',
    other: '{day} {time} · vin {count} de persoane',
  },
  'plan.invitePageNote':
    'Cine nu are aplicația ajunge pe o pagină adevărată, nu pe o redirecționare către magazin. Poate răspunde direct de acolo.',
} satisfies Record<string, Message>;
