import React from 'react';
import { useRouter } from 'expo-router';
import { Screen, EmptyState } from '@/ui';
import { useT } from '@/i18n';

export default function NotFound() {
  const router = useRouter();
  const t = useT();
  return (
    <Screen title={t('stats.notFoundTitle')} mood="night">
      <EmptyState
        icon="moon.stars"
        title={t('stats.notFoundEmptyTitle')}
        body={t('stats.notFoundBody')}
        actionLabel={t('stats.backToTonight')}
        onAction={() => router.replace('/(tabs)/tonight')}
      />
    </Screen>
  );
}
