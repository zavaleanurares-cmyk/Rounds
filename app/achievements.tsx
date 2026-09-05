import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { summariseNights, computeStreaks } from '@/domain/stats';
import { color, radius, space } from '@/design/tokens';

/**
 * Y-09 · Achievements — ~24, all on-strategy: exploration, tracking consistency,
 * moderation, social warmth.
 *
 * Nothing here rewards volume. There is no badge for a big night, and there
 * never will be.
 */
const DEFS = [
  { id: 'first-night', group: 'consistency', name: 'First night', hint: 'Record a night from start to end.' },
  { id: 'gap-filler', group: 'consistency', name: 'Gap filler', hint: 'Fill the gaps on a morning-after screen.' },
  { id: 'week-of-logs', group: 'consistency', name: 'Seven straight', hint: 'Log every night out for a week.' },
  { id: 'morning-person', group: 'consistency', name: 'Morning person', hint: 'Answer "how do you feel" five times.' },
  { id: 'honest-editor', group: 'consistency', name: 'Honest editor', hint: 'Correct a night after the fact.' },
  { id: 'five-venues', group: 'exploration', name: 'Five places', hint: 'Log at five different venues.' },
  { id: 'ten-venues', group: 'exploration', name: 'Ten places', hint: 'Log at ten different venues.' },
  { id: 'new-place', group: 'exploration', name: 'Somewhere new', hint: 'Visit a venue nobody in your crew has.' },
  { id: 'passport-page', group: 'exploration', name: 'Passport page', hint: 'Collect stamps at three venues in a month.' },
  { id: 'home-city', group: 'exploration', name: 'Local', hint: 'Log in the same city twenty times.' },
  { id: 'far-afield', group: 'exploration', name: 'Away game', hint: 'Record a night in another city.' },
  { id: 'hydrated', group: 'moderation', name: 'Hydrated', hint: 'Log water on three nights in a row.' },
  { id: 'dry-week', group: 'moderation', name: 'Dry week', hint: 'Seven nights with nothing logged.' },
  { id: 'dry-fortnight', group: 'moderation', name: 'Two dry weeks', hint: 'Fourteen nights with nothing logged.' },
  { id: 'under-goal', group: 'moderation', name: 'Under goal', hint: 'Finish a week under your weekly cap.' },
  { id: 'under-goal-month', group: 'moderation', name: 'A whole month', hint: 'Four weeks under your weekly cap.' },
  { id: 'early-home', group: 'moderation', name: 'Home before two', hint: 'End three nights before 02:00.' },
  { id: 'water-first', group: 'moderation', name: 'Water first', hint: 'Start a night with water.' },
  { id: 'safe-arrival', group: 'moderation', name: 'Checked in', hint: 'Arm and resolve a safe-arrival check.' },
  { id: 'first-friend', group: 'social', name: 'Not alone', hint: 'Add your first friend.' },
  { id: 'crew-founder', group: 'social', name: 'Crew founder', hint: 'Create a crew.' },
  { id: 'plan-maker', group: 'social', name: 'Plan maker', hint: 'Create a plan three people say yes to.' },
  { id: 'round-buyer', group: 'social', name: 'Your round', hint: 'Buy a round for three people.' },
  { id: 'looked-out', group: 'social', name: 'Looked out', hint: 'Be someone\'s trusted contact.' },
] as const;

export default function Achievements() {
  const { logs, sessions, people, crews, plans, safety } = useStore();
  const nights = useMemo(() => summariseNights(logs), [logs]);
  const streaks = useMemo(() => computeStreaks(logs), [logs]);
  const venueCount = useMemo(() => new Set(logs.map((l) => l.venueId).filter(Boolean)).size, [logs]);

  // Evaluated set-based in one pass, the way the server does it.
  const earned = useMemo(() => {
    const s = new Set<string>();
    if (sessions.some((x) => x.endedAt)) s.add('first-night');
    if (sessions.filter((x) => x.mood).length >= 5) s.add('morning-person');
    if (venueCount >= 5) s.add('five-venues');
    if (venueCount >= 10) s.add('ten-venues');
    if (nights.filter((n) => n.waters > 0).length >= 3) s.add('hydrated');
    if (streaks.longestDry >= 7) s.add('dry-week');
    if (streaks.longestDry >= 14) s.add('dry-fortnight');
    if (people.some((p) => p.status === 'friend')) s.add('first-friend');
    if (crews.length > 0) s.add('crew-founder');
    if (plans.some((p) => p.invitees.filter((i) => i.rsvp === 'yes').length >= 3)) s.add('plan-maker');
    if (safety.contacts.length > 0) s.add('looked-out');
    return s;
  }, [sessions, nights, streaks, venueCount, people, crews, plans, safety]);

  const groups = ['exploration', 'consistency', 'moderation', 'social'] as const;
  const label = { exploration: 'Exploration', consistency: 'Consistency', moderation: 'Moderation', social: 'Together' };

  return (
    <Screen title="Achievements" subtitle={`${earned.size} of ${DEFS.length}`} back mood="calm">
      {groups.map((g) => (
        <Card key={g}>
          <Text variant="sectionHeader" tone="tertiary">{label[g].toUpperCase()}</Text>
          <View style={{ marginTop: space.m, gap: space.m }}>
            {DEFS.filter((d) => d.group === g).map((d) => {
              const has = earned.has(d.id);
              return (
                <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: radius.control,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: has ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                      borderWidth: 1,
                      borderColor: has ? color.brand.tintLight : color.separator,
                    }}
                  >
                    <Icon name={has ? 'star' : 'lock'} size={17} color={has ? color.brand.tintLight : color.label.quaternary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" tone={has ? 'primary' : 'tertiary'}>{d.name}</Text>
                    <Text variant="footnote" tone="quaternary">{d.hint}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      ))}
      <Text variant="footnote" tone="quaternary" center>
        Nothing here rewards drinking more. That's on purpose.
      </Text>
    </Screen>
  );
}
