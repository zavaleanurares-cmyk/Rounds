/**
 * Nicotine, as an actual thing that can be recorded.
 *
 * The module has been switchable since onboarding shipped, and the dashboard
 * behind it rendered two literal zeros: `f.number(0, 0)` for "this week" and
 * again for "free streak". There was no nicotine category in the catalogue, so
 * nothing could be logged, and its "Log nicotine" button opened the drinks
 * sheet. The `nicotine_free` goal type existed with no branch in
 * `goalProgress`, so its ring read 0% forever.
 *
 * A cigarette is a consumption log like any other: it happens at a time, on a
 * night, possibly at a venue, and it contains no ethanol. `ethanol_g` is a
 * GENERATED column over volume and abv, both zero here, so every alcohol total
 * in the product already excludes it by construction rather than by a filter
 * somebody has to remember — the same property that makes water safe to log
 * alongside drinks.
 */
alter type public.drink_category add value if not exists 'nicotine';
