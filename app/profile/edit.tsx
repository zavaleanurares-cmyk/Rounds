import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Avatar, AVATAR_TINTS, Icon, DrinkGlyph, useToast } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { CATALOG } from '@/domain/catalog';
import * as remote from '@/data/remote';
import { feedback } from '@/services/feedback';
import { useT } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

const MAX_BIO = 140;
const HANDLE = /^[a-z0-9_]{3,20}$/;

type HandleState = { checking: boolean; available: boolean | null; reason: string | null };

/**
 * Y-02 · Edit profile.
 *
 * Everything on this screen is optional and everything is reversible. The one
 * field with rules is the handle, because it is the only thing here another
 * person types to find you.
 *
 * What is deliberately NOT on this screen: age, weight, sex and anything else
 * the pace model needs. Those live in Settings, behind their own screens, and
 * they are never presented as part of "how you look to other people" — mixing
 * body data into a profile editor is how an app teaches people that the two are
 * the same thing.
 */
export default function EditProfile() {
  const router = useRouter();
  const t = useT();
  const toast = useToast();
  const { profile, updateProfile } = useStore();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [homeCity, setHomeCity] = useState(profile?.homeCity ?? '');
  const [tint, setTint] = useState<number | null>(profile?.avatarTint ?? null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatarUrl ?? null);
  const [drinkId, setDrinkId] = useState<string | null>(profile?.signatureDrinkId ?? null);
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [handle, setHandle] = useState<HandleState>({ checking: false, available: null, reason: null });

  const normalised = username.trim().toLowerCase();
  const unchangedHandle = normalised === (profile?.username ?? '');
  const shapeOk = HANDLE.test(normalised);

  /**
   * Handle availability, debounced. The check is advisory: the unique index on
   * `profiles.username` is what actually decides, and it decides at write time.
   * A screen that treated this answer as final would happily let two people
   * through who typed the same name four hundred milliseconds apart.
   */
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (unchangedHandle || !shapeOk) {
      setHandle({ checking: false, available: null, reason: shapeOk || !normalised ? null : t('profile.handleRule') });
      return;
    }
    setHandle({ checking: true, available: null, reason: null });
    timer.current = setTimeout(async () => {
      const ok = await remote.usernameAvailable(normalised);
      setHandle({
        checking: false,
        available: ok,
        reason: ok === false ? t('profile.handleTaken') : null,
      });
    }, 450);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [normalised, shapeOk, unchangedHandle, t]);

  const pickPhoto = async () => {
    setPicking(true);
    try {
      const picker = require('expo-image-picker') as typeof import('expo-image-picker');
      const perm = await picker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        toast.show({ message: t('profile.photoPermission') });
        return;
      }
      const result = await picker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        // Small on purpose. This is displayed at 96pt at the very largest, and
        // a 4MB photo of someone's face is 4MB of someone's face to store.
        quality: 0.7,
      });
      if (result.canceled || !result.assets?.[0]) return;
      setAvatarUrl(result.assets[0].uri);
      feedback('tap');
    } catch {
      toast.show({ message: t('profile.photoFailed') });
    } finally {
      setPicking(false);
    }
  };

  const canSave =
    displayName.trim().length >= 1 &&
    shapeOk &&
    bio.length <= MAX_BIO &&
    handle.available !== false &&
    !handle.checking;

  const save = async () => {
    if (!canSave || !profile) return;
    setSaving(true);
    try {
      // A local file URI is useless on another device, so it is uploaded first
      // and only the returned URL is stored. If there is no backend, the local
      // URI is kept — it still works on this phone, which is better than
      // dropping the picture the user just chose.
      let url = avatarUrl;
      if (avatarUrl && avatarUrl !== profile.avatarUrl && !/^https?:/.test(avatarUrl)) {
        url = (await remote.uploadAvatar(profile.id, avatarUrl)) ?? avatarUrl;
      }
      updateProfile({
        displayName: displayName.trim(),
        username: normalised,
        bio: bio.trim() ? bio.trim() : null,
        homeCity: homeCity.trim() ? homeCity.trim() : null,
        avatarTint: tint,
        avatarUrl: url,
        signatureDrinkId: drinkId,
      });
      feedback('tap');
      router.back();
      setTimeout(() => toast.show({ message: t('profile.updated') }), 120);
    } finally {
      setSaving(false);
    }
  };

  const signature = useMemo(() => CATALOG.find((d) => d.id === drinkId) ?? null, [drinkId]);
  const preview = displayName.trim() || t('profile.you');

  return (
    <Screen
      title={t('profile.title')}
      back
      mood="calm"
      footer={<Button title={saving ? t('ui.saving') : t('ui.save')} onPress={save} disabled={!canSave || saving} />}
    >
      <Card>
        <View style={{ alignItems: 'center', gap: space.m }}>
          <Pressable
            onPress={pickPhoto}
            accessibilityRole="button"
            accessibilityLabel={avatarUrl ? t('profile.changePhotoLabel') : t('profile.addPhoto')}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Avatar name={preview} url={avatarUrl} tint={tint} size={96} />
            <View
              style={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: color.surface.primary,
                borderWidth: 1,
                borderColor: color.separator,
              }}
            >
              <Icon name={picking ? 'clock' : 'photo'} size={15} color={color.label.secondary} />
            </View>
          </Pressable>

          <View style={{ flexDirection: 'row', gap: space.m }}>
            <Pressable onPress={pickPhoto} accessibilityRole="button" accessibilityLabel={t('profile.choosePhoto')}>
              <Text variant="footnote" color={color.brand.tintLight}>
                {avatarUrl ? t('profile.changePhoto') : t('profile.addPhoto')}
              </Text>
            </Pressable>
            {avatarUrl ? (
              <Pressable onPress={() => setAvatarUrl(null)} accessibilityRole="button" accessibilityLabel={t('profile.removePhotoLabel')}>
                <Text variant="footnote" tone="tertiary">{t('profile.remove')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('profile.colourHeader')}</Text>
        <Text variant="footnote" tone="quaternary" style={{ marginTop: 2 }}>
          {t('profile.colourNote')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.m }}>
          <View style={{ flexDirection: 'row', gap: space.sm, paddingRight: space.md }}>
            <Pressable
              onPress={() => setTint(null)}
              accessibilityRole="button"
              accessibilityLabel={t('profile.automaticColour')}
              accessibilityState={{ selected: tint === null }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: color.surface.secondary,
                borderWidth: tint === null ? 2 : 1,
                borderColor: tint === null ? '#fff' : color.separator,
              }}
            >
              <Icon name="sparkles" size={15} color={color.label.secondary} />
            </Pressable>
            {AVATAR_TINTS.map((c, i) => (
              <Pressable
                key={c}
                onPress={() => {
                  setTint(i);
                  feedback('tap');
                }}
                accessibilityRole="button"
                accessibilityLabel={t('profile.colourNumbered', { index: i + 1 })}
                accessibilityState={{ selected: tint === i }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: c,
                  borderWidth: tint === i ? 2 : 0,
                  borderColor: '#fff',
                  opacity: tint === i ? 1 : 0.75,
                }}
              />
            ))}
          </View>
        </ScrollView>
      </Card>

      <Card>
        <View style={{ gap: space.md }}>
          <Field
            label={t('profile.nameLabel')}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t('profile.namePlaceholder')}
            autoCapitalize="words"
          />
          <Field
            label={t('profile.handleLabel')}
            value={username}
            onChangeText={(next) => setUsername(next.replace(/[^A-Za-z0-9_]/g, '').toLowerCase())}
            placeholder={t('profile.handlePlaceholder')}
            autoCapitalize="none"
            hint={
              handle.checking
                ? t('profile.handleChecking')
                : handle.available === true
                  ? t('profile.handleAvailable')
                  : unchangedHandle
                    ? t('profile.handleCurrent')
                    : t('profile.handleHint')
            }
            error={handle.reason ?? undefined}
          />
          <Field
            label={t('profile.aboutLabel', { used: bio.length, max: MAX_BIO })}
            value={bio}
            onChangeText={(next) => setBio(next.slice(0, MAX_BIO))}
            placeholder={t('profile.aboutPlaceholder')}
            multiline
            autoCapitalize="sentences"
          />
          <Field
            label={t('profile.cityLabel')}
            value={homeCity}
            onChangeText={setHomeCity}
            placeholder={t('profile.cityPlaceholder')}
            autoCapitalize="words"
            hint={t('profile.cityHint')}
          />
        </View>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('profile.drinkHeader')}</Text>
        <Text variant="footnote" tone="quaternary" style={{ marginTop: 2 }}>
          {t('profile.drinkNote')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.m }}>
          <View style={{ flexDirection: 'row', gap: space.sm, paddingRight: space.md }}>
            <Pressable
              onPress={() => setDrinkId(null)}
              accessibilityRole="button"
              accessibilityLabel={t('profile.noDrink')}
              accessibilityState={{ selected: drinkId === null }}
              style={{
                width: 60,
                height: 60,
                borderRadius: radius.control,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: color.surface.secondary,
                borderWidth: drinkId === null ? 2 : 1,
                borderColor: drinkId === null ? color.brand.tintLight : color.separator,
              }}
            >
              <Icon name="xmark" size={16} color={color.label.tertiary} />
            </Pressable>
            {CATALOG.filter((d) => d.ethanolG > 0)
              .slice(0, 24)
              .map((d) => (
                <Pressable
                  key={d.id}
                  onPress={() => {
                    setDrinkId(d.id);
                    feedback('tap');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={d.name}
                  accessibilityState={{ selected: drinkId === d.id }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: radius.control,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: color.surface.secondary,
                    borderWidth: drinkId === d.id ? 2 : 1,
                    borderColor: drinkId === d.id ? color.brand.tintLight : color.separator,
                  }}
                >
                  <DrinkGlyph drink={d} size={34} />
                </Pressable>
              ))}
          </View>
        </ScrollView>
        {signature ? (
          <Text variant="footnote" tone="secondary" style={{ marginTop: space.m }}>
            {signature.name}
          </Text>
        ) : null}
      </Card>

      <Text variant="footnote" tone="quaternary" center>
        {t('profile.visibilityNote')}
      </Text>
    </Screen>
  );
}
