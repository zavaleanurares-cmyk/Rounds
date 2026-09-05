import React, { useEffect, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Icon, InlineLink, useToast } from '@/ui';
import { useStore } from '@/data/store';
import { useI18n, useT, type MessageKey } from '@/i18n';
import * as purchases from '@/services/purchases';
import { track } from '@/services/analytics';
import { capabilities, whyMissing } from '@/services/optional';
import { color, radius, space } from '@/design/tokens';

const INCLUDED = [
  'billing.includedHistory',
  'billing.includedSpend',
  'billing.includedCalibration',
  'billing.includedWrapped',
  'billing.includedCrewPass',
] as const satisfies ReadonlyArray<MessageKey>;

const FREE_FOREVER = [
  'billing.freeSafety',
  'billing.freeLogging',
  'billing.freeSocial',
] as const satisfies ReadonlyArray<MessageKey>;

/**
 * What a product costs, per period, as a whole phrase rather than "per " plus a
 * word — the noun after the preposition inflects in three of the four languages.
 */
const PERIOD: Record<purchases.Product['period'], { plain: MessageKey; withNote: MessageKey }> = {
  month: { plain: 'billing.periodMonth', withNote: 'billing.periodMonthNote' },
  year: { plain: 'billing.periodYear', withNote: 'billing.periodYearNote' },
  lifetime: { plain: 'billing.periodOnce', withNote: 'billing.periodOnceNote' },
};

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
  const t = useT();
  const { locale } = useI18n();
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
      <Screen title={t('billing.notNowTitle')} back mood="night">
        <Card aurora>
          <Text variant="title3">{t('billing.youreOut')}</Text>
          <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
            {t('billing.notDuringNight')}
          </Text>
        </Card>
        <Button title={t('billing.backToTonight')} onPress={() => router.replace('/(tabs)/tonight')} />
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
        setTimeout(() => toast.show({ message: t('billing.toastPlusOn') }), 120);
      } else if (!capabilities().purchases) {
        // A tester on Expo Go should still be able to see the paid screens.
        updateSettings({ subscribed: true });
        router.back();
        setTimeout(() => toast.show({ message: t('billing.toastTestUnlock') }), 120);
      }
    } catch {
      toast.show({ message: t('billing.toastPurchaseFailed') });
    } finally {
      setBusy(null);
    }
  };

  const restorePurchases = async () => {
    setBusy('restore');
    const result = await purchases.restore();
    await refreshEntitlement();
    track('purchase_restored', { found: result.active });
    toast.show({
      message: result.active ? t('billing.toastRestored') : t('billing.toastNothingToRestore'),
    });
    setBusy(null);
  };

  return (
    <Screen
      title={t('billing.plus')}
      subtitle={t('billing.subtitle')}
      back
      mood="default"
      footer={
        <View style={{ gap: space.m }}>
          <Button title={t('billing.startPlus')} loading={busy === 'purchase'} onPress={buy} />
          <View style={{ alignItems: 'center' }}>
            {busy === 'restore' ? (
              <ActivityIndicator color={color.label.tertiary} />
            ) : (
              <InlineLink title={t('billing.restorePurchases')} onPress={restorePurchases} />
            )}
          </View>
        </View>
      }
    >
      <Card aurora accent={color.brand.tint}>
        <Text variant="sectionHeader" tone="tertiary">{t('billing.whatYouGet')}</Text>
        <View style={{ marginTop: space.m, gap: space.m }}>
          {INCLUDED.map((f) => (
            <View key={f} style={{ flexDirection: 'row', gap: space.m }}>
              <Icon name="checkmark" size={17} color={color.brand.tintLight} />
              <Text variant="subheadline" style={{ flex: 1 }}>{t(f)}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ gap: space.m }}>
        {products.map((p) => {
          const active = selected === p.id;
          const period = PERIOD[p.period];
          // The store's own title when it answered, our catalogue when it did
          // not. Never a bare English word in a French build.
          const title = p.title ?? (p.titleKey ? t(p.titleKey) : '');
          const note = p.note ?? (p.noteKey ? t(p.noteKey) : undefined);
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t('billing.productLabel', { title, price: p.priceLabel })}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.md,
                borderRadius: radius.card, backgroundColor: color.surface.primary,
                borderWidth: 1.5, borderColor: active ? color.brand.tint : color.separator,
              }}
            >
              <Icon name={active ? 'checkmark' : 'plus'} size={17} color={active ? color.brand.tintLight : color.label.quaternary} />
              <View style={{ flex: 1 }}>
                <Text variant="headline">{title}</Text>
                <Text variant="footnote" tone="tertiary">
                  {note ? t(period.withNote, { note: note }) : t(period.plain)}
                </Text>
              </View>
              <Text variant="numericSmall">{p.priceLabel}</Text>
            </Pressable>
          );
        })}
      </View>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('billing.freeForever')}</Text>
        <View style={{ marginTop: space.m, gap: space.sm }}>
          {FREE_FOREVER.map((f) => (
            <Text key={f} variant="subheadline" tone="secondary">· {t(f)}</Text>
          ))}
        </View>
      </Card>

      {!capabilities().purchases ? (
        <Text variant="footnote" tone="quaternary" center>
          {whyMissing('purchases', locale)} {t('billing.testBuildNote')}
        </Text>
      ) : null}

      <Text variant="footnote" tone="quaternary" center>
        {t('billing.renewalNote')}
      </Text>
    </Screen>
  );
}
