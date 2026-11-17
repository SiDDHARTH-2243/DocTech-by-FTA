// Box Shadow Generator — premium multi-layer engine. Client-side.
// Supports stacking up to 8 shadow layers, per-layer tuning, presets,
// shape switching, element/canvas colours, and full CSS output.
import { hexToRgb } from "../lib/color";
import { copyText, toast } from "../lib/ui";

// ── Types ────────────────────────────────────────────────────────────────────
interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  alpha: number; // 0..100
  color: string; // hex
  inset: boolean;
}

type Shape = "square" | "rounded" | "circle" | "pill";

interface BsState {
  shape: Shape;
  elColor: string;
  canvas: string;
  layers: ShadowLayer[];
  active: number; // index of the layer being edited
}

const MAX_LAYERS = 8;

function defaultLayer(): ShadowLayer {
  return { x: 0, y: 10, blur: 20, spread: 0, alpha: 22, color: "#0f172a", inset: false };
}

const DEFAULTS: BsState = {
  shape: "rounded",
  elColor: "#ffffff",
  canvas: "#e2e8f0",
  layers: [defaultLayer()],
  active: 0,
};

// ── Curated presets ──────────────────────────────────────────────────────────
const PRESETS: { name: string; layers: ShadowLayer[]; shape?: Shape; elColor?: string; canvas?: string }[] = [
  {
    name: "Soft Elevation",
    layers: [
      { x: 0, y: 4, blur: 6, spread: -1, alpha: 10, color: "#0f172a", inset: false },
      { x: 0, y: 10, blur: 15, spread: -3, alpha: 10, color: "#0f172a", inset: false },
    ],
  },
  {
    name: "Material",
    layers: [
      { x: 0, y: 1, blur: 3, spread: 0, alpha: 12, color: "#0f172a", inset: false },
      { x: 0, y: 4, blur: 8, spread: 3, alpha: 8, color: "#0f172a", inset: false },
    ],
  },
  {
    name: "Sharp Drop",
    layers: [{ x: 6, y: 6, blur: 0, spread: 0, alpha: 100, color: "#0f172a", inset: false }],
    canvas: "#f8fafc",
  },
  {
    name: "Glow",
    layers: [{ x: 0, y: 0, blur: 40, spread: 8, alpha: 35, color: "#f97316", inset: false }],
    canvas: "#1e293b",
    elColor: "#1e293b",
  },
  {
    name: "Neon Ring",
    layers: [
      { x: 0, y: 0, blur: 10, spread: 2, alpha: 60, color: "#06b6d4", inset: false },
      { x: 0, y: 0, blur: 40, spread: 8, alpha: 25, color: "#06b6d4", inset: false },
    ],
    canvas: "#0f172a",
    elColor: "#0f172a",
  },
  {
    name: "Inner Light",
    layers: [
      { x: 0, y: 2, blur: 8, spread: 0, alpha: 15, color: "#0f172a", inset: false },
      { x: 0, y: 0, blur: 30, spread: -5, alpha: 60, color: "#ffffff", inset: true },
    ],
  },
  {
    name: "Layered",
    layers: [
      { x: 0, y: 1, blur: 2, spread: 0, alpha: 5, color: "#0f172a", inset: false },
      { x: 0, y: 2, blur: 4, spread: 0, alpha: 5, color: "#0f172a", inset: false },
      { x: 0, y: 5, blur: 10, spread: 0, alpha: 5, color: "#0f172a", inset: false },
      { x: 0, y: 10, blur: 20, spread: 0, alpha: 5, color: "#0f172a", inset: false },
      { x: 0, y: 20, blur: 40, spread: 0, alpha: 5, color: "#0f172a", inset: false },
    ],
  },
  {
    name: "Dreamy",
    layers: [
      { x: 0, y: 8, blur: 32, spread: 0, alpha: 18, color: "#6366f1", inset: false },
      { x: 0, y: 16, blur: 64, spread: 0, alpha: 12, color: "#a855f7", inset: false },
    ],
    canvas: "#f1f5f9",
  },
  {
    name: "Pressed",
    layers: [
      { x: 0, y: 2, blur: 6, spread: 0, alpha: 20, color: "#0f172a", inset: true },
      { x: 0, y: -2, blur: 4, spread: 0, alpha: 8, color: "#ffffff", inset: true },
    ],
    canvas: "#e2e8f0",
    elColor: "#e2e8f0",
  },
  {
    name: "Brutalist",
    layers: [{ x: 4, y: 4, blur: 0, spread: 2, alpha: 100, color: "#0f172a", inset: false }],
    elColor: "#fbbf24",
    canvas: "#ffffff",
  },
  {
    name: "Floating Card",
    layers: [
      { x: 0, y: 25, blur: 50, spread: -12, alpha: 25, color: "#0f172a", inset: false },
    ],
  },
  {
    name: "Sunset Glow",
    layers: [
      { x: 0, y: 0, blur: 20, spread: 4, alpha: 30, color: "#f97316", inset: false },
      { x: 0, y: 0, blur: 60, spread: 12, alpha: 15, color: "#ec4899", inset: false },
    ],
    canvas: "#1e293b",
    elColor: "#1e293b",
  },
];

