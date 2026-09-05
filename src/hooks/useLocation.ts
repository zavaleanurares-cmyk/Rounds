import { useCallback, useEffect, useRef, useState } from 'react';
import { capabilities, optional } from '@/services/optional';

export type LocationStatus = 'idle' | 'asking' | 'granted' | 'approximate' | 'denied' | 'unavailable';

export interface Coords { lat: number; lng: number }

/** Cluj-Napoca. A denied permission still gets a map, centred on a city. */
export const FALLBACK_COORDS: Coords = { lat: 46.7712, lng: 23.5859 };

/**
 * Location, with denial as a first-class path.
 *
 * Denial is NOT a dead end: the screen falls back to search and a city-level
 * map. On Android 12+ "approximate only" is its own state — the friends layer
 * degrades to venue names without distances rather than disappearing, because
 * silently hiding a feature is how users conclude the app is broken.
 */
export function useLocation(autoAsk = false) {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [coords, setCoords] = useState<Coords>(FALLBACK_COORDS);
  /**
   * One request in flight at a time. Two concurrent
   * `requestForegroundPermissionsAsync` calls on Android is a known
   * never-resolves case — and `status` would then stick on 'asking', which is
   * neither granted nor denied, so the recovery card never renders and the user
   * has no way out of the screen.
   */
  const inFlight = useRef<Promise<Coords> | null>(null);

  const request = useCallback(async () => {
    if (inFlight.current) return inFlight.current;
    const run = async (): Promise<Coords> => {
      if (!capabilities().location) {
        setStatus('unavailable');
        return FALLBACK_COORDS;
      }
      const Location = optional(() => require('expo-location'));
      if (!Location) {
        setStatus('unavailable');
        return FALLBACK_COORDS;
      }
      setStatus('asking');
      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm !== 'granted') {
          setStatus('denied');
          return FALLBACK_COORDS;
        }
        // A fix can take forever indoors, and `getCurrentPositionAsync` has no
        // deadline of its own. Ten seconds, then fall back to the city.
        const position = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise<null>((r) => setTimeout(() => r(null), 10_000)),
        ]);
        if (!position) {
          setStatus('denied');
          return FALLBACK_COORDS;
        }
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(next);
        // Android 12+ can grant coarse only. Accuracy above ~1km means the user
        // chose "approximate", and the friends layer has to say so.
        setStatus(position.coords.accuracy && position.coords.accuracy > 1000 ? 'approximate' : 'granted');
        return next;
      } catch {
        setStatus('denied');
        return FALLBACK_COORDS;
      }
    };

    const promise = run().finally(() => { inFlight.current = null; });
    inFlight.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    if (autoAsk) void request();
  }, [autoAsk, request]);

  return { status, coords, request };
}
