// Border Radius Generator — premium interactive editor. Client-side.
// Drag handles on each edge for elliptical / organic-blob corners, link mode,
// px/% units, a shape preset gallery, shuffle/reset, and full CSS output.
import { copyText } from "../lib/ui";

type Corner = "tl" | "tr" | "br" | "bl";
type Axis = "x" | "y";
type Unit = "%" | "px";
interface CornerVal { x: number; y: number }
interface BrState { tl: CornerVal; tr: CornerVal; br: CornerVal; bl: CornerVal; unit: Unit; linked: boolean; size: number }

const ORDER: Corner[] = ["tl", "tr", "br", "bl"];
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// 8 edge handles — 2 per edge, each tied to a corner + axis.
const HANDLES: { corner: Corner; axis: Axis; edge: "top" | "bottom" | "left" | "right" }[] = [
  { corner: "tl", axis: "x", edge: "top" },
  { corner: "tr", axis: "x", edge: "top" },
  { corner: "bl", axis: "x", edge: "bottom" },
  { corner: "br", axis: "x", edge: "bottom" },
  { corner: "tl", axis: "y", edge: "left" },
  { corner: "bl", axis: "y", edge: "left" },
  { corner: "tr", axis: "y", edge: "right" },
  { corner: "br", axis: "y", edge: "right" },
];

const c = (x: number, y: number): CornerVal => ({ x, y });
const DEFAULTS: BrState = { tl: c(30, 30), tr: c(30, 30), br: c(30, 30), bl: c(30, 30), unit: "px", linked: true, size: 240 };

// Shape presets (corner values in %).
const PRESETS: { name: string; s: Partial<BrState> & { tl: CornerVal; tr: CornerVal; br: CornerVal; bl: CornerVal } }[] = [
  { name: "Rounded", s: { unit: "px", tl: c(20, 20), tr: c(20, 20), br: c(20, 20), bl: c(20, 20) } },
  { name: "Circle", s: { tl: c(50, 50), tr: c(50, 50), br: c(50, 50), bl: c(50, 50) } },
  { name: "Squircle", s: { tl: c(35, 35), tr: c(35, 35), br: c(35, 35), bl: c(35, 35) } },
  { name: "Blob 1", s: { tl: c(30, 30), tr: c(70, 30), br: c(70, 70), bl: c(30, 70) } },
  { name: "Blob 2", s: { tl: c(60, 60), tr: c(40, 30), br: c(30, 70), bl: c(70, 40) } },
  { name: "Blob 3", s: { tl: c(40, 55), tr: c(60, 45), br: c(65, 55), bl: c(35, 45) } },
  { name: "Leaf", s: { tl: c(0, 0), tr: c(100, 100), br: c(0, 0), bl: c(100, 100) } },
  { name: "Egg", s: { tl: c(50, 60), tr: c(50, 60), br: c(50, 40), bl: c(50, 40) } },
  { name: "Teardrop", s: { tl: c(50, 50), tr: c(50, 50), br: c(50, 50), bl: c(0, 0) } },
  { name: "Petal", s: { tl: c(0, 0), tr: c(50, 50), br: c(0, 0), bl: c(50, 50) } },
];

const $ = (id: string) => document.getElementById(id);
const wrap = $("br-wrap");
const stage = $("br-stage");
const cssEl = $("br-css");

