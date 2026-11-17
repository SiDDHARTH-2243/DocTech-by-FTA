// Compress PDF — cloud. Ported from legacy TOOL_VIEWS['compress'] / loadCompress / doCompress.
// The legacy SVG result ring is replaced with an inline savings summary.
import { API_BASE, isPDF, fmtSize, readBytes, download, loadPdfJs, renderPageToContainer } from "../lib/pdf";
import { toast, showSpin, hideSpin, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("cmp-dropzone");
const input = document.getElementById("cmp-input") as HTMLInputElement | null;
const opts = document.getElementById("cmp-opts");
const info = document.getElementById("cmp-info");
const preview = document.getElementById("cmp-preview");
const level = document.getElementById("cmp-level") as HTMLSelectElement | null;
const btn = document.getElementById("cmp-btn");
const result = document.getElementById("cmp-result");
const rail = document.getElementById("cmp-rail");

if (dropzone && input && opts && info && preview && level && btn && result && rail) {
  let data: { file: File; name: string; size: number } | null = null;

  async function load(file: File) {
    if (!file || !isPDF(file)) {
      toast("Not a PDF", "err");
      return;
    }
    const bytes = await readBytes(file);
    data = { file, name: file.name, size: file.size };
    info!.textContent = `📄 ${file.name} — Original size: ${fmtSize(file.size)}`;
    rail!.textContent = `📦 ${fmtSize(file.size)} · ${file.name}`;
    opts!.classList.remove("hidden");
    dropzone!.classList.add("hidden");
    result!.classList.add("hidden");
    try {
      const pdf = await loadPdfJs(bytes);
      await renderPageToContainer(pdf, 1, preview!);
    } catch {
      /* preview optional */
    }
  }

  async function doCompress() {
    if (!data) {
      toast("No file loaded", "err");
      return;
    }
    const quality = level!.value;
    showSpin("Compressing PDF…");
    const formData = new FormData();
    formData.append("pdf", data.file);
    formData.append("quality", quality);
    try {
      const response = await fetch(`${API_BASE}/api/compress`, { method: "POST", body: formData });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: response.statusText }));
        toast("Compression Failed: " + errData.error, "err");
        hideSpin();
        return;
      }
      const blob = await response.blob();
      const originalSize = data.file.size;
      const compressedSize = blob.size;
      download(blob, data.name.replace(/\.pdf$/i, "_compressed_doctech.pdf"));

      const savedPct = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));
      toast(
        `✓ Compressed! Saved ${savedPct}% (${fmtSize(originalSize)} → ${fmtSize(compressedSize)})`,
        "ok",
      );
      result!.innerHTML = `
        <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">${savedPct === 0 ? "MAX" : savedPct + "%"}</div>
        <div class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">saved</div>
        <div class="mt-3 flex justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div><div class="font-bold text-slate-700 dark:text-slate-200">${fmtSize(originalSize)}</div>Original</div>
          <div><div class="font-bold text-emerald-600">${fmtSize(compressedSize)}</div>Compressed</div>
        </div>
        ${savedPct === 0 ? '<p class="mt-2 text-[11px] text-slate-400">File was already optimized. Original returned.</p>' : ""}`;
      result!.classList.remove("hidden");
    } catch (netErr) {
      console.error(netErr);
      toast("Connection refused. Is the Node server running on port 3000?", "err");
    }
    hideSpin();
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
  btn.addEventListener("click", doCompress);
}
