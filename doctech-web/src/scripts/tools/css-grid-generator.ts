// CSS Grid Generator — premium visual track editor. Client-side.
// Per-track sizing (fr/px/%/auto), add/remove tracks, gaps, drag-to-create grid
// areas on the live preview, layout presets, and container + item CSS output.
import { copyText } from "../lib/ui";

type Unit = "fr" | "px" | "%" | "auto";
interface Track { size: number; unit: Unit }
interface Area { c1: number; c2: number; r1: number; r2: number } // 1-based, inclusive
interface GdState { cols: Track[]; rows: Track[]; colGap: number; rowGap: number; areas: Area[] }

const MIN = 1, MAX = 12;
const AREA_COLORS = ["#f97316", "#3b82f6", "#10b981", "#a855f7", "#ec4899", "#f59e0b", "#06b6d4", "#ef4444"];

const fr = (n: number): Track => ({ size: n, unit: "fr" });
const px = (n: number): Track => ({ size: n, unit: "px" });

const DEFAULTS: GdState = {
  cols: [fr(1), fr(1), fr(1)],
  rows: [fr(1), fr(1)],
  colGap: 12,
  rowGap: 12,
  areas: [],
};

const PRESETS: { name: string; state: GdState }[] = [
  {
    name: "Holy Grail",
    state: { cols: [px(180), fr(1), px(180)], rows: [px(60), fr(1), px(60)], colGap: 10, rowGap: 10,
      areas: [{ c1: 1, c2: 3, r1: 1, r2: 1 }, { c1: 1, c2: 1, r1: 2, r2: 2 }, { c1: 2, c2: 2, r1: 2, r2: 2 }, { c1: 3, c2: 3, r1: 2, r2: 2 }, { c1: 1, c2: 3, r1: 3, r2: 3 }] },
  },
  {
    name: "Sidebar",
    state: { cols: [px(220), fr(1)], rows: [fr(1)], colGap: 12, rowGap: 12,
      areas: [{ c1: 1, c2: 1, r1: 1, r2: 1 }, { c1: 2, c2: 2, r1: 1, r2: 1 }] },
  },
  {
    name: "Header/Footer",
    state: { cols: [fr(1)], rows: [px(60), fr(1), px(60)], colGap: 0, rowGap: 10,
      areas: [{ c1: 1, c2: 1, r1: 1, r2: 1 }, { c1: 1, c2: 1, r1: 2, r2: 2 }, { c1: 1, c2: 1, r1: 3, r2: 3 }] },
  },
  {
    name: "Dashboard",
    state: { cols: [fr(1), fr(1), fr(1), fr(1)], rows: [px(56), fr(1), fr(1)], colGap: 12, rowGap: 12,
      areas: [{ c1: 1, c2: 4, r1: 1, r2: 1 }, { c1: 1, c2: 1, r1: 2, r2: 3 }, { c1: 2, c2: 3, r1: 2, r2: 2 }, { c1: 4, c2: 4, r1: 2, r2: 2 }, { c1: 2, c2: 4, r1: 3, r2: 3 }] },
  },
  {
    name: "Gallery 3×3",
    state: { cols: [fr(1), fr(1), fr(1)], rows: [fr(1), fr(1), fr(1)], colGap: 10, rowGap: 10, areas: [] },
  },
  {
    name: "Feature + Grid",
    state: { cols: [fr(2), fr(1), fr(1)], rows: [fr(1), fr(1)], colGap: 12, rowGap: 12,
      areas: [{ c1: 1, c2: 1, r1: 1, r2: 2 }, { c1: 2, c2: 2, r1: 1, r2: 1 }, { c1: 3, c2: 3, r1: 1, r2: 1 }, { c1: 2, c2: 3, r1: 2, r2: 2 }] },
  },
];

const $ = (id: string) => document.getElementById(id);
const guides = $("gd-guides");
const overlay = $("gd-overlay");
const cssEl = $("gd-css");

