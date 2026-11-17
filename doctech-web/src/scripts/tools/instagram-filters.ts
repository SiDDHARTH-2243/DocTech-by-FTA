// Instagram Filters — client-side. ctx.filter combos (+ optional colour overlay)
// applied to a canvas. Mirrors image-filters.ts.
import { loadImage, canvasToBlob, downloadBlob, renameExt, extForType } from "../lib/image";
import { setupDropzone, toast } from "../lib/ui";

interface Overlay { color: string; alpha: number; mode: GlobalCompositeOperation }
interface Preset { name: string; filter: string; overlay?: Overlay }

const drop = document.getElementById("igf-drop");
const input = document.getElementById("igf-input") as HTMLInputElement | null;
const work = document.getElementById("igf-work");
const canvas = document.getElementById("igf-canvas") as HTMLCanvasElement | null;
const strip = document.getElementById("igf-strip");
const current = document.getElementById("igf-current");
const downloadBtn = document.getElementById("igf-download") as HTMLButtonElement | null;
const resetBtn = document.getElementById("igf-reset");

if (drop && input && work && canvas && strip && current && downloadBtn && resetBtn) {
  const PRESETS: Preset[] = [
    { name: "Normal", filter: "none" },
    { name: "Clarendon", filter: "contrast(1.2) saturate(1.35)" },
    { name: "Gingham", filter: "brightness(1.05) hue-rotate(-10deg) contrast(0.9) sepia(0.04)" },
    { name: "Juno", filter: "saturate(1.4) contrast(1.1) sepia(0.18) hue-rotate(-12deg)" },
    { name: "Lark", filter: "brightness(1.08) contrast(0.9) saturate(1.12)" },
    { name: "Ludwig", filter: "brightness(1.05) contrast(1.05) saturate(1.2) sepia(0.1)" },
    { name: "Moon", filter: "grayscale(1) brightness(1.1) contrast(1.1)" },
    { name: "Lo-Fi", filter: "contrast(1.5) saturate(1.1)" },
    { name: "Aden", filter: "brightness(1.2) contrast(0.9) saturate(0.85) hue-rotate(18deg)", overlay: { color: "#e8b87f", alpha: 0.12, mode: "multiply" } },
    { name: "Valencia", filter: "contrast(1.08) brightness(1.08) sepia(0.25)", overlay: { color: "#f8e5c0", alpha: 0.1, mode: "multiply" } },
    { name: "X-Pro II", filter: "contrast(1.3) saturate(1.3) sepia(0.3)", overlay: { color: "#43250f", alpha: 0.12, mode: "multiply" } },
    { name: "Reyes", filter: "sepia(0.4) brightness(1.1) contrast(0.85) saturate(0.75)" },
  ];

  let source: HTMLImageElement | null = null;
  let active = 0;
  let origName = "photo", origType = "image/png";

  function applyTo(c: HTMLCanvasElement, w: number, h: number, p: Preset) {
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.filter = p.filter;
    ctx.drawImage(source!, 0, 0, w, h);
    ctx.filter = "none";
    if (p.overlay) {
      ctx.globalAlpha = p.overlay.alpha;
      ctx.globalCompositeOperation = p.overlay.mode;
      ctx.fillStyle = p.overlay.color;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
  }

  function renderMain() {
    if (!source) return;
    const maxW = 900;
    const scale = Math.min(1, maxW / source.naturalWidth);
    applyTo(canvas!, Math.round(source.naturalWidth * scale), Math.round(source.naturalHeight * scale), PRESETS[active]);
    current!.textContent = PRESETS[active].name;
    downloadBtn!.disabled = false;
  }

  function buildStrip() {
    const ar = source!.naturalHeight / source!.naturalWidth;
    const tw = 120, th = Math.round(tw * ar);
    strip!.innerHTML = PRESETS.map((p, i) => `
      <button type="button" data-i="${i}" class="overflow-hidden rounded-lg border-2 ${i === active ? "border-orange-500" : "border-transparent hover:border-orange-300"}">
        <canvas data-thumb="${i}" class="block w-full"></canvas>
        <span class="block bg-white/80 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">${p.name}</span>
      </button>`).join("");
    PRESETS.forEach((p, i) => {
      const tc = strip!.querySelector(`canvas[data-thumb="${i}"]`) as HTMLCanvasElement;
      applyTo(tc, tw, th, p);
    });
    strip!.querySelectorAll<HTMLButtonElement>("[data-i]").forEach((b) =>
      b.addEventListener("click", () => {
        active = +b.dataset.i!;
        strip!.querySelectorAll("[data-i]").forEach((x) => { x.classList.remove("border-orange-500"); x.classList.add("border-transparent"); });
        b.classList.remove("border-transparent"); b.classList.add("border-orange-500");
        renderMain();
      }),
    );
  }

  async function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    try {
      source = await loadImage(file);
      origName = file.name;
      origType = file.type === "image/jpeg" || file.type === "image/webp" ? file.type : "image/png";
      active = 0;
      drop!.classList.add("hidden"); work!.classList.remove("hidden"); resetBtn!.classList.remove("hidden");
      renderMain(); buildStrip();
    } catch { toast("Could not read that image", "err"); }
  }

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));
  downloadBtn.addEventListener("click", async () => {
    if (!source) return;
    const full = document.createElement("canvas");
    applyTo(full, source.naturalWidth, source.naturalHeight, PRESETS[active]);
    const blob = await canvasToBlob(full, origType, origType === "image/png" ? undefined : 0.92);
    downloadBlob(blob, renameExt(origName, extForType(origType)));
  });
  resetBtn.addEventListener("click", () => {
    source = null; active = 0;
    work!.classList.add("hidden"); resetBtn!.classList.add("hidden"); drop!.classList.remove("hidden");
    downloadBtn!.disabled = true; input!.value = "";
  });
}