// ── DOM references ───────────────────────────────────────────────────────────
const $ = (id: string) => document.getElementById(id);
const stage = $("bs-stage");
const preview = $("bs-preview");
const cssEl = $("bs-css");

if (stage && preview && cssEl) {
  const state: BsState = structuredClone(DEFAULTS);

  // Controls
  const elColorInput = $("bs-el-color") as HTMLInputElement;
  const canvasInput = $("bs-canvas") as HTMLInputElement;
  const layerColorInput = $("bs-layer-color") as HTMLInputElement;
  const insetInput = $("bs-inset") as HTMLInputElement;
  const sliderIds = ["bs-x", "bs-y", "bs-blur", "bs-spread", "bs-alpha"] as const;
  const sliders = Object.fromEntries(sliderIds.map((id) => [id, $(id) as HTMLInputElement]));

  // ── Shape helpers ────────────────────────────────────────────────────────
  const SHAPE_STYLES: Record<Shape, Partial<CSSStyleDeclaration>> = {
    square: { borderRadius: "0", width: "180px", height: "180px" },
    rounded: { borderRadius: "16px", width: "180px", height: "180px" },
    circle: { borderRadius: "50%", width: "180px", height: "180px" },
    pill: { borderRadius: "999px", width: "240px", height: "100px" },
  };

  // ── Shadow → CSS string ─────────────────────────────────────────────────
  function shadowToCss(l: ShadowLayer): string {
    const rgb = hexToRgb(l.color) || { r: 15, g: 23, b: 42 };
    const a = l.alpha / 100;
    return `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
  }

  // ── Render ──────────────────────────────────────────────────────────────
  function render() {
    // Stage canvas
    stage!.style.background = state.canvas;
    $("bs-canvas-hex")!.textContent = state.canvas;

    // Preview element
    const ps = preview!.style;
    const shape = SHAPE_STYLES[state.shape];
    Object.assign(ps, shape);
    ps.background = state.elColor;
    $("bs-el-color-hex")!.textContent = state.elColor;

    // Composite shadow
    const shadowCss = state.layers.map(shadowToCss).join(",\n    ");
    ps.boxShadow = state.layers.map(shadowToCss).join(", ");

    // CSS output
    cssEl!.textContent = `box-shadow: ${shadowCss};`;

    // Sync active layer controls
    syncActiveLayer();
  }

  function syncActiveLayer() {
    const l = state.layers[state.active];
    if (!l) return;

    $("bs-active-name")!.textContent = `Layer ${state.active + 1}`;
    sliders["bs-x"].value = String(l.x);
    sliders["bs-y"].value = String(l.y);
    sliders["bs-blur"].value = String(l.blur);
    sliders["bs-spread"].value = String(l.spread);
    sliders["bs-alpha"].value = String(l.alpha);
    layerColorInput.value = l.color;
    insetInput.checked = l.inset;

    sliderIds.forEach((id) => {
      $(`${id}-val`)!.textContent = sliders[id].value;
    });
    $("bs-layer-color-hex")!.textContent = l.color;

    renderLayersList();
  }

  // ── Layers list ─────────────────────────────────────────────────────────
  function renderLayersList() {
    const cont = $("bs-layers")!;
    cont.innerHTML = state.layers
      .map((l, i) => {
        const isActive = i === state.active;
        const rgb = hexToRgb(l.color) || { r: 15, g: 23, b: 42 };
        const preview = `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px`;
        return `
        <div class="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors cursor-pointer ${
          isActive
            ? "border-orange-400 bg-orange-50 dark:border-orange-500/40 dark:bg-orange-500/10"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
        }" data-layer="${i}">
          <span class="h-4 w-4 rounded-full shrink-0 border border-slate-300 dark:border-slate-600" style="background:rgba(${rgb.r},${rgb.g},${rgb.b},${l.alpha / 100})"></span>
          <span class="flex-1 truncate font-medium ${isActive ? "text-orange-700 dark:text-orange-300" : "text-slate-600 dark:text-slate-300"}">
            Layer ${i + 1} <span class="text-slate-400 dark:text-slate-500 font-normal">${preview}</span>
          </span>
          ${
            state.layers.length > 1
              ? `<button data-del="${i}" class="rounded p-0.5 text-slate-400 transition-colors hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400" title="Remove layer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>`
              : ""
          }
        </div>`;
      })
      .join("");

    // Click-to-select layer
    cont.querySelectorAll<HTMLElement>("[data-layer]").forEach((el) =>
      el.addEventListener("click", (e) => {
        // Don't select when clicking delete
        if ((e.target as HTMLElement).closest("[data-del]")) return;
        state.active = parseInt(el.dataset.layer!);
        render();
      }),
    );

    // Delete layer
    cont.querySelectorAll<HTMLElement>("[data-del]").forEach((el) =>
      el.addEventListener("click", () => {
        const idx = parseInt(el.dataset.del!);
        state.layers.splice(idx, 1);
        if (state.active >= state.layers.length) state.active = state.layers.length - 1;
        render();
      }),
    );
  }

  // ── Add layer ───────────────────────────────────────────────────────────
  $("bs-add")!.addEventListener("click", () => {
    if (state.layers.length >= MAX_LAYERS) {
      toast(`Maximum ${MAX_LAYERS} layers`, "err");
      return;
    }
    state.layers.push(defaultLayer());
    state.active = state.layers.length - 1;
    render();
  });

  // ── Slider inputs ───────────────────────────────────────────────────────
  const SLIDER_KEY_MAP: Record<string, keyof ShadowLayer> = {
    "bs-x": "x",
    "bs-y": "y",
    "bs-blur": "blur",
    "bs-spread": "spread",
    "bs-alpha": "alpha",
  };

  sliderIds.forEach((id) => {
    sliders[id].addEventListener("input", () => {
      const key = SLIDER_KEY_MAP[id];
      (state.layers[state.active] as any)[key] = parseInt(sliders[id].value);
      $(`${id}-val`)!.textContent = sliders[id].value;
      render();
    });
  });

  // ── Color inputs ────────────────────────────────────────────────────────
  layerColorInput.addEventListener("input", () => {
    state.layers[state.active].color = layerColorInput.value;
    $("bs-layer-color-hex")!.textContent = layerColorInput.value;
    render();
  });
  insetInput.addEventListener("change", () => {
    state.layers[state.active].inset = insetInput.checked;
    render();
  });
  elColorInput.addEventListener("input", () => {
    state.elColor = elColorInput.value;
    render();
  });
  canvasInput.addEventListener("input", () => {
    state.canvas = canvasInput.value;
    render();
  });

  // ── Shape group ─────────────────────────────────────────────────────────
  function paintGroup(groupId: string, active: string) {
    $(groupId)!.querySelectorAll<HTMLButtonElement>("[data-val]").forEach((b) => {
      const on = b.dataset.val === active;
      b.className =
        "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors " +
        (on ? "bg-orange-500 text-white" : "text-slate-600 dark:text-slate-300");
    });
  }

  $("bs-shape-group")!.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-val]") as HTMLElement | null;
    if (b) {
      state.shape = b.dataset.val as Shape;
      paintGroup("bs-shape-group", state.shape);
      render();
    }
  });

  // ── Preset gallery ──────────────────────────────────────────────────────
  const presetsEl = $("bs-presets")!;
  presetsEl.innerHTML = PRESETS.map((preset, i) => {
    // Build a mini shadow for the thumbnail
    const miniLayers = preset.layers.map((l) => {
      const rgb = hexToRgb(l.color) || { r: 15, g: 23, b: 42 };
      const a = l.alpha / 100;
      const scale = 0.4; // scale down offsets for thumbnail
      return `${l.inset ? "inset " : ""}${Math.round(l.x * scale)}px ${Math.round(l.y * scale)}px ${Math.round(l.blur * scale)}px ${Math.round(l.spread * scale)}px rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
    });
    const bg = preset.canvas || "#e2e8f0";
    const elBg = preset.elColor || "#ffffff";
    return `
      <button type="button" data-preset="${i}" class="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-2 transition-colors hover:border-orange-400 dark:border-slate-700" title="${preset.name}">
        <span class="flex h-14 w-full items-center justify-center rounded-lg" style="background:${bg}">
          <span style="width:30px;height:30px;background:${elBg};border-radius:6px;box-shadow:${miniLayers.join(", ")}"></span>
        </span>
        <span class="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">${preset.name}</span>
      </button>`;
  }).join("");

  presetsEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-preset]") as HTMLElement | null;
    if (b) {
      const preset = PRESETS[parseInt(b.dataset.preset!)];
      state.layers = structuredClone(preset.layers);
      state.active = 0;
      if (preset.elColor) state.elColor = preset.elColor;
      if (preset.canvas) state.canvas = preset.canvas;
      state.shape = preset.shape || "rounded";

      elColorInput.value = state.elColor;
      canvasInput.value = state.canvas;
      paintGroup("bs-shape-group", state.shape);
      render();
    }
  });

  // ── Shuffle / Reset ─────────────────────────────────────────────────────
  const rand = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));
  const randHex = () => {
    const hue = rand(0, 360);
    // Convert HSL to a hex — quick inline
    const h = hue / 360;
    const s = rand(20, 80) / 100;
    const l = rand(15, 50) / 100;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b2 = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b2.toString(16).padStart(2, "0")}`;
  };

  $("bs-shuffle")!.addEventListener("click", () => {
    const numLayers = rand(1, 3);
    const layers: ShadowLayer[] = [];
    for (let i = 0; i < numLayers; i++) {
      layers.push({
        x: rand(-20, 20),
        y: rand(-5, 30),
        blur: rand(4, 60),
        spread: rand(-10, 10),
        alpha: rand(8, 40),
        color: Math.random() < 0.7 ? "#0f172a" : randHex(),
        inset: Math.random() < 0.2,
      });
    }
    state.layers = layers;
    state.active = 0;
    render();
  });

  $("bs-reset")!.addEventListener("click", () => {
    Object.assign(state, structuredClone(DEFAULTS));
    elColorInput.value = state.elColor;
    canvasInput.value = state.canvas;
    paintGroup("bs-shape-group", state.shape);
    render();
  });

  // ── Copy ────────────────────────────────────────────────────────────────
  $("bs-copy")!.addEventListener("click", () => copyText(cssEl!.textContent || ""));

  // ── Initial render ──────────────────────────────────────────────────────
  paintGroup("bs-shape-group", state.shape);
  render();
}
