// Scanned PDF Converter — client-side. Renders each page, applies a paper/scan
// look (tint, grain, slight skew, contrast), then re-embeds as JPEG via pdf-lib.
import { PDFDocument, isPDF, fmtSize, readBytes, download, loadPdfJs, renderPageToContainer } from "../lib/pdf";
import { toast, showSpin, setSpinText, hideSpin, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("scan-dropzone");
const input = document.getElementById("scan-input") as HTMLInputElement | null;
const opts = document.getElementById("scan-opts");
const info = document.getElementById("scan-info");
const preview = document.getElementById("scan-preview");
const intensityEl = document.getElementById("scan-intensity") as HTMLSelectElement | null;
const grayEl = document.getElementById("scan-gray") as HTMLInputElement | null;
const scaleEl = document.getElementById("scan-scale") as HTMLSelectElement | null;
const btn = document.getElementById("scan-btn");
const count = document.getElementById("scan-count");

if (dropzone && input && opts && info && preview && intensityEl && grayEl && scaleEl && btn && count) {
  let data: { bytes: Uint8Array; name: string; size: number } | null = null;

  // Deterministic-ish PRNG so each run looks consistent per page.
  function mulberry32(a: number) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const PRESETS: Record<string, { noise: number; skew: number; contrast: number; tint: number }> = {
    light: { noise: 10, skew: 0.4, contrast: 1.06, tint: 0.05 },
    medium: { noise: 20, skew: 0.9, contrast: 1.12, tint: 0.09 },
    heavy: { noise: 34, skew: 1.6, contrast: 1.2, tint: 0.14 },
  };

  async function load(file: File) {
    if (!file || !isPDF(file)) { toast("Not a PDF", "err"); return; }
    const bytes = await readBytes(file);
    data = { bytes, name: file.name, size: file.size };
    let pdf;
    try { pdf = await loadPdfJs(bytes); }
    catch (e) { toast("Could not read PDF: " + (e as Error).message, "err"); return; }
    const n = pdf.numPages;
    info!.textContent = `📄 ${file.name} — ${fmtSize(file.size)} — ${n} page${n !== 1 ? "s" : ""}`;
    count!.textContent = String(n);
    opts!.classList.remove("hidden");
    dropzone!.classList.add("hidden");
    await renderPageToContainer(pdf, 1, preview!);
  }

  // Apply the scanned look to an already-rendered page canvas, returning a new canvas.
  function scanify(src: HTMLCanvasElement, seed: number): HTMLCanvasElement {
    const p = PRESETS[intensityEl!.value] || PRESETS.medium;
    const gray = grayEl!.checked;
    const rng = mulberry32(seed);
    const angle = ((rng() - 0.5) * 2 * p.skew * Math.PI) / 180;

    const out = document.createElement("canvas");
    out.width = src.width; out.height = src.height;
    const ctx = out.getContext("2d")!;
    // Paper background shows through at the rotated corners.
    ctx.fillStyle = "#f7f4ec";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.save();
    ctx.translate(out.width / 2, out.height / 2);
    ctx.rotate(angle);
    ctx.drawImage(src, -src.width / 2, -src.height / 2);
    ctx.restore();

    const img = ctx.getImageData(0, 0, out.width, out.height);
    const d = img.data;
    // Warm paper tint target.
    const tr = 247, tg = 244, tb = 236;
    const t = p.tint, c = p.contrast;
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i + 1], b = d[i + 2];
      if (gray) { const l = 0.299 * r + 0.587 * g + 0.114 * b; r = g = b = l; }
      // contrast around mid-grey
      r = (r - 128) * c + 128; g = (g - 128) * c + 128; b = (b - 128) * c + 128;
      // blend toward paper tint
      r = r * (1 - t) + tr * t; g = g * (1 - t) + tg * t; b = b * (1 - t) + tb * t;
      // grain
      const nz = (rng() - 0.5) * p.noise;
      d[i] = Math.max(0, Math.min(255, r + nz));
      d[i + 1] = Math.max(0, Math.min(255, g + nz));
      d[i + 2] = Math.max(0, Math.min(255, b + nz));
    }
    ctx.putImageData(img, 0, 0);
    return out;
  }

  async function run() {
    if (!data) { toast("No file loaded", "err"); return; }
    const scale = parseFloat(scaleEl!.value || "2");
    const baseName = data.name.replace(/\.pdf$/i, "");
    showSpin("Scanning pages…");
    try {
      const pdf = await loadPdfJs(data.bytes);
      const numPages = pdf.numPages;
      const outDoc = await PDFDocument.create();

      for (let i = 1; i <= numPages; i++) {
        setSpinText(`Scanning page ${i} of ${numPages}…`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        const scanned = scanify(canvas, i * 2654435761);
        const jpegUrl = scanned.toDataURL("image/jpeg", 0.85);
        const jpeg = await outDoc.embedJpg(jpegUrl);
        // Original page size in PDF points (scale-independent).
        const base = page.getViewport({ scale: 1 });
        const pg = outDoc.addPage([base.width, base.height]);
        pg.drawImage(jpeg, { x: 0, y: 0, width: base.width, height: base.height });
      }

      const bytes = await outDoc.save();
      download(bytes, `${baseName}_scanned_doctech.pdf`);
      toast(`✓ Scanned ${numPages} page${numPages !== 1 ? "s" : ""}!`, "ok");
    } catch (e) {
      toast("Failed: " + (e as Error).message, "err");
    }
    hideSpin();
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
  btn.addEventListener("click", run);
}
