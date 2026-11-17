// Word to PDF — cloud. Ported from legacy TOOL_VIEWS['word2pdf'] / loadWord2Pdf / doWord2Pdf.
import { API_BASE, fmtSize, download } from "../lib/pdf";
import { toast, showSpin, hideSpin, cloudConsent, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("w2p-dropzone");
const input = document.getElementById("w2p-input") as HTMLInputElement | null;
const opts = document.getElementById("w2p-opts");
const info = document.getElementById("w2p-info");
const btn = document.getElementById("w2p-btn");
const rail = document.getElementById("w2p-rail");

if (dropzone && input && opts && info && btn && rail) {
  let data: { file: File; name: string; size: number } | null = null;

  function load(file: File) {
    if (!file || !file.name.match(/\.docx?$/i)) {
      toast("Not a valid Word document", "err");
      return;
    }
    data = { file, name: file.name, size: file.size };
    info!.textContent = `📄 ${file.name} — ${fmtSize(file.size)}`;
    rail!.textContent = `📄 ${file.name}`;
    opts!.classList.remove("hidden");
    dropzone!.classList.add("hidden");
  }

  async function doWord2Pdf() {
    if (!data) {
      toast("No file loaded", "err");
      return;
    }
    if (!(await cloudConsent())) return;
    showSpin("Rendering PDF document…");
    const formData = new FormData();
    formData.append("word", data.file);
    try {
      const response = await fetch(`${API_BASE}/api/word2pdf`, { method: "POST", body: formData });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: response.statusText }));
        toast("Conversion Failed: " + errData.error, "err");
        hideSpin();
        return;
      }
      const blob = await response.blob();
      download(blob, data.name.replace(/\.docx?$/i, "_doctech.pdf"));
      toast("✓ Word converted to PDF successfully!", "ok");
    } catch (netErr) {
      console.error(netErr);
      toast("Connection refused.", "err");
    }
    hideSpin();
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
  btn.addEventListener("click", doWord2Pdf);
}
