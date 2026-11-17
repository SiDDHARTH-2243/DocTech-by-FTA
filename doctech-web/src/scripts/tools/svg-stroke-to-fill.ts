// SVG Stroke to Fill — client-side, best-effort. Walks each stroked geometry
// element, samples its path with the browser's getPointAtLength API, offsets by
// ±stroke-width/2 along the normal, and emits a filled outline <path>.
import { downloadBlob } from "../lib/image";
import { setupDropzone, toast, copyText } from "../lib/ui";

const NS = "http://www.w3.org/2000/svg";

const drop = document.getElementById("stf-drop");
const input = document.getElementById("stf-input") as HTMLInputElement | null;
const paste = document.getElementById("stf-paste") as HTMLTextAreaElement | null;
const work = document.getElementById("stf-work");
const beforeEl = document.getElementById("stf-before");
const afterEl = document.getElementById("stf-after");
const codeEl = document.getElementById("stf-code");
const copyBtn = document.getElementById("stf-copy") as HTMLButtonElement | null;
const downloadBtn = document.getElementById("stf-download") as HTMLButtonElement | null;
const countEl = document.getElementById("stf-count");

if (drop && input && paste && work && beforeEl && afterEl && codeEl && copyBtn && downloadBtn && countEl) {
  let outText = "";
  let pasteTimer = 0;

  function parseSvg(text: string): SVGSVGElement | null {
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    if (doc.querySelector("parsererror")) return null;
    return doc.querySelector("svg");
  }

  // Defensive: drop scripts and inline event handlers before we render user SVG.
  function sanitize(svg: SVGSVGElement) {
    svg.querySelectorAll("script").forEach((s) => s.remove());
    svg.querySelectorAll("*").forEach((e) => {
      [...e.attributes].forEach((a) => { if (/^on/i.test(a.name)) e.removeAttribute(a.name); });
    });
  }

  function ensureSize(svg: SVGSVGElement) {
    if (!svg.getAttribute("xmlns")) svg.setAttribute("xmlns", NS);
    if (!svg.getAttribute("viewBox") && svg.getAttribute("width") && svg.getAttribute("height")) {
      svg.setAttribute("viewBox", `0 0 ${parseFloat(svg.getAttribute("width")!)} ${parseFloat(svg.getAttribute("height")!)}`);
    }
  }

  function isClosed(el: Element): boolean {
    const t = el.tagName.toLowerCase();
    if (t === "polygon" || t === "circle" || t === "ellipse" || t === "rect") return true;
    if (t === "path") return /z/i.test(el.getAttribute("d") || "");
    return false;
  }

  const f = (v: number) => Math.round(v * 100) / 100;

  function outline(el: SVGGeometryElement, swPx: number, closed: boolean): string {
    let L = 0;
    try { L = el.getTotalLength(); } catch { return ""; }
    if (!isFinite(L) || L < 0.01) return "";
    const ctm = el.getCTM();
    const sx = ctm ? Math.hypot(ctm.a, ctm.b) : 1;
    const sy = ctm ? Math.hypot(ctm.c, ctm.d) : 1;
    const hw = (swPx * (sx + sy)) / 4; // half stroke-width, scaled to root space
    const n = Math.max(8, Math.min(1000, Math.round(L / 1.5)));
    const pts: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const p = el.getPointAtLength((i / n) * L);
      const tp = ctm ? p.matrixTransform(ctm) : p;
      pts.push([tp.x, tp.y]);
    }
    const left: [number, number][] = [], right: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
      const nx = -dy, ny = dx;
      left.push([pts[i][0] + nx * hw, pts[i][1] + ny * hw]);
      right.push([pts[i][0] - nx * hw, pts[i][1] - ny * hw]);
    }
    const poly = (arr: [number, number][]) => arr.map((p, i) => `${i ? "L" : "M"} ${f(p[0])} ${f(p[1])}`).join(" ");
    if (closed) return `${poly(left)} Z ${poly(right)} Z`; // even-odd annulus
    const back = right.slice().reverse().map((p) => `L ${f(p[0])} ${f(p[1])}`).join(" ");
    return `${poly(left)} ${back} Z`;
  }

  function convert(text: string) {
    if (!text.trim()) return;
    const src = parseSvg(text);
    if (!src) { toast("Could not parse that SVG", "err"); return; }
    sanitize(src);
    ensureSize(src);
    beforeEl!.innerHTML = src.outerHTML;

    // Measure on a live, laid-out clone so getCTM / getPointAtLength resolve.
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;left:-99999px;top:0;";
    const live = src.cloneNode(true) as SVGSVGElement;
    host.appendChild(live);
    document.body.appendChild(host);

    const outlines: { d: string; color: string }[] = [];
    try {
      const geos = live.querySelectorAll<SVGGeometryElement>("path,line,polyline,polygon,circle,ellipse,rect");
      geos.forEach((el) => {
        const cs = getComputedStyle(el);
        const stroke = cs.stroke;
        const sw = parseFloat(cs.strokeWidth);
        if (!stroke || stroke === "none" || stroke === "rgba(0, 0, 0, 0)" || !(sw > 0)) return;
        const d = outline(el, sw, isClosed(el));
        if (d) outlines.push({ d, color: stroke });
      });
    } finally {
      host.remove();
    }

    if (!outlines.length) { toast("No stroked paths found to convert", "err"); return; }

    // Build output: original fills, all strokes removed, plus the outline paths.
    const out = src.cloneNode(true) as SVGSVGElement;
    const style = document.createElementNS(NS, "style");
    style.textContent = "*{stroke:none!important}";
    out.insertBefore(style, out.firstChild);
    const g = document.createElementNS(NS, "g");
    outlines.forEach((o) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", o.d);
      p.setAttribute("fill", o.color);
      p.setAttribute("fill-rule", "evenodd");
      g.appendChild(p);
    });
    out.appendChild(g);

    outText = out.outerHTML;
    afterEl!.innerHTML = outText;
    codeEl!.textContent = outText;
    countEl!.textContent = String(outlines.length);
    work!.classList.remove("hidden");
    copyBtn!.disabled = false;
    downloadBtn!.disabled = false;
  }

  function schedule(text: string) { clearTimeout(pasteTimer); pasteTimer = window.setTimeout(() => convert(text), 250); }

  setupDropzone(drop, input, (files) => {
    const file = files[0];
    if (!file) return;
    if (!/svg/i.test(file.type) && !file.name.toLowerCase().endsWith(".svg")) { toast("Please choose an SVG file", "err"); return; }
    file.text().then((t) => { paste!.value = t; convert(t); });
  });
  paste.addEventListener("input", () => schedule(paste!.value));
  copyBtn.addEventListener("click", () => outText && copyText(outText));
  downloadBtn.addEventListener("click", () => outText && downloadBlob(new Blob([outText], { type: "image/svg+xml" }), "outlined.svg"));
}
