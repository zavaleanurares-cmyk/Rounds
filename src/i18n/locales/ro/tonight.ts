import type { Message } from '../../types';

export const tonight = {
  // T-01 · idle — one message per greeting, never a greeting glued to a name.
  // "Încă treaz" would gender the reader; "Noapte lungă" does not, and it is
  // what someone still up at 3am would actually be told.
  'tonight.greetingStillUp': 'Noapte lungă',
  'tonight.greetingStillUpNamed': 'Noapte lungă, {name}',
  // Informal throughout: "Neața" is what people in their twenties say, and
  // "Bună ziua" would be the one line in the app that sounds like
  // dumneavoastră.
  'tonight.greetingMorning': 'Neața',
  'tonight.greetingMorningNamed': 'Neața, {name}',
  'tonight.greetingAfternoon': 'Bună',
  'tonight.greetingAfternoonNamed': 'Bună, {name}',
  'tonight.greetingEvening': 'Bună seara',
  'tonight.greetingEveningNamed': 'Bună seara, {name}',
  'tonight.nothingLoggedYet': 'Încă nimic notat.',
  // Same wording as stats.startNight — it is the same action.
  'tonight.startNight': 'Începe o seară',
  'tonight.firstNightTitle': 'Prima ta seară',
  'tonight.firstNightBody':
    'Începe o seară când ieși. Notează ce bei dintr-o singură atingere, iar mâine dimineață ROUNDS îți arată unde ai fost, cât a costat și cum a fost.',

  // the next plan
  'tonight.nextUp': 'URMEAZĂ',
  'tonight.nextPlanLabel': 'Planul următor: {title}',
  'tonight.planWhen': '{day} · {time}',
  'tonight.planWhenVenue': '{day} · {time} · {venue}',
  'tonight.planWhenVoting': '{day} · {time} · încă se votează',
  // "{going} confirmați" would gender the group; the verb does not — the same
  // choice plan.inviteWhen makes, and the two verbs are plan.rsvpIn and
  // plan.rsvpMaybe.
  'tonight.rsvpSummary': '{going} vin · {maybe} poate',
  'tonight.nothingPlanned': 'Niciun plan',
  'tonight.nothingPlannedBody': 'Pune ceva în calendar și gașca ta poate vota unde.',
  // Same wording as social.planSomething.
  'tonight.planSomething': 'Fă un plan',

  // the two tiles and the goal bar
  'tonight.dryStreak': 'Serie fără alcool',
  // A caption under the big figure, so it is the bare noun — which is why the
  // "other" form is just "de seri": the tile reads "20" and then "de seri".
  'tonight.dryStreakUnit': {
    one: 'seară',
    // 0 and 2–19
    few: 'seri',
    // 20 and up — takes "de"
    other: 'de seri',
  },
  'tonight.thisWeek': 'Săptămâna asta',
  'tonight.thisWeekOf': 'din {amount} {unit}',
  'tonight.weeklyGoal': 'Obiectiv săptămânal',

  // last night
  'tonight.lastNightLabel': 'Ultima ta seară',
  // Same word as morning.lastNight.
  'tonight.lastNight': 'ASEARĂ',
  'tonight.lastNightDate': '{weekday} {date}',
  'tonight.aNightOut': 'O seară',
  'tonight.lastNightSummary': {
    one: '{duration} · o băutură · {money}',
    few: '{duration} · {count} băuturi · {money}',
    other: '{duration} · {count} de băuturi · {money}',
  },

  // T-02 · planned
  'tonight.plannedTitle': 'Diseară',
  'tonight.plannedTitleNamed': 'Diseară, {name}',
  // Same wording as plan.startTheNight.
  'tonight.startTheNight': 'Începe seara',
  'tonight.startsIn': 'ÎNCEPE ÎN',
  'tonight.startsNow': 'acum',
  'tonight.plannedWhenVenue': '{time} · {venue}',
  'tonight.plannedWhenVoting': '{time} · încă se votează',
  'tonight.where': 'UNDE',
  'tonight.you': 'Tu',
  'tonight.startNightNote':
    'Dacă începi seara, se adaugă toți cei care au zis da și îți apare un HUD live pe ecranul blocat.',

  // T-03 · live
  // The headline where a venue name would be. Same phrase as
  // discover.outRightNow and stats.outCaption.
  'tonight.out': 'În oraș',
  'tonight.elapsed': 'în oraș de {duration} · ai început la {time}',
  'tonight.end': 'Încheie',
  'tonight.endNight': 'Încheie seara',
  'tonight.nothingToRepeat': 'Încă nu ai ce repeta — notează întâi una.',
  // The drink name can be any gender, so the participle never sits after it —
  // the same construction discover.venueAdded uses.
  'tonight.drinkLogged': 'Am notat {drink}',
  'tonight.paceNothingYet': 'încă nimic notat',
  'tonight.paceDrinks': {
    one: 'o băutură',
    few: '{count} băuturi',
    other: '{count} de băuturi',
  },
  // {minutes} is a second count and it does not drive the plural — only
  // {count} does. "min" is the abbreviation formatDuration already uses, so
  // the minutes never need a "de" of their own here.
  'tonight.paceDrinksLast': {
    one: 'o băutură · acum {minutes}min',
    few: '{count} băuturi · acum {minutes}min',
    other: '{count} de băuturi · acum {minutes}min',
  },
  // The nudge. A statement of fact and an offer, never a telling-off — no
  // "ai grijă", no "ar trebui".
  'tonight.waterTitle': 'Două în ultima oră, fără apă',
  'tonight.waterBody': 'Un pahar de apă acum face diferența mâine.',
  'tonight.logWater': 'Notează apă',
  // The three quick chips are one line each — short.
  'tonight.quickWater': 'Apă',
  'tonight.quickSameAgain': 'Încă una',
  'tonight.quickRideHome': 'Spre casă',
  'tonight.lateNight': 'E târziu. Ajungi acasă cu bine e la o atingere distanță.',
  'tonight.openSafety': 'Deschide Ajungi acasă cu bine',
  // "Live" is the ordinary Romanian word for this, the same way live.title
  // keeps it. "În direct" belongs to television.
  'tonight.liveWith': 'LIVE CU',
  'tonight.liveWithLabel': 'Live cu',
  // Same wording as live.codeLine.
  'tonight.joinCode': 'codul {code}',
  'tonight.tonight': 'DISEARĂ',
  // Quotes the chip above it, so it must stay spelled like
  // tonight.quickSameAgain.
  'tonight.nothingYet': 'Încă nimic. Butonul +, sau „Încă una” mai sus.',
  'tonight.logRowLabel': '{drink} la {time}. Editează.',

  // T-04 · wind-down
  'tonight.howWasIt': 'Cum a fost?',
  // Same wording as common.pushActionHomeSafe — it answers the same question.
  'tonight.homeSafe': 'Am ajuns acasă',
  'tonight.seeTheNight': 'Vezi seara',
} satisfies Record<string, Message>;
