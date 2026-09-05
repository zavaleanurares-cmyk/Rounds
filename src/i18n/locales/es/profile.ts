import type { Message } from '../../types';

export const profile = {
  'profile.title': 'Tu perfil',
  'profile.you': 'Tú',

  // photo
  'profile.addPhoto': 'Añade una foto',
  'profile.changePhoto': 'Cambia la foto',
  'profile.changePhotoLabel': 'Cambia tu foto',
  'profile.choosePhoto': 'Elige una foto',
  'profile.remove': 'Quitar',
  'profile.removePhotoLabel': 'Quita la foto',
  'profile.photoPermission': 'ROUNDS necesita acceso a tus fotos para poner una.',
  'profile.photoFailed': 'No se han podido abrir tus fotos.',

  // colour
  'profile.colourHeader': 'COLOR',
  'profile.colourNote': 'Detrás de tus iniciales, y en tus sellos y tus peñas.',
  'profile.automaticColour': 'Color automático',
  // Same wording as settings.accentLabel — it is the same swatch.
  'profile.colourNumbered': 'Color {index}',

  // the fields
  'profile.nameLabel': 'NOMBRE',
  'profile.namePlaceholder': 'Cómo te llama la gente',
  // "Usuario" is the word stats.editProfileHint already uses for the handle.
  'profile.handleLabel': 'USUARIO',
  'profile.handlePlaceholder': 'usuario',
  'profile.handleChecking': 'Comprobando…',
  'profile.handleAvailable': 'Disponible',
  'profile.handleCurrent': 'Este ya es tu usuario',
  'profile.handleHint': 'Letras, números y guiones bajos',
  'profile.handleRule': 'Letras, números y guiones bajos. De 3 a 20.',
  'profile.handleTaken': 'Ocupado.',
  'profile.aboutLabel': 'SOBRE TI ({used}/{max})',
  'profile.aboutPlaceholder': 'Una frase sobre ti',
  'profile.cityLabel': 'CIUDAD',
  'profile.cityPlaceholder': 'Dónde sales normalmente',
  'profile.cityHint': 'Solo el nombre. ROUNDS no pone nunca una ubicación en tu perfil.',

  // signature drink
  'profile.drinkHeader': 'TU COPA',
  'profile.drinkNote':
    'Opcional. Se muestra como un glifo en tu perfil — nunca como una sugerencia para nadie.',
  'profile.noDrink': 'Ninguna copa',

  'profile.updated': 'Perfil actualizado',
  'profile.visibilityNote':
    'Tu nombre, tu usuario, tu foto y tu frase los ve la gente que has añadido. Lo que bebes no lo ve nadie, nunca.',
} satisfies Record<string, Message>;
