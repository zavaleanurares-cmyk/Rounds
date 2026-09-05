import type { Message } from '../../types';

/** S-01…S-13 · Settings, and the diagnostics screen behind it. */
export const settings = {
  // S-01 · Settings home
  'settings.groupYou': 'YOU',
  'settings.groupApp': 'APP',
  'settings.groupSafetyPeople': 'SAFETY & PEOPLE',
  'settings.groupDeveloper': 'DEVELOPER',
  'settings.unitsRegion': 'Units & region',
  'settings.appearance': 'Appearance',
  'settings.modules': 'Modules',
  'settings.modulesNicotineOn': 'Nicotine on',
  'settings.modulesDefault': 'Default',
  'settings.notifications': 'Notifications',
  'settings.privacy': 'Privacy',
  'settings.safety': 'Safety',
  'settings.safetyContacts': { one: '{count} contact', other: '{count} contacts' },
  'settings.safetyNotSetUp': 'Not set up',
  'settings.systemSurfaces': 'System surfaces',
  'settings.systemSurfacesSubtitle': 'Live Activity, widgets, Siri, watch',
  'settings.blockedUsers': 'Blocked users',
  'settings.dataAccount': 'Data & account',
  'settings.helpLegal': 'Help & legal',
  'settings.demoData': 'Demo data',
  'settings.demoDataSubtitle': 'Fill the app with 14 weeks of plausible history',
  'settings.everyDrink': 'Every drink',
  'settings.everyDrinkSubtitle': {
    one: 'All {count} glyph, drawn',
    other: 'All {count} glyphs, drawn',
  },
  'settings.signOut': 'Sign out',
  'settings.versionLine': 'ROUNDS {version} · @{username}',
  'settings.usernameFallback': 'you',
  'settings.handle': '@{username}',

  // S-02 · Appearance, motion and sound
  'settings.nightAccent': 'NIGHT ACCENT',
  'settings.accentLabel': 'Accent {index}',
  'settings.accentNote':
    'Each night gets its own accent so your history has colour. This picks the one ROUNDS starts from.',
  'settings.dimAfter1am': 'Dim after 1am',
  'settings.dimAfter1amSubtitle': 'Lowers the aurora and raises contrast during a late night',
  'settings.reduceMotion': 'Reduce motion',
  'settings.reduceMotionSubtitle': 'Also follows your system setting',
  'settings.groupFeedback': 'FEEDBACK',
  'settings.haptics': 'Haptics',
  'settings.hapticsSubtitle': 'A small tap when something lands',
  'settings.sound': 'Sound',
  'settings.soundSubtitle': 'Off by default. Never plays when your phone is on silent.',
  'settings.hearThem': 'HEAR THEM',
  'settings.cueLog': 'A drink',
  'settings.cueRound': 'A round',
  'settings.cueStart': 'Night starts',
  'settings.cueEnd': 'Night ends',
  'settings.cueLevelUp': 'Level up',
  'settings.playCue': 'Play {label}',

  // S-03 · Units & region
  'settings.standardDrinkHeader': 'STANDARD DRINK',
  'settings.unitSystemLabel': 'Unit system',
  'settings.unitSystemEU': 'EU',
  'settings.unitSystemUK': 'UK',
  'settings.unitSystemUS': 'US',
  'settings.standardDrinkNote':
    'One unit = {grams}g of alcohol. Your history is stored in grams, so this changes only how numbers are shown — never what they mean.',
  'settings.currencyHeader': 'CURRENCY',
  'settings.currencyLabel': 'Currency',
  'settings.paceReadoutHeader': 'THE PACE READOUT',
  'settings.showEstimate': 'Show the ‰ estimate',
  'settings.showEstimateSubtitle':
    'Off by default. The pace word is the real readout — it compares you to your own usual Friday, which the number cannot.',
  'settings.estimateNote':
    'Whether it is shown or not, the figure is an estimate from population averages, it is computed on your phone and sent nowhere, and it disappears entirely when ROUNDS is telling you to slow down. Never use it to decide whether to drive.',

  // S-04 · Modules
  'settings.nicotineTracking': 'Nicotine tracking',
  'settings.nicotineTrackingSubtitle':
    'Adds a separate dashboard. Never mixed into your drink history.',
  'settings.socialFeatures': 'Social features',
  'settings.socialFeaturesSubtitle': 'Friends, crews, shared nights, plans',
  'settings.socialOffNote':
    'With social off, ROUNDS is entirely private: pace, spend, history, goals and everything in Get home safe all still work.',

  // S-05 · Notifications
  'settings.notificationsSubtitle':
    'Capped at three a week by default. Never during a live night.',
  'settings.morningRecap': 'Morning recap',
  'settings.morningRecapSubtitle': 'One push at your usual wake time',
  'settings.weeklyRecap': 'Weekly recap',
  'settings.plans': 'Plans',
  'settings.plansSubtitle': 'Invites and reminders',
  'settings.social': 'Social',
  'settings.socialSubtitle': 'Friend requests and crew activity',
  'settings.safetyNotificationsSubtitle': 'Check-in reminders and escalation',
  'settings.safetyArmedNote': "Can't be turned off while a check-in is armed.",
  'settings.achievements': 'Achievements',
  'settings.achievementsSubtitle': 'Off by default',
  'settings.notificationsLiveNote':
    'ROUNDS never sends a notification while a night is live. Interrupting someone who is out is the fastest way to get an app deleted.',

  // S-06 · Privacy
  'settings.privateAccount': 'Private account',
  'settings.privateAccountSubtitle': "Only people you've accepted can find you",
  'settings.contactMatching': 'Contact matching',
  'settings.contactMatchingSubtitle':
    'Hashes numbers on this device. Raw numbers never leave your phone.',
  'settings.shareLocationDefault': 'Share location by default',
  'settings.shareLocationDefaultSubtitle': 'Still opt-in per night; this just pre-selects it',
  'settings.defaultVisibilityHeader': 'DEFAULT NIGHT VISIBILITY',
  'settings.defaultVisibilityLabel': 'Default visibility',
  'settings.visibilityPrivate': 'Private',
  'settings.visibilityFriends': 'Friends',
  'settings.visibilityCrew': 'Crew',
  'settings.privacyNote':
    'Your pace estimate is computed on this phone and is never stored or sent anywhere. Location sharing is per night, participants only, and expires when the night ends.',

  // S-07 · Safety settings
  'settings.trustedContacts': 'Trusted contacts',
  'settings.contactsOfMax': { one: '{count} of {max}', other: '{count} of {max}' },
  'settings.armCheckIn': 'Arm a check-in',
  'settings.getHomeSafe': 'Get home safe',
  'settings.homeAddressHeader': 'HOME ADDRESS',
  'settings.homeAddressNote': 'Stored on this device only. Used to pre-fill your ride home.',
  'settings.homeAddressPlaceholder': 'Street, city',
  'settings.safetyFreeNote':
    'Everything under Get home safe is free forever. ROUNDS will never put a subscription in front of it.',

  // S-11 · Blocked users
  'settings.blockedTitle': 'Blocked',
  'settings.blockedEmptyTitle': 'Nobody blocked',
  'settings.blockedEmptyBody':
    'Blocking someone from their profile removes them from search, your friends, every crew, every live night and every plan — immediately, and in both directions.',
  'settings.unblock': 'Unblock',

  // S-12 · Data & account
  'settings.exportHeader': 'EXPORT',
  'settings.exportBody':
    'Everything ROUNDS holds about you. JSON keeps every field; CSV is one row per drink, ready for a spreadsheet. Both free, always.',
  'settings.exportMyData': 'Export my data',
  'settings.exportAsCsv': 'Export as CSV',
  'settings.exportDataCopied': 'Your data is on the clipboard',
  'settings.exportCsvCopied': 'Your CSV is on the clipboard',
  'settings.deleteAccountHeader': 'DELETE ACCOUNT',
  'settings.deleteAccountBody':
    "You're signed out immediately. Everything is removed by a server-side cascade after a 30-day grace period — sign back in within 30 days and nothing has been lost.",
  'settings.deleteMyAccount': 'Delete my account',
  'settings.typeDeleteToConfirm': 'Type DELETE to confirm',
  'settings.deleteEverything': 'Delete everything',
  'settings.neverMind': 'Never mind',
  'settings.pendingSync': {
    one: "{count} log is still waiting to sync. It'll be included.",
    other: "{count} logs are still waiting to sync. They'll be included.",
  },
  'settings.allSynced': 'Everything on this device is synced.',

  // S-13 · Help & legal
  'settings.groupLegal': 'LEGAL',
  'settings.termsOfService': 'Terms of Service',
  'settings.privacyPolicy': 'Privacy Policy',
  'settings.groupSupport': 'SUPPORT',
  'settings.contactSupport': 'Contact support',
  'settings.reportProblem': 'Report a problem',
  'settings.groupDrinkingSupport': 'DRINKING SUPPORT',
  'settings.helplines': 'Helplines for your region',
  'settings.helplinesSubtitle': 'Free and confidential',
  'settings.whoAlcoholHealth': 'WHO · alcohol and health',
  'settings.paceDisclaimer':
    'The pace estimate in ROUNDS is not a breathalyser and not medical advice. It cannot account for food, medication, illness or a drink you forgot to log. Never use it to decide whether to drive.',

  // Demo data (developer utility)
  'settings.demoNights': { one: '{count} night', other: '{count} nights' },
  'settings.demoCurrent': {
    one: 'Currently {count} log across {nights}.',
    other: 'Currently {count} logs across {nights}.',
  },
  'settings.fillHistory': 'Fill with 14 weeks of history',
  'settings.historyAdded': 'History added',
  'settings.backToNightOne': 'Back to night one',
  'settings.cleared': 'Cleared',
  'settings.nightOneNote':
    'Night one is what a new user sees. Every data screen has a designed state for it.',

  // System surfaces · the diagnostics screen
  'settings.surfacesSubtitle': 'Logging without opening the app.',
  'settings.loggedOutsideHeader': 'LOGGED OUTSIDE THE APP',
  'settings.percent': '{value}%',
  'settings.outsideShare': {
    one: '{outside} of {count} log. The target is 40% — below that, the lock-screen surfaces are not carrying their weight and the app is asking for effort at the moment people have the least of it.',
    other: '{outside} of {count} logs. The target is 40% — below that, the lock-screen surfaces are not carrying their weight and the app is asking for effort at the moment people have the least of it.',
  },
  'settings.devBuildNote':
    'These need a development build. Live Activities, WidgetKit, App Intents, Control Center controls, foreground services and Quick Settings tiles cannot run in Expo Go or a browser — the config plugin in `modules/rounds-native` adds the targets on `expo prebuild`.',

  'settings.buildCanDoHeader': 'WHAT THIS BUILD CAN DO',
  'settings.capMap': 'Map',
  'settings.capMapReal': 'real map',
  'settings.capMapProjected': 'projected pins',
  'settings.capScanner': 'QR scanner',
  'settings.capScannerCamera': 'camera',
  'settings.capScannerCodeOnly': 'code entry only',
  'settings.capLocation': 'Location',
  'settings.capAvailable': 'available',
  'settings.capUnavailable': 'unavailable',
  'settings.capNotificationsLocal': 'local · {status}',
  'settings.capRemotePush': 'Remote push',
  'settings.capPurchases': 'Purchases',
  'settings.capPurchasesConnected': 'store connected',
  'settings.capBackend': 'Backend',
  'settings.capBackendOnDevice': 'on-device only',
  'settings.turnOnNotifications': 'Turn on notifications',

  'settings.onThisPlatformHeader': 'ON THIS PLATFORM',
  'settings.platformHud': 'HUD',
  'settings.platformWidgets': 'Widgets',
  'settings.platformQuickToggle': 'Quick toggle',
  'settings.platformVoice': 'Voice',
  'settings.platformNativeModule': 'Native module',
  'settings.platformAttached': 'attached',
  'settings.platformNotInBuild': 'not in this build',

  // The eight surfaces. The iOS and Android values name platform APIs — a
  // translator leaves "WidgetKit" and "Dynamic Island" alone, the same way the
  // brand name is left alone, but the rest of each phrase is ordinary prose.
  'settings.theEightHeader': 'THE EIGHT',
  'settings.surfaceRow': '{id} · {name}',
  'settings.surfaceHudName': 'Live night HUD',
  'settings.surfaceHudIos': 'Live Activity + Dynamic Island',
  'settings.surfaceHudAndroid': 'Ongoing notification',
  'settings.surfaceQuickLogName': 'One-tap log',
  'settings.surfaceQuickLogIos': 'App Intent button',
  'settings.surfaceQuickLogAndroid': 'Notification action',
  'settings.surfaceWidgetSmallName': 'Widget · small',
  'settings.surfaceWidgetSmallIos': 'WidgetKit',
  'settings.surfaceWidgetSmallAndroid': 'AppWidget 2×2',
  'settings.surfaceWidgetMediumName': 'Widget · medium',
  'settings.surfaceWidgetMediumIos': 'WidgetKit, interactive',
  'settings.surfaceWidgetMediumAndroid': 'AppWidget 4×2',
  'settings.surfaceWidgetLargeName': 'Widget · large',
  'settings.surfaceWidgetLargeIos': 'Year heatmap',
  'settings.surfaceWidgetLargeAndroid': 'AppWidget 4×4',
  'settings.surfaceTileName': 'Quick toggle',
  'settings.surfaceTileIos': 'Control Center control',
  'settings.surfaceTileAndroid': 'Quick Settings tile',
  'settings.surfaceVoiceName': 'Voice',
  'settings.surfaceVoiceIos': 'App Intents / Siri',
  'settings.surfaceVoiceAndroid': 'App Actions',
  'settings.surfaceWatchName': 'Watch',
  'settings.surfaceWatchIos': 'watchOS app',
  'settings.surfaceWatchAndroid': 'Wear OS tile',

  'settings.theRuleHeader': 'THE RULE',
  'settings.theRuleBody':
    'Every one of these writes through the same offline queue as the log sheet, with a UUID the surface mints itself. There is never a second write path — which is why a watch that syncs an hour late cannot turn one drink into two.',
  'settings.sharedContainerPending': {
    one: '{count} log waiting in the shared container.',
    other: '{count} logs waiting in the shared container.',
  },

  'settings.diagnosticsHeader': 'DIAGNOSTICS',
  'settings.diagBuild': 'Build',
  'settings.diagBuildDevelopment': 'development',
  'settings.diagBuildWeb': 'web',
  'settings.diagEntitlement': 'Entitlement (server)',
  'settings.diagEntitlementPaid': 'paid',
  'settings.diagEntitlementFree': 'free',
  'settings.sendDiagnostics': 'Send diagnostics',
  'settings.sendDiagnosticsSubtitle':
    'Counts and categories only — never a drink, a venue or a person',
  'settings.language': 'Language',
  'settings.languageGroup': 'LANGUAGE',
  'settings.languageFollowPhone': 'Follow my phone',
  'settings.languageCurrently': 'Currently {name}',
  'settings.languageNote':
    'Changing this changes ROUNDS only. It takes effect straight away — nothing to download and nothing to restart.',
} satisfies Record<string, Message>;
