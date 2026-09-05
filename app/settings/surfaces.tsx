import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { Screen, Card, Text, Group, ValueRow, ToggleRow, Icon, Button } from '@/ui';
import { useStore } from '@/data/store';
import { nativeAvailable, platformSurfaces, QuickLog } from '@/native';
import { capabilities, isExpoGo, whyMissing } from '@/services/optional';
import { pushDiagnostics, permissionStatus, requestPermission } from '@/services/push';
import { isRemoteEnabled } from '@/data/remote';
import { isOptedOut, setOptOut, outOfAppShare } from '@/services/analytics';
import { useT, useI18n, type MessageKey } from '@/i18n';
import { color, space } from '@/design/tokens';
import { BILLING_VISIBLE } from '@/config/flags';

const SURFACES = [
  { id: 'X-01', name: 'settings.surfaceHudName', ios: 'settings.surfaceHudIos', android: 'settings.surfaceHudAndroid' },
  { id: 'X-02', name: 'settings.surfaceQuickLogName', ios: 'settings.surfaceQuickLogIos', android: 'settings.surfaceQuickLogAndroid' },
  { id: 'X-03', name: 'settings.surfaceWidgetSmallName', ios: 'settings.surfaceWidgetSmallIos', android: 'settings.surfaceWidgetSmallAndroid' },
  { id: 'X-04', name: 'settings.surfaceWidgetMediumName', ios: 'settings.surfaceWidgetMediumIos', android: 'settings.surfaceWidgetMediumAndroid' },
  { id: 'X-05', name: 'settings.surfaceWidgetLargeName', ios: 'settings.surfaceWidgetLargeIos', android: 'settings.surfaceWidgetLargeAndroid' },
  { id: 'X-06', name: 'settings.surfaceTileName', ios: 'settings.surfaceTileIos', android: 'settings.surfaceTileAndroid' },
  { id: 'X-07', name: 'settings.surfaceVoiceName', ios: 'settings.surfaceVoiceIos', android: 'settings.surfaceVoiceAndroid' },
  { id: 'X-08', name: 'settings.surfaceWatchName', ios: 'settings.surfaceWatchIos', android: 'settings.surfaceWatchAndroid' },
] as const satisfies ReadonlyArray<{ id: string; name: MessageKey; ios: MessageKey; android: MessageKey }>;

/**
 * Where the out-of-app logging actually stands.
 *
 * The share of logs made outside the app is the number that says whether the
 * product is keeping its central promise, so it is shown here rather than left
 * in an analytics dashboard nobody opens.
 */
export default function Surfaces() {
  const t = useT();
  const { locale } = useI18n();
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
    <Screen title={t('settings.systemSurfaces')} subtitle={t('settings.surfacesSubtitle')} back mood="night">
      <Card aurora accent={share >= 40 ? color.pace.steady : color.brand.tint}>
        <Text variant="sectionHeader" tone="tertiary">{t('settings.loggedOutsideHeader')}</Text>
        <Text variant="numericLarge" style={{ marginTop: space.xs }}>
          {t('settings.percent', { value: share })}
        </Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
          {t('settings.outsideShare', { outside, count: live.length })}
        </Text>
      </Card>

      {!nativeAvailable ? (
        <Card>
          <View style={{ flexDirection: 'row', gap: space.m }}>
            <Icon name="exclamationmark.triangle" size={20} color={color.warning} />
            <Text variant="subheadline" tone="secondary" style={{ flex: 1 }}>
              {t('settings.devBuildNote')}
            </Text>
          </View>
        </Card>
      ) : null}

      <Group title={t('settings.buildCanDoHeader')}>
        <ValueRow title={t('settings.capMap')} value={caps.map ? t('settings.capMapReal') : t('settings.capMapProjected')} />
        <ValueRow title={t('settings.capScanner')} value={caps.camera ? t('settings.capScannerCamera') : t('settings.capScannerCodeOnly')} />
        <ValueRow title={t('settings.capLocation')} value={caps.location ? t('settings.capAvailable') : t('settings.capUnavailable')} />
        <ValueRow title={t('settings.notifications')} value={caps.notifications ? t('settings.capNotificationsLocal', { status: perm }) : t('settings.capUnavailable')} />
        <ValueRow title={t('settings.capRemotePush')} value={caps.remotePush ? t('settings.capAvailable') : whyMissing('remotePush', locale)} />
        <ValueRow title={t('settings.capPurchases')} value={caps.purchases ? t('settings.capPurchasesConnected') : whyMissing('purchases', locale)} />
        <ValueRow title={t('settings.capBackend')} value={isRemoteEnabled() ? 'Supabase' : t('settings.capBackendOnDevice')} last />
      </Group>

      {caps.notifications && perm !== 'granted' ? (
        <Button
          title={t('settings.turnOnNotifications')}
          kind="glass"
          icon="bell"
          onPress={() => void requestPermission(locale).then(setPerm)}
        />
      ) : null}

      <Group title={t('settings.onThisPlatformHeader')}>
        <ValueRow title={t('settings.platformHud')} value={String(platformSurfaces.hud)} />
        <ValueRow title={t('settings.platformWidgets')} value={String(platformSurfaces.widget)} />
        <ValueRow title={t('settings.platformQuickToggle')} value={String(platformSurfaces.tile)} />
        <ValueRow title={t('settings.platformVoice')} value={String(platformSurfaces.voice)} />
        <ValueRow title={t('settings.platformNativeModule')} value={nativeAvailable ? t('settings.platformAttached') : t('settings.platformNotInBuild')} last />
      </Group>

      <Group title={t('settings.theEightHeader')}>
        {SURFACES.map((s, i) => (
          <ValueRow
            key={s.id}
            title={t('settings.surfaceRow', { id: s.id, name: t(s.name) })}
            value={Platform.OS === 'android' ? t(s.android) : t(s.ios)}
            last={i === SURFACES.length - 1}
          />
        ))}
      </Group>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('settings.theRuleHeader')}</Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.sm }}>
          {t('settings.theRuleBody')}
        </Text>
        {pending > 0 ? (
          <Text variant="footnote" color={color.warning} style={{ marginTop: space.m }}>
            {t('settings.sharedContainerPending', { count: pending })}
          </Text>
        ) : null}
      </Card>

      <Group title={t('settings.diagnosticsHeader')}>
        <ValueRow title={t('settings.diagBuild')} value={isExpoGo() ? 'Expo Go' : nativeAvailable ? t('settings.diagBuildDevelopment') : t('settings.diagBuildWeb')} />
        {BILLING_VISIBLE ? (
          <ValueRow title={t('settings.diagEntitlement')} value={entitled ? t('settings.diagEntitlementPaid') : t('settings.diagEntitlementFree')} />
        ) : null}
        <ToggleRow
          title={t('settings.sendDiagnostics')}
          subtitle={t('settings.sendDiagnosticsSubtitle')}
          value={!noAnalytics}
          onValueChange={(v) => { setNoAnalytics(!v); void setOptOut(!v); }}
          last
        />
      </Group>

      {pushDiagnostics(locale).note ? (
        <Text variant="footnote" tone="quaternary" center>{pushDiagnostics(locale).note}</Text>
      ) : null}
    </Screen>
  );
}
