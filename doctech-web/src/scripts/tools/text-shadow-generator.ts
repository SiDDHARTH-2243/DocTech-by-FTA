// Text Shadow Generator — premium multi-layer engine. Client-side.
// Supports stacking shadow layers, font controls, canvas colour, 14 presets,
// shuffle / reset, click-to-edit inline text, and composite CSS output.
import { hexToRgb } from "../lib/color";
import { copyText, toast } from "../lib/ui";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  alpha: number; // 0..100
  color: string; // hex
}

interface TsState {
  layers: ShadowLayer[];
  active: number;
  textColor: string;
  canvas: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
}

const MAX_LAYERS = 8;

function defaultLayer(): ShadowLayer {
  return { x: 2, y: 2, blur: 4, alpha: 50, color: "#f97316" };
}

const DEFAULTS: TsState = {
  layers: [defaultLayer()],
  active: 0,
  textColor: "#ffffff",
  canvas: "#0f172a",
  fontFamily: "'Inter', sans-serif",
  fontSize: 72,
  fontWeight: "800",
};

// ── Presets ───────────────────────────────────────────────────────────────────
const PRESETS: {
  name: string;
  canvas: string;
  textColor: string;
  layers: ShadowLayer[];
  fontWeight?: string;
}[] = [
  {
    name: "Classic",
    canvas: "#1e293b",
    textColor: "#f8fafc",
    layers: [{ x: 2, y: 2, blur: 4, alpha: 60, color: "#000000" }],
  },
  {
    name: "Neon Orange",
    canvas: "#0f172a",
    textColor: "#ffffff",
    layers: [
      { x: 0, y: 0, blur: 10, alpha: 80, color: "#f97316" },
      { x: 0, y: 0, blur: 40, alpha: 40, color: "#f97316" },
    ],
  },
  {
    name: "Neon Cyan",
    canvas: "#0f172a",
    textColor: "#ffffff",
    layers: [
      { x: 0, y: 0, blur: 8, alpha: 80, color: "#06b6d4" },
      { x: 0, y: 0, blur: 30, alpha: 35, color: "#06b6d4" },
    ],
  },
  {
    name: "Neon Purple",
    canvas: "#0a0a0f",
    textColor: "#ffffff",
    layers: [
      { x: 0, y: 0, blur: 8, alpha: 90, color: "#a855f7" },
      { x: 0, y: 0, blur: 32, alpha: 40, color: "#7c3aed" },
    ],
  },
  {
    name: "Retro",
    canvas: "#fef3c7",
    textColor: "#92400e",
    layers: [
      { x: 3, y: 3, blur: 0, alpha: 100, color: "#d97706" },
      { x: 6, y: 6, blur: 0, alpha: 30, color: "#92400e" },
    ],
    fontWeight: "900",
  },
  {
    name: "Emboss",
    canvas: "#e2e8f0",
    textColor: "#94a3b8",
    layers: [
      { x: 1, y: 1, blur: 1, alpha: 100, color: "#ffffff" },
      { x: -1, y: -1, blur: 1, alpha: 40, color: "#64748b" },
    ],
  },
  {
    name: "Deboss",
    canvas: "#e2e8f0",
    textColor: "#94a3b8",
    layers: [
      { x: -1, y: -1, blur: 1, alpha: 100, color: "#ffffff" },
      { x: 1, y: 1, blur: 2, alpha: 50, color: "#475569" },
    ],
  },
  {
    name: "Fire",
    canvas: "#0f0a00",
    textColor: "#fef9c3",
    layers: [
      { x: 0, y: -2, blur: 8, alpha: 90, color: "#fbbf24" },
      { x: 0, y: -4, blur: 16, alpha: 70, color: "#f97316" },
      { x: 0, y: -8, blur: 32, alpha: 40, color: "#ef4444" },
    ],
    fontWeight: "900",
  },
  {
    name: "Ice",
    canvas: "#0c1932",
    textColor: "#e0f2fe",
    layers: [
      { x: 0, y: 0, blur: 6, alpha: 70, color: "#38bdf8" },
      { x: 0, y: 2, blur: 20, alpha: 30, color: "#7dd3fc" },
    ],
  },
  {
    name: "Letterpress",
    canvas: "#f1f5f9",
    textColor: "#1e293b",
    layers: [
      { x: 0, y: 1, blur: 0, alpha: 100, color: "#ffffff" },
    ],
    fontWeight: "900",
  },
  {
    name: "Long Shadow",
    canvas: "#1e40af",
    textColor: "#ffffff",
    layers: [
      { x: 2, y: 2, blur: 0, alpha: 30, color: "#1e3a8a" },
      { x: 4, y: 4, blur: 0, alpha: 25, color: "#1e3a8a" },
      { x: 6, y: 6, blur: 0, alpha: 20, color: "#1e3a8a" },
      { x: 8, y: 8, blur: 0, alpha: 15, color: "#1e3a8a" },
    ],
    fontWeight: "800",
  },
  {
    name: "Galaxy",
    canvas: "#020617",
    textColor: "#c4b5fd",
    layers: [
      { x: 0, y: 0, blur: 10, alpha: 80, color: "#818cf8" },
      { x: 0, y: 0, blur: 40, alpha: 30, color: "#7c3aed" },
      { x: 0, y: 0, blur: 80, alpha: 15, color: "#4f46e5" },
    ],
    fontWeight: "900",
  },
  {
    name: "Pop Art",
    canvas: "#fde68a",
    textColor: "#1e293b",
    layers: [
      { x: 4, y: 4, blur: 0, alpha: 100, color: "#ef4444" },
    ],
    fontWeight: "900",
  },
  {
    name: "Midnight",
    canvas: "#0f172a",
    textColor: "#e2e8f0",
    layers: [
      { x: 0, y: 4, blur: 12, alpha: 80, color: "#1e293b" },
      { x: 0, y: 8, blur: 24, alpha: 40, color: "#0f172a" },
    ],
  },
  {
    name: "Outline",
    canvas: "#f97316",
    textColor: "#ffffff",
    layers: [
      { x: 2, y: 0, blur: 0, alpha: 100, color: "#0f172a" },
      { x: -2, y: 0, blur: 0, alpha: 100, color: "#0f172a" },
      { x: 0, y: 2, blur: 0, alpha: 100, color: "#0f172a" },
      { x: 0, y: -2, blur: 0, alpha: 100, color: "#0f172a" },
      { x: 2, y: 2, blur: 0, alpha: 100, color: "#0f172a" },
      { x: -2, y: -2, blur: 0, alpha: 100, color: "#0f172a" },
      { x: 2, y: -2, blur: 0, alpha: 100, color: "#0f172a" },
      { x: -2, y: 2, blur: 0, alpha: 100, color: "#0f172a" },
    ],
    fontWeight: "900",
  },
  {
    name: "3D Extrude",
    canvas: "#fde047",
    textColor: "#ef4444",
    layers: [
      { x: 1, y: 1, blur: 0, alpha: 100, color: "#b91c1c" },
      { x: 2, y: 2, blur: 0, alpha: 100, color: "#b91c1c" },
      { x: 3, y: 3, blur: 0, alpha: 100, color: "#991b1b" },
      { x: 4, y: 4, blur: 0, alpha: 100, color: "#991b1b" },
      { x: 6, y: 6, blur: 6, alpha: 40, color: "#450a0a" },
    ],
    fontWeight: "900",
  },
  {
    name: "Glitch",
    canvas: "#0a0a0f",
    textColor: "#f8fafc",
    layers: [
      { x: -3, y: 0, blur: 0, alpha: 90, color: "#06b6d4" },
      { x: 3, y: 0, blur: 0, alpha: 90, color: "#ec4899" },
    ],
    fontWeight: "800",
  },
  {
    name: "Chrome",
    canvas: "#1e293b",
    textColor: "#e2e8f0",
    layers: [
      { x: 0, y: 1, blur: 0, alpha: 100, color: "#ffffff" },
      { x: 0, y: -1, blur: 1, alpha: 70, color: "#94a3b8" },
      { x: 0, y: 4, blur: 8, alpha: 55, color: "#020617" },
    ],
    fontWeight: "900",
  },
  {
    name: "Gold",
    canvas: "#1a1207",
    textColor: "#fde68a",
    layers: [
      { x: 0, y: 1, blur: 0, alpha: 100, color: "#fffbeb" },
      { x: 0, y: 2, blur: 4, alpha: 80, color: "#b45309" },
      { x: 0, y: 5, blur: 12, alpha: 50, color: "#78350f" },
    ],
    fontWeight: "900",
  },
  {
    name: "Vaporwave",
    canvas: "#2d1b4e",
    textColor: "#f0abfc",
    layers: [
      { x: -3, y: 3, blur: 0, alpha: 90, color: "#22d3ee" },
      { x: 3, y: -3, blur: 0, alpha: 90, color: "#f472b6" },
    ],
    fontWeight: "800",
  },
  {
    name: "Comic",
    canvas: "#38bdf8",
    textColor: "#ffffff",
    layers: [
      { x: 2, y: 0, blur: 0, alpha: 100, color: "#0f172a" },
      { x: -2, y: 0, blur: 0, alpha: 100, color: "#0f172a" },
      { x: 0, y: 2, blur: 0, alpha: 100, color: "#0f172a" },
      { x: 0, y: -2, blur: 0, alpha: 100, color: "#0f172a" },
      { x: 5, y: 5, blur: 0, alpha: 100, color: "#0f172a" },
    ],
    fontWeight: "900",
  },
  {
    name: "Spotlight",
    canvas: "#0c0a09",
    textColor: "#fafaf9",
    layers: [
      { x: 0, y: 0, blur: 2, alpha: 100, color: "#ffffff" },
      { x: 0, y: 0, blur: 20, alpha: 60, color: "#fbbf24" },
      { x: 0, y: 0, blur: 50, alpha: 30, color: "#f59e0b" },
    ],
    fontWeight: "800",
  },
  {
    name: "Matrix",
    canvas: "#001a05",
    textColor: "#4ade80",
    layers: [
      { x: 0, y: 0, blur: 6, alpha: 90, color: "#22c55e" },
      { x: 0, y: 0, blur: 18, alpha: 45, color: "#16a34a" },
    ],
    fontWeight: "700",
  },
  {
    name: "Sunset",
    canvas: "#1e1b4b",
    textColor: "#fed7aa",
    layers: [
      { x: 0, y: 0, blur: 12, alpha: 80, color: "#fb923c" },
      { x: 0, y: 0, blur: 36, alpha: 40, color: "#f43f5e" },
    ],
    fontWeight: "900",
  },
  {
    name: "Soft",
    canvas: "#f1f5f9",
    textColor: "#334155",
    layers: [{ x: 0, y: 4, blur: 8, alpha: 25, color: "#0f172a" }],
    fontWeight: "800",
  },
];

