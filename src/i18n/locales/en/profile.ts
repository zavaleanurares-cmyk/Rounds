import type { Message } from '../../types';

/** Y-02 · Edit profile — the only screen where you describe yourself to others. */
export const profile = {
  'profile.title': 'Your profile',
  'profile.you': 'You',

  // photo
  'profile.addPhoto': 'Add a photo',
  'profile.changePhoto': 'Change photo',
  'profile.changePhotoLabel': 'Change your photo',
  'profile.choosePhoto': 'Choose a photo',
  'profile.remove': 'Remove',
  'profile.removePhotoLabel': 'Remove photo',
  'profile.photoPermission': 'ROUNDS needs photo access to set a picture.',
  'profile.photoFailed': 'Could not open your photos.',

  // colour
  'profile.colourHeader': 'COLOUR',
  'profile.colourNote': 'Behind your initials, and on your stamps and crews.',
  'profile.automaticColour': 'Automatic colour',
  'profile.colourNumbered': 'Colour {index}',

  // the fields
  'profile.nameLabel': 'NAME',
  'profile.namePlaceholder': 'What people call you',
  'profile.handleLabel': 'HANDLE',
  'profile.handlePlaceholder': 'handle',
  'profile.handleChecking': 'Checking…',
  'profile.handleAvailable': 'Available',
  'profile.handleCurrent': 'This is your handle now',
  'profile.handleHint': 'Letters, numbers and underscores',
  'profile.handleRule': 'Letters, numbers and underscores. 3 to 20.',
  'profile.handleTaken': 'Taken.',
  'profile.aboutLabel': 'ABOUT ({used}/{max})',
  'profile.aboutPlaceholder': 'A line about you',
  'profile.cityLabel': 'CITY',
  'profile.cityPlaceholder': 'Where you usually go out',
  'profile.cityHint': 'Just the name. ROUNDS never puts a location on your profile.',

  // signature drink
  'profile.drinkHeader': 'YOUR DRINK',
  'profile.drinkNote': 'Optional. Shown as a glyph on your profile — never as a suggestion to anyone.',
  'profile.noDrink': 'No drink',

  'profile.updated': 'Profile updated',
  'profile.visibilityNote':
    'Your name, handle, photo and about line are visible to people you have added. Nothing you drink ever is.',
} satisfies Record<string, Message>;
