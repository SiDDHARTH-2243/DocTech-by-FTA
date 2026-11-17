// Add Page Numbers — cloud. Ported from legacy TOOL_VIEWS['page-numbers'] / loadPn / doAddNumbers.
import { API_BASE, isPDF, download } from "../lib/pdf";
import { toast, showSpin, hideSpin, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("pn-dropzone");
const input = document.getElementById("pn-input") as HTMLInputElement | null;
const opts = document.getElementById("pn-opts");
const info = document.getElementById("pn-info");
const position = document.getElementById("pn-position") as HTMLSelectElement | null;
const btn = document.getElementById("pn-btn");
const rail = document.getElementById("pn-rail");

if (dropzone && input && opts && info && position && btn && rail) {
  let data: { file: File; name: string } | null = null;

  function load(file: File) {
    if (!file || !isPDF(file)) {
      toast("Not a PDF", "err");
      return;
    }
    data = { file, name: file.name };
    info!.textContent = `📄 ${file.name}`;
    rail!.textContent = `📄 ${file.name}`;
    opts!.classList.remove("hidden");
    dropzone!.classList.add("hidden");
  }

  async function doAddNumbers() {
    if (!data) {
      toast("No file loaded", "err");
      return;
    }
    const formData = new FormData();
    formData.append("pdf", data.file);
    formData.append("position", position!.value);
    showSpin("Adding page numbers…");
    try {
      const res = await fetch(`${API_BASE}/api/add-page-numbers`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Server error: " + res.statusText);
      const blob = await res.blob();
      download(blob, data.name.replace(/\.pdf$/i, "_numbered.pdf"));
      toast("✓ Page numbers added!", "ok");
    } catch (err) {
      toast("Error: " + (err as Error).message, "err");
    } finally {
      hideSpin();
    }
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
  btn.addEventListener("click", doAddNumbers);
}
