import React, { useMemo, useState } from 'react';
import { View, Pressable, Linking, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Icon, Chip, Glow } from '@/ui';
import { useStore } from '@/data/store';
import { useTick } from '@/hooks/useTick';
import { formatDuration } from '@/domain/stats';
import { color, radius, space } from '@/design/tokens';

const EMERGENCY: Record<string, string> = { RO: '112', UK: '999', US: '911', EU: '112' };

/**
 * Y-10 · Get home safe.
 *
 * Free forever. No paywall, no upsell, ever — a paywall in front of this would
 * be indefensible and a paywall at 1am is a one-star review with a story
 * attached. Reachable from anywhere, and never a blocking modal.
 *
 * The estimate is deliberately NOT on this screen: it sits next to a transport
 * affordance here, and that is the one adjacency the product must never create.
 */
export default function Safety() {
  const router = useRouter();
  const store = useStore();
  const { safety, profile } = store;
  const now = useTick(30_000);
  const [shareHours, setShareHours] = useState<1 | 2 | 4 | null>(null);

  const remaining = safety.activeCheck ? safety.activeCheck.deadlineAt - now : 0;
  const emergency = EMERGENCY[profile?.region ?? 'RO'] ?? '112';

  const callEmergency = () => {
    const dial = () => void Linking.openURL(`tel:${emergency}`);
    if (Platform.OS === 'web') dial();
    else
      Alert.alert(`Call ${emergency}?`, 'This dials emergency services.', [
        { text: 'Cancel', style: 'cancel' },
        { text: `Call ${emergency}`, style: 'destructive', onPress: dial },
      ]);
  };

  return (
    <Screen title="Get home safe" back mood="safety" scroll>
      {safety.activeCheck ? (
        <Card aurora accent={color.safety}>
          <Text variant="sectionHeader" tone="tertiary">CHECK-IN ARMED</Text>
          <Text variant="numericLarge" style={{ marginTop: space.xs }}>
            {remaining > 0 ? formatDuration(remaining) : 'due now'}
          </Text>
          <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
            If you don't check in, we'll ask you first. Fifteen minutes later,{' '}
            {safety.contacts.length || 'your'} trusted {safety.contacts.length === 1 ? 'contact' : 'contacts'} get your
            message and your last venue.
          </Text>
          <View style={{ marginTop: space.md, gap: space.m }}>
            <Button title="I'm home safe" onPress={() => store.resolveSafeArrival()} />
            <Button title="Give me another hour" kind="glass" compact onPress={() => store.armSafeArrival({ deadlineAt: now + 3600000, message: safety.activeCheck!.message, contactIds: safety.activeCheck!.contactIds })} />
          </View>
        </Card>
      ) : (
        <Card aurora>
          <Text variant="title3">Nothing armed</Text>
          <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
            Set a time you expect to be home. If you don't check in by then, we ask you before we ask
            anyone else — and you can always see the exact message first.
          </Text>
          <View style={{ marginTop: space.md }}>
            <Button title="Arm a check-in" onPress={() => router.push('/safety/arm')} />
          </View>
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: space.m }}>
        <Action
          icon="car"
          label="Ride home"
          onPress={() => void Linking.openURL(safety.homeAddress ? `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(safety.homeAddress)}` : 'https://m.uber.com')}
        />
        <Action icon="figure.walk" label="Walk it" onPress={() => void Linking.openURL('https://maps.google.com')} />
        <Action icon="bubble.left" label="Check on me" onPress={() => router.push('/safety/contacts')} />
      </View>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">SHARE MY LOCATION</Text>
        <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>
          Timed, with your trusted contacts only. It stops on its own.
        </Text>
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.m }}>
          {([1, 2, 4] as const).map((h) => (
            <Chip
              key={h}
              label={`${h}h`}
              selected={shareHours === h}
              onPress={() => {
                setShareHours(h);
                store.shareLocationFor(h);
              }}
            />
          ))}
        </View>
      </Card>

      <Glow color={color.pace.steady} radius={radius.button}>
        <Pressable
          onPress={() => {
            store.resolveSafeArrival();
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="I'm home safe"
          style={{
            minHeight: 64,
            borderRadius: radius.button,
            backgroundColor: 'rgba(48,209,88,0.16)',
            borderWidth: 1.5,
            borderColor: color.pace.steady,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="title3" color={color.pace.steady}>I'm home safe</Text>
        </Pressable>
      </Glow>

      <Pressable
        onPress={callEmergency}
        accessibilityRole="button"
        accessibilityLabel={`Call emergency services, ${emergency}`}
        style={{
          minHeight: 52,
          borderRadius: radius.button,
          borderWidth: 1,
          borderColor: 'rgba(255,69,58,0.4)',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: space.sm,
        }}
      >
        <Icon name="phone" size={18} color={color.safety} />
        <Text variant="body" color={color.safety}>Emergency · {emergency}</Text>
      </Pressable>

      <Text variant="footnote" tone="quaternary" center>
        Everything on this screen is free, always. ROUNDS never puts a subscription in front of it.
      </Text>
    </Screen>
  );
}

function Action({ icon, label, onPress }: { icon: 'car' | 'figure.walk' | 'bubble.left'; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 84,
        borderRadius: radius.card,
        backgroundColor: color.surface.primary,
        borderWidth: 1,
        borderColor: color.card.rim,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Icon name={icon} size={22} color={color.label.primary} />
      <Text variant="caption1" tone="secondary">{label}</Text>
    </Pressable>
  );
}
