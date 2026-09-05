import { useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import { useStore } from '@/data/store';
import { useNightState } from './useNightState';
import { NightHud, QuickLog, WidgetData, QuickTile, VoiceIntents, WatchBridge, type HudState } from '@/native';
import { paceState, weekdayMedian } from '@/domain/pace';
import { summariseNights, heatmap, goalProgress } from '@/domain/stats';
import { byId } from '@/domain/catalog';
import { color, paceWord } from '@/design/tokens';

/**
 * Keeps every system surface in step with the app, and drains what they wrote
 * while it was asleep.
 *
 * Two directions, and only one of them is a write path:
 *
 *   OUT  the HUD, widgets, tile, shortcuts and watch are told the current state
 *   IN   `QuickLog.drain()` collects logs made outside the app and hands them to
 *        the SAME queue the log sheet uses — never a second write path
 *
 * The drain runs on every foreground, because that is the only moment the JS
 * layer is alive to do it.
 */
export function useSystemSurfaces() {
  const store = useStore();
  const night = useNightState();
  const { logs, profile, venues, goals, people, settings } = store;
  const drained = useRef(new Set<string>());

  /**
   * The drain effect runs once, on mount, and then on every foreground — so it
   * must not close over the store it saw at mount. It used to, which meant every
   * log drained from a Live Activity or a widget was written with the
   * pre-hydration values: no session, userId 'me', currency EUR. Those logs
   * never attached to the live night, so they never reached the pace ring.
   */
  const storeRef = useRef(store);
  storeRef.current = store;

  const session = night.session;

  /* ------------------------------------------------------------ drain in */
  useEffect(() => {
    const drain = async () => {
      const pending = await QuickLog.drain();
      for (const item of pending) {
        // The native surface already minted the UUID, so replaying a drain is
        // harmless — but skipping locally avoids re-queueing work we know about.
        if (drained.current.has(item.id)) continue;
        drained.current.add(item.id);
        const drink = byId(item.drinkId);
        if (!drink) continue;
        storeRef.current.addLog({ drink, at: item.at, id: item.id, source: item.source });
      }
    };
    void drain();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void drain();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------ state out */
  const hud: HudState | null = useMemo(() => {
    if (!session) return null;
    const mine = logs.filter((l) => l.sessionId === session.id && !l.deleted);
    const nights = summariseNights(logs.filter((l) => l.sessionId !== session.id));
    const median = weekdayMedian(
      nights.map((n) => ({ weekday: n.weekday, totalG: n.totalG })),
      new Date(session.startedAt).getDay()
    );
    const pace = paceState({
      logs: mine.map((l) => ({ at: l.at, ethanolG: l.ethanolG })),
      weekdayMedianG: median,
      startedAt: session.startedAt,
    });
    const last = [...mine].reverse().find((l) => l.ethanolG > 0) ?? null;
    return {
      sessionId: session.id,
      venue: venues.find((v) => v.id === session.venueId)?.name ?? session.title ?? null,
      startedAt: session.startedAt,
      drinks: pace.drinks,
      paceState: pace.state,
      paceWord: paceWord[pace.state],
      lastDrinkId: last?.drinkId ?? null,
      lastDrinkName: last?.drinkName ?? null,
      spendMinor: mine.reduce((s, l) => s + (l.priceMinor ?? 0), 0),
      currency: profile?.currency ?? 'EUR',
    };
  }, [session, logs, venues, profile?.currency]);

  // The HUD starts on session start and ends on session end — or at a 12-hour
  // ceiling, because a Live Activity that outlives the night is a bug the user
  // experiences as the app being broken.
  useEffect(() => {
    if (!hud) {
      void NightHud.end();
      void WatchBridge.update(null);
      return;
    }
    void NightHud.start(hud);
    void WatchBridge.update(hud);
    const ceiling = setTimeout(() => void NightHud.end(), Math.max(0, 12 * 3600000 - (Date.now() - hud.startedAt)));
    return () => clearTimeout(ceiling);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hud?.sessionId]);

  useEffect(() => {
    if (hud) void NightHud.update(hud);
  }, [hud]);

  /* ---------------------------------------------------------- widgets out */
  useEffect(() => {
    const weekly = goals.find((g) => g.type === 'weekly_cap');
    const grid = heatmap(logs, 91).map((c) => c.level);
    const last = [...logs].reverse().find((l) => !l.deleted && l.ethanolG > 0) ?? null;
    void WidgetData.publish({
      live: Boolean(session),
      paceWord: hud?.paceWord ?? null,
      drinks: hud?.drinks ?? 0,
      weeklyPct: weekly ? goalProgress(logs, weekly).pct : 0,
      nextPlanTitle: night.nextPlan?.title ?? null,
      nextPlanAt: night.nextPlan?.startsAt ?? null,
      friendsOut: people.filter((p) => p.liveNow && p.status === 'friend').length,
      lastDrinkId: last?.drinkId ?? null,
      lastDrinkName: last?.drinkName ?? null,
      heatmap: grid,
      accentHex: color.night[settings.accentIndex % 4],
    });
  }, [logs, goals, session, hud, night.nextPlan, people, settings.accentIndex]);

  /* ------------------------------------------------- tile + shortcuts out */
  useEffect(() => {
    const last = [...logs].reverse().find((l) => !l.deleted && l.ethanolG > 0) ?? null;
    const drink = last ? byId(last.drinkId) ?? null : null;
    void QuickTile.set({ enabled: true, lastDrink: drink });
    void VoiceIntents.donate({ lastDrinkId: drink?.id ?? null, lastDrinkName: drink?.name ?? null });
  }, [logs]);
}
