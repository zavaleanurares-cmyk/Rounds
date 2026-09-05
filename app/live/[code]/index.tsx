import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, Share, Alert, useWindowDimensions, AppState } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Avatar, Icon, Chip, Glass, EmptyState, Button, Reaction, REACTIONS, REACTION_LABEL, type ReactionKind } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { useSessionRealtime } from '@/hooks/useSessionRealtime';
import { LiveMap } from '@/features/live/LiveMap';
import { readSessionLocations, type LivePoint } from '@/services/locationShare';
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
  const { sessions, people, logs, profile, blocked, messages, auth, safety, sendMessage, sendReaction, receiveMessage, receiveReaction, leaveSession, shareLocationFor } = useStore();
  const session = sessions.find((s) => s.joinCode === code);
  const [message, setMessage] = useState('');

  /**
   * The same switch as the one on the safety screen, not a second one.
   *
   * This button used to flip a local boolean: the label changed, the pin turned
   * blue, and no location was ever sent. Two controls for one feature, one of
   * them lying — and the one that lied is the one somebody actually reaches for,
   * because it is in the room with the people they are sharing with.
   *
   * `locationSharingUntil` is the single piece of state; the store's driver
   * starts and stops the two-minute writer from it and expires it on time.
   * Two hours is the default here because that is the length of the part of
   * the night you are in when you open this screen.
   */
  const sharingLocation = (safety.locationSharingUntil ?? 0) > Date.now();

  // The room's chat is store state, not component state: what the sender types
  // has to reach the other people in the night, and what they send has to reach
  // this screen. Both directions go through the store.
  const chat = useMemo(
    () => messages.filter((m) => m.sessionId === session?.id),
    [messages, session?.id]
  );

  // One multiplexed channel, reconnecting on foreground with backoff. The hook
  // captures its handlers once; `receiveMessage` reads through the store's ref,
  // so the captured copy stays correct for the life of the room.
  const realtime = useSessionRealtime(session?.id ?? null, {
    onMessage: receiveMessage,
    onReaction: receiveReaction,
  });

  /**
   * Everybody's points, refreshed while this screen is open.
   *
   * Polled rather than pushed. The writer ticks every two minutes, so realtime
   * would deliver a handful of events an hour down a channel that has to be
   * held open all night — and a room reopened after the phone was in a pocket
   * needs the CURRENT positions, which a subscription does not give you: it
   * gives you what changes next. A poll on the same cadence, plus one on
   * foreground, answers the question the screen is actually asking.
   */
  const { width } = useWindowDimensions();
  const [points, setPoints] = useState<LivePoint[]>([]);
  const sessionId = session?.id ?? null;
  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    const load = async () => {
      const found = await readSessionLocations(sessionId);
      if (alive && found) setPoints(found);
    };
    void load();
    const timer = setInterval(load, 2 * 60_000);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void load();
    });
    return () => {
      alive = false;
      clearInterval(timer);
      sub.remove();
    };
  }, [sessionId]);

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
                sendMessage(session.id, message);
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
          {/*
            Your row carries your pace and your count. Everybody else's carries
            their name and the fact that they are here, and nothing else.

            Not a simplification: `read your own logs` is the only select policy
            on consumption_logs, so another person's pace and drink count are
            not merely unfetched, they are unfetchable. This roster used to
            render every friend as "steady · 3 drinks" — a number no data could
            ever have produced, sitting on the screen where people are looking
            at each other. It also happens to be the rule the product is built
            on: ROUNDS never ranks people on anything countable about alcohol.
          */}
          <RosterRow
            name={profile?.displayName ?? t('live.you')}
            state={myPace ? t(paceWord[myPace.state]) : '—'}
            tint={myPace ? paceColor[myPace.state] : color.label.tertiary}
            drinks={myPace?.drinks ?? 0}
            you
          />
          {roster.map((p) => (
            <RosterRow key={p.id} name={p.displayName} />
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('live.whereEveryoneIs')}</Text>
        {/*
          A real panel, drawn from real rows. It was a grey rectangle with a pin
          icon in it: locations were written every two minutes and read by
          nothing, while `session_locations` sat there with a policy written to
          let exactly these people read them.
        */}
        <LiveMap
          points={points}
          meId={auth.userId}
          width={width - space.md * 4}
          nameFor={(id) =>
            id === auth.userId
              ? profile?.displayName ?? t('live.you')
              : people.find((x) => x.id === id)?.displayName ?? t('live.someone')
          }
          empty={sharingLocation ? t('live.locationOn') : t('live.locationOff')}
        />
        <View style={{ marginTop: space.m }}>
          <Button
            title={sharingLocation ? t('live.stopSharingLocation') : t('live.shareLocation')}
            kind={sharingLocation ? 'plain' : 'glass'}
            compact
            onPress={() => shareLocationFor(sharingLocation ? 0 : 2)}
          />
        </View>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('live.chat')}</Text>
        <View style={{ marginTop: space.m, gap: space.m }}>
          {chat.map((c) => {
            const who = c.userId === auth.userId ? t('live.you') : c.displayName || t('live.someone');
            return (
              <View key={c.id} style={{ flexDirection: 'row', gap: space.m }}>
                <Avatar name={who} size={28} />
                <View style={{ flex: 1 }}>
                  <Text variant="caption1" tone="tertiary">{who}</Text>
                  {c.reaction ? (
                    <Reaction kind={c.reaction} size={22} />
                  ) : (
                    <Text variant="subheadline">{c.text}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
          {REACTIONS.map((r: ReactionKind) => (
            <Chip
              key={r}
              label={t(REACTION_LABEL[r])}
              compact
              glyph={<Reaction kind={r} size={18} />}
              onPress={() => sendReaction(session.id, r)}
            />
          ))}
        </View>
      </Card>

      <Button title={t('live.partyMode')} kind="plain" icon="sparkles" onPress={() => router.push(`/live/${code}/bingo` as never)} />

      {/*
        Leaving is not ending. The night carries on for whoever is still out;
        this account stops being part of it. Only shown to somebody who is not
        the host — the host ending their own night is the End button on the
        session screen, which is a different thing.
      */}
      {session.ownerId !== auth.userId ? (
        <Button
          title={t('live.leaveNight')}
          kind="destructive"
          onPress={() =>
            Alert.alert(t('live.leaveNightTitle'), t('live.leaveNightBody'), [
              { text: t('ui.cancel'), style: 'cancel' },
              {
                text: t('live.leaveNight'),
                style: 'destructive',
                onPress: () => {
                  leaveSession(session.id);
                  router.replace('/(tabs)/tonight');
                },
              },
            ])
          }
        />
      ) : null}
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
  /** Only ever your own — see the note where this is rendered. */
  state?: string;
  tint?: string;
  drinks?: number;
  you?: boolean;
}) {
  const t = useT();
  const mine = you && state !== undefined;
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}
      accessibilityLabel={
        mine
          ? t('live.rosterLabel', { name, state: state!, count: drinks ?? 0 })
          : t('live.rosterHereLabel', { name })
      }
    >
      <Avatar name={name} size={34} live />
      <View style={{ flex: 1 }}>
        <Text variant="headline">{you ? t('live.you') : name}</Text>
        <Text variant="caption1" tone="tertiary">
          {mine ? t('live.drinksLogged', { count: drinks ?? 0 }) : t('live.hereNow')}
        </Text>
      </View>
      {mine ? (
        <Text variant="numericSmall" color={tint}>{state}</Text>
      ) : null}
    </View>
  );
}
