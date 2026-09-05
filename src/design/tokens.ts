/**
 * ROUNDS design tokens.
 *
 * Source of truth: Figma file 2W9WyKYM8RMv1k2gZbZ11s, page `01 · Foundations`.
 * Product code references the SEMANTIC names only — never a raw hex.
 *
 * The two rules that govern everything here:
 *   LAYERS — Liquid Glass belongs to the FUNCTIONAL layer only (tab bar, toolbars,
 *            floating buttons, sheets). The CONTENT layer uses solid surface/primary
 *            cards. Never glass on glass; never glass on a card.
 *   LIGHT  — depth comes from three sources, in this order: (1) large aurora blooms on
 *            the screen background, (2) smaller blooms clipped INSIDE cards, (3) a Card
 *            Sheen overlay giving every card one top-left highlight.
 */

/* ------------------------------------------------------------------ colour */

export const color = {
  /* content layer */
  bg: {
    canvas: '#06070B',
    elevated: '#0E1017',
  },
  surface: {
    primary: '#151A24',
    secondary: '#1C2230',
    tertiary: '#262E3D',
  },

  /* labels — opacity carries hierarchy, never a different hue */
  label: {
    primary: '#FFFFFF',
    secondary: 'rgba(235,235,245,0.60)',
    tertiary: 'rgba(235,235,245,0.30)',
    quaternary: 'rgba(235,235,245,0.18)',
  },
  separator: 'rgba(255,255,255,0.09)',

  /* brand + semantic */
  brand: {
    tint: '#3B82F6',
    tintDeep: '#1D4ED8',
    tintLight: '#7CB3FF',
  },
  pace: {
    easy: '#7CB3FF',
    steady: '#30D158',
    quick: '#FF9F0A',
    slowDown: '#FF453A',
  },
  safety: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',

  /* one accent per night, so history has colour */
  night: ['#3B82F6', '#8B5CF6', '#F43F5E', '#FB923C'] as const,

  /* glass recipe parts (functional layer only) */
  glass: {
    fillFrom: 'rgba(255,255,255,0.17)',
    fillTo: 'rgba(255,255,255,0.06)',
    rimFrom: 'rgba(255,255,255,0.34)',
    rimTo: 'rgba(255,255,255,0.06)',
    innerHighlight: 'rgba(255,255,255,0.30)',
    innerShade: 'rgba(0,0,0,0.35)',
  },

  /* card recipe parts (content layer) */
  card: {
    rim: 'rgba(255,255,255,0.08)',
    sheenFrom: 'rgba(255,255,255,0.075)',
    sheenTo: 'rgba(255,255,255,0)',
  },

  transparent: 'transparent',
} as const;

/** Gradient paint styles. Each is [from, to] unless noted. */
export const gradient = {
  auroraBlue: ['rgba(59,130,246,0.55)', 'rgba(59,130,246,0.00)'],
  auroraViolet: ['rgba(139,92,246,0.45)', 'rgba(139,92,246,0.00)'],
  auroraWarm: ['rgba(251,146,60,0.40)', 'rgba(244,63,94,0.00)'],
  tintPrimary: ['#3B82F6', '#1D4ED8'],
  paceSteady: ['#30D158', '#0B8F36'],
  paceQuick: ['#FF9F0A', '#C2680A'],
  paceSlowDown: ['#FF453A', '#B3261E'],
  paceEasy: ['#7CB3FF', '#3B82F6'],
  glassFill: [color.glass.fillFrom, color.glass.fillTo],
  glassRim: [color.glass.rimFrom, color.glass.rimTo],
  cardSheen: [color.card.sheenFrom, color.card.sheenTo],
} as const;

/* --------------------------------------------------------------- geometry */