// ── Google Fonts loader ───────────────────────────────────────────────────────
const GFONTS_FAMILIES = [
  "Inter",
  "Outfit",
  "Playfair+Display",
  "Roboto+Mono",
  "Dancing+Script",
  "Bebas+Neue",
  "Abril+Fatface",
].join("&family=");

function loadGoogleFonts() {
  const url = `https://fonts.googleapis.com/css2?family=${GFONTS_FAMILIES}&display=swap`;
  if (!document.querySelector(`link[href*="googleapis"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }
}

// ── DOM refs ─────────────────────────────────────────────────────────────────
const $ = (id: string) => document.getElementById(id);
const stage = $("ts-stage");
const preview = $("ts-preview") as HTMLElement;
const cssEl = $("ts-css");

if (stage && preview && cssEl) {
  loadGoogleFonts();

  const state: TsState = structuredClone(DEFAULTS);

  const canvasInput = $("ts-canvas") as HTMLInputElement;
  const textColorInput = $("ts-text-color") as HTMLInputElement;
  const layerColorInput = $("ts-layer-color") as HTMLInputElement;
  const fontSelect = $("ts-font") as HTMLSelectElement;
  const sizeSlider = $("ts-size") as HTMLInputElement;
  const sliderIds = ["ts-x", "ts-y", "ts-blur", "ts-alpha"] as const;
  const sliders = Object.fromEntries(sliderIds.map((id) => [id, $(id) as HTMLInputElement]));

  const SLIDER_KEY: Record<string, keyof ShadowLayer> = {
    "ts-x": "x",
    "ts-y": "y",
    "ts-blur": "blur",
    "ts-alpha": "alpha",
  };

  // ── Shadow → CSS string ────────────────────────────────────────────────
  function layerToCss(l: ShadowLayer): string {
    const rgb = hexToRgb(l.color) || { r: 249, g: 115, b: 22 };
    const a = l.alpha / 100;
    return `${l.x}px ${l.y}px ${l.blur}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
  }

  // ── Render ─────────────────────────────────────────────────────────────
  function render() {
    // Stage
    stage!.style.background = state.canvas;

    // Preview text styles
    const ps = preview.style;
    ps.textShadow = state.layers.map(layerToCss).join(", ");
    ps.color = state.textColor;
    ps.fontFamily = state.fontFamily;
    ps.fontSize = `${state.fontSize}px`;
    ps.fontWeight = state.fontWeight;

    // Hex labels
    $("ts-text-color-hex")!.textContent = state.textColor;
    $("ts-layer-color-hex")!.textContent = state.layers[state.active]?.color || "#f97316";
    $("ts-size-val")!.textContent = String(state.fontSize);

    // CSS output — multi-line for multiple layers
    const shadowCss = state.layers.map(layerToCss).join(",\n             ");
    cssEl!.textContent =
      `font-family: ${state.fontFamily};\n` +
      `font-size: ${state.fontSize}px;\n` +
      `font-weight: ${state.fontWeight};\n` +
      `color: ${state.textColor};\n` +
      `text-shadow: ${shadowCss};`;

    syncLayerControls();
    renderLayersList();
  }

  function syncLayerControls() {
    const l = state.layers[state.active];
    if (!l) return;
    $("ts-active-name")!.textContent = `Layer ${state.active + 1}`;
    sliders["ts-x"].value = String(l.x);
    sliders["ts-y"].value = String(l.y);
    sliders["ts-blur"].value = String(l.blur);
    sliders["ts-alpha"].value = String(l.alpha);
    layerColorInput.value = l.color;
    $("ts-x-val")!.textContent = String(l.x);
    $("ts-y-val")!.textContent = String(l.y);
    $("ts-blur-val")!.textContent = String(l.blur);
    $("ts-alpha-val")!.textContent = String(l.alpha);
    $("ts-layer-color-hex")!.textContent = l.color;
  }

  // ── Layer list ─────────────────────────────────────────────────────────
  function renderLayersList() {
    const cont = $("ts-layers")!;
    cont.innerHTML = state.layers
      .map((l, i) => {
        const isActive = i === state.active;
        const rgb = hexToRgb(l.color) || { r: 249, g: 115, b: 22 };
        const label = `${l.x}px ${l.y}px ${l.blur}px`;
        return `
        <div class="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors cursor-pointer ${
          isActive
            ? "border-orange-400 bg-orange-50 dark:border-orange-500/40 dark:bg-orange-500/10"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
        }" data-layer="${i}">
          <span class="h-4 w-4 shrink-0 rounded-full border border-slate-300 dark:border-slate-600" style="background:rgba(${rgb.r},${rgb.g},${rgb.b},${l.alpha / 100})"></span>
          <span class="flex-1 truncate font-medium ${isActive ? "text-orange-700 dark:text-orange-300" : "text-slate-600 dark:text-slate-300"}">
            Layer ${i + 1} <span class="text-slate-400 font-normal">${label}</span>
          </span>
          ${
            state.layers.length > 1
              ? `<button data-del="${i}" class="rounded p-0.5 text-slate-400 transition-colors hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400" title="Remove">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>`
              : ""
          }
        </div>`;
      })
      .join("");

    cont.querySelectorAll<HTMLElement>("[data-layer]").forEach((el) =>
      el.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).closest("[data-del]")) return;
        state.active = parseInt(el.dataset.layer!);
        render();
      }),
    );
    cont.querySelectorAll<HTMLElement>("[data-del]").forEach((el) =>
      el.addEventListener("click", () => {
        const idx = parseInt(el.dataset.del!);
        state.layers.splice(idx, 1);
        if (state.active >= state.layers.length) state.active = state.layers.length - 1;
        render();
      }),
    );
  }

  // ── Add layer ──────────────────────────────────────────────────────────
  $("ts-add")!.addEventListener("click", () => {
    if (state.layers.length >= MAX_LAYERS) {
      toast(`Max ${MAX_LAYERS} layers`, "err");
      return;
    }
    state.layers.push(defaultLayer());
    state.active = state.layers.length - 1;
    render();
  });

  // ── Slider inputs ──────────────────────────────────────────────────────
  sliderIds.forEach((id) => {
    sliders[id].addEventListener("input", () => {
      const key = SLIDER_KEY[id];
      (state.layers[state.active] as any)[key] = parseInt(sliders[id].value);
      $(`${id}-val`)!.textContent = sliders[id].value;
      render();
    });
  });

  // ── Font size ──────────────────────────────────────────────────────────
  sizeSlider.addEventListener("input", () => {
    state.fontSize = parseInt(sizeSlider.value);
    render();
  });

  // ── Font select ────────────────────────────────────────────────────────
  fontSelect.addEventListener("change", () => {
    state.fontFamily = fontSelect.value;
    render();
  });

  // ── Weight group ───────────────────────────────────────────────────────
  function paintGroup(groupId: string, active: string) {
    $(groupId)!.querySelectorAll<HTMLButtonElement>("[data-val]").forEach((b) => {
      const on = b.dataset.val === active;
      b.className =
        "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors " +
        (on ? "bg-orange-500 text-white" : "text-slate-600 dark:text-slate-300");
    });
  }

  $("ts-weight-group")!.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-val]") as HTMLElement | null;
    if (b) {
      state.fontWeight = b.dataset.val!;
      paintGroup("ts-weight-group", state.fontWeight);
      render();
    }
  });

  // ── Color inputs ───────────────────────────────────────────────────────
  layerColorInput.addEventListener("input", () => {
    state.layers[state.active].color = layerColorInput.value;
    render();
  });
  textColorInput.addEventListener("input", () => {
    state.textColor = textColorInput.value;
    render();
  });
  canvasInput.addEventListener("input", () => {
    state.canvas = canvasInput.value;
    render();
  });

  // ── Inline editable text ───────────────────────────────────────────────
  // (handled natively by contenteditable — no extra JS needed)

  // ── Preset gallery ─────────────────────────────────────────────────────
  const presetsEl = $("ts-presets")!;
  presetsEl.innerHTML = PRESETS.map((p, i) => {
    const miniShadow = p.layers
      .map((l) => {
        const rgb = hexToRgb(l.color) || { r: 249, g: 115, b: 22 };
        return `${(l.x * 0.5).toFixed(1)}px ${(l.y * 0.5).toFixed(1)}px ${(l.blur * 0.5).toFixed(1)}px rgba(${rgb.r},${rgb.g},${rgb.b},${l.alpha / 100})`;
      })
      .join(", ");
    return `
      <button type="button" data-preset="${i}" title="${p.name}"
        class="group overflow-hidden rounded-xl border border-slate-200 transition-colors hover:border-orange-400 hover:shadow-sm dark:border-slate-700">
        <span class="flex h-12 items-center justify-center text-xl"
          style="background:${p.canvas};color:${p.textColor};text-shadow:${miniShadow};font-weight:${p.fontWeight || 800}">Aa</span>
        <span class="block truncate px-1.5 py-1 text-center text-[10px] font-medium text-slate-600 dark:text-slate-300">${p.name}</span>
      </button>`;
  }).join("");

  presetsEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-preset]") as HTMLElement | null;
    if (!b) return;
    const p = PRESETS[parseInt(b.dataset.preset!)];
    state.layers = structuredClone(p.layers);
    state.active = 0;
    state.canvas = p.canvas;
    state.textColor = p.textColor;
    state.fontWeight = p.fontWeight || "800";
    canvasInput.value = state.canvas;
    textColorInput.value = state.textColor;
    paintGroup("ts-weight-group", state.fontWeight);
    render();
  });

  // ── Shuffle ────────────────────────────────────────────────────────────
  const rand = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));
  const randHex = () => {
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(rand(0, 255))}${toHex(rand(0, 255))}${toHex(rand(0, 255))}`;
  };

  $("ts-shuffle")!.addEventListener("click", () => {
    const preset = PRESETS[rand(0, PRESETS.length - 1)];
    state.layers = structuredClone(preset.layers);
    state.active = 0;
    state.canvas = preset.canvas;
    state.textColor = preset.textColor;
    state.fontWeight = preset.fontWeight || "800";
    canvasInput.value = state.canvas;
    textColorInput.value = state.textColor;
    paintGroup("ts-weight-group", state.fontWeight);
    render();
  });

  // ── Reset ──────────────────────────────────────────────────────────────
  $("ts-reset")!.addEventListener("click", () => {
    Object.assign(state, structuredClone(DEFAULTS));
    canvasInput.value = state.canvas;
    textColorInput.value = state.textColor;
    fontSelect.value = state.fontFamily;
    sizeSlider.value = String(state.fontSize);
    paintGroup("ts-weight-group", state.fontWeight);
    render();
  });

  // ── Copy ───────────────────────────────────────────────────────────────
  $("ts-copy")!.addEventListener("click", () => copyText(cssEl!.textContent || ""));

  // ── Init ───────────────────────────────────────────────────────────────
  paintGroup("ts-weight-group", state.fontWeight);
  render();
}
