// Barcode Generator — client-side via the `jsbarcode` library.
import JsBarcode from "jsbarcode";
import { toast } from "../lib/ui";
import { downloadBlob } from "../lib/image";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const value = $<HTMLInputElement>("bc-value");
const format = $<HTMLSelectElement>("bc-format");
const width = $<HTMLInputElement>("bc-width");
const widthVal = $("bc-width-val");
const height = $<HTMLInputElement>("bc-height");
const heightVal = $("bc-height-val");
const showText = $<HTMLInputElement>("bc-text");
const svg = document.getElementById("bc-svg") as SVGSVGElement | null;
const errorEl = $("bc-error");
const pngBtn = $("bc-png");
const svgBtn = $("bc-svg-dl");

if (value && svg && format) {
  let valid = false;

  function render() {
    const v = value!.value.trim();
    if (!v) {
      valid = false;
      svg!.innerHTML = "";
      return;
    }
    try {
      JsBarcode(svg!, v, {
        format: format!.value,
        width: parseFloat(width?.value || "2"),
        height: parseInt(height?.value || "80"),
        displayValue: !!showText?.checked,
        lineColor: "#0f172a",
        background: "#ffffff",
        margin: 10,
        fontSize: 16,
      });
      valid = true;
      errorEl?.classList.add("hidden");
    } catch {
      valid = false;
      svg!.innerHTML = "";
      if (errorEl) {
        errorEl.textContent = `"${v}" is not valid for ${format!.value}.`;
        errorEl.classList.remove("hidden");
      }
    }
  }

  function serializedSvg(): string {
    // Ensure a white background rect for exports (SVG has transparent bg).
    return new XMLSerializer().serializeToString(svg!);
  }

  function downloadSvgFile() {
    if (!valid) return toast("Fix the barcode value first", "err");
    downloadBlob(new Blob([serializedSvg()], { type: "image/svg+xml" }), "barcode.svg");
  }

  function downloadPng() {
    if (!valid) return toast("Fix the barcode value first", "err");
    const w = svg!.width.baseVal.value || svg!.clientWidth || 300;
    const h = svg!.height.baseVal.value || svg!.clientHeight || 120;
    const scale = 3;
    const img = new Image();
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serializedSvg());
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => blob && downloadBlob(blob, "barcode.png"), "image/png");
    };
    img.onerror = () => toast("PNG export failed", "err");
    img.src = url;
  }

  width?.addEventListener("input", () => {
    if (widthVal) widthVal.textContent = width!.value;
    render();
  });
  height?.addEventListener("input", () => {
    if (heightVal) heightVal.textContent = height!.value;
    render();
  });
  [value, format, showText].forEach((el) => el?.addEventListener("input", render));
  pngBtn?.addEventListener("click", downloadPng);
  svgBtn?.addEventListener("click", downloadSvgFile);

  render();
}
