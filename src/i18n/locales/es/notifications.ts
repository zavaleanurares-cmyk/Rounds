import type { Message } from '../../types';

export const notifications = {
  'notifications.title': 'Notificaciones',
  'notifications.today': 'HOY',
  'notifications.emptyTitle': 'Aquí no hay nada',
  'notifications.emptyBody':
    'Los planes, las solicitudes de amistad y tu resumen de la mañana llegan aquí. Por defecto nos limitamos a tres por semana.',
} satisfies Record<string, Message>;
