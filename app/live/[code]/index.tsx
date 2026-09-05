import React, { useMemo, useState } from 'react';
import { View, Pressable, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Avatar, Icon, Chip, Glass, EmptyState, Button, Reaction, REACTIONS, REACTION_LABEL, type ReactionKind } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { useSessionRealtime } from '@/hooks/useSessionRealtime';
import { paceState } from '@/domain/pace';
import { useT } from '@/i18n';
import { paceColor, paceWord, color, radius, space } from '@/design/tokens';

/**
 * C-06 · Live room.
 *
 * One multiplexed realtime channel per session carrying logs, participants,
 * cheers and chat, reconnecting on foreground with backoff. Location is opt-in
 * per night, participants only, auto-expiring at session end, with a persistent
 * indicator while it's on — and batched at 2–3 minute intervals, because a busy
 * Saturday is where this becomes the first real load problem.
 */
export default function LiveRoom() {
  const router = useRouter();
  const t = useT();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { sessions, people, logs, profile, blocked } = useStore();
  const session = sessions.find((s) => s.joinCode === code);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Array<{ id: string; who: string; text?: string; reaction?: ReactionKind }>>([
    { id: '1', who: 'Ana Marin', text: t('live.sampleMessageOne') },
    { id: '2', who: 'Tudor', text: t('live.sampleMessageTwo') },
  ]);
  const [sharingLocation, setSharingLocation] = useState(false);

  // One multiplexed channel, reconnecting on foreground with backoff.
  const realtime = useSessionRealtime(session?.id ?? null, {
    onMessage: (row) =>
      setChat((c) => [...c, { id: String(row.id), who: String(row.user_id), text: String(row.body) }]),
  });

  const roster = useMemo(
    () => people.filter((p) => p.status === 'friend' && p.liveNow && !blocked.includes(p.id)),
    [people, blocked]
  );

  const myPace = useMemo(() => {
    if (!session) return null;
    const mine = logs.filter((l) => l.sessionId === session.id && !l.deleted);
    return paceState({
      logs: mine.map((l) => ({ at: l.at, ethanolG: l.ethanolG })),
      weekdayMedianG: null,
      startedAt: session.startedAt,
    });
  }, [logs, session]);

  if (!session) {
    return (
      <Screen title={t('live.title')} back>
        <EmptyState icon="qrcode.viewfinder" title={t('live.overTitle')} body={t('live.overBody')} />
      </Screen>
    );
  }

  return (
    <Screen
      title={session.title ?? t('live.title')}
      subtitle={t('live.codeLine', { code: session.joinCode ?? code })}
      back
      mood="default"
      right={{
        icon: 'square.and.arrow.up',
        label: t('live.shareCode'),
        onPress: () => void Share.share({ message: t('live.shareMessage', { code: session.joinCode ?? code }) }),
      }}
      footer={
        <Glass radius={radius.control}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm }}>
            <View style={{ flex: 1 }}>
              <Field label="" value={message} onChangeText={setMessage} placeholder={t('live.chatPlaceholder')} autoCapitalize="sentences" />
            </View>
            <Pressable
              onPress={() => {
                if (!message.trim()) return;
                setChat((c) => [...c, { id: String(Date.now()), who: t('live.you'), text: message.trim() }]);
                setMessage('');
              }}
              accessibilityRole="button"
              accessibilityLabel={t('live.send')}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="arrow.up.right" size={20} color={color.brand.tintLight} />
            </Pressable>
          </View>
        </Glass>
      }
    >
      <Card aurora accent={color.pace.steady}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <View
            style={{
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: realtime === 'reconnecting' ? color.warning : color.pace.steady,
            }}
          />
          <Text variant="sectionHeader" tone="tertiary" style={{ flex: 1 }}>
            {t('live.hereHeader', { count: roster.length + 1 })}
          </Text>
          {realtime === 'reconnecting' ? (
            <Text variant="caption2" color={color.warning}>{t('live.reconnecting')}</Text>
          ) : null}
        </View>
        <View style={{ marginTop: space.m, gap: space.m }}>
          <RosterRow name={profile?.displayName ?? t('live.you')} state={myPace ? t(paceWord[myPace.state]) : '—'} tint={myPace ? paceColor[myPace.state] : color.label.tertiary} drinks={myPace?.drinks ?? 0} you />
          {roster.map((p) => (
            <RosterRow key={p.id} name={p.displayName} state={t(paceWord.steady)} tint={color.pace.steady} drinks={3} />
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('live.whereEveryoneIs')}</Text>
        <View
          style={{
            height: 130,
            borderRadius: radius.control,
            backgroundColor: color.surface.secondary,
            marginTop: space.m,
            alignItems: 'center',
            justifyContent: 'center',
            gap: space.sm,
          }}
        >
          <Icon name="location" size={22} color={sharingLocation ? color.brand.tintLight : color.label.quaternary} />
          <Text variant="footnote" tone="tertiary" center style={{ maxWidth: 250 }}>
            {sharingLocation ? t('live.locationOn') : t('live.locationOff')}
          </Text>
        </View>
        <View style={{ marginTop: space.m }}>
          <Button
            title={sharingLocation ? t('live.stopSharingLocation') : t('live.shareLocation')}
            kind={sharingLocation ? 'plain' : 'glass'}
            compact
            onPress={() => setSharingLocation((s) => !s)}
          />
        </View>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('live.chat')}</Text>
        <View style={{ marginTop: space.m, gap: space.m }}>
          {chat.map((c) => (
            <View key={c.id} style={{ flexDirection: 'row', gap: space.m }}>
              <Avatar name={c.who} size={28} />
              <View style={{ flex: 1 }}>
                <Text variant="caption1" tone="tertiary">{c.who}</Text>
                {c.reaction ? (
                  <Reaction kind={c.reaction} size={22} />
                ) : (
                  <Text variant="subheadline">{c.text}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
          {REACTIONS.map((r: ReactionKind) => (
            <Chip
              key={r}
              label={t(REACTION_LABEL[r])}
              compact
              glyph={<Reaction kind={r} size={18} />}
              onPress={() => setChat((c) => [...c, { id: String(Date.now()), who: t('live.you'), reaction: r }])}
            />
          ))}
        </View>
      </Card>

      <Button title={t('live.partyMode')} kind="plain" icon="sparkles" onPress={() => router.push(`/live/${code}/bingo` as never)} />
    </Screen>
  );
}

function RosterRow({
  name,
  state,
  tint,
  drinks,
  you,
}: {
  name: string;
  state: string;
  tint: string;
  drinks: number;
  you?: boolean;
}) {
  const t = useT();
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}
      accessibilityLabel={t('live.rosterLabel', { name, state, count: drinks })}
    >
      <Avatar name={name} size={34} live />
      <View style={{ flex: 1 }}>
        <Text variant="headline">{you ? t('live.you') : name}</Text>
        <Text variant="caption1" tone="tertiary">{t('live.drinksLogged', { count: drinks })}</Text>
      </View>
      <Text variant="numericSmall" color={tint}>{state}</Text>
    </View>
  );
}
