import React, { useState } from 'react';
import { View, Pressable, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Avatar, StatTile, Button, Icon, Glass, EmptyState } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

/**
 * C-03 · Person profile.
 *
 * Deliberately absent: their volume, their streaks, any comparison against you.
 * A friend is not a benchmark, and a leaderboard on anything countable about
 * alcohol is both a review risk and the wrong signal.
 *
 * Block and report live here — this is the screen review will look for them on.
 */
export default function PersonProfile() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const person = store.people.find((p) => p.id === id);
  const [menu, setMenu] = useState(false);

  if (!person) {
    return (
      <Screen title={t('social.profileTitle')} back>
        <EmptyState
          title={t('social.personUnavailableTitle')}
          body={t('social.personUnavailableBody')}
          icon="person.crop.circle"
        />
      </Screen>
    );
  }

  const isBlocked = store.blocked.includes(person.id);

  const confirmBlock = () => {
    const doBlock = () => {
      store.blockUser(person.id);
      setMenu(false);
      router.back();
    };
    if (Platform.OS === 'web') doBlock();
    else
      Alert.alert(
        t('social.blockConfirmTitle', { name: person.displayName }),
        t('social.blockConfirmBody'),
        [
          { text: t('ui.cancel'), style: 'cancel' },
          { text: t('social.block'), style: 'destructive', onPress: doBlock },
        ]
      );
  };

  return (
    <Screen
      title={person.displayName}
      back
      mood="calm"
      right={{ icon: 'ellipsis', label: t('ui.more'), onPress: () => setMenu((m) => !m) }}
    >
      <Card aurora>
        <View style={{ alignItems: 'center', gap: space.m, paddingVertical: space.sm }}>
          <Avatar name={person.displayName} size={72} live={person.liveNow} />
          <View style={{ alignItems: 'center' }}>
            <Text variant="title2">{person.displayName}</Text>
            <Text variant="subheadline" tone="tertiary">
              {t('social.handleLevel', { username: person.username, level: person.level })}
            </Text>
          </View>
        </View>
      </Card>

      {menu ? (
        <Glass radius={radius.card}>
          <View style={{ padding: space.sm }}>
            <MenuItem
              label={person.status === 'friend' ? t('social.removeFriend') : t('social.addFriend')}
              icon="person.2"
              onPress={() => {
                setMenu(false);
                if (person.status !== 'friend') {
                  store.addFriend(person.id);
                  return;
                }
                // Confirmed, because it is not undoable from this side: asking
                // again means sending a new request and waiting for an answer.
                Alert.alert(
                  t('social.removeFriendTitle', { name: person.displayName }),
                  t('social.removeFriendBody'),
                  [
                    { text: t('ui.cancel'), style: 'cancel' },
                    {
                      text: t('social.removeFriend'),
                      style: 'destructive',
                      onPress: () => store.removeFriend(person.id),
                    },
                  ]
                );
              }}
            />
            <MenuItem label={isBlocked ? t('social.unblock') : t('social.block')} icon="hand.raised" destructive onPress={isBlocked ? () => { store.unblockUser(person.id); setMenu(false); } : confirmBlock} />
            <MenuItem
              label={t('social.report')}
              icon="flag"
              destructive
              onPress={() => {
                setMenu(false);
                router.push(`/report/user/${person.id}` as never);
              }}
            />
          </View>
        </Glass>
      ) : null}

      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile label={t('social.nightsTogetherLabel')} value={String(person.sharedNights)} icon="moon.stars" />
        <StatTile
          label={t('social.mutualCrews')}
          value={String(person.mutualCrews.length)}
          caption={person.mutualCrews.join(', ') || undefined}
          icon="person.2"
        />
      </View>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('social.whatYouDontSee')}</Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.sm }}>
          {t('social.whatYouDontSeeBody')}
        </Text>
      </Card>

      {person.status !== 'friend' && !isBlocked ? (
        <Button title={t('social.addFriend')} onPress={() => store.addFriend(person.id)} />
      ) : null}
    </Screen>
  );
}

function MenuItem({
  label,
  icon,
  onPress,
  destructive,
}: {
  label: string;
  icon: 'person.2' | 'hand.raised' | 'flag';
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.m,
        minHeight: 48,
        paddingHorizontal: space.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name={icon} size={18} color={destructive ? color.safety : color.label.primary} />
      <Text variant="body" color={destructive ? color.safety : color.label.primary}>{label}</Text>
    </Pressable>
  );
}
