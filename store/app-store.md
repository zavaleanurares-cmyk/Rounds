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
> · **The blood-alcohol figure is an estimate, presented as one.** It is
>   secondary to a plain-language pace word, always carries the disclaimer
>   "Pacing estimate. Never use this to decide whether to drive.", never appears
>   near a transport option, never appears on a shareable card or any social
>   surface, and is suppressed entirely when the app is telling the user to slow
>   down. It is computed on-device and never transmitted or stored.
> · **Block, report and account deletion** are all present. Block is at
>   Person profile › ⋯ › Block. Report is at the same menu, and at
>   Settings › Help. Delete account is at Settings › Data & account, with a
>   type-to-confirm and an immediate sign-out.
> · **There is no feed and no user-generated content stream.** Chat exists only
>   inside a night you were invited to. There is no leaderboard on anything
>   countable about alcohol, and no streak that rewards drinking.
> · **Safety features are free forever** and are never behind the subscription.
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

1. **Tonight · Live** — the pace ring at STEADY, with the tonight strip
2. **Log sheet** — "Same again" plus the drawn drinks
3. **Morning after** — fill the gaps
4. **Get home safe** — the armed check-in
5. **You** — spend and the year heatmap
6. **Circle** — out right now

Do **not** screenshot the ‰ estimate, and do not put a number on a caption. The
store listing is an outward-facing surface and the same rule applies.

## Before you press submit

- [ ] Legal `[DRAFT]` sections settled by counsel
- [ ] `PrivacyInfo.xcprivacy` copied into the iOS target
- [ ] Support URL and marketing URL live
- [ ] Demo account works on a clean install
- [ ] `apple-app-site-association` and `assetlinks.json` served and verifying
- [ ] Push certificate / FCM key uploaded
- [ ] Subscription products created in both stores, prices set per territory
- [ ] `STORE_WEBHOOK_SECRET` set, webhook reachable, one test purchase mirrored
- [ ] `npm run check` green
