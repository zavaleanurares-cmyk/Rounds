import type { Message } from '../../types';

export const ui = {
  'ui.loading': 'Chargement',
  'ui.back': 'Retour',
  'ui.dismiss': 'Fermer',
  'ui.close': 'Fermer',
  'ui.done': 'Terminé',
  'ui.cancel': 'Annuler',
  'ui.save': 'Enregistrer',
  'ui.saving': 'Enregistrement…',
  'ui.undo': 'Annuler',
  'ui.retry': 'Réessayer',
  'ui.errorTitle': "Ça n'a pas chargé",
  'ui.errorBody': "On n'a pas pu joindre ROUNDS. Ce que tu as noté est en sécurité sur ce téléphone.",
  'ui.offline': 'Hors ligne',
  'ui.offlineWaiting': 'Hors ligne · {count} en attente',
  'ui.offlineLabel': 'Hors ligne',
  'ui.offlineLabelPending': {
    // French counts zero as singular, so "one" also covers 0.
    one: 'Hors ligne, {count} verre en attente de synchronisation',
    other: 'Hors ligne, {count} verres en attente de synchronisation',
  },
  'ui.settings': 'Réglages',
  'ui.share': 'Partager',
  'ui.more': 'Plus',
  'ui.selected': 'sélectionné',
  'ui.nice': 'Bien joué',
  'ui.achievement': 'Réussite',
  'ui.level': 'Niveau {level}',
  'ui.levelProgress': 'Niveau {level}, {into} sur {span} avant le suivant',
  'ui.people': {
    one: '{count} personne',
    other: '{count} personnes',
  },
} satisfies Record<string, Message>;
