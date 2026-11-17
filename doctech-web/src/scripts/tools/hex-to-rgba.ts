// HEX → RGBA converter + full color breakdown. Client-side.
import {
  hexToRgb,
  rgbToHsl,
  rgbToHsv,
  rgbToCmyk,
  rgbToHex,
  relativeLuminance,
} from "../lib/color";
import { copyText } from "../lib/ui";

const picker = document.getElementById("h2r-picker") as HTMLInputElement | null;
const hexInput = document.getElementById("h2r-hex") as HTMLInputElement | null;
const alpha = document.getElementById("h2r-alpha") as HTMLInputElement | null;
const alphaVal = document.getElementById("h2r-alpha-val");
const swatch = document.getElementById("h2r-swatch");
const errorEl = document.getElementById("h2r-error");
const details = document.getElementById("h2r-details");

if (picker && hexInput && alpha && alphaVal && swatch && errorEl && details) {
  function row(label: string, value: string): string {
    return `
      <div class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
        <span class="font-semibold text-slate-500 dark:text-slate-400">${label}</span>
        <span class="flex items-center gap-2">
          <code class="font-mono">${value}</code>
          <button type="button" data-copy="${value}" title="Copy" class="rounded px-1.5 py-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">⧉</button>
        </span>
      </div>`;
  }

  function update(source: "picker" | "hex" | "alpha") {
    if (source === "picker") hexInput!.value = picker!.value.toUpperCase();
    const rgb = hexToRgb(hexInput!.value);
    const a = parseInt(alpha!.value) / 100;
    alphaVal!.textContent = `${alpha!.value}%`;

    if (!rgb) {
      errorEl!.textContent = "Enter a valid HEX code (e.g. #f97316).";
      errorEl!.classList.remove("hidden");
      details!.innerHTML = "";
      return;
    }
    errorEl!.classList.add("hidden");
    if (source !== "picker") picker!.value = rgbToHex(rgb.r, rgb.g, rgb.b);
    swatch!.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const lum = relativeLuminance(rgb);

    details!.innerHTML = [
      row("RGBA", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`),
      row("RGB", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`),
      row("HEX", rgbToHex(rgb.r, rgb.g, rgb.b)),
      row("HSL", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`),
      row("HSLA", `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})`),
      row("HSV", `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`),
      row("CMYK", `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`),
      row("Luminance", lum.toFixed(3)),
    ].join("");
  }

  picker.addEventListener("input", () => update("picker"));
  hexInput.addEventListener("input", () => update("hex"));
  alpha.addEventListener("input", () => update("alpha"));
  details.addEventListener("click", (e) => {
    const t = (e.target as HTMLElement).closest("[data-copy]") as HTMLElement | null;
    if (t) copyText(t.dataset.copy!);
  });

  update("hex");
}
