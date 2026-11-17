// QR Code Generator — client-side via the `qrcode` library.
import QRCode from "qrcode";
import { toast } from "../lib/ui";
import { downloadBlob } from "../lib/image";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const text = $<HTMLTextAreaElement>("qr-text");
const size = $<HTMLInputElement>("qr-size");
const sizeVal = $("qr-size-val");
const ecl = $<HTMLSelectElement>("qr-ecl");
const fg = $<HTMLInputElement>("qr-fg");
const bg = $<HTMLInputElement>("qr-bg");
const canvas = $<HTMLCanvasElement>("qr-canvas");
const pngBtn = $("qr-png");
const svgBtn = $("qr-svg");

if (text && canvas && size) {
  type ECL = "L" | "M" | "Q" | "H";

  function opts() {
    return {
      width: parseInt(size!.value),
      margin: 2,
      errorCorrectionLevel: (ecl?.value as ECL) || "M",
      color: { dark: fg?.value || "#0f172a", light: bg?.value || "#ffffff" },
    };
  }

  async function render() {
    const value = text!.value.trim();
    if (!value) {
      const ctx = canvas!.getContext("2d");
      ctx?.clearRect(0, 0, canvas!.width, canvas!.height);
      return;
    }
    try {
      await QRCode.toCanvas(canvas!, value, opts());
    } catch {
      toast("That text is too long for this size / level", "err");
    }
  }

  async function downloadPng() {
    const value = text!.value.trim();
    if (!value) return toast("Enter some text first", "err");
    canvas!.toBlob((blob) => blob && downloadBlob(blob, "qr-code.png"), "image/png");
  }

  async function downloadSvg() {
    const value = text!.value.trim();
    if (!value) return toast("Enter some text first", "err");
    try {
      const svg = await QRCode.toString(value, { ...opts(), type: "svg" });
      downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg");
    } catch {
      toast("Could not export SVG", "err");
    }
  }

  size.addEventListener("input", () => {
    if (sizeVal) sizeVal.textContent = size!.value;
    render();
  });
  [text, ecl, fg, bg].forEach((el) => el?.addEventListener("input", render));
  pngBtn?.addEventListener("click", downloadPng);
  svgBtn?.addEventListener("click", downloadSvg);

  render();
}
