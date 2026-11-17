// Image Color Extractor — client-side. Dominant-color palette via bucketing.
import { loadImage, extractPalette } from "../lib/image";
import { rgbToHex, idealTextColor } from "../lib/color";
import { setupDropzone, toast, copyText } from "../lib/ui";

const drop = document.getElementById("ext-drop");
const input = document.getElementById("ext-input") as HTMLInputElement | null;
const work = document.getElementById("ext-work");
const preview = document.getElementById("ext-preview") as HTMLImageElement | null;
const paletteEl = document.getElementById("ext-palette");
const countEl = document.getElementById("ext-count") as HTMLInputElement | null;
const resetBtn = document.getElementById("ext-reset");

if (drop && input && work && preview && paletteEl && countEl && resetBtn) {
  let img: HTMLImageElement | null = null;

  function renderPalette() {
    if (!img) return;
    const n = parseInt(countEl!.value);
    document.getElementById("ext-count-val")!.textContent = String(n);
    const colors = extractPalette(img, n);
    paletteEl!.innerHTML = colors
      .map(({ r, g, b }) => {
        const hex = rgbToHex(r, g, b);
        return `<button type="button" data-hex="${hex}" class="group overflow-hidden rounded-xl border border-slate-200 transition-transform hover:scale-[1.03] dark:border-slate-700">
          <span class="flex h-16 items-center justify-center text-[11px] font-bold" style="background:${hex};color:${idealTextColor({ r, g, b })}">${hex.toUpperCase()}</span>
        </button>`;
      })
      .join("");
  }

  async function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    try {
      img = await loadImage(file);
      preview!.src = URL.createObjectURL(file);
      drop!.classList.add("hidden"); work!.classList.remove("hidden"); resetBtn!.classList.remove("hidden");
      renderPalette();
    } catch { toast("Could not read that image", "err"); }
  }

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));
  countEl.addEventListener("input", renderPalette);
  paletteEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-hex]") as HTMLElement | null;
    if (b) copyText(b.dataset.hex!);
  });
  resetBtn.addEventListener("click", () => {
    img = null;
    work!.classList.add("hidden"); resetBtn!.classList.add("hidden"); drop!.classList.remove("hidden"); input!.value = "";
  });
}
