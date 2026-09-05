# Store submission

Everything App Store Connect and Play Console will ask for, with the answers
this build actually justifies. Where an answer is a judgement call, the reason
is next to it — those are the ones that get argued about in review.

## The rating, and the review note

**17+ / Mature 17+.** Frequent alcohol references. Do not attempt a lower
rating; the category is unambiguous and a wrong answer here is a rejection plus
a delay.

Include this in the App Review notes verbatim. Alcohol apps get read carefully,
and every sentence below answers a question a reviewer would otherwise have to
ask:

> ROUNDS is a nightlife companion for adults of legal drinking age. It helps
> people track their own drinking, stay with their group and get home safely.
>
> · **Age gate.** Date of birth is verified at sign-up and the result is stored
>   server-side, so reinstalling does not reset it. 18 in EU/UK/RO, 21 in the US.
> · **The blood-alcohol figure is OFF by default and opt-in** (Settings ›
>   Units & region). When a user turns it on it is secondary to a
>   plain-language pace word, always carries the disclaimer "Pacing estimate.
>   Never use this to decide whether to drive.", never appears near a transport
>   option, never appears on a shareable card or any social surface, and is
>   suppressed entirely when the app is telling the user to slow down. It is
>   computed on-device and never transmitted or stored.
> · **Block, report and account deletion** are all present. Block is at
>   Person profile › ⋯ › Block. Report is at the same menu, and at
>   Settings › Help. Delete account is at Settings › Data & account, with a
>   type-to-confirm and an immediate sign-out.
> · **There is no feed and no user-generated content stream.** Chat exists only
>   inside a night you were invited to. There is no leaderboard on anything
>   countable about alcohol, and no streak that rewards drinking.
>   Because it is off by default, a reviewer on a fresh install will not see a
>   number at all — the pace word is the whole readout.
> · **Safety features are free.** This build offers nothing for sale: there is
>   no subscription, no in-app purchase and no price anywhere in the app.
> · Demo account: **demo@rounds.app**, code **123456**. Settings › Demo data
>   fills the app with history so every screen has content.

## App Privacy answers

These must match `ios-config/PrivacyInfo.xcprivacy` and the Privacy Policy.
Three sources of truth that disagree is the most common avoidable rejection.

| Question | Answer | Why |
|---|---|---|
| Data used to track you | **None** | No advertising, no cross-app tracking, no ATT prompt needed |
| Contact info · email | Linked, App Functionality | Sign-in |
| Identifiers · user ID | Linked, App Functionality | The account |
| User content · other | Linked, App Functionality | What you logged |
| Location · coarse | **Not linked**, App Functionality | Venue search; live sharing is opt-in per night and auto-expires |
| Diagnostics · crash data | Not linked, App Functionality | Crash reporting |
| Health & Fitness | **Not collected** | Body basics never leave the device |
| Sensitive info | **Not collected** | The BAC estimate is computed on-device and never transmitted |

The Health & Fitness answer is the one to be able to defend: sex and weight are
entered by the user, stored in `profiles_private` behind an owner-only RLS
policy, and used only by an on-device function. Nothing derived from them is
uploaded.

## Play Console

- **Data safety form**: the same answers as above.
- **Health apps declaration**: ROUNDS is not a medical app and makes no medical
  claim. It does not diagnose, treat or monitor a condition.
- **Foreground service**: declared as `specialUse` with the subtype string
  *"Shows your current night and lets you log without opening the app."* Play
  requires a justification and a demo video for `specialUse` — record the
  ongoing notification with its two action buttons.
- **Permissions declined on purpose**: `ACCESS_BACKGROUND_LOCATION` is in
  `blockedPermissions`. Asking for it would require a separate review and the
  app does not need it — live sharing is foreground and per-night.
- **Target audience**: 18+. Do not opt into Families.

## Listing

**Name** ROUNDS
**Subtitle** Know your night
**Promo text** Open it before you go out, check it the next morning.

**Description**

> ROUNDS is the app you open before you go out and check the next morning. It
> keeps your pace, keeps your group together, and gets you home.
>
> **Before** — Plan a night, invite your crew, vote on where. A reason to open
> the app on a Tuesday.
>
> **During** — One tap to log a drink, from the Lock Screen, a widget, Control
> Center or Siri, without unlocking. A pace ring that tells you in a word
> whether you're going faster than you usually do. Everyone in your night on one
> screen. Get home safe, one tap from anywhere.
>
> **After** — Where you went, what it cost, how it went, and a chance to fill in
> what you forgot. Because a tracker that can't be corrected the next day is a
> tracker whose numbers are wrong.
>
> ROUNDS shows a pace estimate, not a breathalyser reading. It can be wrong.
> Never use it to decide whether to drive.
>
> Safety features are free forever.

