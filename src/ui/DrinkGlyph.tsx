import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs, ClipPath, LinearGradient, RadialGradient, Stop, Path, Rect, Circle,
  Ellipse, G, Line,
} from 'react-native-svg';
import type { Drink } from '@/domain/types';
import type { DrinkArt, GlassShape, Garnish } from '@/domain/art';

/**
 * Draws a drink.
 *
 * The whole glyph is one 44×56 SVG: a glassware silhouette, the liquid clipped
 * to that glass's interior, then ice, foam, rim and garnish on top. Everything
 * is vector, so it is crisp at 18pt in a chip and at 96pt on an empty state, it
 * inherits the app's palette, and it renders identically on iOS, Android and the
 * web — none of which is true of an emoji.
 *
 * The three axes are glass + liquid + garnish. That is what makes a Margarita
 * and a Daiquiri distinguishable at a glance: both pale and citrus-led, but one
 * is a salted coupe and the other isn't.
 */

const W = 44;
const H = 56;

/** The interior a liquid can occupy, and where its surface sits when full. */
interface Cavity {
  /** Clip path for the liquid. */
  path: string;
  /** y of the rim (a full glass). */
  top: number;
  /** y of the floor. */
  bottom: number;
  /** Half-width at the rim, for foam and garnish placement. */
  rimHalf: number;
  /** x centre. */
  cx: number;
}

interface GlassDef {
  cavity: Cavity;
  /** Drawn behind the liquid (foot, stem, opaque body). */
  behind?: (s: Stroke) => React.ReactNode;
  /** Drawn in front (outline, handle, highlight). */
  front: (s: Stroke) => React.ReactNode;
  /** True when you cannot see the liquid — metal and ceramic vessels. */
  opaque?: boolean;
}

interface Stroke {
  stroke: string;
  strokeWidth: number;
  fill: 'none';
  strokeLinecap: 'round';
  strokeLinejoin: 'round';
}

/* ------------------------------------------------------------- glassware */

