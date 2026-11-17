// CSS Background Patterns — premium grid + customize/export modal. Client-side.
import { CATEGORIES, DEFAULT_PARAMS, PATTERNS, type PatternDef, type PatternParams } from "../lib/patterns";
import { copyText } from "../lib/ui";

const searchInput = document.getElementById("bp-search") as HTMLInputElement | null;
const countEl = document.getElementById("bp-count");
const tabs = document.getElementById("bp-tabs");
const grid = document.getElementById("bp-grid");
const emptyEl = document.getElementById("bp-empty");
const modal = document.getElementById("bp-modal");

if (searchInput && countEl && tabs && grid && emptyEl && modal) {
  const $ = (id: string) => document.getElementById(id)!;

  // ── Build the pattern grid ──────────────────────────────────────────────
  function applyPatternStyle(el: HTMLElement, css: ReturnType<PatternDef["build"]>) {
    el.style.backgroundColor = css.backgroundColor;
    el.style.backgroundImage = css.backgroundImage;
    el.style.backgroundSize = css.backgroundSize;
    if (css.backgroundPosition) {
      el.style.backgroundPosition = css.backgroundPosition;
    } else {
      el.style.backgroundPosition = "";
    }
  }

  function patternCardMarkup(def: PatternDef): string {
    return `
      <div class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10 dark:border-slate-700 dark:bg-slate-900"
           data-cat="${def.category}" data-name="${def.name.toLowerCase()}" data-id="${def.id}">
        <div class="bp-card-preview h-28 sm:h-32" data-pid="${def.id}"></div>
        <div class="flex h-9 items-center justify-center px-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span class="truncate">${def.name}</span>
        </div>
        <div class="absolute inset-x-0 bottom-0 flex h-9 translate-y-full items-center gap-1.5 border-t border-slate-200 bg-white px-1.5 transition-transform duration-200 group-hover:translate-y-0 dark:border-slate-700 dark:bg-slate-900">
          <button data-act="customize" data-id="${def.id}" class="flex-1 rounded-md bg-orange-500 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-orange-600">Customize</button>
          <button data-act="quickcopy" data-id="${def.id}" class="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Copy CSS</button>
        </div>
      </div>`;
  }

  // Render grid
  grid.innerHTML = PATTERNS.map((def) => patternCardMarkup(def)).join("");

  // Apply pattern backgrounds to preview cards
  grid.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
    const def = PATTERNS.find((p) => p.id === el.dataset.pid);
    if (def) applyPatternStyle(el, def.build(DEFAULT_PARAMS));
  });

  // ── Category tabs / filter ────────────────────────────────────────────
  let activeCat = "All";
  let searchTerm = "";

  function renderTabs() {
    tabs!.innerHTML = CATEGORIES.map((cat) => {
      const active = cat === activeCat;
      return `<button data-cat="${cat}" class="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
          : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
      }">${cat}</button>`;
    }).join("");
  }

  function applyFilter() {
    let visible = 0;
    grid!.querySelectorAll<HTMLElement>("[data-cat]").forEach((card) => {
      const catMatch = activeCat === "All" || card.dataset.cat === activeCat;
      const nameMatch = !searchTerm || (card.dataset.name || "").includes(searchTerm);
      const show = catMatch && nameMatch;
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });
    countEl!.textContent = `${visible} pattern${visible !== 1 ? "s" : ""}`;
    emptyEl!.classList.toggle("hidden", visible > 0);
  }

  tabs.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("[data-cat]") as HTMLElement | null;
    if (!btn) return;
    activeCat = btn.dataset.cat!;
    renderTabs();
    applyFilter();
  });

  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.toLowerCase().trim();
    applyFilter();
  });

  renderTabs();
  applyFilter();

  // ── Modal ─────────────────────────────────────────────────────────────
  const colorEl = $("bp-m-color") as HTMLInputElement;
  const bgEl = $("bp-m-bg") as HTMLInputElement;
  const sizeEl = $("bp-m-size") as HTMLInputElement;
  const opacityEl = $("bp-m-opacity") as HTMLInputElement;
  let current: PatternDef | null = null;

  function params(): PatternParams {
    return {
      color: colorEl.value,
      bgColor: bgEl.value,
      size: parseInt(sizeEl.value),
      opacity: parseInt(opacityEl.value) / 100,
    };
  }

  function renderModal() {
    if (!current) return;
    const p = params();
    $("bp-m-size-val").textContent = sizeEl.value;
    $("bp-m-opacity-val").textContent = opacityEl.value;
    $("bp-m-color-hex").textContent = colorEl.value;
    $("bp-m-bg-hex").textContent = bgEl.value;

    const css = current.build(p);
    applyPatternStyle($("bp-modal-preview"), css);

    // Generate CSS text
    const lines: string[] = [
      `background-color: ${css.backgroundColor};`,
      `background-image: ${css.backgroundImage};`,
      `background-size: ${css.backgroundSize};`,
    ];
    if (css.backgroundPosition) {
      lines.push(`background-position: ${css.backgroundPosition};`);
    }
    $("bp-m-css").textContent = lines.join("\n");
  }

  function getCssText(def: PatternDef, p: PatternParams): string {
    const css = def.build(p);
    const lines: string[] = [
      `background-color: ${css.backgroundColor};`,
      `background-image: ${css.backgroundImage};`,
      `background-size: ${css.backgroundSize};`,
    ];
    if (css.backgroundPosition) {
      lines.push(`background-position: ${css.backgroundPosition};`);
    }
    return lines.join("\n");
  }

  function openModal(id: string) {
    current = PATTERNS.find((p) => p.id === id) || null;
    if (!current) return;
    $("bp-modal-title").textContent = current.name;
    $("bp-modal-category").textContent = current.category;
    // Reset controls
    colorEl.value = DEFAULT_PARAMS.color;
    bgEl.value = DEFAULT_PARAMS.bgColor;
    sizeEl.value = String(DEFAULT_PARAMS.size);
    opacityEl.value = String(DEFAULT_PARAMS.opacity * 100);
    renderModal();
    modal!.classList.remove("hidden");
    modal!.classList.add("flex");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal!.classList.add("hidden");
    modal!.classList.remove("flex");
    document.body.style.overflow = "";
  }

  // Grid click handlers
  grid.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("[data-act]") as HTMLElement | null;
    if (!btn) return;
    const id = btn.dataset.id!;
    if (btn.dataset.act === "customize") {
      openModal(id);
    } else if (btn.dataset.act === "quickcopy") {
      const def = PATTERNS.find((p) => p.id === id);
      if (def) copyText(getCssText(def, DEFAULT_PARAMS));
    }
  });

  // Modal controls
  [colorEl, bgEl, sizeEl, opacityEl].forEach((el) => el.addEventListener("input", renderModal));
  $("bp-modal-close").addEventListener("click", closeModal);
  $("bp-m-copy").addEventListener("click", () => copyText($("bp-m-css").textContent || ""));
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });

  // ── Quick presets ─────────────────────────────────────────────────────
  const presets: Record<string, Partial<PatternParams>> = {
    light: { color: "#e2e8f0", bgColor: "#ffffff", opacity: 0.6 },
    dark: { color: "#475569", bgColor: "#0f172a", opacity: 0.5 },
    vibrant: { color: "#f97316", bgColor: "#ffffff", opacity: 1 },
    subtle: { color: "#94a3b8", bgColor: "#f8fafc", opacity: 0.15 },
    warm: { color: "#dc2626", bgColor: "#fef2f2", opacity: 0.4 },
    cool: { color: "#3b82f6", bgColor: "#eff6ff", opacity: 0.4 },
  };

  $("bp-presets").addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("[data-preset]") as HTMLElement | null;
    if (!btn) return;
    const p = presets[btn.dataset.preset!];
    if (!p) return;
    if (p.color !== undefined) colorEl.value = p.color;
    if (p.bgColor !== undefined) bgEl.value = p.bgColor;
    if (p.opacity !== undefined) opacityEl.value = String(p.opacity * 100);
    renderModal();
  });
}
