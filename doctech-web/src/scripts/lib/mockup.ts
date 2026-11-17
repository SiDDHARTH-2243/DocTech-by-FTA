// Shared canvas helpers for the Social Media mockup generators (chat / tweet /
// post). Renders at 2× then the page CSS-downscales. Framework-free.
import { roundRect, wrapText, drawCircleImage } from "./canvasText";

export const SANS = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
export interface Msg { side: "in" | "out"; text: string }

/** Circular avatar — uploaded image, else an initial on a coloured disc. */
export function avatar(ctx: CanvasRenderingContext2D, cx: number, cy: number, d: number, opts: { img?: HTMLImageElement | null; name?: string; bg?: string }): void {
  if (opts.img) { drawCircleImage(ctx, opts.img, cx, cy, d); return; }
  ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
  ctx.fillStyle = opts.bg || "#94a3b8"; ctx.fill();
  ctx.save();
  ctx.fillStyle = "#fff"; ctx.font = `bold ${Math.round(d * 0.42)}px ${SANS}`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(((opts.name || "?").trim()[0] || "?").toUpperCase(), cx, cy + 1);
  ctx.restore();
}

/** Blue verified check badge centred at (x,y) with radius r. */
export function verifiedBadge(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color = "#1d9bf0"): void {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = Math.max(1, r * 0.24); ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y + r * 0.02);
  ctx.lineTo(x - r * 0.08, y + r * 0.38);
  ctx.lineTo(x + r * 0.5, y - r * 0.4);
  ctx.stroke();
}

export interface ChatTheme {
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  outBubble: string; outText: string;
  inBubble: string; inText: string;
  radius: number; fontSize: number;
}

/** Lay out chat bubbles for a 1:1 conversation and paint header/footer. */
export function renderChat(
  canvas: HTMLCanvasElement,
  opts: { messages: Msg[]; theme: ChatTheme; width: number; headerH: number; footerH?: number; drawHeader: (ctx: CanvasRenderingContext2D, w: number) => void; drawFooter?: (ctx: CanvasRenderingContext2D, w: number, y: number) => void },
): void {
  const S = 2;
  const { messages, theme, width: W, headerH } = opts;
  const font = `${theme.fontSize}px ${SANS}`;
  const padX = 14, padY = 9, gap = 7, edge = 14;
  const maxBubble = Math.round(W * 0.74);
  const lineH = Math.round(theme.fontSize * 1.32);

  const scratch = document.createElement("canvas").getContext("2d")!;
  scratch.font = font;
  const items = messages.map((m) => {
    const lines = wrapText(scratch, m.text || " ", maxBubble - padX * 2);
    const tw = Math.max(30, ...lines.map((l) => scratch.measureText(l).width));
    return { m, lines, bw: Math.min(maxBubble, Math.ceil(tw) + padX * 2), bh: lines.length * lineH + padY * 2 };
  });

  const bodyTop = headerH + 12;
  const footerH = opts.footerH || 0;
  const H = bodyTop + items.reduce((a, it) => a + it.bh + gap, 0) + 12 + footerH;

  canvas.width = W * S; canvas.height = H * S;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(S, 0, 0, S, 0, 0);
  theme.paint(ctx, W, H);
  opts.drawHeader(ctx, W);

  let y = bodyTop;
  for (const it of items) {
    const out = it.m.side === "out";
    const x = out ? W - edge - it.bw : edge;
    roundRect(ctx, x, y, it.bw, it.bh, theme.radius);
    ctx.fillStyle = out ? theme.outBubble : theme.inBubble;
    ctx.fill();
    ctx.fillStyle = out ? theme.outText : theme.inText;
    ctx.font = font; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    let ty = y + padY + theme.fontSize * 0.86;
    for (const line of it.lines) { ctx.fillText(line, x + padX, ty); ty += lineH; }
    y += it.bh + gap;
  }
  if (opts.drawFooter) opts.drawFooter(ctx, W, H - footerH);
}

/** Format a likes/stat count (1234 → "1,234"). */
export function commas(n: number): string {
  return n.toLocaleString("en-US");
}
