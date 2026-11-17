// Image Color Picker — client-side eyedropper on a canvas.
import { loadImage } from "../lib/image";
import { rgbToHex, idealTextColor } from "../lib/color";
import { setupDropzone, toast, copyText } from "../lib/ui";

const drop = document.getElementById("pick-drop");
const input = document.getElementById("pick-input") as HTMLInputElement | null;
const work = document.getElementById("pick-work");
const canvas = document.getElementById("pick-canvas") as HTMLCanvasElement | null;
const resetBtn = document.getElementById("pick-reset");
const clearBtn = document.getElementById("pick-clear");

if (drop && input && work && canvas && resetBtn && clearBtn) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  let picked: string[] = [];

  function pixelAt(e: PointerEvent | MouseEvent): { r: number; g: number; b: number } {
    const rect = canvas!.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas!.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas!.height / rect.height));
    const cx = Math.max(0, Math.min(canvas!.width - 1, x));
    const cy = Math.max(0, Math.min(canvas!.height - 1, y));
    const [r, g, b] = ctx.getImageData(cx, cy, 1, 1).data;
    return { r, g, b };
  }

  async function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    try {
      const img = await loadImage(file);
      canvas!.width = img.naturalWidth; canvas!.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      picked = []; renderPicked();
      drop!.classList.add("hidden"); work!.classList.remove("hidden"); resetBtn!.classList.remove("hidden");
    } catch { toast("Could not read that image", "err"); }
  }

  function renderPicked() {
    document.getElementById("pick-picked-wrap")!.classList.toggle("hidden", picked.length === 0);
    clearBtn!.classList.toggle("hidden", picked.length === 0);
    const rgb = (hex: string) => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) });
    document.getElementById("pick-list")!.innerHTML = picked
      .map((hex) => `<button type="button" data-hex="${hex}" class="overflow-hidden rounded-xl border border-slate-200 transition-transform hover:scale-[1.03] dark:border-slate-700"><span class="flex h-14 items-center justify-center text-[11px] font-bold" style="background:${hex};color:${idealTextColor(rgb(hex))}">${hex.toUpperCase()}</span></button>`)
      .join("");
  }

  canvas.addEventListener("pointermove", (e) => {
    const { r, g, b } = pixelAt(e);
    const hex = rgbToHex(r, g, b);
    document.getElementById("pick-hover-sw")!.style.background = hex;
    document.getElementById("pick-hover-hex")!.textContent = hex.toUpperCase();
    document.getElementById("pick-hover-rgb")!.textContent = `rgb(${r}, ${g}, ${b})`;
  });
  canvas.addEventListener("click", (e) => {
    const { r, g, b } = pixelAt(e);
    const hex = rgbToHex(r, g, b);
    if (!picked.includes(hex)) { picked.unshift(hex); if (picked.length > 16) picked.pop(); renderPicked(); }
    copyText(hex);
  });

  document.getElementById("pick-list")!.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-hex]") as HTMLElement | null;
    if (b) copyText(b.dataset.hex!);
  });

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));
  clearBtn.addEventListener("click", () => { picked = []; renderPicked(); });
  resetBtn.addEventListener("click", () => {
    work!.classList.add("hidden"); resetBtn!.classList.add("hidden"); drop!.classList.remove("hidden"); input!.value = "";
  });
}
