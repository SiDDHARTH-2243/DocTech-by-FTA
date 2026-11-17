// SVG Pattern Generator — client-side. Seamless tiling patterns as SVG.
import { downloadBlob } from "../lib/image";
import { copyText } from "../lib/ui";

interface P { fg: string; bg: string; s: number; sw: number }
const r1 = (n: number) => Math.round(n * 10) / 10;

const PATTERNS: { name: string; tile: (p: P) => string }[] = [
  { name: "Dots", tile: ({ fg, s }) => `<circle cx="${r1(s / 2)}" cy="${r1(s / 2)}" r="${r1(s * 0.13)}" fill="${fg}"/>` },
  { name: "Grid", tile: ({ fg, s, sw }) => `<path d="M ${s} 0 L 0 0 0 ${s}" fill="none" stroke="${fg}" stroke-width="${sw}"/>` },
  { name: "Diagonal", tile: ({ fg, s, sw }) => `<path d="M 0 ${s} L ${s} 0" stroke="${fg}" stroke-width="${sw}"/>` },
  { name: "Vertical", tile: ({ fg, s, sw }) => `<path d="M ${r1(s / 2)} 0 L ${r1(s / 2)} ${s}" stroke="${fg}" stroke-width="${sw}"/>` },
  { name: "Cross", tile: ({ fg, s, sw }) => `<path d="M ${r1(s / 2)} ${r1(s * 0.25)} V ${r1(s * 0.75)} M ${r1(s * 0.25)} ${r1(s / 2)} H ${r1(s * 0.75)}" stroke="${fg}" stroke-width="${sw}"/>` },
  { name: "Zigzag", tile: ({ fg, s, sw }) => `<path d="M 0 ${r1(s * 0.7)} L ${r1(s / 2)} ${r1(s * 0.3)} L ${s} ${r1(s * 0.7)}" fill="none" stroke="${fg}" stroke-width="${sw}"/>` },
  { name: "Triangles", tile: ({ fg, s }) => `<path d="M ${r1(s / 2)} ${r1(s * 0.2)} L ${r1(s * 0.8)} ${r1(s * 0.8)} L ${r1(s * 0.2)} ${r1(s * 0.8)} Z" fill="${fg}"/>` },
  { name: "Rings", tile: ({ fg, s, sw }) => `<circle cx="${r1(s / 2)}" cy="${r1(s / 2)}" r="${r1(s * 0.32)}" fill="none" stroke="${fg}" stroke-width="${sw}"/>` },
  { name: "Checker", tile: ({ fg, s }) => `<rect width="${r1(s / 2)}" height="${r1(s / 2)}" fill="${fg}"/><rect x="${r1(s / 2)}" y="${r1(s / 2)}" width="${r1(s / 2)}" height="${r1(s / 2)}" fill="${fg}"/>` },
  { name: "Waves", tile: ({ fg, s, sw }) => `<path d="M 0 ${r1(s / 2)} Q ${r1(s / 4)} 0 ${r1(s / 2)} ${r1(s / 2)} T ${s} ${r1(s / 2)}" fill="none" stroke="${fg}" stroke-width="${sw}"/>` },
];

const preview = document.getElementById("pat-preview");
const gallery = document.getElementById("pat-gallery");
const fgEl = document.getElementById("pat-fg") as HTMLInputElement | null;
const bgEl = document.getElementById("pat-bg") as HTMLInputElement | null;
const sizeEl = document.getElementById("pat-size") as HTMLInputElement | null;
const strokeEl = document.getElementById("pat-stroke") as HTMLInputElement | null;
const svgEl = document.getElementById("pat-svg");

if (preview && gallery && fgEl && bgEl && sizeEl && strokeEl && svgEl) {
  let active = 0;
  const params = (): P => ({ fg: fgEl!.value, bg: bgEl!.value, s: parseInt(sizeEl!.value), sw: parseInt(strokeEl!.value) });

  function svgMarkup(i: number, p: P, full = false): string {
    const id = `p${i}`;
    const dims = full ? `width="100%" height="100%"` : `viewBox="0 0 60 60" width="100%" height="100%"`;
    return `<svg ${dims} xmlns="http://www.w3.org/2000/svg">\n  <defs><pattern id="${id}" width="${p.s}" height="${p.s}" patternUnits="userSpaceOnUse">${PATTERNS[i].tile(p)}</pattern></defs>\n  <rect width="100%" height="100%" fill="${p.bg}"/>\n  <rect width="100%" height="100%" fill="url(#${id})"/>\n</svg>`;
  }

  function renderGallery() {
    gallery!.innerHTML = PATTERNS.map((pt, i) => {
      const mini = svgMarkup(i, { fg: fgEl!.value, bg: bgEl!.value, s: 18, sw: 2 });
      const on = i === active;
      return `<button type="button" data-i="${i}" title="${pt.name}" class="overflow-hidden rounded-lg border-2 ${on ? "border-orange-500" : "border-slate-200 hover:border-orange-400 dark:border-slate-700"}"><span class="block h-12 w-full">${mini}</span></button>`;
    }).join("");
  }

  function render() {
    document.getElementById("pat-size-val")!.textContent = sizeEl!.value;
    document.getElementById("pat-stroke-val")!.textContent = strokeEl!.value;
    const p = params();
    preview!.innerHTML = svgMarkup(active, p, true);
    svgEl!.textContent = svgMarkup(active, p, true);
    renderGallery();
  }

  gallery.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-i]") as HTMLElement | null;
    if (b) { active = parseInt(b.dataset.i!); render(); }
  });
  [fgEl, bgEl, sizeEl, strokeEl].forEach((el) => el.addEventListener("input", render));
  document.getElementById("pat-copy")!.addEventListener("click", () => copyText(svgEl!.textContent || ""));
  document.getElementById("pat-download")!.addEventListener("click", () => downloadBlob(new Blob([svgEl!.textContent || ""], { type: "image/svg+xml" }), "pattern.svg"));
  render();
}
