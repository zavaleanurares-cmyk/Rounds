import type { Message } from '../../types';

export const stats = {
  'stats.title': 'Toi',
  'stats.editProfile': 'Modifier ton profil',
  'stats.editProfileHint': 'Nom, pseudo, photo, couleur et la phrase sur toi',
  'stats.you': 'Toi',
  'stats.usernameFallback': 'toi',
  'stats.handle': '@{username}',
  'stats.handleCity': '@{username} · {city}',

  // night one
  'stats.emptyTitle': "Rien à montrer pour l'instant",
  'stats.emptyBody':
    "Après ta première soirée, ça se remplit avec ce que tu as dépensé, où tu es allé et comment les semaines se comparent. Rien ici n'est partagé avec qui que ce soit.",
  'stats.startNight': 'Commence une soirée',

  // spend
  'stats.spentThisYear': 'DÉPENSÉ CETTE ANNÉE',
  'stats.trendUp': '+{pct}% vs le mois dernier',
  'stats.trendDown': '{pct}% vs le mois dernier',
  'stats.perNight': '{amount} par soirée en moyenne',

  // quick actions
  // "Insights" has no informal French noun. "Tendances" is what the screen
  // actually shows, and it fits the same four-label row as the other three.
  'stats.insights': 'Tendances',
  'stats.goals': 'Objectifs',
  // "Wrapped" is a Spotify borrowing rather than a word; "Ton année" says what
  // the screen is, and the eyebrow above it still reads ROUNDS {year}.
  'stats.wrapped': 'Ton année',
  'stats.passport': 'Passeport',

  // heatmap and nights
  'stats.lastNights': {
    // The count is 90 or 400 here, never 0 or 1, so the singular can afford to
    // drop {count} rather than say "LES 0 DERNIÈRES SOIRÉES".
    one: 'LA DERNIÈRE SOIRÉE',
    other: 'LES {count} DERNIÈRES SOIRÉES',
  },
  'stats.recentNights': 'SOIRÉES RÉCENTES',
  'stats.aNightOut': 'Une soirée',
  'stats.nightRow': {
    one: '{date} · {duration} · {count} verre',
    other: '{date} · {duration} · {count} verres',
  },
  'stats.allNights': 'Toutes les soirées',
  'stats.achievements': 'Réussites',

  // ── shared across the screens below ──
  'stats.somewhere': 'Quelque part',
  'stats.on': 'Activé',
  'stats.off': 'Désactivé',
  'stats.days': 'jours',
  'stats.percent': '{pct}%',

  // Y-05 · Insights
  'stats.insightsAllTime': 'Depuis le début',
  'stats.insightsLast90': '90 derniers jours',
  'stats.insightsEmptyTitle': 'Pas encore assez de soirées',
  'stats.insightsEmptyBody':
    "Au bout de trois ou quatre soirées, les tendances deviennent réelles plutôt que du bruit. Reviens à ce moment-là.",
  'stats.last30Days': '30 derniers jours',
  'stats.vsPrevious30': 'vs les 30 précédents',
  'stats.deltaUp': '+{pct}%',
  'stats.deltaDown': '{pct}%',
  'stats.eightWeeks': 'HUIT SEMAINES',
  'stats.weeksNotEnough': 'Pas encore assez de semaines pour parler de tendance.',
  'stats.weeksFirst': 'Tes premières semaines de données.',
  'stats.weeksSteady': 'Stable — les trois dernières semaines ressemblent aux précédentes.',
  'stats.weeksHeavier':
    'Les trois dernières semaines sont environ {pct}% plus chargées que les précédentes.',
  'stats.weeksLighter':
    'Les trois dernières semaines sont environ {pct}% plus légères que les précédentes.',
  'stats.spendHeader': 'DÉPENSES',
  'stats.spendThisMonth': '{amount} ce mois-ci',
  'stats.spendPerNight': '{amount} par soirée en moyenne.',
  'stats.spendTooEarly': "Trop tôt dans le mois pour se prononcer — le mois dernier c'était {amount}.",
  'stats.spendProjected': 'À ce rythme, ça fait {amount} sur une année.',
  'stats.byDay': 'PAR JOUR',

  // No full stop on the short days: the same string goes into a chart label and
  // into the middle of stats.biggestNight, where "Ven. est" would read as the
  // end of a sentence.
  'stats.dayShortSun': 'dim',
  'stats.dayShortMon': 'lun',
  'stats.dayShortTue': 'mar',
  'stats.dayShortWed': 'mer',
  'stats.dayShortThu': 'jeu',
  'stats.dayShortFri': 'ven',
  'stats.dayShortSat': 'sam',
  'stats.dayInitialSun': 'D',
  'stats.dayInitialMon': 'L',
  'stats.dayInitialTue': 'M',
  'stats.dayInitialWed': 'M',
  'stats.dayInitialThu': 'J',
  'stats.dayInitialFri': 'V',
  'stats.dayInitialSat': 'S',

  'stats.biggestNight': '{day} est régulièrement ta plus grosse soirée.',
  'stats.predictedVsActual': 'PRÉVU VS RÉEL',
  'stats.bandFine': 'bien',
  'stats.bandTender': 'vaseux',
  'stats.bandRough': 'rude',
  'stats.morningTuneNote':
    "Répondre à « comment tu te sens » chaque matin, c'est ce qui règle ça sur toi plutôt que sur des moyennes.",

  // Y-06 · Wellbeing
  'stats.wellbeing': 'Bien-être',
  'stats.goalNightlyCap': 'Limite par soirée',
  'stats.goalWeeklyCap': 'Limite par semaine',
  'stats.goalDryDays': 'Jours sans alcool par mois',
  'stats.goalSpendCap': 'Limite de dépenses',
  'stats.goalNicotineFree': 'Jours sans nicotine',
  'stats.goalFallback': 'Objectif',
  'stats.dryStreakHeader': 'SÉRIE SANS ALCOOL',
  // The number is the big figure above this line, so the line itself starts on
  // the noun and never repeats {count}.
  'stats.dryStreakLongest': {
    one: 'soirée · plus longue {longest}',
    other: 'soirées · plus longue {longest}',
  },
  'stats.noOutStreakNote':
    "Il n'y a pas de série pour les soirées enchaînées. Celle-là récompenserait la mauvaise chose.",
  'stats.goalOf': '{value} sur {target}',
  'stats.goalOfUnit': '{value} sur {target} {unit}',
  'stats.goalsHeader': 'OBJECTIFS',
  'stats.getHomeSafe': 'Rentrer sain et sauf',
  'stats.stopsBeingFun': "Si ça n'est plus drôle",
  'stats.stopsBeingFunBody':
    "Parler à quelqu'un de sa consommation est une chose normale, et il n'y a pas besoin d'une crise d'abord.",
  'stats.alcoholSupport': "Aide sur l'alcool · ressources OMS",
  'stats.findLocalServices': 'Trouver des services près de toi',

  // Y-07 · Goal editor
  'stats.less': 'Moins',
  'stats.more': 'Plus',
  'stats.perWeek': 'par semaine',
  'stats.trackThisGoal': 'Suivre cet objectif',
  'stats.goalsPrivate':
    "Tes objectifs sont à toi. Rien ici n'est partagé, classé, ni montré à quelqu'un d'autre.",

  // Y-03 · Nights
  'stats.nightsTitle': 'Soirées',
  // "enregistrées" has to agree with something, so the noun comes back in —
  // the bare "{count} enregistrées" of the English has no gender to agree with.
  'stats.nightsRecorded': {
    one: '{count} soirée enregistrée',
    other: '{count} soirées enregistrées',
  },
  'stats.nightsEmptyTitle': 'Pas encore de soirées',
  'stats.nightsEmptyBody':
    "Chaque soirée que tu enregistres apparaît ici — où tu es allé, avec qui, et ce que ça a coûté.",
  'stats.view': 'Affichage',
  'stats.viewList': 'Liste',
  'stats.viewCalendar': 'Calendrier',
  'stats.nightRowFull': {
    one: '{date} · {duration} · {count} verre · {money}',
    other: '{date} · {duration} · {count} verres · {money}',
  },
  'stats.last12Weeks': '12 DERNIÈRES SEMAINES',
  'stats.heatmapNote': "Les carrés vides sont les soirées sans alcool. Touche un carré plein pour l'ouvrir.",

  // Y-09 · Achievements
  'stats.achievementsCount': '{earned} sur {total}',
  'stats.levelsNote':
    "Les niveaux viennent des soirées notées, de la question du matin, des soirées sans sortir et des endroits nouveaux. Pas un seul point ne vient de ce que tu as bu.",
  'stats.groupExploration': 'EXPLORATION',
  'stats.groupConsistency': 'RÉGULARITÉ',
  'stats.groupModeration': 'MODÉRATION',
  'stats.groupTogether': 'ENSEMBLE',
  'stats.xp': '+{xp}',
  'stats.noVolumeNote': "Rien ici ne récompense le fait de boire plus. C'est voulu.",

  // Y-11 · Passport
  'stats.passportEmptyTitle': 'Pas encore de tampons',
  'stats.passportEmptyBody':
    "Chaque lieu où tu notes un verre te vaut un tampon par soirée. Ça se remplit plus vite que tu ne crois.",
  'stats.findSomewhere': 'Trouve un lieu',
  'stats.places': { one: '{count} lieu', other: '{count} lieux' },
  'stats.stampsCount': { one: '{count} tampon', other: '{count} tampons' },
  'stats.passportSubtitle': '{places} · {stamps}',
  'stats.stampLabel': {
    one: '{venue}, {count} tampon',
    other: '{venue}, {count} tampons',
  },
  'stats.stampTimes': '×{count}',
  'stats.passportNote': "Un tampon par lieu et par soirée. De l'exploration, pas du volume.",

  // Y-12 · Wrapped
  'stats.wrappedEyebrow': 'ROUNDS {year}',
  'stats.wrappedNights': { one: '{count} soirée', other: '{count} soirées' },
  // "Tu es sorti" would gender the reader; "faire une sortie" does not.
  'stats.wrappedNightsBody': {
    one: 'Tu as fait {count} sortie en {year}.',
    other: 'Tu as fait {count} sorties en {year}.',
  },
  'stats.wrappedTopVenue': 'Tu as passé plus de temps à {venue} que partout ailleurs.',
  'stats.wrappedVaried': 'Tu as bien varié.',
  'stats.wrappedSpendBody': "Ce que l'année a coûté, sur toutes les tournées que tu as notées.",
  'stats.wrappedQuietNights': {
    one: '{count} soirée tranquille',
    other: '{count} soirées tranquilles',
  },
  // Same reason as above: "celles où tu n'es pas sorti" would gender the reader.
  'stats.wrappedQuietBody': 'Les soirées sans sortie font aussi partie du tableau.',
  'stats.wrappedDrinks': { one: '{count} verre', other: '{count} verres' },
  'stats.wrappedDrinksBody': "Simplement, sans graphique et sans comparaison avec qui que ce soit.",
  // An accessibility label on the tap target, so "écran" rather than the
  // English-only "slide".
  'stats.nextSlide': 'Écran suivant',
  'stats.tapToContinue': 'Touche pour continuer',

  // Y-08 · Nicotine
  'stats.nicotine': 'Nicotine',
  'stats.nicotineOffTitle': 'Ce module est désactivé',
  'stats.nicotineOffBody':
    "Le suivi de la nicotine est optionnel et désactivé par défaut. Active-le et tu auras la consommation, le coût et les séries de jours sans.",
  'stats.turnItOn': 'Activer',
  'stats.thisWeek': 'Cette semaine',
  'stats.logged': 'notés',
  'stats.freeStreak': 'Série sans nicotine',
  'stats.nicotineNote':
    "Note une cigarette, une vape ou un sachet là où tu notes un verre et ça apparaît ici, pas dans ton historique de verres. Les deux ne sont jamais mélangés.",
  'stats.logNicotine': 'Noter la nicotine',

  // S-15 · Report
  'stats.reportTitle': 'Signaler',
  'stats.reportedTitle': 'Signalé',
  'stats.reportThankYou': 'Merci',
  'stats.reportThankYouBody':
    "Un humain lit chaque signalement, en général sous 24 heures. Tu n'auras pas de réponse sauf si on a besoin de quelque chose, et la personne ne sait jamais qui l'a signalée.",
  'stats.reportAlsoBlock': 'Bloquer aussi {name}',
  'stats.sendReport': 'Envoyer le signalement',
  'stats.whatHappened': "CE QUI S'EST PASSÉ",
  'stats.reportDetail': 'Autre chose à ajouter (facultatif)',
  'stats.reasonHarassment': 'Harcèlement ou intimidation',
  'stats.reasonSpam': 'Spam',
  'stats.reasonImpersonation': "Usurpation d'identité",
  'stats.reasonInappropriate': 'Contenu inapproprié',
  'stats.reasonSafety': "Je m'inquiète pour la sécurité de quelqu'un",
  'stats.reasonOther': 'Autre chose',

  // C-08 · Share card
  'stats.shareEmptyTitle': 'Rien à partager',
  'stats.shareEmptyBody': "Cette soirée n'est pas sur cet appareil.",
  'stats.shareTitle': 'Partager cette soirée',
  'stats.shareMessage': {
    one: '{venue} · {duration} · {count} lieu — ROUNDS',
    other: '{venue} · {duration} · {count} lieux — ROUNDS',
  },
  'stats.shareDate': '{weekday} {date}',
  'stats.outCaption': 'de sortie',
  'stats.placeUnit': { one: 'lieu', other: 'lieux' },
  'stats.shareNote':
    "Ton rythme, ton estimation et ce que tu as bu ne sont jamais sur une carte partagée. Seulement les lieux, les heures et les gens.",

  // the drink sheet
  'stats.everyDrink': 'Chaque verre',
  'stats.everyDrinkSubtitle': {
    one: '{count} verre dessiné, pas un seul emoji',
    other: '{count} verres dessinés, pas un seul emoji',
  },
  'stats.size': 'Taille',
  // "Chip" has no usable French loan here, so the component is named for what
  // it looks like on screen.
  'stats.sizeChips': 'Comme sur les étiquettes',
  'stats.sizeLarge': 'Grande',
  'stats.familyEveryday': 'Courants',
  'stats.drinkGroupHeader': '{label} · {count}',
  'stats.drinkSpec': '{name}, {volume} millilitres à {abv} pour cent',

  // A-13 · Legal viewer chrome
  // [DRAFT] is the literal marker the legal documents are scanned for, so it
  // stays in English.
  'stats.legalDraftNotice':
    "Les sections marquées [DRAFT] sont provisoires, en attente de l'avocat, et doivent être réglées avant la soumission.",
  'stats.legalUpdated': 'Dernière mise à jour {date}',

  // +not-found
  'stats.notFoundTitle': 'Rien ici',
  'stats.notFoundEmptyTitle': 'Ce lien ne mène nulle part',
  'stats.notFoundBody':
    "La page que tu cherchais n'existe pas — ou la soirée qu'elle visait est terminée.",
  // "Ce soir" names the tab, so it keeps its capital.
  'stats.backToTonight': 'Retour à Ce soir',
} satisfies Record<string, Message>;
