import type { Message } from '../../types';

export const settings = {
  // S-01 · Settings home
  'settings.groupYou': 'TU',
  'settings.groupApp': 'APLICAȚIA',
  'settings.groupSafetyPeople': 'SIGURANȚĂ & OAMENI',
  'settings.groupDeveloper': 'DEZVOLTATOR',
  'settings.unitsRegion': 'Unități & regiune',
  'settings.appearance': 'Aspect',
  'settings.modules': 'Module',
  'settings.modulesNicotineOn': 'Nicotina activată',
  'settings.modulesDefault': 'Implicit',
  'settings.notifications': 'Notificări',
  'settings.privacy': 'Confidențialitate',
  'settings.safety': 'Siguranță',
  'settings.safetyContacts': {
    one: 'un contact',
    // 0 and 2–19
    few: '{count} contacte',
    // 20 and up — takes "de"
    other: '{count} de contacte',
  },
  'settings.safetyNotSetUp': 'Nu e configurat',
  'settings.systemSurfaces': 'Suprafețe de sistem',
  'settings.systemSurfacesSubtitle': 'Live Activity, widgeturi, Siri, ceas',
  'settings.blockedUsers': 'Utilizatori blocați',
  'settings.dataAccount': 'Date & cont',
  'settings.helpLegal': 'Ajutor & informații legale',
  'settings.demoData': 'Date demo',
  'settings.demoDataSubtitle': 'Umple aplicația cu 14 săptămâni de istoric plauzibil',
  'settings.everyDrink': 'Fiecare băutură',
  // "Toate cele" only works with a real plural, so the singular drops it along
  // with {count}.
  'settings.everyDrinkSubtitle': {
    one: 'Un singur glif, desenat',
    few: 'Toate cele {count} glife, desenate',
    other: 'Toate cele {count} de glife, desenate',
  },
  'settings.signOut': 'Deconectează-te',
  'settings.versionLine': 'ROUNDS {version} · @{username}',
  'settings.usernameFallback': 'tu',
  'settings.handle': '@{username}',

  // S-02 · Appearance, motion and sound
  // "Accent" as a design word does not exist informally in Romanian; a person
  // talking about a colour picker says "culoare".
  'settings.nightAccent': 'CULOAREA SERII',
  'settings.accentLabel': 'Culoarea {index}',
  'settings.accentNote':
    'Fiecare seară primește culoarea ei, ca istoricul tău să aibă culoare. Aici alegi culoarea de la care pornește ROUNDS.',
  'settings.dimAfter1am': 'Estompează după ora 1',
  'settings.dimAfter1amSubtitle': 'Scade aurora și crește contrastul într-o noapte târzie',
  'settings.reduceMotion': 'Redu animațiile',
  'settings.reduceMotionSubtitle': 'Urmează și setarea din telefon',
  // Device feedback — vibration and sound — not user feedback about the app.
  // "Feedback" is the ordinary Romanian word for both, so it needs no gloss.
  'settings.groupFeedback': 'FEEDBACK',
  'settings.haptics': 'Vibrații',
  'settings.hapticsSubtitle': 'O atingere scurtă când se întâmplă ceva',
  'settings.sound': 'Sunet',
  'settings.soundSubtitle':
    'Dezactivat implicit. Nu se aude niciodată când telefonul e pe silențios.',
  'settings.hearThem': 'ASCULTĂ-LE',
  'settings.cueLog': 'O băutură',
  'settings.cueRound': 'Un rând',
  'settings.cueStart': 'Începe seara',
  'settings.cueEnd': 'Se termină seara',
  'settings.cueLevelUp': 'Nivel nou',
  'settings.playCue': 'Ascultă {label}',

  // S-03 · Units & region
  'settings.standardDrinkHeader': 'BĂUTURA STANDARD',
  'settings.unitSystemLabel': 'Sistemul de unități',
  // These name the standard-drink standard, not the region — left as they are,
  // the same way an API name is.
  'settings.unitSystemEU': 'EU',
  'settings.unitSystemUK': 'UK',
  'settings.unitSystemUS': 'US',
  'settings.standardDrinkNote':
    'O unitate = {grams} g de alcool. Istoricul tău e păstrat în grame, așa că asta schimbă doar felul în care sunt afișate cifrele — niciodată ce înseamnă ele.',
  'settings.currencyHeader': 'MONEDĂ',
  'settings.currencyLabel': 'Moneda',
  'settings.paceReadoutHeader': 'AFIȘAREA RITMULUI',
  'settings.showEstimate': 'Arată estimarea în ‰',
  'settings.showEstimateSubtitle':
    'Dezactivat implicit. Cuvântul care descrie ritmul e adevărata măsură — te compară cu vinerea ta obișnuită, ceea ce cifra nu poate face.',
  'settings.estimateNote':
    'Fie că e afișată, fie că nu, cifra e o estimare pornită de la medii pe populație, e calculată pe telefonul tău și nu e trimisă nicăieri, și dispare complet când ROUNDS îți spune să încetinești. Nu o folosi niciodată ca să decizi dacă poți conduce.',

  // S-04 · Modules
  'settings.nicotineTracking': 'Urmărirea nicotinei',
  'settings.nicotineTrackingSubtitle':
    'Adaugă un panou separat. Niciodată amestecată cu istoricul băuturilor.',
  'settings.socialFeatures': 'Funcții sociale',
  'settings.socialFeaturesSubtitle': 'Prieteni, găști, seri în comun, planuri',
  'settings.socialOffNote':
    'Cu partea socială oprită, ROUNDS e complet privat: ritmul, cheltuielile, istoricul, obiectivele și tot ce ține de Ajungi acasă cu bine funcționează în continuare.',

  // S-05 · Notifications
  'settings.notificationsSubtitle':
    'Limitate implicit la trei pe săptămână. Niciodată în timpul unei seri în desfășurare.',
  'settings.morningRecap': 'Recapitulare de dimineață',
  'settings.morningRecapSubtitle': 'O notificare la ora la care te trezești de obicei',
  'settings.weeklyRecap': 'Recapitulare săptămânală',
  'settings.plans': 'Planuri',
  'settings.plansSubtitle': 'Invitații și memento-uri',
  'settings.social': 'Social',
  'settings.socialSubtitle': 'Cereri de prietenie și activitatea găștii',
  'settings.safetyNotificationsSubtitle': 'Memento-uri pentru semnul de viață și escaladare',
  'settings.safetyArmedNote': 'Nu pot fi oprite cât timp un semn de viață e armat.',
  'settings.achievements': 'Realizări',
  'settings.achievementsSubtitle': 'Dezactivat implicit',
  'settings.notificationsLiveNote':
    'ROUNDS nu trimite niciodată o notificare în timpul unei seri în desfășurare. Să deranjezi pe cineva care e ieșit e cel mai rapid mod să ți se șteargă aplicația.',

  // S-06 · Privacy
  'settings.privateAccount': 'Cont privat',
  'settings.privateAccountSubtitle': 'Te pot găsi doar oamenii pe care i-ai acceptat',
  'settings.contactMatching': 'Potrivire după contacte',
  'settings.contactMatchingSubtitle':
    'Numerele sunt transformate în hashuri pe dispozitivul ăsta. Numerele brute nu îți părăsesc niciodată telefonul.',
  'settings.shareLocationDefault': 'Partajează locația implicit',
  'settings.shareLocationDefaultSubtitle': 'Tot alegi seară de seară; asta doar o bifează dinainte',
  'settings.defaultVisibilityHeader': 'VIZIBILITATEA IMPLICITĂ A SERII',
  'settings.defaultVisibilityLabel': 'Vizibilitate implicită',
  'settings.visibilityPrivate': 'Privat',
  'settings.visibilityFriends': 'Prieteni',
  'settings.visibilityCrew': 'Gașca',
  'settings.privacyNote':
    'Estimarea ritmului tău e calculată pe telefonul ăsta și nu e niciodată stocată sau trimisă undeva. Locația se împarte seară de seară, doar cu participanții, și expiră când se termină seara.',

  // S-07 · Safety settings
  'settings.trustedContacts': 'Persoane de încredere',
  // A bare ratio — no noun, so no "de" and no third form to differ.
  'settings.contactsOfMax': {
    one: '{count} din {max}',
    few: '{count} din {max}',
    other: '{count} din {max}',
  },
  'settings.armCheckIn': 'Armează un semn de viață',
  'settings.getHomeSafe': 'Ajungi acasă cu bine',
  'settings.homeAddressHeader': 'ADRESA DE ACASĂ',
  'settings.homeAddressNote':
    'Păstrată doar pe dispozitivul ăsta. Se folosește ca să îți completeze dinainte drumul spre casă.',
  'settings.homeAddressPlaceholder': 'Stradă, oraș',
  'settings.safetyFreeNote':
    'Tot ce ține de Ajungi acasă cu bine e gratuit pentru totdeauna. ROUNDS nu va pune niciodată un abonament în fața lui.',

  // S-11 · Blocked users
  'settings.blockedTitle': 'Blocați',
  'settings.blockedEmptyTitle': 'Nimeni blocat',
  'settings.blockedEmptyBody':
    'Dacă blochezi pe cineva din profilul lui, îl scoți din căutare, dintre prietenii tăi, din orice gașcă, din orice seară în desfășurare și din orice plan — imediat, și în ambele sensuri.',
  'settings.unblock': 'Deblochează',

  // S-12 · Data & account
  'settings.exportHeader': 'EXPORT',
  // "rând" is both a spreadsheet row and a round of drinks, so a CSV row is
  // "linie" here to keep the two apart.
  'settings.exportBody':
    'Tot ce are ROUNDS despre tine. JSON păstrează fiecare câmp; CSV are câte o linie pentru fiecare băutură, gata de pus într-un tabel. Ambele gratuite, mereu.',
  'settings.exportMyData': 'Exportă-mi datele',
  'settings.exportAsCsv': 'Exportă ca CSV',
  'settings.exportDataCopied': 'Datele tale sunt în clipboard',
  'settings.exportCsvCopied': 'CSV-ul tău e în clipboard',
  'settings.deleteAccountHeader': 'ȘTERGE CONTUL',
  'settings.deleteAccountBody':
    'Ești deconectat imediat. Totul se șterge printr-o cascadă pe server după o perioadă de grație de 30 de zile — conectează-te la loc în 30 de zile și nu s-a pierdut nimic.',
  'settings.deleteMyAccount': 'Șterge-mi contul',
  // DELETE is the literal word the field is checked against — never translated.
  'settings.typeDeleteToConfirm': 'Scrie DELETE ca să confirmi',
  'settings.deleteEverything': 'Șterge tot',
  'settings.neverMind': 'Lasă',
  'settings.pendingSync': {
    one: 'O băutură încă așteaptă sincronizarea. Va fi inclusă.',
    few: '{count} băuturi încă așteaptă sincronizarea. Vor fi incluse.',
    other: '{count} de băuturi încă așteaptă sincronizarea. Vor fi incluse.',
  },
  'settings.allSynced': 'Tot ce e pe dispozitivul ăsta e sincronizat.',

  // S-13 · Help & legal
  'settings.groupLegal': 'LEGAL',
  'settings.termsOfService': 'Termeni și condiții',
  'settings.privacyPolicy': 'Politica de confidențialitate',
  'settings.groupSupport': 'ASISTENȚĂ',
  'settings.contactSupport': 'Contactează asistența',
  'settings.reportProblem': 'Raportează o problemă',
  'settings.groupDrinkingSupport': 'AJUTOR CU ALCOOLUL',
  'settings.helplines': 'Linii de ajutor din regiunea ta',
  'settings.helplinesSubtitle': 'Gratuite și confidențiale',
  // WHO is an organisation with a Romanian name and acronym, unlike ROUNDS.
  'settings.whoAlcoholHealth': 'OMS · alcool și sănătate',
  'settings.paceDisclaimer':
    'Estimarea ritmului din ROUNDS nu e un etilotest și nu e sfat medical. Nu poate ține cont de mâncare, de medicamente, de o boală sau de o băutură pe care ai uitat să o notezi. Nu o folosi niciodată ca să decizi dacă poți conduce.',

  // Demo data (developer utility)
  'settings.demoNights': {
    one: 'o seară',
    few: '{count} seri',
    other: '{count} de seri',
  },
  // {nights} arrives already formatted by settings.demoNights, so it carries
  // its own "de" when it needs one.
  'settings.demoCurrent': {
    one: 'Momentan o băutură în {nights}.',
    few: 'Momentan {count} băuturi în {nights}.',
    other: 'Momentan {count} de băuturi în {nights}.',
  },
  'settings.fillHistory': 'Umple cu 14 săptămâni de istoric',
  'settings.historyAdded': 'Istoric adăugat',
  'settings.backToNightOne': 'Înapoi la prima seară',
  'settings.cleared': 'Șters',
  'settings.nightOneNote':
    'Prima seară e ce vede un utilizator nou. Fiecare ecran cu date are o stare desenată pentru ea.',

  // System surfaces · the diagnostics screen
  'settings.surfacesSubtitle': 'Notezi fără să deschizi aplicația.',
  'settings.loggedOutsideHeader': 'NOTAT ÎN AFARA APLICAȚIEI',
  'settings.percent': '{value}%',
  // {outside} is a bare count, {count} is the total — the plural rides on
  // {count}, which is the one that takes "de".
  'settings.outsideShare': {
    one: '{outside} dintr-o băutură notată. Ținta e 40% — sub asta, suprafețele de pe ecranul blocat nu își fac treaba și aplicația cere efort exact în momentul în care oamenii au cel mai puțin.',
    few: '{outside} din {count} băuturi notate. Ținta e 40% — sub asta, suprafețele de pe ecranul blocat nu își fac treaba și aplicația cere efort exact în momentul în care oamenii au cel mai puțin.',
    other:
      '{outside} din {count} de băuturi notate. Ținta e 40% — sub asta, suprafețele de pe ecranul blocat nu își fac treaba și aplicația cere efort exact în momentul în care oamenii au cel mai puțin.',
  },
  'settings.devBuildNote':
    'Astea au nevoie de un build de dezvoltare. Live Activities, WidgetKit, App Intents, comenzile din Centrul de control, serviciile de prim-plan și dalele din Setări rapide nu pot rula în Expo Go sau într-un browser — pluginul de configurare din `modules/rounds-native` adaugă țintele la `expo prebuild`.',

  'settings.buildCanDoHeader': 'CE POATE FACE BUILDUL ĂSTA',
  'settings.capMap': 'Hartă',
  'settings.capMapReal': 'hartă reală',
  'settings.capMapProjected': 'puncte proiectate',
  'settings.capScanner': 'Scaner QR',
  'settings.capScannerCamera': 'cameră',
  'settings.capScannerCodeOnly': 'doar introducerea codului',
  'settings.capLocation': 'Locație',
  'settings.capAvailable': 'disponibilă',
  'settings.capUnavailable': 'indisponibilă',
  'settings.capNotificationsLocal': 'locale · {status}',
  'settings.capRemotePush': 'Push de la distanță',
  'settings.capPurchases': 'Cumpărături',
  'settings.capPurchasesConnected': 'magazin conectat',
  'settings.capBackend': 'Backend',
  'settings.capBackendOnDevice': 'doar pe dispozitiv',
  'settings.turnOnNotifications': 'Activează notificările',

  'settings.onThisPlatformHeader': 'PE PLATFORMA ASTA',
  'settings.platformHud': 'HUD',
  'settings.platformWidgets': 'Widgeturi',
  'settings.platformQuickToggle': 'Comutare rapidă',
  'settings.platformVoice': 'Voce',
  'settings.platformNativeModule': 'Modul nativ',
  'settings.platformAttached': 'atașat',
  'settings.platformNotInBuild': 'nu e în buildul ăsta',

  // Platform API names — Live Activity, Dynamic Island, WidgetKit, App Intent,
  // App Actions, AppWidget — are left alone; the prose around them is not.
  'settings.theEightHeader': 'CELE OPT',
  'settings.surfaceRow': '{id} · {name}',
  'settings.surfaceHudName': 'HUD de seară în desfășurare',
  'settings.surfaceHudIos': 'Live Activity + Dynamic Island',
  'settings.surfaceHudAndroid': 'Notificare permanentă',
  'settings.surfaceQuickLogName': 'Notare dintr-o atingere',
  'settings.surfaceQuickLogIos': 'Buton App Intent',
  'settings.surfaceQuickLogAndroid': 'Acțiune de notificare',
  'settings.surfaceWidgetSmallName': 'Widget · mic',
  'settings.surfaceWidgetSmallIos': 'WidgetKit',
  'settings.surfaceWidgetSmallAndroid': 'AppWidget 2×2',
  'settings.surfaceWidgetMediumName': 'Widget · mediu',
  'settings.surfaceWidgetMediumIos': 'WidgetKit, interactiv',
  'settings.surfaceWidgetMediumAndroid': 'AppWidget 4×2',
  'settings.surfaceWidgetLargeName': 'Widget · mare',
  'settings.surfaceWidgetLargeIos': 'Hartă termică pe an',
  'settings.surfaceWidgetLargeAndroid': 'AppWidget 4×4',
  'settings.surfaceTileName': 'Comutare rapidă',
  'settings.surfaceTileIos': 'Comandă din Centrul de control',
  'settings.surfaceTileAndroid': 'Dală din Setări rapide',
  'settings.surfaceVoiceName': 'Voce',
  'settings.surfaceVoiceIos': 'App Intents / Siri',
  'settings.surfaceVoiceAndroid': 'App Actions',
  'settings.surfaceWatchName': 'Ceas',
  'settings.surfaceWatchIos': 'Aplicație watchOS',
  'settings.surfaceWatchAndroid': 'Dală Wear OS',

  'settings.theRuleHeader': 'REGULA',
  'settings.theRuleBody':
    'Fiecare dintre astea scrie prin aceeași coadă offline ca fereastra de notare, cu un UUID pe care și-l generează singură. Nu există niciodată o a doua cale de scriere — de asta un ceas care se sincronizează cu o oră întârziere nu poate transforma o băutură în două.',
  'settings.sharedContainerPending': {
    one: 'O băutură așteaptă în containerul partajat.',
    few: '{count} băuturi așteaptă în containerul partajat.',
    other: '{count} de băuturi așteaptă în containerul partajat.',
  },

  'settings.diagnosticsHeader': 'DIAGNOSTICARE',
  'settings.diagBuild': 'Build',
  'settings.diagBuildDevelopment': 'dezvoltare',
  'settings.diagBuildWeb': 'web',
  'settings.diagEntitlement': 'Drept de acces (server)',
  'settings.diagEntitlementPaid': 'plătit',
  'settings.diagEntitlementFree': 'gratuit',
  'settings.sendDiagnostics': 'Trimite datele de diagnosticare',
  'settings.sendDiagnosticsSubtitle':
    'Doar numere și categorii — niciodată o băutură, un local sau o persoană',
  'settings.language': 'Limbă',
  'settings.languageGroup': 'LIMBĂ',
  'settings.languageFollowPhone': 'Ia limba telefonului',
  'settings.languageCurrently': 'Acum {name}',
  'settings.languageNote':
    'Se schimbă doar ROUNDS. Are efect imediat — nu descarci nimic și nu repornești nimic.',
} satisfies Record<string, Message>;
