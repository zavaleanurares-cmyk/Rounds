import type { Message } from '../../types';

export const notifications = {
  'notifications.title': 'Notificări',
  'notifications.today': 'AZI',
  'notifications.emptyTitle': 'Nimic aici',
  'notifications.emptyBody':
    'Planurile, cererile de prietenie și recapitularea de dimineață ajung aici. Implicit, ne limităm la trei pe săptămână.',
} satisfies Record<string, Message>;
