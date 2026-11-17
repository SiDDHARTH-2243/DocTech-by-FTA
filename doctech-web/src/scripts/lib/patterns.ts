// Scalable pure-CSS background pattern registry. Each pattern is parametric on
// PatternParams so the same definitions power the grid (defaults) and the modal
// (live params). Add a new entry here and it appears in the grid + filter.

export interface PatternParams {
  color: string;    // primary pattern color (#rrggbb)
  bgColor: string;  // background color (#rrggbb)
  size: number;     // tile size in px
  opacity: number;  // 0–1 pattern opacity
}

export const DEFAULT_PARAMS: PatternParams = {
  color: "#f97316",
  bgColor: "#ffffff",
  size: 24,
  opacity: 1,
};

export const CATEGORIES = [
  "All",
  "Dots",
  "Lines",
  "Stripes",
  "Grid",
  "Geometric",
  "Waves",
  "Organic",
  "3D & Depth",
  "Gradients",
  "Noise & Texture",
  "Classic",
  "Playful",
] as const;

export type PatternCategory = (typeof CATEGORIES)[number];

export interface PatternDef {
  id: string;
  name: string;
  category: PatternCategory;
  /** Build inline CSS properties for this pattern. */
  build: (p: PatternParams) => PatternCSS;
}

export interface PatternCSS {
  backgroundColor: string;
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
/** Hex → rgba with given alpha. */
function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ═════════════════════════════════════════════════════════════════════════════
// PATTERN DEFINITIONS — 80+ pure-CSS patterns
// ═════════════════════════════════════════════════════════════════════════════

export const PATTERNS: PatternDef[] = [

  // ── DOTS (10) ─────────────────────────────────────────────────────────────
  {
    id: "polka-dots", name: "Polka Dots", category: "Dots",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o)} 2px, transparent 2px)`,
      backgroundSize: `${s}px ${s}px`,
    }),
  },
  {
    id: "micro-dots", name: "Micro Dots", category: "Dots",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o)} 1px, transparent 1px)`,
      backgroundSize: `${Math.max(6, s * 0.5)}px ${Math.max(6, s * 0.5)}px`,
    }),
  },
  {
    id: "offset-dots", name: "Offset Dots", category: "Dots",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o)} 2px, transparent 2px), radial-gradient(${rgba(c, o)} 2px, transparent 2px)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, ${s / 2}px ${s / 2}px`,
    }),
  },
  {
    id: "dot-matrix", name: "Dot Matrix", category: "Dots",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o)} 1.5px, transparent 1.5px)`,
      backgroundSize: `${Math.max(8, s * 0.4)}px ${Math.max(8, s * 0.4)}px`,
    }),
  },
  {
    id: "halftone", name: "Halftone", category: "Dots",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o)} 2.5px, transparent 2.5px), radial-gradient(${rgba(c, o)} 2.5px, transparent 2.5px)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, ${s / 2}px ${s / 2}px`,
    }),
  },
  {
    id: "diamond-dots", name: "Diamond Dots", category: "Dots",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o)} 2px, transparent 2px), radial-gradient(${rgba(c, o)} 2px, transparent 2px)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, ${s / 2}px ${s / 2}px`,
    }),
  },
  {
    id: "scattered-dots", name: "Scattered Dots", category: "Dots",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o)} 1px, transparent 1px), radial-gradient(${rgba(c, o * 0.6)} 1.5px, transparent 1.5px), radial-gradient(${rgba(c, o * 0.3)} 2px, transparent 2px)`,
      backgroundSize: `${s}px ${s}px, ${s * 1.3}px ${s * 1.3}px, ${s * 1.7}px ${s * 1.7}px`,
      backgroundPosition: `0 0, ${s * 0.4}px ${s * 0.2}px, ${s * 0.1}px ${s * 0.6}px`,
    }),
  },
  {
    id: "cross-dots", name: "Cross Dots", category: "Dots",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o)} 2px, transparent 2px), radial-gradient(${rgba(c, o)} 2px, transparent 2px)`,
      backgroundSize: `${s}px ${s}px, ${s}px ${s}px`,
      backgroundPosition: `0 0, ${s / 2}px ${s / 2}px`,
    }),
  },
  {
    id: "hollow-dots", name: "Hollow Dots", category: "Dots",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(circle, transparent 3px, ${rgba(c, o)} 3px, ${rgba(c, o)} 4.5px, transparent 4.5px)`,
      backgroundSize: `${s}px ${s}px`,
    }),
  },
  {
    id: "big-dots", name: "Big Dots", category: "Dots",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o)} ${s * 0.18}px, transparent ${s * 0.18}px)`,
      backgroundSize: `${s}px ${s}px`,
    }),
  },

  // ── LINES (10) ────────────────────────────────────────────────────────────
  {
    id: "horizontal-lines", name: "Horizontal Lines", category: "Lines",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(0deg, ${rgba(c, o)} 1px, transparent 1px)`,
      backgroundSize: `100% ${s}px`,
    }),
  },
  {
    id: "vertical-lines", name: "Vertical Lines", category: "Lines",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(90deg, ${rgba(c, o)} 1px, transparent 1px)`,
      backgroundSize: `${s}px 100%`,
    }),
  },
  {
    id: "diagonal-45", name: "Diagonal 45°", category: "Lines",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(45deg, ${rgba(c, o)} 0, ${rgba(c, o)} 1px, transparent 1px, transparent ${s / 2}px)`,
      backgroundSize: `auto`,
    }),
  },
  {
    id: "diagonal-135", name: "Diagonal 135°", category: "Lines",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(135deg, ${rgba(c, o)} 0, ${rgba(c, o)} 1px, transparent 1px, transparent ${s / 2}px)`,
      backgroundSize: `auto`,
    }),
  },
  {
    id: "thin-pinstripes", name: "Thin Pinstripes", category: "Lines",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(90deg, ${rgba(c, o)} 0, ${rgba(c, o)} 1px, transparent 1px, transparent ${s}px)`,
      backgroundSize: `auto`,
    }),
  },
  {
    id: "thick-stripes", name: "Thick Lines", category: "Lines",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(0deg, ${rgba(c, o)} 3px, transparent 3px)`,
      backgroundSize: `100% ${s}px`,
    }),
  },
  {
    id: "dashed-lines", name: "Dashed Lines", category: "Lines",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(90deg, ${rgba(c, o)} 0, ${rgba(c, o)} ${s * 0.3}px, transparent ${s * 0.3}px, transparent ${s * 0.6}px)`,
      backgroundSize: `${s}px 1px`,
    }),
  },
  {
    id: "double-lines", name: "Double Lines", category: "Lines",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(0deg, ${rgba(c, o)} 1px, transparent 1px, transparent ${Math.max(3, s * 0.15)}px, ${rgba(c, o)} ${Math.max(3, s * 0.15)}px, ${rgba(c, o)} ${Math.max(4, s * 0.15 + 1)}px, transparent ${Math.max(4, s * 0.15 + 1)}px)`,
      backgroundSize: `100% ${s}px`,
    }),
  },
  {
    id: "ruled-paper", name: "Ruled Paper", category: "Lines",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(0deg, ${rgba(c, o * 0.3)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o)} 1px, transparent 1px)`,
      backgroundSize: `100% ${s}px, ${s * 4}px 100%`,
    }),
  },
  {
    id: "crosshair-lines", name: "Crosshair Lines", category: "Lines",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(45deg, ${rgba(c, o)} 0, ${rgba(c, o)} 1px, transparent 1px, transparent ${s / 2}px), repeating-linear-gradient(135deg, ${rgba(c, o)} 0, ${rgba(c, o)} 1px, transparent 1px, transparent ${s / 2}px)`,
      backgroundSize: `auto`,
    }),
  },

  // ── STRIPES (8) ───────────────────────────────────────────────────────────
  {
    id: "candy-stripes", name: "Candy Stripes", category: "Stripes",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(45deg, ${rgba(c, o)} 0, ${rgba(c, o)} ${s * 0.4}px, transparent ${s * 0.4}px, transparent ${s * 0.8}px)`,
      backgroundSize: `auto`,
    }),
  },
  {
    id: "barber-pole", name: "Barber Pole", category: "Stripes",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(-45deg, ${rgba(c, o)} 0, ${rgba(c, o)} ${s * 0.25}px, transparent ${s * 0.25}px, transparent ${s * 0.5}px)`,
      backgroundSize: `auto`,
    }),
  },
  {
    id: "gradient-stripes", name: "Gradient Stripes", category: "Stripes",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(90deg, ${rgba(c, o)} 50%, transparent 50%)`,
      backgroundSize: `${s}px 100%`,
    }),
  },
  {
    id: "pinstripes-v", name: "Vertical Pinstripes", category: "Stripes",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(90deg, ${rgba(c, o)} 0, ${rgba(c, o)} 2px, transparent 2px, transparent ${s}px)`,
      backgroundSize: `auto`,
    }),
  },
  {
    id: "wide-stripes", name: "Wide Stripes", category: "Stripes",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(0deg, ${rgba(c, o)} ${s * 0.4}px, transparent ${s * 0.4}px)`,
      backgroundSize: `100% ${s}px`,
    }),
  },
  {
    id: "uneven-stripes", name: "Uneven Stripes", category: "Stripes",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(90deg, ${rgba(c, o)} 2px, transparent 2px, transparent ${s * 0.3}px, ${rgba(c, o * 0.5)} ${s * 0.3}px, ${rgba(c, o * 0.5)} ${s * 0.3 + 1}px, transparent ${s * 0.3 + 1}px)`,
      backgroundSize: `${s}px 100%`,
    }),
  },
  {
    id: "diagonal-candy", name: "Diagonal Candy", category: "Stripes",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(60deg, ${rgba(c, o)} 0, ${rgba(c, o)} ${s * 0.3}px, transparent ${s * 0.3}px, transparent ${s * 0.6}px)`,
      backgroundSize: `auto`,
    }),
  },
  {
    id: "zebra-stripes", name: "Zebra Stripes", category: "Stripes",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(45deg, ${rgba(c, o)} 0, ${rgba(c, o)} ${s * 0.5}px, transparent ${s * 0.5}px, transparent ${s}px)`,
      backgroundSize: `auto`,
    }),
  },

  // ── GRID (8) ──────────────────────────────────────────────────────────────
  {
    id: "square-grid", name: "Square Grid", category: "Grid",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(${rgba(c, o)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o)} 1px, transparent 1px)`,
      backgroundSize: `${s}px ${s}px`,
    }),
  },
  {
    id: "fine-grid", name: "Fine Grid", category: "Grid",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(${rgba(c, o * 0.4)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o * 0.4)} 1px, transparent 1px)`,
      backgroundSize: `${Math.max(6, s * 0.4)}px ${Math.max(6, s * 0.4)}px`,
    }),
  },
  {
    id: "graph-paper", name: "Graph Paper", category: "Grid",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(${rgba(c, o * 0.3)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o * 0.3)} 1px, transparent 1px), linear-gradient(${rgba(c, o)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o)} 1px, transparent 1px)`,
      backgroundSize: `${Math.max(6, s * 0.4)}px ${Math.max(6, s * 0.4)}px, ${Math.max(6, s * 0.4)}px ${Math.max(6, s * 0.4)}px, ${s}px ${s}px, ${s}px ${s}px`,
    }),
  },
  {
    id: "blueprint-grid", name: "Blueprint Grid", category: "Grid",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(${rgba(c, o * 0.2)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o * 0.2)} 1px, transparent 1px), linear-gradient(${rgba(c, o * 0.5)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o * 0.5)} 1px, transparent 1px)`,
      backgroundSize: `${Math.max(5, s * 0.2)}px ${Math.max(5, s * 0.2)}px, ${Math.max(5, s * 0.2)}px ${Math.max(5, s * 0.2)}px, ${s}px ${s}px, ${s}px ${s}px`,
    }),
  },
  {
    id: "dot-grid", name: "Dot Grid", category: "Grid",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(circle, ${rgba(c, o)} 1px, transparent 1px)`,
      backgroundSize: `${s}px ${s}px`,
    }),
  },
  {
    id: "cross-grid", name: "Cross Grid", category: "Grid",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(${rgba(c, o)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o)} 1px, transparent 1px), linear-gradient(${rgba(c, o)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o)} 1px, transparent 1px)`,
      backgroundSize: `${s}px ${s}px, ${s}px ${s}px, ${s}px ${s}px, ${s}px ${s}px`,
      backgroundPosition: `0 0, 0 0, ${s / 2}px 0, 0 ${s / 2}px`,
    }),
  },
  {
    id: "plaid", name: "Plaid", category: "Grid",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(0deg, ${rgba(c, o * 0.3)} 0, ${rgba(c, o * 0.3)} 2px, transparent 2px, transparent ${s / 2}px), repeating-linear-gradient(90deg, ${rgba(c, o * 0.3)} 0, ${rgba(c, o * 0.3)} 2px, transparent 2px, transparent ${s / 2}px), repeating-linear-gradient(0deg, ${rgba(c, o * 0.15)} 0, ${rgba(c, o * 0.15)} 1px, transparent 1px, transparent ${s / 4}px), repeating-linear-gradient(90deg, ${rgba(c, o * 0.15)} 0, ${rgba(c, o * 0.15)} 1px, transparent 1px, transparent ${s / 4}px)`,
      backgroundSize: `auto`,
    }),
  },
  {
    id: "tartan", name: "Tartan", category: "Grid",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(transparent, transparent ${s * 0.3}px, ${rgba(c, o * 0.2)} ${s * 0.3}px, ${rgba(c, o * 0.2)} ${s * 0.6}px), repeating-linear-gradient(90deg, transparent, transparent ${s * 0.3}px, ${rgba(c, o * 0.2)} ${s * 0.3}px, ${rgba(c, o * 0.2)} ${s * 0.6}px)`,
      backgroundSize: `${s}px ${s}px`,
    }),
  },

  // ── GEOMETRIC (12) ────────────────────────────────────────────────────────
  {
    id: "checkerboard", name: "Checkerboard", category: "Geometric",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(45deg, ${rgba(c, o)} 25%, transparent 25%), linear-gradient(-45deg, ${rgba(c, o)} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${rgba(c, o)} 75%), linear-gradient(-45deg, transparent 75%, ${rgba(c, o)} 75%)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, 0 ${s / 2}px, ${s / 2}px ${-s / 2}px, ${-s / 2}px 0px`,
    }),
  },
  {
    id: "diamonds", name: "Diamonds", category: "Geometric",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(45deg, ${rgba(c, o)} 25%, transparent 25%), linear-gradient(-45deg, ${rgba(c, o)} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${rgba(c, o)} 75%), linear-gradient(-45deg, transparent 75%, ${rgba(c, o)} 75%)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, 0 ${s / 2}px, ${s / 2}px -${s / 2}px, -${s / 2}px 0`,
    }),
  },
  {
    id: "hexagons", name: "Hexagons", category: "Geometric",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(30deg, ${rgba(c, o)} 12%, transparent 12.5%, transparent 87%, ${rgba(c, o)} 87.5%, ${rgba(c, o)}), linear-gradient(150deg, ${rgba(c, o)} 12%, transparent 12.5%, transparent 87%, ${rgba(c, o)} 87.5%, ${rgba(c, o)}), linear-gradient(30deg, ${rgba(c, o)} 12%, transparent 12.5%, transparent 87%, ${rgba(c, o)} 87.5%, ${rgba(c, o)}), linear-gradient(150deg, ${rgba(c, o)} 12%, transparent 12.5%, transparent 87%, ${rgba(c, o)} 87.5%, ${rgba(c, o)}), linear-gradient(60deg, ${rgba(c, o * 0.5)} 25%, transparent 25.5%, transparent 75%, ${rgba(c, o * 0.5)} 75%, ${rgba(c, o * 0.5)}), linear-gradient(60deg, ${rgba(c, o * 0.5)} 25%, transparent 25.5%, transparent 75%, ${rgba(c, o * 0.5)} 75%, ${rgba(c, o * 0.5)})`,
      backgroundSize: `${s * 2}px ${s * 1.73}px`,
      backgroundPosition: `0 0, 0 0, ${s}px ${s * 0.87}px, ${s}px ${s * 0.87}px, 0 0, ${s}px ${s * 0.87}px`,
    }),
  },
  {
    id: "triangles", name: "Triangles", category: "Geometric",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(45deg, ${rgba(c, o)} 50%, transparent 50%), linear-gradient(-45deg, ${rgba(c, o)} 50%, transparent 50%)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, ${s / 2}px 0`,
    }),
  },
  {
    id: "zigzag", name: "Zigzag", category: "Geometric",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(135deg, ${rgba(c, o)} 25%, transparent 25%), linear-gradient(225deg, ${rgba(c, o)} 25%, transparent 25%), linear-gradient(45deg, ${rgba(c, o)} 25%, transparent 25%), linear-gradient(315deg, ${rgba(c, o)} 25%, transparent 25%)`,
      backgroundSize: `${s}px ${s / 2}px`,
      backgroundPosition: `${s / 2}px 0, ${s / 2}px 0, 0 0, 0 0`,
    }),
  },
  {
    id: "chevrons", name: "Chevrons", category: "Geometric",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(135deg, ${rgba(c, o)} 25%, transparent 25%), linear-gradient(225deg, ${rgba(c, o)} 25%, transparent 25%)`,
      backgroundSize: `${s}px ${s / 2}px`,
      backgroundPosition: `0 0, ${s / 2}px 0`,
    }),
  },
  {
    id: "herringbone", name: "Herringbone", category: "Geometric",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(45deg, ${rgba(c, o)} 12%, transparent 12%, transparent 88%, ${rgba(c, o)} 88%), linear-gradient(135deg, ${rgba(c, o)} 12%, transparent 12%, transparent 88%, ${rgba(c, o)} 88%)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, ${s / 2}px ${s / 2}px`,
    }),
  },
  {
    id: "stars", name: "Stars", category: "Geometric",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(45deg, ${rgba(c, o)} 2px, transparent 2px), linear-gradient(-45deg, ${rgba(c, o)} 2px, transparent 2px), linear-gradient(0deg, ${rgba(c, o)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o)} 1px, transparent 1px)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, 0 0, ${s / 2}px 0, 0 ${s / 2}px`,
    }),
  },
  {
    id: "brick", name: "Brick Wall", category: "Geometric",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(${rgba(c, o)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o)} 1px, transparent 1px)`,
      backgroundSize: `${s}px ${s / 2}px, ${s}px ${s / 2}px, ${s}px ${s / 2}px`,
      backgroundPosition: `0 0, 0 0, ${s / 2}px ${s / 4}px`,
    }),
  },
  {
    id: "basket-weave", name: "Basket Weave", category: "Geometric",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(45deg, ${rgba(c, o * 0.4)} 25%, transparent 25%), linear-gradient(-45deg, ${rgba(c, o * 0.4)} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${rgba(c, o * 0.4)} 75%), linear-gradient(-45deg, transparent 75%, ${rgba(c, o * 0.4)} 75%)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, 0 ${s / 2}px, ${s / 2}px -${s / 2}px, -${s / 2}px 0`,
    }),
  },
  {
    id: "houndstooth", name: "Houndstooth", category: "Geometric",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(45deg, ${rgba(c, o)} 25%, transparent 25%, transparent 75%, ${rgba(c, o)} 75%), linear-gradient(45deg, ${rgba(c, o)} 25%, transparent 25%, transparent 75%, ${rgba(c, o)} 75%), linear-gradient(-45deg, ${rgba(c, o)} 25%, transparent 25%, transparent 75%, ${rgba(c, o)} 75%)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, ${s / 2}px ${s / 2}px, ${s / 2}px 0`,
    }),
  },
  {
    id: "argyle", name: "Argyle", category: "Geometric",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(120deg, ${rgba(c, o * 0.15)}, ${rgba(c, o * 0.15)} 1px, transparent 1px, transparent ${s / 2}px), repeating-linear-gradient(60deg, ${rgba(c, o * 0.15)}, ${rgba(c, o * 0.15)} 1px, transparent 1px, transparent ${s / 2}px), linear-gradient(60deg, ${rgba(c, o * 0.3)} 25%, transparent 25%, transparent 75%, ${rgba(c, o * 0.3)} 75%), linear-gradient(120deg, ${rgba(c, o * 0.3)} 25%, transparent 25%, transparent 75%, ${rgba(c, o * 0.3)} 75%)`,
      backgroundSize: `${s}px ${s * 1.73}px`,
    }),
  },

  // ── WAVES (7) ─────────────────────────────────────────────────────────────
  {
    id: "sine-wave", name: "Sine Wave", category: "Waves",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(ellipse at 50% 0%, transparent 65%, ${rgba(c, o)} 65.5%, ${rgba(c, o)} 68%, transparent 68.5%), radial-gradient(ellipse at 50% 100%, ${rgba(c, o)} 32%, transparent 32.5%)`,
      backgroundSize: `${s}px ${s * 0.6}px`,
    }),
  },
  {
    id: "wave-lines", name: "Wave Lines", category: "Waves",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(circle at 50% 0, transparent 60%, ${rgba(c, o)} 61%, ${rgba(c, o)} 63%, transparent 64%), radial-gradient(circle at 50% 100%, transparent 60%, ${rgba(c, o)} 61%, ${rgba(c, o)} 63%, transparent 64%)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, ${s / 2}px ${s / 2}px`,
    }),
  },
  {
    id: "scallops", name: "Scallops", category: "Waves",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(circle at 50% 0%, ${rgba(c, o)} ${s * 0.3}px, transparent ${s * 0.3}px)`,
      backgroundSize: `${s}px ${s * 0.5}px`,
    }),
  },
  {
    id: "fish-scales", name: "Fish Scales", category: "Waves",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(circle at 50% 0%, transparent ${s * 0.35}px, ${rgba(c, o)} ${s * 0.35}px, ${rgba(c, o)} ${s * 0.38}px, transparent ${s * 0.38}px), radial-gradient(circle at 50% 0%, transparent ${s * 0.35}px, ${rgba(c, o)} ${s * 0.35}px, ${rgba(c, o)} ${s * 0.38}px, transparent ${s * 0.38}px)`,
      backgroundSize: `${s}px ${s * 0.5}px`,
      backgroundPosition: `0 0, ${s / 2}px ${s * 0.25}px`,
    }),
  },
  {
    id: "ripple-pattern", name: "Ripple", category: "Waves",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(circle, ${rgba(c, o)} 1px, transparent 1px), radial-gradient(circle, ${rgba(c, o * 0.5)} 1px, transparent 1px)`,
      backgroundSize: `${s}px ${s}px, ${s * 0.5}px ${s * 0.5}px`,
    }),
  },
  {
    id: "concentric-circles", name: "Concentric Circles", category: "Waves",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(circle, transparent ${s * 0.25}px, ${rgba(c, o)} ${s * 0.25}px, ${rgba(c, o)} ${s * 0.27}px, transparent ${s * 0.27}px, transparent ${s * 0.4}px, ${rgba(c, o * 0.5)} ${s * 0.4}px, ${rgba(c, o * 0.5)} ${s * 0.42}px, transparent ${s * 0.42}px)`,
      backgroundSize: `${s}px ${s}px`,
    }),
  },
  {
    id: "ocean-waves", name: "Ocean Waves", category: "Waves",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(ellipse at 50% 0%, transparent 55%, ${rgba(c, o * 0.4)} 56%, ${rgba(c, o * 0.4)} 60%, transparent 61%), radial-gradient(ellipse at 50% 100%, transparent 55%, ${rgba(c, o * 0.6)} 56%, ${rgba(c, o * 0.6)} 60%, transparent 61%), radial-gradient(ellipse at 50% 0%, transparent 50%, ${rgba(c, o)} 51%, ${rgba(c, o)} 55%, transparent 56%)`,
      backgroundSize: `${s}px ${s * 0.7}px, ${s}px ${s * 0.7}px, ${s * 0.7}px ${s * 0.5}px`,
      backgroundPosition: `0 0, ${s / 2}px ${s * 0.35}px, 0 ${s * 0.15}px`,
    }),
  },

  // ── ORGANIC (7) ───────────────────────────────────────────────────────────
  {
    id: "carbon-fiber", name: "Carbon Fiber", category: "Organic",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o * 0.15)} 15%, transparent 16%), radial-gradient(${rgba(c, o * 0.15)} 15%, transparent 16%)`,
      backgroundSize: `${s * 0.5}px ${s * 0.5}px`,
      backgroundPosition: `0 0, ${s * 0.25}px ${s * 0.25}px`,
    }),
  },
  {
    id: "linen", name: "Linen Texture", category: "Organic",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(0deg, ${rgba(c, o * 0.08)} 50%, transparent 50%), linear-gradient(90deg, ${rgba(c, o * 0.08)} 50%, transparent 50%)`,
      backgroundSize: `${Math.max(4, s * 0.15)}px ${Math.max(4, s * 0.15)}px`,
    }),
  },
  {
    id: "paper-texture", name: "Paper Texture", category: "Organic",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(45deg, ${rgba(c, o * 0.03)} 25%, transparent 25%), linear-gradient(-45deg, ${rgba(c, o * 0.03)} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${rgba(c, o * 0.03)} 75%), linear-gradient(-45deg, transparent 75%, ${rgba(c, o * 0.03)} 75%)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, 0 ${s / 2}px, ${s / 2}px -${s / 2}px, -${s / 2}px 0`,
    }),
  },
  {
    id: "cross-hatch", name: "Cross Hatch", category: "Organic",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(45deg, ${rgba(c, o * 0.3)} 0, ${rgba(c, o * 0.3)} 1px, transparent 1px, transparent ${s / 2}px), repeating-linear-gradient(-45deg, ${rgba(c, o * 0.3)} 0, ${rgba(c, o * 0.3)} 1px, transparent 1px, transparent ${s / 2}px)`,
      backgroundSize: `auto`,
    }),
  },
  {
    id: "denim", name: "Denim", category: "Organic",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(45deg, ${rgba(c, o * 0.15)} 0, ${rgba(c, o * 0.15)} 1px, transparent 1px, transparent 3px), repeating-linear-gradient(-45deg, ${rgba(c, o * 0.1)} 0, ${rgba(c, o * 0.1)} 1px, transparent 1px, transparent 5px)`,
      backgroundSize: `auto`,
    }),
  },
  {
    id: "woven", name: "Woven Fabric", category: "Organic",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(45deg, ${rgba(c, o * 0.2)} 25%, transparent 25%), linear-gradient(-45deg, ${rgba(c, o * 0.2)} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${rgba(c, o * 0.2)} 75%), linear-gradient(-45deg, transparent 75%, ${rgba(c, o * 0.2)} 75%)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, 0 ${s / 2}px, ${s / 2}px -${s / 2}px, -${s / 2}px 0`,
    }),
  },
  {
    id: "wood-grain", name: "Wood Grain", category: "Organic",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(2deg, ${rgba(c, o * 0.06)} 0, ${rgba(c, o * 0.06)} 1px, transparent 1px, transparent ${Math.max(4, s * 0.15)}px), repeating-linear-gradient(0deg, ${rgba(c, o * 0.04)} 0, ${rgba(c, o * 0.04)} 1px, transparent 1px, transparent ${Math.max(6, s * 0.3)}px)`,
      backgroundSize: `auto`,
    }),
  },

  // ── 3D & DEPTH (6) ────────────────────────────────────────────────────────
  {
    id: "isometric-grid", name: "Isometric Grid", category: "3D & Depth",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(30deg, ${rgba(c, o)} 1px, transparent 1px), linear-gradient(150deg, ${rgba(c, o)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o)} 1px, transparent 1px)`,
      backgroundSize: `${s}px ${s * 0.87}px, ${s}px ${s * 0.87}px, ${s}px ${s * 0.87}px`,
    }),
  },
  {
    id: "cube-pattern", name: "Cubes", category: "3D & Depth",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(30deg, ${rgba(c, o * 0.3)} 12%, transparent 12.5%, transparent 87%, ${rgba(c, o * 0.3)} 87.5%), linear-gradient(150deg, ${rgba(c, o * 0.3)} 12%, transparent 12.5%, transparent 87%, ${rgba(c, o * 0.3)} 87.5%), linear-gradient(30deg, ${rgba(c, o * 0.3)} 12%, transparent 12.5%, transparent 87%, ${rgba(c, o * 0.3)} 87.5%), linear-gradient(150deg, ${rgba(c, o * 0.3)} 12%, transparent 12.5%, transparent 87%, ${rgba(c, o * 0.3)} 87.5%), linear-gradient(60deg, ${rgba(c, o * 0.15)} 25%, transparent 25.5%, transparent 75%, ${rgba(c, o * 0.15)} 75%, ${rgba(c, o * 0.15)}), linear-gradient(60deg, ${rgba(c, o * 0.15)} 25%, transparent 25.5%, transparent 75%, ${rgba(c, o * 0.15)} 75%, ${rgba(c, o * 0.15)})`,
      backgroundSize: `${s * 2}px ${s * 1.73}px`,
      backgroundPosition: `0 0, 0 0, ${s}px ${s * 0.87}px, ${s}px ${s * 0.87}px, 0 0, ${s}px ${s * 0.87}px`,
    }),
  },
  {
    id: "steps", name: "Steps", category: "3D & Depth",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(135deg, ${rgba(c, o)} 25%, transparent 25%), linear-gradient(225deg, ${rgba(c, o)} 25%, transparent 25%), linear-gradient(315deg, ${rgba(c, o)} 25%, transparent 25%), linear-gradient(45deg, ${rgba(c, o)} 25%, transparent 25%)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `${s * -0.5}px 0, ${s * -0.5}px 0, 0 0, 0 0`,
    }),
  },
  {
    id: "pyramid", name: "Pyramid", category: "3D & Depth",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(315deg, ${rgba(c, o)} 25%, transparent 25%), linear-gradient(45deg, ${rgba(c, o * 0.5)} 25%, transparent 25%), linear-gradient(135deg, ${rgba(c, o * 0.7)} 25%, transparent 25%), linear-gradient(225deg, ${rgba(c, o * 0.3)} 25%, transparent 25%)`,
      backgroundSize: `${s}px ${s}px`,
    }),
  },
  {
    id: "ridged", name: "Ridged", category: "3D & Depth",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(0deg, ${rgba(c, o * 0.2)} 0, ${rgba(c, o * 0.2)} 33%, ${rgba(c, o * 0.4)} 33%, ${rgba(c, o * 0.4)} 66%, ${rgba(c, o * 0.1)} 66%, ${rgba(c, o * 0.1)} 100%)`,
      backgroundSize: `100% ${s}px`,
    }),
  },
  {
    id: "layered-waves", name: "Layered Waves", category: "3D & Depth",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(ellipse at 50% 0%, transparent 50%, ${rgba(c, o * 0.15)} 51%, ${rgba(c, o * 0.15)} 55%, transparent 56%), radial-gradient(ellipse at 50% 0%, transparent 45%, ${rgba(c, o * 0.1)} 46%, ${rgba(c, o * 0.1)} 50%, transparent 51%)`,
      backgroundSize: `${s}px ${s * 0.5}px, ${s * 0.7}px ${s * 0.35}px`,
      backgroundPosition: `0 0, ${s * 0.15}px ${s * 0.1}px`,
    }),
  },

  // ── GRADIENTS (6) ─────────────────────────────────────────────────────────
  {
    id: "radial-burst", name: "Radial Burst", category: "Gradients",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(circle at 50% 50%, ${rgba(c, o)} 0%, transparent ${s * 0.5}px)`,
      backgroundSize: `${s}px ${s}px`,
    }),
  },
  {
    id: "sunburst", name: "Sunburst", category: "Gradients",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `conic-gradient(${rgba(c, o)} 0deg, transparent 30deg, transparent 60deg, ${rgba(c, o)} 60deg, transparent 90deg, transparent 120deg, ${rgba(c, o)} 120deg, transparent 150deg, transparent 180deg, ${rgba(c, o)} 180deg, transparent 210deg, transparent 240deg, ${rgba(c, o)} 240deg, transparent 270deg, transparent 300deg, ${rgba(c, o)} 300deg, transparent 330deg, transparent 360deg)`,
      backgroundSize: `${s * 4}px ${s * 4}px`,
    }),
  },
  {
    id: "conic-sweep", name: "Conic Sweep", category: "Gradients",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `conic-gradient(from 0deg, ${rgba(c, o)}, transparent, ${rgba(c, o)}, transparent, ${rgba(c, o)})`,
      backgroundSize: `${s * 2}px ${s * 2}px`,
    }),
  },
  {
    id: "gradient-mesh", name: "Gradient Mesh", category: "Gradients",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(at 0% 0%, ${rgba(c, o * 0.4)} 0, transparent 50%), radial-gradient(at 100% 0%, ${rgba(c, o * 0.3)} 0, transparent 50%), radial-gradient(at 100% 100%, ${rgba(c, o * 0.2)} 0, transparent 50%), radial-gradient(at 0% 100%, ${rgba(c, o * 0.35)} 0, transparent 50%)`,
      backgroundSize: `${s * 2}px ${s * 2}px`,
    }),
  },
  {
    id: "aurora", name: "Aurora", category: "Gradients",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(45deg, ${rgba(c, o * 0.1)} 0%, transparent 40%, ${rgba(c, o * 0.15)} 60%, transparent 100%), linear-gradient(135deg, transparent 0%, ${rgba(c, o * 0.08)} 30%, transparent 70%), linear-gradient(225deg, ${rgba(c, o * 0.12)} 10%, transparent 50%)`,
      backgroundSize: `${s * 3}px ${s * 3}px, ${s * 2}px ${s * 2}px, ${s * 2.5}px ${s * 2.5}px`,
    }),
  },
  {
    id: "spotlight", name: "Spotlight", category: "Gradients",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(ellipse at 50% 50%, ${rgba(c, o * 0.3)} 0%, transparent 70%)`,
      backgroundSize: `${s * 2}px ${s * 2}px`,
    }),
  },

  // ── NOISE & TEXTURE (4) ───────────────────────────────────────────────────
  {
    id: "static-noise", name: "Static Noise", category: "Noise & Texture",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(45deg, ${rgba(c, o * 0.04)} 0, ${rgba(c, o * 0.04)} 2px, transparent 2px, transparent 4px), repeating-linear-gradient(-45deg, ${rgba(c, o * 0.03)} 0, ${rgba(c, o * 0.03)} 1px, transparent 1px, transparent 5px), repeating-linear-gradient(90deg, ${rgba(c, o * 0.04)} 0, ${rgba(c, o * 0.04)} 1px, transparent 1px, transparent 3px)`,
      backgroundSize: `auto`,
    }),
  },
  {
    id: "subtle-grain", name: "Subtle Grain", category: "Noise & Texture",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(0deg, ${rgba(c, o * 0.03)} 0, ${rgba(c, o * 0.03)} 1px, transparent 1px, transparent 2px), repeating-linear-gradient(90deg, ${rgba(c, o * 0.03)} 0, ${rgba(c, o * 0.03)} 1px, transparent 1px, transparent 2px)`,
      backgroundSize: `auto`,
    }),
  },
  {
    id: "stipple", name: "Stipple", category: "Noise & Texture",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o * 0.3)} 1px, transparent 1px), radial-gradient(${rgba(c, o * 0.2)} 1px, transparent 1px), radial-gradient(${rgba(c, o * 0.15)} 1px, transparent 1px)`,
      backgroundSize: `${Math.max(7, s * 0.3)}px ${Math.max(7, s * 0.3)}px, ${Math.max(11, s * 0.46)}px ${Math.max(11, s * 0.46)}px, ${Math.max(13, s * 0.54)}px ${Math.max(13, s * 0.54)}px`,
      backgroundPosition: `0 0, 3px 5px, 7px 2px`,
    }),
  },
  {
    id: "concrete", name: "Concrete", category: "Noise & Texture",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(ellipse at 40% 60%, ${rgba(c, o * 0.05)} 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${rgba(c, o * 0.04)} 0%, transparent 40%), repeating-linear-gradient(30deg, ${rgba(c, o * 0.02)} 0, ${rgba(c, o * 0.02)} 1px, transparent 1px, transparent 4px)`,
      backgroundSize: `${s * 2}px ${s * 2}px, ${s * 1.5}px ${s * 1.5}px, auto`,
    }),
  },

  // ── CLASSIC (5) ───────────────────────────────────────────────────────────
  {
    id: "tablecloth", name: "Tablecloth", category: "Classic",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(${rgba(c, o * 0.3)} 50%, transparent 50%), linear-gradient(90deg, ${rgba(c, o * 0.3)} 50%, transparent 50%)`,
      backgroundSize: `${s}px ${s}px`,
    }),
  },
  {
    id: "picnic", name: "Picnic", category: "Classic",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(45deg, ${rgba(c, o * 0.25)} 25%, transparent 25%), linear-gradient(-45deg, ${rgba(c, o * 0.25)} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${rgba(c, o * 0.25)} 75%), linear-gradient(-45deg, transparent 75%, ${rgba(c, o * 0.25)} 75%)`,
      backgroundSize: `${s}px ${s}px`,
      backgroundPosition: `0 0, 0 ${s / 2}px, ${s / 2}px -${s / 2}px, -${s / 2}px 0`,
    }),
  },
  {
    id: "newspaper", name: "Newspaper Dot", category: "Classic",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o * 0.6)} 1px, transparent 1px)`,
      backgroundSize: `${Math.max(4, s * 0.2)}px ${Math.max(4, s * 0.2)}px`,
    }),
  },
  {
    id: "circuit-board", name: "Circuit Board", category: "Classic",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(90deg, ${rgba(c, o)} 1px, transparent 1px), linear-gradient(0deg, ${rgba(c, o)} 1px, transparent 1px), radial-gradient(${rgba(c, o)} 2px, transparent 2px), linear-gradient(90deg, transparent ${s * 0.3}px, ${rgba(c, o)} ${s * 0.3}px, ${rgba(c, o)} ${s * 0.3 + 1}px, transparent ${s * 0.3 + 1}px)`,
      backgroundSize: `${s}px ${s}px, ${s}px ${s}px, ${s}px ${s}px, ${s}px ${s}px`,
      backgroundPosition: `0 0, 0 0, ${s * 0.5}px ${s * 0.5}px, 0 ${s * 0.6}px`,
    }),
  },
  {
    id: "seigaiha", name: "Seigaiha (Japanese Wave)", category: "Classic",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(circle at 50% 150%, transparent ${s * 0.35}px, ${rgba(c, o)} ${s * 0.35}px, ${rgba(c, o)} ${s * 0.37}px, transparent ${s * 0.37}px, transparent ${s * 0.44}px, ${rgba(c, o * 0.6)} ${s * 0.44}px, ${rgba(c, o * 0.6)} ${s * 0.46}px, transparent ${s * 0.46}px), radial-gradient(circle at 50% 150%, transparent ${s * 0.35}px, ${rgba(c, o)} ${s * 0.35}px, ${rgba(c, o)} ${s * 0.37}px, transparent ${s * 0.37}px, transparent ${s * 0.44}px, ${rgba(c, o * 0.6)} ${s * 0.44}px, ${rgba(c, o * 0.6)} ${s * 0.46}px, transparent ${s * 0.46}px)`,
      backgroundSize: `${s}px ${s * 0.5}px`,
      backgroundPosition: `0 0, ${s / 2}px ${s * 0.25}px`,
    }),
  },

  // ── PLAYFUL (5) ───────────────────────────────────────────────────────────
  {
    id: "confetti", name: "Confetti", category: "Playful",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o)} 2px, transparent 2px), radial-gradient(${rgba(c, o * 0.6)} 1.5px, transparent 1.5px), radial-gradient(${rgba(c, o * 0.8)} 1px, transparent 1px)`,
      backgroundSize: `${s}px ${s}px, ${s * 0.7}px ${s * 0.7}px, ${s * 1.1}px ${s * 1.1}px`,
      backgroundPosition: `0 0, ${s * 0.3}px ${s * 0.4}px, ${s * 0.6}px ${s * 0.15}px`,
    }),
  },
  {
    id: "polka-party", name: "Polka Party", category: "Playful",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o)} ${s * 0.12}px, transparent ${s * 0.12}px), radial-gradient(${rgba(c, o * 0.5)} ${s * 0.08}px, transparent ${s * 0.08}px)`,
      backgroundSize: `${s}px ${s}px, ${s * 0.6}px ${s * 0.6}px`,
      backgroundPosition: `0 0, ${s * 0.3}px ${s * 0.3}px`,
    }),
  },
  {
    id: "neon-grid", name: "Neon Grid", category: "Playful",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `linear-gradient(${rgba(c, o)} 2px, transparent 2px), linear-gradient(90deg, ${rgba(c, o)} 2px, transparent 2px), linear-gradient(${rgba(c, o * 0.3)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(c, o * 0.3)} 1px, transparent 1px)`,
      backgroundSize: `${s * 2}px ${s * 2}px, ${s * 2}px ${s * 2}px, ${s * 0.5}px ${s * 0.5}px, ${s * 0.5}px ${s * 0.5}px`,
    }),
  },
  {
    id: "retro-sunburst", name: "Retro Sunburst", category: "Playful",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `conic-gradient(${rgba(c, o * 0.2)} 0deg, transparent 15deg, transparent 30deg, ${rgba(c, o * 0.2)} 30deg, transparent 45deg, transparent 60deg, ${rgba(c, o * 0.2)} 60deg, transparent 75deg, transparent 90deg, ${rgba(c, o * 0.2)} 90deg, transparent 105deg, transparent 120deg, ${rgba(c, o * 0.2)} 120deg, transparent 135deg, transparent 150deg, ${rgba(c, o * 0.2)} 150deg, transparent 165deg, transparent 180deg, ${rgba(c, o * 0.2)} 180deg, transparent 195deg, transparent 210deg, ${rgba(c, o * 0.2)} 210deg, transparent 225deg, transparent 240deg, ${rgba(c, o * 0.2)} 240deg, transparent 255deg, transparent 270deg, ${rgba(c, o * 0.2)} 270deg, transparent 285deg, transparent 300deg, ${rgba(c, o * 0.2)} 300deg, transparent 315deg, transparent 330deg, ${rgba(c, o * 0.2)} 330deg, transparent 345deg)`,
      backgroundSize: `${s * 4}px ${s * 4}px`,
    }),
  },
  {
    id: "memphis", name: "Memphis", category: "Playful",
    build: ({ color: c, bgColor: bg, size: s, opacity: o }) => ({
      backgroundColor: bg,
      backgroundImage: `radial-gradient(${rgba(c, o)} 2px, transparent 2px), linear-gradient(45deg, ${rgba(c, o * 0.3)} 2px, transparent 2px), linear-gradient(-45deg, ${rgba(c, o * 0.3)} 2px, transparent 2px)`,
      backgroundSize: `${s}px ${s}px, ${s * 0.6}px ${s * 0.6}px, ${s * 0.8}px ${s * 0.8}px`,
      backgroundPosition: `0 0, ${s * 0.2}px ${s * 0.1}px, ${s * 0.5}px ${s * 0.4}px`,
    }),
  },
];
