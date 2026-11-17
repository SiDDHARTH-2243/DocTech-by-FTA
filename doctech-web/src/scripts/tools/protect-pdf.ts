// Protect PDF — cloud. Ported from legacy TOOL_VIEWS['protect'] / loadProtect / doProtect.
import { API_BASE, isPDF, fmtSize, readBytes, download, loadPdfJs, renderPageToContainer } from "../lib/pdf";
import { toast, showSpin, hideSpin, cloudConsent, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("pr-dropzone");
const input = document.getElementById("pr-input") as HTMLInputElement | null;
const opts = document.getElementById("pr-opts");
const info = document.getElementById("pr-info");
const preview = document.getElementById("pr-preview");
const pwd = document.getElementById("pr-pwd") as HTMLInputElement | null;
const pwd2 = document.getElementById("pr-pwd2") as HTMLInputElement | null;
const btn = document.getElementById("pr-btn");
const rail = document.getElementById("pr-rail");

if (dropzone && input && opts && info && preview && pwd && pwd2 && btn && rail) {
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

  async function doProtect() {
    if (!data) {
      toast("No file loaded", "err");
      return;
    }
    const p1 = pwd!.value || "";
    const p2 = pwd2!.value || "";
    if (!p1) return toast("Enter a password", "err");
    if (p1.length < 4) return toast("Password must be at least 4 characters", "err");
    if (p1 !== p2) return toast("Passwords do not match", "err");

    if (!(await cloudConsent())) return;
    showSpin("Locking PDF with AES-256…");
    const formData = new FormData();
    formData.append("pdf", data.file);
    formData.append("password", p1);
    try {
      const response = await fetch(`${API_BASE}/api/protect`, { method: "POST", body: formData });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: response.statusText }));
        toast("Server Execution Failed: " + errData.error, "err");
        hideSpin();
        return;
      }
      const blob = await response.blob();
      download(blob, data.name.replace(/\.pdf$/i, "_locked_doctech.pdf"));
      toast("✓ PDF locked successfully!", "ok");
    } catch (netErr) {
      console.error(netErr);
      toast("Connection refused. Is the Node server running?", "err");
    }
    hideSpin();
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
  btn.addEventListener("click", doProtect);
}