if (guides && overlay && cssEl) {
  const state: GdState = structuredClone(DEFAULTS);

  const trackCss = (t: Track) => (t.unit === "auto" ? "auto" : `${t.size}${t.unit}`);
  const colsTpl = () => state.cols.map(trackCss).join(" ");
  const rowsTpl = () => state.rows.map(trackCss).join(" ");

  // Keep areas inside the current track bounds.
  function sanitizeAreas() {
    const C = state.cols.length, R = state.rows.length;
    state.areas = state.areas.filter((a) => a.c1 <= C && a.r1 <= R).map((a) => ({
      c1: a.c1, r1: a.r1, c2: Math.min(a.c2, C), r2: Math.min(a.r2, R),
    }));
  }

  // ── Render ─────────────────────────────────────────────────────────────
  function applyTemplate(el: HTMLElement) {
    el.style.gridTemplateColumns = colsTpl();
    el.style.gridTemplateRows = rowsTpl();
    el.style.columnGap = `${state.colGap}px`;
    el.style.rowGap = `${state.rowGap}px`;
  }

  function renderGuides() {
    applyTemplate(guides!);
    const C = state.cols.length, R = state.rows.length;
    let html = "";
    for (let r = 1; r <= R; r++)
      for (let c = 1; c <= C; c++)
        html += `<div data-c="${c}" data-r="${r}" class="gd-cell rounded-md border border-dashed border-slate-300 bg-slate-100/60 dark:border-slate-600 dark:bg-slate-800/40"></div>`;
    guides!.innerHTML = html;
  }

  function renderOverlay() {
    applyTemplate(overlay!);
    overlay!.innerHTML = state.areas
      .map((a, i) => {
        const col = AREA_COLORS[i % AREA_COLORS.length];
        return `<div class="relative flex items-center justify-center rounded-md text-xs font-bold text-white" style="grid-column:${a.c1}/${a.c2 + 1};grid-row:${a.r1}/${a.r2 + 1};background:${col}d9;border:2px solid ${col}">
          item-${i + 1}
          <button data-rm="${i}" class="pointer-events-auto absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded bg-black/25 text-[10px] leading-none hover:bg-black/50" title="Remove">✕</button>
        </div>`;
      })
      .join("");
  }

  function renderControls() {
    $("gd-col-count")!.textContent = String(state.cols.length);
    $("gd-row-count")!.textContent = String(state.rows.length);
    $("gd-colgap-val")!.textContent = String(state.colGap);
    $("gd-rowgap-val")!.textContent = String(state.rowGap);
    $("gd-area-count")!.textContent = String(state.areas.length);

    const trackRow = (axis: "col" | "row", t: Track, i: number) => `
      <div class="flex items-center gap-1.5" data-axis="${axis}" data-i="${i}">
        <span class="w-9 shrink-0 text-xs font-medium text-slate-500">${axis === "col" ? "Col" : "Row"} ${i + 1}</span>
        <input data-role="size" type="number" min="0" step="0.5" value="${t.size}" ${t.unit === "auto" ? "disabled" : ""}
          class="w-16 rounded border border-slate-300 bg-white px-1.5 py-1 text-xs disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        <select data-role="unit" class="rounded border border-slate-300 bg-white px-1 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          ${(["fr", "px", "%", "auto"] as Unit[]).map((u) => `<option ${u === t.unit ? "selected" : ""}>${u}</option>`).join("")}
        </select>
      </div>`;
    $("gd-col-list")!.innerHTML = state.cols.map((t, i) => trackRow("col", t, i)).join("");
    $("gd-row-list")!.innerHTML = state.rows.map((t, i) => trackRow("row", t, i)).join("");
  }

  function renderCss() {
    const lines = [
      ".grid {",
      "  display: grid;",
      `  grid-template-columns: ${colsTpl()};`,
      `  grid-template-rows: ${rowsTpl()};`,
      `  gap: ${state.rowGap}px ${state.colGap}px;`,
      "}",
    ];
    state.areas.forEach((a, i) =>
      lines.push(`.item-${i + 1} { grid-column: ${a.c1} / ${a.c2 + 1}; grid-row: ${a.r1} / ${a.r2 + 1}; }`),
    );
    cssEl!.textContent = lines.join("\n");
  }

  function render() {
    renderGuides();
    renderOverlay();
    renderControls();
    renderCss();
  }

  // ── Drag-to-create areas ────────────────────────────────────────────────
  let dragging = false;
  let startCell: { c: number; r: number } | null = null;
  let endCell: { c: number; r: number } | null = null;

  function highlight() {
    if (!startCell || !endCell) return;
    const cMin = Math.min(startCell.c, endCell.c), cMax = Math.max(startCell.c, endCell.c);
    const rMin = Math.min(startCell.r, endCell.r), rMax = Math.max(startCell.r, endCell.r);
    guides!.querySelectorAll<HTMLElement>(".gd-cell").forEach((cell) => {
      const c = +cell.dataset.c!, r = +cell.dataset.r!;
      const on = c >= cMin && c <= cMax && r >= rMin && r <= rMax;
      cell.classList.toggle("!bg-orange-300/60", on);
      cell.classList.toggle("!border-orange-400", on);
    });
  }

  guides.addEventListener("pointerdown", (e) => {
    const cell = (e.target as HTMLElement).closest(".gd-cell") as HTMLElement | null;
    if (!cell) return;
    dragging = true;
    startCell = endCell = { c: +cell.dataset.c!, r: +cell.dataset.r! };
    highlight();
  });
  guides.addEventListener("pointerover", (e) => {
    if (!dragging) return;
    const cell = (e.target as HTMLElement).closest(".gd-cell") as HTMLElement | null;
    if (!cell) return;
    endCell = { c: +cell.dataset.c!, r: +cell.dataset.r! };
    highlight();
  });
  window.addEventListener("pointerup", () => {
    if (!dragging || !startCell || !endCell) return;
    dragging = false;
    state.areas.push({
      c1: Math.min(startCell.c, endCell.c), c2: Math.max(startCell.c, endCell.c),
      r1: Math.min(startCell.r, endCell.r), r2: Math.max(startCell.r, endCell.r),
    });
    startCell = endCell = null;
    render();
  });

  // Remove an area via its ✕.
  overlay.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-rm]") as HTMLElement | null;
    if (!b) return;
    state.areas.splice(parseInt(b.dataset.rm!), 1);
    render();
  });

  // ── Track count steppers ────────────────────────────────────────────────
  function step(axis: "cols" | "rows", delta: number) {
    const arr = state[axis];
    if (delta > 0 && arr.length < MAX) arr.push(fr(1));
    else if (delta < 0 && arr.length > MIN) arr.pop();
    sanitizeAreas();
    render();
  }
  $("gd-col-plus")!.addEventListener("click", () => step("cols", 1));
  $("gd-col-minus")!.addEventListener("click", () => step("cols", -1));
  $("gd-row-plus")!.addEventListener("click", () => step("rows", 1));
  $("gd-row-minus")!.addEventListener("click", () => step("rows", -1));

  // ── Per-track size / unit edits (delegated) ─────────────────────────────
  function wireTrackList(listId: string, axis: "cols" | "rows") {
    const list = $(listId)!;
    const onEdit = (e: Event) => {
      const row = (e.target as HTMLElement).closest("[data-i]") as HTMLElement | null;
      if (!row) return;
      const i = parseInt(row.dataset.i!);
      const role = (e.target as HTMLElement).dataset.role;
      const t = state[axis][i];
      if (role === "unit") t.unit = (e.target as HTMLSelectElement).value as Unit;
      else if (role === "size") t.size = parseFloat((e.target as HTMLInputElement).value) || 0;
      // Re-render only template + css live; rebuild controls only on unit change (enables/disables input).
      applyTemplate(guides!);
      applyTemplate(overlay!);
      renderCss();
      if (role === "unit") renderControls();
    };
    list.addEventListener("input", onEdit);
    list.addEventListener("change", onEdit);
  }
  wireTrackList("gd-col-list", "cols");
  wireTrackList("gd-row-list", "rows");

  // ── Gaps ─────────────────────────────────────────────────────────────────
  ($("gd-colgap") as HTMLInputElement).addEventListener("input", (e) => {
    state.colGap = parseInt((e.target as HTMLInputElement).value);
    applyTemplate(guides!); applyTemplate(overlay!);
    $("gd-colgap-val")!.textContent = String(state.colGap); renderCss();
  });
  ($("gd-rowgap") as HTMLInputElement).addEventListener("input", (e) => {
    state.rowGap = parseInt((e.target as HTMLInputElement).value);
    applyTemplate(guides!); applyTemplate(overlay!);
    $("gd-rowgap-val")!.textContent = String(state.rowGap); renderCss();
  });

  // ── Clear areas / reset ──────────────────────────────────────────────────
  $("gd-clear")!.addEventListener("click", () => { state.areas = []; render(); });
  $("gd-reset")!.addEventListener("click", () => { Object.assign(state, structuredClone(DEFAULTS)); syncGapInputs(); render(); });

  function syncGapInputs() {
    ($("gd-colgap") as HTMLInputElement).value = String(state.colGap);
    ($("gd-rowgap") as HTMLInputElement).value = String(state.rowGap);
  }

  // ── Presets ────────────────────────────────────────────────────────────
  const presetsEl = $("gd-presets")!;
  presetsEl.innerHTML = PRESETS.map((p, i) => {
    // Thumbnails use uniform (1fr) tracks so the layout diagram always reads
    // cleanly, regardless of the preset's real px/fr track sizes.
    const C = p.state.cols.length, R = p.state.rows.length;
    const cells = p.state.areas.length
      ? p.state.areas
          .map((a, j) => `<span style="grid-column:${a.c1}/${a.c2 + 1};grid-row:${a.r1}/${a.r2 + 1};background:${AREA_COLORS[j % AREA_COLORS.length]}"></span>`)
          .join("")
      : Array.from({ length: C * R }, () => `<span style="background:${AREA_COLORS[0]}"></span>`).join("");
    return `<button type="button" data-preset="${i}" title="${p.name}" class="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <span class="grid h-14 gap-1 p-2 [&>span]:rounded-[3px]" style="grid-template-columns:repeat(${C},1fr);grid-template-rows:repeat(${R},1fr)">${cells}</span>
      <span class="block truncate border-t border-slate-100 px-1.5 py-1 text-center text-[10px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">${p.name}</span>
    </button>`;
  }).join("");
  presetsEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-preset]") as HTMLElement | null;
    if (!b) return;
    Object.assign(state, structuredClone(PRESETS[parseInt(b.dataset.preset!)].state));
    syncGapInputs();
    render();
  });

  $("gd-copy")!.addEventListener("click", () => copyText(cssEl!.textContent || ""));

  syncGapInputs();
  render();
}
