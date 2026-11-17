// Named Color Finder — searchable CSS named-color grid + nearest-name lookup.
import { parseAnyColor, rgbToHex, type RGB } from "../lib/color";
import { CSS_NAMED_COLORS, NAMED_COLOR_LIST, nearestNamedColor } from "../lib/colornames";
import { copyFlash } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const search = $<HTMLInputElement>("nc-search");
const picker = $<HTMLInputElement>("nc-picker");
const grid = $("nc-grid");

if (search && picker && grid) {
  const match = $("nc-match")!;
  const countEl = $("nc-count")!;

  // Build the full grid once; filtering just toggles visibility.
  grid.innerHTML = NAMED_COLOR_LIST.map(
    (c) => `
    <button type="button" data-name="${c.name}" data-hex="${c.hex}" class="nc-cell group overflow-hidden rounded-2xl border border-slate-200 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700">
      <span class="block h-16" style="background:${c.hex}"></span>
      <span class="block px-3 py-2">
        <span class="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">${c.name}</span>
        <span class="block font-mono text-[11px] text-slate-400">${c.hex}</span>
      </span>
    </button>`,
  ).join("");
  const cells = [...grid.querySelectorAll<HTMLElement>(".nc-cell")];

  function tryColor(input: string): RGB | null {
    const c = parseAnyColor(input);
    if (c) return { r: c.r, g: c.g, b: c.b };
    const named = CSS_NAMED_COLORS[input.trim().toLowerCase()];
    return named ? { ...(parseAnyColor(named) as RGB) } : null;
  }

  function showMatch(rgb: RGB) {
    const near = nearestNamedColor(rgb);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    match.classList.remove("hidden");
    match.classList.add("flex");
    $("nc-match-sw")!.style.background = hex;
    $("nc-match-name")!.textContent = near.color.name;
    $("nc-match-hex")!.textContent = `input ${hex} → ${near.color.hex}`;
    const exact = $("nc-match-exact")!;
    exact.textContent = near.exact ? "exact match" : `≈ nearest (Δ ${Math.round(near.distance)})`;
    exact.className = `rounded-full px-2 py-0.5 text-[11px] font-bold ${
      near.exact ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
    }`;
  }

  function filter() {
    const q = search!.value.trim().toLowerCase();
    const asColor = q ? tryColor(q) : null;

    // If the query parses as a color (and isn't just a plain name substring), show the match card.
    if (asColor && (q.startsWith("#") || q.includes("(") || /^[0-9a-f]{3,8}$/i.test(q))) {
      showMatch(asColor);
      picker!.value = rgbToHex(asColor.r, asColor.g, asColor.b);
    } else {
      match.classList.add("hidden");
      match.classList.remove("flex");
    }

    let shown = 0;
    for (const cell of cells) {
      const hit = !q || cell.dataset.name!.includes(q) || cell.dataset.hex!.includes(q);
      cell.classList.toggle("hidden", !hit);
      if (hit) shown++;
    }
    countEl.textContent = q ? `${shown} of ${cells.length} colors` : `${cells.length} CSS named colors`;
  }

  grid.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button[data-name]") as HTMLElement | null;
    if (btn?.dataset.name) copyFlash(btn, btn.dataset.name);
  });

  search.addEventListener("input", filter);
  picker.addEventListener("input", () => {
    search.value = picker.value;
    filter();
  });

  filter();
}
