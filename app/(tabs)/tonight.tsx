import React from 'react';
import { useRouter } from 'expo-router';
import { useNightState } from '@/hooks/useNightState';
import { TonightIdle } from '@/features/tonight/TonightIdle';
import { TonightPlanned } from '@/features/tonight/TonightPlanned';
import { TonightLive } from '@/features/tonight/TonightLive';
import { TonightWinddown } from '@/features/tonight/TonightWinddown';

/**
 * T-01…T-05. One route, five materially different screens.
 *
 * Tonight should look completely different at 6pm, 1am and 11am. That is the
 * whole point of the tab — it is the app's answer to "what do I need right now",
 * and the answer at 1am is not the answer at 11am.
 */
export default function Tonight() {
  const night = useNightState();
  const router = useRouter();

  React.useEffect(() => {
    if (night.state === 'morning' && night.morningSessionId) {
      router.replace(`/morning/${night.morningSessionId}` as never);
    }
  }, [night.state, night.morningSessionId, router]);

  switch (night.state) {
    case 'live':
      return <TonightLive session={night.session!} />;
    case 'winddown':
      return <TonightWinddown session={night.lastSession!} />;
    case 'planned':
      return <TonightPlanned plan={night.nextPlan!} lastSession={night.lastSession} />;
    case 'morning':
      return <TonightIdle nextPlan={night.nextPlan} lastSession={night.lastSession} />;
    default:
      return <TonightIdle nextPlan={night.nextPlan} lastSession={night.lastSession} />;
  }
}
