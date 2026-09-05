import type { Message } from '../../types';

export const onboarding = {
  // shared
  'onboarding.continue': 'Continuă',

  // A-04 · Age gate
  // "Când te-ai născut?" agrees with the reader's gender in the participle.
  // The noun phrase does not — and it is the same wording as
  // social.cannotSeeBody, where this date is named.
  'onboarding.ageTitle': 'Data nașterii',
  'onboarding.ageSubtitle':
    'ROUNDS e pentru cine are vârsta legală ca să bea. Verificăm o dată și păstrăm răspunsul.',
  'onboarding.day': 'Zi',
  'onboarding.month': 'Luna',
  'onboarding.year': 'An',
  // The ages are the law, not copy: 18 and 21 stay exactly as they are, and the
  // wording is the same as auth.ageAndPaceNote.
  'onboarding.ageNote': '18+ în UE și în Regatul Unit · 21+ în Statele Unite.',
  // Three letters, lowercase, no full stop — the same shape as the weekday
  // abbreviations in stats.dayShort*.
  'onboarding.monthJan': 'ian',
  'onboarding.monthFeb': 'feb',
  'onboarding.monthMar': 'mar',
  'onboarding.monthApr': 'apr',
  'onboarding.monthMay': 'mai',
  'onboarding.monthJun': 'iun',
  'onboarding.monthJul': 'iul',
  'onboarding.monthAug': 'aug',
  'onboarding.monthSep': 'sep',
  'onboarding.monthOct': 'oct',
  'onboarding.monthNov': 'noi',
  'onboarding.monthDec': 'dec',

  // A-12 · Underage block
  'onboarding.blockedTitle': 'ROUNDS nu e încă pentru tine',
  'onboarding.blockedBody':
    'Ca să folosești ROUNDS trebuie să ai vârsta legală ca să bei în regiunea ta. Păstrăm răspunsul ăsta, așa că nu ai ce să încerci din nou aici.',
  'onboarding.blockedLink': 'Informații despre alcool și tineri',

  // A-05 · Identity
  'onboarding.identityTitle': 'Cine ești?',
  'onboarding.identitySubtitle': 'Prietenii tăi văd asta. Nimic altceva nu e public.',
  'onboarding.monogramNote': 'Fără poză, primești o monogramă colorată.',
  'onboarding.displayName': 'Nume afișat',
  'onboarding.displayNamePlaceholder': 'Rareș',
  // "Nume de utilizator" would stack a second "nume" right after the field
  // above it, so the field is named by what it is — the same choice
  // profile.handleLabel and social.username make.
  'onboarding.username': 'Utilizator',
  'onboarding.usernamePlaceholder': 'rares',
  'onboarding.usernameChecking': 'Se verifică…',
  'onboarding.usernameTaken': 'Îl are deja altcineva.',
  // 20 takes "de": "3–20 de caractere".
  'onboarding.usernameInvalid': '3–20 de caractere, litere, cifre și liniuță jos.',
  'onboarding.usernameFree': 'E al tău.',
  'onboarding.usernameHint': 'Așa te găsesc prietenii.',

  // A-07 · Region and units
  'onboarding.regionTitle': 'Unde bei?',
  'onboarding.regionSubtitle':
    'O „unitate” înseamnă altceva în fiecare loc. Alege-o pe a ta.',
  'onboarding.standardDrink': 'Băutura standard',
  'onboarding.unitSystem': 'Sistemul de unități',
  // These name the standard-drink standard, not the region — left as they are,
  // the same way an API name is.
  'onboarding.unitSystemEU': 'EU',
  'onboarding.unitSystemUK': 'UK',
  'onboarding.unitSystemUS': 'US',
  'onboarding.standardDrinkUS': 'O băutură = {grams} g de alcool.',
  'onboarding.standardDrinkUnit': 'O unitate = {grams} g de alcool.',
  'onboarding.standardDrinkNote':
    'Tot ce notezi e păstrat în grame și convertit aici, așa că, dacă schimbi asta mai târziu, istoricul tău nu se rescrie niciodată.',
  'onboarding.currency': 'Moneda',
  'onboarding.currencyNote':
    'Cheltuielile sunt cifra pentru care oamenii chiar se moderează. E opțională de fiecare dată când notezi.',

  // A-06 · Body basics
  // Same words as social.cannotSeeBody — it is the same data, named once.
  'onboarding.bodyTitle': 'Date despre corp',
  // Both promises of the English — doar pe telefonul ăsta, doar pentru
  // estimare — survive, and in the same order.
  'onboarding.bodySubtitle': 'Folosite doar pe telefonul ăsta, doar pentru estimarea ritmului.',
  'onboarding.skipThis': 'Sari peste',
  'onboarding.sex': 'Sex',
  'onboarding.sexFemale': 'Femeie',
  'onboarding.sexMale': 'Bărbat',
  // The English is the reader's own choice, not a missing value, so it stays in
  // the first person rather than becoming a neutral "Nespecificat".
  'onboarding.sexUnspecified': 'Prefer să nu',
  'onboarding.weight': 'Greutate',
  'onboarding.decreaseWeight': 'Scade greutatea',
  'onboarding.increaseWeight': 'Crește greutatea',
  'onboarding.weightUnitKg': 'kg',
  'onboarding.weightUnitLb': 'lb',
  'onboarding.bodyNote':
    'Inelul de ritm devine mult mai exact cu ele. Poți să le adaugi oricând.',

  // A-08 · Intent
  'onboarding.intentTitle': 'Pentru ce e?',
  'onboarding.intentSubtitle':
    'Alege ce e adevărat. Schimbă doar ce îți arătăm în prima săptămână, nimic altceva.',
  'onboarding.intentTrack': 'Să țin evidența',
  'onboarding.intentSocial': 'Să ies cu oameni',
  // "Să beau mai puțin" makes a claim the English does not; "s-o las mai
  // moale" is the same hedged idiom as "take it easier".
  'onboarding.intentEasier': 'S-o las mai moale',
  'onboarding.intentNote': 'Poți să alegi mai multe sau niciuna.',

  // A-09 · Modules
  'onboarding.modulesTitle': 'Altceva?',
  'onboarding.modulesSubtitle': 'Amândouă sunt opționale. Le poți schimba oricând în Setări.',
  // Same names as settings.nicotineTracking and settings.socialFeatures.
  'onboarding.nicotineTitle': 'Urmărirea nicotinei',
  'onboarding.nicotineSubtitle':
    'Țigări, vape-uri și pliculețe, cu cost și serii de zile fără.',
  'onboarding.socialTitle': 'Funcții sociale',
  'onboarding.socialSubtitle':
    'Prieteni, găști, seri în comun și planuri. Dacă oprești asta, ROUNDS devine complet privat.',
  'onboarding.modulesNote':
    'Cu partea socială oprită, păstrezi ritmul, cheltuielile, istoricul și tot ce ține de Ajungi acasă cu bine.',

  // A-10 · Notification primer
  // "Trei lucruri pe care ți le-am trimite" does not fit the single-line 34pt
  // title; the three cards under it already do the counting.
  'onboarding.permissionsTitle': 'Ce ți-am trimite',
  'onboarding.permissionsSubtitle':
    'Niciodată în timpul unei seri în desfășurare. Implicit, cel mult trei pe săptămână.',
  'onboarding.pushMorningTitle': 'Dimineața de după',
  'onboarding.pushMorningBody':
    'O notificare la ora la care te trezești de obicei, cu seara și golurile de completat.',
  'onboarding.pushSafetyTitle': 'Semn de viață',
  'onboarding.pushSafetyBody':
    'Dacă ai armat un semn de viață și trece ora, te întrebăm pe tine înainte să întrebăm pe altcineva.',
  'onboarding.pushPlansTitle': 'Planuri',
  'onboarding.pushPlansBody': 'Când te invită cineva sau când un plan e pe cale să înceapă.',
  'onboarding.allowNotifications': 'Permite notificările',
  'onboarding.notNow': 'Nu acum',
  'onboarding.androidNote':
    'Android o să te întrebe imediat după. E în regulă dacă refuzi — semnele de viață funcționează în continuare în aplicație.',

  // A-11 · Ready
  // "Ești gata" works because "gata" is invariable — "Ești pregătit" would
  // gender the reader.
  'onboarding.doneTitle': 'Ești gata',
  'onboarding.doneSubtitle': 'Trei lucruri de știut înainte de prima ta seară.',
  'onboarding.takeMeIn': 'Hai să intrăm',
  // "Diseară" is the tab's name, so it is spelled the way common.tabTonight
  // spells it and keeps its capital.
  'onboarding.markTonight':
    'Diseară își schimbă forma pe parcursul serii — plan, în desfășurare, final de seară, dimineață.',
  'onboarding.markLog':
    'Butonul din mijloc notează o băutură. De pe ecranul blocat e o singură atingere.',
  'onboarding.markSafety': 'Ajungi acasă cu bine e la îndemână de oriunde și e mereu gratuit.',
} satisfies Record<string, Message>;
