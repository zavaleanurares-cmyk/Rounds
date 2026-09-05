import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useStore } from '@/data/store';

/**
 * Reduce Motion is honoured from BOTH the OS setting and the in-app one, because
 * a night-time app has its own reason to want everything to hold still.
 */
export function useReduceMotion(): boolean {
  const { settings } = useStore();
  const [system, setSystem] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setSystem(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystem);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return system || settings.reduceMotion;
}
