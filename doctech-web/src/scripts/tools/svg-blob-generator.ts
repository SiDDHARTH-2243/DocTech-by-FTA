// SVG Blob Generator — client-side. Random organic blob via Catmull-Rom spline.
import { downloadBlob } from "../lib/image";
import { copyText } from "../lib/ui";

const SIZE = 200;
const preview = document.getElementById("blob-preview");
const pointsEl = document.getElementById("blob-points") as HTMLInputElement | null;
const randEl = document.getElementById("blob-rand") as HTMLInputElement | null;
const colorEl = document.getElementById("blob-color") as HTMLInputElement | null;
const svgEl = document.getElementById("blob-svg");

if (preview && pointsEl && randEl && colorEl && svgEl) {
  let seed = Math.floor(Math.random() * 1e9);

  function mulberry32(a: number) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const f = (n: number) => Math.round(n * 10) / 10;

  function blobPath(): string {
    const n = parseInt(pointsEl!.value);
    const contrast = parseInt(randEl!.value) / 100;
    const rng = mulberry32(seed);
    const cx = SIZE / 2, cy = SIZE / 2, base = SIZE * 0.4;
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = base * (1 - contrast + rng() * contrast * 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    let d = `M ${f(pts[0][0])} ${f(pts[0][1])} `;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += `C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])} `;
    }
    return d + "Z";
  }

  function svgMarkup(): string {
    return `<svg viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">\n  <path fill="${colorEl!.value}" d="${blobPath()}" />\n</svg>`;
  }

  function render() {
    document.getElementById("blob-points-val")!.textContent = pointsEl!.value;
    document.getElementById("blob-rand-val")!.textContent = randEl!.value;
    document.getElementById("blob-color-hex")!.textContent = colorEl!.value;
    const markup = svgMarkup();
    preview!.innerHTML = markup.replace("<svg ", '<svg class="h-auto max-h-[260px] w-full max-w-[260px]" ');
    svgEl!.textContent = markup;
  }

  [pointsEl, randEl, colorEl].forEach((el) => el.addEventListener("input", render));
  document.getElementById("blob-shuffle")!.addEventListener("click", () => { seed = Math.floor(Math.random() * 1e9); render(); });
  document.getElementById("blob-copy")!.addEventListener("click", () => copyText(svgEl!.textContent || ""));
  document.getElementById("blob-download")!.addEventListener("click", () => downloadBlob(new Blob([svgEl!.textContent || ""], { type: "image/svg+xml" }), "blob.svg"));
  render();
}
