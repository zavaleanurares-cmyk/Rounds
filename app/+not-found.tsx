import React from 'react';
import { useRouter } from 'expo-router';
import { Screen, EmptyState } from '@/ui';

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen title="Nothing here" mood="night">
      <EmptyState
        icon="moon.stars"
        title="That link went nowhere"
        body="The page you were looking for doesn't exist — or the night it pointed at has ended."
        actionLabel="Back to Tonight"
        onAction={() => router.replace('/(tabs)/tonight')}
      />
    </Screen>
  );
}
