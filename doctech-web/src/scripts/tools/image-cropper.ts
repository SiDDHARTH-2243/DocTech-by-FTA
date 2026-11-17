// Image Cropper — client-side. Interactive crop box (move + 8 handles),
// aspect presets, exports the cropped region via canvas.
import { loadImage, canvasToBlob, downloadBlob, renameExt, extForType } from "../lib/image";
import { setupDropzone, toast } from "../lib/ui";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
type Handle = (typeof HANDLES)[number];
const CORNER: Record<string, boolean> = { nw: true, ne: true, se: true, sw: true };
const HPOS: Record<Handle, string> = {
  nw: "left:-5px;top:-5px;cursor:nwse-resize", n: "left:50%;top:-5px;margin-left:-5px;cursor:ns-resize",
  ne: "right:-5px;top:-5px;cursor:nesw-resize", e: "right:-5px;top:50%;margin-top:-5px;cursor:ew-resize",
  se: "right:-5px;bottom:-5px;cursor:nwse-resize", s: "left:50%;bottom:-5px;margin-left:-5px;cursor:ns-resize",
  sw: "left:-5px;bottom:-5px;cursor:nesw-resize", w: "left:-5px;top:50%;margin-top:-5px;cursor:ew-resize",
};

const drop = document.getElementById("crp-drop");
const input = document.getElementById("crp-input") as HTMLInputElement | null;
const work = document.getElementById("crp-work");
const wrap = document.getElementById("crp-wrap");
const imgEl = document.getElementById("crp-img") as HTMLImageElement | null;
const boxEl = document.getElementById("crp-box");
const aspectsEl = document.getElementById("crp-aspects");
const downloadBtn = document.getElementById("crp-download") as HTMLButtonElement | null;
const resetBtn = document.getElementById("crp-reset");

