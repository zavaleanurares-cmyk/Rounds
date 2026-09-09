import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Screen, Card, Text, Icon, LevelBar, Enter, ProgressBar, useCountUp, usePressScale,
} from '@/ui';
import { useStore } from '@/data/store';
import { ACHIEVEMENTS, evaluate, type AchievementDef } from '@/domain/progress';
import { useT, useFormat, type MessageKey } from '@/i18n';
import { color, motion, radius, space } from '@/design/tokens';

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
 *
 * ── What changed, and why it was not a paint job ────────────────────────────
 *
 * Every row used to be a padlock or a star. Twenty-four rows, two states, and
 * for a new account twenty-three of them were the identical grey padlock — a
 * screen whose whole job is to suggest a next move, showing a wall of things
 * you have not done and no indication which one is nearly done.
 *
 * The rules were thresholds all along (`venueIds.size >= 5`), so the distance
 * was computable and simply discarded. `progress.towards` keeps it now, and
 * this screen leads with the three you are closest to. A person one venue off
 * "Five venues" can see that, and that is the difference between a trophy
 * cabinet and something worth opening twice.
 */
export default function Achievements() {
  const t = useT();
  const f = useFormat();
  const router = useRouter();
  const { logs, venues, sessions, people, crews, plans, goals, safety } = useStore();

  const progress = useMemo(
    () =>
      evaluate({
        logs,
        venues,
        sessions,
        people,
        crews,
        plans,
        goals,
        trustedContacts: safety.contacts.length,
        safeArrivalsResolved: safety.safeArrivalsResolved,
      }),
    [logs, venues, sessions, people, crews, plans, goals, safety]
  );
  const earned = progress.earned;
  const earnedText = useCountUp(earned.size);

  /**
   * The three unearned achievements closest to done, most-complete first.
   *
   * Ties break on the smaller remaining count and then on the id, so the order
   * is stable between renders — a "nearly there" list that reshuffles itself
   * while you look at it is worse than no list.
   */
  const closest = useMemo(() => {
    return ACHIEVEMENTS.filter((d) => !earned.has(d.id))
      .map((d) => ({ def: d, at: progress.towards.get(d.id) ?? { have: 0, need: 1 } }))
      .filter((x) => x.at.have > 0)
      .sort((a, b) => {
        const fa = a.at.have / a.at.need;
        const fb = b.at.have / b.at.need;
        if (fb !== fa) return fb - fa;
        const ra = a.at.need - a.at.have;
        const rb = b.at.need - b.at.have;
        if (ra !== rb) return ra - rb;
        return a.def.id.localeCompare(b.def.id);
      })
      .slice(0, 3);
  }, [earned, progress.towards]);

  const groups = ['exploration', 'consistency', 'moderation', 'social'] as const;
  const label: Record<(typeof groups)[number], MessageKey> = {
    exploration: 'stats.groupExploration',
    consistency: 'stats.groupConsistency',
    moderation: 'stats.groupModeration',
    social: 'stats.groupTogether',
  };
  /**
   * A colour per group, taken from the venue palette so the app has one set of
   * hues rather than a second one invented here. Exploration is the blue that
   * a bar pin is; moderation is the green that reads as "good" everywhere else
   * in this app.
   */
  const tint: Record<(typeof groups)[number], string> = {
    exploration: color.venue.bar,
    consistency: color.venue.club,
    moderation: color.pace.steady,
    social: color.venue.restaurant,
  };

  return (
    <Screen
      title={t('stats.achievements')}
      subtitle={t('stats.achievementsCount', {
        earned: f.number(earned.size, 0),
        total: f.number(ACHIEVEMENTS.length, 0),
      })}
      back
      mood="calm"
    >
      <Enter from="scale">
        <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
          <LinearGradient
            colors={['rgba(139,92,246,0.28)', 'rgba(59,130,246,0.18)', 'rgba(10,12,20,0.55)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: space.lg }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, marginBottom: space.md }}>
              <Text variant="largeTitle">{earnedText}</Text>
              <Text variant="title3" tone="tertiary" style={{ paddingBottom: 4 }}>
                {`/ ${ACHIEVEMENTS.length}`}
              </Text>
            </View>
            <LevelBar
              level={progress.level}
              fraction={progress.fraction}
              intoLevel={progress.intoLevel}
              levelSpan={progress.levelSpan}
            />
            <Text variant="footnote" tone="tertiary" style={{ marginTop: space.m }}>
              {t('stats.levelsNote')}
            </Text>
          </LinearGradient>
        </View>
      </Enter>

      {closest.length > 0 ? (
        <Enter from="below" delay={motion.stagger}>
          <Card aurora accent={color.brand.tint}>
            <Text variant="sectionHeader" tone="tertiary">{t('stats.nearlyThere')}</Text>
            <View style={{ marginTop: space.m, gap: space.md }}>
              {closest.map(({ def, at }) => (
                <View key={def.id} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                    <Text variant="body" style={{ flex: 1 }}>{t(def.nameKey)}</Text>
                    <Text variant="caption1" tone="secondary">{`${at.have}/${at.need}`}</Text>
                  </View>
                  <ProgressBar value={at.have / at.need} height={5} tint={color.brand.tintLight} />
                  {/* Tertiary, not quaternary. This card exists to tell you
                      what to do next, and the sentence that says what to do
                      was the dimmest text on the screen. */}
                  <Text variant="caption2" tone="tertiary">{t(def.hintKey)}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Enter>
      ) : null}

      {groups.map((g, gi) => (
        <Enter key={g} from="below" delay={(gi + 2) * motion.stagger}>
          <Card>
            <Text variant="sectionHeader" tone="tertiary">{t(label[g])}</Text>
            <View style={{ marginTop: space.m, gap: space.md }}>
              {ACHIEVEMENTS.filter((d) => d.group === g).map((d) => (
                <AchievementRow
                  key={d.id}
                  def={d}
                  tint={tint[g]}
                  earned={earned.has(d.id)}
                  at={progress.towards.get(d.id) ?? { have: 0, need: 1 }}
                  t={t}
                  f={f}
                />
              ))}
            </View>
          </Card>
        </Enter>
      ))}

      <Text variant="footnote" tone="quaternary" center>
        {t('stats.noVolumeNote')}
      </Text>
    </Screen>
  );
}

/**
 * One achievement.
 *
 * Earned: the group's colour, filled, with the badge lit. Started but not
 * finished: the same colour at low strength, plus a hairline bar showing the
 * distance. Untouched: the padlock it always was, because a row with a 0%
 * bar under it is noise — the bar has to mean "you have started this".
 */
function AchievementRow({
  def,
  tint,
  earned,
  at,
  t,
  f,
}: {
  def: AchievementDef;
  tint: string;
  earned: boolean;
  at: { have: number; need: number };
  t: ReturnType<typeof useT>;
  f: ReturnType<typeof useFormat>;
}) {
  const { style, handlers } = usePressScale(0.985);
  const started = !earned && at.have > 0;

  return (
    <View {...handlers} style={{ gap: 6 }}>
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space.m }, style as never]}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.control,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: earned ? tint : started ? `${tint}66` : color.separator,
            backgroundColor: earned ? `${tint}33` : 'rgba(255,255,255,0.03)',
          }}
        >
          {earned ? (
            <LinearGradient
              colors={[`${tint}AA`, `${tint}22`]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
          ) : null}
          <Icon
            name={earned ? 'star' : 'lock'}
            size={17}
            color={earned ? '#fff' : started ? `${tint}CC` : color.label.quaternary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="body" tone={earned ? 'primary' : started ? 'secondary' : 'tertiary'}>
            {t(def.nameKey)}
          </Text>
          <Text variant="footnote" tone="quaternary">{t(def.hintKey)}</Text>
        </View>
        <Text variant="caption2" tone={earned ? 'secondary' : 'quaternary'}>
          {t('stats.xp', { xp: f.number(def.xp, 0) })}
        </Text>
      </View>

      {started ? (
        <View style={{ paddingLeft: 40 + space.m, gap: 3 }}>
          <ProgressBar value={at.have / at.need} height={3} tint={tint} />
          <Text variant="caption2" tone="quaternary">{`${at.have}/${at.need}`}</Text>
        </View>
      ) : null}
    </View>
  );
}
