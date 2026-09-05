import React from 'react';
import { View, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Aurora, Text, Button, InlineLink } from '@/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, space, geometry } from '@/design/tokens';

/**
 * A-01 · Welcome.
 * Never gated on a network call — this is the first frame after splash, and it
 * has to render with the radio off.
 */
export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: color.bg.canvas }}>
      <Aurora mood="default" />
      <View
        style={{
          flex: 1,
          paddingHorizontal: geometry.screenMargin,
          paddingTop: insets.top + 40,
          paddingBottom: Math.max(insets.bottom, space.lg),
          justifyContent: 'space-between',
        }}
      >
        <View style={{ marginTop: 60 }}>
          <Text variant="caption2" tone="tertiary" style={{ letterSpacing: 3 }}>ROUNDS</Text>
          <Text variant="largeTitle" style={{ marginTop: space.lg, fontSize: 40, lineHeight: 46 }}>
            Know your night.
          </Text>
          <Text variant="body" tone="secondary" style={{ marginTop: space.md, maxWidth: 320 }}>
            Open it before you go out, check it the next morning. It keeps your pace, keeps your
            group together, and gets you home.
          </Text>
        </View>

        <View style={{ gap: space.m }}>
          <Button title="Get started" onPress={() => router.push('/(auth)/sign-in')} />
          <Button
            title="I already have an account"
            kind="glass"
            onPress={() => router.push({ pathname: '/(auth)/sign-in', params: { mode: 'signin' } })}
          />
          <View style={{ alignItems: 'center', marginTop: space.sm }}>
            <Text variant="footnote" tone="quaternary" center style={{ maxWidth: 320 }}>
              17+. ROUNDS estimates pace — it is never a measure of whether you are fit to drive.
            </Text>
            <View style={{ marginTop: space.sm }}>
              <InlineLink
                title="Drinking support resources"
                onPress={() => void Linking.openURL('https://www.who.int/health-topics/alcohol')}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
