import type { Message } from '../../types';

export const profile = {
  'profile.title': 'Ton profil',
  'profile.you': 'Toi',

  // photo
  'profile.addPhoto': 'Ajouter une photo',
  'profile.changePhoto': 'Changer de photo',
  'profile.changePhotoLabel': 'Changer ta photo',
  'profile.choosePhoto': 'Choisir une photo',
  'profile.remove': 'Retirer',
  'profile.removePhotoLabel': 'Retirer la photo',
  'profile.photoPermission': "ROUNDS a besoin d'accéder à tes photos pour en mettre une.",
  'profile.photoFailed': "Impossible d'ouvrir tes photos.",

  // colour
  'profile.colourHeader': 'COULEUR',
  'profile.colourNote': 'Derrière tes initiales, et sur tes tampons et tes bandes.',
  'profile.automaticColour': 'Couleur automatique',
  // Same wording as settings.accentLabel — it is the same swatch.
  'profile.colourNumbered': 'Couleur {index}',

  // the fields
  'profile.nameLabel': 'NOM',
  'profile.namePlaceholder': "Comment on t'appelle",
  // "Pseudo" is the word stats.editProfileHint already uses for the handle.
  'profile.handleLabel': 'PSEUDO',
  'profile.handlePlaceholder': 'pseudo',
  'profile.handleChecking': 'Vérification…',
  'profile.handleAvailable': 'Disponible',
  'profile.handleCurrent': "C'est déjà ton pseudo",
  'profile.handleHint': 'Lettres, chiffres et tirets bas',
  'profile.handleRule': 'Lettres, chiffres et tirets bas. De 3 à 20.',
  'profile.handleTaken': 'Déjà pris.',
  'profile.aboutLabel': 'À PROPOS ({used}/{max})',
  'profile.aboutPlaceholder': 'Une phrase sur toi',
  'profile.cityLabel': 'VILLE',
  'profile.cityPlaceholder': "Où tu sors d'habitude",
  'profile.cityHint': 'Juste le nom. ROUNDS ne met jamais de position sur ton profil.',

  // signature drink
  'profile.drinkHeader': 'TON VERRE',
  'profile.drinkNote':
    "Optionnel. Affiché comme un glyphe sur ton profil — jamais comme une suggestion à qui que ce soit.",
  'profile.noDrink': 'Aucun verre',

  'profile.updated': 'Profil mis à jour',
  'profile.visibilityNote':
    "Ton nom, ton pseudo, ta photo et ta phrase sont visibles par les gens que tu as ajoutés. Ce que tu bois ne l'est jamais.",
} satisfies Record<string, Message>;
