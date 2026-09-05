import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Icon } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { capabilities, optional, whyMissing } from '@/services/optional';
import { color, radius, space } from '@/design/tokens';

/**
 * C-05 · Join a night.
 *
 * The critical path: a joiner scanning at a table must be in the room in under
 * twenty seconds. That number drives everything here — the camera opens
 * immediately rather than behind a "Scan" button, a detected code joins without
 * a confirmation step, and if they are not signed in they get Apple/Google only
 * with everything else deferred to the next morning.
 *
 * This is the one place onboarding is allowed to be incomplete.
 */
export default function JoinNight() {
  const router = useRouter();
  const { sessions, auth, setPendingHref } = useStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<'idle' | 'asking' | 'granted' | 'denied'>('idle');
  const handled = useRef(false);

  const Camera = optional(() => require('expo-camera'));
  const canScan = capabilities().camera && Boolean(Camera);

  useEffect(() => {
    if (!canScan) return;
    setPermission('asking');
    Camera.Camera.requestCameraPermissionsAsync()
      .then((r: { granted: boolean }) => setPermission(r.granted ? 'granted' : 'denied'))
      .catch(() => setPermission('denied'));
  }, [canScan, Camera]);

  const join = (raw: string) => {
    if (handled.current) return;
    // Accept a bare code, a rounds:// link or a https://rounds.app/n/ link —
    // whatever the host's screen happens to be showing.
    const clean = (raw.match(/([A-Z0-9]{8})\s*$/i)?.[1] ?? raw).trim().toUpperCase();
    if (clean.length < 4) return;

    const session = sessions.find((s) => s.joinCode === clean);
    if (!session) {
      setError("We don't know that code. Check it against the host's screen.");
      return;
    }
    if (session.endedAt !== null) {
      setError('That night has already ended.');
      return;
    }
    handled.current = true;
    if (auth.status !== 'signed_in') {
      // Store the target and resume after auth — a QR join beats every other
      // redirect, including the morning screen.
      setPendingHref(`/live/${clean}`);
      return router.replace('/(auth)/sign-in');
    }
    router.replace(`/live/${clean}` as never);
  };

  return (
    <Screen
      title="Join a night"
      subtitle="Point the camera at the host's code."
      back
      mood="default"
      footer={<Button title="Join" disabled={code.trim().length < 4} onPress={() => join(code)} />}
    >
      <Card aurora padding={space.m}>
        <View
          style={{
            height: 260,
            borderRadius: radius.card,
            overflow: 'hidden',
            backgroundColor: color.bg.canvas,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {canScan && permission === 'granted' ? (
            <Camera.CameraView
              style={{ position: 'absolute', inset: 0 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }: { data: string }) => join(data)}
            />
          ) : (
            <View style={{ alignItems: 'center', gap: space.m, paddingHorizontal: space.lg }}>
              <Icon name="qrcode.viewfinder" size={40} color={color.brand.tintLight} />
              <Text variant="footnote" tone="tertiary" center style={{ maxWidth: 250 }}>
                {permission === 'denied'
                  ? 'Camera access is off. Type the code below instead — it works just as well.'
                  : canScan
                    ? 'Asking for the camera…'
                    : whyMissing('camera')}
              </Text>
            </View>
          )}

          {/* the reticle */}
          <View
            pointerEvents="none"
            style={{
              width: 168, height: 168, borderRadius: 24,
              borderWidth: 2, borderColor: 'rgba(124,179,255,0.75)',
            }}
          />
        </View>
      </Card>

      <Card>
        <Field
          label="Or type the 8-character code"
          value={code}
          onChangeText={(t) => {
            setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8));
            setError(null);
          }}
          placeholder="ABCD1234"
          autoCapitalize="none"
          error={error ?? undefined}
          hint="The host finds it on their Tonight screen."
        />
      </Card>

      {auth.status !== 'signed_in' ? (
        <Text variant="footnote" tone="quaternary" center>
          You'll sign in once — everything else can wait until tomorrow.
        </Text>
      ) : null}
    </Screen>
  );
}
