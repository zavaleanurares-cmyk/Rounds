import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Button, Chip, Avatar, Icon, useToast , DrinkGlyph } from '@/ui';
import { useStore } from '@/data/store';
import { CATALOG } from '@/domain/catalog';
import { color, space } from '@/design/tokens';

/**
 * L-03 · Round builder.
 *
 * Logs one drink for you and sends everyone else a one-tap "Ana bought you a
 * Peroni — log it?" — it never logs on their behalf. Somebody else's history is
 * not yours to write.
 */
export default function RoundBuilder() {
  const router = useRouter();
  const toast = useToast();
  const store = useStore();
  const friends = store.people.filter((p) => p.status === 'friend');
  const [selected, setSelected] = useState<string[]>(friends.filter((f) => f.liveNow).map((f) => f.id));
  const [drinkId, setDrinkId] = useState('beer-pint');
  const drink = CATALOG.find((d) => d.id === drinkId)!;

  return (
    <Sheet
      title="Buying a round"
      subtitle="Logs yours now, asks the others."
      onClose={() => router.back()}
      footer={
        <Button
          title={`Log mine · ask ${selected.length}`}
          onPress={() => {
            // The round size is a social fact about this log, not a quantity:
            // one drink is still logged for you and none for anybody else.
            store.addLog({ drink, roundSize: selected.length + 1 });
            router.back();
            setTimeout(
              () =>
                toast.show({
                  message: `${drink.name} logged, ${selected.length} asked`,
                  actionLabel: 'Undo',
                  onAction: () => store.undoLast(),
                }),
              120
            );
          }}
        />
      }
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Text variant="sectionHeader" tone="tertiary">WHAT</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {CATALOG.filter((d) => d.ethanolG > 0).slice(0, 8).map((d) => (
            <Chip key={d.id} label={d.name} glyph={<DrinkGlyph drink={d} size={18} />} selected={d.id === drinkId} onPress={() => setDrinkId(d.id)} compact />
          ))}
        </View>

        <Text variant="sectionHeader" tone="tertiary" style={{ marginTop: space.sm }}>WHO'S IN IT</Text>
        {friends.length === 0 ? (
          <Text variant="subheadline" tone="tertiary">Add some friends first and they'll show up here.</Text>
        ) : (
          friends.map((f) => {
            const on = selected.includes(f.id);
            return (
              <Pressable
                key={f.id}
                onPress={() => setSelected((s) => (on ? s.filter((x) => x !== f.id) : [...s, f.id]))}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={f.displayName}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.sm }}
              >
                <Avatar name={f.displayName} size={34} live={f.liveNow} />
                <Text variant="body" style={{ flex: 1 }}>{f.displayName}</Text>
                <Icon name={on ? 'checkmark' : 'plus'} size={18} color={on ? color.success : color.label.quaternary} />
              </Pressable>
            );
          })
        )}
      </View>
    </Sheet>
  );
}
