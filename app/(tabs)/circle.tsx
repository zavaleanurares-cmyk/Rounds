import React from 'react';
import { View, Pressable, Platform, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Avatar, Icon, Button, EmptyState, NavRow, Group } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * C-01 · Circle home. Replaces the Feed.
 *
 * Why it beats a feed: it is actionable, ephemeral, cannot be doomscrolled, and
 * contains no user-generated content — so it needs no moderation queue, which
 * removes the single biggest store-review risk in the product.
 */
export default function Circle() {
  const router = useRouter();
  const t = useT();
  const { people, crews, profile, blocked } = useStore();
  const friends = people.filter((p) => p.status === 'friend' && !blocked.includes(p.id));
  const out = friends.filter((p) => p.liveNow);
  const requests = people.filter((p) => p.status === 'pending_in');
  const nightOne = friends.length === 0 && crews.length === 0;

  return (
    <Screen
      title={t('social.title')}
      mood="calm"
      tabBarSpace
      right={{ icon: 'bell', label: t('social.notifications'), onPress: () => router.push('/notifications') }}
    >
      {nightOne ? (
        <>
          <EmptyState
            icon="person.2"
            title={t('social.emptyTitle')}
            body={t('social.emptyBody')}
            actionLabel={t('social.findPeople')}
            onAction={() => router.push('/people/search')}
          />
          <Card>
            <Text variant="sectionHeader" tone="tertiary">{t('social.yourCode')}</Text>
            <Text variant="numericMedium" style={{ marginTop: space.sm }}>
              {t('social.handle', { username: profile?.username ?? t('social.usernameFallback') })}
            </Text>
            <View style={{ marginTop: space.m }}>
              <Button
                title={t('social.shareIt')}
                kind="glass"
                compact
                icon="square.and.arrow.up"
                onPress={() =>
                  void Share.share({ message: t('social.shareMessage', { username: profile?.username ?? '' }) })
                }
              />
            </View>
          </Card>
        </>
      ) : (
        <>
          {requests.length > 0 ? (
            <Card accent={color.brand.tint} onPress={() => router.push('/people/requests')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
                <Icon name="person.2" size={20} color={color.brand.tintLight} />
                <Text variant="headline" style={{ flex: 1 }}>
                  {t('social.friendRequests', { count: requests.length })}
                </Text>
                <Icon name="chevron.right" size={15} color={color.label.quaternary} />
              </View>
            </Card>
          ) : null}

          {out.length > 0 ? (
            <Card aurora accent={color.pace.steady}>
              <Text variant="sectionHeader" tone="tertiary">{t('social.outRightNow')}</Text>
              <View style={{ marginTop: space.m, gap: space.m }}>
                {out.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/people/${p.id}` as never)}
                    accessibilityRole="button"
                    accessibilityLabel={t('social.outNowLabel', { name: p.displayName })}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}
                  >
                    <Avatar name={p.displayName} size={40} live />
                    <View style={{ flex: 1 }}>
                      <Text variant="headline">{p.displayName}</Text>
                      <Text variant="footnote" tone="tertiary">{t('social.outNow')}</Text>
                    </View>
                    <Icon name="chevron.right" size={15} color={color.label.quaternary} />
                  </Pressable>
                ))}
              </View>
            </Card>
          ) : null}

          {crews.length > 0 ? (
            <Group title={t('social.crews')}>
              {crews.map((c, i) => (
                <NavRow
                  key={c.id}
                  title={c.name}
                  icon={c.icon}
                  subtitle={t('ui.people', { count: c.memberIds.length })}
                  onPress={() => router.push(`/crew/${c.slug}` as never)}
                  last={i === crews.length - 1}
                />
              ))}
            </Group>
          ) : (
            <Button title={t('social.makeCrew')} kind="glass" icon="person.2" onPress={() => router.push('/crew/new')} />
          )}

          <Group title={t('social.friendsHeader', { count: friends.length })}>
            {friends.map((p, i) => (
              <NavRow
                key={p.id}
                title={p.displayName}
                subtitle={
                  p.sharedNights > 0
                    ? t('social.nightsTogether', { count: p.sharedNights })
                    : t('social.noNightsTogether')
                }
                onPress={() => router.push(`/people/${p.id}` as never)}
                last={i === friends.length - 1}
              />
            ))}
          </Group>

          <Button title={t('social.findPeople')} kind="glass" icon="magnifyingglass" onPress={() => router.push('/people/search')} />
        </>
      )}

      <Button title={t('social.joinNight')} kind="plain" icon="qrcode.viewfinder" onPress={() => router.push('/live/join')} />
      {Platform.OS === 'web' ? null : null}
    </Screen>
  );
}
