import type { Message } from '../../types';

/**
 * Siguranța, în română.
 *
 * Două reguli pentru tot fișierul:
 *
 *  · Fiecare propoziție e întreagă. Nimic nu e lipit din bucăți, fiindcă
 *    ordinea cuvintelor diferă de la o limbă la alta și o frază asamblată în
 *    engleză nu se poate traduce.
 *  · Tonul rămâne calm. Ăsta e textul pe care îl citești când ceva n-a mers
 *    bine — informează, nu dramatizează și nu ceartă pe nimeni.
 *
 * Formele de plural: `one` = 1, `few` = 0 și 2–19, `other` = de la 20 în sus și
 * ia „de”.
 */
export const safety = {
  'safety.title': 'Ajungi acasă cu bine',
  'safety.checkInArmed': 'SEMN DE VIAȚĂ ARMAT',
  'safety.dueNow': 'chiar acum',
  'safety.armedIntro': 'Dacă nu dai semn, întâi te întrebăm pe tine.',
  'safety.armedEscalation': {
    one: 'Cincisprezece minute mai târziu, {count} persoană de încredere primește mesajul tău și ultimul local.',
    few: 'Cincisprezece minute mai târziu, {count} persoane de încredere primesc mesajul tău și ultimul local.',
    other: 'Cincisprezece minute mai târziu, {count} de persoane de încredere primesc mesajul tău și ultimul local.',
  },
  'safety.armedEscalationNoContacts':
    'Cincisprezece minute mai târziu, persoanele tale de încredere primesc mesajul tău și ultimul local.',
  // Participiul din perfectul compus e invariabil, deci „am ajuns" nu
  // genderizează pe nimeni.
  'safety.imHomeSafe': 'Am ajuns acasă cu bine',
  'safety.anotherHour': 'Mai dă-mi o oră',
  'safety.nothingArmed': 'Nimic armat',
  'safety.nothingArmedBody':
    'Pune ora la care crezi că ești acasă. Dacă nu dai semn până atunci, te întrebăm pe tine înainte să întrebăm pe altcineva — și poți vedea dinainte mesajul exact.',
  'safety.armCheckIn': 'Armează un semn de viață',
  'safety.rideHome': 'Mergi cu mașina',
  'safety.walkIt': 'Mergi pe jos',
  'safety.checkOnMe': 'Vezi ce fac',
  'safety.shareLocation': 'ÎMPARTE LOCAȚIA MEA',
  'safety.shareLocationBody':
    'Pe timp limitat și numai cu persoanele tale de încredere. Se oprește singură.',
  'safety.hours': { one: '{count}h', few: '{count}h', other: '{count}h' },
  'safety.callEmergencyTitle': 'Suni la {number}?',
  'safety.callEmergencyBody': 'Asta sună la serviciile de urgență.',
  'safety.callEmergencyConfirm': 'Sună la {number}',
  'safety.callEmergencyLabel': 'Sună la serviciile de urgență, {number}',
  'safety.emergency': 'Urgențe · {number}',
  'safety.freeForever':
    'Tot ce e pe ecranul ăsta e gratuit, mereu. ROUNDS nu pune niciodată un abonament în fața lui.',

  'safety.when': 'CÂND',
  'safety.checkOnMeIn': {
    one: 'Vezi ce fac peste {count}h',
    few: 'Vezi ce fac peste {count}h',
    other: 'Vezi ce fac peste {count}h',
  },
  'safety.messageLabel': 'Ce li s-ar trimite',
  // La persoana a treia: îl citește altcineva, poate un părinte. Registrul e
  // neutru, nu complice. „A ieșit" în loc de „a fost văzut" pentru că
  // participiul din perfectul compus e invariabil — nu genderizează pe nimeni.
  'safety.messageDefault':
    '{name} a rugat ROUNDS să verifice dacă a ajuns acasă și n-a răspuns. Ultima oară a ieșit în oraș în seara asta.',
  'safety.messageDefaultNoName':
    'Un prieten a rugat ROUNDS să verifice dacă a ajuns acasă și n-a răspuns. Ultima oară a ieșit în oraș în seara asta.',
  'safety.gracePeriod':
    'La ora stabilită primești o notificare, cu cincisprezece minute răgaz.',
  'safety.onlyThenNamed': 'Numai dacă nu răspunzi atunci află {names} ceva.',
  'safety.onlyThen': 'Numai dacă nu răspunzi atunci află ceva persoanele tale de încredere.',
  'safety.noContactsWarning':
    'N-ai adăugat încă nicio persoană de încredere — adaugă una, ca să poată ajunge chiar la cineva.',

  'safety.contactsTitle': 'Persoane de încredere',
  'safety.contactsSubtitle': 'Cel mult trei. Sunt contactate doar dacă nu răspunzi.',
  'safety.contactsEmptyTitle': 'Nimeni deocamdată',
  'safety.contactsEmptyBody':
    'Alege oameni care chiar ar răspunde la 3 dimineața. Nu află că sunt pe listă până nu se întâmplă ceva.',
  // „Elimină" e neutru: „Scoate-o pe {name}" ar presupune că persoana e femeie.
  'safety.removeContact': 'Elimină {name}',
  'safety.contactName': 'Nume',
  'safety.contactPhone': 'Telefon',
  'safety.addContact': 'Adaugă o persoană',
  'safety.threeMax': 'Trei e maximul.',
} satisfies Record<string, Message>;
