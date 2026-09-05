import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Button, Chip, Icon , DrinkGlyph } from '@/ui';
import { useStore } from '@/data/store';
import { CATALOG, byId } from '@/domain/catalog';
import { CUSTOM_ART } from '@/domain/art';
import { useT, useFormat } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * T-09 · Edit night. Add, remove and retime logs after the fact.
 *
 * Deletes of synced rows become tombstones, and pace, spend and streaks are all
 * recomputed locally on save — nothing is cached server-side, which is exactly
 * what makes retroactive editing safe.
 */
export default function EditNight() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const session = store.sessions.find((s) => s.id === id);
  const [adding, setAdding] = useState(false);

  const sessionLogs = useMemo(
    () => store.logs.filter((l) => l.sessionId === id && !l.deleted).sort((a, b) => a.at - b.at),
    [store.logs, id]
  );

  if (!session) return <Screen title={t('session.editNightTitle')} back><Text>{t('session.notFoundShort')}</Text></Screen>;

  return (
    <Screen
      title={t('session.editNight')}
      subtitle={t('session.editNightSubtitle')}
      back
      mood="night"
      footer={<Button title={t('ui.done')} onPress={() => router.back()} />}
    >
      <Card>
        {sessionLogs.map((l) => (
          <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.sm }}>
            <Text variant="footnote" tone="tertiary" style={{ width: 46 }}>{f.clock(l.at)}</Text>
            <DrinkGlyph drink={byId(l.drinkId) ?? { art: CUSTOM_ART[l.category] }} size={20} />
            <Text variant="subheadline" style={{ flex: 1 }}>{l.drinkName}</Text>
            <Pressable
              onPress={() => store.editLog(l.id, { at: l.at - 30 * 60000 })}
              hitSlop={8}
              accessibilityLabel={t('session.moveEarlier', { drink: l.drinkName })}
            >
              <Text variant="footnote" color={color.brand.tintLight}>{t('session.minus30')}</Text>
            </Pressable>
            <Pressable onPress={() => store.deleteLog(l.id)} hitSlop={8} accessibilityLabel={t('session.removeDrink', { drink: l.drinkName })}>
              <Icon name="trash" size={17} color={color.safety} />
            </Pressable>
          </View>
        ))}
        {sessionLogs.length === 0 ? (
          <Text variant="subheadline" tone="tertiary">{t('session.editEmpty')}</Text>
        ) : null}
      </Card>

      {adding ? (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">{t('session.addADrink')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.m }}>
            {CATALOG.map((d) => (
              <Chip
                key={d.id}
                label={d.name}
                glyph={<DrinkGlyph drink={d} size={18} />}
                compact
                onPress={() => {
                  const mid = session.startedAt + ((session.endedAt ?? Date.now()) - session.startedAt) / 2;
                  store.addLog({ drink: d, at: mid, venueId: session.venueId });
                  setAdding(false);
                }}
              />
            ))}
          </View>
        </Card>
      ) : (
        <Button title={t('session.addMissedDrink')} kind="glass" icon="plus" onPress={() => setAdding(true)} />
      )}
    </Screen>
  );
}
