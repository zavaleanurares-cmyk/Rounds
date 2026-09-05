import type { Message } from '../../types';

export const social = {
  // Same word as common.tabCircle — this is the screen that tab opens, and a
  // bare "Cerc" reads as the shape, so the article stays.
  'social.title': 'Cercul',
  'social.notifications': 'Notificări',

  // night one
  'social.emptyTitle': 'Încă nu e nimeni aici',
  'social.emptyBody':
    'ROUNDS e mai bun cu oamenii cu care ieși de fapt. Găsește-i după utilizator sau potrivește-ți contactele — numerele sunt transformate în hashuri pe telefonul tău și nu sunt trimise niciodată.',
  'social.findPeople': 'Găsește oameni',
  'social.yourCode': 'CODUL TĂU',
  'social.handle': '@{username}',
  'social.usernameFallback': 'tu',
  'social.shareIt': 'Trimite-l',
  'social.shareMessage': 'Adaugă-mă pe ROUNDS: @{username}',

  // the list
  'social.friendRequests': {
    one: 'o cerere de prietenie',
    // 0 and 2–19
    few: '{count} cereri de prietenie',
    // 20 and up — takes "de"
    other: '{count} de cereri de prietenie',
  },
  // "Ieșiți" would gender the people in the list; "în oraș" does not, and it
  // is the phrase stats.outCaption already uses.
  'social.outRightNow': 'ÎN ORAȘ ACUM',
  'social.outNowLabel': '{name}, în oraș acum',
  'social.outNow': 'în oraș',
  'social.crews': 'GĂȘTI',
  'social.makeCrew': 'Fă o gașcă',
  // The count follows the noun here, so it never takes "de" — "PRIETENI · 20",
  // not "PRIETENI · 20 de". Only the noun itself changes.
  'social.friendsHeader': {
    one: 'PRIETEN · {count}',
    few: 'PRIETENI · {count}',
    other: 'PRIETENI · {count}',
  },
  'social.nightsTogether': {
    one: 'o seară împreună',
    few: '{count} seri împreună',
    other: '{count} de seri împreună',
  },
  'social.noNightsTogether': 'încă nicio seară împreună',
  'social.joinNight': 'Intră într-o seară',

  // C-02 · find people
  // "Nume de utilizator" is what a form calls it; profile.handleLabel already
  // shortens it to the one word people say.
  'social.username': 'Utilizator',
  'social.usernamePlaceholder': 'anam',
  'social.rateLimited': 'Ai trimis multe cereri azi. Încearcă din nou mâine.',
  'social.handleCrews': '@{username} · {crews}',
  'social.add': 'Adaugă',
  // The request is feminine (o cerere), so the participle agrees with it.
  'social.requestSent': 'Trimisă',
  'social.noResults': 'Nimeni cu utilizatorul ăsta.',
  // Echoes the feature's own name in settings.contactMatching.
  'social.matchContacts': 'Potrivește-mi contactele',

  // C-03 · person profile
  'social.profileTitle': 'Profil',
  'social.personUnavailableTitle': 'Nu e disponibil',
  'social.personUnavailableBody': 'Persoana asta nu e vizibilă pentru tine.',
  'social.handleLevel': '@{username} · nivelul {level}',
  'social.addFriend': 'Adaugă la prieteni',
  'social.removeFriend': 'Șterge din prieteni',
  'social.block': 'Blochează',
  'social.unblock': 'Deblochează',
  'social.report': 'Raportează',
  // "Îl blochezi pe {name}?" needs a clitic that genders the person; naming
  // the account instead keeps it neutral — the same choice stats.reportAlsoBlock
  // makes.
  'social.blockConfirmTitle': 'Blochezi utilizatorul {name}?',
  'social.blockConfirmBody':
    'Nu o să te mai poată găsi, nu o să-ți vadă serile și nu o să mai apară nicăieri în aplicația ta. Nu află nimic.',
  'social.nightsTogetherLabel': 'Seri împreună',
  'social.mutualCrews': 'Găști în comun',
  'social.whatYouDontSee': 'CE NU VEZI AICI',
  'social.whatYouDontSeeBody':
    'Cât bea, ce serii are sau vreo comparație cu tine. ROUNDS nu clasează niciodată oamenii după ceva ce se poate număra la alcool.',

  // C-04 · contact match
  'social.contactsTitle': 'Găsește prieteni din contacte',
  'social.contactsPrivacy':
    'Numerele tale sunt transformate în hashuri pe dispozitivul ăsta înainte să plece ceva. Numerele brute nu îți părăsesc niciodată telefonul și nu păstrăm lista ta de contacte.',
  'social.contactsNone': 'Nimeni din contactele tale nu e încă pe ROUNDS.',

  // C-09 · crew detail
  'social.crewTitle': 'Gașcă',
  // "Nu am găsit-o" would agree with what was not found; the impersonal form
  // works the same for o gașcă, un plan and un local.
  'social.crewNotFoundTitle': 'Nu am găsit nimic',
  'social.crewNotFoundBody': 'Nicio gașcă cu numele ăsta.',
  // Same verb as common.achPlanMakerHint — faci un plan.
  'social.planSomething': 'Fă un plan',
  'social.plans': 'PLANURI',
  'social.crewNoPlans': 'Nimic în calendar. O gașcă fără niciun plan e doar un grup de chat.',
  'social.crewPlanWhen': '{day} {time}',
  'social.together': 'ÎMPREUNĂ',
  'social.togetherNote':
    'Serile ieșite împreună, localurile explorate, misiunile duse la capăt. Niciodată băuturile.',
  'social.you': 'Tu',
  'social.boardPlaces': {
    one: 'un local',
    few: '{count} locale',
    other: '{count} de locale',
  },
  'social.boardRow': {
    one: 'o seară · {places}',
    few: '{count} seri · {places}',
    other: '{count} de seri · {places}',
  },
  'social.members': 'MEMBRI',

  // C-10 · create crew
  'social.newCrewTitle': 'Gașcă nouă',
  'social.create': 'Creează',
  'social.crewCreated': 'Am creat {name}',
  'social.crewNameLabel': 'Nume',
  // An example crew name, not a proper noun — it is already the Romanian for
  // Friday, so it stays as it is here and becomes the weekday in fr and es.
  'social.crewNamePlaceholder': 'Vineri',
  // The crew's little emblem, picked next to its colour. "Marcă" reads as a
  // brand, so "Semn".
  'social.mark': 'SEMN',
  'social.colour': 'CULOARE',
  // Same wording as profile.colourNumbered — it is the same swatch.
  'social.colourIndex': 'Culoarea {index}',

  // C-11 · join crew
  'social.joinCrewTitle': 'Intră într-o gașcă',
  'social.join': 'Intră',
  'social.joinCrewUnknown': 'Nicio gașcă cu codul ăsta. Verifică-l cu cine ți l-a trimis.',
  'social.joinedCrew': 'Ești în {name}',
  'social.crewCodeLabel': 'Codul sau linkul găștii',
  'social.crewCodeHint': 'Cine se ocupă de gașcă îți poate trimite unul din ecranul găștii.',

  // C-12 · friend requests
  'social.requestsTitle': 'Cereri',
  'social.requestsEmptyTitle': 'Nimic în așteptare',
  'social.requestsEmptyBody':
    'Cererile de prietenie apar aici, și cele pe care le primești, și cele pe care le trimiți.',
  'social.incoming': 'PRIMITE',
  'social.accept': 'Acceptă',
  'social.decline': 'Nu',
  'social.sentHeader': 'TRIMISE',

  // Y-02 · what friends see
  'social.previewTitle': 'Ce văd prietenii',
  'social.previewSubtitle': 'Profilul tău, văzut din partea cealaltă.',
  'social.perPerson': 'de persoană',
  'social.whatTheyCannotSee': 'CE NU POT SĂ VADĂ',
  'social.bulletLine': '· {line}',
  'social.cannotSeeVolume': 'Cât bei, niciodată',
  'social.cannotSeePace': 'Ritmul tău, estimarea ta, curba ritmului tău',
  'social.cannotSeeSpend': 'Cheltuielile tale, obiectivele tale, seriile tale',
  // A bullet under "ce nu pot să vadă", so it stays a plain noun phrase —
  // "niciuna dintre serile tale" here would double the negative. The verb has
  // no subject pronoun so it does not gender the friends.
  'social.cannotSeeNights': {
    one: 'Seara ta, decât dacă au fost acolo sau ai trimis-o tu',
    few: 'Cele {count} seri ale tale, decât dacă au fost acolo sau le-ai trimis tu',
    other: 'Cele {count} de seri ale tale, decât dacă au fost acolo sau le-ai trimis tu',
  },
  'social.cannotSeeBody': 'Datele tale despre corp, data nașterii, locația ta',
  'social.notABenchmark': 'Un prieten nu e un etalon. Nu e nimic de comparat aici.',
  'social.leaveCrew': 'Ieși din gașcă',
  'social.leaveCrewTitle': 'Ieși din {name}?',
  'social.leaveCrewBody': 'Nu-i mai vezi planurile. Gașca merge mai departe fără tine și poți fi adăugat înapoi.',
  'social.contactsRefused': 'Nicio problemă — ROUNDS nu-ți poate citi contactele fără permisiune. Poți adăuga oameni după utilizator.',
  'social.beFindable': 'SĂ POȚI FI GĂSIT',
  'social.beFindableBody': 'Separat, intenționat. Faptul că îți cauți prietenii nu te face găsibil de toți cei care au numărul tău.',
  'social.yourNumber': 'Numărul tău',
  'social.numberHint': 'Se criptează pe telefonul ăsta. Numărul în sine nu se trimite și nu se stochează niciodată.',
  'social.findableSaved': 'Salvat. Cine are numărul tău te poate găsi.',
  'social.makeFindable': 'Vreau să pot fi găsit',
  'social.numberPlaceholder': '+40 700 000 000',

  // a friend request the server declined
  'social.requestSelf': "Acesta ești tu.",
  'social.searchOffline': "Căutarea nu este posibilă acum. Verifică-ți conexiunea.",
} satisfies Record<string, Message>;
