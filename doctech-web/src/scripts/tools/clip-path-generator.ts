// CSS Clip Path Generator — interactive draggable-handle editor. Client-side.
import { copyText } from "../lib/ui";

interface Pt {
  x: number;
  y: number;
}
type Shape =
  | { type: "polygon"; points: Pt[] }
  | { type: "circle"; cx: number; cy: number; r: number }
  | { type: "ellipse"; cx: number; cy: number; rx: number; ry: number };

const $ = (id: string) => document.getElementById(id);
const shapeSel = $("cp-shape") as HTMLSelectElement | null;
const wEl = $("cp-w") as HTMLInputElement | null;
const hEl = $("cp-h") as HTMLInputElement | null;
const stage = $("cp-stage");
const dim = $("cp-dim");
const clip = $("cp-clip");
const svg = $("cp-svg") as unknown as SVGSVGElement | null;
const outline = $("cp-outline");
const handlesG = $("cp-handles");
const cssEl = $("cp-css");
const copyBtn = $("cp-copy");
const shuffleBtn = $("cp-shuffle");
const customBg = $("cp-custombg") as HTMLInputElement | null;
const bgColor = $("cp-bgcolor") as HTMLInputElement | null;
const outsideTog = $("cp-outside") as HTMLInputElement | null;
const guidesTog = $("cp-guides") as HTMLInputElement | null;
const resetBtn = $("cp-reset");

const IMAGES = [
  "https://images.unsplash.com/photo-1502790671504-542ad42d5189?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1418985991508-e47386d96a71?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80",
];

// Shape factories return fresh geometry each time (so edits never mutate defaults).
const SHAPES: Record<string, () => Shape> = {
  Triangle: () => ({ type: "polygon", points: [p(50, 0), p(0, 100), p(100, 100)] }),
  "Inverted Triangle": () => ({ type: "polygon", points: [p(0, 0), p(100, 0), p(50, 100)] }),
  Trapezoid: () => ({ type: "polygon", points: [p(20, 0), p(80, 0), p(100, 100), p(0, 100)] }),
  Rhombus: () => ({ type: "polygon", points: [p(50, 0), p(100, 50), p(50, 100), p(0, 50)] }),
  Pentagon: () => ({ type: "polygon", points: [p(50, 0), p(100, 38), p(82, 100), p(18, 100), p(0, 38)] }),
  Hexagon: () => ({ type: "polygon", points: [p(25, 0), p(75, 0), p(100, 50), p(75, 100), p(25, 100), p(0, 50)] }),
  Heptagon: () => ({ type: "polygon", points: [p(50, 0), p(90, 20), p(100, 60), p(75, 100), p(25, 100), p(0, 60), p(10, 20)] }),
  Octagon: () => ({ type: "polygon", points: [p(30, 0), p(70, 0), p(100, 30), p(100, 70), p(70, 100), p(30, 100), p(0, 70), p(0, 30)] }),
  Star: () => ({ type: "polygon", points: [p(50, 0), p(61, 35), p(98, 35), p(68, 57), p(79, 91), p(50, 70), p(21, 91), p(32, 57), p(2, 35), p(39, 35)] }),
  Chevron: () => ({ type: "polygon", points: [p(75, 0), p(100, 50), p(75, 100), p(0, 100), p(25, 50), p(0, 0)] }),
  "Message Box": () => ({ type: "polygon", points: [p(0, 0), p(100, 0), p(100, 75), p(75, 75), p(75, 100), p(50, 75), p(0, 75)] }),
  Circle: () => ({ type: "circle", cx: 50, cy: 50, r: 50 }),
  Ellipse: () => ({ type: "ellipse", cx: 50, cy: 50, rx: 40, ry: 50 }),
  Custom: () => ({ type: "polygon", points: [p(20, 20), p(80, 20), p(80, 80), p(20, 80)] }),
};
function p(x: number, y: number): Pt {
  return { x, y };
}
const round = (n: number) => Math.round(n);
const clamp = (n: number) => Math.min(100, Math.max(0, n));

const DEFAULT_SHAPE = "Triangle";
const DEFAULT_W = "320";
const DEFAULT_H = "280";

