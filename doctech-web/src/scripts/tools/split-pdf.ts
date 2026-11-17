// Split PDF — client-side. Ported from legacy TOOL_VIEWS['split'] / loadSplit /
// doSplitRange / doSplitZip, using the npm pdf-lib + jszip imports.
import JSZip from "jszip";
import {
  PDFDocument,
  isPDF,
  fmtSize,
  readBytes,
  download,
  parseRange,
  loadPdfJs,
  renderPageToContainer,
} from "../lib/pdf";
import { toast, showSpin, setSpinText, hideSpin, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("split-dropzone");
const input = document.getElementById("split-input") as HTMLInputElement | null;
const opts = document.getElementById("split-opts");
const info = document.getElementById("split-info");
const preview = document.getElementById("split-preview");
const rangeInput = document.getElementById("split-range") as HTMLInputElement | null;
const extractBtn = document.getElementById("split-extract");
const zipBtn = document.getElementById("split-zip");
const count = document.getElementById("split-count");

if (dropzone && input && opts && info && preview && rangeInput && extractBtn && zipBtn && count) {
  let data: { bytes: Uint8Array; name: string; pages: number } | null = null;

  async function load(file: File) {
    if (!file || !isPDF(file)) {
      toast("Not a PDF", "err");
      return;
    }
    const bytes = await readBytes(file);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = doc.getPageCount();
    data = { bytes, name: file.name, pages };

    info!.textContent = `📄 ${file.name} — ${pages} page(s) · ${fmtSize(file.size)}`;
    count!.textContent = String(pages);
    opts!.classList.remove("hidden");
    dropzone!.classList.add("hidden");

    const pdf = await loadPdfJs(bytes);
    await renderPageToContainer(pdf, 1, preview!);
  }

  async function doExtractRange() {
    if (!data) {
      toast("No file loaded", "err");
      return;
    }
    const raw = rangeInput!.value.trim();
    if (!raw) {
      doSplitZip();
      return;
    }
    let idx: number[];
    try {
      idx = parseRange(raw, data.pages);
    } catch (e) {
      toast((e as Error).message, "err");
      return;
    }
    showSpin("Extracting pages…");
    try {
      const src = await PDFDocument.load(data.bytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const cp = await out.copyPages(src, idx.map((i) => i - 1));
      cp.forEach((p) => out.addPage(p));
      download(await out.save(), "extracted_doctech.pdf");
      toast(`✓ Extracted ${idx.length} page(s)!`, "ok");
    } catch (e) {
      toast("Failed: " + (e as Error).message, "err");
    }
    hideSpin();
  }

  async function doSplitZip() {
    if (!data) {
      toast("No file loaded", "err");
      return;
    }
    showSpin("Building ZIP archive…");
    try {
      const src = await PDFDocument.load(data.bytes, { ignoreEncryption: true });
      const zip = new JSZip();
      for (let i = 0; i < data.pages; i++) {
        const nd = await PDFDocument.create();
        const [cp] = await nd.copyPages(src, [i]);
        nd.addPage(cp);
        zip.file(`page_${String(i + 1).padStart(3, "0")}.pdf`, await nd.save());
        setSpinText(`Splitting page ${i + 1} of ${data.pages}…`);
      }
      setSpinText("Compressing ZIP…");
      const blob = await zip.generateAsync({ type: "blob" });
      download(blob, "all_pages_doctech.zip", "application/zip");
      toast(`✓ ZIP with ${data.pages} PDFs!`, "ok");
    } catch (e) {
      toast("Failed: " + (e as Error).message, "err");
    }
    hideSpin();
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
  extractBtn.addEventListener("click", doExtractRange);
  zipBtn.addEventListener("click", doSplitZip);
}
