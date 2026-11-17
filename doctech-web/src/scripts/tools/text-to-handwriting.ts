// Text to Handwriting Converter — canvas render + pdf-lib export. Client-side.
import { PDFDocument, download } from "../lib/pdf";
import { toast, showSpin, hideSpin } from "../lib/ui";

const input = document.getElementById("hw-input") as HTMLTextAreaElement | null;
const fontSel = document.getElementById("hw-font") as HTMLSelectElement | null;
const paperSel = document.getElementById("hw-paper") as HTMLSelectElement | null;
const ink = document.getElementById("hw-ink") as HTMLInputElement | null;
const size = document.getElementById("hw-size") as HTMLInputElement | null;
const sizeVal = document.getElementById("hw-size-val");
const previewCanvas = document.getElementById("hw-canvas") as HTMLCanvasElement | null;
const downloadBtn = document.getElementById("hw-download");

if (input && fontSel && paperSel && ink && size && sizeVal && previewCanvas && downloadBtn) {
  const PAGE_W = 800;
  const PAGE_H = 1131; // ~A4 ratio
  const MARGIN = 60;
  const FAMILIES = ["Caveat", "Dancing Script", "Indie Flower", "Shadows Into Light", "Patrick Hand"];

  // Load the handwriting families from Google Fonts when online.
  if (navigator.onLine) {
    const families = FAMILIES.map((f) => `family=${f.replace(/ /g, "+")}`).join("&");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  }

  function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
    const lines: string[] = [];
    for (const para of text.split("\n")) {
      if (para === "") {
        lines.push("");
        continue;
      }
      let line = "";
      for (const word of para.split(/\s+/)) {
        if (word === "") continue;
        const candidate = line ? line + " " + word : word;
        if (ctx.measureText(candidate).width <= maxW) {
          line = candidate;
          continue;
        }
        // Candidate overflows. Flush the current line first.
        if (line) {
          lines.push(line);
          line = "";
        }
        // The word fits on a fresh line — place it.
        if (ctx.measureText(word).width <= maxW) {
          line = word;
        } else {
          // The word itself is wider than a line — break it character by character.
          let chunk = "";
          for (const ch of word) {
            if (ctx.measureText(chunk + ch).width <= maxW) {
              chunk += ch;
            } else {
              lines.push(chunk);
              chunk = ch;
            }
          }
          line = chunk;
        }
      }
      lines.push(line);
    }
    return lines;
  }

  function drawPaper(ctx: CanvasRenderingContext2D, paper: string, lineH: number) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
    if (paper === "ruled") {
      ctx.strokeStyle = "#cfe0f2";
      ctx.lineWidth = 1;
      for (let y = MARGIN + lineH; y < PAGE_H - MARGIN / 2; y += lineH) {
        ctx.beginPath();
        ctx.moveTo(MARGIN, y);
        ctx.lineTo(PAGE_W - MARGIN / 2, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "#f4b8b8";
      ctx.beginPath();
      ctx.moveTo(MARGIN, 0);
      ctx.lineTo(MARGIN, PAGE_H);
      ctx.stroke();
    } else if (paper === "grid") {
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      for (let x = 0; x <= PAGE_W; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, PAGE_H);
        ctx.stroke();
      }
      for (let y = 0; y <= PAGE_H; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(PAGE_W, y);
        ctx.stroke();
      }
    }
  }

  /** Render the text into one or more page canvases. */
  function renderPages(): HTMLCanvasElement[] {
    const fontSize = parseInt(size!.value);
    const lineH = Math.round(fontSize * 1.8);
    const family = fontSel!.value;
    const font = `${fontSize}px "${family}", cursive`;

    // Measure + wrap with a scratch context. Text starts at TEXT_X; keep it
    // inside the right ruled margin (PAGE_W - MARGIN/2).
    const TEXT_X = MARGIN + 8;
    const scratch = document.createElement("canvas").getContext("2d")!;
    scratch.font = font;
    const maxW = PAGE_W - TEXT_X - MARGIN / 2;
    const lines = wrapLines(scratch, input!.value, maxW);

    const linesPerPage = Math.floor((PAGE_H - 2 * MARGIN) / lineH);
    const pages: HTMLCanvasElement[] = [];
    for (let i = 0; i < Math.max(1, Math.ceil(lines.length / linesPerPage)); i++) {
      const canvas = document.createElement("canvas");
      canvas.width = PAGE_W;
      canvas.height = PAGE_H;
      const ctx = canvas.getContext("2d")!;
      drawPaper(ctx, paperSel!.value, lineH);
      ctx.font = font;
      ctx.fillStyle = ink!.value;
      ctx.textBaseline = "alphabetic";
      const slice = lines.slice(i * linesPerPage, (i + 1) * linesPerPage);
      let y = MARGIN + lineH;
      for (const line of slice) {
        ctx.fillText(line, TEXT_X, y - 6);
        y += lineH;
      }
      pages.push(canvas);
    }
    return pages;
  }

  /** Wait for a font, but never block longer than `ms` (font fetch may hang/be blocked). */
  function fontReady(ms = 1500): Promise<void> {
    const load = (async () => {
      try {
        await document.fonts.load(`${size!.value}px "${fontSel!.value}"`);
      } catch {
        /* fallback to cursive */
      }
    })();
    const timeout = new Promise<void>((res) => setTimeout(res, ms));
    return Promise.race([load, timeout]);
  }

  async function renderPreview() {
    sizeVal!.textContent = size!.value;
    await fontReady();
    const first = renderPages()[0];
    previewCanvas!.width = first.width;
    previewCanvas!.height = first.height;
    previewCanvas!.getContext("2d")!.drawImage(first, 0, 0);
  }

  async function downloadPdf() {
    showSpin("Building handwriting PDF…");
    try {
      await fontReady();
      const pages = renderPages();
      const pdf = await PDFDocument.create();
      for (const canvas of pages) {
        const png = await pdf.embedPng(canvas.toDataURL("image/png"));
        const page = pdf.addPage([canvas.width, canvas.height]);
        page.drawImage(png, { x: 0, y: 0, width: canvas.width, height: canvas.height });
      }
      download(await pdf.save(), "handwriting_doctech.pdf");
      toast(`✓ Exported ${pages.length} page(s) to PDF!`, "ok");
    } catch (e) {
      toast("Failed: " + (e as Error).message, "err");
    }
    hideSpin();
  }

  [input, fontSel, paperSel, ink, size].forEach((el) =>
    el.addEventListener("input", renderPreview),
  );
  fontSel.addEventListener("change", renderPreview);
  paperSel.addEventListener("change", renderPreview);
  downloadBtn.addEventListener("click", downloadPdf);

  renderPreview();
}
