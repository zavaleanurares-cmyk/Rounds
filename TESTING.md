# Testing ROUNDS

Four ways in, easiest first. The first one needs nothing but a phone.

---

## 1 · The web build — nothing to install

Open the link on a phone. Every screen works, your data stays on your device,
and nothing is sent anywhere.

On the Tonight screen you'll be offered **Add to home screen** after a few
seconds. Take it: it opens full-screen with its own icon, keeps your data, and
works with no signal — which is worth seeing in an app built around exactly
that.

**What you cannot test here:** the real map, the QR scanner, haptics, and the
lock-screen surfaces. Everything else is the shipping code.

```bash
npm run export:web      # builds into dist/
npx serve -s dist       # then open the LAN address on a phone
```

---

## 2 · Expo Go — a QR code, ten seconds

The fastest way to try it on a real phone with real gestures.

```bash
npm run go              # tunnelled, so it works across networks
```

Install **Expo Go** ([iOS](https://apps.apple.com/app/expo-go/id982107779) ·
[Android](https://play.google.com/store/apps/details?id=host.exp.exponent)),
scan the QR code in the terminal, and you're in.

`npm run go` sets `ROUNDS_GO=1`, which drops the custom native module from the
config — Expo Go cannot load one. What you get:

| Works | Doesn't |
|---|---|
| All 74 screens | Live Activity / Dynamic Island |
| The **real map**, with venues from OpenStreetMap | Widgets |
| The **QR scanner** | Control Center control / Quick Settings tile |
| Location, and every denial path | Siri / App Actions |
| Local notifications, including the safety check-in | Remote push (Android) |
| Haptics, gestures, the lot | Real purchases |

The app says which of these are missing and why, on
**Settings › System surfaces** — nothing fails silently.

Use `npm run go:lan` instead if you and the tester are on the same Wi-Fi; it's
faster and needs no tunnel.

---

## 3 · A build you can install — no developer account

For people who shouldn't have to install Expo Go.

```bash
npx eas build --profile preview --platform android   # an APK, from a link
npx eas build --profile preview --platform ios       # ad-hoc or TestFlight
```

Android gets a `.apk` from a URL, sideloadable in two taps. iOS needs the
device UDID registered, or TestFlight — Apple gives no way around this.

Same limitation as Expo Go on the system surfaces, because `preview` does not
include the development client.

---

## 4 · The full build — everything

The only profile where the Live Activity, the widgets, the Control Center
control and the Siri intents exist.

```bash
npx expo prebuild                # the config plugin adds the native targets
npx expo run:ios                 # or run:android
# or, without Xcode:
npx eas build --profile development --platform ios
```

Then: start a night, lock the phone, and log from the Lock Screen. That
interaction is the product.

---

## Backend

Everything above works with **no backend at all**. That's not a demo mode — it's
the architecture. The network is a background reconciliation, never a
dependency.

To point it at a real Supabase:

```bash
cp .env.example .env             # fill in URL and anon key
npm run db:test                  # applies every migration, runs the RLS matrix
npx supabase db push
npx supabase functions deploy send-outbound store-webhook sync-entitlement
```

Then uncomment the `cron.schedule` lines at the bottom of
`supabase/migrations/00025_push_and_jobs.sql`. The safety escalation runs every
minute; without it, an armed check-in never reaches anyone's trusted contacts.

---

## What to actually try

The app looks completely different at 6pm, 1am and 11am — Tonight is a state
machine, not a screen. In order:

1. **Settings → Demo data → Fill with 14 weeks.** Now every screen has content.
2. **Start a night**, then log four or five drinks. Watch the ring go
   `EASY → STEADY → QUICK → SLOW DOWN`, and watch the ‰ estimate **disappear**
   at slow-down. That's deliberate: at that point the only useful instruction is
   "slow down", and a number invites negotiation.
3. **Log a drink and immediately undo it** from the toast. Nothing waits for a
   network at any point.
4. **End the night**, then open the morning-after screen and **fill the gaps**.
   Every downstream number moves.
5. **Get home safe → Arm a check-in.** On a phone with notifications you'll get
   the reminder locally, with no server involved.
6. **Settings → Every drink.** 165 of them, all drawn, no emoji anywhere.
7. **Turn on airplane mode** and keep logging. The offline pill appears, the
   queue fills, and everything syncs when you come back.

## Running the checks

```bash
npm run check       # typecheck + 78 unit tests + 78 RLS assertions
npm run manifest    # confirms all 74 screens still have routes
```

`npm run db:test` needs a local Postgres and nothing else — no Docker, no
pgtap, no Supabase CLI.
