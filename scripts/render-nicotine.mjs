/**
 * Renders the nicotine pictograms to a PNG contact sheet, so they can be looked
 * at rather than assumed.
 *
 * Written because they were assumed once. `asDrink` passed `fill: 0` and every
 * pouch drew as the same empty outline; the types were fine, the tests were
 * green, and the one thing that would have shown it was a picture.
 *
 *   node scripts/render-nicotine.mjs   →  /tmp/nicotine.png
 */
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

execSync(
  'npx esbuild src/domain/nicotine.ts --bundle --format=esm --platform=neutral --outfile=/tmp/nicotine.mjs',
  { stdio: 'inherit' }
);
const { NICOTINE_PRODUCTS, asDrink } = await import('/tmp/nicotine.mjs');

/**
 * The glass silhouettes, transcribed from `src/ui/DrinkGlyph.tsx`.
 *
 * A transcription is a second copy and can drift, so the point of this script
 * is the eyeball rather than the assertion — it answers "does a Killa read
 * black and a ZYN read white", which no test does.
 */
const SHAPES = {
  pouch: {
    cavity: 'M6 30 Q6 20 16 20 L28 20 Q38 20 38 30 Q38 40 28 40 L16 40 Q6 40 6 30 Z',
    front: `<path d="M6 30 Q6 20 16 20 L28 20 Q38 20 38 30 Q38 40 28 40 L16 40 Q6 40 6 30 Z"/>
            <path d="M10 30 Q22 27.5 34 30" stroke-width="1" opacity="0.5"/>
            <path d="M13 22 Q11.5 30 13 38" stroke-width="0.9" opacity="0.35"/>
            <path d="M31 22 Q32.5 30 31 38" stroke-width="0.9" opacity="0.35"/>`,
  },
  rolled: {
    cavity: 'M22 28 L22 28 Z', opaque: true,
    front: `<path d="M10 43 L30.5 22.5" stroke-width="3.4" stroke-linecap="round"/>
            <path d="M30.5 22.5 L34 19" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M35.5 16 Q32.5 13 35 10" stroke-width="1.3" opacity="0.5"/>`,
  },
  heatstickWide: {
    cavity: 'M12 22 Q12 19.5 14.5 19.5 L29.5 19.5 Q32 19.5 32 22 L32 46 Q32 49 29 49 L15 49 Q12 49 12 46 Z',
    front: `<path d="M12 22 Q12 19.5 14.5 19.5 L29.5 19.5 Q32 19.5 32 22 L32 46 Q32 49 29 49 L15 49 Q12 49 12 46 Z"/>
            <path d="M19.5 19.5 L19.5 12 L24.5 12 L24.5 19.5"/>
            <line x1="13.5" y1="27" x2="30.5" y2="27" stroke-width="1" opacity="0.5"/>`,
  },
  pack: {
    cavity: 'M13 18 L31 18 L31 50 Q31 51.5 29.5 51.5 L14.5 51.5 Q13 51.5 13 50 Z',
    front: `<path d="M17.5 12 L17.5 18 M24 9.5 L24 18" stroke-width="3.4" stroke-linecap="round"/>
            <path d="M13 18 L31 18 L31 50 Q31 51.5 29.5 51.5 L14.5 51.5 Q13 51.5 13 50 Z"/>
            <line x1="13.4" y1="25" x2="30.6" y2="25" stroke-width="1" opacity="0.6"/>`,
  },
  heatstick: {
    cavity: 'M16 26 L28 26 Q29.5 26 29.5 27.5 L29.5 48 Q29.5 50 27.5 50 L16.5 50 Q14.5 50 14.5 48 L14.5 27.5 Q14.5 26 16 26 Z',
    front: `<path d="M19 7 L25 7 L25 26 L19 26 Z"/>
            <line x1="19.4" y1="13" x2="24.6" y2="13" stroke-width="0.9" opacity="0.5"/>
            <path d="M16 26 L28 26 Q29.5 26 29.5 27.5 L29.5 48 Q29.5 50 27.5 50 L16.5 50 Q14.5 50 14.5 48 L14.5 27.5 Q14.5 26 16 26 Z"/>
            <line x1="17.5" y1="44" x2="26.5" y2="44" stroke-width="1" opacity="0.5"/>`,
  },
  cigarette: {
    cavity: 'M22 28 L22 28 Z',
    opaque: true,
    front: `<path d="M9 44 L33 20" stroke-width="5" stroke-linecap="round"/>
            <path d="M9 44 L15.5 37.5" stroke-width="5" stroke-linecap="round" opacity="0.45"/>
            <path d="M34.5 17 Q31 13.5 34 10.5 Q37 7.5 33.5 4.5" stroke-width="1.4" opacity="0.55"/>`,
  },
  vape: {
    cavity: 'M22 28 L22 28 Z',
    opaque: true,
    front: `<path d="M16 14 L28 14 Q30 14 30 16.5 L30 45 Q30 48 27 48 L17 48 Q14 48 14 45 L14 16.5 Q14 14 16 14 Z"/>
            <path d="M19 14 L19 10 Q19 8.5 20.5 8.5 L23.5 8.5 Q25 8.5 25 10 L25 14"/>
            <line x1="18" y1="40" x2="26" y2="40" stroke-width="1" opacity="0.5"/>`,
  },
};

const tile = (p, i) => {
  const art = asDrink(p).art;
  const shape = SHAPES[art.glass];
  if (!shape) return `<text x="0" y="20" fill="red">no shape: ${art.glass}</text>`;
  const id = `g${i}`;
  const body = shape.opaque
    ? ''
    : `<g clip-path="url(#c${id})"><rect x="0" y="0" width="44" height="56" fill="url(#l${id})"/></g>`;
  return `
    <svg x="${(i % 8) * 90 + 12}" y="${Math.floor(i / 8) * 116 + 12}" width="70" height="89" viewBox="0 0 44 56">
      <defs>
        <clipPath id="c${id}"><path d="${shape.cavity}"/></clipPath>
        <linearGradient id="l${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${art.liquid[0]}"/>
          <stop offset="1" stop-color="${art.liquid[1]}"/>
        </linearGradient>
      </defs>
      ${body}
      <g stroke="#EBEBF5" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${shape.front}
      </g>
    </svg>
    <text x="${(i % 8) * 90 + 47}" y="${Math.floor(i / 8) * 116 + 112}" fill="#8E8E93"
          font-family="sans-serif" font-size="9" text-anchor="middle">${p.name}</text>`;
};

const rows = Math.ceil(NICOTINE_PRODUCTS.length / 8);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="740" height="${rows * 116 + 24}">
  <rect width="100%" height="100%" fill="#0B0D12"/>
  ${NICOTINE_PRODUCTS.map(tile).join('\n')}
</svg>`;

writeFileSync('/tmp/nicotine.svg', svg);
console.log(`${NICOTINE_PRODUCTS.length} products, ${rows} rows → /tmp/nicotine.svg`);
