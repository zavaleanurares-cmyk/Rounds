import React, { useEffect, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Icon, InlineLink, useToast } from '@/ui';
import { useStore } from '@/data/store';
import * as purchases from '@/services/purchases';
import { track } from '@/services/analytics';
import { capabilities, whyMissing } from '@/services/optional';
import { color, radius, space } from '@/design/tokens';

const INCLUDED = [
  'Your full history, not the last 90 days',
  'Spend by venue, month and projected year',
  'Predicted vs actual hangover calibration',
  'Wrapped, all slides, exportable',
  'Crew Pass — everyone in one crew gets it',
];

const FREE_FOREVER = [
  'Everything in Get home safe',
  'Logging, pace and the morning after',
  'Plans, crews and shared nights',
];

/**
 * S-14 · Paywall.
 *
 * Three things it refuses to do, enforced here rather than remembered:
 *   · appear during a live night — a paywall at 1am is a one-star review with a
 *     story attached
 *   · put anything in Get home safe behind it, ever
 *   · treat its own result as the truth — the purchase unlocks the UI, the
 *     server webhook is what makes it real
 */
export function Paywall() {
  const router = useRouter();
  const toast = useToast();
  const { updateSettings, activeSession, refreshEntitlement } = useStore();
  const [products, setProducts] = useState<purchases.Product[]>(purchases.FALLBACK_PRODUCTS);
  const [selected, setSelected] = useState<purchases.ProductId>('plus.annual');
  const [busy, setBusy] = useState<'purchase' | 'restore' | null>(null);

  useEffect(() => {
    track('paywall_shown');
    void purchases.loadProducts().then(setProducts);
  }, []);

  // Belt and braces. The router should never route here mid-night, and if it
  // does, this screen declines to be a paywall.
  if (activeSession) {
    return (
      <Screen title="Not now" back mood="night">
        <Card aurora>
          <Text variant="title3">You're out</Text>
          <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
            ROUNDS doesn't sell you anything during a night. This will still be here tomorrow.
          </Text>
        </Card>
        <Button title="Back to tonight" onPress={() => router.replace('/(tabs)/tonight')} />
      </Screen>
    );
  }

  const buy = async () => {
    setBusy('purchase');
    track('purchase_started', { product: selected });
    try {
      const result = await purchases.purchase(selected);
      if (result.active) {
        updateSettings({ subscribed: true });   // optimistic
        await refreshEntitlement();             // authoritative
        track('purchase_completed', { product: selected });
        router.back();
        setTimeout(() => toast.show({ message: 'ROUNDS+ is on' }), 120);
      } else if (!capabilities().purchases) {
        // A tester on Expo Go should still be able to see the paid screens.
        updateSettings({ subscribed: true });
        router.back();
        setTimeout(() => toast.show({ message: 'Unlocked for testing — no purchase was made' }), 120);
      }
    } catch {
      toast.show({ message: "That didn't go through. Nothing was charged." });
    } finally {
      setBusy(null);
    }
  };

  const restorePurchases = async () => {
    setBusy('restore');
    const result = await purchases.restore();
    await refreshEntitlement();
    track('purchase_restored', { found: result.active });
    toast.show({ message: result.active ? 'Restored.' : 'Nothing to restore on this account.' });
    setBusy(null);
  };

  return (
    <Screen
      title="ROUNDS+"
      subtitle="Everything about safety stays free, forever."
      back
      mood="default"
      footer={
        <View style={{ gap: space.m }}>
          <Button title="Start ROUNDS+" loading={busy === 'purchase'} onPress={buy} />
          <View style={{ alignItems: 'center' }}>
            {busy === 'restore' ? (
              <ActivityIndicator color={color.label.tertiary} />
            ) : (
              <InlineLink title="Restore purchases" onPress={restorePurchases} />
            )}
          </View>
        </View>
      }
    >
      <Card aurora accent={color.brand.tint}>
        <Text variant="sectionHeader" tone="tertiary">WHAT YOU GET</Text>
        <View style={{ marginTop: space.m, gap: space.m }}>
          {INCLUDED.map((f) => (
            <View key={f} style={{ flexDirection: 'row', gap: space.m }}>
              <Icon name="checkmark" size={17} color={color.brand.tintLight} />
              <Text variant="subheadline" style={{ flex: 1 }}>{f}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ gap: space.m }}>
        {products.map((p) => {
          const active = selected === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${p.title}, ${p.priceLabel}`}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.md,
                borderRadius: radius.card, backgroundColor: color.surface.primary,
                borderWidth: 1.5, borderColor: active ? color.brand.tint : color.separator,
              }}
            >
              <Icon name={active ? 'checkmark' : 'plus'} size={17} color={active ? color.brand.tintLight : color.label.quaternary} />
              <View style={{ flex: 1 }}>
                <Text variant="headline">{p.title}</Text>
                <Text variant="footnote" tone="tertiary">
                  {p.period === 'lifetime' ? 'once' : `per ${p.period}`}{p.note ? ` · ${p.note}` : ''}
                </Text>
              </View>
              <Text variant="numericSmall">{p.priceLabel}</Text>
            </Pressable>
          );
        })}
      </View>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">FREE FOREVER</Text>
        <View style={{ marginTop: space.m, gap: space.sm }}>
          {FREE_FOREVER.map((f) => (
            <Text key={f} variant="subheadline" tone="secondary">· {f}</Text>
          ))}
        </View>
      </Card>

      {!capabilities().purchases ? (
        <Text variant="footnote" tone="quaternary" center>
          {whyMissing('purchases')} In this build the button unlocks the paid screens for testing
          without charging anything.
        </Text>
      ) : null}

      <Text variant="footnote" tone="quaternary" center>
        Subscriptions renew automatically until cancelled. Manage or cancel in your App Store or
        Google Play account. Terms and Privacy Policy apply.
      </Text>
    </Screen>
  );
}
