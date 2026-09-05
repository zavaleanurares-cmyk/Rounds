import type { Message } from '../../types';

export const common = {
  // "Ce soir" also names the tab in stats.backToTonight — the two must stay
  // spelled the same way.
  'common.tabTonight': 'Ce soir',
  'common.tabDiscover': 'Découvrir',
  // The friends-and-crews tab. "Cercle" keeps the English's deliberate
  // vagueness — it is neither only amis nor only bandes.
  'common.tabCircle': 'Cercle',
  'common.tabYou': 'Toi',

  // The pace word — shouted in caps inside the ring, so short.
  'common.paceEasy': 'TRANQUILLE',
  'common.paceSteady': 'RÉGULIER',
  'common.paceQuick': 'RAPIDE',
  'common.paceSlowDown': 'RALENTIS',

  'common.unitUnits': 'unités',
  'common.unitDrinks': 'verres',
  'common.approxUnits': '≈ {value} {unit}',

  'common.distanceMetres': '{value}m',
  'common.distanceKilometres': '{value}km',

  'common.categoryBeer': 'Bière & cidre',
  'common.categoryWine': 'Vin',
  'common.categorySpirit': 'Spiritueux',
  'common.categoryCocktail': 'Cocktails',
  'common.categoryShot': 'Shots',
  // The category holds soft drinks; "Sans alcool" is what a menu says.
  'common.categorySoft': 'Sans alcool',
  'common.categoryWater': 'Eau',

  // The IBA family headings. The cocktails themselves keep their names; these
  // three headings are ordinary words and are translated.
  'common.ibaUnforgettable': 'Les Inoubliables',
  'common.ibaContemporary': 'Les Classiques contemporains',
  'common.ibaNewEra': 'Les Boissons nouvelle ère',

  'common.missingBrowser': 'Pas disponible dans un navigateur — ouvre ROUNDS sur un téléphone.',
  'common.missingDevBuild':
    'Il faut un build de développement. Expo Go ne peut pas charger de code natif personnalisé.',
  'common.missingDevice': 'Pas disponible sur cet appareil.',

  'common.channelSafety': 'Signes de vie',
  'common.channelMorning': 'Récap du matin',
  'common.channelPlans': 'Plans',
  'common.channelSocial': 'Amis et bandes',
  'common.channelWeekly': 'Récap de la semaine',
  'common.channelGamification': 'Réussites',

  // "Tu es rentré ?" would agree with the reader's gender. "Chez toi" does not,
  // and it is the same phrasing as the button that answers it.
  // No space before "?" — see the glossary.
  'common.pushSafetyTitle': 'Tu es chez toi?',
  'common.pushSafetyBody':
    "Appuie pour donner signe de vie. Sans réponse, on prévient tes contacts de confiance dans 15 minutes.",
  'common.pushMorningTitle': 'Ta soirée est prête',
  // "tu as été" rather than "tu es allé" — the participle of être is invariable,
  // so the line does not gender the reader.
  'common.pushMorningBody': "Où tu as été, ce que ça a coûté, et les trous à combler.",
  'common.pushActionHomeSafe': 'Je suis chez moi',
  'common.pushActionMoreTime': 'Donne-moi une heure',
  'common.pushExpoGoNote':
    "Expo Go n'a pas de push distant sur Android. Les notifications locales — y compris le signe de vie — fonctionnent.",

  // "Se connecter avec Apple" is Apple's own French name for the feature.
  'common.authAppleNeedsIosBuild': "Se connecter avec Apple demande un build iOS.",
  'common.authAppleUnavailable': "Se connecter avec Apple n'est pas disponible sur cet appareil.",
  'common.authAppleNoToken': "Apple n'a pas renvoyé de jeton d'identité.",
  'common.authGoogleNotConfigured': "La connexion Google n'est pas configurée dans ce build.",
  'common.authGoogleNoToken': "Google n'a pas renvoyé de jeton d'identité.",
  'common.authDidNotGoThrough': "Ça n'a pas marché. Rien n'a été modifié.",

  // Same trick as pushMorningBody: "tu y as été" does not gender the reader.
  'common.mapPinVisited': '{name}, tu y as déjà été',

  'common.installTitle': "Mets ROUNDS sur ton écran d'accueil",
  // "Sur l'écran d'accueil" is iOS's own French wording in the share sheet —
  // quoted, not translated. Verify against the shipping iOS build before
  // release; if Apple's string changes, this must change with it.
  'common.installBodyIos':
    "Appuie sur le bouton de partage, puis sur « Sur l'écran d'accueil ». Ça s'ouvre en plein écran, ça garde tes données, et ça marche sans réseau.",
  'common.installBody': "Ça s'ouvre en plein écran, ça garde tes données, et ça marche sans réseau.",
  'common.install': 'Installer',

  'common.demoPlanNotificationTitle': 'Ana a ajouté un plan',
  'common.demoPlanNotificationBody': 'Vendredi, pour de vrai · 21:30',
  'common.demoRequestNotificationTitle': "Sara t'a envoyé une demande d'ami",
  'common.demoRequestNotificationBody': 'Appuie pour accepter ou refuser',
  'common.demoMorningNotificationTitle': 'Ta soirée est prête',
  'common.demoMorningNotificationBody': 'Deux lieux, 4h10. Tu combles les trous?',

  // Achievements. Names are two or three words — they sit in a fixed row.
  'common.achFirstNightName': 'Première soirée',
  'common.achFirstNightHint': 'Note une soirée du début à la fin.',
  // "Combleur de trous" is an agent noun that has to pick a gender; the result
  // does not, so every name in this set is a noun phrase instead.
  'common.achGapFillerName': 'Trous comblés',
  'common.achGapFillerHint': 'Comble les trous sur un écran du lendemain.',
  'common.achWeekOfLogsName': "Sept d'affilée",
  'common.achWeekOfLogsHint': 'Note sept soirées.',
  'common.achMorningPersonName': 'Matinal',
  'common.achMorningPersonHint': 'Réponds cinq fois à « comment tu te sens ».',
  'common.achHonestEditorName': 'Correction honnête',
  'common.achHonestEditorHint': 'Corrige une soirée après coup.',
  'common.achFiveVenuesName': 'Cinq lieux',
  'common.achFiveVenuesHint': 'Note dans cinq lieux différents.',
  'common.achTenVenuesName': 'Dix lieux',
  'common.achTenVenuesHint': 'Note dans dix lieux différents.',
  'common.achNewPlaceName': 'Un lieu inédit',
  'common.achNewPlaceHint': "Va dans un lieu où personne de ta bande n'est allé.",
  'common.achPassportPageName': 'Page de passeport',
  'common.achPassportPageHint': 'Collectionne des tampons dans trois lieux en un mois.',
  'common.achHomeCityName': 'Du coin',
  'common.achHomeCityHint': 'Note vingt fois dans la même ville.',
  'common.achFarAfieldName': "À l'extérieur",
  'common.achFarAfieldHint': 'Note une soirée dans une autre ville.',
  'common.achHydratedName': 'Hydratation',
  'common.achHydratedHint': "Note de l'eau trois soirées d'affilée.",
  'common.achDryWeekName': 'Semaine sans alcool',
  'common.achDryWeekHint': 'Sept soirées sans rien noter.',
  // Elides "alcool" from the line above it, the way French does: "une semaine
  // sans", "deux semaines sans".
  'common.achDryFortnightName': 'Deux semaines sans',
  'common.achDryFortnightHint': 'Quatorze soirées sans rien noter.',
  'common.achUnderGoalName': "Sous l'objectif",
  'common.achUnderGoalHint': 'Termine une semaine sous ta limite hebdo.',
  'common.achUnderGoalMonthName': 'Un mois entier',
  'common.achUnderGoalMonthHint': 'Quatre semaines sous ta limite hebdo.',
  // "Rentré avant 2h" would gender the reader; "chez toi" does not.
  'common.achEarlyHomeName': 'Chez toi avant 2h',
  'common.achEarlyHomeHint': 'Termine trois soirées avant 02:00.',
  'common.achWaterFirstName': "L'eau d'abord",
  'common.achWaterFirstHint': "Commence une soirée par de l'eau.",
  'common.achSafeArrivalName': 'Signe de vie',
  'common.achSafeArrivalHint': 'Arme un signe de vie, puis donne-le.',
  // "Pas tout seul" picks a gender. "Bonne compagnie" says the same thing and
  // does not.
  'common.achFirstFriendName': 'Bonne compagnie',
  'common.achFirstFriendHint': 'Ajoute ton premier ami.',
  'common.achCrewFounderName': 'Bande fondée',
  'common.achCrewFounderHint': 'Crée une bande.',
  'common.achPlanMakerName': 'Plan monté',
  'common.achPlanMakerHint': 'Monte un plan auquel trois personnes disent oui.',
  'common.achRoundBuyerName': 'Ta tournée',
  'common.achRoundBuyerHint': 'Paie une tournée pour trois personnes.',
  'common.achLookedOutName': 'Contact de confiance',
  'common.achLookedOutHint': "Sois le contact de confiance de quelqu'un.",

  // The pace ring, spoken. Sentence case, unlike the shouted forms above.
  'common.paceSpokenEasy': 'Tranquille',
  'common.paceSpokenSteady': 'Régulier',
  'common.paceSpokenQuick': 'Rapide',
  'common.paceSpokenSlowDown': 'Ralentis',
  'common.paceLabel': {
    // French counts zero as singular: "0 verre noté".
    one: 'Rythme : {word}. {count} verre noté.',
    other: 'Rythme : {word}. {count} verres notés.',
  },
  'common.paceSince': {
    one: 'Le dernier il y a {count} minute.',
    other: 'Le dernier il y a {count} minutes.',
  },
  'common.demoPlanTitle': 'Vendredi, pour de vrai',
  'common.demoPlanNote': 'On commence au Roots, on décide du reste sur place.',
  'common.you': 'Toi',
  'common.categoryNicotine': 'Nicotine',
} satisfies Record<string, Message>;
