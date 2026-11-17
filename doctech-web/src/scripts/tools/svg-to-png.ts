// SVG to PNG — client-side. Rasterizes SVG (file or pasted) at a chosen scale.
import { canvasToBlob, downloadBlob } from "../lib/image";
import { setupDropzone, toast } from "../lib/ui";

const drop = document.getElementById("svp-drop");
const input = document.getElementById("svp-input") as HTMLInputElement | null;
const paste = document.getElementById("svp-paste") as HTMLTextAreaElement | null;
const work = document.getElementById("svp-work");
const canvas = document.getElementById("svp-canvas") as HTMLCanvasElement | null;
const scaleEl = document.getElementById("svp-scale") as HTMLInputElement | null;
const downloadBtn = document.getElementById("svp-download") as HTMLButtonElement | null;

if (drop && input && paste && work && canvas && scaleEl && downloadBtn) {
  let svgText = "";
  let blob: Blob | null = null;
  let pasteTimer = 0;

  function intrinsicSize(img: HTMLImageElement, text: string): { w: number; h: number } {
    if (img.naturalWidth && img.naturalHeight) return { w: img.naturalWidth, h: img.naturalHeight };
    const vb = text.match(/viewBox\s*=\s*["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)/i);
    if (vb) return { w: parseFloat(vb[1]), h: parseFloat(vb[2]) };
    return { w: 512, h: 512 };
  }

  async function render() {
    if (!svgText.trim()) return;
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
    const img = new Image();
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); img.src = url; }).catch(() => {
      toast("Could not parse that SVG", "err");
    });
    if (!img.complete || !img.src) return;
    const { w, h } = intrinsicSize(img, svgText);
    const scale = parseFloat(scaleEl!.value);
    document.getElementById("svp-scale-val")!.textContent = scaleEl!.value;
    canvas!.width = Math.max(1, Math.round(w * scale));
    canvas!.height = Math.max(1, Math.round(h * scale));
    const ctx = canvas!.getContext("2d")!;
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    ctx.drawImage(img, 0, 0, canvas!.width, canvas!.height);
    blob = await canvasToBlob(canvas!, "image/png");
    document.getElementById("svp-dims")!.textContent = `${canvas!.width} × ${canvas!.height}`;
    work!.classList.remove("hidden");
    downloadBtn!.disabled = false;
  }

  function setSvg(text: string) { svgText = text; render(); }

  setupDropzone(drop, input, (files) => {
    const f = files[0];
    if (!f) return;
    if (!/svg/i.test(f.type) && !f.name.toLowerCase().endsWith(".svg")) { toast("Please choose an SVG file", "err"); return; }
    f.text().then((t) => { paste!.value = t; setSvg(t); });
  });
  paste.addEventListener("input", () => { clearTimeout(pasteTimer); pasteTimer = window.setTimeout(() => setSvg(paste!.value), 250); });
  scaleEl.addEventListener("input", render);
  downloadBtn.addEventListener("click", () => blob && downloadBlob(blob, "image.png"));
}
