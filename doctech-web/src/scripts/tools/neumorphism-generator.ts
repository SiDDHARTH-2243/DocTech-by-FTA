// Neumorphism (soft UI) Generator — premium engine. Client-side.
// Base-color-driven dual shadows, light-source corner picker, surface + state
// toggles, a preset gallery, shuffle/reset, and multi-line CSS output.
import { hexToRgb, rgbToHex, hslToRgb, lighten, darken } from "../lib/color";
import { copyText } from "../lib/ui";

type Corner = "tl" | "tr" | "br" | "bl";
type Surface = "flat" | "concave" | "convex";

interface NmParams {
  color: string;
  light: Corner;
  surface: Surface;
  pressed: boolean;
  size: number;
  dist: number;
  intensity: number;
  blur: number;
  radius: number;
}

const DEFAULTS: NmParams = {
  color: "#e0e5ec",
  light: "tl",
  surface: "flat",
  pressed: false,
  size: 200,
  dist: 20,
  intensity: 8,
  blur: 40,
  radius: 30,
};

// Curated preset gallery — each applies a full param set on click.
const PRESETS: { name: string; p: Partial<NmParams> }[] = [
  { name: "Soft Card", p: { color: "#e0e5ec", surface: "flat", pressed: false, dist: 20, intensity: 8, blur: 40, radius: 30 } },
  { name: "Button", p: { color: "#e0e5ec", surface: "convex", pressed: false, dist: 10, intensity: 9, blur: 20, radius: 18 } },
  { name: "Pressed", p: { color: "#e0e5ec", surface: "flat", pressed: true, dist: 8, intensity: 8, blur: 18, radius: 18 } },
  { name: "Concave", p: { color: "#e0e5ec", surface: "concave", pressed: false, dist: 18, intensity: 9, blur: 36, radius: 30 } },
  { name: "Deep", p: { color: "#dde3ea", surface: "flat", pressed: false, dist: 30, intensity: 12, blur: 50, radius: 40 } },
  { name: "Subtle", p: { color: "#eef1f6", surface: "flat", pressed: false, dist: 10, intensity: 4, blur: 24, radius: 24 } },
  { name: "Circle", p: { color: "#e0e5ec", surface: "convex", pressed: false, dist: 14, intensity: 9, blur: 28, radius: 140, size: 140 } },
  { name: "Dark", p: { color: "#2d3138", surface: "flat", pressed: false, dist: 18, intensity: 7, blur: 36, radius: 28 } },
  { name: "Mint", p: { color: "#d6eadf", surface: "convex", pressed: false, dist: 16, intensity: 8, blur: 32, radius: 26 } },
  { name: "Lavender", p: { color: "#e6e1f0", surface: "flat", pressed: false, dist: 18, intensity: 7, blur: 38, radius: 30 } },
  { name: "Sand", p: { color: "#efe7da", surface: "concave", pressed: false, dist: 16, intensity: 8, blur: 32, radius: 24 } },
  { name: "Sky", p: { color: "#dbe8f2", surface: "convex", pressed: true, dist: 10, intensity: 8, blur: 22, radius: 50 } },
];

// Gradient angle (deg) so the lit edge faces the light source.
const ANGLE: Record<Corner, number> = { tl: 135, tr: 225, br: 315, bl: 45 };
// Sign of the DARK shadow offset per light corner; the light shadow is the inverse.
const SIGN: Record<Corner, [number, number]> = { tl: [1, 1], tr: [-1, 1], br: [-1, -1], bl: [1, -1] };

/** Compute the background, radius and box-shadow for a param set. */
function computeStyle(p: NmParams) {
  const base = hexToRgb(p.color) || { r: 224, g: 229, b: 236 };
  const lt = lighten(base, p.intensity);
  const dk = darken(base, p.intensity);
  const lightHex = rgbToHex(lt.r, lt.g, lt.b);
  const darkHex = rgbToHex(dk.r, dk.g, dk.b);
  const baseHex = rgbToHex(base.r, base.g, base.b);

  let background = baseHex;
  if (p.surface === "convex") background = `linear-gradient(${ANGLE[p.light]}deg, ${lightHex}, ${darkHex})`;
  else if (p.surface === "concave") background = `linear-gradient(${ANGLE[p.light]}deg, ${darkHex}, ${lightHex})`;

  const [sx, sy] = SIGN[p.light];
  const ins = p.pressed ? "inset " : "";
  const d = p.dist;
  const shadow =
    `${ins}${sx * d}px ${sy * d}px ${p.blur}px ${darkHex}, ` +
    `${ins}${-sx * d}px ${-sy * d}px ${p.blur}px ${lightHex}`;

  return { background, baseHex, shadow };
}

const $ = (id: string) => document.getElementById(id);
const stage = $("nm-stage");
const preview = $("nm-preview");
const cssEl = $("nm-css");

