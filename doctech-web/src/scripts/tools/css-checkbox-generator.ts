// CSS Checkbox Generator — premium engine with trending picks. Client-side.
// Trending/popular section, category filtering (with counts), quick color
// presets, customization modal, code export with copy.
import { CATEGORIES, CHECKBOXES, DEFAULT_PARAMS, type CheckboxDef, type CheckboxParams } from "../lib/checkboxes";
import { cardMarkup, copyText } from "../lib/ui";

// Hand-picked trending checkbox IDs.
const TRENDING_IDS = [
  "classic-check", "round-check", "draw-check", "material-ripple", "neon-glow",
  "glass", "gradient-fill", "heart", "confetti", "spring-draw",
];

const tabs = document.getElementById("cb-tabs");
const grid = document.getElementById("cb-grid");
const trendingGrid = document.getElementById("cb-trending-grid");
const modal = document.getElementById("cb-modal");

if (tabs && grid && trendingGrid && modal) {
  // ── Grid styles + cards ─────────────────────────────────────────────────
  const gridStyle = document.createElement("style");
  document.head.appendChild(gridStyle);

  let gridCss = "";
  grid.innerHTML = CHECKBOXES.map((def) => {
    const { css, html } = def.build(DEFAULT_PARAMS, `g-${def.id}`);
    gridCss += css;
    return cardMarkup(def.id, def.name, def.category, html, DEFAULT_PARAMS.bg);
  }).join("");
  gridStyle.textContent = gridCss;

  // ── Trending section ───────────────────────────────────────────────────
  const trendingStyle = document.createElement("style");
  document.head.appendChild(trendingStyle);

  let trendingCss = "";
  const trending = TRENDING_IDS.map((id) => CHECKBOXES.find((c) => c.id === id)).filter(Boolean) as CheckboxDef[];
  trendingGrid.innerHTML = trending.map((def) => {
    const { css, html } = def.build(DEFAULT_PARAMS, `t-${def.id}`);
    trendingCss += css;
    return cardMarkup(def.id, def.name, def.category, html, DEFAULT_PARAMS.bg);
  }).join("");
  trendingStyle.textContent = trendingCss;

  const trendingCount = document.getElementById("cb-trending-count");
  if (trendingCount) trendingCount.textContent = String(trending.length);
  const totalEl = document.getElementById("cb-total");
  if (totalEl) totalEl.textContent = `${CHECKBOXES.length} checkboxes`;

  // ── Category tabs / filter ──────────────────────────────────────────────
  let activeCat = "All";
  function renderTabs() {
    const counts: Record<string, number> = {};
    CHECKBOXES.forEach((c) => (counts[c.category] = (counts[c.category] || 0) + 1));
    tabs!.innerHTML = CATEGORIES.map((cat) => {
      const active = cat === activeCat;
      const count = cat === "All" ? CHECKBOXES.length : counts[cat] || 0;
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
  const sizeEl = $("cb-size") as HTMLInputElement;
  const radiusEl = $("cb-radius") as HTMLInputElement;
  const speedEl = $("cb-speed") as HTMLInputElement;
  const colorEl = $("cb-color") as HTMLInputElement;
  const bgEl = $("cb-bg") as HTMLInputElement;
  let current: CheckboxDef | null = null;

  function params(): CheckboxParams {
    return {
      size: parseInt(sizeEl.value),
      radius: parseInt(radiusEl.value),
      speed: parseFloat(speedEl.value),
      color: colorEl.value,
      bg: bgEl.value,
    };
  }

  function renderModal() {
    if (!current) return;
    const p = params();
    $("cb-size-val").textContent = sizeEl.value;
    $("cb-radius-val").textContent = radiusEl.value;
    $("cb-speed-val").textContent = speedEl.value;

    const { css, html } = current.build(p, "checkbox");
    modalStyle.textContent = css;
    $("cb-modal-box").innerHTML = html;
    $("cb-modal-canvas").style.background = p.bg;
    $("cb-html").textContent = html;
    $("cb-css").textContent = css;
  }

  function openModal(id: string) {
    current = CHECKBOXES.find((c) => c.id === id) || null;
    if (!current) return;
    $("cb-modal-title").textContent = current.name;
    $("cb-modal-cat").textContent = current.category;
    sizeEl.value = String(DEFAULT_PARAMS.size);
    radiusEl.value = String(DEFAULT_PARAMS.radius);
    speedEl.value = String(DEFAULT_PARAMS.speed);
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

  function handleGridClick(e: Event) {
    const btn = (e.target as HTMLElement).closest("[data-act]") as HTMLElement | null;
    if (btn) openModal(btn.dataset.id!);
  }
  grid.addEventListener("click", handleGridClick);
  trendingGrid.addEventListener("click", handleGridClick);

  [sizeEl, radiusEl, speedEl, colorEl, bgEl].forEach((el) => el.addEventListener("input", renderModal));

  // Quick color presets
  document.querySelectorAll<HTMLButtonElement>("[data-qcolor]").forEach((btn) => {
    btn.addEventListener("click", () => {
      colorEl.value = btn.dataset.qcolor!;
      bgEl.value = btn.dataset.qbg!;
      renderModal();
    });
  });

  $("cb-modal-close").addEventListener("click", closeModal);
  $("cb-html-copy").addEventListener("click", () => copyText($("cb-html").textContent || ""));
  $("cb-css-copy").addEventListener("click", () => copyText($("cb-css").textContent || ""));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });
}
