// Image Converter — client-side. Re-encode an image to PNG / JPG / WebP.
import { loadImage, imageToCanvas, canvasToBlob, downloadBlob, fmtSize, renameExt, extForType } from "../lib/image";
import { setupDropzone, toast } from "../lib/ui";

const drop = document.getElementById("cnv-drop");
const input = document.getElementById("cnv-input") as HTMLInputElement | null;
const work = document.getElementById("cnv-work");
const preview = document.getElementById("cnv-preview") as HTMLImageElement | null;
const formatEl = document.getElementById("cnv-format") as HTMLSelectElement | null;
const qualityEl = document.getElementById("cnv-quality") as HTMLInputElement | null;
const qualityWrap = document.getElementById("cnv-quality-wrap");
const downloadBtn = document.getElementById("cnv-download") as HTMLButtonElement | null;
const resetBtn = document.getElementById("cnv-reset");

if (drop && input && work && preview && formatEl && qualityEl && qualityWrap && downloadBtn && resetBtn) {
  let source: HTMLImageElement | null = null;
  let origName = "image", origSize = 0;
  let result: Blob | null = null;
  let previewUrl = "";

  async function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    try {
      source = await loadImage(file);
      origName = file.name; origSize = file.size;
      const srcExt = (file.type.split("/")[1] || "img").toUpperCase();
      document.getElementById("cnv-orig")!.textContent = `${srcExt} · ${fmtSize(origSize)}`;
      drop!.classList.add("hidden"); work!.classList.remove("hidden"); resetBtn!.classList.remove("hidden");
      await render();
    } catch { toast("Could not read that image", "err"); }
  }

  async function render() {
    if (!source) return;
    const type = formatEl!.value;
    const lossy = type !== "image/png";
    qualityWrap!.style.visibility = lossy ? "visible" : "hidden";
    document.getElementById("cnv-quality-val")!.textContent = qualityEl!.value;
    const quality = lossy ? parseInt(qualityEl!.value) / 100 : undefined;
    const canvas = imageToCanvas(source, source.naturalWidth, source.naturalHeight, type === "image/jpeg" ? "#ffffff" : undefined);
    result = await canvasToBlob(canvas, type, quality);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(result);
    preview!.src = previewUrl;
    document.getElementById("cnv-new")!.textContent = `${extForType(type).toUpperCase()} · ${fmtSize(result.size)}`;
    downloadBtn!.disabled = false;
  }

  function reset() {
    source = null; result = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = "";
    work!.classList.add("hidden"); resetBtn!.classList.add("hidden"); drop!.classList.remove("hidden");
    downloadBtn!.disabled = true; input!.value = "";
  }

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));
  formatEl.addEventListener("change", render);
  qualityEl.addEventListener("input", render);
  downloadBtn.addEventListener("click", () => {
    if (!result) return;
    downloadBlob(result, renameExt(origName, extForType(formatEl!.value)));
  });
  resetBtn.addEventListener("click", reset);
}
