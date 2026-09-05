import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { Screen, Card, Text, Group, ValueRow, ToggleRow, Icon, Button } from '@/ui';
import { useStore } from '@/data/store';
import { nativeAvailable, platformSurfaces, QuickLog } from '@/native';
import { capabilities, isExpoGo, whyMissing } from '@/services/optional';
import { pushDiagnostics, permissionStatus, requestPermission } from '@/services/push';
import { isRemoteEnabled } from '@/data/remote';
import { isOptedOut, setOptOut, outOfAppShare } from '@/services/analytics';
import { color, space } from '@/design/tokens';

const SURFACES = [
  { id: 'X-01', name: 'Live night HUD', ios: 'Live Activity + Dynamic Island', android: 'Ongoing notification' },
  { id: 'X-02', name: 'One-tap log', ios: 'App Intent button', android: 'Notification action' },
  { id: 'X-03', name: 'Widget · small', ios: 'WidgetKit', android: 'AppWidget 2×2' },
  { id: 'X-04', name: 'Widget · medium', ios: 'WidgetKit, interactive', android: 'AppWidget 4×2' },
  { id: 'X-05', name: 'Widget · large', ios: 'Year heatmap', android: 'AppWidget 4×4' },
  { id: 'X-06', name: 'Quick toggle', ios: 'Control Center control', android: 'Quick Settings tile' },
  { id: 'X-07', name: 'Voice', ios: 'App Intents / Siri', android: 'App Actions' },
  { id: 'X-08', name: 'Watch', ios: 'watchOS app', android: 'Wear OS tile' },
];

/**
 * Where the out-of-app logging actually stands.
 *
 * The share of logs made outside the app is the number that says whether the
 * product is keeping its central promise, so it is shown here rather than left
 * in an analytics dashboard nobody opens.
 */
export default function Surfaces() {
  const { logs, entitled } = useStore();
  const [pending, setPending] = useState(0);
  const [perm, setPerm] = useState<string>('…');
  const [noAnalytics, setNoAnalytics] = useState(isOptedOut());
  const caps = capabilities();

  useEffect(() => {
    void QuickLog.drain().then((rows) => setPending(rows.length));
    void permissionStatus().then(setPerm);
  }, []);

  const live = logs.filter((l) => !l.deleted);
  const outside = live.filter((l) => l.source !== 'app').length;
  const share = Math.round(outOfAppShare(logs) * 100);

  return (
    <Screen title="System surfaces" subtitle="Logging without opening the app." back mood="night">
      <Card aurora accent={share >= 40 ? color.pace.steady : color.brand.tint}>
        <Text variant="sectionHeader" tone="tertiary">LOGGED OUTSIDE THE APP</Text>
        <Text variant="numericLarge" style={{ marginTop: space.xs }}>{share}%</Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
          {outside} of {live.length} logs. The target is 40% — below that, the lock-screen surfaces
          are not carrying their weight and the app is asking for effort at the moment people have
          the least of it.
        </Text>
      </Card>

      {!nativeAvailable ? (
        <Card>
          <View style={{ flexDirection: 'row', gap: space.m }}>
            <Icon name="exclamationmark.triangle" size={20} color={color.warning} />
            <Text variant="subheadline" tone="secondary" style={{ flex: 1 }}>
              These need a development build. Live Activities, WidgetKit, App Intents, Control
              Center controls, foreground services and Quick Settings tiles cannot run in Expo Go or
              a browser — the config plugin in `modules/rounds-native` adds the targets on
              `expo prebuild`.
            </Text>
          </View>
        </Card>
      ) : null}

      <Group title="WHAT THIS BUILD CAN DO">
        <ValueRow title="Map" value={caps.map ? 'real map' : 'projected pins'} />
        <ValueRow title="QR scanner" value={caps.camera ? 'camera' : 'code entry only'} />
        <ValueRow title="Location" value={caps.location ? 'available' : 'unavailable'} />
        <ValueRow title="Notifications" value={caps.notifications ? `local · ${perm}` : 'unavailable'} />
        <ValueRow title="Remote push" value={caps.remotePush ? 'available' : whyMissing('remotePush')} />
        <ValueRow title="Purchases" value={caps.purchases ? 'store connected' : whyMissing('purchases')} />
        <ValueRow title="Backend" value={isRemoteEnabled() ? 'Supabase' : 'on-device only'} last />
      </Group>

      {caps.notifications && perm !== 'granted' ? (
        <Button
          title="Turn on notifications"
          kind="glass"
          icon="bell"
          onPress={() => void requestPermission().then(setPerm)}
        />
      ) : null}

      <Group title="ON THIS PLATFORM">
        <ValueRow title="HUD" value={String(platformSurfaces.hud)} />
        <ValueRow title="Widgets" value={String(platformSurfaces.widget)} />
        <ValueRow title="Quick toggle" value={String(platformSurfaces.tile)} />
        <ValueRow title="Voice" value={String(platformSurfaces.voice)} />
        <ValueRow title="Native module" value={nativeAvailable ? 'attached' : 'not in this build'} last />
      </Group>

      <Group title="THE EIGHT">
        {SURFACES.map((s, i) => (
          <ValueRow
            key={s.id}
            title={`${s.id} · ${s.name}`}
            value={Platform.OS === 'android' ? s.android : s.ios}
            last={i === SURFACES.length - 1}
          />
        ))}
      </Group>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">THE RULE</Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.sm }}>
          Every one of these writes through the same offline queue as the log sheet, with a UUID the
          surface mints itself. There is never a second write path — which is why a watch that syncs
          an hour late cannot turn one drink into two.
        </Text>
        {pending > 0 ? (
          <Text variant="footnote" color={color.warning} style={{ marginTop: space.m }}>
            {pending} logs waiting in the shared container.
          </Text>
        ) : null}
      </Card>

      <Group title="DIAGNOSTICS">
        <ValueRow title="Build" value={isExpoGo() ? 'Expo Go' : nativeAvailable ? 'development' : 'web'} />
        <ValueRow title="Entitlement (server)" value={entitled ? 'ROUNDS+' : 'free'} />
        <ToggleRow
          title="Send diagnostics"
          subtitle="Counts and categories only — never a drink, a venue or a person"
          value={!noAnalytics}
          onValueChange={(v) => { setNoAnalytics(!v); void setOptOut(!v); }}
          last
        />
      </Group>

      {pushDiagnostics().note ? (
        <Text variant="footnote" tone="quaternary" center>{pushDiagnostics().note}</Text>
      ) : null}
    </Screen>
  );
}