if (
  shapeSel && wEl && hEl && stage && dim && clip && svg && outline && handlesG &&
  cssEl && copyBtn && shuffleBtn && customBg && bgColor && outsideTog && guidesTog && resetBtn
) {
  let shape: Shape = SHAPES[DEFAULT_SHAPE]();
  let imageIndex = 0;

  shapeSel.innerHTML = Object.keys(SHAPES)
    .map((n) => `<option value="${n}">${n}</option>`)
    .join("");
  shapeSel.value = DEFAULT_SHAPE;

  function clipString(s: Shape): string {
    if (s.type === "polygon") {
      return `polygon(${s.points.map((pt) => `${round(pt.x)}% ${round(pt.y)}%`).join(", ")})`;
    }
    if (s.type === "circle") {
      return `circle(${round(s.r)}% at ${round(s.cx)}% ${round(s.cy)}%)`;
    }
    return `ellipse(${round(s.rx)}% ${round(s.ry)}% at ${round(s.cx)}% ${round(s.cy)}%)`;
  }

  // Handles: {x,y in %, kind} used both for the SVG dots and drag math.
  function handleList(): { x: number; y: number; kind: string }[] {
    if (shape.type === "polygon") {
      return shape.points.map((pt, i) => ({ x: pt.x, y: pt.y, kind: `pt-${i}` }));
    }
    if (shape.type === "circle") {
      return [
        { x: shape.cx, y: shape.cy, kind: "center" },
        { x: clamp(shape.cx + shape.r), y: shape.cy, kind: "r" },
      ];
    }
    return [
      { x: shape.cx, y: shape.cy, kind: "center" },
      { x: clamp(shape.cx + shape.rx), y: shape.cy, kind: "rx" },
      { x: shape.cx, y: clamp(shape.cy + shape.ry), kind: "ry" },
    ];
  }

  function applyBackground() {
    const useColor = customBg!.checked;
    bgColor!.classList.toggle("hidden", !useColor);
    const bg = useColor ? "" : `url("${IMAGES[imageIndex]}")`;
    [dim!, clip!].forEach((el) => {
      if (useColor) {
        el.style.backgroundImage = "";
        el.style.backgroundColor = bgColor!.value;
      } else {
        el.style.backgroundColor = "";
        el.style.backgroundImage = bg;
      }
    });
  }

  function render() {
    const cp = clipString(shape);
    clip!.style.clipPath = cp;
    (clip!.style as any).webkitClipPath = cp;
    cssEl!.textContent = `clip-path: ${cp};\n-webkit-clip-path: ${cp};`;

    // Outline: polygon points, or approximate circle/ellipse with the handle ring.
    if (shape.type === "polygon") {
      outline!.setAttribute("points", shape.points.map((pt) => `${pt.x},${pt.y}`).join(" "));
    } else {
      outline!.setAttribute("points", "");
    }

    // Handle dots.
    const hs = handleList();
    handlesG!.innerHTML = hs
      .map(
        (h) =>
          `<circle data-kind="${h.kind}" cx="${h.x}" cy="${h.y}" r="1.8" fill="#fff" stroke="#f97316" stroke-width="1" vector-effect="non-scaling-stroke" style="cursor:grab" />`,
      )
      .join("");

    // Toggles.
    dim!.style.display = outsideTog!.checked ? "" : "none";
    svg!.style.display = guidesTog!.checked ? "none" : "";
  }

  // ── Dragging ──
  let active: string | null = null;
  function toPct(e: PointerEvent): Pt | null {
    const rect = stage!.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return { x: clamp(((e.clientX - rect.left) / rect.width) * 100), y: clamp(((e.clientY - rect.top) / rect.height) * 100) };
  }
  function moveHandle(kind: string, pt: Pt) {
    if (shape.type === "polygon") {
      const i = Number(kind.split("-")[1]);
      shape.points[i] = pt;
    } else if (shape.type === "circle") {
      if (kind === "center") {
        shape.cx = pt.x;
        shape.cy = pt.y;
      } else {
        shape.r = clamp(Math.hypot(pt.x - shape.cx, pt.y - shape.cy));
      }
    } else {
      if (kind === "center") {
        shape.cx = pt.x;
        shape.cy = pt.y;
      } else if (kind === "rx") {
        shape.rx = clamp(Math.abs(pt.x - shape.cx));
      } else {
        shape.ry = clamp(Math.abs(pt.y - shape.cy));
      }
    }
    render();
  }

  svg.addEventListener("pointerdown", (e) => {
    const t = e.target as SVGElement;
    const kind = t.getAttribute("data-kind");
    if (!kind) return;
    active = kind;
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  svg.addEventListener("pointermove", (e) => {
    if (!active) return;
    const pt = toPct(e);
    if (pt) moveHandle(active, pt);
  });
  svg.addEventListener("pointerup", () => (active = null));
  svg.addEventListener("pointercancel", () => (active = null));

  // ── Controls ──
  shapeSel.addEventListener("change", () => {
    shape = SHAPES[shapeSel.value]();
    render();
  });
  function syncSize() {
    wEl!.parentElement!.querySelector("#cp-w-val")!.textContent = wEl!.value;
    hEl!.parentElement!.querySelector("#cp-h-val")!.textContent = hEl!.value;
    stage!.style.width = `${wEl!.value}px`;
    stage!.style.height = `${hEl!.value}px`;
  }
  wEl.addEventListener("input", syncSize);
  hEl.addEventListener("input", syncSize);

  shuffleBtn.addEventListener("click", () => {
    if (customBg.checked) customBg.checked = false;
    let next = imageIndex;
    while (next === imageIndex && IMAGES.length > 1) next = Math.floor(Math.random() * IMAGES.length);
    imageIndex = next;
    applyBackground();
  });
  customBg.addEventListener("change", applyBackground);
  bgColor.addEventListener("input", applyBackground);
  outsideTog.addEventListener("change", render);
  guidesTog.addEventListener("change", render);

  resetBtn.addEventListener("click", () => {
    shape = SHAPES[DEFAULT_SHAPE]();
    shapeSel.value = DEFAULT_SHAPE;
    wEl.value = DEFAULT_W;
    hEl.value = DEFAULT_H;
    customBg.checked = false;
    outsideTog.checked = true;
    guidesTog.checked = false;
    imageIndex = 0;
    syncSize();
    applyBackground();
    render();
  });

  copyBtn.addEventListener("click", () => copyText(cssEl!.textContent || ""));

  syncSize();
  applyBackground();
  render();
}
