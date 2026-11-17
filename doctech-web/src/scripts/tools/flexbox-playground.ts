// Flexbox Playground — premium interactive engine. Client-side.
// Features: per-item property editing, layout presets, add/remove items,
// item selection, CSS/HTML code tabs, shuffle, and full CSS export.
import { hslToRgb, rgbToHex } from "../lib/color";
import { copyText, toast } from "../lib/ui";

// ── Types ────────────────────────────────────────────────────────────────────
interface FlexItem {
  order: number;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  alignSelf: string;
}

interface FxState {
  direction: string;
  justify: string;
  align: string;
  alignContent: string;
  wrap: string;
  gap: number;
  items: FlexItem[];
  selected: number; // -1 = none
}

// ── Defaults ─────────────────────────────────────────────────────────────────
function defaultItem(): FlexItem {
  return { order: 0, flexGrow: 0, flexShrink: 1, flexBasis: "auto", alignSelf: "auto" };
}

const DEFAULTS: FxState = {
  direction: "row",
  justify: "flex-start",
  align: "stretch",
  alignContent: "stretch",
  wrap: "wrap",
  gap: 12,
  items: Array.from({ length: 5 }, () => defaultItem()),
  selected: -1,
};

const MAX_ITEMS = 12;

// ── Item colors (harmonious hues) ────────────────────────────────────────────
const ITEM_COLORS = [
  "#f97316", "#3b82f6", "#10b981", "#a855f7", "#ec4899",
  "#eab308", "#06b6d4", "#ef4444", "#8b5cf6", "#14b8a6",
  "#f59e0b", "#6366f1",
];

function itemColor(i: number): string {
  return ITEM_COLORS[i % ITEM_COLORS.length];
}

// ── Layout Presets ───────────────────────────────────────────────────────────
const PRESETS: { name: string; state: Partial<FxState>; items?: Partial<FlexItem>[] }[] = [
  {
    name: "Row Center",
    state: { direction: "row", justify: "center", align: "center", wrap: "wrap", gap: 16 },
  },
  {
    name: "Space Between",
    state: { direction: "row", justify: "space-between", align: "center", wrap: "wrap", gap: 12 },
  },
  {
    name: "Column Stack",
    state: { direction: "column", justify: "flex-start", align: "stretch", wrap: "nowrap", gap: 8 },
  },
  {
    name: "Holy Grail",
    state: { direction: "row", justify: "flex-start", align: "stretch", wrap: "wrap", gap: 0 },
    items: [
      { flexGrow: 0, flexBasis: "100%", order: 0 },  // header
      { flexGrow: 0, flexBasis: "200px", order: 1 },  // sidebar-left
      { flexGrow: 1, flexBasis: "0", order: 2 },      // main
      { flexGrow: 0, flexBasis: "200px", order: 3 },  // sidebar-right
      { flexGrow: 0, flexBasis: "100%", order: 4 },   // footer
    ],
  },
  {
    name: "Sidebar + Main",
    state: { direction: "row", justify: "flex-start", align: "stretch", wrap: "nowrap", gap: 0 },
    items: [
      { flexGrow: 0, flexBasis: "240px" },
      { flexGrow: 1, flexBasis: "0" },
    ],
  },
  {
    name: "Equal Width",
    state: { direction: "row", justify: "flex-start", align: "stretch", wrap: "nowrap", gap: 12 },
    items: [
      { flexGrow: 1, flexBasis: "0" },
      { flexGrow: 1, flexBasis: "0" },
      { flexGrow: 1, flexBasis: "0" },
    ],
  },
  {
    name: "Reverse Row",
    state: { direction: "row-reverse", justify: "flex-start", align: "center", wrap: "wrap", gap: 12 },
  },
  {
    name: "Wrap Grid",
    state: { direction: "row", justify: "flex-start", align: "flex-start", wrap: "wrap", gap: 8 },
    items: Array.from({ length: 8 }, () => ({ flexGrow: 0, flexBasis: "calc(25% - 6px)" })),
  },
  {
    name: "Centered Card",
    state: { direction: "row", justify: "center", align: "center", wrap: "nowrap", gap: 0 },
    items: [{ flexGrow: 0, flexBasis: "auto" }],
  },
  {
    name: "Space Evenly",
    state: { direction: "row", justify: "space-evenly", align: "center", wrap: "wrap", gap: 16 },
  },
  {
    name: "Column Reverse",
    state: { direction: "column-reverse", justify: "flex-end", align: "stretch", wrap: "nowrap", gap: 8 },
  },
  {
    name: "Masonry-ish",
    state: { direction: "column", justify: "flex-start", align: "flex-start", wrap: "wrap", gap: 8 },
    items: Array.from({ length: 6 }, () => ({ flexGrow: 0, flexBasis: "auto" })),
  },
];

