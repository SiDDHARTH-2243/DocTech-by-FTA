// Image Resizer — client-side. Resize by px or % with optional aspect lock.
import { loadImage, imageToCanvas, canvasToBlob, downloadBlob, fmtSize, renameExt, extForType } from "../lib/image";
import { setupDropzone, toast } from "../lib/ui";

const drop = document.getElementById("rsz-drop");
const input = document.getElementById("rsz-input") as HTMLInputElement | null;
const work = document.getElementById("rsz-work");
const preview = document.getElementById("rsz-preview") as HTMLImageElement | null;
const wEl = document.getElementById("rsz-w") as HTMLInputElement | null;
const hEl = document.getElementById("rsz-h") as HTMLInputElement | null;
const wUnit = document.getElementById("rsz-w-unit");
const hUnit = document.getElementById("rsz-h-unit");
const lockBtn = document.getElementById("rsz-lock") as HTMLButtonElement | null;
const unitGroup = document.getElementById("rsz-unit-group");
const downloadBtn = document.getElementById("rsz-download") as HTMLButtonElement | null;
const resetBtn = document.getElementById("rsz-reset");
const badgeDims = document.getElementById("rsz-badge-dims");

if (drop && input && work && preview && wEl && hEl && lockBtn && unitGroup && downloadBtn && resetBtn) {
  let source: HTMLImageElement | null = null;
  let origType = "image/png", origName = "image";
  let natW = 0, natH = 0, aspect = 1;
  let wPx = 0, hPx = 0;
  let locked = true, unit: "px" | "%" = "px";
  let result: Blob | null = null;
  let previewUrl = "";
  let renderTimer = 0;

  async function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    try {
      source = await loadImage(file);
      origName = file.name;
      origType = file.type === "image/jpeg" || file.type === "image/webp" ? file.type : "image/png";
      natW = source.naturalWidth; natH = source.naturalHeight; aspect = natW / natH;
      wPx = natW; hPx = natH;
      document.getElementById("rsz-orig")!.textContent = `${natW} × ${natH} px`;
      drop!.classList.add("hidden"); work!.classList.remove("hidden"); resetBtn!.classList.remove("hidden");
      syncInputs();
      render();
    } catch { toast("Could not read that image", "err"); }
  }

  const toDisplay = (px: number, dim: number) => (unit === "%" ? Math.round((px / dim) * 100) : px);
  const fromDisplay = (val: number, dim: number) => (unit === "%" ? Math.round((val / 100) * dim) : Math.round(val));

  function syncInputs() {
    wEl!.value = String(toDisplay(wPx, natW));
    hEl!.value = String(toDisplay(hPx, natH));
  }

  function onW() {
    wPx = Math.max(1, fromDisplay(parseFloat(wEl!.value) || 0, natW));
    if (locked) { hPx = Math.max(1, Math.round(wPx / aspect)); hEl!.value = String(toDisplay(hPx, natH)); }
    scheduleRender();
  }
  function onH() {
    hPx = Math.max(1, fromDisplay(parseFloat(hEl!.value) || 0, natH));
    if (locked) { wPx = Math.max(1, Math.round(hPx * aspect)); wEl!.value = String(toDisplay(wPx, natW)); }
    scheduleRender();
  }

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = window.setTimeout(render, 120);
  }

  async function render() {
    if (!source) return;
    const canvas = imageToCanvas(source, wPx, hPx, origType === "image/jpeg" ? "#ffffff" : undefined);
    const quality = origType === "image/png" ? undefined : 0.92;
    result = await canvasToBlob(canvas, origType, quality);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(result);
    preview!.src = previewUrl;
    
    const dimsStr = `${wPx} × ${hPx} px`;
    document.getElementById("rsz-dims")!.textContent = dimsStr;
    if (badgeDims) badgeDims.textContent = dimsStr;
    
    document.getElementById("rsz-filesize")!.textContent = fmtSize(result.size);
    downloadBtn!.disabled = false;
  }

  function reset() {
    source = null; result = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = "";
    work!.classList.add("hidden"); resetBtn!.classList.add("hidden"); drop!.classList.remove("hidden");
    downloadBtn!.disabled = true; input!.value = "";
  }

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));
  wEl.addEventListener("input", onW);
  hEl.addEventListener("input", onH);

  lockBtn.addEventListener("click", () => {
    locked = !locked;
    lockBtn.setAttribute("aria-pressed", String(locked));
    lockBtn.innerHTML = locked
      ? `<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" /></svg>`
      : `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>`;
    
    lockBtn.className = locked
      ? "group flex items-center justify-center rounded-xl bg-blue-500 p-2 text-white shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40"
      : "group flex items-center justify-center rounded-xl border border-slate-300 bg-white p-2 text-slate-500 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700";
  });

  unitGroup.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-val]") as HTMLElement | null;
    if (!b || b.dataset.val === unit) return;
    unit = b.dataset.val as "px" | "%";
    
    if (wUnit) wUnit.textContent = unit;
    if (hUnit) hUnit.textContent = unit;

    unitGroup.querySelectorAll<HTMLButtonElement>("[data-val]").forEach((x) => {
      x.className = "rounded-lg px-4 py-1.5 text-xs font-bold transition-all " + (x.dataset.val === unit ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200");
    });
    syncInputs();
  });
  
  // initial unit paint
  unitGroup.querySelectorAll<HTMLButtonElement>("[data-val]").forEach((x) => {
    x.className = "rounded-lg px-4 py-1.5 text-xs font-bold transition-all " + (x.dataset.val === "px" ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200");
  });

  document.querySelectorAll<HTMLElement>("[data-scale]").forEach((b) =>
    b.addEventListener("click", () => {
      const s = parseInt(b.dataset.scale!) / 100;
      wPx = Math.max(1, Math.round(natW * s)); hPx = Math.max(1, Math.round(natH * s));
      syncInputs(); render();
    }),
  );

  downloadBtn.addEventListener("click", () => {
    if (!result) return;
    downloadBlob(result, renameExt(origName, extForType(origType)));
  });
  resetBtn.addEventListener("click", reset);
}
