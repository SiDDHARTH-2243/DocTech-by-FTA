// CSS Loader Generator — premium engine with trending picks. Client-side.
// Features: trending/popular section, category filtering, quick color presets,
// customization modal, code export with copy.
import { CATEGORIES, DEFAULT_PARAMS, LOADERS, type LoaderDef, type LoaderParams } from "../lib/loaders";
import { cardMarkup, copyText } from "../lib/ui";

// ── Trending / popular loader IDs (hand-picked best sellers) ─────────────────
const TRENDING_IDS = [
  "ring",           // Classic — everyone's first loader
  "conic",          // Modern conic gradient spinner
  "dots-bounce",    // The most universally used dot loader
  "ios-spinner",    // iOS-style, hugely popular
  "progress-dual",  // Material design indeterminate bar
  "blob-morph",     // Trendy gooey morphing blob
  "skeleton-card",  // Skeleton UI — big trend
  "ripple",         // Expanding ripple — very popular
  "bars-eq",        // Equalizer bars — audio apps
  "cube-3d",        // 3D cube — premium feel
];

const tabs = document.getElementById("ld-tabs");
const grid = document.getElementById("ld-grid");
const trendingGrid = document.getElementById("ld-trending-grid");
const modal = document.getElementById("ld-modal");

if (tabs && grid && trendingGrid && modal) {
  // ── Grid styles + cards ─────────────────────────────────────────────────
  const gridStyle = document.createElement("style");
  document.head.appendChild(gridStyle);

  let gridCss = "";
  grid.innerHTML = LOADERS.map((def) => {
    const { css, html } = def.build(DEFAULT_PARAMS, `g-${def.id}`);
    gridCss += css;
    return cardMarkup(def.id, def.name, def.category, html, DEFAULT_PARAMS.bg);
  }).join("");
  gridStyle.textContent = gridCss;

  // ── Trending section ───────────────────────────────────────────────────
  const trendingStyle = document.createElement("style");
  document.head.appendChild(trendingStyle);

  let trendingCss = "";
  const trendingLoaders = TRENDING_IDS
    .map((id) => LOADERS.find((l) => l.id === id))
    .filter(Boolean) as LoaderDef[];

  trendingGrid.innerHTML = trendingLoaders.map((def) => {
    const { css, html } = def.build(DEFAULT_PARAMS, `t-${def.id}`);
    trendingCss += css;
    return cardMarkup(def.id, def.name, def.category, html, DEFAULT_PARAMS.bg);
  }).join("");
  trendingStyle.textContent = trendingCss;

  // Update trending count badge
  const trendingCount = document.getElementById("ld-trending-count");
  if (trendingCount) trendingCount.textContent = String(trendingLoaders.length);

  // Update total count
  const totalEl = document.getElementById("ld-total");
  if (totalEl) totalEl.textContent = `${LOADERS.length} loaders`;

  // ── Category tabs / filter ──────────────────────────────────────────────
  let activeCat = "All";

  function renderTabs() {
    // Count loaders per category
    const counts: Record<string, number> = {};
    LOADERS.forEach((l) => {
      counts[l.category] = (counts[l.category] || 0) + 1;
    });

    tabs!.innerHTML = CATEGORIES.map((cat) => {
      const active = cat === activeCat;
      const count = cat === "All" ? LOADERS.length : (counts[cat] || 0);
      return `<button data-cat="${cat}" class="rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-orange-500 text-white"
          : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
      }">${cat} <span class="text-[10px] opacity-70">${count}</span></button>`;
    }).join("");
  }

  function applyFilter() {
    grid!.querySelectorAll<HTMLElement>("[data-cat]").forEach((card) => {
      card.style.display = activeCat === "All" || card.dataset.cat === activeCat ? "" : "none";
    });
  }

  tabs.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("[data-cat]") as HTMLElement | null;
    if (!btn) return;
    activeCat = btn.dataset.cat!;
    renderTabs();
    applyFilter();
  });
  renderTabs();

  // ── Modal ───────────────────────────────────────────────────────────────
  const modalStyle = document.createElement("style");
  document.head.appendChild(modalStyle);
  const $ = (id: string) => document.getElementById(id)!;
  const sizeEl = $("ld-size") as HTMLInputElement;
  const speedEl = $("ld-speed") as HTMLInputElement;
  const thickEl = $("ld-thick") as HTMLInputElement;
  const colorEl = $("ld-color") as HTMLInputElement;
  const bgEl = $("ld-bg") as HTMLInputElement;
  let current: LoaderDef | null = null;

  function params(): LoaderParams {
    return {
      size: parseInt(sizeEl.value),
      speed: parseFloat(speedEl.value),
      thickness: parseInt(thickEl.value),
      color: colorEl.value,
      bg: bgEl.value,
    };
  }

  function renderModal() {
    if (!current) return;
    const p = params();
    $("ld-size-val").textContent = sizeEl.value;
    $("ld-speed-val").textContent = speedEl.value;
    $("ld-thick-val").textContent = thickEl.value;

    const { css, html } = current.build(p, "loader");
    modalStyle.textContent = css;
    $("ld-modal-loader").innerHTML = html;
    $("ld-modal-canvas").style.background = p.bg;
    $("ld-html").textContent = html;
    $("ld-css").textContent = css;
  }

  function openModal(id: string) {
    current = LOADERS.find((l) => l.id === id) || null;
    if (!current) return;
    $("ld-modal-title").textContent = current.name;
    $("ld-modal-cat").textContent = current.category;
    // Reset controls to defaults for a predictable starting point.
    sizeEl.value = String(DEFAULT_PARAMS.size);
    speedEl.value = String(DEFAULT_PARAMS.speed);
    thickEl.value = String(DEFAULT_PARAMS.thickness);
    colorEl.value = DEFAULT_PARAMS.color;
    bgEl.value = DEFAULT_PARAMS.bg;
    renderModal();
    modal!.classList.remove("hidden");
    modal!.classList.add("flex");
  }
  function closeModal() {
    modal!.classList.add("hidden");
    modal!.classList.remove("flex");
  }

  // Click handlers for both trending grid and main grid
  function handleGridClick(e: Event) {
    const btn = (e.target as HTMLElement).closest("[data-act]") as HTMLElement | null;
    if (btn) openModal(btn.dataset.id!);
  }

  grid.addEventListener("click", handleGridClick);
  trendingGrid.addEventListener("click", handleGridClick);

  // Slider / color inputs
  [sizeEl, speedEl, thickEl, colorEl, bgEl].forEach((el) => el.addEventListener("input", renderModal));

  // Quick color presets
  document.querySelectorAll<HTMLButtonElement>("[data-qcolor]").forEach((btn) => {
    btn.addEventListener("click", () => {
      colorEl.value = btn.dataset.qcolor!;
      bgEl.value = btn.dataset.qbg!;
      renderModal();
    });
  });

  // Modal close
  $("ld-modal-close").addEventListener("click", closeModal);
  $("ld-html-copy").addEventListener("click", () => copyText($("ld-html").textContent || ""));
  $("ld-css-copy").addEventListener("click", () => copyText($("ld-css").textContent || ""));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });
}
