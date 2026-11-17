// Image Compressor — client-side. Re-encodes an image at an adjustable quality.
import { loadImage, imageToCanvas, canvasToBlob, downloadBlob, fmtSize, renameExt, extForType } from "../lib/image";
import { setupDropzone, toast } from "../lib/ui";

const drop = document.getElementById("cmp-drop");
const input = document.getElementById("cmp-input") as HTMLInputElement | null;
const work = document.getElementById("cmp-work");
const preview = document.getElementById("cmp-preview") as HTMLImageElement | null;
const previewOrig = document.getElementById("cmp-preview-orig") as HTMLImageElement | null;
const formatEl = document.getElementById("cmp-format") as HTMLSelectElement | null;
const qualityEl = document.getElementById("cmp-quality") as HTMLInputElement | null;
const downloadBtn = document.getElementById("cmp-download") as HTMLButtonElement | null;
const resetBtn = document.getElementById("cmp-reset");

const container = document.getElementById("cmp-compare-container");
const clip = document.getElementById("cmp-compare-clip");
const handle = document.getElementById("cmp-slider-handle");

if (drop && input && work && preview && previewOrig && formatEl && qualityEl && downloadBtn && resetBtn) {
  let source: HTMLImageElement | null = null;
  let origSize = 0;
  let origName = "image";
  let result: Blob | null = null;
  let previewUrl = "";
  let origPreviewUrl = "";

  async function load(file: File) {
    if (!file.type.startsWith("image/")) {
      toast("Please choose an image file", "err");
      return;
    }
    try {
      source = await loadImage(file);
      origSize = file.size;
      origName = file.name;
      
      origPreviewUrl = URL.createObjectURL(file);
      previewOrig!.src = origPreviewUrl;
      
      document.getElementById("cmp-orig")!.textContent = fmtSize(origSize);
      drop!.classList.add("hidden");
      work!.classList.remove("hidden");
      work!.classList.add("flex"); // enable flex layout for workspace
      resetBtn!.classList.remove("hidden");
      
      // Reset slider position to 50%
      if (clip && handle) {
        clip.style.clipPath = `inset(0 50% 0 0)`;
        handle.style.left = `50%`;
      }
      
      await render();
    } catch {
      toast("Could not read that image", "err");
    }
  }

  async function render() {
    if (!source) return;
    const type = formatEl!.value;
    const quality = parseInt(qualityEl!.value) / 100;
    document.getElementById("cmp-quality-val")!.textContent = qualityEl!.value;
    const canvas = imageToCanvas(source, source.naturalWidth, source.naturalHeight, type === "image/jpeg" ? "#ffffff" : undefined);
    result = await canvasToBlob(canvas, type, quality);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(result);
    preview!.src = previewUrl;

    const saved = origSize - result.size;
    const pct = origSize ? Math.round((saved / origSize) * 100) : 0;
    document.getElementById("cmp-new")!.textContent = fmtSize(result.size);
    
    const pctEl = document.getElementById("cmp-saved-pct")!;
    const sizeEl = document.getElementById("cmp-saved-size")!;
    const bgEl = document.getElementById("cmp-savings-bg")!;
    const labelEl = document.getElementById("cmp-saved-label")!;

    if (saved >= 0) {
      labelEl.textContent = "You saved";
      pctEl.textContent = `${pct}%`;
      pctEl.className = "text-4xl font-extrabold text-emerald-500";
      sizeEl.textContent = `-${fmtSize(saved)}`;
      sizeEl.className = "mt-1 text-sm font-semibold text-emerald-600/80 dark:text-emerald-400/80";
      bgEl.style.opacity = "1";
    } else {
      labelEl.textContent = "Size increased";
      pctEl.textContent = `+${Math.abs(pct)}%`;
      pctEl.className = "text-4xl font-extrabold text-rose-500";
      sizeEl.textContent = `+${fmtSize(Math.abs(saved))}`;
      sizeEl.className = "mt-1 text-sm font-semibold text-rose-600/80 dark:text-rose-400/80";
      bgEl.style.opacity = "0"; // No green bg for increased size
    }
    
    downloadBtn!.disabled = false;
  }

  function reset() {
    source = null;
    result = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (origPreviewUrl) URL.revokeObjectURL(origPreviewUrl);
    previewUrl = "";
    origPreviewUrl = "";
    work!.classList.add("hidden");
    work!.classList.remove("flex");
    resetBtn!.classList.add("hidden");
    drop!.classList.remove("hidden");
    downloadBtn!.disabled = true;
    input!.value = "";
  }

  // Set up Slider
  if (container && clip && handle) {
    let isDragging = false;
    
    const moveSlider = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      let clientX = 0;
      if (window.TouchEvent && e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = (e as MouseEvent).clientX;
      }
      
      const rect = container.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      
      const percent = (x / rect.width) * 100;
      clip.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      handle.style.left = `${percent}%`;
    };

    handle.addEventListener("mousedown", () => { isDragging = true; });
    handle.addEventListener("touchstart", () => { isDragging = true; }, { passive: true });
    
    window.addEventListener("mouseup", () => { isDragging = false; });
    window.addEventListener("touchend", () => { isDragging = false; });
    
    window.addEventListener("mousemove", moveSlider);
    window.addEventListener("touchmove", moveSlider, { passive: true });
  }

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));
  [formatEl, qualityEl].forEach((el) => el.addEventListener("input", render));
  downloadBtn.addEventListener("click", () => {
    if (!result) return;
    downloadBlob(result, renameExt(origName, extForType(formatEl!.value)));
  });
  resetBtn.addEventListener("click", reset);
}
