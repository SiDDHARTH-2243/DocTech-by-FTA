// Image Filters — client-side. CSS-filter sliders + presets on a canvas.
import { loadImage, canvasToBlob, downloadBlob, renameExt, extForType } from "../lib/image";
import { setupDropzone, toast } from "../lib/ui";

type Vals = { brightness: number; contrast: number; saturate: number; grayscale: number; sepia: number; hue: number; blur: number; invert: number };
const DEFAULTS: Vals = { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, hue: 0, blur: 0, invert: 0 };
const KEYS = Object.keys(DEFAULTS) as (keyof Vals)[];

const PRESETS: { name: string; v: Partial<Vals> }[] = [
  { name: "Original", v: {} },
  { name: "Grayscale", v: { grayscale: 100 } },
  { name: "Sepia", v: { sepia: 80, contrast: 110 } },
  { name: "Vintage", v: { sepia: 40, contrast: 110, brightness: 105, saturate: 130, hue: 350 } },
  { name: "Warm", v: { saturate: 120, hue: 350, brightness: 105 } },
  { name: "Cool", v: { hue: 200, saturate: 110, brightness: 102 } },
  { name: "Vivid", v: { saturate: 170, contrast: 120 } },
  { name: "Noir", v: { grayscale: 100, contrast: 145, brightness: 95 } },
  { name: "Invert", v: { invert: 100 } },
];

const drop = document.getElementById("flt-drop");
const input = document.getElementById("flt-input") as HTMLInputElement | null;
const work = document.getElementById("flt-work");
const canvas = document.getElementById("flt-canvas") as HTMLCanvasElement | null;
const presetsEl = document.getElementById("flt-presets");
const downloadBtn = document.getElementById("flt-download") as HTMLButtonElement | null;

if (drop && input && work && canvas && presetsEl && downloadBtn) {
  const ctx = canvas.getContext("2d")!;
  let source: HTMLImageElement | null = null;
  let origName = "image", origType = "image/png";
  const el = (k: keyof Vals) => document.getElementById(`flt-${k === "hue" ? "hue" : k}`) as HTMLInputElement;

  function filterStr(): string {
    const v: Vals = { ...DEFAULTS };
    KEYS.forEach((k) => (v[k] = parseInt(el(k).value)));
    return `brightness(${v.brightness}%) contrast(${v.contrast}%) saturate(${v.saturate}%) grayscale(${v.grayscale}%) sepia(${v.sepia}%) hue-rotate(${v.hue}deg) blur(${v.blur}px) invert(${v.invert}%)`;
  }

  function render() {
    if (!source) return;
    KEYS.forEach((k) => (document.getElementById(`flt-${k}-val`)!.textContent = el(k).value));
    canvas!.width = source.naturalWidth; canvas!.height = source.naturalHeight;
    ctx.filter = filterStr();
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    if (origType === "image/jpeg") { ctx.filter = "none"; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas!.width, canvas!.height); ctx.filter = filterStr(); }
    ctx.drawImage(source, 0, 0);
  }

  function setVals(v: Partial<Vals>) {
    KEYS.forEach((k) => (el(k).value = String(v[k] ?? DEFAULTS[k])));
    render();
  }

  async function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    try {
      source = await loadImage(file);
      origName = file.name;
      origType = file.type === "image/jpeg" || file.type === "image/webp" ? file.type : "image/png";
      drop!.classList.add("hidden"); work!.classList.remove("hidden");
      document.getElementById("flt-reset")!.classList.remove("hidden");
      document.getElementById("flt-reset-filters")!.classList.remove("hidden");
      setVals({});
      downloadBtn!.disabled = false;
    } catch { toast("Could not read that image", "err"); }
  }

  presetsEl.innerHTML = PRESETS.map((p, i) => `<button type="button" data-preset="${i}" class="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-orange-400 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">${p.name}</button>`).join("");
  presetsEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-preset]") as HTMLElement | null;
    if (b) setVals(PRESETS[parseInt(b.dataset.preset!)].v);
  });

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));
  KEYS.forEach((k) => el(k).addEventListener("input", render));
  document.getElementById("flt-reset-filters")!.addEventListener("click", () => setVals({}));
  document.getElementById("flt-reset")!.addEventListener("click", () => {
    source = null;
    work!.classList.add("hidden"); document.getElementById("flt-reset")!.classList.add("hidden");
    document.getElementById("flt-reset-filters")!.classList.add("hidden");
    drop!.classList.remove("hidden"); downloadBtn!.disabled = true; input!.value = "";
  });
  downloadBtn.addEventListener("click", async () => {
    if (!source) return;
    const blob = await canvasToBlob(canvas!, origType, origType === "image/png" ? undefined : 0.92);
    downloadBlob(blob, renameExt(origName, extForType(origType)));
  });
}
