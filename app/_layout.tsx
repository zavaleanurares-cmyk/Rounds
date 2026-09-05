import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StoreProvider, useStore } from '@/data/store';
import { ToastProvider } from '@/ui';
import { useOnlineWatcher } from '@/hooks/useOnline';
import { attachRemote } from '@/data/remote';
import { useSystemSurfaces } from '@/hooks/useSystemSurfaces';
import { installPwa } from '@/services/pwa';
import { useNightState } from '@/hooks/useNightState';
import { color } from '@/design/tokens';

void SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * AuthGate — runs on every cold start and auth state change, and must resolve
 * before the splash dismisses.
 *
 *   session == null ............................ → (auth)/welcome
 *   underage ................................... → (onboarding)/blocked   [terminal]
 *   dob == null ................................ → (onboarding)/age
 *   !onboarded ................................. → first incomplete step
 *   pendingHref (usually a QR join) ............ → that href    [deep-link priority]
 *   morningDue ................................. → morning/[sessionId]
 *   otherwise .................................. → (tabs)/tonight
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { hydrated, auth, profile, setPendingHref } = useStore();
  // Barlow Condensed SemiBold is the ONLY face used for Numeric/* — the pace
  // word, the big money figures. Everything else is the system face.
  const [fontsLoaded] = useFonts({
    'BarlowCondensed-SemiBold': require('../assets/fonts/BarlowCondensed-SemiBold.ttf'),
  });
  const night = useNightState();
  const segments = useSegments();
  const router = useRouter();

  const ready = hydrated && fontsLoaded;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const group = segments[0] as string | undefined;
    const inAuth = group === '(auth)';
    const inOnboarding = group === '(onboarding)';

    if (auth.status !== 'signed_in') {
      if (!inAuth) router.replace('/(auth)/welcome');
      return;
    }
    if (auth.underageBlocked) {
      if (segments.join('/') !== '(onboarding)/blocked') router.replace('/(onboarding)/blocked');
      return;
    }
    if (!profile?.dob) {
      if (!inOnboarding) router.replace('/(onboarding)/age');
      return;
    }
    if (!profile.onboarded) {
      if (!inOnboarding) router.replace('/(onboarding)/identity');
      return;
    }
    // A QR join beats everything, including the morning screen: a joiner
    // standing at a table must be in the room in under 20 seconds.
    if (auth.pendingHref) {
      const href = auth.pendingHref;
      setPendingHref(null);
      router.replace(href as never);
      return;
    }
    if (inAuth || inOnboarding) {
      router.replace(night.morningDue && night.morningSessionId
        ? (`/morning/${night.morningSessionId}` as never)
        : '/(tabs)/tonight');
    }
  }, [ready, auth.status, auth.underageBlocked, auth.pendingHref, profile?.dob, profile?.onboarded, segments, night.morningDue, night.morningSessionId, router]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: color.bg.canvas }} />;
  return <>{children}</>;
}

function Routes() {
  useOnlineWatcher();
  // Live Activity, widgets, tile, shortcuts and watch — and the drain that
  // brings one-tap logs back in. No-ops where the native module is absent.
  useSystemSurfaces();
  // Makes the web build installable to a home screen. No-op on native.
  useEffect(() => { installPwa(); }, []);
  // No-op without EXPO_PUBLIC_SUPABASE_URL. The app is fully usable either way —
  // the network is reconciliation, never a dependency.
  useEffect(() => { attachRemote(); }, []);
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.bg.canvas },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      {/* bottom sheets — transient, one task, swipe to dismiss */}
      <Stack.Screen name="log/index" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="log/custom" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="log/round" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="log/edit/[logId]" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="session/start" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="session/[id]/end" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="venue/search" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="plan/new" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="crew/new" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="wellbeing/goal/[type]" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      {/* full-screen modals — take over, demand a decision */}
      <Stack.Screen name="morning/[sessionId]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="safety/index" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="paywall" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="live/join" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="report/[targetType]/[targetId]" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="wrapped/[year]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.bg.canvas }}>
      <SafeAreaProvider>
        <StoreProvider>
          <ToastProvider>
            <AuthGate>
              <Routes />
            </AuthGate>
          </ToastProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
