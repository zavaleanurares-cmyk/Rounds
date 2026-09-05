import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Card, Text, Button, Icon, Avatar, Spinner } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { findFriends, makeFindable, stopBeingFindable, type Match } from '@/services/contacts';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * C-05 · Find people from your contacts.
 *
 * Two separate things, deliberately not bundled into one button:
 *
 *  1. FINDING your friends. Reads the address book, hashes every number on the
 *     device, and asks which hashes have accounts. No number is sent.
 *  2. BEING FINDABLE. Registers a hash of your own number so other people's
 *     lookups can return you. Opt-in, and asked for separately — finding your
 *     friends should not require making yourself findable to everybody who has
 *     your number.
 *
 * This screen used to flip a local boolean and list people already in the
 * store. It asked for no permission, read no contacts and matched nothing.
 */
export default function ContactMatch() {
  const router = useRouter();
  const t = useT();
  const { addFriend, settings, updateSettings } = useStore();

  const [state, setState] = useState<'idle' | 'working' | 'done' | 'refused'>('idle');
  const [matches, setMatches] = useState<Match[]>([]);
  const [number, setNumber] = useState('');
  const [findable, setFindable] = useState<'idle' | 'saving' | 'saved'>('idle');

  /**
   * Settings › Privacy has a "Contact matching" switch. It was written to local
   * state and read by nothing: this screen called `findFriends()` regardless,
   * so the address book was read and hashed whether or not somebody had turned
   * the feature off. The switch is now what decides.
   */
  const run = async () => {
    if (!settings.contactMatching) return;
    setState('working');
    const found = await findFriends();
    if (found === null) {
      // Refused is not the same as "nobody matched", and saying "nobody" when
      // somebody declined a permission is how an app looks broken.
      setState('refused');
      return;
    }
    setMatches(found);
    setState('done');
  };

  return (
    <Sheet title={t('social.contactsTitle')} onClose={() => router.back()}>
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Card>
          <View style={{ flexDirection: 'row', gap: space.m }}>
            <Icon name="lock" size={20} color={color.brand.tintLight} />
            <Text variant="subheadline" tone="secondary" style={{ flex: 1 }}>
              {t('social.contactsPrivacy')}
            </Text>
          </View>
        </Card>

        {!settings.contactMatching ? (
          <View style={{ gap: space.m }}>
            <Text variant="subheadline" tone="tertiary">{t('social.contactsDisabled')}</Text>
            <Button
              title={t('social.enableContactMatching')}
              kind="glass"
              compact
              full={false}
              onPress={() => updateSettings({ contactMatching: true })}
            />
          </View>
        ) : state === 'idle' ? (
          <Button title={t('social.matchContacts')} onPress={() => void run()} />
        ) : state === 'working' ? (
          <Spinner />
        ) : state === 'refused' ? (
          <Text variant="subheadline" tone="tertiary">{t('social.contactsRefused')}</Text>
        ) : matches.length === 0 ? (
          <Text variant="subheadline" tone="tertiary">{t('social.contactsNone')}</Text>
        ) : (
          matches.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Avatar name={p.displayName} url={p.avatarUrl} size={38} />
              <View style={{ flex: 1 }}>
                <Text variant="body">{p.displayName}</Text>
                <Text variant="footnote" tone="tertiary">{t('social.handle', { username: p.username })}</Text>
              </View>
              <Button
                title={t('social.add')}
                kind="glass"
                compact
                full={false}
                onPress={() => addFriend(p.id)}
              />
            </View>
          ))
        )}

        {/*
          The other direction, asked for separately. Somebody looking their
          friends up has not agreed to be looked up.
        */}
        <Card>
          <Text variant="sectionHeader" tone="tertiary">{t('social.beFindable')}</Text>
          <Text variant="footnote" tone="quaternary" style={{ marginTop: 2 }}>
            {t('social.beFindableBody')}
          </Text>
          <View style={{ marginTop: space.m, gap: space.m }}>
            <Field
              label={t('social.yourNumber')}
              value={number}
              onChangeText={setNumber}
              placeholder={t('social.numberPlaceholder')}
              keyboardType="phone-pad"
              hint={findable === 'saved' ? t('social.findableSaved') : t('social.numberHint')}
            />
            <Button
              title={findable === 'saving' ? t('ui.saving') : t('social.makeFindable')}
              kind="glass"
              compact
              full={false}
              disabled={number.trim().length < 8 || findable === 'saving'}
              onPress={async () => {
                setFindable('saving');
                const ok = await makeFindable(number);
                setFindable(ok ? 'saved' : 'idle');
              }}
            />
            {/*
              The way back out. `stopBeingFindable` has existed since the
              service was written and was imported by nothing, so this was a
              one-way door: an opt-in with no opt-out is not really an opt-in.
            */}
            {findable === 'saved' ? (
              <Button
                title={t('social.stopBeingFindable')}
                kind="plain"
                compact
                full={false}
                onPress={async () => {
                  await stopBeingFindable();
                  setNumber('');
                  setFindable('idle');
                }}
              />
            ) : null}
          </View>
        </Card>
      </View>
    </Sheet>
  );
}
