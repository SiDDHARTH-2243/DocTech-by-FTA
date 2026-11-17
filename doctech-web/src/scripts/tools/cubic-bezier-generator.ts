// Cubic-bezier Generator — premium draggable easing curve with multi-preview. Client-side.
import { copyText } from "../lib/ui";

const svg = document.getElementById("cb-svg") as SVGSVGElement | null;
const curve = document.getElementById("cb-curve");
const l1 = document.getElementById("cb-l1");
const l2 = document.getElementById("cb-l2");
const h1 = document.getElementById("cb-h1");
const h2 = document.getElementById("cb-h2");
const h1Glow = document.getElementById("cb-h1-glow");
const h2Glow = document.getElementById("cb-h2-glow");
const ball = document.getElementById("cb-ball");
const scaleBox = document.getElementById("cb-scale-box");
const rotateBox = document.getElementById("cb-rotate-box");
const opacityBox = document.getElementById("cb-opacity-box");
const compareLinear = document.getElementById("cb-compare-linear");
const compareCustom = document.getElementById("cb-compare-custom");
const presetsEl = document.getElementById("cb-presets");
const cssEl = document.getElementById("cb-css");
const copyBtn = document.getElementById("cb-copy");
const valueBadge = document.getElementById("cb-value-badge");
const p1CoordsEl = document.getElementById("cb-p1-coords");
const p2CoordsEl = document.getElementById("cb-p2-coords");
const resetBtn = document.getElementById("cb-reset");
const replayBtn = document.getElementById("cb-replay");
const durationInput = document.getElementById("cb-duration") as HTMLInputElement | null;
const durationVal = document.getElementById("cb-duration-val");

