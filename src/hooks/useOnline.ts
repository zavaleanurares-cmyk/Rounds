import { useEffect } from 'react';
import { Platform } from 'react-native';
import { logQueue } from '@/data/queue';

/**
 * Network reachability. `@react-native-community/netinfo` is the production
 * source; this keeps the dependency out of the tree by using the web API where
 * it exists and assuming online otherwise. Assuming online is the safe default:
 * a wrong "online" costs one failed request, a wrong "offline" hides the pill.
 */
export function useOnlineWatcher() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const on = () => logQueue.setOnline(true);
    const off = () => logQueue.setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    logQueue.setOnline(window.navigator?.onLine ?? true);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
}
