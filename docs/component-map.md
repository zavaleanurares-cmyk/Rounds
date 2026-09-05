# Component map — Figma → code

The contract between the Figma file (`2W9WyKYM8RMv1k2gZbZ11s`) and this
codebase. A Figma component whose name is not in this table has no code home
yet; a code component that is not in this table has drifted from the design
system and should be pulled back into it or promoted into Figma.

Import everything from `@/ui`. Nothing outside `src/ui` should reach for
`expo-blur`, `expo-linear-gradient` or `react-native-svg` directly — that is how
a second, slightly-wrong glass recipe gets born.

## Foundations

| Figma | Code | Notes |
|---|---|---|
| `ROUNDS / Color` (39 variables) | `src/design/tokens.ts` → `color` | Semantic names only. A raw hex in a screen file is a defect. |
| `ROUNDS / Metrics` (24) | `tokens.ts` → `space`, `radius`, `geometry` | `innerRadius(outer, padding)` implements *inner = outer − padding*. |
| 17 text styles | `tokens.ts` → `type` + `<Text variant>` | `numeric*` are the only variants that use Barlow Condensed. |
| 13 paint styles | `tokens.ts` → `gradient` | Composite recipes live in `tokens/tokens.json` under `recipe`. |
| 7 effect styles | `tokens.ts` → `glow`, `elevation` | `Glow` is two nested views, because RN gives one shadow per view. |

## Components

| Figma component | Code | Props that matter |
|---|---|---|
| `Tab Bar / Floating Glass` | `<TabBar>` | `items`, `activeKey`, `onSelect`, `onLog`. 370×62 capsule, 16pt inset, +12pt on Android 3-button nav. |
| `Button / Log FAB` | inside `<TabBar>` | 60pt, raised 14pt, on its own 140pt bloom. |
| `Button / Primary` | `<Button kind="primary">` | Carries `Gradient/Tint Primary` + `Glow/Primary`. **One per screen.** |
| `Button / Glass` | `<Button kind="glass">` | Functional layer only. |
| `Button / Plain` | `<Button kind="plain">` | Sits inside content cards. |
| — | `<Button kind="destructive">` | Added in code: block, delete, remove. |
| `Card / Aurora` | `<Card aurora accent={…}>` | Solid fill + 2 clipped blooms + sheen + rim + optional 3pt accent bar. |
| `Card / Flat` | `<Card>` | Same card, no blooms. |
| `Pace Ring / Steady` `/ Quick` `/ Slow down` | `<PaceRing result={…}>` | Six segments; state word sized to fit the ring; a matching bloom behind it. |
| — | `<PaceEstimate bac state>` | **Separate on purpose** so the ‰ figure can never be promoted into the hero. Returns `null` in `slow_down`. |
| `Glass / Regular` | `<Glass>` | Blur + dark base + white fill gradient + rim + inner highlight/shade. |
| `Sheen` | inside `<Card aurora>` | Not a standalone component — it always belongs to a card. |
| `Bloom` | `<Bloom size color opacity>` | Three-stop radial. Light sources one and two. |
| `Icon / *` (22 + 24 added) | `<Icon name="chevron.right">` | Names are exact SF Symbol names; swap for `Image(systemName:)` on native surfaces. |
| — (new) | `<DrinkGlyph drink={…}>` | 165 drinks drawn as glass + liquid + garnish. **Nothing in this app is an emoji.** Needs a `Drink / *` component set in Figma. |

## Components promoted from inline drawing

These were drawn inline on the ten Figma screens and are components here.
They should be promoted in Figma too, with these names.

| Code | Figma name to create | Variants |
|---|---|---|
| `<NavRow>` | `List Row / Navigation` | default, destructive, with value |
| `<ValueRow>` | `List Row / Value` | — |
| `<ToggleRow>` | `List Row / Toggle` | on, off, disabled-with-reason |
| `<Group>` | `List / Group` | with header, without |
| `<Chip>` | `Chip / Filter` | default, selected, compact |
| `<Segmented>` | `Segmented Control` | 2, 3, 4 segments |
| `<Avatar>` | `Avatar` | 24, 28, 34, 46, 72 · initials · live dot |
| `<AvatarStack>` | `Avatar / Stacked` | up to 4 + overflow |
| `<ProgressBar>` | `Progress / Bar` | — |
| `<ProgressRing>` | `Progress / Ring` | — |
| `<Sparkline>` | `Chart / Sparkline` | 8 bars |
| `<StatTile>` | `Tile / Stat` | — |
| `<QuickAction>` | `Tile / Quick Action` | — |
| `<Sheet>` | `Sheet / Glass` | with title, without |
| `<EmptyState>` | `Empty State` | — |
| `<ErrorState>` | `Error State` | — |
| `<OfflinePill>` | `Offline Pill` | with count, without |
| `<SkeletonBlock>` / `<SkeletonRow>` | `Skeleton / Card`, `Skeleton / Row` | — |
| toast in `<ToastProvider>` | `Toast / Undo` | with action, without |
| `<Screen>` | — | The screen scaffold: aurora, safe area, collapsing large title, offline pill, footer that clears the tab bar. |

## Domain, not design

The three things the brief protects, and where they live.

| Concern | File | Contract |
|---|---|---|
| Offline log queue | `src/data/queue.ts` | Client-generated UUID is the row PK. Every write path enqueues here; there is never a second one. `enqueue` is synchronous from the caller's point of view. |
| Pace / Widmark | `src/domain/pace.ts` | `paceState()` is the primary readout; `bacAt()` is secondary, never stored, never sent. Pure functions, no I/O. |
| RLS matrix | `supabase/tests/rls_matrix.sql` | Six roles including **blocked**, asserted to read nothing and appear nowhere. |
| Night boundary | `src/domain/nightKey.ts` | 04:00 local, one place, used by every aggregate. |
| Drink artwork | `src/domain/art.ts`, `src/ui/DrinkGlyph.tsx` | 24 glass shapes × 55 named liquids × 24 garnishes. A test asserts every liquid is a named one. |
| System surfaces | `src/native/`, `modules/rounds-native/` | One JS interface, two native implementations, all writing through the queue. |
| Derived stats | `src/domain/stats.ts` | Everything recomputed, nothing cached server-side — that is what makes retroactive editing safe. |