if (drop && input && work && wrap && imgEl && boxEl && aspectsEl && downloadBtn && resetBtn) {
  let source: HTMLImageElement | null = null;
  let origName = "image", origType = "image/png";
  let dispW = 0, dispH = 0, scale = 1; // scale = natural / display
  let box = { x: 0, y: 0, w: 0, h: 0 }; // in display coords
  let ar = 0; // aspect ratio (w/h); 0 = free

  async function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    try {
      source = await loadImage(file);
      origName = file.name;
      origType = file.type === "image/jpeg" || file.type === "image/webp" ? file.type : "image/png";
      drop!.classList.add("hidden"); work!.classList.remove("hidden"); resetBtn!.classList.remove("hidden");
      // Display in a fresh URL (source is already decoded; don't touch its src).
      imgEl!.src = URL.createObjectURL(file);
      // Wait for the <img> to lay out so clientWidth/Height are real.
      await new Promise<void>((r) => { imgEl!.onload = () => r(); if (imgEl!.complete && imgEl!.clientWidth) r(); });
      measure();
      buildHandles();
      box = { x: dispW * 0.1, y: dispH * 0.1, w: dispW * 0.8, h: dispH * 0.8 };
      applyAspect();
      draw();
      downloadBtn!.disabled = false;
    } catch { toast("Could not read that image", "err"); }
  }

  function measure() {
    dispW = imgEl!.clientWidth; dispH = imgEl!.clientHeight;
    scale = source!.naturalWidth / dispW;
    document.getElementById("crp-orig")!.textContent = `${source!.naturalWidth} × ${source!.naturalHeight}`;
  }

  let handlesBuilt = false;
  function buildHandles() {
    if (handlesBuilt) return;
    HANDLES.forEach((h) => {
      const el = document.createElement("div");
      el.dataset.h = h;
      el.className = "crp-handle absolute h-2.5 w-2.5 rounded-[2px] border border-orange-500 bg-white";
      el.setAttribute("style", HPOS[h]);
      boxEl!.appendChild(el);
    });
    handlesBuilt = true;
  }

  function setEdgeHandlesVisible(v: boolean) {
    boxEl!.querySelectorAll<HTMLElement>(".crp-handle").forEach((el) => {
      if (!CORNER[el.dataset.h!]) el.style.display = v ? "" : "none";
    });
  }

  function applyAspect() {
    if (!ar) return;
    // keep top-left, fit height from width, clamp into image
    let w = box.w, h = w / ar;
    if (h > dispH) { h = dispH; w = h * ar; }
    if (w > dispW) { w = dispW; h = w / ar; }
    box.w = w; box.h = h;
    box.x = clamp(box.x, 0, dispW - w); box.y = clamp(box.y, 0, dispH - h);
  }

  function draw() {
    boxEl!.style.left = `${box.x}px`; boxEl!.style.top = `${box.y}px`;
    boxEl!.style.width = `${box.w}px`; boxEl!.style.height = `${box.h}px`;
    document.getElementById("crp-dims")!.textContent = `${Math.round(box.w * scale)} × ${Math.round(box.h * scale)}`;
  }

  // ── Drag (move + resize) ──────────────────────────────────────────────
  let mode: "move" | Handle | null = null;
  let start = { mx: 0, my: 0, box: { x: 0, y: 0, w: 0, h: 0 } };

  function pointerPos(e: PointerEvent) {
    const r = wrap!.getBoundingClientRect();
    return { x: clamp(e.clientX - r.left, 0, dispW), y: clamp(e.clientY - r.top, 0, dispH) };
  }

  boxEl.addEventListener("pointerdown", (e) => {
    const h = (e.target as HTMLElement).dataset.h as Handle | undefined;
    mode = h ?? "move";
    const p = pointerPos(e);
    start = { mx: p.x, my: p.y, box: { ...box } };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });

  document.addEventListener("pointermove", (e) => {
    if (!mode) return;
    const p = pointerPos(e);
    const dx = p.x - start.mx, dy = p.y - start.my;
    const b = start.box;
    if (mode === "move") {
      box.x = clamp(b.x + dx, 0, dispW - b.w);
      box.y = clamp(b.y + dy, 0, dispH - b.h);
    } else {
      let { x, y, w, h } = b;
      const right = b.x + b.w, bottom = b.y + b.h;
      if (mode.includes("e")) w = b.w + dx;
      if (mode.includes("s")) h = b.h + dy;
      if (mode.includes("w")) { x = b.x + dx; w = b.w - dx; }
      if (mode.includes("n")) { y = b.y + dy; h = b.h - dy; }
      if (ar) {
        h = w / ar;
        if (mode.includes("n")) y = bottom - h;          // anchor bottom edge
        if (mode === "e" || mode === "w") { /* width-driven, center vertically */ y = b.y + (b.h - h) / 2; }
      }
      // enforce minimums + image bounds
      w = clamp(w, 24, dispW); h = clamp(h, 24, dispH);
      if (mode.includes("w")) x = right - w; else if (mode === "n" || mode === "s") x = b.x;
      if (mode.includes("n")) y = bottom - h;
      x = clamp(x, 0, dispW - w); y = clamp(y, 0, dispH - h);
      box = { x, y, w, h };
    }
    draw();
  });
  document.addEventListener("pointerup", () => (mode = null));

  // ── Aspect presets ────────────────────────────────────────────────────
  aspectsEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-aspect]") as HTMLElement | null;
    if (!b) return;
    const val = b.dataset.aspect!;
    ar = val === "Free" ? 0 : (() => { const [a, c] = val.split(":").map(Number); return a / c; })();
    aspectsEl.querySelectorAll<HTMLElement>("[data-aspect]").forEach((x) => {
      const on = x.dataset.aspect === val;
      x.className = on
        ? "rounded-lg bg-orange-500 px-3 py-1 text-xs font-semibold text-white"
        : "rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800";
    });
    setEdgeHandlesVisible(!ar);
    applyAspect();
    draw();
  });

  function reset() {
    source = null;
    work!.classList.add("hidden"); resetBtn!.classList.add("hidden"); drop!.classList.remove("hidden");
    downloadBtn!.disabled = true; input!.value = "";
  }

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));

  downloadBtn.addEventListener("click", async () => {
    if (!source) return;
    const sx = box.x * scale, sy = box.y * scale, sw = box.w * scale, sh = box.h * scale;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sw)); canvas.height = Math.max(1, Math.round(sh));
    const ctx = canvas.getContext("2d")!;
    if (origType === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, origType, origType === "image/png" ? undefined : 0.92);
    downloadBlob(blob, renameExt(origName, extForType(origType)));
  });
  resetBtn.addEventListener("click", reset);

  // Re-measure on resize (display size may change).
  window.addEventListener("resize", () => {
    if (!source) return;
    const prev = { ...box }, prevW = dispW, prevH = dispH;
    measure();
    if (prevW) { const fx = dispW / prevW, fy = dispH / prevH; box = { x: prev.x * fx, y: prev.y * fy, w: prev.w * fx, h: prev.h * fy }; }
    draw();
  });
}
