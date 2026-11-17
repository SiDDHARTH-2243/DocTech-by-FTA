// Shared canvas text + shape helpers for the Social Media generators
// (Tweet → Image now; chat/post mockups in Batch 2). Framework-free.

/** Word-wrap `text` to fit `maxW`, honouring explicit "\n" and breaking
 *  over-long words character-by-character. Mirrors text-to-handwriting.ts. */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    if (para === "") { lines.push(""); continue; }
    let line = "";
    for (const word of para.split(/\s+/)) {
      if (word === "") continue;
      const candidate = line ? line + " " + word : word;
      if (ctx.measureText(candidate).width <= maxW) { line = candidate; continue; }
      if (line) { lines.push(line); line = ""; }
      if (ctx.measureText(word).width <= maxW) {
        line = word;
      } else {
        let chunk = "";
        for (const ch of word) {
          if (ctx.measureText(chunk + ch).width <= maxW) chunk += ch;
          else { lines.push(chunk); chunk = ch; }
        }
        line = chunk;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Path a rounded rectangle (does not fill/stroke — caller does). */
export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Draw an image clipped to a circle at (cx,cy) with diameter d. */
export function drawCircleImage(ctx: CanvasRenderingContext2D, img: CanvasImageSource, cx: number, cy: number, d: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, cx - d / 2, cy - d / 2, d, d);
  ctx.restore();
}

/** Load a web font (best-effort, never blocks longer than `ms`). */
export function fontReady(spec: string, ms = 1500): Promise<void> {
  const load = (async () => { try { await document.fonts.load(spec); } catch { /* fallback */ } })();
  return Promise.race([load, new Promise<void>((res) => setTimeout(res, ms))]);
}