if (stage && preview && cssEl) {
  const state: NmParams = { ...DEFAULTS };

  const colorEl = $("nm-color") as HTMLInputElement;
  const sliderIds = ["nm-size", "nm-dist", "nm-intensity", "nm-blur", "nm-radius"] as const;
  const sliders = Object.fromEntries(sliderIds.map((id) => [id, $(id) as HTMLInputElement]));

  // ── Render ────────────────────────────────────────────────────────────────
  function render() {
    const { background, baseHex, shadow } = computeStyle(state);

    stage!.style.background = baseHex;
    const ps = preview!.style;
    ps.width = `${state.size}px`;
    ps.height = `${state.size}px`;
    ps.background = background;
    ps.borderRadius = `${state.radius}px`;
    ps.boxShadow = shadow;
    // Readable label color on the base.
    const base = hexToRgb(baseHex)!;
    preview!.style.color = base.r * 0.299 + base.g * 0.587 + base.b * 0.114 > 150 ? "#94a3b8" : "#cbd5e1";
    preview!.textContent = state.pressed ? "pressed" : "";

    cssEl!.textContent =
      `/* place on a ${baseHex} background */\n` +
      `background: ${background};\n` +
      `border-radius: ${state.radius}px;\n` +
      `box-shadow: ${shadow};`;
  }

  // Reflect state → controls (used by presets / shuffle / reset).
  function syncControls() {
    colorEl.value = state.color;
    $("nm-color-hex")!.textContent = state.color;
    sliderIds.forEach((id) => {
      const key = id.replace("nm-", "") as keyof NmParams;
      sliders[id].value = String(state[key]);
      $(`${id}-val`)!.textContent = String(state[key]);
    });
    paintCorners();
    paintGroup("nm-shape-group", state.surface);
    paintGroup("nm-type-group", state.pressed ? "pressed" : "raised");
  }

  function apply(patch: Partial<NmParams>) {
    Object.assign(state, patch);
    syncControls();
    render();
  }

  // ── Light-source corner picker ──────────────────────────────────────────────
  function paintCorners() {
    $("nm-light")!.querySelectorAll<HTMLButtonElement>("[data-corner]").forEach((b) => {
      b.style.background = b.dataset.corner === state.light ? "#f97316" : "#cbd5e1";
    });
  }
  $("nm-light")!.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-corner]") as HTMLElement | null;
    if (b) apply({ light: b.dataset.corner as Corner });
  });

  // ── Segmented button groups ─────────────────────────────────────────────────
  function paintGroup(groupId: string, active: string) {
    $(groupId)!.querySelectorAll<HTMLButtonElement>("[data-val]").forEach((b) => {
      const on = b.dataset.val === active;
      b.className =
        "rounded-md px-3 py-1 text-xs font-semibold " +
        (on ? "bg-orange-500 text-white" : "text-slate-600 dark:text-slate-300");
    });
  }
  $("nm-shape-group")!.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-val]") as HTMLElement | null;
    if (b) apply({ surface: b.dataset.val as Surface });
  });
  $("nm-type-group")!.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-val]") as HTMLElement | null;
    if (b) apply({ pressed: b.dataset.val === "pressed" });
  });

  // ── Direct controls ─────────────────────────────────────────────────────────
  colorEl.addEventListener("input", () => apply({ color: colorEl.value }));
  sliderIds.forEach((id) =>
    sliders[id].addEventListener("input", () => {
      const key = id.replace("nm-", "") as keyof NmParams;
      apply({ [key]: parseInt(sliders[id].value) } as Partial<NmParams>);
    }),
  );

  // ── Preset gallery ──────────────────────────────────────────────────────────
  const presetsEl = $("nm-presets")!;
  presetsEl.innerHTML = PRESETS.map((preset, i) => {
    const full: NmParams = { ...DEFAULTS, ...preset.p };
    const { background, baseHex, shadow } = computeStyle({ ...full, size: 48, dist: Math.min(full.dist, 8), blur: Math.min(full.blur, 16) });
    return `
      <button type="button" data-preset="${i}" class="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-2 transition-colors hover:border-orange-400 dark:border-slate-700" title="${preset.name}">
        <span class="flex h-14 w-full items-center justify-center rounded-lg" style="background:${baseHex}">
          <span style="width:34px;height:34px;background:${background};border-radius:${Math.min(full.radius, 17)}px;box-shadow:${shadow}"></span>
        </span>
        <span class="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">${preset.name}</span>
      </button>`;
  }).join("");
  presetsEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-preset]") as HTMLElement | null;
    if (b) apply({ ...DEFAULTS, ...PRESETS[parseInt(b.dataset.preset!)].p });
  });

  // ── Shuffle / Reset ─────────────────────────────────────────────────────────
  const corners: Corner[] = ["tl", "tr", "br", "bl"];
  const surfaces: Surface[] = ["flat", "concave", "convex"];
  const rand = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));
  $("nm-shuffle")!.addEventListener("click", () => {
    // Soft, low-saturation base — neumorphism reads best on light pastels.
    const dark = Math.random() < 0.15;
    const base = dark
      ? hslToRgb(rand(200, 240), rand(6, 14), rand(16, 24))
      : hslToRgb(rand(0, 360), rand(5, 18), rand(86, 94));
    apply({
      color: rgbToHex(base.r, base.g, base.b),
      light: corners[rand(0, 3)],
      surface: surfaces[rand(0, 2)],
      pressed: Math.random() < 0.3,
      dist: rand(8, 32),
      intensity: rand(5, 13),
      blur: rand(16, 56),
      radius: rand(12, 60),
    });
  });
  $("nm-reset")!.addEventListener("click", () => apply({ ...DEFAULTS }));

  $("nm-copy")!.addEventListener("click", () => copyText(cssEl!.textContent || ""));

  syncControls();
  render();
}
