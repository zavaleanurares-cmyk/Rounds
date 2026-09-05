import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text } from '@/ui';
import { useT } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

const SQUARES = [
  'live.bingoJacket', 'live.bingoRound', 'live.bingoDj',
  'live.bingoPhoto', 'live.bingoOneMore', 'live.bingoTaxi',
  'live.bingoKebab', 'live.bingoBattery', 'live.bingoSmoking',
] as const;

/**
 * C-07 · Night bingo — P2, and ONLY as an opt-in party mode inside a live shared
 * night. As a standalone feature it was thin; the group dynamic is the whole
 * mechanic, so it only exists where the group is.
 *
 * Nothing here counts drinks.
 */
export default function Bingo() {
  const router = useRouter();
  const t = useT();
  const [marked, setMarked] = useState<number[]>([]);
  return (
    <Screen title={t('live.bingoTitle')} subtitle={t('live.bingoSubtitle')} back mood="warm">
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
                accessibilityLabel={t(s)}
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
                <Text variant="caption1" tone={on ? 'primary' : 'secondary'} center>{t(s)}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
      <Text variant="footnote" tone="quaternary" center>
        {t('live.bingoProgress', { count: marked.length, total: SQUARES.length })}
      </Text>
    </Screen>
  );
}
