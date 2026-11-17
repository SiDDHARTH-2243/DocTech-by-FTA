// Read Metadata — client-side. Ported from legacy TOOL_VIEWS['metadata'] / loadMeta.
import { PDFDocument, isPDF, fmtSize, readBytes } from "../lib/pdf";
import { toast, showSpin, hideSpin, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("meta-dropzone");
const input = document.getElementById("meta-input") as HTMLInputElement | null;
const result = document.getElementById("meta-result");

if (dropzone && input && result) {
  const esc = (v: unknown) =>
    String(v).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] || c);

  async function load(file: File) {
    if (!file || !isPDF(file)) {
      toast("Not a PDF", "err");
      return;
    }
    showSpin("Reading metadata…");
    try {
      const bytes = await readBytes(file);
      const d = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
      const rows: [string, unknown][] = [
        ["Title", d.getTitle() || "—"],
        ["Author", d.getAuthor() || "—"],
        ["Subject", d.getSubject() || "—"],
        ["Creator", d.getCreator() || "—"],
        ["Producer", d.getProducer() || "—"],
        ["Created", d.getCreationDate() ? d.getCreationDate()!.toLocaleString() : "—"],
        ["Modified", d.getModificationDate() ? d.getModificationDate()!.toLocaleString() : "—"],
        ["Pages", d.getPageCount()],
      ];
      result!.innerHTML = `
        <div class="mb-3 flex items-center justify-between gap-3">
          <div class="text-sm font-bold">📄 ${esc(file.name)} <span class="font-normal text-slate-400">· ${fmtSize(file.size)}</span></div>
          <button id="meta-reset" type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Upload Another</button>
        </div>
        <div class="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
          ${rows
            .map(
              ([k, v]) => `
            <div class="flex items-center justify-between gap-4 px-4 py-2.5 text-sm odd:bg-slate-50 dark:odd:bg-slate-800/50">
              <span class="font-semibold text-slate-500 dark:text-slate-400">${k}</span>
              <span class="truncate text-right">${esc(v)}</span>
            </div>`,
            )
            .join("")}
        </div>`;
      result!.classList.remove("hidden");
      dropzone!.classList.add("hidden");
      document.getElementById("meta-reset")?.addEventListener("click", () => {
        result!.classList.add("hidden");
        result!.innerHTML = "";
        dropzone!.classList.remove("hidden");
      });
      toast("✓ Metadata loaded", "ok");
    } catch (e) {
      toast("Failed: " + (e as Error).message, "err");
    }
    hideSpin();
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
}
