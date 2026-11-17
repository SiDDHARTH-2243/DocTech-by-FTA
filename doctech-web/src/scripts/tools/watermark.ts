// Watermark — client-side. Ported from legacy TOOL_VIEWS['watermark'] / loadWm / doWatermark.
import { PDFDocument, rgb, degrees, StandardFonts, isPDF, readBytes, download } from "../lib/pdf";
import { toast, showSpin, hideSpin, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("wm-dropzone");
const input = document.getElementById("wm-input") as HTMLInputElement | null;
const opts = document.getElementById("wm-opts");
const info = document.getElementById("wm-info");
const textInput = document.getElementById("wm-text") as HTMLInputElement | null;
const opacity = document.getElementById("wm-opacity") as HTMLInputElement | null;
const opacityVal = document.getElementById("wm-opacity-val");
const colorSel = document.getElementById("wm-color") as HTMLSelectElement | null;
const btn = document.getElementById("wm-btn");
const count = document.getElementById("wm-count");

if (dropzone && input && opts && info && textInput && opacity && opacityVal && colorSel && btn && count) {
  let data: { bytes: Uint8Array; name: string } | null = null;

  opacity.addEventListener("input", () => (opacityVal!.textContent = `${opacity!.value}%`));

  async function load(file: File) {
    if (!file || !isPDF(file)) {
      toast("Not a PDF", "err");
      return;
    }
    const bytes = await readBytes(file);
    data = { bytes, name: file.name };
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    info!.textContent = `📄 ${file.name} — ${doc.getPageCount()} page(s)`;
    count!.textContent = String(doc.getPageCount());
    opts!.classList.remove("hidden");
    opts!.classList.add("flex");
    dropzone!.classList.add("hidden");
  }

  async function doWatermark() {
    if (!data) {
      toast("No file", "err");
      return;
    }
    const text = textInput!.value.trim();
    if (!text) {
      toast("Enter watermark text", "err");
      return;
    }
    const op = parseInt(opacity!.value) / 100;
    const clrMap: Record<string, ReturnType<typeof rgb>> = {
      gray: rgb(0.5, 0.5, 0.5),
      red: rgb(0.8, 0.1, 0.1),
      blue: rgb(0.1, 0.1, 0.8),
    };
    const clr = clrMap[colorSel!.value] || clrMap.gray;
    showSpin("Applying watermark…");
    try {
      const src = await PDFDocument.load(data.bytes, { ignoreEncryption: true });
      const font = await src.embedFont(StandardFonts.Helvetica);
      src.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const fs = Math.min(width, height) * 0.08;
        page.drawText(text, {
          x: width / 2 - (font.widthOfTextAtSize(text, fs) / 2) * Math.cos(Math.PI / 4),
          y: height / 2,
          size: fs,
          font,
          color: clr,
          opacity: op,
          rotate: degrees(-45),
        });
      });
      download(await src.save(), data.name.replace(/\.pdf$/i, "_watermarked_doctech.pdf"));
      toast("✓ Watermark applied!", "ok");
    } catch (e) {
      toast("Failed: " + (e as Error).message, "err");
    }
    hideSpin();
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
  btn.addEventListener("click", doWatermark);
}
