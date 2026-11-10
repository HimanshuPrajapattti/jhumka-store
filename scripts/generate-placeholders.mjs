/**
 * Generates the seed/placeholder jhumka artwork in public/products/.
 * Run once: node scripts/generate-placeholders.mjs
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "products");

const PALETTES = {
  gold: {
    bg1: "#fbf5e9",
    bg2: "#f1e3c4",
    m1: "#9c7531",
    m2: "#dcbb76",
    m3: "#7a5a22",
    glow: "#e8c98a",
    word: "#4b0f1f",
    caption: "#8a6a3d",
  },
  maroon: {
    bg1: "#fdf1ee",
    bg2: "#f3d8d4",
    m1: "#571324",
    m2: "#a8455a",
    m3: "#3d0c18",
    glow: "#d98fa0",
    word: "#4b0f1f",
    caption: "#96505f",
  },
  pearl: {
    bg1: "#f9f6f0",
    bg2: "#e9e2d5",
    m1: "#a08e6d",
    m2: "#e8dcc4",
    m3: "#7c6c50",
    glow: "#efe6d2",
    word: "#3f3223",
    caption: "#8f7f62",
  },
  emerald: {
    bg1: "#eff6f0",
    bg2: "#d5e7da",
    m1: "#1e6b4d",
    m2: "#57a582",
    m3: "#14513a",
    glow: "#8fc9ac",
    word: "#123f2f",
    caption: "#4e8a70",
  },
  rose: {
    bg1: "#fdf2f0",
    bg2: "#f6dcd7",
    m1: "#a44b60",
    m2: "#dd94a6",
    m3: "#7f3648",
    glow: "#eeb3c0",
    word: "#4b0f1f",
    caption: "#a05f70",
  },
};

function beads() {
  let out = "";
  for (let i = 0; i < 9; i++) {
    const x = 400 + (i - 4) * 28;
    const dist = Math.abs(i - 4);
    const len = 36 + (4 - dist) * 14;
    const y2 = 556 + len;
    out += `<line x1="${x}" y1="552" x2="${x}" y2="${y2 - 8}" stroke="url(#metal)" stroke-width="4" stroke-linecap="round"/>`;
    if (dist === 0) {
      // centre teardrop
      out += `<path d="M${x} ${y2 + 16} Q${x + 11} ${y2 + 2} ${x} ${y2 - 14} Q${x - 11} ${y2 + 2} ${x} ${y2 + 16} Z" fill="url(#metal)"/>`;
    } else {
      out += `<circle cx="${x}" cy="${y2}" r="${dist === 4 ? 7 : 9}" fill="url(#metal)"/>`;
    }
  }
  return out;
}

function svg(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="Illustrated jhumka earring">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.bg1}"/>
      <stop offset="1" stop-color="${p.bg2}"/>
    </linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.m1}"/>
      <stop offset="0.45" stop-color="${p.m2}"/>
      <stop offset="1" stop-color="${p.m3}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.45" r="0.55">
      <stop offset="0" stop-color="${p.glow}" stop-opacity="0.75"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="46" height="46" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="2.2" fill="${p.m2}" opacity="0.35"/>
    </pattern>
  </defs>

  <rect width="800" height="1000" fill="url(#bg)"/>
  <rect width="800" height="1000" fill="url(#dots)"/>
  <circle cx="400" cy="440" r="310" fill="url(#glow)"/>

  <!-- arch frame -->
  <path d="M168 905 V430 A232 232 0 0 1 632 430 V905" fill="none" stroke="${p.m2}" stroke-width="2.5" opacity="0.55"/>

  <!-- earring -->
  <g>
    <!-- ear hook -->
    <path d="M400 168 a30 30 0 1 1 -0.2 0" fill="none" stroke="url(#metal)" stroke-width="9"/>
    <line x1="400" y1="226" x2="400" y2="258" stroke="url(#metal)" stroke-width="7" stroke-linecap="round"/>

    <!-- stud -->
    <circle cx="400" cy="286" r="26" fill="url(#metal)"/>
    <circle cx="400" cy="286" r="10" fill="${p.bg1}"/>

    <!-- dome -->
    <path d="M400 314 C 320 314 264 390 264 468 C 264 498 270 518 276 534 L 524 534 C 530 518 536 498 536 468 C 536 390 480 314 400 314 Z" fill="url(#metal)"/>
    <path d="M318 470 Q400 424 482 470" fill="none" stroke="${p.bg1}" stroke-width="5" opacity="0.55"/>
    <path d="M334 506 Q400 470 466 506" fill="none" stroke="${p.bg1}" stroke-width="4" opacity="0.4"/>
    <circle cx="400" cy="398" r="14" fill="${p.bg1}" opacity="0.85"/>

    <!-- rim -->
    <ellipse cx="400" cy="540" rx="134" ry="16" fill="${p.m1}"/>
    <ellipse cx="400" cy="536" rx="134" ry="14" fill="url(#metal)"/>

    ${beads()}
  </g>

  <!-- wordmark -->
  <text x="400" y="868" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="56" letter-spacing="30" fill="${p.word}">AVRANI</text>
  <text x="400" y="906" text-anchor="middle" font-family="Georgia, serif" font-size="17" letter-spacing="9" fill="${p.caption}">HANDCRAFTED JHUMKA</text>
</svg>
`;
}

fs.mkdirSync(OUT, { recursive: true });
for (const [name, palette] of Object.entries(PALETTES)) {
  const file = path.join(OUT, `jhumka-${name}.svg`);
  fs.writeFileSync(file, svg(palette), "utf8");
  console.log("wrote", file);
}
