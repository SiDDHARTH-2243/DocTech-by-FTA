// Gradient Generator — premium multi-stop engine. Client-side.
// Interactive stop bar (drag handles, double-click to add, delete), linear/
// radial/conic types, angle, visual preset gallery, shuffle/reverse/fullscreen.
import { hexToRgb, rgbToHex, hslToRgb, mix } from "../lib/color";
import { copyText } from "../lib/ui";

type GType = "linear" | "radial" | "conic";
interface Stop { color: string; pos: number } // pos 0..100
interface GrState { type: GType; angle: number; stops: Stop[]; active: number }

const MIN_STOPS = 2;
const MAX_STOPS = 8;

const DEFAULTS: GrState = {
  type: "linear",
  angle: 90,
  stops: [
    { color: "#f97316", pos: 0 },
    { color: "#3b82f6", pos: 100 },
  ],
  active: 0,
};

// Visual preset gallery — trendy gradients (2- and 3-stop).
const PRESETS: { name: string; type?: GType; angle?: number; stops: Stop[] }[] = [
  { name: "Sunset", stops: [{ color: "#ff6e7f", pos: 0 }, { color: "#bfe9ff", pos: 100 }] },
  { name: "Warm Flame", angle: 45, stops: [{ color: "#ff9a9e", pos: 0 }, { color: "#fad0c4", pos: 100 }] },
  { name: "Juicy Peach", angle: 90, stops: [{ color: "#ffecd2", pos: 0 }, { color: "#fcb69f", pos: 100 }] },
  { name: "Sky", stops: [{ color: "#56ccf2", pos: 0 }, { color: "#2f80ed", pos: 100 }] },
  { name: "Ocean", stops: [{ color: "#2193b0", pos: 0 }, { color: "#6dd5ed", pos: 100 }] },
  { name: "Mango", stops: [{ color: "#ffe259", pos: 0 }, { color: "#ffa751", pos: 100 }] },
  { name: "Emerald", stops: [{ color: "#11998e", pos: 0 }, { color: "#38ef7d", pos: 100 }] },
  { name: "Bloody Mary", stops: [{ color: "#ff512f", pos: 0 }, { color: "#dd2476", pos: 100 }] },
  { name: "Royal", stops: [{ color: "#141e30", pos: 0 }, { color: "#243b55", pos: 100 }] },
  { name: "Cosmic", stops: [{ color: "#ff00cc", pos: 0 }, { color: "#333399", pos: 100 }] },
  { name: "Aubergine", stops: [{ color: "#aa076b", pos: 0 }, { color: "#61045f", pos: 100 }] },
  { name: "Citrus", stops: [{ color: "#fdc830", pos: 0 }, { color: "#f37335", pos: 100 }] },
  { name: "Deep Space", stops: [{ color: "#000000", pos: 0 }, { color: "#434343", pos: 100 }] },
  { name: "Instagram", angle: 45, stops: [{ color: "#feda75", pos: 0 }, { color: "#d62976", pos: 50 }, { color: "#4f5bd5", pos: 100 }] },
  { name: "Vice City", stops: [{ color: "#3494e6", pos: 0 }, { color: "#ec6ead", pos: 100 }] },
  { name: "Cotton Candy", stops: [{ color: "#fbc2eb", pos: 0 }, { color: "#a6c1ee", pos: 100 }] },
  { name: "Aurora", angle: 120, stops: [{ color: "#00c6ff", pos: 0 }, { color: "#0072ff", pos: 50 }, { color: "#7b2ff7", pos: 100 }] },
  { name: "Peachy", stops: [{ color: "#ed4264", pos: 0 }, { color: "#ffedbc", pos: 100 }] },
  { name: "Lush", stops: [{ color: "#56ab2f", pos: 0 }, { color: "#a8e063", pos: 100 }] },
  { name: "Frost", stops: [{ color: "#000428", pos: 0 }, { color: "#004e92", pos: 100 }] },
  { name: "Flamingo", angle: 135, stops: [{ color: "#f12711", pos: 0 }, { color: "#f5af19", pos: 100 }] },
  { name: "Neon Life", stops: [{ color: "#b3ffab", pos: 0 }, { color: "#12fff7", pos: 100 }] },
  { name: "Purple Bliss", stops: [{ color: "#360033", pos: 0 }, { color: "#0b8793", pos: 100 }] },
  { name: "Rainbow", angle: 90, stops: [{ color: "#ff0000", pos: 0 }, { color: "#ff8000", pos: 20 }, { color: "#ffff00", pos: 40 }, { color: "#00ff00", pos: 60 }, { color: "#0080ff", pos: 80 }, { color: "#8000ff", pos: 100 }] },
];

