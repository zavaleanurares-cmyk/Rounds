import React, { useEffect, useState } from 'react';
import { View, Platform, Pressable } from 'react-native';
import { Card, Text, Button, Icon } from '@/ui';
import { canPromptInstall, promptInstall, isInstalled, isIosSafari, installPwa } from '@/services/pwa';
import { readJson, writeJson } from '@/data/storage';
import { color, space } from '@/design/tokens';

const DISMISSED = 'rounds.install.dismissed';

/**
 * "Put this on your home screen."
 *
 * Only on the web, only once, and only after the person has actually used the
 * app — an install prompt on first paint is the banner everyone dismisses
 * without reading. iOS gets instructions instead, because Safari has no prompt
 * to fire and nobody finds "Add to Home Screen" unprompted.
 */
export function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || isInstalled()) return;
    installPwa();
    let timer: ReturnType<typeof setTimeout> | null = null;
    void readJson<boolean>(DISMISSED, false).then((dismissed) => {
      if (dismissed) return;
      // Give the browser a moment to fire beforeinstallprompt, and the person a
      // moment to see the app they are being asked to install.
      timer = setTimeout(() => setShow(canPromptInstall() || isIosSafari()), 4000);
    });
    return () => { if (timer) clearTimeout(timer); };
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    void writeJson(DISMISSED, true);
  };

  return (
    <Card aurora accent={color.brand.tint}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.m }}>
        <Icon name="arrow.up.right" size={20} color={color.brand.tintLight} />
        <View style={{ flex: 1 }}>
          <Text variant="headline">Put ROUNDS on your home screen</Text>
          <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
            {isIosSafari()
              ? 'Tap the share button, then "Add to Home Screen". It opens full-screen, keeps your data, and works without a signal.'
              : 'It opens full-screen, keeps your data, and works without a signal.'}
          </Text>
          {canPromptInstall() ? (
            <View style={{ marginTop: space.m }}>
              <Button
                title="Install"
                compact
                onPress={async () => {
                  const accepted = await promptInstall();
                  if (accepted) dismiss();
                }}
              />
            </View>
          ) : null}
        </View>
        <Pressable onPress={dismiss} hitSlop={10} accessibilityLabel="Dismiss">
          <Icon name="xmark" size={16} color={color.label.tertiary} />
        </Pressable>
      </View>
    </Card>
  );
}
