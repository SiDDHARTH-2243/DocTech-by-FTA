// PDF → Image — client-side. Ported from legacy TOOL_VIEWS['pdf2img'] / loadPdf2Img / doPdf2Img.
import JSZip from "jszip";
import { isPDF, fmtSize, readBytes, download, loadPdfJs, renderPageToContainer } from "../lib/pdf";
import { toast, showSpin, setSpinText, hideSpin, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("p2i-dropzone");
const input = document.getElementById("p2i-input") as HTMLInputElement | null;
const opts = document.getElementById("p2i-opts");
const info = document.getElementById("p2i-info");
const preview = document.getElementById("p2i-preview");
const scaleSel = document.getElementById("p2i-scale") as HTMLSelectElement | null;
const fmtSel = document.getElementById("p2i-fmt") as HTMLSelectElement | null;
const btn = document.getElementById("p2i-btn");
const count = document.getElementById("p2i-count");

if (dropzone && input && opts && info && preview && scaleSel && fmtSel && btn && count) {
  let data: { bytes: Uint8Array; name: string; size: number } | null = null;

  async function load(file: File) {
    if (!file || !isPDF(file)) {
      toast("Not a PDF", "err");
      return;
    }
    const bytes = await readBytes(file);
    data = { bytes, name: file.name, size: file.size };
    let pdf;
    try {
      pdf = await loadPdfJs(bytes);
    } catch (e) {
      toast("Could not read PDF: " + (e as Error).message, "err");
      return;
    }
    const numPages = pdf.numPages;
    info!.textContent = `📄 ${file.name} — ${fmtSize(file.size)} — ${numPages} page${numPages !== 1 ? "s" : ""}`;
    count!.textContent = String(numPages);
    opts!.classList.remove("hidden");
    dropzone!.classList.add("hidden");
    await renderPageToContainer(pdf, 1, preview!);
  }

  async function doPdf2Img() {
    if (!data) {
      toast("No file loaded", "err");
      return;
    }
    const scale = parseFloat(scaleSel!.value || "2");
    const fmt = fmtSel!.value || "image/jpeg";
    const ext = fmt === "image/png" ? "png" : "jpg";
    const quality = fmt === "image/jpeg" ? 0.92 : undefined;
    const baseName = data.name.replace(/\.pdf$/i, "");

    showSpin("Rendering pages…");
    try {
      const pdf = await loadPdfJs(data.bytes);
      const numPages = pdf.numPages;
      const blobs: { blob: Blob; name: string }[] = [];

      for (let i = 1; i <= numPages; i++) {
        setSpinText(`Rendering page ${i} of ${numPages}…`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), fmt, quality));
        blobs.push({ blob, name: `${baseName}_page_${i}.${ext}` });
      }

      if (blobs.length === 1) {
        download(blobs[0].blob, blobs[0].name, fmt);
      } else {
        setSpinText("Zipping images…");
        const zip = new JSZip();
        for (const b of blobs) zip.file(b.name, b.blob);
        const zipBlob = await zip.generateAsync({ type: "blob" });
        download(zipBlob, `${baseName}_images_doctech.zip`, "application/zip");
      }
      toast(`✓ Converted ${blobs.length} page${blobs.length !== 1 ? "s" : ""} to ${ext.toUpperCase()}!`, "ok");
    } catch (e) {
      toast("Failed: " + (e as Error).message, "err");
    }
    hideSpin();
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
  btn.addEventListener("click", doPdf2Img);
}