// ── DOM references ───────────────────────────────────────────────────────────
const $ = (id: string) => document.getElementById(id);
const preview = $("fx-preview");
const cssEl = $("fx-css");

if (preview && cssEl) {
  const state: FxState = structuredClone(DEFAULTS);

  // Container controls
  const dirSelect = $("fx-direction") as HTMLSelectElement;
  const justSelect = $("fx-justify") as HTMLSelectElement;
  const alignSelect = $("fx-align") as HTMLSelectElement;
  const alignContentSelect = $("fx-align-content") as HTMLSelectElement;
  const wrapSelect = $("fx-wrap") as HTMLSelectElement;
  const gapSlider = $("fx-gap") as HTMLInputElement;

  // Item controls
  const itemPanel = $("fx-item-panel")!;
  const itemOrderSlider = $("fx-item-order") as HTMLInputElement;
  const itemGrowSlider = $("fx-item-grow") as HTMLInputElement;
  const itemShrinkSlider = $("fx-item-shrink") as HTMLInputElement;
  const itemBasisSelect = $("fx-item-basis") as HTMLSelectElement;
  const itemAlignSelfSelect = $("fx-item-align-self") as HTMLSelectElement;

  // Code tabs
  let activeTab: "css" | "html" = "css";

  // ── Render preview ────────────────────────────────────────────────────
  function render() {
    // Update labels
    $("fx-gap-val")!.textContent = String(state.gap);
    $("fx-count-label")!.textContent = String(state.items.length);

    // Container styles
    const ps = preview!.style;
    ps.display = "flex";
    ps.flexDirection = state.direction;
    ps.justifyContent = state.justify;
    ps.alignItems = state.align;
    ps.alignContent = state.alignContent;
    ps.flexWrap = state.wrap;
    ps.gap = `${state.gap}px`;

    // Rebuild items
    preview!.innerHTML = "";
    state.items.forEach((item, i) => {
      const el = document.createElement("div");
      const isSelected = i === state.selected;
      const bg = itemColor(i);

      el.className = "flex items-center justify-center rounded-lg font-bold text-white text-sm transition-all cursor-pointer";
      el.style.cssText = `
        min-width: 56px;
        min-height: 56px;
        padding: 12px 16px;
        background: ${bg};
        order: ${item.order};
        flex-grow: ${item.flexGrow};
        flex-shrink: ${item.flexShrink};
        flex-basis: ${item.flexBasis};
        align-self: ${item.alignSelf};
        ${isSelected ? `outline: 3px solid ${bg}; outline-offset: 2px; box-shadow: 0 0 0 5px rgba(0,0,0,0.1);` : ""}
      `;
      el.textContent = String(i + 1);
      el.title = `Item ${i + 1} — click to edit`;

      // Click to select
      el.addEventListener("click", () => {
        state.selected = state.selected === i ? -1 : i;
        render();
        syncItemPanel();
      });

      preview!.appendChild(el);
    });

    syncItemPanel();
    renderCode();
  }

  // ── Item panel sync ───────────────────────────────────────────────────
  function syncItemPanel() {
    if (state.selected < 0 || state.selected >= state.items.length) {
      itemPanel.classList.add("hidden");
      state.selected = -1;
      return;
    }
    itemPanel.classList.remove("hidden");
    const item = state.items[state.selected];
    $("fx-item-name")!.textContent = String(state.selected + 1);

    itemOrderSlider.value = String(item.order);
    $("fx-item-order-val")!.textContent = String(item.order);
    itemGrowSlider.value = String(item.flexGrow);
    $("fx-item-grow-val")!.textContent = String(item.flexGrow);
    itemShrinkSlider.value = String(item.flexShrink);
    $("fx-item-shrink-val")!.textContent = String(item.flexShrink);
    itemBasisSelect.value = item.flexBasis;
    itemAlignSelfSelect.value = item.alignSelf;
  }

  // ── Code output ───────────────────────────────────────────────────────
  function renderCode() {
    // Build container CSS
    const containerLines = [
      `display: flex;`,
      `flex-direction: ${state.direction};`,
      `justify-content: ${state.justify};`,
      `align-items: ${state.align};`,
    ];
    if (state.alignContent !== "stretch") {
      containerLines.push(`align-content: ${state.alignContent};`);
    }
    containerLines.push(`flex-wrap: ${state.wrap};`);
    containerLines.push(`gap: ${state.gap}px;`);

    // Build per-item CSS (only for items with non-default props)
    const itemCssBlocks: string[] = [];
    state.items.forEach((item, i) => {
      const lines: string[] = [];
      if (item.order !== 0) lines.push(`  order: ${item.order};`);
      if (item.flexGrow !== 0) lines.push(`  flex-grow: ${item.flexGrow};`);
      if (item.flexShrink !== 1) lines.push(`  flex-shrink: ${item.flexShrink};`);
      if (item.flexBasis !== "auto") lines.push(`  flex-basis: ${item.flexBasis};`);
      if (item.alignSelf !== "auto") lines.push(`  align-self: ${item.alignSelf};`);
      if (lines.length > 0) {
        itemCssBlocks.push(`.item-${i + 1} {\n${lines.join("\n")}\n}`);
      }
    });

    if (activeTab === "css") {
      let output = `.container {\n${containerLines.map((l) => `  ${l}`).join("\n")}\n}`;
      if (itemCssBlocks.length > 0) {
        output += "\n\n" + itemCssBlocks.join("\n\n");
      }
      cssEl!.textContent = output;
    } else {
      const itemTags = state.items
        .map((_, i) => `  <div class="item-${i + 1}">Item ${i + 1}</div>`)
        .join("\n");
      let css = `.container {\n${containerLines.map((l) => `  ${l}`).join("\n")}\n}`;
      if (itemCssBlocks.length > 0) {
        css += "\n\n" + itemCssBlocks.join("\n\n");
      }
      cssEl!.textContent = `<div class="container">\n${itemTags}\n</div>\n\n<style>\n${css}\n</style>`;
    }
  }

  // ── Container control events ──────────────────────────────────────────
  dirSelect.addEventListener("change", () => { state.direction = dirSelect.value; render(); });
  justSelect.addEventListener("change", () => { state.justify = justSelect.value; render(); });
  alignSelect.addEventListener("change", () => { state.align = alignSelect.value; render(); });
  alignContentSelect.addEventListener("change", () => { state.alignContent = alignContentSelect.value; render(); });
  wrapSelect.addEventListener("change", () => { state.wrap = wrapSelect.value; render(); });
  gapSlider.addEventListener("input", () => { state.gap = parseInt(gapSlider.value); render(); });

  // ── Per-item control events ───────────────────────────────────────────
  itemOrderSlider.addEventListener("input", () => {
    if (state.selected < 0) return;
    state.items[state.selected].order = parseInt(itemOrderSlider.value);
    $("fx-item-order-val")!.textContent = itemOrderSlider.value;
    render();
  });
  itemGrowSlider.addEventListener("input", () => {
    if (state.selected < 0) return;
    state.items[state.selected].flexGrow = parseInt(itemGrowSlider.value);
    $("fx-item-grow-val")!.textContent = itemGrowSlider.value;
    render();
  });
  itemShrinkSlider.addEventListener("input", () => {
    if (state.selected < 0) return;
    state.items[state.selected].flexShrink = parseInt(itemShrinkSlider.value);
    $("fx-item-shrink-val")!.textContent = itemShrinkSlider.value;
    render();
  });
  itemBasisSelect.addEventListener("change", () => {
    if (state.selected < 0) return;
    state.items[state.selected].flexBasis = itemBasisSelect.value;
    render();
  });
  itemAlignSelfSelect.addEventListener("change", () => {
    if (state.selected < 0) return;
    state.items[state.selected].alignSelf = itemAlignSelfSelect.value;
    render();
  });

  // ── Deselect ──────────────────────────────────────────────────────────
  $("fx-deselect")!.addEventListener("click", () => {
    state.selected = -1;
    render();
  });

  // ── Add / Remove items ────────────────────────────────────────────────
  $("fx-add-item")!.addEventListener("click", () => {
    if (state.items.length >= MAX_ITEMS) {
      toast(`Maximum ${MAX_ITEMS} items`, "err");
      return;
    }
    state.items.push(defaultItem());
    render();
  });
  $("fx-remove-item")!.addEventListener("click", () => {
    if (state.items.length <= 1) {
      toast("Need at least 1 item", "err");
      return;
    }
    // Remove selected or last
    if (state.selected >= 0) {
      state.items.splice(state.selected, 1);
      state.selected = -1;
    } else {
      state.items.pop();
    }
    render();
  });

  // ── Code tabs ─────────────────────────────────────────────────────────
  const tabCss = $("fx-tab-css")!;
  const tabHtml = $("fx-tab-html")!;

  function paintTabs() {
    const onCls = "rounded-md px-2.5 py-1 text-xs font-semibold bg-orange-500 text-white";
    const offCls = "rounded-md px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400";
    tabCss.className = activeTab === "css" ? onCls : offCls;
    tabHtml.className = activeTab === "html" ? onCls : offCls;
  }

  tabCss.addEventListener("click", () => { activeTab = "css"; paintTabs(); renderCode(); });
  tabHtml.addEventListener("click", () => { activeTab = "html"; paintTabs(); renderCode(); });

  // ── Preset gallery ────────────────────────────────────────────────────
  const presetsEl = $("fx-presets")!;
  presetsEl.innerHTML = PRESETS.map((preset, i) => {
    // Build a tiny preview thumbnail
    const s = { ...DEFAULTS, ...preset.state };
    const numItems = preset.items ? preset.items.length : 5;
    const miniItems = Array.from({ length: Math.min(numItems, 6) }, (_, j) => {
      const bg = itemColor(j);
      return `<div style="width:8px;height:8px;border-radius:2px;background:${bg};flex-shrink:0"></div>`;
    }).join("");

    return `
      <button type="button" data-preset="${i}" class="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-2 transition-colors hover:border-orange-400 dark:border-slate-700" title="${preset.name}">
        <span class="flex h-12 w-full items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1.5" style="display:flex;flex-direction:${s.direction};justify-content:${s.justify};align-items:${s.align};flex-wrap:${s.wrap};gap:2px">
          ${miniItems}
        </span>
        <span class="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">${preset.name}</span>
      </button>`;
  }).join("");

  presetsEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-preset]") as HTMLElement | null;
    if (b) {
      const preset = PRESETS[parseInt(b.dataset.preset!)];

      // Apply container state
      state.direction = preset.state.direction ?? DEFAULTS.direction;
      state.justify = preset.state.justify ?? DEFAULTS.justify;
      state.align = preset.state.align ?? DEFAULTS.align;
      state.alignContent = preset.state.alignContent ?? DEFAULTS.alignContent;
      state.wrap = preset.state.wrap ?? DEFAULTS.wrap;
      state.gap = preset.state.gap ?? DEFAULTS.gap;
      state.selected = -1;

      // Apply items
      if (preset.items) {
        state.items = preset.items.map((pi) => ({ ...defaultItem(), ...pi }));
      } else {
        state.items = Array.from({ length: 5 }, () => defaultItem());
      }

      // Sync dropdowns
      dirSelect.value = state.direction;
      justSelect.value = state.justify;
      alignSelect.value = state.align;
      alignContentSelect.value = state.alignContent;
      wrapSelect.value = state.wrap;
      gapSlider.value = String(state.gap);

      render();
    }
  });

  // ── Shuffle ───────────────────────────────────────────────────────────
  const rand = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  $("fx-shuffle")!.addEventListener("click", () => {
    state.direction = pick(["row", "row-reverse", "column", "column-reverse"]);
    state.justify = pick(["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"]);
    state.align = pick(["stretch", "flex-start", "center", "flex-end"]);
    state.wrap = pick(["nowrap", "wrap", "wrap-reverse"]);
    state.gap = rand(0, 24);
    state.selected = -1;

    const numItems = rand(2, 8);
    state.items = Array.from({ length: numItems }, () => ({
      order: Math.random() < 0.3 ? rand(-2, 5) : 0,
      flexGrow: Math.random() < 0.4 ? rand(0, 3) : 0,
      flexShrink: 1,
      flexBasis: pick(["auto", "auto", "auto", "0", "100px", "25%"]),
      alignSelf: Math.random() < 0.2 ? pick(["flex-start", "center", "flex-end"]) : "auto",
    }));

    dirSelect.value = state.direction;
    justSelect.value = state.justify;
    alignSelect.value = state.align;
    wrapSelect.value = state.wrap;
    gapSlider.value = String(state.gap);
    render();
  });

  // ── Reset ─────────────────────────────────────────────────────────────
  $("fx-reset")!.addEventListener("click", () => {
    Object.assign(state, structuredClone(DEFAULTS));
    dirSelect.value = state.direction;
    justSelect.value = state.justify;
    alignSelect.value = state.align;
    alignContentSelect.value = state.alignContent;
    wrapSelect.value = state.wrap;
    gapSlider.value = String(state.gap);
    render();
  });

  // ── Copy ──────────────────────────────────────────────────────────────
  $("fx-copy")!.addEventListener("click", () => copyText(cssEl!.textContent || ""));

  // ── Initial render ────────────────────────────────────────────────────
  render();
}
