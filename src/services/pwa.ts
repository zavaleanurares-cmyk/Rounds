/**
 * The web build, made installable.
 *
 * The most accessible way to try ROUNDS is a link. No store, no account, no
 * TestFlight invitation, no 200MB download — open a URL, tap "Add to Home
 * Screen", and it launches full-screen with its own icon and no browser
 * chrome. On Android that is a real install prompt; on iOS it is two taps in
 * the share sheet, which the app explains rather than assuming people know.
 *
 * A service worker caches the bundle, so the second visit opens offline — which
 * is worth having in an app whose whole point is working without a network.
 */
import { Platform } from 'react-native';

const MANIFEST = {
  name: 'ROUNDS',
  short_name: 'ROUNDS',
  description: 'Know your night. Keeps your pace, keeps your group together, gets you home.',
  start_url: '.',
  scope: '.',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#06070B',
  theme_color: '#06070B',
  categories: ['lifestyle', 'health', 'social'],
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};

let deferredPrompt: any = null;

export function installPwa(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  // The manifest is injected rather than shipped as a file so the same web
  // build works whether it is served from a root, a subpath, or an artifact.
  if (!document.querySelector('link[rel="manifest"]')) {
    const blob = new Blob([JSON.stringify(MANIFEST)], { type: 'application/manifest+json' });
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = URL.createObjectURL(blob);
    document.head.appendChild(link);
  }

  const meta = (name: string, content: string) => {
    if (document.querySelector(`meta[name="${name}"]`)) return;
    const el = document.createElement('meta');
    el.name = name;
    el.content = content;
    document.head.appendChild(el);
  };
  meta('theme-color', '#06070B');
  meta('apple-mobile-web-app-capable', 'yes');
  meta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  meta('apple-mobile-web-app-title', 'ROUNDS');
  meta('mobile-web-app-capable', 'yes');

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export const canPromptInstall = () => deferredPrompt !== null;

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
}

/** True once it is running from the home screen rather than in a browser tab. */
export function isInstalled(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

export function isIosSafari(): boolean {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
}