const $ = (id: string) => document.getElementById(id);
const preview = $("gr-preview");
const bar = $("gr-bar");
const cssEl = $("gr-css");

if (preview && bar && cssEl) {
  const state: GrState = structuredClone(DEFAULTS);

  const angleEl = $("gr-angle") as HTMLInputElement;
  const stopColor = $("gr-stop-color") as HTMLInputElement;
  const stopPos = $("gr-stop-pos") as HTMLInputElement;

  // ── CSS builders ───────────────────────────────────────────────────────
  const sorted = () => [...state.stops].sort((a, b) => a.pos - b.pos);
  const stopStr = (s: Stop[]) => s.map((st) => `${st.color} ${Math.round(st.pos)}%`).join(", ");

  function gradientCss(): string {
    const stops = stopStr(sorted());
    if (state.type === "radial") return `radial-gradient(circle, ${stops})`;
    if (state.type === "conic") return `conic-gradient(from ${state.angle}deg, ${stops})`;
    return `linear-gradient(${state.angle}deg, ${stops})`;
  }

  /** Interpolated colour at position p (0..100) across the current stops. */
  function colorAt(p: number): string {
    const s = sorted();
    if (p <= s[0].pos) return s[0].color;
    if (p >= s[s.length - 1].pos) return s[s.length - 1].color;
    for (let i = 0; i < s.length - 1; i++) {
      if (p >= s[i].pos && p <= s[i + 1].pos) {
        const t = (p - s[i].pos) / (s[i + 1].pos - s[i].pos || 1);
        const c = mix(hexToRgb(s[i].color)!, hexToRgb(s[i + 1].color)!, t);
        return rgbToHex(c.r, c.g, c.b);
      }
    }
    return s[0].color;
  }

  // ── Render ─────────────────────────────────────────────────────────────
  function render() {
    const css = gradientCss();
    preview!.style.background = css;

    // Stop bar always shows left→right order so handles read clearly.
    bar!.style.background = `linear-gradient(90deg, ${stopStr(sorted())})`;
    bar!.innerHTML = state.stops
      .map((st, i) => {
        const on = i === state.active;
        return `<button type="button" data-i="${i}" class="gr-handle absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 shadow-md ${
          on ? "border-orange-500 ring-2 ring-orange-300 dark:ring-orange-500/50" : "border-white dark:border-slate-900"
        }" style="left:${st.pos}%;background:${st.color}"></button>`;
      })
      .join("");

    // Angle row only for linear / conic.
    $("gr-angle-wrap")!.style.visibility = state.type === "radial" ? "hidden" : "";
    $("gr-angle-val")!.textContent = String(state.angle);
    angleEl.value = String(state.angle);

    // Active stop editor.
    const a = state.stops[state.active];
    stopColor.value = a.color;
    $("gr-stop-color-hex")!.textContent = a.color;
    stopPos.value = String(Math.round(a.pos));
    $("gr-stop-pos-val")!.textContent = String(Math.round(a.pos));
    ($("gr-del") as HTMLButtonElement).disabled = state.stops.length <= MIN_STOPS;

    cssEl!.textContent = `background: ${css};`;
  }

  // ── Stop bar interaction (select / drag / add) ──────────────────────────
  let dragging = -1;
  function posFromEvent(clientX: number): number {
    const r = bar!.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
  }

  bar.addEventListener("pointerdown", (e) => {
    const h = (e.target as HTMLElement).closest(".gr-handle") as HTMLElement | null;
    if (h) {
      state.active = parseInt(h.dataset.i!);
      dragging = state.active;
      h.setPointerCapture?.(e.pointerId);
      render();
    }
  });
  bar.addEventListener("pointermove", (e) => {
    if (dragging < 0) return;
    state.stops[dragging].pos = posFromEvent(e.clientX);
    render();
  });
  const endDrag = () => (dragging = -1);
  bar.addEventListener("pointerup", endDrag);
  bar.addEventListener("pointercancel", endDrag);

  // Double-click empty bar → insert a stop with an interpolated colour.
  bar.addEventListener("dblclick", (e) => {
    if ((e.target as HTMLElement).closest(".gr-handle")) return;
    if (state.stops.length >= MAX_STOPS) return;
    const pos = posFromEvent(e.clientX);
    state.stops.push({ color: colorAt(pos), pos });
    state.active = state.stops.length - 1;
    render();
  });

  // ── Active-stop editor controls ─────────────────────────────────────────
  stopColor.addEventListener("input", () => {
    state.stops[state.active].color = stopColor.value;
    render();
  });
  stopPos.addEventListener("input", () => {
    state.stops[state.active].pos = parseInt(stopPos.value);
    render();
  });
  $("gr-add")!.addEventListener("click", () => {
    if (state.stops.length >= MAX_STOPS) return;
    const pos = 50;
    state.stops.push({ color: colorAt(pos), pos });
    state.active = state.stops.length - 1;
    render();
  });
  $("gr-del")!.addEventListener("click", () => {
    if (state.stops.length <= MIN_STOPS) return;
    state.stops.splice(state.active, 1);
    state.active = Math.min(state.active, state.stops.length - 1);
    render();
  });

  // ── Type segmented + angle ──────────────────────────────────────────────
  function paintType() {
    $("gr-type-group")!.querySelectorAll<HTMLButtonElement>("[data-val]").forEach((b) => {
      const on = b.dataset.val === state.type;
      b.className =
        "rounded-md px-3 py-1 text-xs font-semibold transition-colors " +
        (on ? "bg-orange-500 text-white" : "text-slate-600 dark:text-slate-300");
    });
  }
  $("gr-type-group")!.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-val]") as HTMLElement | null;
    if (!b) return;
    state.type = b.dataset.val as GType;
    paintType();
    render();
  });
  angleEl.addEventListener("input", () => {
    state.angle = parseInt(angleEl.value);
    render();
  });

  // ── Preset gallery ──────────────────────────────────────────────────────
  const presetsEl = $("gr-presets")!;
  presetsEl.innerHTML = PRESETS.map((p, i) => {
    const css = `linear-gradient(135deg, ${stopStr(p.stops)})`;
    return `<button type="button" data-preset="${i}" title="${p.name}" class="group overflow-hidden rounded-xl border border-slate-200 transition-transform hover:scale-[1.03] hover:border-orange-400 dark:border-slate-700">
      <span class="block h-12" style="background:${css}"></span>
      <span class="block truncate px-1.5 py-1 text-center text-[10px] font-medium text-slate-500 dark:text-slate-400">${p.name}</span>
    </button>`;
  }).join("");
  presetsEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-preset]") as HTMLElement | null;
    if (!b) return;
    const p = PRESETS[parseInt(b.dataset.preset!)];
    state.stops = structuredClone(p.stops);
    state.active = 0;
    if (p.type) state.type = p.type;
    if (p.angle !== undefined) state.angle = p.angle;
    paintType();
    render();
  });

  // ── Utilities ───────────────────────────────────────────────────────────
  const rand = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));
  $("gr-shuffle")!.addEventListener("click", () => {
    const base = rand(0, 360);
    const delta = [30, 60, 150, 180, 210][rand(0, 4)];
    const n = rand(2, 4);
    state.stops = Array.from({ length: n }, (_, i) => {
      const c = hslToRgb((base + (delta * i) / (n - 1)) % 360, rand(60, 85), rand(45, 62));
      return { color: rgbToHex(c.r, c.g, c.b), pos: Math.round((i / (n - 1)) * 100) };
    });
    state.active = 0;
    state.angle = rand(0, 36) * 10;
    render();
  });
  $("gr-reverse")!.addEventListener("click", () => {
    state.stops.forEach((s) => (s.pos = 100 - s.pos));
    render();
  });
  $("gr-reset")!.addEventListener("click", () => {
    Object.assign(state, structuredClone(DEFAULTS));
    paintType();
    render();
  });

  $("gr-fullscreen")!.addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[100]";
    overlay.style.background = gradientCss();
    const exit = document.createElement("button");
    exit.type = "button";
    exit.textContent = "✕ Exit (Esc)";
    exit.className =
      "absolute top-5 right-5 rounded-lg bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/60";
    overlay.appendChild(exit);
    const close = () => {
      overlay.remove();
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    exit.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(overlay);
  });

  $("gr-copy")!.addEventListener("click", () => copyText(cssEl!.textContent || ""));

  paintType();
  render();
}
