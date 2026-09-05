import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Button } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

const MONTH_KEYS = [
  'onboarding.monthJan', 'onboarding.monthFeb', 'onboarding.monthMar', 'onboarding.monthApr',
  'onboarding.monthMay', 'onboarding.monthJun', 'onboarding.monthJul', 'onboarding.monthAug',
  'onboarding.monthSep', 'onboarding.monthOct', 'onboarding.monthNov', 'onboarding.monthDec',
] as const;

/**
 * A-04 · Age gate.
 *
 * Region minimum: 18 in EU/UK/RO, 21 in the US. The result is persisted
 * server-side and re-checked on login — a reinstall must not reset it.
 */
export default function AgeGate() {
  const router = useRouter();
  const t = useT();
  const { submitDob } = useStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear() - 22);
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(15);

  const years = useMemo(
    () => Array.from({ length: 80 }, (_, i) => now.getFullYear() - 15 - i),
    [now]
  );
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const submit = () => {
    const dob = new Date(year, month, Math.min(day, daysInMonth)).toISOString().slice(0, 10);
    const result = submitDob(dob);
    router.replace(result.underage ? '/(onboarding)/blocked' : '/(onboarding)/identity');
  };

  return (
    <Screen
      title={t('onboarding.ageTitle')}
      subtitle={t('onboarding.ageSubtitle')}
      mood="night"
      footer={<Button title={t('onboarding.continue')} onPress={submit} />}
    >
      <Card aurora>
        <View style={{ flexDirection: 'row', gap: space.m, height: 210 }}>
          <Wheel
            label={t('onboarding.day')}
            values={Array.from({ length: daysInMonth }, (_, i) => i + 1)}
            value={Math.min(day, daysInMonth)}
            onChange={setDay}
            render={(v) => String(v)}
          />
          <Wheel
            label={t('onboarding.month')}
            values={MONTH_KEYS.map((_, i) => i)}
            value={month}
            onChange={setMonth}
            render={(v) => t(MONTH_KEYS[v])}
          />
          <Wheel label={t('onboarding.year')} values={years} value={year} onChange={setYear} render={(v) => String(v)} />
        </View>
      </Card>
      <Text variant="footnote" tone="quaternary" center>
        {t('onboarding.ageNote')}
      </Text>
    </Screen>
  );
}

function Wheel<T extends number>({
  label,
  values,
  value,
  onChange,
  render,
}: {
  label: string;
  values: T[];
  value: T;
  onChange: (v: T) => void;
  render: (v: T) => string;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text variant="caption1" tone="tertiary" center style={{ marginBottom: space.sm }}>{label}</Text>
      <ScrollView showsVerticalScrollIndicator={false} accessibilityLabel={label}>
        {values.map((v) => {
          const active = v === value;
          return (
            <Pressable
              key={String(v)}
              onPress={() => onChange(v)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={render(v)}
              style={{
                paddingVertical: 9,
                alignItems: 'center',
                borderRadius: radius.control,
                backgroundColor: active ? 'rgba(59,130,246,0.22)' : 'transparent',
              }}
            >
              <Text variant="body" color={active ? color.brand.tintLight : color.label.secondary}>
                {render(v)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
