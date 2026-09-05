import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, Icon, LevelBar, Stagger } from '@/ui';
import { useStore } from '@/data/store';
import { ACHIEVEMENTS, evaluate } from '@/domain/progress';
import { color, radius, space } from '@/design/tokens';

/**
 * Y-09 · Achievements.
 *
 * The definitions and the earning rules live in `domain/progress.ts`, not here,
 * because the same evaluation has to run for the celebration overlay and for
 * the level on the You tab. A screen that decided for itself what counted as
 * earned would, sooner or later, disagree with the thing that congratulated
 * you.
 *
 * Nothing here rewards volume. There is no badge for a big night, and there
 * never will be.
 */
export default function Achievements() {
  const { logs, sessions, people, crews, plans, goals, safety } = useStore();

  const progress = useMemo(
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
  const earned = progress.earned;

  const groups = ['exploration', 'consistency', 'moderation', 'social'] as const;
  const label = { exploration: 'Exploration', consistency: 'Consistency', moderation: 'Moderation', social: 'Together' };

  return (
    <Screen title="Achievements" subtitle={`${earned.size} of ${ACHIEVEMENTS.length}`} back mood="calm">
      <Card>
        <LevelBar
          level={progress.level}
          fraction={progress.fraction}
          intoLevel={progress.intoLevel}
          levelSpan={progress.levelSpan}
        />
        <Text variant="footnote" tone="tertiary" style={{ marginTop: space.m }}>
          Levels come from recording nights, answering the morning question, taking nights off and
          going somewhere new. Not one point of this comes from how much you drank.
        </Text>
      </Card>

      <Stagger>
        {groups.map((g) => (
          <Card key={g}>
            <Text variant="sectionHeader" tone="tertiary">{label[g].toUpperCase()}</Text>
            <View style={{ marginTop: space.m, gap: space.m }}>
              {ACHIEVEMENTS.filter((d) => d.group === g).map((d) => {
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
                    <Text variant="caption2" tone={has ? 'secondary' : 'quaternary'}>+{d.xp}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        ))}
      </Stagger>

      <Text variant="footnote" tone="quaternary" center>
        Nothing here rewards drinking more. That's on purpose.
      </Text>
    </Screen>
  );
}
