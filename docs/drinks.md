# The drink catalogue

**165 drinks. Zero emoji.**

## Why not emoji

Emoji render differently on every platform, cannot be tinted, cannot carry the
app's palette — and, the actual problem, there is no emoji for a Negroni, a
Paloma or a Paper Plane. A catalogue built on them collapses into 🍸 for
everything interesting, which is most of it.

So every drink is **drawn**: a 44×56 SVG with a glassware silhouette, the liquid
clipped to that glass's interior, then ice, foam, rim and garnish. Vector, so it
is crisp at 18pt in a chip and at 96pt on an empty state; themeable, so it
inherits the palette; identical on iOS, Android and web.

See them all: **Settings › Every drink**, or `app/dev/drinks.tsx`.

## The three axes

| Axis | What it carries | Count |
|---|---|---|
| **Glass** | Real glassware — a drink in the wrong glass is a drink you misread | 24 shapes |
| **Liquid** | A two-stop gradient, the single most identifying feature | 55 named liquids |
| **Garnish** | Citrus, olive, cherry, mint, coffee beans, celery, umbrella… | 24 garnishes |

Plus `rim` (salt / sugar), `ice` (cubes / crushed / sphere), `head` (beer foam,
crema, egg-white) and `layers` (a Tequila Sunrise, a B-52, a New York Sour).

That is what makes a **Margarita** and a **Daiquiri** tell apart at a glance:
both pale and citrus-led, but one is a salted coupe and the other isn't.

Colours come from a named palette rather than being eyeballed 165 times — a test
asserts that every drink's liquid is one of the named entries, so two drinks that
really are the same colour stay the same colour.

## The numbers are real

Volumes and ABVs follow the published UK unit guidance: 25ml spirit at 40%,
175ml wine at 12%, a 568ml pint. A test asserts the whole table row for row, so
a change to the ethanol constants shows up as a failing row rather than as a
number that is quietly a bit wrong everywhere.

Cocktails carry the **finished poured volume and the strength of the finished
drink**, diluted — not the base spirit. A Negroni is 90ml at 24%, not 30ml of
40% gin. Getting this wrong is how a tracker tells someone three Negronis was a
light night.

The cocktail list is the **IBA official list** in full: 34 Unforgettables, 34
Contemporary Classics and 37 New Era Drinks, plus the everyday drinks people
actually order.

## In the app

165 drinks would drown the log sheet, so the catalogue is never what you see
first. "Same again" is the primary, your four usuals are one tap below it, and
everything else is behind search or a category chip. Nobody scrolls a hundred
cocktails at 1am.

Sources: the IBA official cocktail list and the NHS/CPOC alcohol unit table.
