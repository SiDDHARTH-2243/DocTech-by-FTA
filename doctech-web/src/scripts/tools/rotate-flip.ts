// Rotate & Flip — client-side. Composes rotation (90° steps + free angle) and
// horizontal/vertical flips on a canvas sized to the rotated bounds.
import { loadImage, canvasToBlob, downloadBlob, renameExt, extForType } from "../lib/image";
import { setupDropzone, toast } from "../lib/ui";

const drop = document.getElementById("rot-drop");
const input = document.getElementById("rot-input") as HTMLInputElement | null;
const work = document.getElementById("rot-work");
const canvas = document.getElementById("rot-canvas") as HTMLCanvasElement | null;
const angleEl = document.getElementById("rot-angle") as HTMLInputElement | null;
const downloadBtn = document.getElementById("rot-download") as HTMLButtonElement | null;
const resetBtn = document.getElementById("rot-reset");

if (drop && input && work && canvas && angleEl && downloadBtn && resetBtn) {
  let source: HTMLImageElement | null = null;
  let origName = "image", origType = "image/png";
  let angle = 0, flipH = false, flipV = false;

  async function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    try {
      source = await loadImage(file);
      origName = file.name;
      origType = file.type === "image/jpeg" || file.type === "image/webp" ? file.type : "image/png";
      angle = 0; flipH = false; flipV = false; angleEl!.value = "0";
      drop!.classList.add("hidden"); work!.classList.remove("hidden"); resetBtn!.classList.remove("hidden");
      render();
      downloadBtn!.disabled = false;
    } catch { toast("Could not read that image", "err"); }
  }

  function render() {
    if (!source) return;
    document.getElementById("rot-angle-val")!.textContent = String(angle);
    const w = source.naturalWidth, h = source.naturalHeight;
    const rad = (angle * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
    const bw = Math.round(w * cos + h * sin), bh = Math.round(w * sin + h * cos);
    canvas!.width = bw; canvas!.height = bh;
    const ctx = canvas!.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    if (origType === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, bw, bh); }
    ctx.translate(bw / 2, bh / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(source, -w / 2, -h / 2);
    document.getElementById("rot-dims")!.textContent = `${bw} × ${bh}`;
  }

  function reset() {
    source = null;
    work!.classList.add("hidden"); resetBtn!.classList.add("hidden"); drop!.classList.remove("hidden");
    downloadBtn!.disabled = true; input!.value = "";
  }

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));

  const step = (d: number) => { angle = ((angle + d) % 360 + 360) % 360; if (angle > 180) angle -= 360; angleEl!.value = String(angle); render(); };
  document.getElementById("rot-left")!.addEventListener("click", () => step(-90));
  document.getElementById("rot-right")!.addEventListener("click", () => step(90));
  document.getElementById("rot-fliph")!.addEventListener("click", () => { flipH = !flipH; render(); });
  document.getElementById("rot-flipv")!.addEventListener("click", () => { flipV = !flipV; render(); });
  document.getElementById("rot-reset-tx")!.addEventListener("click", () => { angle = 0; flipH = false; flipV = false; angleEl!.value = "0"; render(); });
  angleEl.addEventListener("input", () => { angle = parseInt(angleEl!.value); render(); });

  downloadBtn.addEventListener("click", async () => {
    if (!source) return;
    const blob = await canvasToBlob(canvas!, origType, origType === "image/png" ? undefined : 0.92);
    downloadBlob(blob, renameExt(origName, extForType(origType)));
  });
  resetBtn.addEventListener("click", reset);
}
