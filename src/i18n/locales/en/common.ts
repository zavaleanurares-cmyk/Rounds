import type { Message } from '../../types';

/** The tab bar. Four words a person reads every time they open the app. */
export const common = {
  'common.tabTonight': 'Tonight',
  'common.tabDiscover': 'Discover',
  'common.tabCircle': 'Circle',
  'common.tabYou': 'You',

  // The pace word — the primary readout on the ring, the Live Activity, the
  // widget and the live room. Held as a key on `paceWord` in design/tokens.ts
  // and translated wherever it is rendered.
  'common.paceEasy': 'EASY',
  'common.paceSteady': 'STEADY',
  'common.paceQuick': 'QUICK',
  'common.paceSlowDown': 'SLOW DOWN',

  // Units. UNIT_LABEL maps a region to one of these two.
  'common.unitUnits': 'units',
  'common.unitDrinks': 'drinks',
  'common.approxUnits': '≈ {value} {unit}',

  // Distance, on the venue rows and the map peek.
  'common.distanceMetres': '{value}m',
  'common.distanceKilometres': '{value}km',

  // Drink categories — the picker's section headers.
  'common.categoryBeer': 'Beer & cider',
  'common.categoryWine': 'Wine',
  'common.categorySpirit': 'Spirits',
  'common.categoryCocktail': 'Cocktails',
  'common.categoryShot': 'Shots',
  'common.categorySoft': 'Soft',
  'common.categoryWater': 'Water',

  // The three IBA families. The cocktail names themselves are proper nouns and
  // live in the `drinks` namespace; these headings are not.
  'common.ibaUnforgettable': 'The Unforgettables',
  'common.ibaContemporary': 'Contemporary Classics',
  'common.ibaNewEra': 'New Era Drinks',

  // A capability this build cannot offer, stated rather than swallowed.
  'common.missingBrowser': 'Not available in a browser — open ROUNDS on a phone.',
  'common.missingDevBuild': 'Needs a development build. Expo Go cannot load custom native code.',
  'common.missingDevice': 'Not available on this device.',

  // Android notification channels, as they appear in system settings.
  'common.channelSafety': 'Safety check-ins',
  'common.channelMorning': 'Morning recap',
  'common.channelPlans': 'Plans',
  'common.channelSocial': 'Friends and crews',
  'common.channelWeekly': 'Weekly recap',
  'common.channelGamification': 'Achievements',

  // The two notifications ROUNDS schedules locally, and the buttons on them.
  'common.pushSafetyTitle': 'Are you home?',
  'common.pushSafetyBody':
    "Tap to check in. If you don't, we'll let your trusted contacts know in 15 minutes.",
  'common.pushMorningTitle': 'Your night is ready',
  'common.pushMorningBody': 'Where you went, what it cost, and the gaps worth filling.',
  'common.pushActionHomeSafe': "I'm home safe",
  'common.pushActionMoreTime': 'Give me an hour',
  'common.pushExpoGoNote':
    'Expo Go has no remote push on Android. Local notifications — including the safety check-in — work.',

  // Why a provider sign-in could not run here. Returned as `reason` by
  // services/auth.ts and rendered by the sign-in screen.
  'common.authAppleNeedsIosBuild': 'Sign in with Apple needs an iOS build.',
  'common.authAppleUnavailable': 'Sign in with Apple is not available on this device.',
  'common.authAppleNoToken': 'Apple did not return an identity token.',
  'common.authGoogleNotConfigured': 'Google sign-in is not configured in this build.',
  'common.authGoogleNoToken': 'Google did not return an identity token.',
  'common.authDidNotGoThrough': 'That did not go through. Nothing was changed.',

  // The map pin. A venue name is a proper noun; only the "been here" part is copy.
  'common.mapPinVisited': '{name}, you have been here',

  // The web install banner.
  'common.installTitle': 'Put ROUNDS on your home screen',
  'common.installBodyIos':
    'Tap the share button, then "Add to Home Screen". It opens full-screen, keeps your data, and works without a signal.',
  'common.installBody': 'It opens full-screen, keeps your data, and works without a signal.',
  'common.install': 'Install',

  // Demo data, seeded by Settings > Demo data.
  'common.demoPlanNotificationTitle': 'Ana added a plan',
  'common.demoPlanNotificationBody': 'Friday, properly · 21:30',
  'common.demoRequestNotificationTitle': 'Sara sent a friend request',
  'common.demoRequestNotificationBody': 'Tap to accept or decline',
  'common.demoMorningNotificationTitle': 'Your night is ready',
  'common.demoMorningNotificationBody': 'Two venues, 4h10. Fill the gaps?',

  // Achievements. Nothing here is earned by drinking more.
  'common.achFirstNightName': 'First night',
  'common.achFirstNightHint': 'Record a night from start to end.',
  'common.achGapFillerName': 'Gap filler',
  'common.achGapFillerHint': 'Fill the gaps on a morning-after screen.',
  'common.achWeekOfLogsName': 'Seven straight',
  'common.achWeekOfLogsHint': 'Record seven nights out.',
  'common.achMorningPersonName': 'Morning person',
  'common.achMorningPersonHint': 'Answer "how do you feel" five times.',
  'common.achHonestEditorName': 'Honest editor',
  'common.achHonestEditorHint': 'Correct a night after the fact.',
  'common.achFiveVenuesName': 'Five places',
  'common.achFiveVenuesHint': 'Log at five different venues.',
  'common.achTenVenuesName': 'Ten places',
  'common.achTenVenuesHint': 'Log at ten different venues.',
  'common.achNewPlaceName': 'Somewhere new',
  'common.achNewPlaceHint': 'Visit a venue nobody in your crew has.',
  'common.achPassportPageName': 'Passport page',
  'common.achPassportPageHint': 'Collect stamps at three venues in a month.',
  'common.achHomeCityName': 'Local',
  'common.achHomeCityHint': 'Log in the same city twenty times.',
  'common.achFarAfieldName': 'Away game',
  'common.achFarAfieldHint': 'Record a night in another city.',
  'common.achHydratedName': 'Hydrated',
  'common.achHydratedHint': 'Log water on three nights in a row.',
  'common.achDryWeekName': 'Dry week',
  'common.achDryWeekHint': 'Seven nights with nothing logged.',
  'common.achDryFortnightName': 'Two dry weeks',
  'common.achDryFortnightHint': 'Fourteen nights with nothing logged.',
  'common.achUnderGoalName': 'Under goal',
  'common.achUnderGoalHint': 'Finish a week under your weekly cap.',
  'common.achUnderGoalMonthName': 'A whole month',
  'common.achUnderGoalMonthHint': 'Four weeks under your weekly cap.',
  'common.achEarlyHomeName': 'Home before two',
  'common.achEarlyHomeHint': 'End three nights before 02:00.',
  'common.achWaterFirstName': 'Water first',
  'common.achWaterFirstHint': 'Start a night with water.',
  'common.achSafeArrivalName': 'Checked in',
  'common.achSafeArrivalHint': 'Arm and resolve a safe-arrival check.',
  'common.achFirstFriendName': 'Not alone',
  'common.achFirstFriendHint': 'Add your first friend.',
  'common.achCrewFounderName': 'Crew founder',
  'common.achCrewFounderHint': 'Create a crew.',
  'common.achPlanMakerName': 'Plan maker',
  'common.achPlanMakerHint': 'Create a plan three people say yes to.',
  'common.achRoundBuyerName': 'Your round',
  'common.achRoundBuyerHint': 'Buy a round for three people.',
  'common.achLookedOutName': 'Looked out',
  'common.achLookedOutHint': "Be someone's trusted contact.",
  // The pace ring, spoken. Two whole sentences rather than glued clauses: the
  // "last one" tail carries its own plural in Romanian.
  'common.paceSpokenEasy': 'Easy',
  'common.paceSpokenSteady': 'Steady',
  'common.paceSpokenQuick': 'Quick',
  'common.paceSpokenSlowDown': 'Slow down',
  'common.paceLabel': {
    one: 'Pace: {word}. {count} drink logged.',
    other: 'Pace: {word}. {count} drinks logged.',
  },
  'common.paceSince': {
    one: 'Last one {count} minute ago.',
    other: 'Last one {count} minutes ago.',
  },
  'common.demoPlanTitle': 'Friday, properly',
  'common.demoPlanNote': 'Starting at Roots, deciding the rest there.',
  'common.you': 'You',
} satisfies Record<string, Message>;
