import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, Avatar, StatTile } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * Y-02 · Public profile preview — "this is what friends see".
 *
 * Worth its own screen because the answer is reassuring and non-obvious: almost
 * nothing. Showing people that is cheaper than explaining it in a privacy
 * policy nobody reads.
 */
export default function ProfilePreview() {
  const t = useT();
  const { profile, sessions } = useStore();

  return (
    <Screen title={t('social.previewTitle')} subtitle={t('social.previewSubtitle')} back mood="calm">
      <Card aurora>
        <View style={{ alignItems: 'center', gap: space.m, paddingVertical: space.sm }}>
          <Avatar name={profile?.displayName || t('social.you')} size={72} />
          <View style={{ alignItems: 'center' }}>
            <Text variant="title2">{profile?.displayName || t('social.you')}</Text>
            <Text variant="subheadline" tone="tertiary">
              {t('social.handleLevel', {
                username: profile?.username || t('social.usernameFallback'),
                level: profile?.level ?? 1,
              })}
            </Text>
          </View>
        </View>
      </Card>

      {/*
        Both of these are different for every viewer — that is the whole point
        of the screen — so neither has a number here. It used to show "—" beside
        a mutual-crew count of `shared > 0 ? 1 : 0`: one if you had any friend
        at all, ignoring your crews entirely, and the same answer whoever was
        looking. Saying "depends who is looking" is both true and the more
        reassuring answer.
      */}
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile
          label={t('social.nightsTogetherLabel')}
          value={t('social.dependsOnViewer')}
          caption={t('social.perPerson')}
          icon="moon.stars"
        />
        <StatTile
          label={t('social.mutualCrews')}
          value={t('social.dependsOnViewer')}
          caption={t('social.perPerson')}
          icon="person.2"
        />
      </View>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('social.whatTheyCannotSee')}</Text>
        <View style={{ marginTop: space.m, gap: space.sm }}>
          {[
            t('social.cannotSeeVolume'),
            t('social.cannotSeePace'),
            t('social.cannotSeeSpend'),
            t('social.cannotSeeNights', { count: sessions.length }),
            t('social.cannotSeeBody'),
          ].map((line) => (
            <Text key={line} variant="subheadline" tone="secondary">{t('social.bulletLine', { line })}</Text>
          ))}
        </View>
      </Card>

      <Text variant="footnote" tone="quaternary" center>
        {t('social.notABenchmark')}
      </Text>
    </Screen>
  );
}