if (wrap && stage && cssEl) {
  const state: BrState = structuredClone(DEFAULTS);
  const maxVal = () => (state.unit === "%" ? 100 : state.size);

  // ── Build shape + handles once (so drag isn't interrupted by re-render) ──
  wrap.innerHTML = `<div id="br-shape" class="h-full w-full border-2 border-orange-400 bg-orange-200/70 dark:bg-orange-500/25"></div>`;
  const shape = $("br-shape") as HTMLElement;
  const handleEls = HANDLES.map((h, i) => {
    const el = document.createElement("button");
    el.type = "button";
    el.dataset.i = String(i);
    el.className =
      "absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-white bg-orange-500 shadow ring-1 ring-black/10 active:cursor-grabbing dark:border-slate-900";
    wrap!.appendChild(el);
    return el;
  });

  // ── CSS value ───────────────────────────────────────────────────────────
  function radiusValue(): string {
    const u = state.unit;
    const hx = ORDER.map((k) => `${state[k].x}${u}`).join(" ");
    const symmetric = ORDER.every((k) => state[k].x === state[k].y);
    if (symmetric) return hx;
    const vy = ORDER.map((k) => `${state[k].y}${u}`).join(" ");
    return `${hx} / ${vy}`;
  }

  // ── Handle geometry ─────────────────────────────────────────────────────
  function frac(corner: Corner, axis: Axis) {
    return clamp(state[corner][axis] / maxVal(), 0, 1);
  }
  function placeHandle(i: number) {
    const h = HANDLES[i], S = state.size, f = frac(h.corner, h.axis), el = handleEls[i];
    if (h.axis === "x") {
      el.style.top = `${h.edge === "top" ? 0 : S}px`;
      el.style.left = `${h.corner === "tl" || h.corner === "bl" ? f * S : S - f * S}px`;
    } else {
      el.style.left = `${h.edge === "left" ? 0 : S}px`;
      el.style.top = `${h.corner === "tl" || h.corner === "tr" ? f * S : S - f * S}px`;
    }
  }
  function valueFromMouse(i: number, mx: number, my: number) {
    const h = HANDLES[i], S = state.size;
    let f: number;
    if (h.axis === "x") f = h.corner === "tl" || h.corner === "bl" ? mx / S : (S - mx) / S;
    else f = h.corner === "tl" || h.corner === "tr" ? my / S : (S - my) / S;
    return Math.round(clamp(f, 0, 1) * maxVal());
  }
  function applyValue(i: number, val: number) {
    const h = HANDLES[i];
    if (state.linked) ORDER.forEach((k) => (state[k][h.axis] = val));
    else state[h.corner][h.axis] = val;
  }

  // ── Render ──────────────────────────────────────────────────────────────
  function render() {
    wrap!.style.width = wrap!.style.height = `${state.size}px`;
    shape.style.borderRadius = radiusValue();
    handleEls.forEach((_, i) => placeHandle(i));

    // Numeric inputs + labels
    ORDER.forEach((k) => {
      (["x", "y"] as Axis[]).forEach((ax) => {
        const inp = $(`br-${k}-${ax}`) as HTMLInputElement | null;
        if (inp) { inp.value = String(state[k][ax]); inp.max = String(maxVal()); }
      });
    });
    $("br-size-val")!.textContent = String(state.size);
    paintBtn("br-unit-group", state.unit);
    ($("br-link") as HTMLButtonElement).setAttribute("aria-pressed", String(state.linked));
    $("br-link")!.className = state.linked
      ? "rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white"
      : "rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800";

    cssEl!.textContent = `border-radius: ${radiusValue()};`;
  }

  function paintBtn(groupId: string, active: string) {
    $(groupId)!.querySelectorAll<HTMLButtonElement>("[data-val]").forEach((b) => {
      const on = b.dataset.val === active;
      b.className = "rounded-md px-3 py-1 text-xs font-semibold transition-colors " + (on ? "bg-orange-500 text-white" : "text-slate-600 dark:text-slate-300");
    });
  }

  // ── Drag ────────────────────────────────────────────────────────────────
  let drag = -1;
  handleEls.forEach((el, i) =>
    el.addEventListener("pointerdown", (e) => {
      drag = i;
      el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    }),
  );
  document.addEventListener("pointermove", (e) => {
    if (drag < 0) return;
    const r = wrap!.getBoundingClientRect();
    applyValue(drag, valueFromMouse(drag, e.clientX - r.left, e.clientY - r.top));
    render();
  });
  document.addEventListener("pointerup", () => (drag = -1));

  // ── Numeric inputs ──────────────────────────────────────────────────────
  ORDER.forEach((k) =>
    (["x", "y"] as Axis[]).forEach((ax) => {
      const inp = $(`br-${k}-${ax}`) as HTMLInputElement;
      inp.addEventListener("input", () => {
        const v = clamp(parseInt(inp.value) || 0, 0, maxVal());
        if (state.linked) ORDER.forEach((c2) => (state[c2][ax] = v));
        else state[k][ax] = v;
        render();
      });
    }),
  );

  // ── Unit toggle (convert values to preserve shape) ──────────────────────
  $("br-unit-group")!.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-val]") as HTMLElement | null;
    if (!b || b.dataset.val === state.unit) return;
    const to = b.dataset.val as Unit, S = state.size;
    const conv = (v: number) => (to === "%" ? Math.round((v / S) * 100) : Math.round((v / 100) * S));
    ORDER.forEach((k) => { state[k].x = conv(state[k].x); state[k].y = conv(state[k].y); });
    state.unit = to;
    render();
  });

  // ── Link toggle ─────────────────────────────────────────────────────────
  $("br-link")!.addEventListener("click", () => {
    state.linked = !state.linked;
    if (state.linked) ORDER.slice(1).forEach((k) => { state[k] = { ...state.tl }; });
    render();
  });

  // ── Size ────────────────────────────────────────────────────────────────
  ($("br-size") as HTMLInputElement).addEventListener("input", (e) => {
    state.size = parseInt((e.target as HTMLInputElement).value);
    if (state.unit === "px") ORDER.forEach((k) => { state[k].x = clamp(state[k].x, 0, state.size); state[k].y = clamp(state[k].y, 0, state.size); });
    render();
  });

  // ── Preset gallery ──────────────────────────────────────────────────────
  const presetsEl = $("br-presets")!;
  presetsEl.innerHTML = PRESETS.map((p, i) => {
    const u = p.s.unit || "%";
    const hx = ORDER.map((k) => `${p.s[k].x}${u}`).join(" ");
    const sym = ORDER.every((k) => p.s[k].x === p.s[k].y);
    const val = sym ? hx : `${hx} / ${ORDER.map((k) => `${p.s[k].y}${u}`).join(" ")}`;
    return `<button type="button" data-preset="${i}" title="${p.name}" class="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-2 transition-colors hover:border-orange-400 dark:border-slate-700">
      <span class="h-12 w-12 border-2 border-orange-400 bg-orange-200/70 dark:bg-orange-500/25" style="border-radius:${val}"></span>
      <span class="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">${p.name}</span>
    </button>`;
  }).join("");
  presetsEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-preset]") as HTMLElement | null;
    if (!b) return;
    const p = PRESETS[parseInt(b.dataset.preset!)];
    state.unit = p.s.unit || "%";
    ORDER.forEach((k) => (state[k] = { ...p.s[k] }));
    state.linked = ORDER.every((k) => state[k].x === state.tl.x && state[k].y === state.tl.y);
    render();
  });

  // ── Shuffle (organic blob) / Reset ──────────────────────────────────────
  const rnd = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));
  $("br-shuffle")!.addEventListener("click", () => {
    state.unit = "%";
    state.linked = false;
    ORDER.forEach((k) => (state[k] = c(rnd(10, 90), rnd(10, 90))));
    render();
  });
  $("br-reset")!.addEventListener("click", () => { Object.assign(state, structuredClone(DEFAULTS)); render(); });

  $("br-copy")!.addEventListener("click", () => copyText(cssEl!.textContent || ""));

  render();
}
