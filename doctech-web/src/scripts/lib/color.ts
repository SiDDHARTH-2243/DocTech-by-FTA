// Shared, framework-free color math for the Color Tools category.
// All functions are pure; no DOM access here.

export interface RGB {
  r: number;
  g: number;
  b: number;
}
export interface RGBA extends RGB {
  a: number;
}
export interface HSL {
  h: number;
  s: number;
  l: number;
}

const clamp = (n: number, min = 0, max = 255) => Math.min(max, Math.max(min, n));
const round = (n: number) => Math.round(n);

/** Parse #rgb, #rgba, #rrggbb, or #rrggbbaa into RGBA (a in 0..1). Returns null if invalid. */
export function hexToRgba(hex: string): RGBA | null {
  let h = hex.trim().replace(/^#/, "");
  if (![3, 4, 6, 8].includes(h.length) || /[^0-9a-fA-F]/.test(h)) return null;
  if (h.length === 3 || h.length === 4) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

/** Parse #rgb / #rrggbb into RGB (ignores alpha). Returns null if invalid. */
export function hexToRgb(hex: string): RGB | null {
  const rgba = hexToRgba(hex);
  return rgba ? { r: rgba.r, g: rgba.g, b: rgba.b } : null;
}

const toHex2 = (n: number) => clamp(round(n)).toString(16).padStart(2, "0");

/** RGB → #rrggbb (lowercase). */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

/** RGBA → #rrggbb when a≈1, else #rrggbbaa. */
export function rgbaToHex(r: number, g: number, b: number, a = 1): string {
  const base = `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
  if (a >= 1) return base;
  return base + toHex2(a * 255);
}

/** Parse "rgb(…)" / "rgba(…)" strings. Returns null if invalid. */
export function parseRgbaString(str: string): RGBA | null {
  const m = str.trim().match(/^rgba?\(([^)]+)\)$/i);
  if (!m) return null;
  const parts = m[1].split(/[, /]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const r = clamp(parseFloat(parts[0]));
  const g = clamp(parseFloat(parts[1]));
  const b = clamp(parseFloat(parts[2]));
  const a = parts[3] !== undefined ? clamp(parseFloat(parts[3]), 0, 1) : 1;
  if ([r, g, b, a].some((n) => Number.isNaN(n))) return null;
  return { r, g, b, a };
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h: round(h), s: round(s * 100), l: round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: round((r + m) * 255), g: round((g + m) * 255), b: round((b + m) * 255) };
}

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  const s = max === 0 ? 0 : d / max;
  return { h: round(h), s: round(s * 100), v: round(max * 100) };
}

export function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return { c: round(c * 100), m: round(m * 100), y: round(y * 100), k: round(k * 100) };
}

/** Linear RGB interpolation between two colors. t in 0..1. */
export function mix(c1: RGB, c2: RGB, t: number): RGB {
  return {
    r: round(c1.r + (c2.r - c1.r) * t),
    g: round(c1.g + (c2.g - c1.g) * t),
    b: round(c1.b + (c2.b - c1.b) * t),
  };
}

export function lighten(c: RGB, amount: number): RGB {
  const hsl = rgbToHsl(c.r, c.g, c.b);
  return hslToRgb(hsl.h, hsl.s, clamp(hsl.l + amount, 0, 100));
}
export function darken(c: RGB, amount: number): RGB {
  return lighten(c, -amount);
}
export function saturate(c: RGB, amount: number): RGB {
  const hsl = rgbToHsl(c.r, c.g, c.b);
  return hslToRgb(hsl.h, clamp(hsl.s + amount, 0, 100), hsl.l);
}
export function desaturate(c: RGB, amount: number): RGB {
  return saturate(c, -amount);
}

/** WCAG relative luminance (0..1). */
export function relativeLuminance(c: RGB): number {
  const f = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

/** Black or white text that reads best on the given background. */
export function idealTextColor(c: RGB): "#000000" | "#ffffff" {
  return relativeLuminance(c) > 0.4 ? "#000000" : "#ffffff";
}

export function randomColor(): RGB {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
}

/* ── Parsing: any CSS color string → RGBA ─────────────────────────────────── */

/** Parse "hsl(…)" / "hsla(…)" (with or without % on s/l) into RGBA. */
export function parseHslString(str: string): RGBA | null {
  const m = str.trim().match(/^hsla?\(([^)]+)\)$/i);
  if (!m) return null;
  const parts = m[1].split(/[,/]+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]);
  const l = parseFloat(parts[2]);
  const aRaw = parts[3];
  const a = aRaw === undefined ? 1 : aRaw.includes("%") ? parseFloat(aRaw) / 100 : parseFloat(aRaw);
  if ([h, s, l].some((n) => Number.isNaN(n))) return null;
  return { ...hslToRgb(h, s, l), a: clamp(a, 0, 1) };
}

/**
 * Parse hex (#rgb/#rgba/#rrggbb/#rrggbbaa, with or without #), rgb()/rgba() and
 * hsl()/hsla() into RGBA. Named colors are NOT handled here (that needs the names
 * table) — callers should fall back to `nearestNamedColor`'s table for those.
 */
export function parseAnyColor(str: string): RGBA | null {
  const s = str.trim();
  if (!s) return null;
  if (/^rgba?\(/i.test(s)) return parseRgbaString(s);
  if (/^hsla?\(/i.test(s)) return parseHslString(s);
  if (s.startsWith("#")) return hexToRgba(s);
  if (/^[0-9a-fA-F]{3,8}$/.test(s) && [3, 4, 6, 8].includes(s.length)) return hexToRgba("#" + s);
  return null;
}

/* ── WCAG contrast ────────────────────────────────────────────────────────── */

/** WCAG 2.x contrast ratio between two colors (1..21). */
export function contrastRatio(c1: RGB, c2: RGB): number {
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

export interface WcagAssessment {
  ratio: number;
  aaNormal: boolean;
  aaaNormal: boolean;
  aaLarge: boolean;
  aaaLarge: boolean;
  /** WCAG 1.4.11 non-text (UI components, graphical objects). */
  uiComponent: boolean;
}

/** Pass/fail against every WCAG threshold for a given contrast ratio. */
export function wcagAssess(ratio: number): WcagAssessment {
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaaNormal: ratio >= 7,
    aaLarge: ratio >= 3,
    aaaLarge: ratio >= 4.5,
    uiComponent: ratio >= 3,
  };
}

/* ── Colour-vision-deficiency simulation ──────────────────────────────────── */

export type CvdType = "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

// Classic dichromacy simulation matrices (applied to sRGB), the same set used by
// most web CVD simulators. Approximate but standard and recognisable.
const CVD_MATRICES: Record<Exclude<CvdType, "achromatopsia">, number[]> = {
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
};

/** Simulate how a color appears under a colour-vision deficiency. */
export function simulateCVD(c: RGB, type: CvdType): RGB {
  if (type === "achromatopsia") {
    const y = round(0.299 * c.r + 0.587 * c.g + 0.114 * c.b);
    return { r: y, g: y, b: y };
  }
  const m = CVD_MATRICES[type];
  return {
    r: round(clamp(m[0] * c.r + m[1] * c.g + m[2] * c.b)),
    g: round(clamp(m[3] * c.r + m[4] * c.g + m[5] * c.b)),
    b: round(clamp(m[6] * c.r + m[7] * c.g + m[8] * c.b)),
  };
}

export const CVD_LABELS: { type: CvdType; label: string; note: string }[] = [
  { type: "protanopia", label: "Protanopia", note: "no red cones · ~1% of men" },
  { type: "deuteranopia", label: "Deuteranopia", note: "no green cones · ~1% of men" },
  { type: "tritanopia", label: "Tritanopia", note: "no blue cones · very rare" },
  { type: "achromatopsia", label: "Achromatopsia", note: "total colour blindness · rare" },
];

/* ── Interpolation, scales & tint/shade ramps ─────────────────────────────── */

export type MixSpace = "rgb" | "hsl";

/** Interpolate between two colors in RGB or HSL (shortest hue path). t in 0..1. */
export function interpolate(c1: RGB, c2: RGB, t: number, space: MixSpace = "rgb"): RGB {
  if (space === "rgb") return mix(c1, c2, t);
  const a = rgbToHsl(c1.r, c1.g, c1.b);
  const b = rgbToHsl(c2.r, c2.g, c2.b);
  let dh = b.h - a.h;
  if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  return hslToRgb(a.h + dh * t, a.s + (b.s - a.s) * t, a.l + (b.l - a.l) * t);
}

/** Even `steps`-color scale through an arbitrary list of stops. */
export function colorScale(stops: RGB[], steps: number, space: MixSpace = "rgb"): RGB[] {
  if (stops.length === 0 || steps <= 0) return [];
  if (stops.length === 1) return Array.from({ length: steps }, () => stops[0]);
  const segs = stops.length - 1;
  const out: RGB[] = [];
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1);
    const pos = t * segs;
    const seg = Math.min(Math.floor(pos), segs - 1);
    out.push(interpolate(stops[seg], stops[seg + 1], pos - seg, space));
  }
  return out;
}

// Tailwind-style numeric steps and the target lightness each aims for. The base
// color's hue is kept; lightness is mapped onto this ramp so any input yields a
// familiar 50→950 scale.
export const TW_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const TW_TARGET_L = [98, 95, 89, 80, 70, 60, 52, 44, 36, 28, 18];

/** Generate a Tailwind-style tint/shade scale from a base color. */
export function tailwindScale(base: RGB): { step: number; rgb: RGB }[] {
  const { h, s } = rgbToHsl(base.r, base.g, base.b);
  return TW_STEPS.map((step, i) => {
    const targetL = TW_TARGET_L[i];
    // Ease saturation down for the palest tints, up a touch for the darkest.
    const satScale = targetL > 90 ? 0.9 : targetL < 25 ? 1.05 : 1;
    return { step, rgb: hslToRgb(h, clamp(s * satScale, 0, 100), targetL) };
  });
}

export type HarmonyMode =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "monochromatic";

/** Generate a `count`-color palette from a seed using a color-harmony rule. */
export function harmonyPalette(seed: RGB, mode: HarmonyMode, count = 5): RGB[] {
  const { h, s, l } = rgbToHsl(seed.r, seed.g, seed.b);
  const wrap = (deg: number) => ((deg % 360) + 360) % 360;
  const out: RGB[] = [];

  if (mode === "monochromatic") {
    for (let i = 0; i < count; i++) {
      const li = clamp(20 + (i * 60) / Math.max(1, count - 1), 0, 100);
      out.push(hslToRgb(h, s, li));
    }
    return out;
  }

  let offsets: number[];
  switch (mode) {
    case "complementary":
      offsets = [0, 180];
      break;
    case "analogous":
      offsets = [-40, -20, 0, 20, 40];
      break;
    case "triadic":
      offsets = [0, 120, 240];
      break;
    case "tetradic":
      offsets = [0, 90, 180, 270];
      break;
    default:
      offsets = [0];
  }

  for (let i = 0; i < count; i++) {
    const baseHue = wrap(h + offsets[i % offsets.length]);
    // Vary lightness slightly as we wrap past the base offsets for variety.
    const tier = Math.floor(i / offsets.length);
    const li = clamp(l + tier * 12 - 6, 12, 88);
    out.push(hslToRgb(baseHue, s, li));
  }
  return out;
}
