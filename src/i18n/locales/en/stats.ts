import type { Message } from '../../types';

/** Y-01 · You: the profile header, spend, the heatmap and recent nights. */
export const stats = {
  'stats.title': 'You',
  'stats.editProfile': 'Edit your profile',
  'stats.editProfileHint': 'Name, handle, photo, colour and the line about you',
  'stats.you': 'You',
  'stats.usernameFallback': 'you',
  'stats.handle': '@{username}',
  'stats.handleCity': '@{username} · {city}',

  // night one
  'stats.emptyTitle': 'Nothing to show yet',
  'stats.emptyBody':
    'After your first night this fills with what you spent, where you went and how the weeks compare. Nothing here is shared with anyone.',
  'stats.startNight': 'Start a night',

  // spend
  'stats.spentThisYear': 'SPENT THIS YEAR',
  'stats.trendUp': '+{pct}% vs last month',
  'stats.trendDown': '{pct}% vs last month',
  'stats.perNight': '{amount} a night on average',

  // quick actions
  'stats.insights': 'Insights',
  'stats.goals': 'Goals',
  'stats.wrapped': 'Wrapped',
  'stats.passport': 'Passport',

  // heatmap and nights
  'stats.lastNights': {
    one: 'LAST {count} NIGHT',
    other: 'LAST {count} NIGHTS',
  },
  'stats.recentNights': 'RECENT NIGHTS',
  'stats.aNightOut': 'A night out',
  'stats.nightRow': {
    one: '{date} · {duration} · {count} drink',
    other: '{date} · {duration} · {count} drinks',
  },
  'stats.allNights': 'All nights',
  'stats.achievements': 'Achievements',

  // ── shared across the screens below ──
  'stats.somewhere': 'Somewhere',
  'stats.on': 'On',
  'stats.off': 'Off',
  'stats.days': 'days',
  'stats.percent': '{pct}%',

  // Y-05 · Insights
  'stats.insightsAllTime': 'All time',
  'stats.insightsLast90': 'Last 90 days',
  'stats.insightsEmptyTitle': 'Not enough nights yet',
  'stats.insightsEmptyBody':
    'After three or four nights the patterns start being real rather than noise. Come back then.',
  'stats.last30Days': 'Last 30 days',
  'stats.vsPrevious30': 'vs previous 30',
  'stats.deltaUp': '+{pct}%',
  'stats.deltaDown': '{pct}%',
  'stats.eightWeeks': 'EIGHT WEEKS',
  'stats.weeksNotEnough': 'Not enough weeks yet to call a trend.',
  'stats.weeksFirst': 'Your first weeks of data.',
  'stats.weeksSteady': 'Steady — the last three weeks look like the ones before them.',
  'stats.weeksHeavier': 'The last three weeks are about {pct}% heavier than the ones before.',
  'stats.weeksLighter': 'The last three weeks are about {pct}% lighter than the ones before.',
  'stats.spendHeader': 'SPEND',
  'stats.spendThisMonth': '{amount} this month',
  'stats.spendPerNight': '{amount} a night on average.',
  'stats.spendTooEarly': 'Too early in the month to call it — last month was {amount}.',
  'stats.spendProjected': "At this rate that's {amount} over a year.",
  'stats.byDay': 'BY DAY',

  // The bar chart shows one letter per weekday; the sentence under it names the
  // day in its short form. Both are catalogue entries because slicing a
  // translated word to its first character is not how any of the other three
  // languages abbreviate a day.
  'stats.dayShortSun': 'Sun',
  'stats.dayShortMon': 'Mon',
  'stats.dayShortTue': 'Tue',
  'stats.dayShortWed': 'Wed',
  'stats.dayShortThu': 'Thu',
  'stats.dayShortFri': 'Fri',
  'stats.dayShortSat': 'Sat',
  'stats.dayInitialSun': 'S',
  'stats.dayInitialMon': 'M',
  'stats.dayInitialTue': 'T',
  'stats.dayInitialWed': 'W',
  'stats.dayInitialThu': 'T',
  'stats.dayInitialFri': 'F',
  'stats.dayInitialSat': 'S',

  'stats.biggestNight': '{day} is consistently your biggest night.',
  'stats.predictedVsActual': 'PREDICTED VS ACTUAL',
  'stats.bandFine': 'fine',
  'stats.bandTender': 'tender',
  'stats.bandRough': 'rough',
  'stats.morningTuneNote':
    'Answering "how do you feel" each morning is what tunes this to you rather than to averages.',

  // Y-06 · Wellbeing
  'stats.wellbeing': 'Wellbeing',
  'stats.goalNightlyCap': 'Nightly cap',
  'stats.goalWeeklyCap': 'Weekly cap',
  'stats.goalDryDays': 'Dry days a month',
  'stats.goalSpendCap': 'Spend cap',
  'stats.goalNicotineFree': 'Nicotine-free days',
  'stats.goalFallback': 'Goal',
  'stats.dryStreakHeader': 'DRY STREAK',
  'stats.dryStreakLongest': {
    one: 'night · longest {longest}',
    other: 'nights · longest {longest}',
  },
  'stats.noOutStreakNote':
    'There is no streak here for consecutive nights out. That one rewards the wrong thing.',
  'stats.goalOf': '{value} of {target}',
  'stats.goalOfUnit': '{value} of {target} {unit}',
  'stats.goalsHeader': 'GOALS',
  'stats.getHomeSafe': 'Get home safe',
  'stats.stopsBeingFun': 'If it stops being fun',
  'stats.stopsBeingFunBody':
    "Talking to someone about drinking is a normal thing to do, and it doesn't have to be a crisis first.",
  'stats.alcoholSupport': 'Alcohol support · WHO resources',
  'stats.findLocalServices': 'Find local services',

  // Y-07 · Goal editor
  'stats.less': 'Less',
  'stats.more': 'More',
  'stats.perWeek': 'per week',
  'stats.trackThisGoal': 'Track this goal',
  'stats.goalsPrivate': 'Goals are yours. Nothing here is shared, ranked, or shown to anyone else.',

  // Y-03 · Nights
  'stats.nightsTitle': 'Nights',
  'stats.nightsRecorded': { one: '{count} recorded', other: '{count} recorded' },
  'stats.nightsEmptyTitle': 'No nights yet',
  'stats.nightsEmptyBody':
    'Every night you record shows up here — where you went, who with, and what it cost.',
  'stats.view': 'View',
  'stats.viewList': 'List',
  'stats.viewCalendar': 'Calendar',
  'stats.nightRowFull': {
    one: '{date} · {duration} · {count} drink · {money}',
    other: '{date} · {duration} · {count} drinks · {money}',
  },
  'stats.last12Weeks': 'LAST 12 WEEKS',
  'stats.heatmapNote': 'Empty squares are dry nights. Tap a filled one to open it.',

  // Y-09 · Achievements. The names and hints themselves come from
  // domain/progress.ts and are not translated yet.
  'stats.achievementsCount': '{earned} of {total}',
  'stats.levelsNote':
    'Levels come from recording nights, answering the morning question, taking nights off and going somewhere new. Not one point of this comes from how much you drank.',
  'stats.groupExploration': 'EXPLORATION',
  'stats.groupConsistency': 'CONSISTENCY',
  'stats.groupModeration': 'MODERATION',
  'stats.groupTogether': 'TOGETHER',
  'stats.xp': '+{xp}',
  'stats.noVolumeNote': "Nothing here rewards drinking more. That's on purpose.",

  // Y-11 · Passport
  'stats.passportEmptyTitle': 'No stamps yet',
  'stats.passportEmptyBody':
    "Every venue you log at earns one stamp per night. It fills up faster than you'd think.",
  'stats.findSomewhere': 'Find somewhere',
  'stats.places': { one: '{count} place', other: '{count} places' },
  'stats.stampsCount': { one: '{count} stamp', other: '{count} stamps' },
  'stats.passportSubtitle': '{places} · {stamps}',
  'stats.stampLabel': {
    one: '{venue}, {count} stamp',
    other: '{venue}, {count} stamps',
  },
  'stats.stampTimes': '×{count}',
  'stats.passportNote': 'One stamp per venue per night. Exploration, not volume.',

  // Y-12 · Wrapped
  'stats.wrappedEyebrow': 'ROUNDS {year}',
  'stats.wrappedNights': { one: '{count} night', other: '{count} nights' },
  'stats.wrappedNightsBody': {
    one: 'You went out {count} time in {year}.',
    other: 'You went out {count} times in {year}.',
  },
  'stats.wrappedTopVenue': '{venue} saw more of you than anywhere else.',
  'stats.wrappedVaried': 'You kept it varied.',
  'stats.wrappedSpendBody': 'What the year cost, across every round you logged.',
  'stats.wrappedQuietNights': { one: '{count} quiet night', other: '{count} quiet nights' },
  'stats.wrappedQuietBody': 'The ones you did not go out are part of the picture too.',
  'stats.wrappedDrinks': { one: '{count} drink', other: '{count} drinks' },
  'stats.wrappedDrinksBody': 'Plainly, without a chart and without a comparison to anyone else.',
  'stats.nextSlide': 'Next slide',
  'stats.tapToContinue': 'Tap to continue',

  // Y-08 · Nicotine
  'stats.nicotine': 'Nicotine',
  'stats.nicotineOffTitle': 'This module is off',
  'stats.nicotineOffBody':
    'Nicotine tracking is optional and off by default. Turn it on and this becomes intake, cost and free-day streaks.',
  'stats.turnItOn': 'Turn it on',
  'stats.thisWeek': 'This week',
  'stats.logged': 'logged',
  'stats.freeStreak': 'Free streak',
  'stats.nicotineNote':
    'Log a cigarette, vape or pouch from the log sheet and it appears here rather than in your drink history. The two are never mixed.',

  // S-15 · Report
  'stats.reportTitle': 'Report',
  'stats.reportedTitle': 'Reported',
  'stats.reportThankYou': 'Thank you',
  'stats.reportThankYouBody':
    "A human reviews every report, usually within 24 hours. You won't hear back unless we need something from you, and the person is never told who reported them.",
  'stats.reportAlsoBlock': 'Also block {name}',
  'stats.sendReport': 'Send report',
  'stats.whatHappened': 'WHAT HAPPENED',
  'stats.reportDetail': 'Anything else (optional)',
  'stats.reasonHarassment': 'Harassment or bullying',
  'stats.reasonSpam': 'Spam',
  'stats.reasonImpersonation': 'Impersonation',
  'stats.reasonInappropriate': 'Inappropriate content',
  'stats.reasonSafety': "I'm worried about someone's safety",
  'stats.reasonOther': 'Something else',

  // C-08 · Share card
  'stats.shareEmptyTitle': 'Nothing to share',
  'stats.shareEmptyBody': "That night isn't on this device.",
  'stats.shareTitle': 'Share this night',
  'stats.shareMessage': {
    one: '{venue} · {duration} · {count} venue — ROUNDS',
    other: '{venue} · {duration} · {count} venues — ROUNDS',
  },
  'stats.shareDate': '{weekday} {date}',
  'stats.outCaption': 'out',
  'stats.placeUnit': { one: 'place', other: 'places' },
  'stats.shareNote':
    'Your pace, your estimate and what you drank are never on a share card. Venues, hours and people only.',

  // the drink sheet — a design reference, but still a screen with words on it
  'stats.everyDrink': 'Every drink',
  'stats.everyDrinkSubtitle': {
    one: '{count} drawn, none of them an emoji',
    other: '{count} drawn, none of them an emoji',
  },
  'stats.size': 'Size',
  'stats.sizeChips': 'As shown in chips',
  'stats.sizeLarge': 'Large',
  'stats.familyEveryday': 'Everyday',
  'stats.drinkGroupHeader': '{label} · {count}',
  'stats.drinkSpec': '{name}, {volume} millilitres at {abv} percent',

  // A-13 · Legal viewer chrome. The documents themselves live in content/legal.
  'stats.legalDraftNotice':
    'Sections marked [DRAFT] are placeholders for counsel and must be settled before submission.',
  'stats.legalUpdated': 'Last updated {date}',

  // +not-found
  'stats.notFoundTitle': 'Nothing here',
  'stats.notFoundEmptyTitle': 'That link went nowhere',
  'stats.notFoundBody':
    "The page you were looking for doesn't exist — or the night it pointed at has ended.",
  'stats.backToTonight': 'Back to Tonight',
  'stats.nicotineLogged': "{what} logged",
  'stats.nicotineTonight': "TONIGHT",
  'stats.pouchMgHeader': "POUCH NICOTINE THIS WEEK",
  'stats.pouchMgValue': "{mg} mg",
  'stats.pouchMgNote': "From pouches, which are labelled. Cigarettes are counted, not weighed — see below.",
  'stats.pouches': "Pouches",
  'stats.smoked': "Smoked",
  'stats.mg': "{mg} mg",
  'stats.pouchLabel': "{name}, {mg} milligrams",
  'stats.pouchCapNote': "Strengths as sold. Romanian law caps a pouch at {max} mg, so nothing stronger is listed.",
  'stats.noYieldNote': "No milligrams here on purpose. EU rules took nicotine figures off cigarette packs because they made some brands look safer than others. Counting is the honest measure.",
} satisfies Record<string, Message>;
