// Profile Picture Maker — circle crop + ring + background → 800×800 PNG.
import { loadImage, canvasToBlob, downloadBlob } from "../lib/image";
import { setupDropzone, toast } from "../lib/ui";

const $ = (id: string) => document.getElementById(id);
const drop = $("pfp-drop");
const input = $("pfp-input") as HTMLInputElement | null;
const work = $("pfp-work");
const canvas = $("pfp-canvas") as HTMLCanvasElement | null;
const zoom = $("pfp-zoom") as HTMLInputElement | null;
const zoomVal = $("pfp-zoom-val");
const ringW = $("pfp-ringw") as HTMLInputElement | null;
const ringWVal = $("pfp-ringw-val");
const ring = $("pfp-ring") as HTMLInputElement | null;
const bg = $("pfp-bg") as HTMLInputElement | null;
const transparent = $("pfp-transparent") as HTMLInputElement | null;
const downloadBtn = $("pfp-download") as HTMLButtonElement | null;
const resetBtn = $("pfp-reset");

if (drop && input && work && canvas && zoom && zoomVal && ringW && ringWVal && ring && bg && transparent && downloadBtn && resetBtn) {
  let source: HTMLImageElement | null = null;
  const SIZE = 800;

  function render() {
    if (!source) return;
    zoomVal!.textContent = (+zoom!.value).toFixed(1);
    ringWVal!.textContent = ringW!.value;
    canvas!.width = SIZE; canvas!.height = SIZE;
    const ctx = canvas!.getContext("2d")!;
    ctx.clearRect(0, 0, SIZE, SIZE);
    if (!transparent!.checked) { ctx.fillStyle = bg!.value; ctx.fillRect(0, 0, SIZE, SIZE); }

    const rw = +ringW!.value * (SIZE / 400);
    const r = SIZE / 2 - rw;
    ctx.save();
    ctx.beginPath(); ctx.arc(SIZE / 2, SIZE / 2, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    const z = +zoom!.value;
    const base = Math.max(SIZE / source.naturalWidth, SIZE / source.naturalHeight) * z;
    const dw = source.naturalWidth * base, dh = source.naturalHeight * base;
    ctx.drawImage(source, (SIZE - dw) / 2, (SIZE - dh) / 2, dw, dh);
    ctx.restore();

    if (rw > 0) {
      ctx.beginPath(); ctx.arc(SIZE / 2, SIZE / 2, r + rw / 2, 0, Math.PI * 2);
      ctx.strokeStyle = ring!.value; ctx.lineWidth = rw; ctx.stroke();
    }
    downloadBtn!.disabled = false;
  }

  async function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    try {
      source = await loadImage(file);
      drop!.classList.add("hidden"); work!.classList.remove("hidden"); resetBtn!.classList.remove("hidden");
      render();
    } catch { toast("Could not read that image", "err"); }
  }

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));
  [zoom, ringW, ring, bg, transparent].forEach((el) => el.addEventListener("input", render));
  downloadBtn.addEventListener("click", async () => downloadBlob(await canvasToBlob(canvas!, "image/png"), "profile_picture_doctech.png"));
  resetBtn.addEventListener("click", () => {
    source = null;
    work!.classList.add("hidden"); resetBtn!.classList.add("hidden"); drop!.classList.remove("hidden");
    downloadBtn!.disabled = true; input!.value = "";
  });
}
