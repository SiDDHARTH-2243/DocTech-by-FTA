// Merge PDF — client-side (local engine). Ported from the legacy
// `TOOL_VIEWS['merge']` logic, now using the npm `pdf-lib` import and a fresh DOM.
import { PDFDocument } from "pdf-lib";
import { loadPdfJs, renderPageToContainer, readBytes } from "../lib/pdf";

const PDF_TYPE = "application/pdf";

const fileInput = document.getElementById("merge-input") as HTMLInputElement | null;
const dropZone = document.getElementById("merge-dropzone");
const listEl = document.getElementById("merge-list");
const emptyEl = document.getElementById("merge-empty");
const countEl = document.getElementById("merge-count");
const statusEl = document.getElementById("merge-status");
const mergeBtn = document.getElementById("merge-btn") as HTMLButtonElement | null;
const addMoreEl = document.getElementById("merge-addmore");
const sizeEl = document.getElementById("merge-size");
const nextEl = document.getElementById("merge-next");
const overlayEl = document.getElementById("merge-overlay");

// Bail quietly if the page markup isn't present (defensive).
if (fileInput && dropZone && listEl && countEl && mergeBtn) {
  let files: File[] = [];
  let dragIndex: number | null = null;
  // Page-1 thumbnail cache (data-URL, keyed by File) + a stable id per file so
  // async renders can find their row after reorders/removes.
  const thumbs = new Map<File, string>();
  const fid = new WeakMap<File, number>();
  let fidSeq = 0;

  const isPDF = (f: File) =>
    f.type === PDF_TYPE || f.name.toLowerCase().endsWith(".pdf");

  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const setStatus = (msg: string, kind: "info" | "ok" | "err" = "info") => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className =
      "mt-3 text-sm " +
      (kind === "err"
        ? "text-red-600 dark:text-red-400"
        : kind === "ok"
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-slate-500 dark:text-slate-400");
  };

  function addFiles(incoming: File[]) {
    let skipped = 0;
    for (const f of incoming) {
      if (isPDF(f)) {
        if (!fid.has(f)) fid.set(f, ++fidSeq);
        files.push(f);
      } else skipped++;
    }
    if (skipped) setStatus(`Skipped ${skipped} non-PDF file(s).`, "err");
    else setStatus("");
    render();
    if (fileInput) fileInput.value = "";
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= files.length) return;
    const [item] = files.splice(from, 1);
    files.splice(to, 0, item);
    render();
  }

  function remove(i: number) {
    files.splice(i, 1);
    render();
  }

  function render() {
    countEl.textContent = String(files.length);
    const hasFiles = files.length > 0;
    if (emptyEl) emptyEl.classList.toggle("hidden", hasFiles);
    // Collapse the big dropzone once files exist; offer the compact "+ Add more".
    dropZone!.classList.toggle("hidden", hasFiles);
    if (addMoreEl) {
      addMoreEl.classList.toggle("hidden", !hasFiles);
      addMoreEl.classList.toggle("flex", hasFiles);
    }
    if (sizeEl) sizeEl.textContent = fmtSize(files.reduce((n, f) => n + f.size, 0));
    mergeBtn.disabled = files.length < 2;

    listEl.innerHTML = "";
    files.forEach((f, i) => {
      const row = document.createElement("li");
      row.draggable = true;
      row.dataset.index = String(i);
      row.className =
        "flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800";
      const id = fid.get(f);
      const cached = thumbs.get(f);
      const thumbInner = cached
        ? `<img src="${cached}" alt="" class="h-full w-full object-contain" />`
        : `<span class="text-sm text-slate-400">📄</span>`;
      row.innerHTML = `
        <span class="cursor-grab select-none text-slate-400" title="Drag to reorder">⠿</span>
        <span class="merge-thumb grid h-16 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800" data-fid="${id}">${thumbInner}</span>
        <span class="min-w-0 flex-1 truncate text-sm font-medium" title="${f.name}">${f.name}</span>
        <span class="shrink-0 text-xs text-slate-400">${fmtSize(f.size)}</span>
        <div class="flex shrink-0 items-center gap-1">
          <button type="button" data-act="up" aria-label="Move up" class="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-700">↑</button>
          <button type="button" data-act="down" aria-label="Move down" class="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-700">↓</button>
          <button type="button" data-act="remove" aria-label="Remove" class="rounded px-1.5 py-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">✕</button>
        </div>`;

      (row.querySelector('[data-act="up"]') as HTMLButtonElement).disabled = i === 0;
      (row.querySelector('[data-act="down"]') as HTMLButtonElement).disabled =
        i === files.length - 1;

      row.querySelector('[data-act="up"]')?.addEventListener("click", () => move(i, i - 1));
      row.querySelector('[data-act="down"]')?.addEventListener("click", () => move(i, i + 1));
      row.querySelector('[data-act="remove"]')?.addEventListener("click", () => remove(i));

      row.addEventListener("dragstart", () => (dragIndex = i));
      row.addEventListener("dragover", (e) => e.preventDefault());
      row.addEventListener("drop", (e) => {
        e.preventDefault();
        if (dragIndex !== null && dragIndex !== i) move(dragIndex, i);
        dragIndex = null;
      });

      listEl.appendChild(row);
    });

    ensureThumbs();
  }

  // Render page-1 thumbnails for any files not yet cached (same pdf.js path as
  // Split PDF), cache the result as a data-URL so reorders/removes don't re-render.
  async function ensureThumbs() {
    for (const f of files) {
      if (thumbs.has(f)) continue;
      const slot = listEl!.querySelector(`.merge-thumb[data-fid="${fid.get(f)}"]`) as HTMLElement | null;
      if (!slot) continue;
      try {
        const pdf = await loadPdfJs(await readBytes(f));
        await renderPageToContainer(pdf, 1, slot);
        const canvas = slot.querySelector("canvas");
        if (canvas) thumbs.set(f, canvas.toDataURL("image/png"));
        void pdf.destroy(); // free the document (shared worker stays alive)
      } catch {
        /* leave the placeholder */
      }
    }
  }

  async function doMerge() {
    if (files.length < 2) {
      setStatus("Add at least 2 PDFs to merge.", "err");
      return;
    }
    mergeBtn.disabled = true;
    setStatus("Merging PDFs locally…");
    try {
      const out = await PDFDocument.create();
      for (const f of files) {
        const bytes = await f.arrayBuffer();
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const merged = await out.save();
      downloadBytes(merged, "merged_doctech.pdf");
      setStatus(`✓ Merged ${files.length} files successfully.`, "ok");
      nextEl?.classList.remove("hidden");
    } catch (err) {
      setStatus(`Merge failed: ${(err as Error).message}`, "err");
    } finally {
      mergeBtn.disabled = files.length < 2;
    }
  }

  function downloadBytes(bytes: Uint8Array, filename: string) {
    const blob = new Blob([bytes], { type: PDF_TYPE });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Wire inputs.
  fileInput.addEventListener("change", (e) =>
    addFiles([...((e.target as HTMLInputElement).files ?? [])]),
  );
  mergeBtn.addEventListener("click", doMerge);

  // Drag-and-drop onto the zone.
  ["dragenter", "dragover"].forEach((ev) =>
    dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropZone.classList.add("border-orange-400", "bg-orange-50", "dark:bg-orange-500/10");
    }),
  );
  ["dragleave", "drop"].forEach((ev) =>
    dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropZone.classList.remove("border-orange-400", "bg-orange-50", "dark:bg-orange-500/10");
    }),
  );
  dropZone.addEventListener("drop", (e) => {
    const dropped = (e as DragEvent).dataTransfer?.files;
    if (dropped?.length) addFiles([...dropped]);
  });

  // Drop PDFs anywhere on the page (handy once the dropzone is collapsed).
  const dragHasFiles = (e: DragEvent) => [...(e.dataTransfer?.types ?? [])].includes("Files");
  let dragDepth = 0;
  window.addEventListener("dragenter", (e) => {
    if (!dragHasFiles(e as DragEvent)) return;
    dragDepth++;
    overlayEl?.classList.remove("hidden");
    overlayEl?.classList.add("flex");
  });
  window.addEventListener("dragleave", (e) => {
    if (!dragHasFiles(e as DragEvent)) return;
    if (--dragDepth <= 0) {
      dragDepth = 0;
      overlayEl?.classList.add("hidden");
      overlayEl?.classList.remove("flex");
    }
  });
  window.addEventListener("dragover", (e) => {
    if (dragHasFiles(e as DragEvent)) e.preventDefault();
  });
  window.addEventListener("drop", (e) => {
    dragDepth = 0;
    overlayEl?.classList.add("hidden");
    overlayEl?.classList.remove("flex");
    const de = e as DragEvent;
    if (!dragHasFiles(de)) return;
    e.preventDefault();
    const dropped = de.dataTransfer?.files;
    if (dropped?.length) addFiles([...dropped]);
  });

  render();
}
