// PDF to Word — cloud. Ported from legacy TOOL_VIEWS['pdf2word'] / loadPdf2Word / doPdf2Word.
import { API_BASE, isPDF, fmtSize, readBytes, download, loadPdfJs, renderPageToContainer } from "../lib/pdf";
import { toast, showSpin, hideSpin, cloudConsent, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("p2w-dropzone");
const input = document.getElementById("p2w-input") as HTMLInputElement | null;
const opts = document.getElementById("p2w-opts");
const info = document.getElementById("p2w-info");
const preview = document.getElementById("p2w-preview");
const btn = document.getElementById("p2w-btn");
const rail = document.getElementById("p2w-rail");

if (dropzone && input && opts && info && preview && btn && rail) {
  let data: { file: File; name: string; size: number } | null = null;

  async function load(file: File) {
    if (!file || !isPDF(file)) {
      toast("Not a PDF", "err");
      return;
    }
    const bytes = await readBytes(file);
    data = { file, name: file.name, size: file.size };
    info!.textContent = `📄 ${file.name} — ${fmtSize(file.size)}`;
    rail!.textContent = `📄 ${file.name}`;
    opts!.classList.remove("hidden");
    dropzone!.classList.add("hidden");
    try {
      const pdf = await loadPdfJs(bytes);
      await renderPageToContainer(pdf, 1, preview!);
    } catch {
      /* preview optional */
    }
  }

  async function doPdf2Word() {
    if (!data) {
      toast("No file loaded", "err");
      return;
    }
    if (!(await cloudConsent())) return;
    showSpin("Rebuilding Word document… (this may take a minute)");
    const formData = new FormData();
    formData.append("pdf", data.file);
    try {
      const response = await fetch(`${API_BASE}/api/pdf2word`, { method: "POST", body: formData });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: response.statusText }));
        toast("Conversion Failed: " + errData.error, "err");
        hideSpin();
        return;
      }
      const blob = await response.blob();
      download(blob, data.name.replace(/\.pdf$/i, "_doctech.docx"));
      toast("✓ PDF converted to Word successfully!", "ok");
    } catch (netErr) {
      console.error(netErr);
      toast("Connection refused. Is the Node server running?", "err");
    }
    hideSpin();
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
  btn.addEventListener("click", doPdf2Word);
}
