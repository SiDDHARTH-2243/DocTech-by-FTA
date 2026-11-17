// Color Blindness Simulator — shows a palette as-is and under each CVD type.
import { CVD_LABELS, parseAnyColor, rgbToHex, simulateCVD, type RGB } from "../lib/color";
import { CSS_NAMED_COLORS } from "../lib/colornames";
import { copyFlash } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const paletteEl = $("cb-palette");
const resultsEl = $("cb-results");

if (paletteEl && resultsEl) {
  // A palette people often assume is fine but which collapses for red-green CVD.
  const PRESET = ["#e74c3c", "#27ae60", "#f1c40f", "#2980b9", "#8e44ad"];
  let colors: string[] = ["#e74c3c", "#27ae60", "#2980b9"];

  const parse = (s: string): RGB | null => {
    const c = parseAnyColor(s);
    if (c) return { r: c.r, g: c.g, b: c.b };
    const named = CSS_NAMED_COLORS[s.trim().toLowerCase()];
    return named ? parse(named) : null;
  };

  function renderPalette() {
    paletteEl.innerHTML = colors
      .map(
        (c, i) => `
        <span class="relative">
          <input type="color" value="${c}" data-idx="${i}" class="cb-swatch h-11 w-11 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0 dark:border-slate-700" />
          ${colors.length > 1 ? `<button type="button" data-remove="${i}" class="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-white hover:bg-red-500">×</button>` : ""}
        </span>`,
      )
      .join("");
    paletteEl.querySelectorAll<HTMLInputElement>(".cb-swatch").forEach((el) =>
      el.addEventListener("input", () => {
        colors[Number(el.dataset.idx)] = el.value;
        renderResults();
      }),
    );
    paletteEl.querySelectorAll<HTMLButtonElement>("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", () => {
        colors.splice(Number(btn.dataset.remove), 1);
        renderPalette();
        renderResults();
      }),
    );
  }

  function swatchRow(list: RGB[]): string {
    return list
      .map((c) => {
        const hex = rgbToHex(c.r, c.g, c.b);
        return `<button type="button" data-copy="${hex}" class="group relative h-16 flex-1" style="background:${hex}" title="${hex}">
            <span class="absolute inset-x-0 bottom-1 text-center font-mono text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100" style="color:${c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > 150 ? "#000" : "#fff"}">${hex}</span>
          </button>`;
      })
      .join("");
  }

  function renderResults() {
    const rgbs = colors.map(parse).filter((c): c is RGB => c !== null);
    if (!rgbs.length) {
      resultsEl.innerHTML = `<p class="text-sm text-slate-400">Add at least one valid color.</p>`;
      return;
    }

    const sections: { label: string; note: string; list: RGB[] }[] = [
      { label: "Normal vision", note: "as designed", list: rgbs },
      ...CVD_LABELS.map((c) => ({ label: c.label, note: c.note, list: rgbs.map((rgb) => simulateCVD(rgb, c.type)) })),
    ];

    resultsEl.innerHTML = sections
      .map(
        (s) => `
        <div class="tool-panel !py-3">
          <div class="mb-2 flex items-baseline justify-between">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-200">${s.label}</span>
            <span class="text-xs text-slate-400">${s.note}</span>
          </div>
          <div class="flex overflow-hidden rounded-xl">${swatchRow(s.list)}</div>
        </div>`,
      )
      .join("");
  }

  resultsEl.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button[data-copy]") as HTMLElement | null;
    if (btn?.dataset.copy) copyFlash(btn, btn.dataset.copy);
  });

  $("cb-add")?.addEventListener("click", () => {
    if (colors.length >= 8) return;
    colors.push("#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"));
    renderPalette();
    renderResults();
  });
  $("cb-preset")?.addEventListener("click", () => {
    colors = [...PRESET];
    renderPalette();
    renderResults();
  });

  renderPalette();
  renderResults();
}
