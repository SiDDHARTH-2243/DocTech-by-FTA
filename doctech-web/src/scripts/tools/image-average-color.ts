// Image Average Color Finder — client-side.
import { loadImage, getAverageColor } from "../lib/image";
import { rgbToHex, rgbToHsl, idealTextColor } from "../lib/color";
import { setupDropzone, toast, copyText } from "../lib/ui";

const drop = document.getElementById("avg-drop");
const input = document.getElementById("avg-input") as HTMLInputElement | null;
const work = document.getElementById("avg-work");
const preview = document.getElementById("avg-preview") as HTMLImageElement | null;
const swatch = document.getElementById("avg-swatch");
const resetBtn = document.getElementById("avg-reset");

if (drop && input && work && preview && swatch && resetBtn) {
  async function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    try {
      const img = await loadImage(file);
      preview!.src = URL.createObjectURL(file);
      const { r, g, b } = getAverageColor(img);
      const hex = rgbToHex(r, g, b);
      const { h, s, l } = rgbToHsl(r, g, b);
      swatch!.style.background = hex;
      swatch!.style.color = idealTextColor({ r, g, b });
      swatch!.textContent = hex.toUpperCase();
      document.getElementById("avg-hex")!.textContent = hex;
      document.getElementById("avg-rgb")!.textContent = `rgb(${r}, ${g}, ${b})`;
      document.getElementById("avg-hsl")!.textContent = `hsl(${h}, ${s}%, ${l}%)`;
      drop!.classList.add("hidden"); work!.classList.remove("hidden"); resetBtn!.classList.remove("hidden");
    } catch { toast("Could not read that image", "err"); }
  }

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));
  work.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-copy]") as HTMLElement | null;
    if (b) copyText(document.getElementById(b.dataset.copy!)!.textContent || "");
  });
  resetBtn.addEventListener("click", () => {
    work!.classList.add("hidden"); resetBtn!.classList.add("hidden"); drop!.classList.remove("hidden"); input!.value = "";
  });
}
