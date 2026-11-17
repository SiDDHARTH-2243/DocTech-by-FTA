// Color Mixer — intermediate colors between two colors. Client-side.
import { hexToRgb, rgbToHex, mix, idealTextColor, type RGB } from "../lib/color";
import { copyText } from "../lib/ui";

const aPicker = document.getElementById("mix-a-picker") as HTMLInputElement | null;
const aHex = document.getElementById("mix-a-hex") as HTMLInputElement | null;
const bPicker = document.getElementById("mix-b-picker") as HTMLInputElement | null;
const bHex = document.getElementById("mix-b-hex") as HTMLInputElement | null;
const steps = document.getElementById("mix-steps") as HTMLInputElement | null;
const stepsVal = document.getElementById("mix-steps-val");
const output = document.getElementById("mix-output");

if (aPicker && aHex && bPicker && bHex && steps && stepsVal && output) {
  function swatch(c: RGB): string {
    const hex = rgbToHex(c.r, c.g, c.b).toUpperCase();
    const text = idealTextColor(c);
    return `
      <button type="button" data-copy="${hex}" title="Copy ${hex}"
        class="flex h-20 flex-1 items-end justify-center rounded-lg pb-1.5 font-mono text-[10px] transition-transform hover:scale-105"
        style="background:${hex};color:${text};">${hex}</button>`;
  }

  function syncPair(picker: HTMLInputElement, hex: HTMLInputElement, from: "picker" | "hex") {
    if (from === "picker") {
      hex.value = picker.value.toUpperCase();
    } else {
      const rgb = hexToRgb(hex.value);
      if (rgb) picker.value = rgbToHex(rgb.r, rgb.g, rgb.b);
    }
  }

  function render() {
    const a = hexToRgb(aHex!.value);
    const b = hexToRgb(bHex!.value);
    const n = parseInt(steps!.value);
    stepsVal!.textContent = String(n);
    if (!a || !b) {
      output!.innerHTML =
        '<p class="text-sm text-red-600 dark:text-red-400">Enter valid HEX codes for both colors.</p>';
      return;
    }
    const colors = Array.from({ length: n }, (_, i) => mix(a, b, n === 1 ? 0 : i / (n - 1)));
    output!.innerHTML = colors.map(swatch).join("");
  }

  aPicker.addEventListener("input", () => { syncPair(aPicker!, aHex!, "picker"); render(); });
  aHex.addEventListener("input", () => { syncPair(aPicker!, aHex!, "hex"); render(); });
  bPicker.addEventListener("input", () => { syncPair(bPicker!, bHex!, "picker"); render(); });
  bHex.addEventListener("input", () => { syncPair(bPicker!, bHex!, "hex"); render(); });
  steps.addEventListener("input", render);
  output.addEventListener("click", (e) => {
    const t = (e.target as HTMLElement).closest("[data-copy]") as HTMLElement | null;
    if (t) copyText(t.dataset.copy!);
  });

  render();
}
