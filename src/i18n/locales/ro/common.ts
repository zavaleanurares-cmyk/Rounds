import type { Message } from '../../types';

export const common = {
  // "Diseară" also names the tab in stats.backToTonight — the two must stay
  // spelled the same way. Never "în seara asta".
  'common.tabTonight': 'Diseară',
  'common.tabDiscover': 'Descoperă',
  // The friends-and-crews tab. "Cercul" keeps the English's deliberate
  // vagueness — it is neither only prieteni nor only găști. A bare "Cerc"
  // reads as the shape, so the article stays.
  'common.tabCircle': 'Cercul',
  'common.tabYou': 'Tu',

  // The pace word — shouted in caps inside the ring, so short.
  'common.paceEasy': 'LEJER',
  'common.paceSteady': 'CONSTANT',
  'common.paceQuick': 'RAPID',
  'common.paceSlowDown': 'ÎNCETINEȘTE',

  'common.unitUnits': 'unități',
  'common.unitDrinks': 'băuturi',
  'common.approxUnits': '≈ {value} {unit}',

  'common.distanceMetres': '{value}m',
  'common.distanceKilometres': '{value}km',

  'common.categoryBeer': 'Bere & cidru',
  'common.categoryWine': 'Vin',
  // "Tării" is what people say; "băuturi spirtoase" is what a label says.
  'common.categorySpirit': 'Tării',
  // Spelled the way Romanian bar menus spell it, not the DOOM form "cocteil".
  'common.categoryCocktail': 'Cocktailuri',
  'common.categoryShot': 'Shoturi',
  // The category holds soft drinks; "Fără alcool" is what a menu says.
  'common.categorySoft': 'Fără alcool',
  'common.categoryWater': 'Apă',

  // The IBA family headings. The cocktails themselves keep their names; these
  // three headings are ordinary words and are translated.
  'common.ibaUnforgettable': 'De neuitat',
  'common.ibaContemporary': 'Clasice contemporane',
  'common.ibaNewEra': 'Băuturi din era nouă',

  'common.missingBrowser': 'Nu e disponibil într-un browser — deschide ROUNDS pe un telefon.',
  'common.missingDevBuild':
    'Are nevoie de un build de dezvoltare. Expo Go nu poate încărca cod nativ propriu.',
  'common.missingDevice': 'Nu e disponibil pe dispozitivul ăsta.',

  'common.channelSafety': 'Semne de viață',
  'common.channelMorning': 'Recapitulare de dimineață',
  'common.channelPlans': 'Planuri',
  'common.channelSocial': 'Prieteni și găști',
  'common.channelWeekly': 'Recapitulare săptămânală',
  'common.channelGamification': 'Realizări',

  // "Ai ajuns acasă?" would agree with the reader's gender in the participle;
  // "Ești acasă?" does not.
  'common.pushSafetyTitle': 'Ești acasă?',
  'common.pushSafetyBody':
    'Atinge ca să dai un semn de viață. Dacă nu, anunțăm persoanele tale de încredere în 15 minute.',
  'common.pushMorningTitle': 'Seara ta e gata',
  'common.pushMorningBody': 'Unde ai fost, cât a costat și golurile care merită completate.',
  'common.pushActionHomeSafe': 'Am ajuns acasă',
  'common.pushActionMoreTime': 'Mai dă-mi o oră',
  'common.pushExpoGoNote':
    'Expo Go nu are push de la distanță pe Android. Notificările locale — inclusiv semnul de viață — funcționează.',

  // Apple ships a Romanian iOS, but its own wording for "Sign in with Apple"
  // was not verified, so the feature is named in plain Romanian rather than
  // quoted wrongly. Swap in Apple's string once someone can check it.
  'common.authAppleNeedsIosBuild': 'Conectarea cu Apple are nevoie de un build de iOS.',
  'common.authAppleUnavailable': 'Conectarea cu Apple nu e disponibilă pe dispozitivul ăsta.',
  'common.authAppleNoToken': 'Apple nu a returnat un token de identitate.',
  'common.authGoogleNotConfigured': 'Conectarea cu Google nu e configurată în buildul ăsta.',
  'common.authGoogleNoToken': 'Google nu a returnat un token de identitate.',
  'common.authDidNotGoThrough': 'Nu a mers. Nu s-a schimbat nimic.',

  'common.mapPinVisited': '{name}, ai fost aici',

  'common.installTitle': 'Pune ROUNDS pe ecranul principal',
  // "Add to Home Screen" is iOS's own string, quoted from the share sheet. The
  // Romanian iOS wording was not verified, so the English is left in place
  // rather than guessed at — it must be replaced with Apple's exact Romanian
  // string before this ships.
  'common.installBodyIos':
    'Atinge butonul de trimitere, apoi „Add to Home Screen”. Se deschide pe tot ecranul, îți păstrează datele și merge fără semnal.',
  'common.installBody': 'Se deschide pe tot ecranul, îți păstrează datele și merge fără semnal.',
  'common.install': 'Instalează',

  'common.demoPlanNotificationTitle': 'Ana a adăugat un plan',
  'common.demoPlanNotificationBody': 'Vineri, ca lumea · 21:30',
  'common.demoRequestNotificationTitle': 'Sara ți-a trimis o cerere de prietenie',
  'common.demoRequestNotificationBody': 'Atinge ca să accepți sau să refuzi',
  'common.demoMorningNotificationTitle': 'Seara ta e gata',
  'common.demoMorningNotificationBody': 'Două localuri, 4h10. Completezi golurile?',

  // Achievements. Names are two or three words — they sit in a fixed row.
  'common.achFirstNightName': 'Prima seară',
  'common.achFirstNightHint': 'Notează o seară de la început până la sfârșit.',
  // An agent noun ("cel care completează") has to pick a gender; the result
  // does not, so every name in this set is a noun phrase instead.
  'common.achGapFillerName': 'Goluri completate',
  'common.achGapFillerHint': 'Completează golurile pe un ecran de a doua zi.',
  'common.achWeekOfLogsName': 'Șapte la rând',
  'common.achWeekOfLogsHint': 'Notează șapte seri.',
  'common.achMorningPersonName': 'Matinal',
  'common.achMorningPersonHint': 'Răspunde de cinci ori la „cum te simți”.',
  'common.achHonestEditorName': 'Corectură onestă',
  'common.achHonestEditorHint': 'Corectează o seară după ce s-a terminat.',
  'common.achFiveVenuesName': 'Cinci localuri',
  'common.achFiveVenuesHint': 'Notează în cinci localuri diferite.',
  'common.achTenVenuesName': 'Zece localuri',
  'common.achTenVenuesHint': 'Notează în zece localuri diferite.',
  'common.achNewPlaceName': 'Un local nou',
  'common.achNewPlaceHint': 'Mergi într-un local unde n-a fost nimeni din gașcă.',
  'common.achPassportPageName': 'Pagină de pașaport',
  'common.achPassportPageHint': 'Adună ștampile în trei localuri într-o lună.',
  // "Localnic" and "de-al locului" both gender the reader; "De-aici" does not.
  'common.achHomeCityName': 'De-aici',
  'common.achHomeCityHint': 'Notează de douăzeci de ori în același oraș.',
  'common.achFarAfieldName': 'În deplasare',
  'common.achFarAfieldHint': 'Notează o seară în alt oraș.',
  'common.achHydratedName': 'Hidratare',
  'common.achHydratedHint': 'Notează apă trei seri la rând.',
  'common.achDryWeekName': 'Săptămână fără alcool',
  'common.achDryWeekHint': 'Șapte seri fără nimic notat.',
  // Elides "alcool" from the line above it, the way Romanian does: "o
  // săptămână fără", "două săptămâni fără".
  'common.achDryFortnightName': 'Două săptămâni fără',
  'common.achDryFortnightHint': 'Paisprezece seri fără nimic notat.',
  'common.achUnderGoalName': 'Sub obiectiv',
  'common.achUnderGoalHint': 'Termină o săptămână sub limita ta săptămânală.',
  'common.achUnderGoalMonthName': 'O lună întreagă',
  'common.achUnderGoalMonthHint': 'Patru săptămâni sub limita ta săptămânală.',
  'common.achEarlyHomeName': 'Acasă până la 2',
  'common.achEarlyHomeHint': 'Termină trei seri înainte de 02:00.',
  'common.achWaterFirstName': 'Întâi apă',
  'common.achWaterFirstHint': 'Începe o seară cu apă.',
  'common.achSafeArrivalName': 'Semn de viață',
  'common.achSafeArrivalHint': 'Armează un semn de viață și dă-l la timp.',
  // "Nu singur" picks a gender. "Cu cineva" says the same thing and does not.
  'common.achFirstFriendName': 'Cu cineva',
  'common.achFirstFriendHint': 'Adaugă-ți primul prieten.',
  'common.achCrewFounderName': 'Gașcă întemeiată',
  'common.achCrewFounderHint': 'Creează o gașcă.',
  'common.achPlanMakerName': 'Plan reușit',
  'common.achPlanMakerHint': 'Fă un plan la care trei persoane spun da.',
  'common.achRoundBuyerName': 'Rândul tău',
  'common.achRoundBuyerHint': 'Fă cinste cu un rând pentru trei persoane.',
  'common.achLookedOutName': 'Persoană de încredere',
  'common.achLookedOutHint': 'Fii persoana de încredere a cuiva.',

  // The pace ring, spoken. Sentence case, unlike the shouted forms above.
  'common.paceSpokenEasy': 'Lejer',
  'common.paceSpokenSteady': 'Constant',
  'common.paceSpokenQuick': 'Rapid',
  'common.paceSpokenSlowDown': 'Încetinește',
  'common.paceLabel': {
    one: 'Ritmul: {word}. O băutură notată.',
    // 0 and 2–19
    few: 'Ritmul: {word}. {count} băuturi notate.',
    // 20 and up — takes "de"
    other: 'Ritmul: {word}. {count} de băuturi notate.',
  },
  // {minutes} is a second countable noun and it does not drive the plural —
  // only {count} does. So "minute" is correct for 1–19 and 100–119 and wrong
  // for 20–99, where Romanian wants "de minute". The tail needs its own
  'common.paceSince': {
    one: 'Ultima acum {count} minut.',
    few: 'Ultima acum {count} minute.',
    other: 'Ultima acum {count} de minute.',
  },
  'common.demoPlanTitle': 'Vineri, ca lumea',
  'common.demoPlanNote': 'Începem la Roots, restul îl decidem acolo.',
  'common.you': 'Tu',
} satisfies Record<string, Message>;
