import type { Message } from '../../types';

export const stats = {
  'stats.title': 'Tu',
  'stats.editProfile': 'Editează-ți profilul',
  // "handle" as "nume de utilizator" would stack a second "nume" right after
  // the first, so the field is named by what it is: utilizator.
  'stats.editProfileHint': 'Nume, utilizator, poză, culoare și fraza despre tine',
  'stats.you': 'Tu',
  'stats.usernameFallback': 'tu',
  'stats.handle': '@{username}',
  'stats.handleCity': '@{username} · {city}',

  // night one
  'stats.emptyTitle': 'Încă nu e nimic de arătat',
  'stats.emptyBody':
    'După prima ta seară, aici apar cheltuielile, locurile unde ai fost și cum se compară săptămânile. Nimic de aici nu e împărțit cu nimeni.',
  'stats.startNight': 'Începe o seară',

  // spend
  'stats.spentThisYear': 'CHELTUIT ANUL ĂSTA',
  'stats.trendUp': '+{pct}% față de luna trecută',
  'stats.trendDown': '{pct}% față de luna trecută',
  'stats.perNight': '{amount} pe seară în medie',

  // quick actions
  // "Insights" has no informal Romanian noun; "Tendințe" is what the screen
  // shows, and it fits the same four-label row as the other three.
  'stats.insights': 'Tendințe',
  'stats.goals': 'Obiective',
  // "Wrapped" is a Spotify borrowing rather than a word; "Anul tău" says what
  // the screen is, and the eyebrow above it still reads ROUNDS {year}.
  'stats.wrapped': 'Anul tău',
  'stats.passport': 'Pașaport',

  // heatmap and nights
  'stats.lastNights': {
    // The count is 90 or 400 here, never 0 or 1, so the singular can drop it.
    one: 'ULTIMA SEARĂ',
    // 0 and 2–19
    few: 'ULTIMELE {count} SERI',
    // 20 and up — takes "de"
    other: 'ULTIMELE {count} DE SERI',
  },
  'stats.recentNights': 'SERI RECENTE',
  'stats.aNightOut': 'O seară',
  'stats.nightRow': {
    one: '{date} · {duration} · o băutură',
    few: '{date} · {duration} · {count} băuturi',
    other: '{date} · {duration} · {count} de băuturi',
  },
  'stats.allNights': 'Toate serile',
  'stats.achievements': 'Realizări',

  // ── shared across the screens below ──
  'stats.somewhere': 'Undeva',
  'stats.on': 'Activat',
  'stats.off': 'Dezactivat',
  'stats.days': 'zile',
  'stats.percent': '{pct}%',

  // Y-05 · Insights
  'stats.insightsAllTime': 'De la început',
  'stats.insightsLast90': 'Ultimele 90 de zile',
  'stats.insightsEmptyTitle': 'Încă nu sunt destule seri',
  'stats.insightsEmptyBody':
    'După trei sau patru seri, tiparele încep să fie reale, nu zgomot. Întoarce-te atunci.',
  'stats.last30Days': 'Ultimele 30 de zile',
  'stats.vsPrevious30': 'față de 30 de zile dinainte',
  'stats.deltaUp': '+{pct}%',
  'stats.deltaDown': '{pct}%',
  'stats.eightWeeks': 'OPT SĂPTĂMÂNI',
  'stats.weeksNotEnough': 'Încă nu sunt destule săptămâni cât să vorbim de o tendință.',
  'stats.weeksFirst': 'Primele tale săptămâni de date.',
  'stats.weeksSteady': 'Constant — ultimele trei săptămâni seamănă cu cele dinainte.',
  'stats.weeksHeavier':
    'Ultimele trei săptămâni sunt cam cu {pct}% mai încărcate decât cele dinainte.',
  'stats.weeksLighter':
    'Ultimele trei săptămâni sunt cam cu {pct}% mai ușoare decât cele dinainte.',
  'stats.spendHeader': 'CHELTUIELI',
  'stats.spendThisMonth': '{amount} luna asta',
  'stats.spendPerNight': '{amount} pe seară în medie.',
  'stats.spendTooEarly': 'E prea devreme în lună ca să ne pronunțăm — luna trecută a fost {amount}.',
  'stats.spendProjected': 'În ritmul ăsta, înseamnă {amount} într-un an.',
  'stats.byDay': 'PE ZILE',

  'stats.dayShortSun': 'dum',
  'stats.dayShortMon': 'lun',
  'stats.dayShortTue': 'mar',
  'stats.dayShortWed': 'mie',
  'stats.dayShortThu': 'joi',
  'stats.dayShortFri': 'vin',
  'stats.dayShortSat': 'sâm',
  'stats.dayInitialSun': 'D',
  'stats.dayInitialMon': 'L',
  'stats.dayInitialTue': 'M',
  'stats.dayInitialWed': 'M',
  'stats.dayInitialThu': 'J',
  'stats.dayInitialFri': 'V',
  'stats.dayInitialSat': 'S',

  'stats.biggestNight': '{day} e constant seara ta cea mai mare.',
  'stats.predictedVsActual': 'ESTIMAT VS REAL',
  'stats.bandFine': 'bine',
  'stats.bandTender': 'fragil',
  'stats.bandRough': 'greu',
  'stats.morningTuneNote':
    'Faptul că răspunzi în fiecare dimineață la „cum te simți” e ce potrivește asta pe tine, nu pe medii.',

  // Y-06 · Wellbeing
  'stats.wellbeing': 'Stare de bine',
  'stats.goalNightlyCap': 'Limită pe seară',
  'stats.goalWeeklyCap': 'Limită pe săptămână',
  'stats.goalDryDays': 'Zile fără alcool pe lună',
  'stats.goalSpendCap': 'Limită de cheltuieli',
  'stats.goalNicotineFree': 'Zile fără nicotină',
  'stats.goalFallback': 'Obiectiv',
  'stats.dryStreakHeader': 'SERIE FĂRĂ ALCOOL',
  // The number is the big figure directly above this line, so the line starts
  // on the noun and never repeats {count} — which is why the "other" form here
  // begins with a bare "de": the screen reads "20" then "de seri · …".
  'stats.dryStreakLongest': {
    one: 'seară · cea mai lungă {longest}',
    few: 'seri · cea mai lungă {longest}',
    other: 'de seri · cea mai lungă {longest}',
  },
  'stats.noOutStreakNote':
    'Nu există aici o serie pentru seri ieșite la rând. Aia ar răsplăti ce nu trebuie.',
  'stats.goalOf': '{value} din {target}',
  'stats.goalOfUnit': '{value} din {target} {unit}',
  'stats.goalsHeader': 'OBIECTIVE',
  'stats.getHomeSafe': 'Ajungi acasă cu bine',
  'stats.stopsBeingFun': 'Dacă nu mai e distractiv',
  'stats.stopsBeingFunBody':
    'E normal să vorbești cu cineva despre băut și nu trebuie să fie mai întâi o criză.',
  'stats.alcoholSupport': 'Ajutor cu alcoolul · resurse OMS',
  'stats.findLocalServices': 'Găsește servicii în zona ta',

  // Y-07 · Goal editor
  'stats.less': 'Mai puțin',
  'stats.more': 'Mai mult',
  'stats.perWeek': 'pe săptămână',
  'stats.trackThisGoal': 'Urmărește obiectivul ăsta',
  'stats.goalsPrivate':
    'Obiectivele sunt ale tale. Nimic de aici nu e împărțit, clasat sau arătat altcuiva.',

  // Y-03 · Nights
  'stats.nightsTitle': 'Seri',
  // A bare "{count} înregistrate" has no noun to agree with, so the noun comes
  // back in — and with it the third form.
  'stats.nightsRecorded': {
    one: 'o seară înregistrată',
    few: '{count} seri înregistrate',
    other: '{count} de seri înregistrate',
  },
  'stats.nightsEmptyTitle': 'Încă nicio seară',
  'stats.nightsEmptyBody':
    'Fiecare seară pe care o notezi apare aici — unde ai fost, cu cine și cât a costat.',
  'stats.view': 'Afișare',
  'stats.viewList': 'Listă',
  'stats.viewCalendar': 'Calendar',
  'stats.nightRowFull': {
    one: '{date} · {duration} · o băutură · {money}',
    few: '{date} · {duration} · {count} băuturi · {money}',
    other: '{date} · {duration} · {count} de băuturi · {money}',
  },
  'stats.last12Weeks': 'ULTIMELE 12 SĂPTĂMÂNI',
  'stats.heatmapNote': 'Pătratele goale sunt serile fără alcool. Atinge unul plin ca să îl deschizi.',

  // Y-09 · Achievements
  'stats.achievementsCount': '{earned} din {total}',
  'stats.levelsNote':
    'Nivelurile vin din serile notate, din răspunsul la întrebarea de dimineață, din serile în care stai acasă și din locurile noi. Niciun punct nu vine din cât ai băut.',
  'stats.groupExploration': 'EXPLORARE',
  'stats.groupConsistency': 'CONSECVENȚĂ',
  'stats.groupModeration': 'MODERAȚIE',
  'stats.groupTogether': 'ÎMPREUNĂ',
  'stats.xp': '+{xp}',
  'stats.noVolumeNote': 'Nimic de aici nu răsplătește băutul mai mult. E intenționat.',

  // Y-11 · Passport
  'stats.passportEmptyTitle': 'Încă nicio ștampilă',
  'stats.passportEmptyBody':
    'Fiecare local unde notezi ceva îți aduce o ștampilă pe seară. Se umple mai repede decât crezi.',
  'stats.findSomewhere': 'Găsește un local',
  'stats.places': {
    one: 'un local',
    few: '{count} locale',
    other: '{count} de locale',
  },
  'stats.stampsCount': {
    one: 'o ștampilă',
    few: '{count} ștampile',
    other: '{count} de ștampile',
  },
  'stats.passportSubtitle': '{places} · {stamps}',
  'stats.stampLabel': {
    one: '{venue}, o ștampilă',
    few: '{venue}, {count} ștampile',
    other: '{venue}, {count} de ștampile',
  },
  'stats.stampTimes': '×{count}',
  'stats.passportNote': 'O ștampilă per local, per seară. Explorare, nu cantitate.',

  // Y-12 · Wrapped
  'stats.wrappedEyebrow': 'ROUNDS {year}',
  'stats.wrappedNights': {
    one: 'o seară',
    few: '{count} seri',
    other: '{count} de seri',
  },
  // "de {count} ori" is the ordinary way to count occasions, and above
  // nineteen it takes its own "de" as well: "de 20 de ori".
  'stats.wrappedNightsBody': {
    one: 'Ai ieșit o dată în {year}.',
    few: 'Ai ieșit de {count} ori în {year}.',
    other: 'Ai ieșit de {count} de ori în {year}.',
  },
  'stats.wrappedTopVenue': 'La {venue} ai fost mai des decât oriunde altundeva.',
  'stats.wrappedVaried': 'Ai variat.',
  'stats.wrappedSpendBody': 'Cât a costat anul, pe toate rândurile pe care le-ai notat.',
  'stats.wrappedQuietNights': {
    one: 'o seară liniștită',
    few: '{count} seri liniștite',
    other: '{count} de seri liniștite',
  },
  'stats.wrappedQuietBody': 'Și serile în care nu ai ieșit fac parte din poveste.',
  'stats.wrappedDrinks': {
    one: 'o băutură',
    few: '{count} băuturi',
    other: '{count} de băuturi',
  },
  'stats.wrappedDrinksBody': 'Simplu, fără grafic și fără comparație cu altcineva.',
  // An accessibility label on the tap target, so "ecran" rather than the
  // English-only "slide".
  'stats.nextSlide': 'Ecranul următor',
  'stats.tapToContinue': 'Atinge ca să continui',

  // Y-08 · Nicotine
  'stats.nicotine': 'Nicotină',
  'stats.nicotineOffTitle': 'Modulul ăsta e dezactivat',
  'stats.nicotineOffBody':
    'Urmărirea nicotinei e opțională și dezactivată implicit. Activeaz-o și aici apar consumul, costul și seriile de zile fără.',
  'stats.turnItOn': 'Activează',
  'stats.thisWeek': 'Săptămâna asta',
  'stats.logged': 'notate',
  'stats.freeStreak': 'Serie fără nicotină',
  'stats.nicotineNote':
    "Se notează aici, nu în lista de băuturi, și rămâne în afara istoricului tău — nicotina și alcoolul nu se amestecă niciodată într-un singur număr.",
  // S-15 · Report
  'stats.reportTitle': 'Raportează',
  'stats.reportedTitle': 'Raportat',
  'stats.reportThankYou': 'Mulțumim',
  'stats.reportThankYouBody':
    'Un om citește fiecare raportare, de obicei în 24 de ore. Nu primești răspuns decât dacă avem nevoie de ceva de la tine, iar persoana nu află niciodată cine a raportat-o.',
  // Romanian wants a clitic before a name here ("blochează-l pe …"), which
  // would gender the person; naming the account instead keeps it neutral.
  'stats.reportAlsoBlock': 'Blochează și utilizatorul {name}',
  'stats.sendReport': 'Trimite raportarea',
  'stats.whatHappened': 'CE S-A ÎNTÂMPLAT',
  'stats.reportDetail': 'Altceva de adăugat (opțional)',
  'stats.reasonHarassment': 'Hărțuire sau bullying',
  'stats.reasonSpam': 'Spam',
  'stats.reasonImpersonation': 'Uzurpare de identitate',
  'stats.reasonInappropriate': 'Conținut nepotrivit',
  'stats.reasonSafety': 'Îmi fac griji pentru siguranța cuiva',
  'stats.reasonOther': 'Altceva',

  // C-08 · Share card
  'stats.shareEmptyTitle': 'Nimic de trimis',
  'stats.shareEmptyBody': 'Seara aia nu e pe dispozitivul ăsta.',
  'stats.shareTitle': 'Trimite seara asta',
  'stats.shareMessage': {
    one: '{venue} · {duration} · un local — ROUNDS',
    few: '{venue} · {duration} · {count} locale — ROUNDS',
    other: '{venue} · {duration} · {count} de locale — ROUNDS',
  },
  'stats.shareDate': '{weekday} {date}',
  'stats.outCaption': 'în oraș',
  'stats.placeUnit': {
    one: 'local',
    few: 'locale',
    other: 'de locale',
  },
  'stats.shareNote':
    'Ritmul tău, estimarea ta și ce ai băut nu ajung niciodată pe o carte trimisă. Doar localuri, ore și oameni.',

  // the drink sheet
  'stats.everyDrink': 'Fiecare băutură',
  'stats.everyDrinkSubtitle': {
    one: 'o băutură desenată, niciun emoji',
    few: '{count} băuturi desenate, niciun emoji',
    other: '{count} de băuturi desenate, niciun emoji',
  },
  'stats.size': 'Mărime',
  // "chip" has no usable Romanian loan — "chipuri" reads as faces and
  // "chipsuri" as crisps — so the component is named for what it looks like.
  'stats.sizeChips': 'Ca pe etichete',
  'stats.sizeLarge': 'Mare',
  'stats.familyEveryday': 'Obișnuite',
  'stats.drinkGroupHeader': '{label} · {count}',
  'stats.drinkSpec': '{name}, {volume} mililitri, {abv} la sută',

  // A-13 · Legal viewer chrome
  // [DRAFT] is the literal marker the legal documents are scanned for, so it
  // stays in English.
  'stats.legalDraftNotice':
    'Secțiunile marcate cu [DRAFT] sunt provizorii, în așteptarea avocatului, și trebuie rezolvate înainte de trimitere.',
  'stats.legalUpdated': 'Ultima actualizare {date}',

  // +not-found
  'stats.notFoundTitle': 'Nimic aici',
  'stats.notFoundEmptyTitle': 'Linkul ăsta nu duce nicăieri',
  'stats.notFoundBody':
    'Pagina pe care o căutai nu există — sau seara la care ducea s-a terminat.',
  // "Diseară" names the tab, so it keeps its capital.
  'stats.backToTonight': 'Înapoi la Diseară',
  'stats.nicotineLogged': "Am notat: {what}",
  'stats.nicotineTonight': "ÎN SEARA ASTA",
  'stats.pouchMgHeader': "NICOTINĂ DIN PLICULEȚE SĂPTĂMÂNA ASTA",
  'stats.pouchMgValue': "{mg} mg",
  'stats.pouchMgNote': "Din pliculețe, care sunt etichetate. Țigările se numără, nu se cântăresc — vezi mai jos.",
  'stats.pouches': "Pliculețe",
  'stats.smoked': "Fumat",
  'stats.mg': "{mg} mg",
  'stats.pouchLabel': "{name}, {mg} miligrame",
  'stats.pouchCapNote': "Tăriile așa cum se vând. Legea românească limitează un pliculeț la {max} mg, așa că nimic mai tare nu apare aici.",
  'stats.noYieldNote': "Aici nu sunt miligrame, intenționat. Regulile UE au scos cifrele de nicotină de pe pachete pentru că făceau unele mărci să pară mai puțin dăunătoare. Numărarea este măsura cinstită.",
} satisfies Record<string, Message>;
