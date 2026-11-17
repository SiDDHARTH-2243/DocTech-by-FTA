// Color Converter & Picker — one color, every format, live.
import {
  parseAnyColor,
  randomColor,
  rgbaToHex,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  type RGBA,
} from "../lib/color";
import { CSS_NAMED_COLORS, nearestNamedColor } from "../lib/colornames";
import { copyFlash, toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const native = $<HTMLInputElement>("cc-native");
const text = $<HTMLInputElement>("cc-text");
const alpha = $<HTMLInputElement>("cc-alpha");
const formats = $("cc-formats");

if (native && text && alpha && formats) {
  const preview = $("cc-preview")!;
  const previewName = $("cc-preview-name")!;
  const alphaVal = $("cc-alpha-val")!;

  let color: RGBA = { r: 255, g: 92, b: 26, a: 1 };
  let lastRows: [string, string][] = [];

  /** Accept hex/rgb/hsl OR a CSS name; returns null if unrecognised. */
  function parse(input: string): RGBA | null {
    const direct = parseAnyColor(input);
    if (direct) return direct;
    const named = CSS_NAMED_COLORS[input.trim().toLowerCase()];
    if (named) return { ...parseAnyColor(named)!, a: 1 };
    return null;
  }

  function render() {
    const { r, g, b, a } = color;
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    const near = nearestNamedColor({ r, g, b });
    const aPct = Math.round(a * 100);

    preview.style.background = a < 1 ? `rgba(${r},${g},${b},${a})` : hex;
    previewName.textContent = near.exact ? near.color.name : `≈ ${near.color.name}`;

    const rows: [string, string][] = [
      ["HEX", hex],
      ["HEX (alpha)", rgbaToHex(r, g, b, a)],
      ["RGB", `rgb(${r}, ${g}, ${b})`],
      ["RGBA", `rgba(${r}, ${g}, ${b}, ${a})`],
      ["HSL", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],
      ["HSLA", `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})`],
      ["HSV / HSB", `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`],
      ["CMYK", `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`],
      ["Nearest name", near.exact ? near.color.name : `${near.color.name} (≈)`],
    ];

    formats.innerHTML = rows
      .map(
        ([label, value]) => `
        <button type="button" data-copy="${value.replace(/"/g, "&quot;")}" class="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-orange-50 dark:hover:bg-orange-500/10">
          <span class="w-28 shrink-0 text-xs font-bold uppercase tracking-wide text-slate-400">${label}</span>
          <code class="min-w-0 flex-1 truncate font-mono text-sm text-slate-800 dark:text-slate-100">${value}</code>
          <span class="shrink-0 text-xs font-semibold text-orange-500 opacity-0 transition-opacity group-hover:opacity-100">Copy</span>
        </button>`,
      )
      .join("");
    lastRows = rows;

    // Keep the inputs in sync without clobbering what the user is typing.
    native.value = hex;
    alphaVal.textContent = `${aPct}%`;
    if (document.activeElement !== alpha) alpha.value = String(aPct);
  }

  function setColor(c: RGBA, updateText = true) {
    color = c;
    if (updateText && document.activeElement !== text) {
      text.value = c.a < 1 ? rgbaToHex(c.r, c.g, c.b, c.a) : rgbToHex(c.r, c.g, c.b);
    }
    render();
  }

  text.addEventListener("input", () => {
    const c = parse(text.value);
    if (c) {
      text.classList.remove("!border-red-400");
      setColor(c, false);
    } else {
      text.classList.add("!border-red-400");
    }
  });

  native.addEventListener("input", () => {
    const c = parseAnyColor(native.value);
    if (c) setColor({ ...c, a: color.a });
  });

  alpha.addEventListener("input", () => {
    setColor({ ...color, a: Number(alpha.value) / 100 });
  });

  $("cc-random")?.addEventListener("click", () => {
    setColor({ ...randomColor(), a: 1 });
  });

  formats.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button[data-copy]") as HTMLElement | null;
    if (btn?.dataset.copy) copyFlash(btn, btn.dataset.copy);
  });

  $("cc-copy-all")?.addEventListener("click", (e) => {
    const text = lastRows.map(([label, value]) => `${label}: ${value}`).join("\n");
    const el = e.currentTarget as HTMLElement;
    navigator.clipboard.writeText(text).then(
      () => toast("All formats copied", "ok"),
      () => toast("Copy failed — copy manually", "err"),
    );
    el.classList.remove("copy-flash");
    void el.offsetWidth;
    el.classList.add("copy-flash");
  });

  setColor(color);
}
