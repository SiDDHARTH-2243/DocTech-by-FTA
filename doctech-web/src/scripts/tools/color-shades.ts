// Color Shades Generator — lighten / darken / saturate / desaturate steps. Client-side.
import {
  hexToRgb,
  rgbToHex,
  lighten,
  darken,
  saturate,
  desaturate,
  idealTextColor,
  type RGB,
} from "../lib/color";
import { copyText } from "../lib/ui";

const picker = document.getElementById("sh-picker") as HTMLInputElement | null;
const hexInput = document.getElementById("sh-hex") as HTMLInputElement | null;
const steps = document.getElementById("sh-steps") as HTMLInputElement | null;
const stepsVal = document.getElementById("sh-steps-val");
const output = document.getElementById("sh-output");

if (picker && hexInput && steps && stepsVal && output) {
  function swatch(c: RGB): string {
    const hex = rgbToHex(c.r, c.g, c.b).toUpperCase();
    const text = idealTextColor(c);
    return `
      <button type="button" data-copy="${hex}" title="Copy ${hex}"
        class="flex h-16 flex-1 items-end justify-center rounded-lg pb-1 font-mono text-[11px] transition-transform hover:scale-105"
        style="background:${hex};color:${text};">${hex}</button>`;
  }

  function rowEl(label: string, colors: RGB[]): string {
    return `
      <div>
        <div class="mb-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">${label}</div>
        <div class="flex gap-2">${colors.map(swatch).join("")}</div>
      </div>`;
  }

  function render(source: "picker" | "hex" | "steps") {
    if (source === "picker") hexInput!.value = picker!.value.toUpperCase();
    const base = hexToRgb(hexInput!.value);
    const n = parseInt(steps!.value);
    stepsVal!.textContent = String(n);
    if (!base) {
      output!.innerHTML =
        '<p class="text-sm text-red-600 dark:text-red-400">Enter a valid HEX code.</p>';
      return;
    }
    if (source !== "picker") picker!.value = rgbToHex(base.r, base.g, base.b);

    const seq = (fn: (c: RGB, amt: number) => RGB, step: number) =>
      Array.from({ length: n }, (_, i) => fn(base, (i + 1) * step));

    output!.innerHTML = [
      rowEl("Base", [base]),
      rowEl("Lighten", seq(lighten, 8)),
      rowEl("Darken", seq(darken, 8)),
      rowEl("Saturate", seq(saturate, 12)),
      rowEl("Desaturate", seq(desaturate, 12)),
    ].join("");
  }

  picker.addEventListener("input", () => render("picker"));
  hexInput.addEventListener("input", () => render("hex"));
  steps.addEventListener("input", () => render("steps"));
  output.addEventListener("click", (e) => {
    const t = (e.target as HTMLElement).closest("[data-copy]") as HTMLElement | null;
    if (t) copyText(t.dataset.copy!);
  });

  render("hex");
}
