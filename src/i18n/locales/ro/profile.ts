import type { Message } from '../../types';

export const profile = {
  'profile.title': 'Profilul tău',
  'profile.you': 'Tu',

  // photo
  'profile.addPhoto': 'Adaugă o poză',
  'profile.changePhoto': 'Schimbă poza',
  'profile.changePhotoLabel': 'Schimbă-ți poza',
  'profile.choosePhoto': 'Alege o poză',
  'profile.remove': 'Șterge',
  'profile.removePhotoLabel': 'Șterge poza',
  'profile.photoPermission': 'ROUNDS are nevoie de acces la poze ca să poți pune una.',
  'profile.photoFailed': 'Nu am putut deschide pozele tale.',

  // colour
  'profile.colourHeader': 'CULOARE',
  'profile.colourNote': 'În spatele inițialelor tale și pe ștampilele și găștile tale.',
  'profile.automaticColour': 'Culoare automată',
  // Same wording as settings.accentLabel — it is the same swatch.
  'profile.colourNumbered': 'Culoarea {index}',

  // the fields
  'profile.nameLabel': 'NUME',
  'profile.namePlaceholder': 'Cum ți se spune',
  // "Nume de utilizator" would stack a second "nume" straight after NUME, so
  // the field is named by what it is — the same choice stats.editProfileHint
  // makes.
  'profile.handleLabel': 'UTILIZATOR',
  'profile.handlePlaceholder': 'utilizator',
  'profile.handleChecking': 'Se verifică…',
  'profile.handleAvailable': 'Liber',
  'profile.handleCurrent': 'Ăsta e deja utilizatorul tău',
  'profile.handleHint': 'Litere, cifre și liniuță jos',
  'profile.handleRule': 'Litere, cifre și liniuță jos. De la 3 la 20.',
  'profile.handleTaken': 'E luat.',
  'profile.aboutLabel': 'DESPRE TINE ({used}/{max})',
  'profile.aboutPlaceholder': 'O frază despre tine',
  'profile.cityLabel': 'ORAȘ',
  'profile.cityPlaceholder': 'Unde ieși de obicei',
  'profile.cityHint': 'Doar numele. ROUNDS nu pune niciodată o locație pe profilul tău.',

  // signature drink
  'profile.drinkHeader': 'BĂUTURA TA',
  'profile.drinkNote':
    'Opțional. Apare ca un glif pe profilul tău — niciodată ca sugestie pentru cineva.',
  'profile.noDrink': 'Nicio băutură',

  'profile.updated': 'Profil actualizat',
  'profile.visibilityNote':
    'Numele, utilizatorul, poza și fraza despre tine se văd de oamenii pe care i-ai adăugat. Ce bei nu se vede niciodată.',
} satisfies Record<string, Message>;