const GLASSES: Record<GlassShape, GlassDef> = {
  /**
   * The two that hold nothing.
   *
   * `opaque` keeps the liquid layer out, and the cavity is a degenerate point
   * so nothing can be clipped into it — a cigarette with a fill level would be
   * a strange object. Everything else about them is the same as a glass: one
   * stroke, the app's palette, crisp at 18pt in a chip.
   */
  cigarette: {
    cavity: { path: 'M22 28 L22 28 Z', top: 28, bottom: 28, rimHalf: 0, cx: 22 },
    opaque: true,
    front: (s) => (
      <>
        {/* the body, angled, with the filter banded off at the near end */}
        <Path {...s} d="M9 44 L33 20" strokeWidth={5} strokeLinecap="round" />
        <Path {...s} d="M9 44 L15.5 37.5" strokeWidth={5} strokeLinecap="round" opacity={0.45} />
        {/* smoke */}
        <Path {...s} d="M34.5 17 Q31 13.5 34 10.5 Q37 7.5 33.5 4.5" strokeWidth={1.4} opacity={0.55} />
      </>
    ),
  },
  /**
   * Hand-rolled: thinner, no filter band, and pinched shut at the far end.
   *
   * It had been sharing the cigarette silhouette, so the two were
   * indistinguishable in a grid where they sit next to each other — which is
   * the one place the difference matters.
   */
  rolled: {
    cavity: { path: 'M22 28 L22 28 Z', top: 28, bottom: 28, rimHalf: 0, cx: 22 },
    opaque: true,
    front: (s) => (
      <>
        <Path {...s} d="M10 43 L30.5 22.5" strokeWidth={3.4} strokeLinecap="round" />
        {/* the twist */}
        <Path {...s} d="M30.5 22.5 L34 19" strokeWidth={1.6} strokeLinecap="round" />
        <Path {...s} d="M35.5 16 Q32.5 13 35 10" strokeWidth={1.3} opacity={0.5} />
      </>
    ),
  },
  /**
   * A pouch, as it sits between lip and gum: a rounded slim rectangle with the
   * soft seam across it. The tin's colour arrives through `liquid`, which is
   * why these three are NOT opaque — the fill is what makes a Killa read black
   * and a ZYN read white at 18pt in a chip.
   */
  pouch: {
    /**
     * A slim pouch, which is a small pillow — much wider than it is tall, with
     * fully rounded ends. The first version was 26 wide by 23 tall with a small
     * corner radius, so it rendered as a rounded square: an app icon, or a tin,
     * and not the thing that goes under a lip. Looking at a contact sheet is
     * what showed it; nothing else would have.
     */
    cavity: { path: 'M6 30 Q6 20 16 20 L28 20 Q38 20 38 30 Q38 40 28 40 L16 40 Q6 40 6 30 Z', top: 20, bottom: 40, rimHalf: 16, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M6 30 Q6 20 16 20 L28 20 Q38 20 38 30 Q38 40 28 40 L16 40 Q6 40 6 30 Z" />
        {/* the seam along the middle, and the soft gather at each end */}
        <Path {...s} d="M10 30 Q22 27.5 34 30" strokeWidth={1} opacity={0.5} />
        <Path {...s} d="M13 22 Q11.5 30 13 38" strokeWidth={0.9} opacity={0.35} />
        <Path {...s} d="M31 22 Q32.5 30 31 38" strokeWidth={0.9} opacity={0.35} />
      </>
    ),
  },
  /**
   * A flip-top pack with two cigarettes standing proud of it. The brand colour
   * fills the body; the lid and the two filters are drawn over it.
   */
  pack: {
    cavity: { path: 'M13 18 L31 18 L31 50 Q31 51.5 29.5 51.5 L14.5 51.5 Q13 51.5 13 50 Z', top: 18, bottom: 51.5, rimHalf: 9, cx: 22 },
    front: (s) => (
      <>
        {/* the two cigarettes, behind the lid line */}
        <Path {...s} d="M17.5 12 L17.5 18 M24 9.5 L24 18" strokeWidth={3.4} strokeLinecap="round" />
        <Path {...s} d="M13 18 L31 18 L31 50 Q31 51.5 29.5 51.5 L14.5 51.5 Q13 51.5 13 50 Z" />
        {/* the lid seam */}
        <Line {...s} x1="13.4" y1="25" x2="30.6" y2="25" strokeWidth={1} opacity={0.6} />
      </>
    ),
  },
  /**
   * A heated-tobacco stick standing in its holder — the shape of an IQOS or a
   * glo rather than of a cigarette, because they are not the same thing and the
   * person logging one knows the difference.
   */
  heatstick: {
    cavity: { path: 'M16 26 L28 26 Q29.5 26 29.5 27.5 L29.5 48 Q29.5 50 27.5 50 L16.5 50 Q14.5 50 14.5 48 L14.5 27.5 Q14.5 26 16 26 Z', top: 26, bottom: 50, rimHalf: 7.5, cx: 22 },
    front: (s) => (
      <>
        {/* the stick */}
        <Path {...s} d="M19 7 L25 7 L25 26 L19 26 Z" />
        <Line {...s} x1="19.4" y1="13" x2="24.6" y2="13" strokeWidth={0.9} opacity={0.5} />
        {/* the holder */}
        <Path {...s} d="M16 26 L28 26 Q29.5 26 29.5 27.5 L29.5 48 Q29.5 50 27.5 50 L16.5 50 Q14.5 50 14.5 48 L14.5 27.5 Q14.5 26 16 26 Z" />
        <Line {...s} x1="17.5" y1="44" x2="26.5" y2="44" strokeWidth={1} opacity={0.5} />
      </>
    ),
  },
  vape: {
    cavity: { path: 'M22 28 L22 28 Z', top: 28, bottom: 28, rimHalf: 0, cx: 22 },
    opaque: true,
    front: (s) => (
      <>
        <Path {...s} d="M16 14 L28 14 Q30 14 30 16.5 L30 45 Q30 48 27 48 L17 48 Q14 48 14 45 L14 16.5 Q14 14 16 14 Z" />
        {/* the mouthpiece, on the body rather than floating above it */}
        <Path {...s} d="M19 14 L19 10 Q19 8.5 20.5 8.5 L23.5 8.5 Q25 8.5 25 10 L25 14" />
        <Line {...s} x1="18" y1="40" x2="26" y2="40" strokeWidth={1} opacity={0.5} />
      </>
    ),
  },
  /**
   * The other heated device: shorter, wider, with the stick sunk into it rather
   * than standing out. It shared `heatstick` with IQOS and the two were the
   * same picture, which for the two products a smoker actually chooses between
   * is the worst place to be identical.
   */
  heatstickWide: {
    cavity: { path: 'M12 22 Q12 19.5 14.5 19.5 L29.5 19.5 Q32 19.5 32 22 L32 46 Q32 49 29 49 L15 49 Q12 49 12 46 Z', top: 19.5, bottom: 49, rimHalf: 10, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M12 22 Q12 19.5 14.5 19.5 L29.5 19.5 Q32 19.5 32 22 L32 46 Q32 49 29 49 L15 49 Q12 49 12 46 Z" />
        {/* the stick, sunk in */}
        <Path {...s} d="M19.5 19.5 L19.5 12 L24.5 12 L24.5 19.5" />
        <Line {...s} x1="13.5" y1="27" x2="30.5" y2="27" strokeWidth={1} opacity={0.5} />
      </>
    ),
  },
  pint: {
    cavity: { path: 'M11.5 8 L32.5 8 L29.5 49.5 Q22 51.5 14.5 49.5 Z', top: 8, bottom: 50, rimHalf: 10.5, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M11 6.5 L33 6.5 L29.8 49.8 Q22 52.2 14.2 49.8 Z" />
        <Line {...s} x1="12.4" y1="20" x2="31.6" y2="20" strokeWidth={1} opacity={0.5} />
      </>
    ),
  },
  tulip: {
    cavity: { path: 'M13 9 L31 9 Q31 26 26.5 34 L26.5 44 L17.5 44 L17.5 34 Q13 26 13 9 Z', top: 9, bottom: 44, rimHalf: 9, cx: 22 },
    behind: (s) => <Path {...s} d="M15 51 L29 51" strokeWidth={2.4} />,
    front: (s) => (
      <Path {...s} d="M12.5 7.5 L31.5 7.5 Q31.5 26.5 26.5 34.5 L26.5 47 M17.5 47 L17.5 34.5 Q12.5 26.5 12.5 7.5 M17 50.5 L27 50.5" />
    ),
  },
  stein: {
    cavity: { path: 'M12 10 L30 10 L30 48 L12 48 Z', top: 10, bottom: 48, rimHalf: 9, cx: 21 },
    front: (s) => (
      <>
        <Path {...s} d="M11 8.5 L31 8.5 L31 49.5 L11 49.5 Z" />
        <Path {...s} d="M31 17 Q38.5 17 38.5 26 Q38.5 35 31 35" />
        <Line {...s} x1="11" y1="26" x2="31" y2="26" strokeWidth={0.9} opacity={0.45} />
      </>
    ),
  },
  bottle: {
    cavity: { path: 'M18.5 12 L25.5 12 L25.5 18 Q31 22 31 28 L31 48 Q31 50 29 50 L15 50 Q13 50 13 48 L13 28 Q13 22 18.5 18 Z', top: 12, bottom: 50, rimHalf: 3.5, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M18.5 10.5 L25.5 10.5 L25.5 18 Q31.5 22 31.5 28.5 L31.5 48.5 Q31.5 51 29 51 L15 51 Q12.5 51 12.5 48.5 L12.5 28.5 Q12.5 22 18.5 18 Z" />
        <Rect {...s} x="17.6" y="6.5" width="8.8" height="4.2" rx="1.4" />
      </>
    ),
  },
  can: {
    cavity: { path: 'M13 12 L31 12 L31 46 L13 46 Z', top: 12, bottom: 46, rimHalf: 9, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M13.5 9 Q22 7.6 30.5 9 L31.5 13 L31.5 45 Q31.5 49.5 22 49.5 Q12.5 49.5 12.5 45 L12.5 13 Z" />
        <Ellipse {...s} cx="22" cy="10.4" rx="8.6" ry="2.4" />
      </>
    ),
  },
  wineRed: {
    cavity: { path: 'M11.5 9 L32.5 9 Q32.5 27 22 30.5 Q11.5 27 11.5 9 Z', top: 9, bottom: 30.5, rimHalf: 10.5, cx: 22 },
    behind: () => null,
    front: (s) => (
      <>
        <Path {...s} d="M11 7.5 L33 7.5 Q33 27.5 22 31.5 Q11 27.5 11 7.5 Z" />
        <Line {...s} x1="22" y1="31.5" x2="22" y2="47" />
        <Path {...s} d="M14 48.5 Q22 45.8 30 48.5" />
      </>
    ),
  },
  wineWhite: {
    cavity: { path: 'M14 9 L30 9 Q30 26 22 29.5 Q14 26 14 9 Z', top: 9, bottom: 29.5, rimHalf: 8, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M13.5 7.5 L30.5 7.5 Q30.5 26.5 22 30.5 Q13.5 26.5 13.5 7.5 Z" />
        <Line {...s} x1="22" y1="30.5" x2="22" y2="47" />
        <Path {...s} d="M14.5 48.5 Q22 46 29.5 48.5" />
      </>
    ),
  },
  flute: {
    cavity: { path: 'M17 7 L27 7 L25.5 31 Q22 33 18.5 31 Z', top: 7, bottom: 32, rimHalf: 5, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M16.5 5.5 L27.5 5.5 L25.8 31.5 Q22 33.8 18.2 31.5 Z" />
        <Line {...s} x1="22" y1="33.5" x2="22" y2="47" />
        <Path {...s} d="M15 48.5 Q22 46 29 48.5" />
      </>
    ),
  },
  coupe: {
    cavity: { path: 'M10 15 L34 15 Q34 27 22 28.5 Q10 27 10 15 Z', top: 15, bottom: 28.5, rimHalf: 12, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M9.5 13.5 L34.5 13.5 Q34.5 28 22 29.8 Q9.5 28 9.5 13.5 Z" />
        <Line {...s} x1="22" y1="29.8" x2="22" y2="46.5" />
        <Path {...s} d="M14 48.5 Q22 45.8 30 48.5" />
      </>
    ),
  },
  martini: {
    cavity: { path: 'M11 13 L33 13 L22 29 Z', top: 13, bottom: 29, rimHalf: 11, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M10 11.5 L34 11.5 L22 30.5 Z" />
        <Line {...s} x1="22" y1="30.5" x2="22" y2="46.5" />
        <Path {...s} d="M14 48.5 Q22 45.8 30 48.5" />
      </>
    ),
  },
  nickAndNora: {
    cavity: { path: 'M14 13 L30 13 Q30 26 22 28 Q14 26 14 13 Z', top: 13, bottom: 28, rimHalf: 8, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M13.5 11.5 L30.5 11.5 Q30.5 26.5 22 29 Q13.5 26.5 13.5 11.5 Z" />
        <Line {...s} x1="22" y1="29" x2="22" y2="46.5" />
        <Path {...s} d="M15 48.5 Q22 46 29 48.5" />
      </>
    ),
  },
  rocks: {
    cavity: { path: 'M12 18 L32 18 L30 48 L14 48 Z', top: 18, bottom: 48, rimHalf: 10, cx: 22 },
    front: (s) => <Path {...s} d="M11.5 16.5 L32.5 16.5 L30.4 49.5 L13.6 49.5 Z" />,
  },
  highball: {
    cavity: { path: 'M15 10 L29 10 L28 48 L16 48 Z', top: 10, bottom: 48, rimHalf: 7, cx: 22 },
    front: (s) => <Path {...s} d="M14.5 8.5 L29.5 8.5 L28.3 49.5 L15.7 49.5 Z" />,
  },
  collins: {
    cavity: { path: 'M16.5 7 L27.5 7 L26.8 48 L17.2 48 Z', top: 7, bottom: 48, rimHalf: 5.5, cx: 22 },
    front: (s) => <Path {...s} d="M16 5.5 L28 5.5 L27.1 49.5 L16.9 49.5 Z" />,
  },
  shot: {
    cavity: { path: 'M15 26 L29 26 L27 47 L17 47 Z', top: 26, bottom: 47, rimHalf: 7, cx: 22 },
    front: (s) => <Path {...s} d="M14.5 24.5 L29.5 24.5 L27.3 48.5 L16.7 48.5 Z" />,
  },
  sherry: {
    cavity: { path: 'M15 14 L29 14 Q29 26 22 28 Q15 26 15 14 Z', top: 14, bottom: 28, rimHalf: 7, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M14.5 12.5 L29.5 12.5 Q29.5 26.5 22 29 Q14.5 26.5 14.5 12.5 Z" />
        <Line {...s} x1="22" y1="29" x2="22" y2="45" />
        <Path {...s} d="M16 47 Q22 44.6 28 47" />
      </>
    ),
  },
  mug: {
    cavity: { path: 'M13 14 L29 14 L27.5 44 L14.5 44 Z', top: 14, bottom: 44, rimHalf: 8, cx: 21 },
    front: (s) => (
      <>
        <Path {...s} d="M12.5 12.5 L29.5 12.5 L27.8 44.8 L14.2 44.8 Z" />
        <Path {...s} d="M29.5 20 Q36.5 20 36.5 28 Q36.5 35 28.4 35" />
        <Path {...s} d="M13 48.5 Q21 46 29 48.5" />
      </>
    ),
  },
  copper: {
    opaque: true,
    cavity: { path: 'M12 16 L30 16 L30 46 L12 46 Z', top: 16, bottom: 46, rimHalf: 9, cx: 21 },
    front: (s) => (
      <>
        <Path {...s} d="M11.5 14.5 L30.5 14.5 L30.5 47 L11.5 47 Z" />
        <Path {...s} d="M30.5 22 Q37.5 22 37.5 30 Q37.5 37 30.5 37" />
      </>
    ),
  },
  hurricane: {
    cavity: { path: 'M13 12 Q13 22 17 27 Q13 33 15 40 L29 40 Q31 33 27 27 Q31 22 31 12 Z', top: 12, bottom: 40, rimHalf: 9, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M12.5 10.5 Q12.5 22 17 27 Q12.5 33.5 14.6 41.5 L29.4 41.5 Q31.5 33.5 27 27 Q31.5 22 31.5 10.5 Z" />
        <Path {...s} d="M14 48.5 Q22 45.8 30 48.5" />
        <Line {...s} x1="22" y1="41.5" x2="22" y2="46" />
      </>
    ),
  },
  tiki: {
    opaque: true,
    cavity: { path: 'M13 12 L31 12 L29 46 L15 46 Z', top: 12, bottom: 46, rimHalf: 9, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M12.5 10.5 L31.5 10.5 L29.4 47.5 L14.6 47.5 Z" />
        <Path {...s} d="M17.5 20 Q19.5 23 17.5 26 M26.5 20 Q24.5 23 26.5 26 M18 33 Q22 37 26 33" />
      </>
    ),
  },
  sling: {
    cavity: { path: 'M14 10 L30 10 L28 36 L16 36 Z', top: 10, bottom: 36, rimHalf: 8, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M13.5 8.5 L30.5 8.5 L28.3 37 L15.7 37 Z" />
        <Line {...s} x1="22" y1="37" x2="22" y2="46" />
        <Path {...s} d="M15 48.5 Q22 46 29 48.5" />
      </>
    ),
  },
  julep: {
    opaque: true,
    cavity: { path: 'M13 16 L31 16 L28.5 46 L15.5 46 Z', top: 16, bottom: 46, rimHalf: 9, cx: 22 },
    front: (s) => (
      <>
        <Path {...s} d="M12.5 14.5 L31.5 14.5 L28.8 47.5 L15.2 47.5 Z" />
        <Line {...s} x1="13.6" y1="22" x2="30.4" y2="22" strokeWidth={0.9} opacity={0.6} />
      </>
    ),
  },
  water: {
    cavity: { path: 'M14 14 L30 14 L28.5 48 L15.5 48 Z', top: 14, bottom: 48, rimHalf: 8, cx: 22 },
    front: (s) => <Path {...s} d="M13.5 12.5 L30.5 12.5 L28.8 49.5 L15.2 49.5 Z" />,
  },
  cup: {
    cavity: { path: 'M13 22 L29 22 Q29 40 21 42 Q13 40 13 22 Z', top: 22, bottom: 42, rimHalf: 8, cx: 21 },
    front: (s) => (
      <>
        <Path {...s} d="M12.5 20.5 L29.5 20.5 Q29.5 40.5 21 43 Q12.5 40.5 12.5 20.5 Z" />
        <Path {...s} d="M29.5 25 Q36 25 36 30.5 Q36 36 29.2 36" />
        <Path {...s} d="M9 47 L33 47" />
      </>
    ),
  },
};