**Keywords** nightlife, drinks, night out, plans, friends, pace, spend, get home, bar, crew

## Screenshots

Six, in this order. The first two are what people decide on.

1. **Tonight · Live** — the pace ring with a night running, and the water nudge
2. **Log sheet** — "Same again" plus the drawn drinks
3. **Morning after** — fill the gaps
4. **Get home safe** — the armed check-in
5. **You** — spend and the year heatmap
6. **Circle** — out right now

Shot 1 leads on the ring reading QUICK with "Two in the last hour, no water"
under it, rather than a calm green STEADY. That is deliberate. A green ring
shows a pretty control; the nudge shows what the app is actually FOR, and it is
the frame that answers "why would I install this" in the two seconds a listing
gets.

Do **not** screenshot the ‰ estimate, and do not put a number on a caption. The
store listing is an outward-facing surface and the same rule applies. The
estimate is off by default so a clean install cannot produce one by accident,
and `scripts/store-shots.mjs` throws if a ‰ appears in any frame anyway.

### Generating them

```
npx expo export --platform web && npx serve -s dist -l 4173
npm run store:shots
```

Eighteen files in `store/screenshots/` — the six at 1320×2868, 1242×2688 and
1080×1920, rendered at each device's real logical size and @3x so the pixel
count is exact rather than one out. The script seeds a signed-in account with
fourteen weeks of history, starts a night and logs into it, so no frame is an
empty state; it fails rather than continuing if the hero would be empty.

These are for the listing draft and for checking framing. **Retake the final
ones on real devices** — a web render is close, not identical, and a reviewer
will notice a status bar that is not iOS's.

## Listing copy

The strings above are not the source of truth — `store/metadata/` is, so a typo
is a diff rather than a copy-paste. `npm run store:check` asserts every one of
them fits inside the store's limit, which both stores enforce by silently
truncating.

```
store/metadata/<locale>/name.txt              30 chars
store/metadata/<locale>/subtitle.txt          30
store/metadata/<locale>/promotional_text.txt  170
store/metadata/<locale>/keywords.txt          100
store/metadata/<locale>/description.txt       4000
store/metadata/<locale>/short_description.txt 80   (Play)
store/metadata/<locale>/release_notes.txt     500
store/metadata/review/notes.txt               4000
```

Locales shipped: `en-US`, `fr-FR`, `ro-RO`, `es-ES`. The check discovers them by
listing `store/metadata/`, so a new locale is checked the moment the directory
exists — and a failure names the locale it is in. Two things a new locale must
also do: keep the name `ROUNDS`, and register its wording for the two lines that
must survive translation ("never use it to decide whether to drive" and "safety
features are free forever") in the `DISCLAIMER` map in `scripts/store-check.mjs`.
An unregistered locale fails rather than passing silently.

## Before you press submit

`npm run store:check` verifies everything in this repo that can be verified —
metadata lengths, the privacy manifest's contents, the blocked permissions, the
foreground-service subtype, the permission strings, the deep-link paths — and
prints, separately, the list below. Nothing on that list is stubbed: a fake
answer that passes a check is worse than no check, because it removes the
reminder without doing the work.

Blocked on a developer account, a key, or a live domain:

- [ ] Apple Developer account and App ID for `app.rounds.client`; TEAMID then
      replaces the placeholder in `apple-app-site-association`
- [ ] App Store Connect app record, and the 17+ rating set on it
- [ ] APNs auth key (.p8) → `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_PRIVATE_KEY`.
      Without these the Live Activity fan-out has nothing to send through
- [ ] Play Console app, upload key AND Play App Signing fingerprint into
      `assetlinks.json` — both placeholders are still in the file
- [ ] FCM server key
- [ ] `specialUse` demo video: record the ongoing notification and its two
      action buttons
- [ ] `rounds.app` live, serving both `.well-known` files over HTTPS, the AASA
      as `application/json` with no extension
- [ ] Support URL and marketing URL
- [ ] Demo account `demo@rounds.app` / `123456` working on a clean install
      against the production database
- [ ] Legal `[DRAFT]` sections settled by counsel — the one that cannot be
      worked around
- [ ] Final screenshots retaken on real devices

Deferred with billing, not blocked: subscription products, store prices per
territory, `STORE_WEBHOOK_SECRET` and the test purchase. See
`src/config/flags.ts`.

Verified automatically:

- [x] `PrivacyInfo.xcprivacy` copied into the iOS target — the config plugin
      does it on every prebuild, so it cannot be forgotten after a clean
- [x] Metadata within every store limit
- [x] Review notes agree with the app as built
- [x] `npm run check` green (typecheck, unit tests, database suite, store check)
