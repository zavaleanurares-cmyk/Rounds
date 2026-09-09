import React, { useMemo, useState } from 'react';
import { View, Pressable, TextInput, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sheet, Text, Button, Icon, useToast, InlineLink } from '@/ui';
import { useStore } from '@/data/store';
import { optional } from '@/services/optional';
import { venueKind } from '@/domain/venueKind';
import { nightKey } from '@/domain/nightKey';
import { useT, useFormat } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

/** The bio limit, reused: a stamp is a caption, not a diary entry. */
const NOTE_MAX = 140;

/**
 * P-01 · One stamp, and the two things you can put on it.
 *
 * The photo never leaves the phone. It is a local file URI in AsyncStorage,
 * absent from `pull`, from `push` and from the outbound queue, and that is a
 * deliberate stopping point rather than a first version. A picture taken
 * inside a bar identifies the person, the place, the night and everybody else
 * in the frame; uploading one would need a bucket, a retention rule, a
 * moderation path and consent from people who never installed this app, and
 * the privacy policy currently promises that nothing about your drinking
 * leaves the device unless you share it. Keeping it local is how that sentence
 * stays true.
 *
 * The screen says so out loud, because a photo feature that silently uploads
 * is the thing people are afraid of, and one that silently does not is a
 * feature they will not trust either way unless told.
 */
export default function StampDetail() {
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const toast = useToast();
  const { logs, venues, stamps, setStamp } = useStore();

  const venue = venues.find((v) => v.id === venueId);
  const existing = venueId ? stamps[venueId] : undefined;
  const [note, setNote] = useState(existing?.note ?? '');
  const [photo, setPhoto] = useState<string | null>(existing?.photoUri ?? null);
  const [busy, setBusy] = useState(false);

  const visits = useMemo(() => {
    const mine = logs.filter((l) => !l.deleted && l.venueId === venueId);
    const nights = new Set(mine.map((l) => l.nightKey));
    const times = mine.map((l) => l.at).sort((a, b) => a - b);
    return {
      nights: nights.size,
      first: times[0] ?? null,
      last: times[times.length - 1] ?? null,
      /** Tonight counts as tonight, not as "today", so a 2am visit reads right. */
      tonight: times.some((at) => nightKey(at) === nightKey(Date.now())),
    };
  }, [logs, venueId]);

  const kind = venueKind(venue?.category);
  const tint = color.venue[kind];

  /**
   * `expo-image-picker` through `optional`, like every other native module
   * here: on a browser it is simply absent, and the button says so instead of
   * throwing. Library only — no camera launch — because this is a souvenir
   * being attached after the fact, usually the next morning.
   */
  const pick = async () => {
    const Picker = optional(() => require('expo-image-picker'));
    if (!Picker) {
      toast.show({ message: t('stats.stampPhotoUnavailable') });
      return;
    }
    setBusy(true);
    try {
      const perm = await Picker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        toast.show({ message: t('stats.stampPhotoDenied') });
        return;
      }
      const result = await Picker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]?.uri) setPhoto(result.assets[0].uri);
    } catch (err) {
      if (__DEV__) console.warn('[stamp] photo pick failed', err);
      toast.show({ message: t('common.authDidNotGoThrough') });
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!venueId) return;
    setStamp(venueId, { photoUri: photo, note: note.trim() || null });
    router.back();
  };

  return (
    <Sheet
      title={venue?.name ?? t('stats.somewhere')}
      subtitle={t('stats.stampVisits', { count: visits.nights })}
      footer={<Button title={t('ui.save')} onPress={save} />}
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        {/* The stamp itself, full size. Tapping it is the same as the button
            under it — a picture is the obvious thing to tap, and a person who
            has just seen this tile in a grid will reach for it first. */}
        <Pressable
          onPress={() => void pick()}
          accessibilityRole="button"
          accessibilityLabel={t('stats.stampAddPhoto')}
          style={{
            height: 190,
            borderRadius: radius.card,
            overflow: 'hidden',
            borderWidth: 1.5,
            borderColor: `${tint}88`,
          }}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} accessibilityIgnoresInvertColors />
          ) : (
            <LinearGradient
              colors={[`${tint}55`, 'rgba(10,12,20,0.8)']}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm }}
            >
              <Icon name="photo" size={26} color="#fff" />
              <Text variant="footnote" tone="secondary">{t('stats.stampAddPhoto')}</Text>
            </LinearGradient>
          )}
        </Pressable>

        {photo ? (
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <InlineLink title={t('stats.stampChangePhoto')} onPress={() => void pick()} />
            <InlineLink title={t('stats.stampRemovePhoto')} onPress={() => setPhoto(null)} />
          </View>
        ) : null}

        <View>
          <Text variant="sectionHeader" tone="tertiary">{t('stats.stampNoteLabel')}</Text>
          <TextInput
            value={note}
            onChangeText={(v) => setNote(v.slice(0, NOTE_MAX))}
            placeholder={t('stats.stampNotePlaceholder')}
            placeholderTextColor={color.label.quaternary}
            multiline
            accessibilityLabel={t('stats.stampNoteLabel')}
            style={{
              marginTop: space.sm,
              minHeight: 64,
              borderRadius: radius.control,
              backgroundColor: color.surface.secondary,
              borderWidth: 1,
              borderColor: color.separator,
              padding: space.md,
              color: color.label.primary,
              fontSize: 16,
              textAlignVertical: 'top',
            }}
          />
          <Text variant="caption2" tone="quaternary" style={{ marginTop: 4, textAlign: 'right' }}>
            {`${note.length}/${NOTE_MAX}`}
          </Text>
        </View>

        <View style={{ gap: space.xs }}>
          {visits.first ? (
            <Row label={t('stats.stampFirst')} value={f.dayLong(visits.first)} />
          ) : null}
          {visits.last && visits.last !== visits.first ? (
            <Row label={t('stats.stampLast')} value={visits.tonight ? t('stats.stampTonight') : f.dayLong(visits.last)} />
          ) : null}
          {venue?.area ? <Row label={t('stats.stampArea')} value={venue.area} /> : null}
        </View>

        <Text variant="caption1" tone="quaternary">{t('stats.stampPrivacy')}</Text>

        {busy ? <Text variant="footnote" tone="tertiary">{t('ui.loading')}</Text> : null}
      </View>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
      <Text variant="footnote" tone="tertiary">{label}</Text>
      <Text variant="footnote" tone="secondary">{value}</Text>
    </View>
  );
}
