// Shared, framework-free helpers for the Image Tools category.
// Canvas-based, fully client-side — deliberately NOT importing pdf.ts (which
// would bundle pdf-lib/pdfjs into every image page).

export const IMG_TYPES = ["image/png", "image/jpeg", "image/webp", "image/bmp", "image/gif", "image/avif"];
export const IMG_ACCEPT = "image/png,image/jpeg,image/webp,image/bmp,image/gif,image/avif";

/** Backend base URL for cloud tools (mirrors lib/pdf.ts; here so image/social
 *  pages don't import pdf.ts and bundle pdf-lib/pdfjs). */
export const API_BASE =
  (import.meta.env.PUBLIC_API_BASE as string | undefined) ||
  (import.meta.env.PROD ? "https://doctech-server.onrender.com" : "http://localhost:3000");

/** Human-readable byte size. */
export function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Load a File into a fully-decoded HTMLImageElement. */
export function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image failed to load"));
    };
    img.src = url;
  });
}

/** Promise wrapper around canvas.toBlob. */
export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
      type,
      quality,
    );
  });
}

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob: Blob, name: string): void {
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

/** Swap a filename's extension (e.g. "photo.png" → "photo.webp"). */
export function renameExt(name: string, ext: string): string {
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  return `${stem}.${ext.replace(/^\./, "")}`;
}

/** File extension for a canvas mime type. */
export function extForType(type: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  return "png";
}

/** Average color of an image (fast: paint to a 1×1 canvas). */
export function getAverageColor(img: HTMLImageElement): { r: number; g: number; b: number } {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return { r, g, b };
}

/** Extract up to `n` dominant colors by bucketing a downscaled copy. */
export function extractPalette(img: HTMLImageElement, n = 8): { r: number; g: number; b: number; count: number }[] {
  const w = 96, h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * 96));
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const buckets = new Map<number, { r: number; g: number; b: number; count: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) continue; // skip transparent
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4); // 4 bits/channel
    const bk = buckets.get(key);
    if (bk) { bk.r += r; bk.g += g; bk.b += b; bk.count++; }
    else buckets.set(key, { r, g, b, count: 1 });
  }
  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
    .map((bk) => ({ r: Math.round(bk.r / bk.count), g: Math.round(bk.g / bk.count), b: Math.round(bk.b / bk.count), count: bk.count }));
}

/** Draw an image (optionally resized) onto a fresh canvas and return it. */
export function imageToCanvas(img: HTMLImageElement, w = img.naturalWidth, h = img.naturalHeight, fill?: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}
