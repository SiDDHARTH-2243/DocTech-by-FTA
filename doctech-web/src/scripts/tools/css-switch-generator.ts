// Toggle Switch Generator — premium engine with trending picks. Client-side.
// Trending/popular section, category filtering (with counts), quick color
// presets, customization modal, code export with copy.
import { CATEGORIES, DEFAULT_PARAMS, SWITCHES, type SwitchDef, type SwitchParams } from "../lib/switches";
import { cardMarkup, copyText } from "../lib/ui";

// Hand-picked trending switch IDs.
const TRENDING_IDS = [
  "gearbox", "sunset", "sword", "fader", "cassette",
  "submarine", "cyberhex", "ufo", "ninja", "billiards",
];

const tabs = document.getElementById("sw-tabs");
const grid = document.getElementById("sw-grid");
const trendingGrid = document.getElementById("sw-trending-grid");
const modal = document.getElementById("sw-modal");

if (tabs && grid && trendingGrid && modal) {
  // ── Grid styles + cards ─────────────────────────────────────────────────
  const gridStyle = document.createElement("style");
  document.head.appendChild(gridStyle);

  let gridCss = "";
  grid.innerHTML = SWITCHES.map((def) => {
    const { css, html } = def.build(DEFAULT_PARAMS, `g-${def.id}`);
    gridCss += css;
    return cardMarkup(def.id, def.name, def.category, html, DEFAULT_PARAMS.bg);
  }).join("");
  gridStyle.textContent = gridCss;

  // ── Trending section ───────────────────────────────────────────────────
  const trendingStyle = document.createElement("style");
  document.head.appendChild(trendingStyle);

  let trendingCss = "";
  const trending = TRENDING_IDS.map((id) => SWITCHES.find((s) => s.id === id)).filter(Boolean) as SwitchDef[];
  trendingGrid.innerHTML = trending.map((def) => {
    const { css, html } = def.build(DEFAULT_PARAMS, `t-${def.id}`);
    trendingCss += css;
    return cardMarkup(def.id, def.name, def.category, html, DEFAULT_PARAMS.bg);
  }).join("");
  trendingStyle.textContent = trendingCss;

  const trendingCount = document.getElementById("sw-trending-count");
  if (trendingCount) trendingCount.textContent = String(trending.length);
  const totalEl = document.getElementById("sw-total");
  if (totalEl) totalEl.textContent = `${SWITCHES.length} switches`;

  // ── Category tabs / filter ──────────────────────────────────────────────
  let activeCat = "All";
  function renderTabs() {
    const counts: Record<string, number> = {};
    SWITCHES.forEach((s) => (counts[s.category] = (counts[s.category] || 0) + 1));
    tabs!.innerHTML = CATEGORIES.map((cat) => {
      const active = cat === activeCat;
      const count = cat === "All" ? SWITCHES.length : counts[cat] || 0;
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
  const sizeEl = $("sw-size") as HTMLInputElement;
  const speedEl = $("sw-speed") as HTMLInputElement;
  const onEl = $("sw-on") as HTMLInputElement;
  const offEl = $("sw-off") as HTMLInputElement;
  const bgEl = $("sw-bg") as HTMLInputElement;
  let current: SwitchDef | null = null;

  function params(): SwitchParams {
    return {
      size: parseInt(sizeEl.value),
      speed: parseFloat(speedEl.value),
      on: onEl.value,
      off: offEl.value,
      bg: bgEl.value,
    };
  }

  function renderModal() {
    if (!current) return;
    const p = params();
    $("sw-size-val").textContent = sizeEl.value;
    $("sw-speed-val").textContent = speedEl.value;

    const { css, html } = current.build(p, "switch");
    modalStyle.textContent = css;
    $("sw-modal-box").innerHTML = html;
    $("sw-modal-canvas").style.background = p.bg;
    $("sw-html").textContent = html;
    $("sw-css").textContent = css;
  }

  function openModal(id: string) {
    current = SWITCHES.find((s) => s.id === id) || null;
    if (!current) return;
    $("sw-modal-title").textContent = current.name;
    $("sw-modal-cat").textContent = current.category;
    sizeEl.value = String(DEFAULT_PARAMS.size);
    speedEl.value = String(DEFAULT_PARAMS.speed);
    onEl.value = DEFAULT_PARAMS.on;
    offEl.value = DEFAULT_PARAMS.off;
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

  [sizeEl, speedEl, onEl, offEl, bgEl].forEach((el) => el.addEventListener("input", renderModal));

  // Quick color presets (sets On + Canvas)
  document.querySelectorAll<HTMLButtonElement>("[data-qcolor]").forEach((btn) => {
    btn.addEventListener("click", () => {
      onEl.value = btn.dataset.qcolor!;
      bgEl.value = btn.dataset.qbg!;
      renderModal();
    });
  });

  $("sw-modal-close").addEventListener("click", closeModal);
  $("sw-html-copy").addEventListener("click", () => copyText($("sw-html").textContent || ""));
  $("sw-css-copy").addEventListener("click", () => copyText($("sw-css").textContent || ""));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });
}
