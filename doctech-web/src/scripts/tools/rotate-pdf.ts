// Rotate Pages — client-side. Ported from legacy TOOL_VIEWS['rotate'] / loadRot / doRotate.
import {
  PDFDocument,
  degrees,
  isPDF,
  readBytes,
  download,
  loadPdfJs,
  renderPageToContainer,
} from "../lib/pdf";
import { toast, showSpin, hideSpin, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("rotate-dropzone");
const input = document.getElementById("rotate-input") as HTMLInputElement | null;
const opts = document.getElementById("rotate-opts");
const info = document.getElementById("rotate-info");
const preview = document.getElementById("rotate-preview");
const btn = document.getElementById("rotate-btn");
const count = document.getElementById("rotate-count");

if (dropzone && input && opts && info && preview && btn && count) {
  let data: { bytes: Uint8Array; name: string } | null = null;

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
    dropzone!.classList.add("hidden");
    const pdf = await loadPdfJs(bytes);
    await renderPageToContainer(pdf, 1, preview!);
  }

  async function doRotate() {
    if (!data) {
      toast("No file", "err");
      return;
    }
    const ang = parseInt(
      (document.querySelector('input[name="rotate-angle"]:checked') as HTMLInputElement).value,
    );
    showSpin(`Rotating pages by ${ang}°…`);
    try {
      const src = await PDFDocument.load(data.bytes, { ignoreEncryption: true });
      src.getPages().forEach((p) => p.setRotation(degrees((p.getRotation().angle + ang) % 360)));
      download(await src.save(), data.name.replace(/\.pdf$/i, `_rotated${ang}_doctech.pdf`));
      toast(`✓ Rotated ${ang}°!`, "ok");
    } catch (e) {
      toast("Failed: " + (e as Error).message, "err");
    }
    hideSpin();
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
  btn.addEventListener("click", doRotate);
}
