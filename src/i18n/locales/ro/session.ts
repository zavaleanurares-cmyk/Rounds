import type { Message } from '../../types';

export const session = {
  // T-06 · start night
  // Same wording as tonight.startTheNight — it is the same action.
  'session.startTitle': 'Începe seara',
  'session.start': 'Începe',
  'session.nameLabel': 'Dă-i un nume (opțional)',
  // The same example seară as plan.whatPlaceholder.
  'session.namePlaceholder': 'Vineri, ca lumea',
  // A header over a row of venue chips, so it is where the seară starts, not
  // when — "la Enigma", not "la ora 21".
  'session.startingAt': 'ÎNCEPI LA',
  // Same word as discover.searchLabel.
  'session.searchVenue': 'Caută…',
  'session.whoCanSeeIt': 'CINE O POATE VEDEA',
  'session.visibilityLabel': 'Vizibilitate',
  // The same four labels as settings.visibility* — the two screens set the
  // same field, so they must read the same.
  'session.visibilityPrivate': 'Privat',
  'session.visibilityFriends': 'Prieteni',
  'session.visibilityCrew': 'Gașca',
  'session.visibilityLink': 'Link',
  'session.visibilityPrivateNote': 'Nimeni nu vede seara asta și nu se creează niciun cod de intrare.',
  'session.visibilitySharedNote':
    'Se creează un cod de intrare, ca oamenii să îl poată scana. Expiră când se termină seara.',
  'session.tellTheCrew': 'Anunță gașca',
  'session.crewNotified': '{crew} primește o notificare',
  'session.crewsNotified': 'Găștile tale primesc o notificare',

  // T-08 · night detail
  'session.nightTitle': 'Seara',
  // The impersonal form agrees with nothing, so it works for o seară, un plan
  // and un local alike — the same wording as plan.notFoundTitle.
  'session.notFoundTitle': 'Nu am găsit nimic',
  // Same sentence as morning.notFoundBody and stats.shareEmptyBody.
  'session.notFoundBody': 'Seara aia nu e pe dispozitivul ăsta.',
  'session.aNightOut': 'O seară',
  'session.nightDate': '{weekday} {date}',
  // Same wording as stats.shareTitle.
  'session.shareLabel': 'Trimite seara asta',
  // THE SHARE CARD. Where you were and how long, nothing else — never what you
  // drank, never the estimate. The singular drops {count} the same way
  // stats.shareMessage does.
  'session.shareMessage': {
    one: '{place} · {duration} · un local',
    // 0 and 2–19
    few: '{place} · {duration} · {count} locale',
    // 20 and up — takes "de"
    other: '{place} · {duration} · {count} de locale',
  },
  // A tile label above the duration. Same phrase as tonight.out.
  'session.outFor': 'În oraș',
  'session.drinks': 'Băuturi',
  // The unit word itself comes from the profile's unit system, not from here.
  'session.unitsCaption': '{units} {unit}',
  'session.water': 'Apă',
  'session.spend': 'Cheltuieli',
  // Same word as stats.view.
  'session.viewLabel': 'Afișare',
  'session.tabTimeline': 'Cronologie',
  'session.tabPace': 'Curba ritmului',
  'session.timelineEmpty': 'Nu s-a notat nimic în seara asta.',
  'session.logRowLabel': '{drink} la {time}',
  'session.paceHeader': 'RITMUL DE-A LUNGUL SERII',
  // The last sentence is the disclaimer, word for word as in
  // settings.paceDisclaimer. No softening, no conditional.
  'session.paceNote':
    'Doar forma. Estimare a ritmului — nu o folosi niciodată ca să decizi dacă poți conduce.',
  'session.whoWasThere': 'CINE A FOST',
  'session.editNight': 'Editează seara asta',
  'session.makePrivateLabel': 'Fă seara asta privată',
  'session.makePrivateHint': 'Are efect imediat',
  'session.makePrivate': 'Fă-o privată',
  'session.isPrivate': 'Seara asta e privată. Nimeni altcineva nu o poate vedea.',

  // T-09 · edit night
  'session.editNightTitle': 'Editează seara',
  'session.notFoundShort': 'Nu am găsit nimic.',
  'session.editNightSubtitle': 'Dacă o corectezi aici, se corectează toate cifrele care vin din ea.',
  // Same verb as log.timeLabel — a dai o băutură înapoi cu jumătate de oră.
  'session.moveEarlier': 'Dă {drink} înapoi cu jumătate de oră',
  // The minus is U+2212, as in English; "min" is what formatDuration uses, the
  // same way log.minusMinutes writes it.
  'session.minus30': '−30min',
  'session.removeDrink': 'Șterge {drink}',
  'session.editEmpty': 'Încă nimic notat în seara asta.',
  'session.addADrink': 'ADAUGĂ O BĂUTURĂ',
  'session.addMissedDrink': 'Adaugă o băutură pe care am uitat-o',

  // T-07 · end night
  // Same sentence as live.nightEnded.
  'session.alreadyEnded': 'Seara aia s-a terminat deja.',
  // Same wording as tonight.endNight.
  'session.endTitle': 'Încheie seara',
  'session.endIt': 'Încheie',
  // Same words as tonight.howWasIt, shouted — a section header, so no question
  // mark.
  'session.howWasIt': 'CUM A FOST',
  // The participle in a perfect compus does not agree with the reader, so
  // "ai ajuns" is neutral and the line can keep "cu bine" — the same words as
  // the feature name in settings.getHomeSafe.
  'session.gotHomeSafe': 'Ai ajuns acasă cu bine?',
  'session.anythingForgot': 'Ai uitat ceva?',
  // "Ai fost plecat" would gender the reader; making the seară the subject does
  // not — the same choice morning.gapsHeadline makes. "Only" is in the plural
  // of the English and not in the singular, and that stays true here.
  'session.gapsBody': {
    one: 'Seara ta a ținut o vreme și ai notat o singură băutură. Poți completa golurile acum sau dimineață, când e mai ușor.',
    few: 'Seara ta a ținut o vreme și ai notat doar {count} băuturi. Poți completa golurile acum sau dimineață, când e mai ușor.',
    other:
      'Seara ta a ținut o vreme și ai notat doar {count} de băuturi. Poți completa golurile acum sau dimineață, când e mai ușor.',
  },
  'session.doItInMorning': 'O fac dimineață',
} satisfies Record<string, Message>;
