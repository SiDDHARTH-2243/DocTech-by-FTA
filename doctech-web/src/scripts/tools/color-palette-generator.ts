// AI Color Palette Generator — algorithmic, color-theory based. Client-side.
import {
  hexToRgb,
  rgbToHex,
  harmonyPalette,
  idealTextColor,
  type RGB,
  type HarmonyMode,
} from "../lib/color";
import { copyText } from "../lib/ui";

const mode = document.getElementById("pal-mode") as HTMLSelectElement | null;
const seed = document.getElementById("pal-seed") as HTMLInputElement | null;
const randomBtn = document.getElementById("pal-random");
const generateBtn = document.getElementById("pal-generate");
const strip = document.getElementById("pal-strip");

const COUNT = 5;

if (mode && seed && randomBtn && generateBtn && strip) {
  // Per-swatch state: current color + whether it's locked against regeneration.
  const slots: { color: RGB; locked: boolean }[] = Array.from({ length: COUNT }, () => ({
    color: { r: 0, g: 0, b: 0 },
    locked: false,
  }));

  function generate() {
    const seedRgb = hexToRgb(seed!.value) || { r: 249, g: 115, b: 22 };
    const palette = harmonyPalette(seedRgb, mode!.value as HarmonyMode, COUNT);
    slots.forEach((slot, i) => {
      if (!slot.locked) slot.color = palette[i];
    });
    render();
  }

  function render() {
    strip!.innerHTML = slots
      .map((slot, i) => {
        const hex = rgbToHex(slot.color.r, slot.color.g, slot.color.b).toUpperCase();
        const text = idealTextColor(slot.color);
        return `
          <div class="flex h-48 flex-col items-center justify-end gap-2 rounded-xl pb-3 transition-transform"
               style="background:${hex};color:${text};">
            <code class="font-mono text-xs font-bold">${hex}</code>
            <div class="flex gap-1">
              <button type="button" data-lock="${i}" title="${slot.locked ? "Unlock" : "Lock"}"
                class="rounded px-1.5 py-0.5 text-sm hover:bg-black/10">${slot.locked ? "🔒" : "🔓"}</button>
              <button type="button" data-copy="${hex}" title="Copy ${hex}"
                class="rounded px-1.5 py-0.5 text-sm hover:bg-black/10">⧉</button>
            </div>
          </div>`;
      })
      .join("");
  }

  strip.addEventListener("click", (e) => {
    const el = e.target as HTMLElement;
    const lock = el.closest("[data-lock]") as HTMLElement | null;
    const copy = el.closest("[data-copy]") as HTMLElement | null;
    if (lock) {
      const i = Number(lock.dataset.lock);
      slots[i].locked = !slots[i].locked;
      render();
    } else if (copy) {
      copyText(copy.dataset.copy!);
    }
  });

  generateBtn.addEventListener("click", generate);
  mode.addEventListener("change", generate);
  seed.addEventListener("input", generate);
  randomBtn.addEventListener("click", () => {
    seed!.value = rgbToHex(
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
    );
    generate();
  });

  // Spacebar regenerates unlocked colors (unless typing in a field).
  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space") return;
    const tag = (document.activeElement?.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea") return;
    e.preventDefault();
    generate();
  });

  generate();
}