/* ------------------------------------------------------------- garnishes */

function Garnishes({
  list, cavity, surfaceY, tint,
}: { list: readonly Garnish[]; cavity: Cavity; surfaceY: number; tint: string }) {
  const { cx, top, rimHalf } = cavity;
  const out: React.ReactNode[] = [];
  const g = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  list.forEach((item, i) => {
    switch (item) {
      case 'citrusWheel':
        out.push(
          <G key={i}>
            <Circle cx={cx + rimHalf - 1} cy={top - 1} r={4.6} fill="#FBE27A" stroke="#C9A31C" strokeWidth={1} />
            <Path d={`M${cx + rimHalf - 1} ${top - 5.4} L${cx + rimHalf - 1} ${top + 3.4} M${cx + rimHalf - 5.4} ${top - 1} L${cx + rimHalf + 3.4} ${top - 1}`} stroke="#C9A31C" strokeWidth={0.8} {...g} />
          </G>
        );
        break;
      case 'citrusWedge':
        out.push(
          <Path key={i} d={`M${cx + rimHalf - 3} ${top - 4.6} A 5 5 0 0 1 ${cx + rimHalf + 2.2} ${top + 0.6} Z`}
                fill="#C7E86A" stroke="#7FA828" strokeWidth={1} {...g} />
        );
        break;
      case 'citrusTwist':
        out.push(
          <Path key={i} d={`M${cx - 2} ${top - 5} q 5 -1.5 7 2.5 q -4.5 2.5 -7 -2.5`} fill="#F4E06A" stroke="#CBAE1D" strokeWidth={1} {...g} />
        );
        break;
      case 'orangePeel':
        out.push(
          <Path key={i} d={`M${cx - 3} ${top - 5.5} q 6 -1.5 8 3 q -5.5 3 -8 -3`} fill="#F79A2E" stroke="#B9660C" strokeWidth={1} {...g} />
        );
        break;
      case 'olive':
        out.push(
          <G key={i}>
            <Line x1={cx + 4} y1={top - 7} x2={cx - 3} y2={surfaceY + 1} stroke="#D9DEE8" strokeWidth={1.1} {...g} />
            <Circle cx={cx - 3} cy={surfaceY + 1} r={2.9} fill="#8FBF3F" stroke="#5E8A18" strokeWidth={0.9} />
            <Circle cx={cx - 3} cy={surfaceY + 1} r={1.1} fill="#E24B3A" />
          </G>
        );
        break;
      case 'cherry':
        out.push(
          <G key={i}>
            <Path d={`M${cx + 3} ${top - 6} q 2 4 0.4 7.4`} stroke="#7FA828" strokeWidth={1} fill="none" {...g} />
            <Circle cx={cx + 3.4} cy={top + 3.4} r={3} fill="#D62A4E" stroke="#8A0F27" strokeWidth={0.9} />
          </G>
        );
        break;
      case 'berry':
        out.push(
          <G key={i}>
            <Circle cx={cx - 5} cy={top - 1.5} r={2.2} fill="#9A2C6B" />
            <Circle cx={cx - 2.2} cy={top - 3} r={1.9} fill="#6D1C52" />
          </G>
        );
        break;
      case 'mint':
        out.push(
          <G key={i}>
            <Path d={`M${cx - 6} ${top - 2} q -3 -7 3 -8 q 2 6 -3 8`} fill="#3FD39A" stroke="#128B62" strokeWidth={0.9} {...g} />
            <Path d={`M${cx - 1} ${top - 3} q 1 -8 7 -6 q -1 7 -7 6`} fill="#35B885" stroke="#128B62" strokeWidth={0.9} {...g} />
          </G>
        );
        break;
      case 'basil':
        out.push(
          <Path key={i} d={`M${cx - 4} ${top - 2} q -2 -8 5 -8 q 2 7 -5 8`} fill="#5FBF4B" stroke="#2C7A1E" strokeWidth={0.9} {...g} />
        );
        break;
      case 'rosemary':
        out.push(
          <G key={i}>
            <Line x1={cx + 5} y1={top - 9} x2={cx + 2} y2={surfaceY} stroke="#3E7A46" strokeWidth={1.1} {...g} />
            {[0, 1, 2, 3].map((k) => (
              <Line key={k} x1={cx + 4.4 - k * 0.7} y1={top - 7.5 + k * 2.4} x2={cx + 7.4 - k * 0.7} y2={top - 9 + k * 2.4}
                    stroke="#4E9257" strokeWidth={0.85} {...g} />
            ))}
          </G>
        );
        break;
      case 'coffeeBeans':
        out.push(
          <G key={i}>
            {[[-4, 0], [0, -1.6], [4, 0]].map(([dx, dy], k) => (
              <G key={k}>
                <Ellipse cx={cx + dx} cy={surfaceY + 1 + dy} rx={2.2} ry={1.5} fill="#3B2214" />
                <Line x1={cx + dx - 1.6} y1={surfaceY + 1 + dy} x2={cx + dx + 1.6} y2={surfaceY + 1 + dy}
                      stroke="#6B4326" strokeWidth={0.6} />
              </G>
            ))}
          </G>
        );
        break;
      case 'celery':
        out.push(
          <G key={i}>
            <Path d={`M${cx + 5} ${top - 12} L${cx + 3} ${surfaceY}`} stroke="#7FBF4B" strokeWidth={2.2} {...g} />
            <Path d={`M${cx + 5} ${top - 12} q -3 -3 -0.5 -5 q 3.5 1.5 0.5 5`} fill="#5FA232" />
          </G>
        );
        break;
      case 'cucumber':
        out.push(
          <G key={i}>
            <Ellipse cx={cx - 4} cy={top + 1} rx={2} ry={5} fill="#8FCF6A" stroke="#4E8A2E" strokeWidth={0.9} />
          </G>
        );
        break;
      case 'pineapple':
        out.push(
          <G key={i}>
            <Path d={`M${cx + rimHalf - 2} ${top - 3} l 4.5 -4.5 l 1.4 4.5 z`} fill="#F7CE4B" stroke="#C08D0C" strokeWidth={0.9} {...g} />
            <Path d={`M${cx + rimHalf + 2} ${top - 8} l 2 -5 l 2 5`} stroke="#3FA35C" strokeWidth={1.1} fill="none" {...g} />
          </G>
        );
        break;
      case 'umbrella':
        out.push(
          <G key={i}>
            <Line x1={cx - 7} y1={top - 12} x2={cx - 3} y2={surfaceY - 1} stroke="#C7AE86" strokeWidth={1} {...g} />
            <Path d={`M${cx - 13} ${top - 11} q 6 -7 12 0 z`} fill="#F04E6E" stroke="#A81E3C" strokeWidth={0.9} {...g} />
            <Path d={`M${cx - 9.4} ${top - 13.6} l 0 3.2 M${cx - 4.6} ${top - 12.6} l 0 2.2`} stroke="#FFE9B0" strokeWidth={0.8} />
          </G>
        );
        break;
      case 'straw':
        out.push(
          <Line key={i} x1={cx + 5} y1={top - 11} x2={cx - 2} y2={surfaceY + 4}
                stroke={tint} strokeWidth={2.2} {...g} />
        );
        break;
      case 'strawPair':
        out.push(
          <G key={i}>
            <Line x1={cx + 5} y1={top - 11} x2={cx - 2} y2={surfaceY + 4} stroke={tint} strokeWidth={2.1} {...g} />
            <Line x1={cx + 7.5} y1={top - 10} x2={cx + 0.5} y2={surfaceY + 4} stroke="#F2F5FA" strokeWidth={1.8} opacity={0.7} {...g} />
          </G>
        );
        break;
      case 'stirrer':
        out.push(
          <Line key={i} x1={cx + 4} y1={top - 9} x2={cx - 1} y2={surfaceY + 3} stroke="#D9DEE8" strokeWidth={1.2} {...g} />
        );
        break;
      case 'starAnise':
        out.push(
          <G key={i}>
            {[0, 1, 2, 3, 4].map((k) => {
              const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
              return <Line key={k} x1={cx} y1={surfaceY + 1} x2={cx + Math.cos(a) * 3.4} y2={surfaceY + 1 + Math.sin(a) * 3.4}
                           stroke="#8A5A2A" strokeWidth={1.4} {...g} />;
            })}
          </G>
        );
        break;
      case 'nutmeg':
        out.push(
          <G key={i} opacity={0.85}>
            {[[-4, 0], [-1, 1.4], [2, -0.6], [5, 1]].map(([dx, dy], k) => (
              <Circle key={k} cx={cx + dx} cy={surfaceY + 0.5 + dy} r={0.7} fill="#8A5A2A" />
            ))}
          </G>
        );
        break;
      case 'chilli':
        out.push(
          <Path key={i} d={`M${cx + 4} ${top - 6} q 5 2 2.5 7 q -3.5 -1 -2.5 -7`} fill="#E23A2E" stroke="#9A1710" strokeWidth={0.8} {...g} />
        );
        break;
      case 'flag':
        out.push(
          <G key={i}>
            <Line x1={cx + 4} y1={top - 11} x2={cx + 4} y2={surfaceY} stroke="#D9DEE8" strokeWidth={1} {...g} />
            <Path d={`M${cx + 4} ${top - 11} l 6 2 l -6 2 z`} fill="#F0C33C" />
          </G>
        );
        break;
      default:
        break;
    }
  });
  return <>{out}</>;
}

