import { useEffect, useState } from 'react';

/** A clock that re-renders on an interval. The pace estimate recomputes every 60s. */
export function useTick(ms = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
