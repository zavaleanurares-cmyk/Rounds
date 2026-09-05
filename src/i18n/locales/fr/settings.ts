import type { Message } from '../../types';

export const settings = {
  // S-01 · Settings home
  'settings.groupYou': 'TOI',
  'settings.groupApp': 'APPLI',
  // "People" here covers trusted contacts and blocked users, so the neutral
  // "personnes" rather than "proches" — a blocked user is not a proche.
  'settings.groupSafetyPeople': 'SÉCURITÉ & PERSONNES',
  'settings.groupDeveloper': 'DÉVELOPPEUR',
  'settings.unitsRegion': 'Unités & région',
  'settings.appearance': 'Apparence',
  'settings.modules': 'Modules',
  'settings.modulesNicotineOn': 'Nicotine activée',
  'settings.modulesDefault': 'Par défaut',
  'settings.notifications': 'Notifications',
  'settings.privacy': 'Confidentialité',
  'settings.safety': 'Sécurité',
  'settings.safetyContacts': { one: '{count} contact', other: '{count} contacts' },
  'settings.safetyNotSetUp': 'Pas configuré',
  'settings.systemSurfaces': 'Surfaces système',
  'settings.systemSurfacesSubtitle': 'Live Activity, widgets, Siri, montre',
  'settings.blockedUsers': 'Comptes bloqués',
  'settings.dataAccount': 'Données & compte',
  'settings.helpLegal': 'Aide & mentions légales',
  'settings.demoData': 'Données de démo',
  'settings.demoDataSubtitle': "Remplit l'appli avec 14 semaines d'historique plausible",
  'settings.everyDrink': 'Chaque verre',
  // "All" survives only in the plural — "Tous les 0 glyphe" would be wrong, and
  // French counts zero as singular.
  'settings.everyDrinkSubtitle': {
    one: '{count} glyphe, dessiné',
    other: 'Tous les {count} glyphes, dessinés',
  },
  'settings.signOut': 'Se déconnecter',
  'settings.versionLine': 'ROUNDS {version} · @{username}',
  'settings.usernameFallback': 'toi',
  'settings.handle': '@{username}',

  // S-02 · Appearance, motion and sound
  // "Accent" as a design word has no informal French equivalent; "couleur" is
  // what a person would actually say about a colour picker.
  'settings.nightAccent': 'COULEUR DE LA SOIRÉE',
  'settings.accentLabel': 'Couleur {index}',
  'settings.accentNote':
    "Chaque soirée a sa propre couleur, comme ça ton historique en a. Ici tu choisis celle par laquelle ROUNDS commence.",
  'settings.dimAfter1am': 'Assombrir après 1h',
  'settings.dimAfter1amSubtitle': "Baisse l'aurore et monte le contraste tard dans la nuit",
  'settings.reduceMotion': 'Réduire les animations',
  'settings.reduceMotionSubtitle': 'Suit aussi le réglage de ton téléphone',
  // Device feedback — haptics and sound — not user feedback about the app.
  'settings.groupFeedback': 'RETOURS',
  'settings.haptics': 'Vibrations',
  'settings.hapticsSubtitle': 'Une petite tape quand quelque chose se passe',
  'settings.sound': 'Son',
  'settings.soundSubtitle':
    'Désactivé par défaut. Ne se déclenche jamais quand ton téléphone est en silencieux.',
  'settings.hearThem': 'ÉCOUTE-LES',
  'settings.cueLog': 'Un verre',
  'settings.cueRound': 'Une tournée',
  'settings.cueStart': 'Début de soirée',
  'settings.cueEnd': 'Fin de soirée',
  'settings.cueLevelUp': 'Niveau supérieur',
  'settings.playCue': 'Écouter {label}',

  // S-03 · Units & region
  'settings.standardDrinkHeader': 'VERRE STANDARD',
  'settings.unitSystemLabel': "Système d'unités",
  // These name the standard-drink standard, not the region — left as they are,
  // the same way an API name is.
  'settings.unitSystemEU': 'EU',
  'settings.unitSystemUK': 'UK',
  'settings.unitSystemUS': 'US',
  'settings.standardDrinkNote':
    "Une unité = {grams} g d'alcool. Ton historique est stocké en grammes, donc ça change seulement la façon dont les chiffres s'affichent — jamais ce qu'ils veulent dire.",
  'settings.currencyHeader': 'DEVISE',
  'settings.currencyLabel': 'Devise',
  'settings.paceReadoutHeader': "L'AFFICHAGE DU RYTHME",
  'settings.showEstimate': "Afficher l'estimation en ‰",
  'settings.showEstimateSubtitle':
    "Désactivé par défaut. Le vrai indicateur, c'est le mot qui décrit le rythme — il te compare à ton vendredi habituel, ce que le chiffre ne peut pas faire.",
  'settings.estimateNote':
    "Qu'elle soit affichée ou non, cette valeur est une estimation faite à partir de moyennes de population, elle est calculée sur ton téléphone et n'est envoyée nulle part, et elle disparaît complètement quand ROUNDS te dit de ralentir. Ne t'en sers jamais pour décider si tu peux conduire.",

  // S-04 · Modules
  'settings.nicotineTracking': 'Suivi de la nicotine',
  'settings.nicotineTrackingSubtitle':
    'Ajoute un tableau de bord séparé. Jamais mélangé à ton historique de verres.',
  'settings.socialFeatures': 'Fonctions sociales',
  'settings.socialFeaturesSubtitle': 'Amis, bandes, soirées partagées, plans',
  'settings.socialOffNote':
    "Sans le social, ROUNDS est entièrement privé : le rythme, les dépenses, l'historique, les objectifs et tout ce qu'il y a dans Rentrer sain et sauf marchent toujours.",

  // S-05 · Notifications
  'settings.notificationsSubtitle':
    'Limité à trois par semaine par défaut. Jamais pendant une soirée en cours.',
  'settings.morningRecap': 'Récap du matin',
  'settings.morningRecapSubtitle': 'Une notif à ton heure de réveil habituelle',
  'settings.weeklyRecap': 'Récap de la semaine',
  'settings.plans': 'Plans',
  'settings.plansSubtitle': 'Invitations et rappels',
  'settings.social': 'Social',
  'settings.socialSubtitle': "Demandes d'amis et activité des bandes",
  'settings.safetyNotificationsSubtitle': 'Rappels de signe de vie et escalade',
  'settings.safetyArmedNote': "Impossible à désactiver tant qu'un signe de vie est armé.",
  'settings.achievements': 'Réussites',
  'settings.achievementsSubtitle': 'Désactivé par défaut',
  'settings.notificationsLiveNote':
    "ROUNDS n'envoie jamais de notification pendant une soirée en cours. Déranger quelqu'un qui est sorti, c'est le moyen le plus rapide de se faire désinstaller.",

  // S-06 · Privacy
  'settings.privateAccount': 'Compte privé',
  'settings.privateAccountSubtitle': 'Seules les personnes que tu as acceptées peuvent te trouver',
  'settings.contactMatching': 'Recherche par contacts',
  'settings.contactMatchingSubtitle':
    'Les numéros sont hachés sur cet appareil. Les numéros bruts ne quittent jamais ton téléphone.',
  'settings.shareLocationDefault': 'Partager ma position par défaut',
  'settings.shareLocationDefaultSubtitle':
    "Démarre le partage pendant deux heures au début d’une soirée. Arrêtable à tout moment.",
  'settings.defaultVisibilityHeader': 'VISIBILITÉ PAR DÉFAUT DES SOIRÉES',
  'settings.defaultVisibilityLabel': 'Visibilité par défaut',
  'settings.visibilityPrivate': 'Privé',
  'settings.visibilityFriends': 'Amis',
  // "Bande" alone reads as any old group; the possessive makes it the named one.
  'settings.visibilityCrew': 'Ma bande',
  'settings.privacyNote':
    "Ton estimation de rythme est calculée sur ce téléphone, elle n'est jamais stockée ni envoyée où que ce soit. Le partage de position se fait soirée par soirée, seulement avec les participants, et expire à la fin de la soirée.",

  // S-07 · Safety settings
  'settings.trustedContacts': 'Contacts de confiance',
  'settings.contactsOfMax': { one: '{count} sur {max}', other: '{count} sur {max}' },
  'settings.armCheckIn': 'Armer un signe de vie',
  'settings.getHomeSafe': 'Rentrer sain et sauf',
  'settings.homeAddressHeader': 'ADRESSE DE CHEZ TOI',
  'settings.homeAddressNote':
    'Stockée uniquement sur cet appareil. Sert à pré-remplir ton trajet de retour.',
  'settings.homeAddressPlaceholder': 'Rue, ville',
  'settings.safetyFreeNote':
    "Tout ce qu'il y a dans Rentrer sain et sauf est gratuit pour toujours. ROUNDS ne mettra jamais d'abonnement devant.",

  // S-11 · Blocked users
  'settings.blockedTitle': 'Bloqués',
  'settings.blockedEmptyTitle': 'Personne de bloqué',
  'settings.blockedEmptyBody':
    "Bloquer quelqu'un depuis son profil le retire de la recherche, de tes amis, de toutes les bandes, de toutes les soirées en cours et de tous les plans — tout de suite, et dans les deux sens.",
  'settings.unblock': 'Débloquer',

  // S-12 · Data & account
  'settings.exportHeader': 'EXPORT',
  'settings.exportBody':
    'Tout ce que ROUNDS a sur toi. Le JSON garde tous les champs ; le CSV fait une ligne par verre, prêt pour un tableur. Les deux gratuits, toujours.',
  'settings.exportMyData': 'Exporter mes données',
  'settings.exportAsCsv': 'Exporter en CSV',
  'settings.exportDataCopied': 'Tes données sont dans le presse-papiers',
  'settings.exportCsvCopied': 'Ton CSV est dans le presse-papiers',
  'settings.deleteAccountHeader': 'SUPPRIMER LE COMPTE',
  'settings.deleteAccountBody':
    "Tu es déconnecté tout de suite. Tout est effacé par une cascade côté serveur après un délai de 30 jours — reconnecte-toi dans les 30 jours et rien n'a été perdu.",
  'settings.deleteMyAccount': 'Supprimer mon compte',
  // DELETE is the literal word the field is checked against — never translated.
  'settings.typeDeleteToConfirm': 'Tape DELETE pour confirmer',
  'settings.deleteEverything': 'Tout supprimer',
  'settings.neverMind': 'Laisse tomber',
  'settings.pendingSync': {
    one: "{count} verre attend encore d'être synchronisé. Il sera inclus.",
    other: "{count} verres attendent encore d'être synchronisés. Ils seront inclus.",
  },
  'settings.allSynced': 'Tout ce qui est sur cet appareil est synchronisé.',

  // S-13 · Help & legal
  'settings.groupLegal': 'MENTIONS LÉGALES',
  'settings.termsOfService': "Conditions d'utilisation",
  'settings.privacyPolicy': 'Politique de confidentialité',
  'settings.groupSupport': 'ASSISTANCE',
  'settings.contactSupport': "Contacter l'assistance",
  'settings.reportProblem': 'Signaler un problème',
  'settings.groupDrinkingSupport': "AIDE SUR L'ALCOOL",
  'settings.helplines': "Numéros d'écoute dans ta région",
  'settings.helplinesSubtitle': 'Gratuits et confidentiels',
  // WHO is an organisation with a French name and acronym, unlike ROUNDS.
  'settings.whoAlcoholHealth': 'OMS · alcool et santé',
  'settings.paceDisclaimer':
    "L'estimation du rythme dans ROUNDS n'est pas un éthylotest et n'est pas un avis médical. Elle ne peut pas tenir compte de ce que tu as mangé, d'un médicament, d'une maladie ou d'un verre que tu as oublié de noter. Ne t'en sers jamais pour décider si tu peux conduire.",

  // Demo data (developer utility)
  'settings.demoNights': { one: '{count} soirée', other: '{count} soirées' },
  'settings.demoCurrent': {
    one: "Pour l'instant {count} verre sur {nights}.",
    other: "Pour l'instant {count} verres sur {nights}.",
  },
  'settings.fillHistory': "Remplir avec 14 semaines d'historique",
  'settings.historyAdded': 'Historique ajouté',
  'settings.backToNightOne': 'Retour à la première soirée',
  'settings.cleared': 'Effacé',
  'settings.nightOneNote':
    "La première soirée, c'est ce que voit un nouvel utilisateur. Chaque écran de données a un état dessiné pour ça.",

  // System surfaces · the diagnostics screen
  'settings.surfacesSubtitle': "Noter sans ouvrir l'appli.",
  'settings.loggedOutsideHeader': "NOTÉ HORS DE L'APPLI",
  'settings.percent': '{value}%',
  // "40 %" with a space is the French convention in prose; the readout above it
  // is formatted separately and keeps the tight form.
  'settings.outsideShare': {
    one: "{outside} sur {count} verre noté. La cible est de 40 % — en dessous, les surfaces de l'écran verrouillé ne font pas leur travail et l'appli demande de l'effort au moment où les gens en ont le moins.",
    other:
      "{outside} sur {count} verres notés. La cible est de 40 % — en dessous, les surfaces de l'écran verrouillé ne font pas leur travail et l'appli demande de l'effort au moment où les gens en ont le moins.",
  },
  'settings.devBuildNote':
    "Il faut un build de développement. Live Activities, WidgetKit, App Intents, les commandes du Centre de contrôle, les services de premier plan et les tuiles des paramètres rapides ne peuvent pas tourner dans Expo Go ni dans un navigateur — le plugin de config dans `modules/rounds-native` ajoute les cibles au moment du `expo prebuild`.",

  'settings.buildCanDoHeader': 'CE QUE CE BUILD SAIT FAIRE',
  'settings.capMap': 'Carte',
  'settings.capMapReal': 'vraie carte',
  'settings.capMapProjected': 'points projetés',
  'settings.capScanner': 'Scanner QR',
  'settings.capScannerCamera': 'caméra',
  'settings.capScannerCodeOnly': 'saisie du code seulement',
  'settings.capLocation': 'Position',
  'settings.capAvailable': 'disponible',
  'settings.capUnavailable': 'indisponible',
  'settings.capNotificationsLocal': 'locales · {status}',
  'settings.capRemotePush': 'Push distant',
  'settings.capPurchases': 'Achats',
  'settings.capPurchasesConnected': 'store connecté',
  'settings.capBackend': 'Backend',
  'settings.capBackendOnDevice': "sur l'appareil seulement",
  'settings.turnOnNotifications': 'Activer les notifications',

  'settings.onThisPlatformHeader': 'SUR CETTE PLATEFORME',
  'settings.platformHud': 'HUD',
  'settings.platformWidgets': 'Widgets',
  'settings.platformQuickToggle': 'Bascule rapide',
  'settings.platformVoice': 'Voix',
  'settings.platformNativeModule': 'Module natif',
  'settings.platformAttached': 'attaché',
  'settings.platformNotInBuild': 'pas dans ce build',

  // Platform API names — Live Activity, Dynamic Island, WidgetKit, App Intent,
  // App Actions, AppWidget — are left alone; the prose around them is not.
  'settings.theEightHeader': 'LES HUIT',
  'settings.surfaceRow': '{id} · {name}',
  'settings.surfaceHudName': 'HUD de soirée en cours',
  'settings.surfaceHudIos': 'Live Activity + Dynamic Island',
  'settings.surfaceHudAndroid': 'Notification persistante',
  'settings.surfaceQuickLogName': 'Noter en un geste',
  'settings.surfaceQuickLogIos': 'Bouton App Intent',
  'settings.surfaceQuickLogAndroid': 'Action de notification',
  'settings.surfaceWidgetSmallName': 'Widget · petit',
  'settings.surfaceWidgetSmallIos': 'WidgetKit',
  'settings.surfaceWidgetSmallAndroid': 'AppWidget 2×2',
  'settings.surfaceWidgetMediumName': 'Widget · moyen',
  'settings.surfaceWidgetMediumIos': 'WidgetKit, interactif',
  'settings.surfaceWidgetMediumAndroid': 'AppWidget 4×2',
  'settings.surfaceWidgetLargeName': 'Widget · grand',
  'settings.surfaceWidgetLargeIos': "Carte de chaleur de l'année",
  'settings.surfaceWidgetLargeAndroid': 'AppWidget 4×4',
  'settings.surfaceTileName': 'Bascule rapide',
  'settings.surfaceTileIos': 'Commande du Centre de contrôle',
  'settings.surfaceTileAndroid': 'Tuile des paramètres rapides',
  'settings.surfaceVoiceName': 'Voix',
  'settings.surfaceVoiceIos': 'App Intents / Siri',
  'settings.surfaceVoiceAndroid': 'App Actions',
  'settings.surfaceWatchName': 'Montre',
  'settings.surfaceWatchIos': 'App watchOS',
  'settings.surfaceWatchAndroid': 'Tuile Wear OS',

  'settings.theRuleHeader': 'LA RÈGLE',
  'settings.theRuleBody':
    "Chacune de ces surfaces écrit par la même file d'attente hors ligne que la feuille de saisie, avec un UUID que la surface génère elle-même. Il n'y a jamais de deuxième chemin d'écriture — c'est pour ça qu'une montre qui se synchronise une heure plus tard ne peut pas transformer un verre en deux.",
  'settings.sharedContainerPending': {
    one: '{count} verre en attente dans le conteneur partagé.',
    other: '{count} verres en attente dans le conteneur partagé.',
  },

  'settings.diagnosticsHeader': 'DIAGNOSTICS',
  'settings.diagBuild': 'Build',
  'settings.diagBuildDevelopment': 'développement',
  'settings.diagBuildWeb': 'web',
  'settings.diagEntitlement': "Droit d'accès (serveur)",
  'settings.diagEntitlementPaid': 'payant',
  'settings.diagEntitlementFree': 'gratuit',
  'settings.sendDiagnostics': 'Envoyer les diagnostics',
  'settings.sendDiagnosticsSubtitle':
    'Uniquement des compteurs et des catégories — jamais un verre, un lieu ou une personne',
  'settings.language': 'Langue',
  'settings.languageGroup': 'LANGUE',
  'settings.languageFollowPhone': 'Suivre mon téléphone',
  'settings.languageCurrently': 'Actuellement {name}',
  'settings.languageNote':
    "Ça ne change que ROUNDS. C'est immédiat — rien à télécharger, rien à redémarrer.",
} satisfies Record<string, Message>;
