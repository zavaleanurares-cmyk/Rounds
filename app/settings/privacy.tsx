import React from 'react';
import { Screen, Card, Group, ToggleRow, Text, Segmented } from '@/ui';
import { View } from 'react-native';
import { useStore } from '@/data/store';
import type { Visibility } from '@/domain/types';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

/** S-06 · Privacy. */
export default function Privacy() {
  const t = useT();
  const { profile, updateProfile, settings, updateSettings } = useStore();
  return (
    <Screen title={t('settings.privacy')} back mood="night">
      <Group>
        <ToggleRow
          title={t('settings.privateAccount')}
          subtitle={t('settings.privateAccountSubtitle')}
          value={profile?.privateAccount ?? false}
          onValueChange={(v) => updateProfile({ privateAccount: v })}
        />
        <ToggleRow
          title={t('settings.contactMatching')}
          subtitle={t('settings.contactMatchingSubtitle')}
          value={settings.contactMatching}
          onValueChange={(v) => updateSettings({ contactMatching: v })}
        />
        <ToggleRow
          title={t('settings.shareLocationDefault')}
          subtitle={t('settings.shareLocationDefaultSubtitle')}
          value={settings.locationSharingDefault}
          onValueChange={(v) => updateSettings({ locationSharingDefault: v })}
          last
        />
      </Group>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('settings.defaultVisibilityHeader')}</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label={t('settings.defaultVisibilityLabel')}
            value={profile?.defaultVisibility ?? 'friends'}
            onChange={(v: Visibility) => updateProfile({ defaultVisibility: v })}
            options={[
              { value: 'private', label: t('settings.visibilityPrivate') },
              { value: 'friends', label: t('settings.visibilityFriends') },
              { value: 'crew', label: t('settings.visibilityCrew') },
            ]}
          />
        </View>
      </Card>

      <Card>
        <Text variant="footnote" tone="tertiary">
          {t('settings.privacyNote')}
        </Text>
      </Card>
    </Screen>
  );
}