if (svg && curve && l1 && l2 && h1 && h2 && ball && presetsEl && cssEl && copyBtn) {
  // Geometry: x in [0,1] -> [0,288]; value in [0,1] -> y 320..40 (PAD=40, H=280).
  const W = 288;
  const H = 280;
  const PAD = 40;
  const xToPx = (x: number) => x * W;
  const vToPx = (v: number) => PAD + (1 - v) * H;
  const pxToX = (px: number) => Math.min(1, Math.max(0, px / W));
  const pxToV = (py: number) => 1 - (py - PAD) / H;

  // Control points (x in 0..1, value can overshoot).
  let p1 = { x: 0.25, y: 0.1 };
  let p2 = { x: 0.25, y: 1.0 };

  // Duration
  let duration = 1.4;

  // CSS format state
  let cssFormat: "shorthand" | "transition" | "animation" = "shorthand";

  const presets: Record<string, { values: [number, number, number, number]; icon: string }> = {
    "ease":        { values: [0.25, 0.1, 0.25, 1],    icon: "◐" },
    "ease-in":     { values: [0.42, 0, 1, 1],         icon: "▷" },
    "ease-out":    { values: [0, 0, 0.58, 1],          icon: "◁" },
    "ease-in-out": { values: [0.42, 0, 0.58, 1],      icon: "◇" },
    "linear":      { values: [0, 0, 1, 1],             icon: "─" },
    "back-in":     { values: [0.36, 0, 0.66, -0.56],   icon: "↙" },
    "back-out":    { values: [0.34, 1.56, 0.64, 1],    icon: "↗" },
    "back-in-out": { values: [0.68, -0.6, 0.32, 1.6],  icon: "↔" },
    "circ-in":     { values: [0.55, 0, 1, 0.45],       icon: "◠" },
    "circ-out":    { values: [0, 0.55, 0.45, 1],       icon: "◡" },
    "bounce":      { values: [0.68, -0.55, 0.27, 1.55], icon: "⌁" },
    "snap":        { values: [0.85, 0, 0.15, 1],        icon: "⚡" },
  };

  function value(): [number, number, number, number] {
    return [
      Math.round(p1.x * 100) / 100,
      Math.round(p1.y * 100) / 100,
      Math.round(p2.x * 100) / 100,
      Math.round(p2.y * 100) / 100,
    ];
  }

  function cubicBezierStr(): string {
    const [a, b, c, d] = value();
    return `cubic-bezier(${a}, ${b}, ${c}, ${d})`;
  }

  function draw() {
    const startX = xToPx(0);
    const startY = vToPx(0);
    const endX = xToPx(1);
    const endY = vToPx(1);
    const c1x = xToPx(p1.x);
    const c1y = vToPx(p1.y);
    const c2x = xToPx(p2.x);
    const c2y = vToPx(p2.y);

    // Curve
    curve!.setAttribute("d", `M ${startX} ${startY} C ${c1x} ${c1y} ${c2x} ${c2y} ${endX} ${endY}`);
    curve!.setAttribute("stroke", "url(#cb-curve-grad)");

    // Handle lines
    l1!.setAttribute("x1", String(startX));
    l1!.setAttribute("y1", String(startY));
    l1!.setAttribute("x2", String(c1x));
    l1!.setAttribute("y2", String(c1y));
    l1!.setAttribute("stroke", "#fb923c");
    l2!.setAttribute("x1", String(endX));
    l2!.setAttribute("y1", String(endY));
    l2!.setAttribute("x2", String(c2x));
    l2!.setAttribute("y2", String(c2y));
    l2!.setAttribute("stroke", "#60a5fa");

    // Handle circles
    h1!.setAttribute("cx", String(c1x));
    h1!.setAttribute("cy", String(c1y));
    h1!.setAttribute("fill", "#f97316");
    h1!.setAttribute("stroke", "#fff");
    h1!.setAttribute("stroke-width", "2");
    h2!.setAttribute("cx", String(c2x));
    h2!.setAttribute("cy", String(c2y));
    h2!.setAttribute("fill", "#3b82f6");
    h2!.setAttribute("stroke", "#fff");
    h2!.setAttribute("stroke-width", "2");

    // Glow rings
    if (h1Glow) {
      h1Glow.setAttribute("cx", String(c1x));
      h1Glow.setAttribute("cy", String(c1y));
      h1Glow.setAttribute("stroke", "#f9731640");
      h1Glow.setAttribute("stroke-width", "2");
    }
    if (h2Glow) {
      h2Glow.setAttribute("cx", String(c2x));
      h2Glow.setAttribute("cy", String(c2y));
      h2Glow.setAttribute("stroke", "#3b82f640");
      h2Glow.setAttribute("stroke-width", "2");
    }

    const [a, b, c, d] = value();
    const fn = cubicBezierStr();

    // Update CSS output
    updateCSS();

    // Update value badge
    if (valueBadge) valueBadge.textContent = fn;

    // Update P1/P2 coordinate displays
    if (p1CoordsEl) p1CoordsEl.textContent = `${a}, ${b}`;
    if (p2CoordsEl) p2CoordsEl.textContent = `${c}, ${d}`;

    // Restart all preview animations
    restartAnimations();
  }

  function updateCSS() {
    const fn = cubicBezierStr();
    let text = "";
    if (cssFormat === "shorthand") {
      text = fn;
    } else if (cssFormat === "transition") {
      text = `transition-timing-function: ${fn};\ntransition-duration: ${duration}s;`;
    } else {
      text = `animation-timing-function: ${fn};\nanimation-duration: ${duration}s;`;
    }
    cssEl!.textContent = text;
  }

  function restartAnimations() {
    const fn = cubicBezierStr();
    const dur = `${duration}s`;

    // Translation ball
    if (ball) {
      ball.style.animation = "none";
      void ball.offsetWidth;
      ball.style.animation = `cb-move ${dur} ${fn} infinite alternate`;
    }

    // Scale box
    if (scaleBox) {
      scaleBox.style.animation = "none";
      void scaleBox.offsetWidth;
      scaleBox.style.animation = `cb-scale ${dur} ${fn} infinite alternate`;
    }

    // Rotate box
    if (rotateBox) {
      rotateBox.style.animation = "none";
      void rotateBox.offsetWidth;
      rotateBox.style.animation = `cb-rotate ${dur} ${fn} infinite alternate`;
    }

    // Opacity box
    if (opacityBox) {
      opacityBox.style.animation = "none";
      void opacityBox.offsetWidth;
      opacityBox.style.animation = `cb-opacity ${dur} ${fn} infinite alternate`;
    }

    // Comparison tracks
    if (compareLinear) {
      compareLinear.style.animation = "none";
      void compareLinear.offsetWidth;
      compareLinear.style.animation = `cb-move ${dur} linear infinite alternate`;
    }
    if (compareCustom) {
      compareCustom.style.animation = "none";
      void compareCustom.offsetWidth;
      compareCustom.style.animation = `cb-move ${dur} ${fn} infinite alternate`;
    }
  }

  // Inject keyframes (all preview types).
  if (!document.getElementById("cb-kf")) {
    const st = document.createElement("style");
    st.id = "cb-kf";
    st.textContent = [
      "@keyframes cb-move { to { left: calc(100% - 2rem); } }",
      "@keyframes cb-scale { from { transform: scale(0.5); } to { transform: scale(1.3); } }",
      "@keyframes cb-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }",
      "@keyframes cb-opacity { from { opacity: 0.15; } to { opacity: 1; } }",
    ].join("\n");
    document.head.appendChild(st);
  }

  // Inject the gradient definition for the curve
  const defs = svg.querySelector("defs");
  if (defs && !document.getElementById("cb-curve-grad")) {
    const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    grad.id = "cb-curve-grad";
    grad.setAttribute("x1", "0%");
    grad.setAttribute("y1", "100%");
    grad.setAttribute("x2", "100%");
    grad.setAttribute("y2", "0%");
    grad.innerHTML = `<stop offset="0%" stop-color="#f97316"/><stop offset="100%" stop-color="#3b82f6"/>`;
    defs.appendChild(grad);
  }

  // ── Dragging ──────────────────────────────────────────────────────────
  function startDrag(handle: { x: number; y: number }, handleEl: SVGCircleElement) {
    handleEl.style.cursor = "grabbing";
    const move = (e: PointerEvent) => {
      const rect = svg!.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      handle.x = pxToX(px);
      // Clamp Y to a reasonable range (e.g. -1.5 to +2.5) so it doesn't fly off infinitely,
      // but still allows standard bouncy bezier values to be set.
      handle.y = Math.min(2.5, Math.max(-1.5, pxToV(py)));
      draw();
    };
    const up = () => {
      handleEl.style.cursor = "grab";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  h1.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    startDrag(p1, h1 as unknown as SVGCircleElement);
  });
  h2.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    startDrag(p2, h2 as unknown as SVGCircleElement);
  });

  // ── Presets ───────────────────────────────────────────────────────────
  presetsEl.innerHTML = Object.entries(presets)
    .map(
      ([name, { icon }]) =>
        `<button type="button" data-p="${name}" class="group flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-2 py-2 text-center transition-all hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-sm hover:shadow-orange-500/10 dark:border-slate-700 dark:hover:border-orange-500">
          <span class="text-base leading-none text-slate-400 transition-colors group-hover:text-orange-500">${icon}</span>
          <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">${name}</span>
        </button>`,
    )
    .join("");

  let activePresetBtn: HTMLElement | null = null;
  presetsEl.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("[data-p]") as HTMLElement | null;
    if (!btn) return;
    const preset = presets[btn.dataset.p!];
    if (!preset) return;
    const [a, b, c, d] = preset.values;
    p1 = { x: a, y: b };
    p2 = { x: c, y: d };

    // Highlight active preset
    if (activePresetBtn) {
      activePresetBtn.classList.remove("border-orange-400", "bg-orange-500/5", "dark:border-orange-500");
    }
    btn.classList.add("border-orange-400", "bg-orange-500/5", "dark:border-orange-500");
    activePresetBtn = btn;

    draw();
  });

  // ── Duration slider ───────────────────────────────────────────────────
  if (durationInput && durationVal) {
    durationInput.addEventListener("input", () => {
      duration = parseFloat(durationInput.value);
      durationVal.textContent = `${duration}s`;
      restartAnimations();
      updateCSS();
    });
  }

  // ── Reset button ──────────────────────────────────────────────────────
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      p1 = { x: 0.25, y: 0.1 };
      p2 = { x: 0.25, y: 1.0 };
      if (activePresetBtn) {
        activePresetBtn.classList.remove("border-orange-400", "bg-orange-500/5", "dark:border-orange-500");
        activePresetBtn = null;
      }
      draw();
    });
  }

  // ── Replay button ─────────────────────────────────────────────────────
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      restartAnimations();
    });
  }

  // ── CSS format toggle ─────────────────────────────────────────────────
  const formatBtns = document.querySelectorAll<HTMLElement>(".cb-format-btn");
  formatBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      cssFormat = (btn.dataset.format || "shorthand") as typeof cssFormat;
      formatBtns.forEach((b) => {
        if (b === btn) {
          b.className = "cb-format-btn rounded-md bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white";
        } else {
          b.className = "cb-format-btn rounded-md border border-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400";
        }
      });
      updateCSS();
    });
  });

  // ── Copy ──────────────────────────────────────────────────────────────
  copyBtn.addEventListener("click", () => {
    copyText(cssEl!.textContent || "");
  });

  // ── Initial draw ──────────────────────────────────────────────────────
  draw();
}
