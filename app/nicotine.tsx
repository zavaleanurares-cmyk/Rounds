import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, EmptyState, StatTile, DrinkGlyph, useToast } from '@/ui';
import { View } from 'react-native';
import { useStore } from '@/data/store';
import { NICOTINE, isNicotine, nicotineThisWeek, nicotineFreeDays } from '@/domain/nicotine';
import { nightKey } from '@/domain/nightKey';
import { useT, useFormat } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * Y-08 · Nicotine dashboard — module-gated, off by default.
 *
 * It doubles the conceptual surface for the ~70% of people who don't smoke, so
 * it only exists once somebody has asked for it in Settings.
 */
export default function Nicotine() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { profile, logs, logNicotine, undoLast } = useStore();
  const toast = useToast();

  const week = useMemo(() => nicotineThisWeek(logs), [logs]);
  const freeDays = useMemo(() => nicotineFreeDays(logs), [logs]);
  const today = useMemo(() => {
    const key = nightKey(Date.now());
    return logs.filter((l) => !l.deleted && isNicotine(l) && l.nightKey === key).sort((a, b) => a.at - b.at);
  }, [logs]);

  if (!profile?.modules.nicotine) {
    return (
      <Screen title={t('stats.nicotine')} back mood="calm">
        <EmptyState
          icon="flame"
          title={t('stats.nicotineOffTitle')}
          body={t('stats.nicotineOffBody')}
          actionLabel={t('stats.turnItOn')}
          onAction={() => router.push('/settings/modules')}
        />
      </Screen>
    );
  }

  return (
    <Screen title={t('stats.nicotine')} back mood="calm">
      {/*
        Both of these were `f.number(0, 0)` — literal zeros, for as long as the
        module has existed, because nothing could be logged: there was no
        nicotine category, and the "Log nicotine" button below opened the drinks
        sheet. They are counts of real rows now.
      */}
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile label={t('stats.thisWeek')} value={f.number(week, 0)} caption={t('stats.logged')} icon="flame" />
        <StatTile
          label={t('stats.freeStreak')}
          value={f.number(freeDays, 0)}
          caption={t('stats.days')}
          tint={color.pace.steady}
          icon="checkmark.shield"
        />
      </View>

      <Card>
        <Text variant="subheadline" tone="secondary">
          {t('stats.nicotineNote')}
        </Text>
      </Card>

      {/*
        Logged from here rather than from the drink sheet. A cigarette between a
        Negroni and a pint would be in the way of the roughly seven people in
        ten who do not smoke — which is the same reason the module is off by
        default.
      */}
      <View style={{ flexDirection: 'row', gap: space.m }}>
        {NICOTINE.map((d) => (
          <View key={d.id} style={{ flex: 1 }}>
            <Button
              title={d.name}
              kind="glass"
              onPress={() => {
                logNicotine(d.id);
                toast.show({
                  message: t('stats.nicotineLogged', { what: d.name }),
                  actionLabel: t('ui.undo'),
                  onAction: () => undoLast(),
                });
              }}
            />
          </View>
        ))}
      </View>

      {today.length > 0 ? (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">{t('stats.nicotineTonight')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.m }}>
            {today.map((l) => (
              <View key={l.id} style={{ alignItems: 'center', gap: 2 }}>
                <DrinkGlyph drink={NICOTINE.find((d) => d.id === l.drinkId) ?? NICOTINE[0]} size={26} />
                <Text variant="caption2" tone="quaternary">{f.clock(l.at)}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
