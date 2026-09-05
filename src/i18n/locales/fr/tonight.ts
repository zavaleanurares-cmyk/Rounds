import type { Message } from '../../types';

export const tonight = {
  // T-01 · idle — one message per greeting, never a greeting glued to a name.
  // "Debout" is invariable, so the 2am line does not gender the reader.
  'tonight.greetingStillUp': 'Encore debout',
  'tonight.greetingStillUpNamed': 'Encore debout, {name}',
  // French has no separate afternoon greeting — "bonjour" covers the morning
  // and the afternoon, and only the evening changes. The two keys stay
  // separate, but the word is deliberately the same in both.
  'tonight.greetingMorning': 'Bonjour',
  'tonight.greetingMorningNamed': 'Bonjour, {name}',
  'tonight.greetingAfternoon': 'Bonjour',
  'tonight.greetingAfternoonNamed': 'Bonjour, {name}',
  'tonight.greetingEvening': 'Bonsoir',
  'tonight.greetingEveningNamed': 'Bonsoir, {name}',
  'tonight.nothingLoggedYet': "Rien de noté pour l'instant.",
  // Same wording as stats.startNight — it is the same action.
  'tonight.startNight': 'Commence une soirée',
  'tonight.firstNightTitle': 'Ta première soirée',
  'tonight.firstNightBody':
    "Commence une soirée quand tu sors. Note ce que tu bois en un appui, et demain matin ROUNDS te montre où tu as été, ce que ça a coûté, et comment ça s'est passé.",

  // the next plan
  'tonight.nextUp': 'À VENIR',
  'tonight.nextPlanLabel': 'Prochain plan : {title}',
  'tonight.planWhen': '{day} · {time}',
  'tonight.planWhenVenue': '{day} · {time} · {venue}',
  'tonight.planWhenVoting': '{day} · {time} · vote en cours',
  // "{going} présents" would gender the group; the verb does not — the same
  // choice plan.inviteWhen makes. "Peut-être" is plan.rsvpMaybe's own word.
  'tonight.rsvpSummary': '{going} viennent · {maybe} peut-être',
  'tonight.nothingPlanned': 'Rien de prévu',
  'tonight.nothingPlannedBody': 'Mets quelque chose au calendrier et ta bande pourra voter pour le lieu.',
  // Same wording as social.planSomething.
  'tonight.planSomething': 'Monte un plan',

  // the two tiles and the goal bar
  'tonight.dryStreak': 'Série sans alcool',
  // A caption under the big figure, so it is the bare noun. French counts zero
  // as singular, so "one" also covers 0.
  'tonight.dryStreakUnit': { one: 'soirée', other: 'soirées' },
  'tonight.thisWeek': 'Cette semaine',
  'tonight.thisWeekOf': 'sur {amount} {unit}',
  'tonight.weeklyGoal': 'Objectif hebdo',

  // last night
  'tonight.lastNightLabel': 'Ta dernière soirée',
  // Same word as morning.lastNight.
  'tonight.lastNight': 'HIER SOIR',
  'tonight.lastNightDate': '{weekday} {date}',
  'tonight.aNightOut': 'Une soirée',
  'tonight.lastNightSummary': {
    one: '{duration} · {count} verre · {money}',
    other: '{duration} · {count} verres · {money}',
  },

  // T-02 · planned
  'tonight.plannedTitle': 'Ce soir',
  'tonight.plannedTitleNamed': 'Ce soir, {name}',
  // Same wording as plan.startTheNight.
  'tonight.startTheNight': 'Commence la soirée',
  'tonight.startsIn': 'COMMENCE DANS',
  'tonight.startsNow': 'maintenant',
  'tonight.plannedWhenVenue': '{time} · {venue}',
  'tonight.plannedWhenVoting': '{time} · vote en cours',
  'tonight.where': 'OÙ',
  'tonight.you': 'Toi',
  'tonight.startNightNote':
    "Commencer la soirée ajoute tous ceux qui ont dit oui, et met un HUD en direct sur ton écran verrouillé.",

  // T-03 · live
  // The headline where a venue name would be. Same phrase as
  // discover.outRightNow.
  'tonight.out': 'De sortie',
  'tonight.elapsed': 'de sortie depuis {duration} · début {time}',
  'tonight.end': 'Fin',
  'tonight.endNight': 'Terminer la soirée',
  'tonight.nothingToRepeat': "Rien à répéter pour l'instant — note un verre d'abord.",
  // The drink name can be any gender, so the participle never sits after it.
  'tonight.drinkLogged': 'Noté : {drink}',
  'tonight.paceNothingYet': 'rien de noté',
  'tonight.paceDrinks': { one: '{count} verre', other: '{count} verres' },
  // {minutes} is a second count and it does not drive the plural — only
  // {count} does. "min" is the abbreviation formatDuration already uses.
  'tonight.paceDrinksLast': {
    one: '{count} verre · il y a {minutes}min',
    other: '{count} verres · il y a {minutes}min',
  },
  // The nudge. A statement of fact and an offer, never a telling-off — no
  // "attention", no "tu devrais".
  'tonight.waterTitle': "Deux dans la dernière heure, pas d'eau",
  'tonight.waterBody': "Un verre d'eau maintenant, c'est ce qui change demain.",
  'tonight.logWater': "Noter de l'eau",
  // The three quick chips are one line each — short.
  'tonight.quickWater': 'Eau',
  'tonight.quickSameAgain': 'La même',
  'tonight.quickRideHome': 'Rentrer',
  'tonight.lateNight': 'Il est tard. Rentrer sain et sauf est à un appui.',
  'tonight.openSafety': 'Ouvrir Rentrer sain et sauf',
  'tonight.liveWith': 'EN DIRECT AVEC',
  'tonight.liveWithLabel': 'En direct avec',
  // Same wording as live.codeLine.
  'tonight.joinCode': 'code {code}',
  'tonight.tonight': 'CE SOIR',
  // Quotes the chip above it, so it must stay spelled like
  // tonight.quickSameAgain.
  'tonight.nothingYet': "Rien pour l'instant. Le bouton +, ou « La même » au-dessus.",
  'tonight.logRowLabel': '{drink} à {time}. Modifier.',

  // T-04 · wind-down
  'tonight.howWasIt': "C'était comment?",
  // Same wording as common.pushActionHomeSafe — it answers the same question.
  'tonight.homeSafe': 'Je suis chez moi',
  'tonight.seeTheNight': 'Voir la soirée',
} satisfies Record<string, Message>;
