import type { Message } from '../../types';

export const notifications = {
  'notifications.title': 'Notifications',
  'notifications.today': "AUJOURD'HUI",
  'notifications.emptyTitle': 'Rien ici',
  'notifications.emptyBody':
    "Les plans, les demandes d'ami et ton récap du matin arrivent ici. Par défaut, on se limite à trois par semaine.",
} satisfies Record<string, Message>;
