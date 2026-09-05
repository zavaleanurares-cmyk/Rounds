import type { Message } from '../../types';

/** C-13 · The notification inbox, grouped by day. */
export const notifications = {
  'notifications.title': 'Notifications',
  'notifications.today': 'TODAY',
  'notifications.emptyTitle': 'Nothing here',
  'notifications.emptyBody':
    'Plans, friend requests and your morning recap land here. We cap it at three a week by default.',
} satisfies Record<string, Message>;
