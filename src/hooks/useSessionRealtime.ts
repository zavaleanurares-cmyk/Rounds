import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { subscribeToSession, isRemoteEnabled } from '@/data/remote';

export type RealtimeStatus = 'off' | 'connecting' | 'live' | 'reconnecting';

/**
 * The live room's connection.
 *
 * One multiplexed channel per session, resubscribed on foreground with backoff.
 * A phone that spent forty minutes in a pocket in a basement comes back to a
 * dead socket, and the room has to notice — that is the whole reason this hook
 * watches AppState rather than trusting the client's own retry.
 */
export function useSessionRealtime(
  sessionId: string | null,
  handlers: Parameters<typeof subscribeToSession>[1]
): RealtimeStatus {
  const [status, setStatus] = useState<RealtimeStatus>('off');

  useEffect(() => {
    if (!sessionId || !isRemoteEnabled()) {
      setStatus('off');
      return;
    }

    let dispose: (() => void) | null = null;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let alive = true;

    const connect = () => {
      if (!alive) return;
      setStatus(attempt === 0 ? 'connecting' : 'reconnecting');
      dispose?.();
      dispose = subscribeToSession(sessionId, {
        ...handlers,
        onStatus: (s) => {
          handlers.onStatus?.(s);
          if (s === 'SUBSCRIBED') {
            attempt = 0;
            setStatus('live');
          } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' || s === 'CLOSED') {
            // Exponential backoff, capped — a bar full of people all retrying
            // every second is how you take your own realtime server down.
            const delay = Math.min(30_000, 1000 * 2 ** attempt);
            attempt += 1;
            setStatus('reconnecting');
            timer = setTimeout(connect, delay);
          }
        },
      });
    };

    connect();

    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        attempt = 0;
        connect();
      }
    });

    return () => {
      alive = false;
      sub.remove();
      if (timer) clearTimeout(timer);
      dispose?.();
    };
    // handlers are captured once on purpose; the room passes stable callbacks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return status;
}
