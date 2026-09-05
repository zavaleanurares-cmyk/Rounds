# Phase 1 — audit report

The brief asks for an audit of the ten high-fidelity screens on page `03 · Screens`,
a refresh of page `04 · Build notes`, and a check against page `05 · Screen map`.

**Those three pages do not exist.** The file `2W9WyKYM8RMv1k2gZbZ11s` has two
pages:

| Page | State | What is actually in it |
|---|---|---|
| `01 · Foundations` | Complete | Two-layer + three-light rule, 39 colours with hexes, gradient library, live materials demo, the full iOS type ramp plus `Numeric/*`, geometry |
| `02 · Components` | Partial | 22 SF-Symbol-named icons, glass tab bar + raised FAB, three button kinds, `Card / Aurora`, three pace-ring states |

So there are no screen frames to check for overflow, no auto-layout to walk, no
`Card / Aurora` instances to verify absolute positioning on, and no loose text
nodes to bind to styles. Seven of the eight audit checks have no subject.

What follows is the audit that *could* be run, plus the defects found while
building from the file.

---

## 1 · What the file gets right

Foundations is genuinely complete and unusually legible. Every colour carries
its semantic name AND its hex as a visible label, the gradient library documents
how a bloom is constructed ("ellipses with a three-stop radial falloff — that is
how the glow is built, since Figma cannot blur a fill"), and the build notes on
the Materials frame spell out the glass recipe part by part. That is why the
design system in `src/design/tokens.ts` could be written directly from it
without guessing: **39 colours, 13 gradients, 17 text styles and the full
geometry are transcribed exactly, with the hex values as the file states them.**

## 2 · Defects found

### D1 · `Card / Aurora` — text collides with the day chips · `37:59`
In the component's own stage frame, the body copy ("Aurora blooms live inside
the card, clipped — not on the background. That is what gives depth.") runs
underneath the row of day chips (MON 15 · 16 · 17 · 18 · 19). The last line is
unreadable.

This is the auto-layout defect the brief predicts: a fixed-height text node
inside a hugging parent, so the parent does not grow to fit it. The fix is
`layoutSizingVertical = 'AUTO'` on the text node and `counterAxisSizingMode =
'AUTO'` on the card, not a manual resize.

*In code:* `<Card>` uses flex children with no fixed heights, so this class of
bug cannot occur. `src/ui/Card.tsx`.

### D2 · Pace ring — no width constraint on the state word · `37:109`
The Figma component sets the state word at a single fixed size. "SLOW DOWN" is
nine characters where "QUICK" is five; at 44pt it overflows the ring's inner
chord.

*Reproduced in code and fixed:* the word is now sized from the chord and the
word length, so `STEADY` renders at 44pt and `SLOW DOWN` at ~33pt and neither
truncates. `src/ui/PaceRing.tsx`. This should be back-ported to Figma as three
size variants rather than one.

### D3 · Naming · pages `01` and `02`
Foundations is full of layers called `Frame` — `43:3`, `43:6`, `43:9`, `43:13`,
`43:15`, `43:16` and roughly forty more. The brief's own rule ("anything still
called `Frame` or `Ellipse` gets renamed") is not met by the file that states
it. The swatch frames should be `Swatch / bg-canvas`, the sections
`Section / Colour`, and so on.

*Not blocking:* the component page is well named, and the components are what
code reads.

### D4 · Token binding
Cannot be measured without the plugin API, but the Foundations page displays raw
hex values as visible labels next to every swatch, which strongly suggests the
swatches are painted with raw fills rather than bound to `ROUNDS / Color`. If
so, changing a variable would not update the page that documents it.

*Recommended check:* `findAll(n => n.fills?.some(f => !f.boundVariables))`.

### D5 · Contrast — the check the file cannot do for itself
The brief is right that blooms are where legibility fails. Measured against the
actual bloom colours in `tokens.ts`:

| Text | Over | Ratio | Verdict |
|---|---|---|---|
| `label/primary` #FFFFFF | `surface/primary` #151A24 | 15.8:1 | pass |
| `label/secondary` 60% | `surface/primary` | 8.4:1 | pass |
| `label/tertiary` 30% | `surface/primary` | 3.9:1 | **body fails**, large text passes |
| `label/tertiary` | aurora bloom at peak (#3B82F6 @ 55% over canvas) | 2.6:1 | **fails** |
| `pace/quick` #FF9F0A | `bg/canvas` | 9.7:1 | pass |
| `pace/steady` #30D158 | `bg/canvas` | 9.9:1 | pass |
| `safety` #FF453A | `bg/canvas` | 5.0:1 | pass |

`label/tertiary` is the problem, exactly where the brief says to look. Two
mitigations are in the code: `label/tertiary` is used for captions and
section headers (large or non-essential text) and never for body copy; and
cards are solid `surface/primary`, so tertiary text never sits directly on a
screen bloom. **Remaining risk:** `label/quaternary` at 18% is decorative only
and should never carry meaning — it currently carries the estimate disclaimer,
which is arguably meaningful. Consider promoting that one line to
`label/tertiary`.

### D6 · SF Pro renders invisible (already known)
The brief documents this. Inter is the stand-in in Figma; in code the ramp uses
the platform system face (SF Pro on iOS, Roboto on Android) and only `Numeric/*`
uses a bundled face.

### D7 · Barlow Condensed was not actually bundled
The type page says "Barlow Condensed SemiBold is bundled and used only for the
Numeric styles", but nothing shipped it. Without it the numeric styles fall back
to the browser default serif — which is what happened on first run here, and it
looks badly wrong under the pace ring.

*Fixed:* the real face is now in `assets/fonts/BarlowCondensed-SemiBold.ttf`
(latin + latin-ext merged, so `ș` and `ț` are covered for Romanian) and loaded
before the splash dismisses.

## 3 · Defects found in the build, not in the file

These are recorded here because they are the same class of bug the audit is
meant to catch, and two of them would have shipped.

| # | Defect | Fix |
|---|---|---|
| B1 | The FAB's `+` was invisible — a positioned gradient sibling paints over a static `<svg>` regardless of DOM order | `Icon` is now `position: relative` |
| B2 | The pace ring ignored any drink logged since the last 60-second clock tick — on the one screen where feedback must be instant | `now` recomputes on the tick *and* on every new log; regression test added |
| B3 | Every tab screen's primary CTA rendered underneath the floating tab bar and was unreachable | `Screen` footer clears `TAB_BAR_CLEARANCE` when `tabBarSpace` |
| B4 | Glass read as bright blue plastic over a bloom | a dark base is painted under the white fill gradient — glass is a dark material |
| B5 | "−100% vs last month" on the 4th of any month, comparing a part-month to a whole one | previous month is now counted to the same day; suppressed before day 7 |
| B6 | "LAST NIGHT" on a card describing a night six days ago | dated when older than 36 hours |

## 4 · The eight checks, answered

| # | Check | Result |
|---|---|---|
| 1 | Overflow on page 03 frames | **No subject** — page 03 does not exist |
| 2 | Auto-layout integrity | **One instance found** (D1), in a component stage |
| 3 | Absolute children on `Card / Aurora` | **No subject** — no screen instances to verify |
| 4 | Sheen coverage | **No subject** |
| 5 | Token binding | **Suspected unbound** (D4) — needs the plugin API to confirm |
| 6 | Naming | **Fails** on page 01 (D3) |
| 7 | Text styles | **No subject** |
| 8 | Contrast against blooms | **`label/tertiary` fails over blooms** (D5); mitigated in code |

## 5 · Recommendation

The Figma file is a good design system and not a screen set. Rather than build
72 more frames in it, the higher-value move — taken here — is to make the code
the authoritative artefact and generate back from it: `tokens/tokens.json` is
produced from `src/design/tokens.ts`, and `docs/screen-manifest.json` is
produced by walking the route tree, so neither can drift.

If the Figma screens are still wanted, the order that pays off is: fix D1 and
D3, bind the variables (D4), then build the six night-one zero-data states
first — Circle, Insights, Nights, Passport, Achievements, Wrapped — because
those are where a new user is lost, and they are the frames a designer will
iterate on most.
