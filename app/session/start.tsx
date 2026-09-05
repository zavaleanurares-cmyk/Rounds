import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Button, Chip, Segmented, ToggleRow } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import type { Visibility } from '@/domain/types';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

/** T-06 · Start night sheet. */
export default function StartNight() {
  const router = useRouter();
  const t = useT();
  const { startSession, venues, profile, crews } = useStore();
  const [title, setTitle] = useState('');
  const [venueId, setVenueId] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Visibility>(profile?.defaultVisibility ?? 'friends');
  const [invite, setInvite] = useState(true);

  return (
    <Sheet
      title={t('session.startTitle')}
      onClose={() => router.back()}
      footer={
        <Button
          title={t('session.start')}
          onPress={() => {
            startSession({ title: title.trim() || null, venueId, visibility });
            router.replace('/(tabs)/tonight');
          }}
        />
      }
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Field
          label={t('session.nameLabel')}
          value={title}
          onChangeText={setTitle}
          placeholder={t('session.namePlaceholder')}
          autoCapitalize="sentences"
        />

        <Text variant="sectionHeader" tone="tertiary">{t('session.startingAt')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {venues.slice(0, 6).map((v) => (
            <Chip key={v.id} label={v.name} compact selected={venueId === v.id} onPress={() => setVenueId(v.id)} />
          ))}
          <Chip label={t('session.searchVenue')} compact onPress={() => router.push('/venue/search')} />
        </View>

        <Text variant="sectionHeader" tone="tertiary">{t('session.whoCanSeeIt')}</Text>
        <Segmented
          label={t('session.visibilityLabel')}
          value={visibility}
          onChange={setVisibility}
          options={[
            { value: 'private', label: t('session.visibilityPrivate') },
            { value: 'friends', label: t('session.visibilityFriends') },
            { value: 'crew', label: t('session.visibilityCrew') },
            { value: 'link', label: t('session.visibilityLink') },
          ]}
        />
        <Text variant="footnote" tone="tertiary">
          {visibility === 'private'
            ? t('session.visibilityPrivateNote')
            : t('session.visibilitySharedNote')}
        </Text>

        {visibility !== 'private' ? (
          <ToggleRow
            title={t('session.tellTheCrew')}
            subtitle={
              crews[0]
                ? t('session.crewNotified', { crew: crews[0].name })
                : t('session.crewsNotified')
            }
            value={invite}
            onValueChange={setInvite}
            last
          />
        ) : null}
      </View>
    </Sheet>
  );
}
