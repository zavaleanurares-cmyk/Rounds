import type { Message } from '../../types';

/** T-01…T-04 · Tonight, in its four states: idle, planned, live and wind-down. */
export const tonight = {
  // T-01 · idle — the greeting changes with the hour, and again when ROUNDS
  // knows your name. Each combination is its own message: a greeting glued to a
  // name works in English and in almost nothing else.
  'tonight.greetingStillUp': 'Still up',
  'tonight.greetingStillUpNamed': 'Still up, {name}',
  'tonight.greetingMorning': 'Morning',
  'tonight.greetingMorningNamed': 'Morning, {name}',
  'tonight.greetingAfternoon': 'Afternoon',
  'tonight.greetingAfternoonNamed': 'Afternoon, {name}',
  'tonight.greetingEvening': 'Evening',
  'tonight.greetingEveningNamed': 'Evening, {name}',
  'tonight.nothingLoggedYet': 'Nothing logged yet.',
  'tonight.startNight': 'Start a night',
  'tonight.firstNightTitle': 'Your first night',
  'tonight.firstNightBody':
    'Start a night when you head out. Log what you drink with one tap, and tomorrow morning ROUNDS shows you where you went, what it cost, and how it went.',

  // the next plan
  'tonight.nextUp': 'NEXT UP',
  'tonight.nextPlanLabel': 'Next plan: {title}',
  'tonight.planWhen': '{day} · {time}',
  'tonight.planWhenVenue': '{day} · {time} · {venue}',
  'tonight.planWhenVoting': '{day} · {time} · still voting',
  'tonight.rsvpSummary': '{going} in · {maybe} maybe',
  'tonight.nothingPlanned': 'Nothing planned',
  'tonight.nothingPlannedBody': 'Put something in the calendar and your crew can vote on where.',
  'tonight.planSomething': 'Plan something',

  // the two tiles and the goal bar
  'tonight.dryStreak': 'Dry streak',
  'tonight.dryStreakUnit': { one: 'night', other: 'nights' },
  'tonight.thisWeek': 'This week',
  'tonight.thisWeekOf': 'of {amount} {unit}',
  'tonight.weeklyGoal': 'Weekly goal',

  // last night
  'tonight.lastNightLabel': 'Your last night',
  'tonight.lastNight': 'LAST NIGHT',
  'tonight.lastNightDate': '{weekday} {date}',
  'tonight.aNightOut': 'A night out',
  'tonight.lastNightSummary': {
    one: '{duration} · {count} drink · {money}',
    other: '{duration} · {count} drinks · {money}',
  },

  // T-02 · planned
  'tonight.plannedTitle': 'Tonight',
  'tonight.plannedTitleNamed': 'Tonight, {name}',
  'tonight.startTheNight': 'Start the night',
  'tonight.startsIn': 'STARTS IN',
  'tonight.startsNow': 'now',
  'tonight.plannedWhenVenue': '{time} · {venue}',
  'tonight.plannedWhenVoting': '{time} · still voting',
  'tonight.where': 'WHERE',
  'tonight.you': 'You',
  'tonight.startNightNote':
    'Starting the night adds everyone who said yes, and puts a live HUD on your lock screen.',

  // T-03 · live
  'tonight.out': 'Out',
  'tonight.elapsed': 'out {duration} · started {time}',
  'tonight.end': 'End',
  'tonight.endNight': 'End the night',
  'tonight.nothingToRepeat': 'Nothing to repeat yet — log one first.',
  'tonight.drinkLogged': '{drink} logged',
  'tonight.paceNothingYet': 'nothing logged yet',
  'tonight.paceDrinks': { one: '{count} drink', other: '{count} drinks' },
  'tonight.paceDrinksLast': {
    one: '{count} drink · last {minutes}m ago',
    other: '{count} drinks · last {minutes}m ago',
  },
  'tonight.waterTitle': 'Two in the last hour, no water',
  'tonight.waterBody': 'One glass now is the difference tomorrow.',
  'tonight.logWater': 'Log water',
  'tonight.quickWater': 'Water',
  'tonight.quickSameAgain': 'Same again',
  'tonight.quickRideHome': 'Ride home',
  'tonight.lateNight': "It's late. Get home safe is one tap away.",
  'tonight.openSafety': 'Open Get home safe',
  'tonight.liveWith': 'LIVE WITH',
  'tonight.liveWithLabel': 'Live with',
  'tonight.joinCode': 'code {code}',
  'tonight.tonight': 'TONIGHT',
  'tonight.nothingYet': 'Nothing yet. The + button, or "Same again" above.',
  'tonight.logRowLabel': '{drink} at {time}. Edit.',

  // T-04 · wind-down
  'tonight.howWasIt': 'How was it?',
  'tonight.homeSafe': "I'm home safe",
  'tonight.seeTheNight': 'See the night',
} satisfies Record<string, Message>;
