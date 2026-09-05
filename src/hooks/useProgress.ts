import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/data/store';
import { evaluate, ACHIEVEMENT_BY_ID, type Progress } from '@/domain/progress';
import { KEYS, readJson, writeJson } from '@/data/storage';
import { feedback } from '@/services/feedback';
import type { CelebrationContent } from '@/ui/Celebrate';
import type { IconName } from '@/ui/Icon';

interface Seen {
  achievements: string[];
  level: number;
}

const ICON_FOR: Record<string, IconName> = {
  exploration: 'map',
  consistency: 'calendar',
  moderation: 'drop',
  social: 'person.2',
};

/**
 * Progress, plus the queue of things worth celebrating.
 *
 * Two rules keep this from becoming annoying:
 *
 *  · Nothing is celebrated until the "already seen" set has loaded from disk.
 *    Otherwise a returning user is congratulated on twenty-four achievements
 *    the moment they open the app, every launch.
 *  · One celebration at a time, in a queue. Finishing a night can earn three
 *    things at once; three modals stacked on top of each other is a bug, not a
 *    reward.
 *
 * Gamification notifications are OFF by default (see DEFAULT_SETTINGS), and
 * this respects that switch: with it off, progress is still tracked and still
 * visible on the You tab — it just never interrupts.
 */
export function useProgress() {
  const { logs, sessions, people, crews, plans, goals, safety, settings } = useStore();

  const progress: Progress = useMemo(
    () =>
      evaluate({
        logs,
        sessions,
        people,
        crews,
        plans,
        goals,
        trustedContacts: safety.contacts.length,
        safeArrivalsResolved: safety.activeCheck?.resolvedAt ? 1 : 0,
      }),
    [logs, sessions, people, crews, plans, goals, safety]
  );

  const [seen, setSeen] = useState<Seen | null>(null);
  const [queue, setQueue] = useState<CelebrationContent[]>([]);
  const seenRef = useRef<Seen | null>(null);

  useEffect(() => {
    let alive = true;
    readJson<Seen>(KEYS.celebrated, { achievements: [], level: 0 }).then((s) => {
      if (!alive) return;
      seenRef.current = s;
      setSeen(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const known = seenRef.current;
    if (!known) return; // not loaded yet — never celebrate into the void

    // `level: 0` is the sentinel for "this device has never recorded a
    // baseline". It happens on a fresh install and, more importantly, on a
    // reinstall where the account already has a year of history: without this
    // branch such a user is met with twenty-four modals in a row. The first
    // pass records what is already true and celebrates nothing.
    const firstEver = known.level === 0;

    const freshAchievements = firstEver
      ? []
      : [...progress.earned].filter((id) => !known.achievements.includes(id));
    const leveled = !firstEver && progress.level > known.level;

    const changed =
      firstEver ||
      leveled ||
      freshAchievements.length > 0 ||
      known.achievements.length !== progress.earned.size;

    if (changed) {
      const next: Seen = { achievements: [...progress.earned], level: progress.level };
      seenRef.current = next;
      setSeen(next);
      void writeJson(KEYS.celebrated, next);
    }

    if (firstEver || (freshAchievements.length === 0 && !leveled)) return;
    if (!settings.notifications.gamification) return;

    const items: CelebrationContent[] = freshAchievements.flatMap((id) => {
      const def = ACHIEVEMENT_BY_ID.get(id);
      if (!def) return [];
      return [
        {
          kind: 'achievement' as const,
          eyebrow: 'Achievement',
          title: def.name,
          body: def.hint,
          icon: ICON_FOR[def.group] ?? 'star',
        },
      ];
    });

    if (leveled) {
      items.push({
        kind: 'level',
        eyebrow: `Level ${progress.level}`,
        title: `Level ${progress.level}`,
        body: 'Earned by recording your nights, not by drinking through them.',
        icon: 'sparkles',
      });
    }

    if (items.length) setQueue((q) => [...q, ...items]);
  }, [progress, settings.notifications.gamification]);

  // The cue fires when a celebration becomes visible, not when it is queued, so
  // three unlocks at once make three sounds in sequence rather than a chord.
  const current = queue[0] ?? null;
  const lastShown = useRef<CelebrationContent | null>(null);
  useEffect(() => {
    if (!current || lastShown.current === current) return;
    lastShown.current = current;
    feedback(current.kind === 'level' ? 'levelup' : current.kind === 'streak' ? 'streak' : 'unlock');
  }, [current]);

  const dismiss = useCallback(() => setQueue((q) => q.slice(1)), []);

  return { progress, celebration: current, dismiss, ready: seen !== null };
}
