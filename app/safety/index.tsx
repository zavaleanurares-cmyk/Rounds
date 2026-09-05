import React, { useMemo, useState } from 'react';
import { View, Pressable, Linking, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Icon, Chip, Glow } from '@/ui';
import { useStore } from '@/data/store';
import { useTick } from '@/hooks/useTick';
import { useT, useFormat } from '@/i18n';
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
  const t = useT();
  const f = useFormat();
  const { safety, profile } = store;
  const now = useTick(30_000);
  const [shareHours, setShareHours] = useState<1 | 2 | 4 | null>(null);
  const sharingUntil = store.safety.locationSharingUntil;
  // Location is shared into a night, because the night is who sees it.
  const liveSession = store.sessions.find((x) => x.endedAt === null) ?? null;

  const remaining = safety.activeCheck ? safety.activeCheck.deadlineAt - now : 0;
  const emergency = EMERGENCY[profile?.region ?? 'RO'] ?? '112';

  const callEmergency = () => {
    const dial = () => void Linking.openURL(`tel:${emergency}`);
    if (Platform.OS === 'web') dial();
    else
      Alert.alert(
        t('safety.callEmergencyTitle', { number: emergency }),
        t('safety.callEmergencyBody'),
        [
          { text: t('ui.cancel'), style: 'cancel' },
          {
            text: t('safety.callEmergencyConfirm', { number: emergency }),
            style: 'destructive',
            onPress: dial,
          },
        ]
      );
  };

  return (
    <Screen title={t('safety.title')} back mood="safety" scroll>
      {safety.activeCheck ? (
        <Card aurora accent={color.safety}>
          <Text variant="sectionHeader" tone="tertiary">{t('safety.checkInArmed')}</Text>
          <Text variant="numericLarge" style={{ marginTop: space.xs }}>
            {remaining > 0 ? f.duration(remaining) : t('safety.dueNow')}
          </Text>
          <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
            {t('safety.armedIntro')}{' '}
            {safety.contacts.length === 0
              ? t('safety.armedEscalationNoContacts')
              : t('safety.armedEscalation', { count: safety.contacts.length })}
          </Text>
          <View style={{ marginTop: space.md, gap: space.m }}>
            <Button title={t('safety.imHomeSafe')} onPress={() => store.resolveSafeArrival()} />
            <Button title={t('safety.anotherHour')} kind="glass" compact onPress={() => store.armSafeArrival({ deadlineAt: now + 3600000, message: safety.activeCheck!.message, contactIds: safety.activeCheck!.contactIds })} />
          </View>
        </Card>
      ) : (
        <Card aurora>
          <Text variant="title3">{t('safety.nothingArmed')}</Text>
          <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
            {t('safety.nothingArmedBody')}
          </Text>
          <View style={{ marginTop: space.md }}>
            <Button title={t('safety.armCheckIn')} onPress={() => router.push('/safety/arm')} />
          </View>
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: space.m }}>
        <Action
          icon="car"
          label={t('safety.rideHome')}
          onPress={() => void Linking.openURL(safety.homeAddress ? `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(safety.homeAddress)}` : 'https://m.uber.com')}
        />
        <Action icon="figure.walk" label={t('safety.walkIt')} onPress={() => void Linking.openURL('https://maps.google.com')} />
        <Action icon="bubble.left" label={t('safety.checkOnMe')} onPress={() => router.push('/safety/contacts')} />
      </View>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('safety.shareLocation')}</Text>
        <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>
          {t('safety.shareLocationBody')}
        </Text>

        {sharingUntil ? (
          /* Sharing is on. The screen says until when, and offers a way out —
             a control you cannot turn off is not a control. */
          <View style={{ marginTop: space.m, gap: space.m }}>
            <Text variant="body">{t('safety.sharingUntil', { time: f.clock(sharingUntil) })}</Text>
            <Button
              title={t('safety.stopSharing')}
              kind="glass"
              compact
              full={false}
              onPress={() => {
                setShareHours(null);
                store.shareLocationFor(0);
              }}
            />
          </View>
        ) : liveSession ? (
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.m }}>
            {([1, 2, 4] as const).map((h) => (
              <Chip
                key={h}
                label={t('safety.hours', { count: h })}
                selected={shareHours === h}
                onPress={() => {
                  setShareHours(h);
                  store.shareLocationFor(h);
                }}
              />
            ))}
          </View>
        ) : (
          /* Nobody to share with. Saying so beats offering a control that
             would silently do nothing — which is what it used to do. */
          <Text variant="footnote" tone="quaternary" style={{ marginTop: space.m }}>
            {t('safety.shareNeedsNight')}
          </Text>
        )}
      </Card>

      <Glow color={color.pace.steady} radius={radius.button}>
        <Pressable
          onPress={() => {
            store.resolveSafeArrival();
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('safety.imHomeSafe')}
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
          <Text variant="title3" color={color.pace.steady}>{t('safety.imHomeSafe')}</Text>
        </Pressable>
      </Glow>

      <Pressable
        onPress={callEmergency}
        accessibilityRole="button"
        accessibilityLabel={t('safety.callEmergencyLabel', { number: emergency })}
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
        <Text variant="body" color={color.safety}>{t('safety.emergency', { number: emergency })}</Text>
      </Pressable>

      <Text variant="footnote" tone="quaternary" center>
        {t('safety.freeForever')}
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
