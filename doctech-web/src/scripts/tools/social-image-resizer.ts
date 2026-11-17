// Social Media Image Resizer — client-side. Cover-crop or contain-pad an image
// to platform-exact dimensions.
import { loadImage, canvasToBlob, downloadBlob, renameExt, extForType } from "../lib/image";
import { setupDropzone, toast } from "../lib/ui";

const drop = document.getElementById("sr-drop");
const input = document.getElementById("sr-input") as HTMLInputElement | null;
const work = document.getElementById("sr-work");
const canvas = document.getElementById("sr-canvas") as HTMLCanvasElement | null;
const presetEl = document.getElementById("sr-preset") as HTMLSelectElement | null;
const fitEl = document.getElementById("sr-fit") as HTMLSelectElement | null;
const bgEl = document.getElementById("sr-bg") as HTMLInputElement | null;
const dims = document.getElementById("sr-dims");
const downloadBtn = document.getElementById("sr-download") as HTMLButtonElement | null;
const resetBtn = document.getElementById("sr-reset");

if (drop && input && work && canvas && presetEl && fitEl && bgEl && dims && downloadBtn && resetBtn) {
  const PRESETS: { name: string; w: number; h: number }[] = [
    { name: "Instagram — Square", w: 1080, h: 1080 },
    { name: "Instagram — Portrait", w: 1080, h: 1350 },
    { name: "Instagram — Story / Reel", w: 1080, h: 1920 },
    { name: "Facebook — Post", w: 1200, h: 630 },
    { name: "Facebook — Cover", w: 820, h: 312 },
    { name: "X / Twitter — Post", w: 1600, h: 900 },
    { name: "X / Twitter — Header", w: 1500, h: 500 },
    { name: "YouTube — Thumbnail", w: 1280, h: 720 },
    { name: "LinkedIn — Post", w: 1200, h: 627 },
    { name: "LinkedIn — Banner", w: 1584, h: 396 },
    { name: "Pinterest — Pin", w: 1000, h: 1500 },
    { name: "TikTok — Video", w: 1080, h: 1920 },
  ];

  presetEl.innerHTML = PRESETS.map((p, i) => `<option value="${i}">${p.name} — ${p.w}×${p.h}</option>`).join("");

  let source: HTMLImageElement | null = null;
  let origName = "image", origType = "image/png";

  function render() {
    if (!source) return;
    const p = PRESETS[+presetEl!.value];
    canvas!.width = p.w; canvas!.height = p.h;
    const ctx = canvas!.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    const iw = source.naturalWidth, ih = source.naturalHeight;

    if (fitEl!.value === "contain") {
      ctx.fillStyle = bgEl!.value;
      ctx.fillRect(0, 0, p.w, p.h);
      const scale = Math.min(p.w / iw, p.h / ih);
      const dw = iw * scale, dh = ih * scale;
      ctx.drawImage(source, (p.w - dw) / 2, (p.h - dh) / 2, dw, dh);
    } else {
      const scale = Math.max(p.w / iw, p.h / ih);
      const dw = iw * scale, dh = ih * scale;
      ctx.drawImage(source, (p.w - dw) / 2, (p.h - dh) / 2, dw, dh);
    }
    dims!.textContent = `${p.w} × ${p.h}`;
    downloadBtn!.disabled = false;
  }

  async function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    try {
      source = await loadImage(file);
      origName = file.name;
      origType = file.type === "image/jpeg" || file.type === "image/webp" ? file.type : "image/png";
      drop!.classList.add("hidden"); work!.classList.remove("hidden"); resetBtn!.classList.remove("hidden");
      render();
    } catch { toast("Could not read that image", "err"); }
  }

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));
  [presetEl, fitEl, bgEl].forEach((el) => el.addEventListener("input", render));
  downloadBtn.addEventListener("click", async () => {
    const blob = await canvasToBlob(canvas!, origType, origType === "image/png" ? undefined : 0.92);
    const p = PRESETS[+presetEl!.value];
    downloadBlob(blob, renameExt(`${origName.replace(/\.[^.]+$/, "")}_${p.w}x${p.h}`, extForType(origType)));
  });
  resetBtn.addEventListener("click", () => {
    source = null;
    work!.classList.add("hidden"); resetBtn!.classList.add("hidden"); drop!.classList.remove("hidden");
    downloadBtn!.disabled = true; input!.value = "";
  });
}
