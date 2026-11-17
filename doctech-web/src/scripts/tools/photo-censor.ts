// Photo Censor — client-side. Drag rectangles to pixelate / blur / black-bar.
import { loadImage, canvasToBlob, downloadBlob, renameExt, extForType } from "../lib/image";
import { setupDropzone, toast } from "../lib/ui";

interface Rect { x: number; y: number; w: number; h: number; mode: string; strength: number }

const drop = document.getElementById("cen-drop");
const input = document.getElementById("cen-input") as HTMLInputElement | null;
const work = document.getElementById("cen-work");
const canvas = document.getElementById("cen-canvas") as HTMLCanvasElement | null;
const modeEl = document.getElementById("cen-mode") as HTMLSelectElement | null;
const strengthEl = document.getElementById("cen-strength") as HTMLInputElement | null;
const downloadBtn = document.getElementById("cen-download") as HTMLButtonElement | null;
const resetBtn = document.getElementById("cen-reset");

if (drop && input && work && canvas && modeEl && strengthEl && downloadBtn && resetBtn) {
  const ctx = canvas.getContext("2d")!;
  let source: HTMLImageElement | null = null;
  let origName = "image", origType = "image/png";
  let rects: Rect[] = [];
  let drag: { x: number; y: number } | null = null;
  let cur: Rect | null = null;

  function applyCensor(r: Rect) {
    const x = Math.round(Math.min(r.x, r.x + r.w)), y = Math.round(Math.min(r.y, r.y + r.h));
    const w = Math.round(Math.abs(r.w)), h = Math.round(Math.abs(r.h));
    if (w < 2 || h < 2 || !source) return;
    if (r.mode === "black") {
      ctx.fillStyle = "#000"; ctx.fillRect(x, y, w, h);
    } else if (r.mode === "pixelate") {
      const p = r.strength;
      const tw = Math.max(1, Math.round(w / p)), th = Math.max(1, Math.round(h / p));
      const tmp = document.createElement("canvas"); tmp.width = tw; tmp.height = th;
      tmp.getContext("2d")!.drawImage(source, x, y, w, h, 0, 0, tw, th);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmp, 0, 0, tw, th, x, y, w, h);
      ctx.imageSmoothingEnabled = true;
    } else {
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.filter = `blur(${r.strength}px)`;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
  }

  function render() {
    if (!source) return;
    ctx.filter = "none";
    ctx.drawImage(source, 0, 0);
    rects.forEach(applyCensor);
    if (cur) {
      const x = Math.min(cur.x, cur.x + cur.w), y = Math.min(cur.y, cur.y + cur.h);
      ctx.strokeStyle = "#f97316"; ctx.lineWidth = Math.max(1, canvas!.width / 300); ctx.setLineDash([6, 4]);
      ctx.strokeRect(x, y, Math.abs(cur.w), Math.abs(cur.h)); ctx.setLineDash([]);
    }
    document.getElementById("cen-count")!.textContent = String(rects.length);
    downloadBtn!.disabled = false;
  }

  function toNat(e: PointerEvent) {
    const rect = canvas!.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (canvas!.width / rect.width), y: (e.clientY - rect.top) * (canvas!.height / rect.height) };
  }

  async function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    try {
      source = await loadImage(file);
      origName = file.name;
      origType = file.type === "image/jpeg" || file.type === "image/webp" ? file.type : "image/png";
      canvas!.width = source.naturalWidth; canvas!.height = source.naturalHeight;
      rects = []; render();
      drop!.classList.add("hidden"); work!.classList.remove("hidden"); resetBtn!.classList.remove("hidden");
    } catch { toast("Could not read that image", "err"); }
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (!source) return;
    const p = toNat(e); drag = p;
    cur = { x: p.x, y: p.y, w: 0, h: 0, mode: modeEl!.value, strength: parseInt(strengthEl!.value) };
    canvas!.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag || !cur) return;
    const p = toNat(e); cur.w = p.x - drag.x; cur.h = p.y - drag.y; render();
  });
  canvas.addEventListener("pointerup", () => {
    if (cur && Math.abs(cur.w) > 3 && Math.abs(cur.h) > 3) rects.push(cur);
    cur = null; drag = null; render();
  });

  modeEl.addEventListener("change", () => { document.getElementById("cen-strength-wrap")!.style.visibility = modeEl!.value === "black" ? "hidden" : "visible"; });
  strengthEl.addEventListener("input", () => (document.getElementById("cen-strength-val")!.textContent = strengthEl!.value));

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));
  document.getElementById("cen-undo")!.addEventListener("click", () => { rects.pop(); render(); });
  document.getElementById("cen-clear")!.addEventListener("click", () => { rects = []; render(); });
  downloadBtn.addEventListener("click", async () => {
    const blob = await canvasToBlob(canvas!, origType, origType === "image/png" ? undefined : 0.92);
    downloadBlob(blob, renameExt(origName, extForType(origType)));
  });
  resetBtn.addEventListener("click", () => {
    source = null; rects = [];
    work!.classList.add("hidden"); resetBtn!.classList.add("hidden"); drop!.classList.remove("hidden");
    downloadBtn!.disabled = true; input!.value = "";
  });
}
