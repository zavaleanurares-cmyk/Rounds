import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text } from '@/ui';
import { color, radius, space } from '@/design/tokens';

const SQUARES = [
  'Someone loses a jacket', 'Round nobody remembers buying', 'The DJ plays it',
  'Group photo attempt #3', 'Someone says "one more"', 'Taxi debate',
  'Kebab decision', 'Phone at 4%', 'Ana finds the smoking area',
];

/**
 * C-07 · Night bingo — P2, and ONLY as an opt-in party mode inside a live shared
 * night. As a standalone feature it was thin; the group dynamic is the whole
 * mechanic, so it only exists where the group is.
 *
 * Nothing here counts drinks.
 */
export default function Bingo() {
  const router = useRouter();
  const [marked, setMarked] = useState<number[]>([]);
  return (
    <Screen title="Night bingo" subtitle="Nothing here counts drinks." back mood="warm">
      <Card aurora>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {SQUARES.map((s, i) => {
            const on = marked.includes(i);
            return (
              <Pressable
                key={i}
                onPress={() => setMarked((m) => (on ? m.filter((x) => x !== i) : [...m, i]))}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={s}
                style={{
                  width: '31%',
                  aspectRatio: 1,
                  borderRadius: radius.control,
                  backgroundColor: on ? 'rgba(59,130,246,0.25)' : color.surface.secondary,
                  borderWidth: 1,
                  borderColor: on ? color.brand.tintLight : color.separator,
                  padding: space.sm,
                  justifyContent: 'center',
                }}
              >
                <Text variant="caption1" tone={on ? 'primary' : 'secondary'} center>{s}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
      <Text variant="footnote" tone="quaternary" center>{marked.length} of 9</Text>
    </Screen>
  );
}
