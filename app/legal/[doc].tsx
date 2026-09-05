import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen, Text, Card } from '@/ui';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';
import { LEGAL } from '@/content/legal';

/**
 * A-13 · Legal viewer. Loads from a remote URL in production with the bundled
 * copy below as the fallback — the app must never be unable to show its own
 * terms, including at review time with the network stubbed.
 */
export default function LegalDoc() {
  const t = useT();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const entry = LEGAL[doc as keyof typeof LEGAL] ?? LEGAL.terms;
  const hasDraftMarkers = entry.sections.some((s) => s.body.includes('[DRAFT'));
  return (
    <Screen title={entry.title} back mood="night">
      {hasDraftMarkers ? (
        <Card accent={color.warning}>
          <Text variant="footnote" color={color.warning}>
            {t('stats.legalDraftNotice')}
          </Text>
        </Card>
      ) : null}

      <Card>
        <Text variant="footnote" tone="tertiary">{t('stats.legalUpdated', { date: entry.updated })}</Text>
        {entry.sections.map((s) => (
          <View key={s.heading} style={{ marginTop: space.md }}>
            <Text variant="headline">{s.heading}</Text>
            <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>{s.body}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