/** Spacing 2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 32 · 40 */
export const space = {
  xxs: 2,
  xs: 4,
  s: 6,
  sm: 8,
  m: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

/** Radii control 14 · button 20 · card 22 · card-lg 26 · sheet 44 · device 55 */
export const radius = {
  control: 14,
  button: 20,
  card: 22,
  cardLg: 26,
  sheet: 44,
  device: 55,
  capsule: 999,
} as const;

export const geometry = {
  screenMargin: 16,
  minTouch: 44,
  frame: { width: 402, height: 874 },
  safeArea: { top: 62, bottom: 34 },
  tabBar: { width: 370, height: 62, inset: 16, aboveSafeArea: 46 },
  fab: { size: 60, raise: 14, bloom: 140 },
  /** Corner smoothing 0.6 on every rounded shape (iOS `.continuous`). */
  cornerSmoothing: 0.6,
} as const;

/** Inner radius = outer radius − padding. */
export const innerRadius = (outer: number, padding: number) => Math.max(0, outer - padding);

/* ------------------------------------------------------------------- type */

/**
 * SF Pro ships in production; the ramp below is named after the iOS ramp so the
 * mapping is one-to-one. Barlow Condensed SemiBold is bundled and used ONLY for
 * the `numeric` styles.
 */
export const font = {
  body: undefined as string | undefined, // system: SF Pro on iOS, Roboto on Android
  numeric: 'BarlowCondensed-SemiBold',
} as const;

type TextStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight:
    | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  letterSpacing?: number;
  fontFamily?: string;
  textTransform?: 'uppercase';
};

export const type: Record<string, TextStyle> = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: 0.37 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: 0.36 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: 0.35 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600', letterSpacing: 0.38 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.41 },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400', letterSpacing: -0.41 },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400', letterSpacing: -0.32 },
  subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400', letterSpacing: -0.24 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400', letterSpacing: -0.08 },
  caption1: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  caption2: { fontSize: 11, lineHeight: 13, fontWeight: '400', letterSpacing: 0.07 },
  sectionHeader: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  /** Barlow Condensed SemiBold — numeric + pace state word only. */
  numericPace: { fontSize: 44, lineHeight: 46, fontWeight: '600', letterSpacing: 1.2 },
  numericLarge: { fontSize: 40, lineHeight: 42, fontWeight: '600', letterSpacing: 0.4 },
  numericMedium: { fontSize: 28, lineHeight: 30, fontWeight: '600' },
  numericSmall: { fontSize: 20, lineHeight: 22, fontWeight: '600' },
};

/* ------------------------------------------------------------------ light */

/**
 * Glow/Primary is two stacked shadows: a tight bright core (blur 22) and a wide
 * soft halo (blur 44). React Native gets one shadow per view, so a glow is two
 * nested views — see `<Glow>`.
 */
export const glow = {
  core: { radius: 22, opacity: 0.55 },
  halo: { radius: 44, opacity: 0.35 },
} as const;

export const elevation = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  glass: {
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
} as const;

export const motion = {
  fast: 160,
  base: 240,
  slow: 420,
  /** A celebration is allowed to take its time; nothing else is. */
  celebrate: 900,
  /** Delay between successive items in a staggered entrance. */
  stagger: 45,
  /**
   * Springs, expressed the way `Animated.spring` wants them. `settle` is the
   * default for anything that moves under a finger; `pop` overshoots slightly
   * and is reserved for a thing appearing; `gentle` never overshoots and is
   * what numbers and rings use, because a bouncing figure reads as broken.
   */
  spring: {
    settle: { damping: 26, stiffness: 240, mass: 1 },
    pop: { damping: 15, stiffness: 300, mass: 0.9 },
    gentle: { damping: 40, stiffness: 180, mass: 1 },
  },
  /** Every animation must have a Reduce Motion fallback; see `useReduceMotion`. */
} as const;

export const blur = {
  glass: 44,
  sheet: 60,
} as const;

export type NightAccent = (typeof color.night)[number];
export type PaceState = 'easy' | 'steady' | 'quick' | 'slow_down';

export const paceColor: Record<PaceState, string> = {
  easy: color.pace.easy,
  steady: color.pace.steady,
  quick: color.pace.quick,
  slow_down: color.pace.slowDown,
};

export const paceGradient: Record<PaceState, readonly [string, string]> = {
  easy: gradient.paceEasy,
  steady: gradient.paceSteady,
  quick: gradient.paceQuick,
  slow_down: gradient.paceSlowDown,
};

/** The state word is the primary readout. Never lead with the ‰ number. */
export const paceWord: Record<PaceState, string> = {
  easy: 'EASY',
  steady: 'STEADY',
  quick: 'QUICK',
  slow_down: 'SLOW DOWN',
};
