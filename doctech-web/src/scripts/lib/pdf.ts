// Shared PDF helpers for all tools. Wraps pdf-lib + pdf.js (worker configured once)
// and carries over the exact helper logic from the legacy script.js.
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export { PDFDocument, degrees, rgb, StandardFonts, pdfjsLib };

/** Backend base URL for cloud tools (Express server). */
export const API_BASE =
  (import.meta.env.PUBLIC_API_BASE as string | undefined) || "http://localhost:3000";

export const isPDF = (f: File): boolean =>
  f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");

export function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function readBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/** Trigger a browser download for raw bytes or a Blob. */
export function download(data: Blob | Uint8Array, name: string, type = "application/pdf"): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 300);
}

/** Parse a page-range string like "1-3, 5, 8-10" into a sorted page-number array. */
export function parseRange(s: string, max: number): number[] {
  const pages = new Set<number>();
  const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
  for (const p of parts) {
    if (p.includes("-")) {
      const [a, b] = p.split("-").map(Number);
      if (isNaN(a) || isNaN(b)) throw new Error(`Invalid: "${p}"`);
      if (a < 1 || b > max || a > b) throw new Error(`"${p}" out of range (1–${max})`);
      for (let i = a; i <= b; i++) pages.add(i);
    } else {
      const n = Number(p);
      if (isNaN(n) || n < 1 || n > max) throw new Error(`Page ${p} out of range (1–${max})`);
      pages.add(n);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

/** One shared pdf.js worker reused for every document — lets tools render many
 *  PDFs in a row without spawning (and leaking) a worker per file. */
let sharedWorker: InstanceType<typeof pdfjsLib.PDFWorker> | null = null;

/** Load a pdf.js document from bytes (copy buffer so pdf-lib can reuse the original). */
export async function loadPdfJs(bytes: Uint8Array) {
  if (!sharedWorker) sharedWorker = new pdfjsLib.PDFWorker();
  return pdfjsLib.getDocument({ data: bytes.slice(), worker: sharedWorker }).promise;
}

/** Render a pdf.js page to fit inside a container element. */
export async function renderPageToContainer(
  pdf: Awaited<ReturnType<typeof loadPdfJs>>,
  pageNumber: number,
  container: HTMLElement,
): Promise<void> {
  try {
    const page = await pdf.getPage(pageNumber);
    const base = page.getViewport({ scale: 1 });
    const rect = container.getBoundingClientRect();
    const w = rect.width || 150;
    const h = rect.height || 200;
    const scale = Math.min(w / base.width, h / base.height) || 1;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.className = "max-h-full max-w-full object-contain";
    const ctx = canvas.getContext("2d")!;
    container.innerHTML = "";
    container.appendChild(canvas);
    await page.render({ canvasContext: ctx, viewport }).promise;
  } catch {
    container.innerHTML = '<span class="text-xs text-red-500">Preview failed</span>';
  }
}
