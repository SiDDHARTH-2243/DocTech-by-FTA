// Delete Pages — client-side. Ported from legacy TOOL_VIEWS['delete'] / loadDel / doDelete.
import { PDFDocument, isPDF, readBytes, download, loadPdfJs, renderPageToContainer } from "../lib/pdf";
import { toast, showSpin, hideSpin, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("delete-dropzone");
const input = document.getElementById("delete-input") as HTMLInputElement | null;
const opts = document.getElementById("delete-opts");
const info = document.getElementById("delete-info");
const grid = document.getElementById("delete-grid");
const btn = document.getElementById("delete-btn") as HTMLButtonElement | null;
const count = document.getElementById("delete-count");
const selectedCount = document.getElementById("delete-selected");

if (dropzone && input && opts && info && grid && btn && count && selectedCount) {
  let data: { bytes: Uint8Array; name: string } | null = null;
  const selected = new Set<number>();

  function refreshSelectedUi() {
    selectedCount!.textContent = String(selected.size);
    btn!.disabled = selected.size === 0;
  }

  async function load(file: File) {
    if (!file || !isPDF(file)) {
      toast("Not a PDF", "err");
      return;
    }
    const bytes = await readBytes(file);
    data = { bytes, name: file.name };
    selected.clear();

    const pdf = await loadPdfJs(bytes);
    const total = pdf.numPages;
    info!.textContent = `📄 ${file.name} — Select pages to remove`;
    count!.textContent = String(total);
    refreshSelectedUi();
    opts!.classList.remove("hidden");
    dropzone!.classList.add("hidden");
    grid!.innerHTML = "";

    for (let i = 1; i <= total; i++) {
      const card = document.createElement("div");
      card.className =
        "group relative cursor-pointer rounded-lg border-2 border-slate-200 p-1 transition-all dark:border-slate-700";
      card.innerHTML = `
        <div class="thumb flex h-[180px] w-[130px] items-center justify-center overflow-hidden rounded bg-white dark:bg-slate-800"></div>
        <div class="mt-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Page ${i}</div>
        <div class="del-flag pointer-events-none absolute inset-0 hidden items-center justify-center rounded-lg bg-red-500/30 text-2xl">🗑️</div>`;
      const page = i;
      card.addEventListener("click", () => {
        const flag = card.querySelector(".del-flag") as HTMLElement;
        if (selected.has(page)) {
          selected.delete(page);
          card.classList.remove("border-red-500", "opacity-60");
          flag.classList.add("hidden");
          flag.classList.remove("flex");
        } else {
          selected.add(page);
          card.classList.add("border-red-500", "opacity-60");
          flag.classList.remove("hidden");
          flag.classList.add("flex");
        }
        refreshSelectedUi();
      });
      grid!.appendChild(card);
      const thumb = card.querySelector(".thumb") as HTMLElement;
      renderPageToContainer(pdf, i, thumb);
    }
  }

  async function doDelete() {
    if (!data) {
      toast("No file", "err");
      return;
    }
    if (selected.size === 0) {
      toast("No pages selected to delete", "info");
      return;
    }
    showSpin("Removing pages…");
    try {
      const src = await PDFDocument.load(data.bytes, { ignoreEncryption: true });
      const total = src.getPageCount();
      const keep = [...Array(total).keys()].filter((i) => !selected.has(i + 1));
      if (!keep.length) {
        toast("Cannot delete all pages", "err");
        hideSpin();
        return;
      }
      const out = await PDFDocument.create();
      const cp = await out.copyPages(src, keep);
      cp.forEach((p) => out.addPage(p));
      download(await out.save(), data.name.replace(/\.pdf$/i, "_trimmed_doctech.pdf"));
      toast(`✓ Deleted ${selected.size} page(s)!`, "ok");
    } catch (e) {
      toast("Failed: " + (e as Error).message, "err");
    }
    hideSpin();
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
  btn.addEventListener("click", doDelete);
}