/* ------------------------------------------------------------------ glyph */

export interface DrinkGlyphProps {
  drink: Drink | { art: DrinkArt };
  size?: number;
  /** The outline colour. Defaults to a soft glass edge. */
  stroke?: string;
  /** Skips ice, garnish and rim — for the smallest sizes where they'd be mush. */
  simple?: boolean;
}

export function DrinkGlyph({ drink, size = 28, stroke = 'rgba(226,235,248,0.75)', simple }: DrinkGlyphProps) {
  const art = drink.art;
  const glass = GLASSES[art.glass] ?? GLASSES.rocks;
  const { cavity } = glass;
  const id = React.useId();

  const s: Stroke = {
    stroke,
    strokeWidth: 1.5,
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  const fill = art.fill ?? 0.6;
  const depth = cavity.bottom - cavity.top;
  const surfaceY = cavity.bottom - depth * fill;
  const showDetail = !simple && size >= 22;
  const opaque = glass.opaque;

  return (
    <View style={{ width: size, height: size * (H / W) }}>
      <Svg width={size} height={size * (H / W)} viewBox={`0 0 ${W} ${H}`} style={{ position: 'relative' }}>
        <Defs>
          <ClipPath id={`c${id}`}>
            <Path d={cavity.path} />
          </ClipPath>
          <LinearGradient id={`l${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={art.liquid[0]} />
            <Stop offset="1" stopColor={art.liquid[1]} />
          </LinearGradient>
          <LinearGradient id={`m${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#C98A4E" />
            <Stop offset="0.5" stopColor="#8A5124" />
            <Stop offset="1" stopColor="#5C3213" />
          </LinearGradient>
          <RadialGradient id={`s${id}`} cx="30%" cy="18%" r="70%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.24} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {glass.behind?.(s)}

        <G clipPath={`url(#c${id})`}>
          {/* Empty glass has to read as glass. Without this the space above the
              liquid is a hole in the card, and every rocks glass looks like a
              dark box with something at the bottom of it. */}
          <Rect x={0} y={0} width={W} height={H} fill="#FFFFFF" opacity={0.055} />
          {opaque ? (
            /* Metal and ceramic: you cannot see through a copper mug or a tiki
               carving, so the vessel itself is the colour. */
            <Rect x={0} y={0} width={W} height={H} fill={`url(#m${id})`} />
          ) : (
            <>
              <Rect x={0} y={surfaceY} width={W} height={cavity.bottom - surfaceY + 2} fill={`url(#l${id})`} />
              {art.layers?.map((layer, i) => {
                const y = cavity.bottom - depth * fill * layer.at;
                const next = art.layers?.[i + 1];
                const yNext = next ? cavity.bottom - depth * fill * next.at : surfaceY;
                return (
                  <Rect key={i} x={0} y={yNext} width={W} height={Math.max(0, y - yNext)} fill={layer.color} opacity={0.92} />
                );
              })}
              {showDetail && art.ice === 'cubes' ? (
                <G opacity={0.38}>
                  <Rect x={cavity.cx - 6.5} y={surfaceY - 1.5} width={6} height={6} rx={1.4} fill="#FFFFFF" />
                  <Rect x={cavity.cx + 0.5} y={surfaceY + 2.5} width={5.4} height={5.4} rx={1.3} fill="#FFFFFF" />
                  <Rect x={cavity.cx - 3} y={surfaceY + 6.5} width={4.6} height={4.6} rx={1.2} fill="#FFFFFF" />
                </G>
              ) : null}
              {showDetail && art.ice === 'crushed' ? (
                <G opacity={0.36}>
                  {[[-6, -1], [-1, 2], [4, -1.5], [1, 6], [-5, 5], [3, 3]].map(([dx, dy], i) => (
                    <Rect key={i} x={cavity.cx + dx} y={surfaceY + dy} width={3.2} height={3.2} rx={0.9} fill="#FFFFFF" />
                  ))}
                </G>
              ) : null}
              {showDetail && art.ice === 'sphere' ? (
                <Circle cx={cavity.cx} cy={surfaceY + 4} r={5.4} fill="#FFFFFF" opacity={0.26} />
              ) : null}
              {/* the head sits on the liquid, not above it, and it is foam —
                  a hard-edged bar reads as a stripe of paint */}
              {art.head ? (
                <G>
                  <Rect x={0} y={surfaceY - 4} width={W} height={5} fill={art.head} opacity={0.95} />
                  <Ellipse cx={cavity.cx} cy={surfaceY - 4} rx={cavity.rimHalf + 2} ry={2.4} fill={art.head} />
                </G>
              ) : null}
            </>
          )}
          <Rect x={0} y={0} width={W} height={H} fill={`url(#s${id})`} />
        </G>

        {glass.front(s)}

        {showDetail && art.rim ? (
          <Line
            x1={cavity.cx - cavity.rimHalf - 1}
            y1={cavity.top - 1.5}
            x2={cavity.cx + cavity.rimHalf + 1}
            y2={cavity.top - 1.5}
            stroke={art.rim === 'salt' ? '#FFFFFF' : '#F3D98A'}
            strokeWidth={2.6}
            strokeLinecap="round"
            opacity={0.85}
          />
        ) : null}

        {showDetail && art.garnish?.includes('foam') ? (
          <Ellipse cx={cavity.cx} cy={surfaceY} rx={cavity.rimHalf - 1} ry={2} fill="#FFF7E4" opacity={0.9} />
        ) : null}
        {showDetail && art.garnish?.includes('cream') ? (
          <Ellipse cx={cavity.cx} cy={surfaceY + 0.5} rx={cavity.rimHalf - 1.4} ry={2.6} fill="#F6E9D2" />
        ) : null}

        {showDetail && art.garnish ? (
          <Garnishes list={art.garnish} cavity={cavity} surfaceY={surfaceY} tint={art.liquid[0]} />
        ) : null}
      </Svg>
    </View>
  );
}
