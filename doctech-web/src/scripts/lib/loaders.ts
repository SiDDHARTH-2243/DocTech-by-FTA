// Scalable pure-CSS loader registry. Each loader is parametric on LoaderParams,
// so the same definitions power the grid (default params) and the customization
// modal (live params). Add a new entry here and it appears in the grid + filter.

export interface LoaderParams {
  size: number; // px
  speed: number; // seconds per cycle
  thickness: number; // px (border / bar / line width)
  color: string; // primary color (#rrggbb)
  bg: string; // canvas background (#rrggbb) — applied by the canvas, not by build()
}

export const DEFAULT_PARAMS: LoaderParams = {
  size: 48,
  speed: 1.2,
  thickness: 5,
  color: "#f97316",
  bg: "#1e293b",
};

export const CATEGORIES = [
  "All",
  "Spinners",
  "Dots",
  "Bars",
  "Wave",
  "Progress",
  "Geometric",
  "3D",
  "Gooey",
  "Skeleton",
  "Misc",
] as const;

export interface LoaderDef {
  id: string;
  name: string;
  category: (typeof CATEGORIES)[number];
  /** Build scoped CSS + HTML. `k` scopes both the class name and @keyframes names. */
  build: (p: LoaderParams, k: string) => { css: string; html: string };
}

// Helpers ----------------------------------------------------------------------
const faint = (c: string) => `${c}33`; // ~20% alpha track
const delays = (sel: string, n: number, step: number, unit = "s") =>
  Array.from({ length: n }, (_, i) => (i === 0 ? "" : `${sel}:nth-child(${i + 1}){animation-delay:${(i * step).toFixed(2)}${unit}}`)).join("");

export const LOADERS: LoaderDef[] = [
  // ── Spinners ──────────────────────────────────────────────────────────────
  {
    id: "ring", name: "Ring", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border:${w}px solid ${faint(c)};border-top-color:${c};border-radius:50%;animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "dual-ring", name: "Dual Ring", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border:${w}px solid transparent;border-top-color:${c};border-bottom-color:${c};border-radius:50%;animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "arc", name: "Half Arc", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border:${w}px solid ${faint(c)};border-top-color:${c};border-right-color:${c};border-radius:50%;animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "orbit", name: "Orbit", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;position:relative;animation:${k}-r ${t}s linear infinite}.${k}::before{content:"";position:absolute;top:0;left:50%;width:${w * 2.4}px;height:${w * 2.4}px;margin-left:-${w * 1.2}px;background:${c};border-radius:50%}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },

  // ── Dots ──────────────────────────────────────────────────────────────────
  {
    id: "dots-bounce", name: "Bouncing Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;gap:${d / 2}px}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-b ${t}s ease-in-out infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-b{0%,100%{transform:translateY(0)}50%{transform:translateY(-${d * 1.4}px)}}`,
      };
    },
  },
  {
    id: "progress-grow", name: "Indeterminate", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 3}px;height:${w + 2}px;background:${faint(c)};border-radius:${w}px;overflow:hidden}.${k}::before{content:"";display:block;height:100%;background:${c};transform-origin:left;animation:${k}-g ${t}s ease-in-out infinite}@keyframes ${k}-g{0%{transform:scaleX(0);transform-origin:left}50%{transform:scaleX(1);transform-origin:left}51%{transform-origin:right}100%{transform:scaleX(0);transform-origin:right}}`,
    }),
  },

  // ── Geometric ─────────────────────────────────────────────────────────────
  {
    id: "square-spin", name: "Spinning Square", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "double-arc", name: "Double Arc", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k}::before,.${k}::after{content:"";position:absolute;border-radius:50%;border:${w}px solid transparent}.${k}::before{inset:0;border-top-color:${c};animation:${k}-r ${t}s linear infinite}.${k}::after{inset:${w * 1.8}px;border-bottom-color:${c};animation:${k}-r ${(t * 1.5).toFixed(2)}s linear infinite reverse}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "ring-pulse", name: "Pulsing Ring", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border:${w}px solid ${faint(c)};border-top-color:${c};border-radius:50%;animation:${k}-r ${t}s linear infinite,${k}-o ${(t * 2).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}@keyframes ${k}-o{0%,100%{opacity:1}50%{opacity:.35}}`,
    }),
  },

  // ── Dots ──
  {
    id: "dot-spinner-8", name: "Spinner Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(4, s / 7);
      let extra = "";
      for (let i = 0; i < 8; i++) extra += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 45}deg);animation-delay:${((i * t) / 8).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(8)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:0;left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;transform-origin:${d / 2}px ${s / 2}px;animation:${k}-f ${t}s linear infinite}${extra}@keyframes ${k}-f{0%,100%{opacity:1}50%{opacity:.15}}`,
      };
    },
  },
  {
    id: "dots-grid", name: "Dot Grid", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(4, s / 6);
      let extra = "";
      for (let i = 0; i < 9; i++) extra += `.${k} span:nth-child(${i + 1}){animation-delay:${((((i % 3) + Math.floor(i / 3)) * t) / 8).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(9)}</div>`,
        css: `.${k}{display:grid;grid-template-columns:repeat(3,${d}px);gap:${d / 2}px}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-p ${t}s ease-in-out infinite}${extra}@keyframes ${k}-p{0%,100%{opacity:.2;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}`,
      };
    },
  },

  // ── Bars ──
  {
    id: "bars-rotate", name: "Rotating Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;align-items:flex-end;height:${s}px;animation:${k}-rot ${(t * 3).toFixed(2)}s linear infinite}.${k} span{width:${Math.max(3, w)}px;height:100%;background:${c};transform-origin:bottom;animation:${k}-e ${t}s ease-in-out infinite}${delays(`.${k} span`, 4, t / 8)}@keyframes ${k}-e{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}@keyframes ${k}-rot{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "bars-flip", name: "Flipping Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(4, w + 2)}px;height:${s}px}.${k} span{width:${s / 4}px;height:100%;background:${c};animation:${k}-f ${t}s ease-in-out infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-f{0%,100%{transform:perspective(120px) rotateY(0)}50%{transform:perspective(120px) rotateY(180deg)}}`,
    }),
  },

  // ── Wave ──
  {
    id: "wave-bars", name: "Wave Bars", category: "Wave",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}">${"<span></span>".repeat(7)}</div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(2, w - 1)}px;align-items:center;height:${s}px}.${k} span{width:${Math.max(2, w - 1)}px;height:${s * 0.5}px;background:${c};border-radius:${w}px;transform-origin:center;animation:${k}-w ${t}s ease-in-out infinite}${delays(`.${k} span`, 7, t / 14)}@keyframes ${k}-w{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}`,
    }),
  },
  {
    id: "water-fill", name: "Water Fill", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="w"></div></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;border:2px solid ${c};border-radius:50%;overflow:hidden}.${k} .w{position:absolute;left:-50%;width:200%;height:200%;background:${c};opacity:.6;border-radius:42% 44% 40% 46%;animation:${k}-rot ${(t * 1.4).toFixed(2)}s linear infinite,${k}-lvl ${(t * 2).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-rot{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes ${k}-lvl{0%,100%{top:55%}50%{top:28%}}`,
    }),
  },
  {
    id: "ripple", name: "Ripple", category: "Wave",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;inset:0;border:${w}px solid ${c};border-radius:50%;animation:${k}-r ${t}s ease-out infinite}.${k} span:nth-child(2){animation-delay:${(t / 3).toFixed(2)}s}.${k} span:nth-child(3){animation-delay:${((2 * t) / 3).toFixed(2)}s}@keyframes ${k}-r{0%{transform:scale(.1);opacity:1}100%{transform:scale(1);opacity:0}}`,
    }),
  },

  // ── Progress ──
  {
    id: "progress-stripes", name: "Striped Bar", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 3}px;height:${w + 6}px;border-radius:${w}px;background:repeating-linear-gradient(45deg,${c} 0 10px,${faint(c)} 10px 20px);background-size:28px 100%;animation:${k}-s ${t}s linear infinite}@keyframes ${k}-s{to{background-position:28px 0}}`,
    }),
  },
  {
    id: "progress-dual", name: "Material Bar", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s * 3}px;height:${w + 2}px;background:${faint(c)};border-radius:${w}px;overflow:hidden}.${k}::before,.${k}::after{content:"";position:absolute;top:0;height:100%;background:${c};border-radius:${w}px}.${k}::before{animation:${k}-a ${(t * 1.8).toFixed(2)}s cubic-bezier(.65,.81,.74,.41) infinite}.${k}::after{animation:${k}-b ${(t * 1.8).toFixed(2)}s cubic-bezier(.16,.84,.44,1) infinite;animation-delay:${(t * 0.9).toFixed(2)}s}@keyframes ${k}-a{0%{left:-35%;right:100%}60%,100%{left:100%;right:-90%}}@keyframes ${k}-b{0%{left:-200%;right:100%}60%,100%{left:107%;right:-8%}}`,
    }),
  },
  {
    id: "progress-ball", name: "Bouncing Progress", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span></div>`,
      css: `.${k}{position:relative;width:${s * 3}px;height:${w + 2}px;background:${faint(c)};border-radius:${w}px}.${k} span{position:absolute;top:50%;left:0;width:${w * 2.4}px;height:${w * 2.4}px;margin-top:-${w * 1.2}px;background:${c};border-radius:50%;animation:${k}-b ${t}s cubic-bezier(.45,0,.55,1) infinite alternate}@keyframes ${k}-b{to{left:calc(100% - ${w * 2.4}px)}}`,
    }),
  },

  // ── Geometric ──
  {
    id: "hexagon-spin", name: "Hexagon", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "diamond-pulse", name: "Diamond Pulse", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 0.7}px;height:${s * 0.7}px;background:${c};animation:${k}-p ${t}s ease-in-out infinite}@keyframes ${k}-p{0%,100%{transform:rotate(45deg) scale(.6);opacity:.6}50%{transform:rotate(45deg) scale(1);opacity:1}}`,
    }),
  },
  {
    id: "square-swap", name: "Square Swap", category: "Geometric",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const sq = s * 0.45;
      return {
        html: `<div class="${k}"><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${sq}px}.${k} span{position:absolute;top:0;width:${sq}px;height:${sq}px;background:${c};border-radius:${w}px}.${k} span:nth-child(1){left:0;animation:${k}-a ${t}s ease-in-out infinite}.${k} span:nth-child(2){right:0;animation:${k}-b ${t}s ease-in-out infinite}@keyframes ${k}-a{0%,100%{left:0}50%{left:calc(100% - ${sq}px)}}@keyframes ${k}-b{0%,100%{right:0}50%{right:calc(100% - ${sq}px)}}`,
      };
    },
  },
  {
    id: "pentagon-spin", name: "Pentagon", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};clip-path:polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },

  // ── 3D ──
  {
    id: "cube-3d", name: "3D Cube", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => {
      const h = s / 2;
      let faces = "";
      const tr = [`rotateY(0deg)`, `rotateY(90deg)`, `rotateY(180deg)`, `rotateY(270deg)`, `rotateX(90deg)`, `rotateX(-90deg)`];
      tr.forEach((r, i) => (faces += `.${k} span:nth-child(${i + 1}){transform:${r} translateZ(${h}px)}`));
      return {
        html: `<div class="${k}"><div class="b">${"<span></span>".repeat(6)}</div></div>`,
        css: `.${k}{width:${s}px;height:${s}px;perspective:${s * 4}px}.${k} .b{position:relative;width:100%;height:100%;transform-style:preserve-3d;animation:${k}-r ${(t * 3).toFixed(2)}s linear infinite}.${k} span{position:absolute;width:${s}px;height:${s}px;background:${c}cc;border:1px solid ${c}}${faces}@keyframes ${k}-r{from{transform:rotateX(-22deg) rotateY(0)}to{transform:rotateX(-22deg) rotateY(360deg)}}`,
      };
    },
  },
  {
    id: "fold-grid", name: "Folding Grid", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => {
      const q = s / 2;
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;perspective:${s * 3}px}.${k} span{position:absolute;width:${q}px;height:${q}px;background:${c};animation:${k}-f ${(t * 2.4).toFixed(2)}s ease-in-out infinite}.${k} span:nth-child(1){top:0;left:0}.${k} span:nth-child(2){top:0;right:0;animation-delay:${(t * 0.3).toFixed(2)}s}.${k} span:nth-child(3){bottom:0;right:0;animation-delay:${(t * 0.6).toFixed(2)}s}.${k} span:nth-child(4){bottom:0;left:0;animation-delay:${(t * 0.9).toFixed(2)}s}@keyframes ${k}-f{0%,80%,100%{transform:perspective(140px) rotateX(0);opacity:1}40%{transform:perspective(140px) rotateX(-180deg);opacity:.55}}`,
      };
    },
  },
  {
    id: "flip-card", name: "Flip Card", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:linear-gradient(135deg,${c},${c}99);border-radius:6px;animation:${k}-f ${t}s linear infinite}@keyframes ${k}-f{to{transform:perspective(220px) rotateY(360deg)}}`,
    }),
  },
  {
    id: "bars-3d", name: "3D Bars", category: "3D",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(4, w)}px;align-items:flex-end;height:${s}px;perspective:${s * 3}px}.${k} span{width:${s / 5}px;height:100%;background:${c};transform-origin:bottom;animation:${k}-b ${t}s ease-in-out infinite}${delays(`.${k} span`, 4, t / 8)}@keyframes ${k}-b{0%,100%{transform:rotateX(70deg) scaleY(.3)}50%{transform:rotateX(0) scaleY(1)}}`,
    }),
  },

  // ── Gooey ──
  {
    id: "gooey-merge", name: "Gooey Merge", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/></filter></defs></svg><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s * 1.6}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${s * 0.2}px);left:calc(50% - ${s * 0.2}px);width:${s * 0.4}px;height:${s * 0.4}px;background:${c};border-radius:50%;animation:${k}-m ${t}s ease-in-out infinite}.${k} span:last-child{animation-delay:-${(t / 2).toFixed(2)}s}@keyframes ${k}-m{0%,100%{transform:translateX(-${s * 0.4}px)}50%{transform:translateX(${s * 0.4}px)}}`,
    }),
  },
  {
    id: "blob-morph", name: "Morphing Blob", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};animation:${k}-m ${(t * 2).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-m{0%,100%{border-radius:42% 58% 70% 30% / 45% 45% 55% 55%;transform:rotate(0)}50%{border-radius:70% 30% 46% 54% / 30% 60% 40% 70%;transform:rotate(180deg)}}`,
    }),
  },
  {
    id: "gooey-orbit", name: "Gooey Orbit", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/></filter></defs></svg><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;border-radius:50%;background:${c}}.${k} span:nth-child(2){top:calc(50% - ${s * 0.18}px);left:calc(50% - ${s * 0.18}px);width:${s * 0.36}px;height:${s * 0.36}px}.${k} span:nth-child(3){top:calc(50% - ${s * 0.11}px);left:calc(50% - ${s * 0.11}px);width:${s * 0.22}px;height:${s * 0.22}px;transform-origin:${s * 0.11}px ${s * 0.42}px;animation:${k}-o ${t}s linear infinite}@keyframes ${k}-o{to{transform:rotate(360deg)}}`,
    }),
  },

  // ── Skeleton ──
  {
    id: "skeleton-card", name: "Skeleton Card", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="img"></div><div class="ln"></div><div class="ln short"></div></div>`,
      css: `.${k}{width:${s * 2.4}px;display:flex;flex-direction:column;gap:${s * 0.12}px}.${k} .img{height:${s}px;border-radius:8px}.${k} .ln{height:${s * 0.18}px;border-radius:4px}.${k} .ln.short{width:60%}.${k} .img,.${k} .ln{background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },
  {
    id: "skeleton-list", name: "Skeleton List", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="av"></div><div class="col"><div class="ln"></div><div class="ln short"></div></div></div>`,
      css: `.${k}{display:flex;align-items:center;gap:${s * 0.2}px;width:${s * 2.6}px}.${k} .av{width:${s * 0.7}px;height:${s * 0.7}px;border-radius:50%;flex:none}.${k} .col{flex:1;display:flex;flex-direction:column;gap:${s * 0.14}px}.${k} .ln{height:${s * 0.16}px;border-radius:4px}.${k} .ln.short{width:55%}.${k} .av,.${k} .ln{background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },
  {
    id: "shimmer-bar", name: "Shimmer Bar", category: "Skeleton",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 3}px;height:${w + 6}px;border-radius:${w}px;background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },

  // ── Misc ──
  {
    id: "heartbeat", name: "Heartbeat", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 0.7}px;height:${s * 0.7}px;background:${c};position:relative;transform:rotate(-45deg);animation:${k}-b ${t}s ease-in-out infinite}.${k}::before,.${k}::after{content:"";width:${s * 0.7}px;height:${s * 0.7}px;background:${c};border-radius:50%;position:absolute}.${k}::before{top:-${s * 0.35}px;left:0}.${k}::after{left:${s * 0.35}px;top:0}@keyframes ${k}-b{0%,100%{transform:rotate(-45deg) scale(.8)}25%{transform:rotate(-45deg) scale(1)}40%{transform:rotate(-45deg) scale(.9)}60%{transform:rotate(-45deg) scale(1.05)}}`,
    }),
  },
  {
    id: "coin-flip", name: "Coin Flip", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:${c};animation:${k}-f ${t}s linear infinite}@keyframes ${k}-f{0%{transform:perspective(220px) rotateY(0)}100%{transform:perspective(220px) rotateY(360deg)}}`,
    }),
  },
  {
    id: "battery", name: "Battery", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s * 1.6}px;height:${s}px;border:${w}px solid ${c};border-radius:${w}px;padding:${w / 2}px;box-sizing:border-box}.${k}::before{content:"";position:absolute;right:-${w * 1.6}px;top:30%;width:${w}px;height:40%;background:${c};border-radius:0 ${w}px ${w}px 0}.${k}::after{content:"";display:block;height:100%;width:30%;background:${c};border-radius:1px;animation:${k}-c ${t}s ease-in-out infinite}@keyframes ${k}-c{0%{width:8%}100%{width:100%}}`,
    }),
  },
  {
    id: "signal", name: "Signal", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w - 1)}px;align-items:flex-end;height:${s}px}.${k} span{width:${Math.max(3, w)}px;background:${c};border-radius:2px;animation:${k}-s ${t}s ease-in-out infinite}.${k} span:nth-child(1){height:25%}.${k} span:nth-child(2){height:50%}.${k} span:nth-child(3){height:75%}.${k} span:nth-child(4){height:100%}${delays(`.${k} span`, 4, t / 8)}@keyframes ${k}-s{0%,100%{opacity:.3}50%{opacity:1}}`,
    }),
  },

  // ════════════ BATCH 2 — expanded catalog ════════════
  // ── Spinners ──
  {
    id: "triple-orbit", name: "Triple Orbit", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 8);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} span:nth-child(1){top:0;transform-origin:${d / 2}px ${s / 2}px;animation:${k}-r ${t}s linear infinite}.${k} span:nth-child(2){top:${s / 6}px;transform-origin:${d / 2}px ${s / 3}px;animation:${k}-r ${(t * 1.4).toFixed(2)}s linear infinite}.${k} span:nth-child(3){top:${s / 3}px;transform-origin:${d / 2}px ${s / 6}px;animation:${k}-r ${(t * 0.7).toFixed(2)}s linear infinite reverse}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },
  {
    id: "gradient-ring", name: "Gradient Ring", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(${faint(c)},${c} 50%,${faint(c)});-webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - ${w}px),#000 0);mask:radial-gradient(farthest-side,#0000 calc(100% - ${w}px),#000 0);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "yin-yang", name: "Yin Yang", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:linear-gradient(${c} 50%,${faint(c)} 50%);position:relative;animation:${k}-r ${t}s linear infinite}.${k}::before,.${k}::after{content:"";position:absolute;left:25%;width:50%;height:50%;border-radius:50%}.${k}::before{top:0;background:${faint(c)}}.${k}::after{top:50%;background:${c}}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },

  // ── Dots ──
  {
    id: "dots-collision", name: "Collision", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${d}px}.${k} span{position:absolute;top:0;width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} span:nth-child(1){left:0;animation:${k}-l ${t}s ease-in-out infinite}.${k} span:nth-child(2){right:0;animation:${k}-r ${t}s ease-in-out infinite}@keyframes ${k}-l{0%,100%{left:0}50%{left:calc(50% - ${d / 2}px)}}@keyframes ${k}-r{0%,100%{right:0}50%{right:calc(50% - ${d / 2}px)}}`,
      };
    },
  },
  {
    id: "bars-load", name: "Loading Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;align-items:flex-end;height:${s}px}.${k} span{width:${Math.max(3, w * 1.4)}px;height:20%;background:${c};border-radius:2px;animation:${k}-l ${t}s ease-in-out infinite}${delays(`.${k} span`, 5, t / 10)}@keyframes ${k}-l{0%{height:20%}50%{height:100%}100%{height:20%}}`,
    }),
  },

  // ── Wave ──
  {
    id: "audio-wave", name: "Audio Wave", category: "Wave",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const bw = Math.max(2, w - 1);
      return {
        html: `<div class="${k}">${"<span></span>".repeat(7)}</div>`,
        css: `.${k}{display:inline-flex;gap:${bw}px;align-items:center;height:${s}px}.${k} span{width:${bw}px;height:100%;background:${c};border-radius:${w}px;transform-origin:center;animation:${k}-a ${t}s ease-in-out infinite}.${k} span:nth-child(1),.${k} span:nth-child(7){animation-delay:0s}.${k} span:nth-child(2),.${k} span:nth-child(6){animation-delay:${(t / 8).toFixed(2)}s}.${k} span:nth-child(3),.${k} span:nth-child(5){animation-delay:${(t / 4).toFixed(2)}s}.${k} span:nth-child(4){animation-delay:${((3 * t) / 8).toFixed(2)}s}@keyframes ${k}-a{0%,100%{transform:scaleY(.2)}50%{transform:scaleY(1)}}`,
      };
    },
  },

  // ── Progress ──
  {
    id: "pacman", name: "Pac-Man", category: "Progress",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 5);
      return {
        html: `<div class="${k}"><div class="pac"></div><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 2.6}px;height:${s}px}.${k} .pac{position:absolute;left:0;top:0;width:${s}px;height:${s}px;background:${c};border-radius:50%;animation:${k}-chomp ${(t * 0.5).toFixed(2)}s ease-in-out infinite}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:${s}px;width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-eat ${t}s linear infinite}${delays(`.${k} span`, 3, t / 3)}@keyframes ${k}-chomp{0%,100%{clip-path:polygon(50% 50%,100% 30%,100% 0,0 0,0 100%,100% 100%,100% 70%)}50%{clip-path:polygon(50% 50%,100% 50%,100% 0,0 0,0 100%,100% 100%,100% 50%)}}@keyframes ${k}-eat{0%{transform:translateX(${s * 1.5}px);opacity:1}88%{opacity:1}100%{transform:translateX(0);opacity:0}}`,
      };
    },
  },
  {
    id: "segments-bar", name: "Segments", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:3px}.${k} span{width:${s * 0.5}px;height:${w + 4}px;background:${faint(c)};border-radius:2px;animation:${k}-s ${t}s linear infinite}${delays(`.${k} span`, 5, t / 5)}@keyframes ${k}-s{0%,100%{background:${faint(c)}}40%{background:${c}}}`,
    }),
  },
  {
    id: "progress-train", name: "Train", category: "Progress",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 3}px;height:${d}px}.${k} span{position:absolute;top:0;left:0;width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-t ${t}s linear infinite}${delays(`.${k} span`, 3, t / 4)}@keyframes ${k}-t{0%{left:0;opacity:0}10%{opacity:1}90%{opacity:1}100%{left:calc(100% - ${d}px);opacity:0}}`,
      };
    },
  },

  // ── Geometric ──
  {
    id: "star-spin", name: "Star", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "cross-spin", name: "Cross", category: "Geometric",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s linear infinite}.${k}::before,.${k}::after{content:"";position:absolute;background:${c};border-radius:${w / 2}px}.${k}::before{left:calc(50% - ${w}px);top:0;width:${w * 2}px;height:100%}.${k}::after{top:calc(50% - ${w}px);left:0;height:${w * 2}px;width:100%}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },

  // ── 3D ──
  {
    id: "ring-3d", name: "3D Ring", category: "3D",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border:${w}px dashed ${c};border-radius:50%;animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{0%{transform:rotateX(60deg) rotateZ(0)}100%{transform:rotateX(60deg) rotateZ(360deg)}}`,
    }),
  },
  {
    id: "flip-board", name: "Flip Board", category: "3D",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(4, w)}px;perspective:${s * 3}px}.${k} span{width:${s * 0.5}px;height:${s * 0.5}px;background:${c};animation:${k}-f ${t}s ease-in-out infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-f{0%,70%,100%{transform:rotateX(0)}35%{transform:rotateX(360deg)}}`,
    }),
  },

  // ── Gooey ──
  {
    id: "gooey-line", name: "Gooey Line", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.34;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/></filter></defs></svg><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 1.6}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-m ${t}s ease-in-out infinite}.${k} span:nth-child(2){animation-delay:${(t / 6).toFixed(2)}s}.${k} span:nth-child(3){animation-delay:${(t / 3).toFixed(2)}s}@keyframes ${k}-m{0%,100%{transform:translateX(-${s * 0.45}px)}50%{transform:translateX(${s * 0.45}px)}}`,
      };
    },
  },

  // ── Skeleton ──
  {
    id: "skeleton-paragraph", name: "Skeleton Paragraph", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln short"></div></div>`,
      css: `.${k}{width:${s * 2.8}px;display:flex;flex-direction:column;gap:${s * 0.14}px}.${k} .ln{height:${s * 0.15}px;border-radius:4px;background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}.${k} .ln.short{width:45%}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },

  // ── Misc ──
  {
    id: "hourglass", name: "Hourglass", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:0;height:0;border:${s / 2}px solid ${c};border-color:${c} transparent;animation:${k}-h ${t}s ease-in-out infinite}@keyframes ${k}-h{0%{transform:rotate(0)}50%{transform:rotate(180deg)}100%{transform:rotate(180deg)}}`,
    }),
  },
  {
    id: "ping-pong", name: "Ping Pong", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const d = Math.max(6, s / 4);
      return {
        html: `<div class="${k}"><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 1.6}px;height:${s}px}.${k}::before,.${k}::after{content:"";position:absolute;top:20%;width:${w}px;height:60%;background:${c};border-radius:${w}px}.${k}::before{left:0}.${k}::after{right:0}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-p ${t}s ease-in-out infinite alternate}@keyframes ${k}-p{0%{left:${w + 2}px}100%{left:calc(100% - ${w + 2}px - ${d}px)}}`,
      };
    },
  },

  // ════════════ BATCH 3 — expanded catalog ════════════
  // ── Spinners ──
  {
    id: "petal-spin", name: "Petal Spin", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => {
      let extra = "";
      for (let i = 0; i < 8; i++) extra += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 45}deg)}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(8)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s linear infinite}.${k} span{position:absolute;top:0;left:calc(50% - ${s / 14}px);width:${s / 7}px;height:${s / 3}px;background:${c};opacity:.8;border-radius:50%;transform-origin:${s / 14}px ${s / 2}px}${extra}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },
  {
    id: "dual-arc-2", name: "Counter Arcs", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k}::before,.${k}::after{content:"";position:absolute;inset:0;border-radius:50%;border:${w}px solid transparent}.${k}::before{border-top-color:${c};border-left-color:${c};animation:${k}-r ${t}s linear infinite}.${k}::after{border-bottom-color:${c};border-right-color:${c};animation:${k}-r ${t}s linear infinite reverse}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "ios-spinner", name: "iOS Spinner", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      let extra = "";
      for (let i = 0; i < 12; i++) extra += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 30}deg);animation-delay:${((i * t) / 12).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(12)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:0;left:calc(50% - ${w / 2}px);width:${w}px;height:${s * 0.28}px;background:${c};border-radius:${w}px;transform-origin:${w / 2}px ${s / 2}px;animation:${k}-f ${t}s linear infinite}${extra}@keyframes ${k}-f{0%,100%{opacity:1}50%{opacity:.12}}`,
      };
    },
  },
  {
    id: "wedge-spin", name: "Wedge", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(${c} 0 90deg,${faint(c)} 0);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },

  // ── Dots ──
  {
    id: "dots-circle", name: "Circle Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 7);
      let pos = "", del = "";
      for (let i = 0; i < 8; i++) {
        pos += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 45}deg)}`;
        del += `.${k} span:nth-child(${i + 1})::before{animation-delay:${((i * t) / 8).toFixed(2)}s}`;
      }
      return {
        html: `<div class="${k}">${"<span></span>".repeat(8)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:0;left:calc(50% - ${d / 2}px);width:${d}px;height:${s / 2}px;transform-origin:${d / 2}px ${s / 2}px}.${k} span::before{content:"";display:block;width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-s ${t}s ease-in-out infinite}${pos}${del}@keyframes ${k}-s{0%,100%{transform:scale(.3)}50%{transform:scale(1)}}`,
      };
    },
  },
  {
    id: "dots-square", name: "Corner Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-p ${t}s ease-in-out infinite}.${k} span:nth-child(1){top:0;left:0}.${k} span:nth-child(2){top:0;right:0;animation-delay:${(t / 4).toFixed(2)}s}.${k} span:nth-child(3){bottom:0;right:0;animation-delay:${(t / 2).toFixed(2)}s}.${k} span:nth-child(4){bottom:0;left:0;animation-delay:${((3 * t) / 4).toFixed(2)}s}@keyframes ${k}-p{0%,100%{transform:scale(.4);opacity:.4}50%{transform:scale(1);opacity:1}}`,
      };
    },
  },
  {
    id: "dots-blink", name: "Blink Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;gap:${d / 2}px}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:50%;opacity:0;animation:${k}-b ${t}s linear infinite}${delays(`.${k} span`, 3, t / 4)}@keyframes ${k}-b{0%{opacity:0}25%{opacity:1}60%,100%{opacity:0}}`,
      };
    },
  },

  // ── Bars ──
  {
    id: "bars-bounce", name: "Bouncing Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;height:${s}px;align-items:center}.${k} span{width:${Math.max(3, w * 1.4)}px;height:${s * 0.5}px;background:${c};border-radius:${w}px;animation:${k}-b ${t}s ease-in-out infinite}${delays(`.${k} span`, 4, t / 8)}@keyframes ${k}-b{0%,100%{transform:translateY(${s * 0.18}px)}50%{transform:translateY(-${s * 0.18}px)}}`,
    }),
  },
  {
    id: "squares-grid", name: "Square Grid", category: "Bars",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(4, s / 6);
      let extra = "";
      for (let i = 0; i < 9; i++) extra += `.${k} span:nth-child(${i + 1}){animation-delay:${((((i % 3) + Math.floor(i / 3)) * t) / 8).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(9)}</div>`,
        css: `.${k}{display:grid;grid-template-columns:repeat(3,${d}px);gap:${d / 2}px}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:2px;animation:${k}-p ${t}s ease-in-out infinite}${extra}@keyframes ${k}-p{0%,100%{transform:scale(.4);opacity:.3}50%{transform:scale(1);opacity:1}}`,
      };
    },
  },

  // ── Wave ──
  {
    id: "wave-pulse-bars", name: "Pulse Wave", category: "Wave",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const bw = Math.max(2, w - 1);
      return {
        html: `<div class="${k}">${"<span></span>".repeat(6)}</div>`,
        css: `.${k}{display:inline-flex;gap:${bw}px;align-items:flex-end;height:${s}px}.${k} span{width:${bw}px;height:100%;background:${c};border-radius:${w}px;transform-origin:bottom;animation:${k}-w ${t}s ease-in-out infinite}${delays(`.${k} span`, 6, t / 12)}@keyframes ${k}-w{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}`,
      };
    },
  },
  {
    id: "blob-wave", name: "Water Blob", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};border-radius:50%;animation:${k}-w ${(t * 1.5).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-w{0%,100%{border-radius:50% 50% 50% 50%}33%{border-radius:60% 40% 55% 45%}66%{border-radius:40% 60% 45% 55%}}`,
    }),
  },
  {
    id: "sonar", name: "Sonar", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;inset:0;background:${c};border-radius:50%;opacity:.7;animation:${k}-s ${t}s ease-out infinite}.${k} span:nth-child(2){animation-delay:${(t / 3).toFixed(2)}s}.${k} span:nth-child(3){animation-delay:${((2 * t) / 3).toFixed(2)}s}@keyframes ${k}-s{0%{transform:scale(.1);opacity:.7}100%{transform:scale(1);opacity:0}}`,
    }),
  },

  // ── Progress ──
  {
    id: "progress-checker", name: "Checker Bar", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 3}px;height:${w + 6}px;border-radius:${w}px;background:repeating-linear-gradient(90deg,${c} 0 ${w * 2}px,${faint(c)} ${w * 2}px ${w * 4}px);background-size:${w * 4}px 100%;animation:${k}-c ${t}s linear infinite}@keyframes ${k}-c{to{background-position:${w * 4}px 0}}`,
    }),
  },
  {
    id: "progress-orbit", name: "Orbit Track", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;border:${w}px solid ${faint(c)};border-radius:50%}.${k}::after{content:"";position:absolute;top:-${w}px;left:calc(50% - ${w}px);width:${w * 2}px;height:${w * 2}px;background:${c};border-radius:50%;transform-origin:${w}px ${s / 2 + w}px;animation:${k}-o ${t}s linear infinite}@keyframes ${k}-o{to{transform:rotate(360deg)}}`,
    }),
  },

  // ── Geometric ──
  {
    id: "triangle-bounce", name: "Bouncing Triangle", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:0;height:0;border-left:${s / 2}px solid transparent;border-right:${s / 2}px solid transparent;border-bottom:${s}px solid ${c};animation:${k}-b ${t}s ease-in-out infinite}@keyframes ${k}-b{0%,100%{transform:translateY(0)}50%{transform:translateY(-${s * 0.4}px)}}`,
    }),
  },
  {
    id: "hexagon-pulse", name: "Hexagon Pulse", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);animation:${k}-p ${t}s ease-in-out infinite}@keyframes ${k}-p{0%,100%{transform:scale(.6);opacity:.6}50%{transform:scale(1);opacity:1}}`,
    }),
  },
  {
    id: "pinwheel", name: "Pinwheel", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(${c} 0 25%,${faint(c)} 0 50%,${c} 0 75%,${faint(c)} 0);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "kite-spin", name: "Kite", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};clip-path:polygon(50% 0,100% 40%,50% 100%,0 40%);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },

  // ── 3D ──
  {
    id: "cube-axis", name: "Tumbling Cube", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 0.8}px;height:${s * 0.8}px;background:${c};animation:${k}-r ${(t * 2).toFixed(2)}s linear infinite}@keyframes ${k}-r{0%{transform:perspective(220px) rotateX(0) rotateY(0)}50%{transform:perspective(220px) rotateX(180deg) rotateY(90deg)}100%{transform:perspective(220px) rotateX(360deg) rotateY(180deg)}}`,
    }),
  },

  // ── Gooey ──
  {
    id: "gooey-vertical", name: "Gooey Vertical", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.4;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/></filter></defs></svg><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s * 1.6}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-m ${t}s ease-in-out infinite}.${k} span:last-child{animation-delay:-${(t / 2).toFixed(2)}s}@keyframes ${k}-m{0%,100%{transform:translateY(-${s * 0.4}px)}50%{transform:translateY(${s * 0.4}px)}}`,
      };
    },
  },
  {
    id: "blob-pulse", name: "Gooey Pulse", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.5;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"/></filter></defs></svg><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} span:nth-child(2){animation:${k}-a ${t}s ease-in-out infinite}.${k} span:nth-child(3){animation:${k}-b ${t}s ease-in-out infinite}@keyframes ${k}-a{0%,100%{transform:scale(1)}50%{transform:translateX(-${s * 0.3}px) scale(.7)}}@keyframes ${k}-b{0%,100%{transform:scale(1)}50%{transform:translateX(${s * 0.3}px) scale(.7)}}`,
      };
    },
  },

  // ── Skeleton ──
  {
    id: "skeleton-stats", name: "Skeleton Stats", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="b"></div><div class="b"></div><div class="b"></div></div>`,
      css: `.${k}{display:flex;gap:${s * 0.2}px}.${k} .b{width:${s * 0.8}px;height:${s * 0.9}px;border-radius:8px;background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },
  {
    id: "skeleton-feed", name: "Skeleton Feed", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="row"><div class="av"></div><div class="col"><div class="ln"></div><div class="ln short"></div></div></div><div class="row"><div class="av"></div><div class="col"><div class="ln"></div><div class="ln short"></div></div></div></div>`,
      css: `.${k}{display:flex;flex-direction:column;gap:${s * 0.2}px;width:${s * 2.8}px}.${k} .row{display:flex;align-items:center;gap:${s * 0.2}px}.${k} .av{width:${s * 0.6}px;height:${s * 0.6}px;border-radius:50%;flex:none}.${k} .col{flex:1;display:flex;flex-direction:column;gap:${s * 0.12}px}.${k} .ln{height:${s * 0.14}px;border-radius:4px}.${k} .ln.short{width:50%}.${k} .av,.${k} .ln{background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },

  // ── Misc ──
  {
    id: "radar-sweep", name: "Radar", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;border-radius:50%;border:2px solid ${faint(c)};overflow:hidden}.${k}::after{content:"";position:absolute;inset:0;background:conic-gradient(${c},#0000 25%);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "propeller", name: "Propeller", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${Math.max(4, w + 1)}px;background:${c};border-radius:${w}px;animation:${k}-r ${(t * 0.6).toFixed(2)}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "sun-rays", name: "Sun Rays", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:repeating-conic-gradient(${c} 0 10deg,#0000 10deg 30deg);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "eclipse", name: "Eclipse", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:${c};animation:${k}-e ${t}s ease-in-out infinite}@keyframes ${k}-e{0%,100%{box-shadow:inset ${s * 0.5}px 0 0 0 rgba(0,0,0,.45)}50%{box-shadow:inset -${s * 0.5}px 0 0 0 rgba(0,0,0,.45)}}`,
    }),
  },

  // ════════════ BATCH 4 — expanded catalog ════════════
  // ── Spinners ──
  {
    id: "spinner-grow", name: "Growing Spinner", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><div class="r"></div></div>`,
      css: `.${k}{width:${s}px;height:${s}px;animation:${k}-g ${(t * 1.6).toFixed(2)}s ease-in-out infinite}.${k} .r{width:100%;height:100%;border:${w}px solid ${faint(c)};border-top-color:${c};border-radius:50%;animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}@keyframes ${k}-g{0%,100%{transform:scale(.7)}50%{transform:scale(1)}}`,
    }),
  },
  {
    id: "half-spin", name: "Half Disc", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s / 2}px;background:${c};border-radius:${s}px ${s}px 0 0;transform-origin:bottom center;animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "ring-segment", name: "Segment Ring", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(${c} 270deg,#0000 0);-webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - ${w}px),#000 0);mask:radial-gradient(farthest-side,#0000 calc(100% - ${w}px),#000 0);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "barbell-spin", name: "Barbell", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const d = Math.max(7, s / 3.2);
      return {
        html: `<div class="${k}"><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s linear infinite}.${k}::before{content:"";position:absolute;top:calc(50% - ${w / 2}px);left:10%;width:80%;height:${w}px;background:${faint(c)};border-radius:${w}px}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} span:nth-child(1){left:0}.${k} span:nth-child(2){right:0}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },

  // ── Dots ──
  {
    id: "tri-dot-orbit", name: "Triangle Orbit", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s linear infinite}.${k} span{position:absolute;top:0;left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;transform-origin:${d / 2}px ${s / 2}px}.${k} span:nth-child(1){transform:rotate(0)}.${k} span:nth-child(2){transform:rotate(120deg)}.${k} span:nth-child(3){transform:rotate(240deg)}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },
  {
    id: "dots-converge", name: "Converge", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${d}px}.${k} span{position:absolute;top:0;width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} span:nth-child(1){left:0;animation:${k}-l ${t}s ease-in-out infinite}.${k} span:nth-child(2){left:calc(50% - ${d / 2}px);animation:${k}-m ${t}s ease-in-out infinite}.${k} span:nth-child(3){right:0;animation:${k}-rt ${t}s ease-in-out infinite}@keyframes ${k}-l{0%,100%{transform:translateX(0)}50%{transform:translateX(${s * 0.4}px)}}@keyframes ${k}-rt{0%,100%{transform:translateX(0)}50%{transform:translateX(-${s * 0.4}px)}}@keyframes ${k}-m{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}`,
      };
    },
  },
  {
    id: "dots-wave-scale", name: "Scale Wave", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 6);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;gap:${d / 2}px;align-items:center}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-s ${t}s ease-in-out infinite}${delays(`.${k} span`, 5, t / 10)}@keyframes ${k}-s{0%,100%{transform:scale(.4)}50%{transform:scale(1)}}`,
      };
    },
  },

  // ── Bars ──
  {
    id: "bars-rows", name: "Loading Lines", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{display:flex;flex-direction:column;gap:${Math.max(3, w)}px;width:${s * 2}px}.${k} span{height:${Math.max(3, w)}px;background:${c};border-radius:${w}px;transform-origin:left;animation:${k}-x ${t}s ease-in-out infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-x{0%,100%{transform:scaleX(.3)}50%{transform:scaleX(1)}}`,
    }),
  },
  {
    id: "bars-stretch", name: "Stretch Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;height:${s}px;align-items:center}.${k} span{width:${Math.max(3, w)}px;height:${s * 0.4}px;background:${c};border-radius:${w}px;animation:${k}-st ${t}s ease-in-out infinite}${delays(`.${k} span`, 5, t / 10)}@keyframes ${k}-st{0%,100%{height:${s * 0.3}px}50%{height:${s}px}}`,
    }),
  },
  {
    id: "bars-zoom", name: "Zoom Squares", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;align-items:center;height:${s}px}.${k} span{width:${s / 5}px;height:${s / 5}px;background:${c};border-radius:2px;animation:${k}-z ${t}s ease-in-out infinite}${delays(`.${k} span`, 4, t / 8)}@keyframes ${k}-z{0%,100%{transform:scale(.4)}50%{transform:scale(1)}}`,
    }),
  },

  // ── Wave ──
  {
    id: "wave-line-dots", name: "Line Wave", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 7);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;gap:${d / 2}px;align-items:center}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-w ${t}s ease-in-out infinite}${delays(`.${k} span`, 6, t / 12)}@keyframes ${k}-w{0%,100%{transform:translateY(${s * 0.2}px)}50%{transform:translateY(-${s * 0.2}px)}}`,
      };
    },
  },
  {
    id: "drip", name: "Drip", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(8, s / 3);
      return {
        html: `<div class="${k}"><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:0;left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50% 50% 50% 50%;animation:${k}-d ${t}s ease-in infinite}@keyframes ${k}-d{0%{top:0;border-radius:50% 50% 30% 30%}80%{top:calc(100% - ${d}px);opacity:1;border-radius:50%}100%{top:calc(100% - ${d}px);opacity:0;transform:scaleY(.5)}}`,
      };
    },
  },

  // ── Progress ──
  {
    id: "progress-fill", name: "Bar Fill", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 3}px;height:${w + 4}px;background:${faint(c)};border-radius:${w}px;overflow:hidden}.${k}::before{content:"";display:block;height:100%;width:0;background:${c};border-radius:${w}px;animation:${k}-f ${t}s ease-in-out infinite}@keyframes ${k}-f{0%{width:0}70%{width:100%}100%{width:100%;opacity:.4}}`,
    }),
  },
  {
    id: "progress-knight", name: "Knight Rider", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s * 3}px;height:${w + 2}px;background:${faint(c)};border-radius:${w}px;overflow:hidden}.${k}::before{content:"";position:absolute;top:0;left:0;height:100%;width:30%;background:${c};border-radius:${w}px;animation:${k}-b ${t}s ease-in-out infinite alternate}@keyframes ${k}-b{0%{left:0}100%{left:70%}}`,
    }),
  },
  {
    id: "tick-ring", name: "Tick Ring", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      let extra = "";
      for (let i = 0; i < 8; i++) extra += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 45}deg);animation-delay:${((i * t) / 8).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(8)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:0;left:calc(50% - ${w / 2}px);width:${w}px;height:${s * 0.22}px;background:${c};border-radius:${w}px;transform-origin:${w / 2}px ${s / 2}px;opacity:.25;animation:${k}-t ${t}s linear infinite}${extra}@keyframes ${k}-t{0%,100%{opacity:.25}10%{opacity:1}}`,
      };
    },
  },

  // ── Geometric ──
  {
    id: "diamond-spin", name: "Diamond Spin", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "trapezoid-pulse", name: "Trapezoid", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s * 0.7}px;background:${c};clip-path:polygon(20% 0,80% 0,100% 100%,0 100%);animation:${k}-p ${t}s ease-in-out infinite}@keyframes ${k}-p{0%,100%{transform:scale(.7);opacity:.7}50%{transform:scale(1);opacity:1}}`,
    }),
  },
  {
    id: "heptagon-spin", name: "Heptagon", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};clip-path:polygon(50% 0%,90% 20%,100% 60%,75% 100%,25% 100%,0% 60%,10% 20%);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },

  // ── 3D ──
  {
    id: "ring-flip-3d", name: "Flipping Ring", category: "3D",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border:${w}px solid ${c};border-radius:50%;animation:${k}-f ${t}s linear infinite}@keyframes ${k}-f{to{transform:perspective(240px) rotateX(360deg)}}`,
    }),
  },
  {
    id: "cylinder-3d", name: "Cylinder", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 0.55}px;height:${s}px;background:linear-gradient(90deg,${c}44,${c},${c}44);border-radius:3px;animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotateY(360deg)}}`,
    }),
  },

  // ── Gooey ──
  {
    id: "gooey-three", name: "Gooey Pulse 3", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.34;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/></filter></defs></svg><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 1.8}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-s ${t}s ease-in-out infinite}.${k} span:nth-child(2){left:0}.${k} span:nth-child(3){left:calc(50% - ${d / 2}px);animation-delay:${(t / 6).toFixed(2)}s}.${k} span:nth-child(4){right:0;animation-delay:${(t / 3).toFixed(2)}s}@keyframes ${k}-s{0%,100%{transform:scale(.6)}50%{transform:scale(1.25)}}`,
      };
    },
  },
  {
    id: "gooey-bounce", name: "Gooey Bounce", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.4;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/></filter></defs></svg><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 1.4}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-b ${t}s ease-in-out infinite}.${k} span:nth-child(2){left:22%}.${k} span:nth-child(3){right:22%;animation-delay:-${(t / 2).toFixed(2)}s}@keyframes ${k}-b{0%,100%{transform:translateY(-${s * 0.25}px)}50%{transform:translateY(${s * 0.25}px)}}`,
      };
    },
  },

  // ── Skeleton ──
  {
    id: "skeleton-grid", name: "Skeleton Grid", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="b"></div><div class="b"></div><div class="b"></div><div class="b"></div></div>`,
      css: `.${k}{display:grid;grid-template-columns:1fr 1fr;gap:${s * 0.15}px;width:${s * 2.2}px}.${k} .b{height:${s * 0.9}px;border-radius:6px;background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },
  {
    id: "skeleton-title", name: "Skeleton Title", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="t"></div><div class="ln"></div><div class="ln short"></div></div>`,
      css: `.${k}{display:flex;flex-direction:column;gap:${s * 0.14}px;width:${s * 2.6}px}.${k} .t{height:${s * 0.24}px;width:60%;border-radius:5px}.${k} .ln{height:${s * 0.14}px;border-radius:4px}.${k} .ln.short{width:45%}.${k} .t,.${k} .ln{background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },

  // ── Misc ──
  {
    id: "atom", name: "Atom", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const d = Math.max(5, s / 6);
      return {
        html: `<div class="${k}"><i></i><i></i><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} i{position:absolute;inset:0;border:${Math.max(1, w - 2)}px solid ${faint(c)};border-radius:50%}.${k} i:nth-child(1){animation:${k}-a ${t}s linear infinite}.${k} i:nth-child(2){animation:${k}-b ${(t * 1.2).toFixed(2)}s linear infinite}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}@keyframes ${k}-a{from{transform:rotate(0) scaleX(.4)}to{transform:rotate(360deg) scaleX(.4)}}@keyframes ${k}-b{from{transform:rotate(0) scaleY(.4)}to{transform:rotate(360deg) scaleY(.4)}}`,
      };
    },
  },
  {
    id: "metronome", name: "Metronome", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${Math.max(4, w)}px;height:${s}px;background:${c};border-radius:${w}px;transform-origin:bottom center;animation:${k}-m ${t}s ease-in-out infinite}@keyframes ${k}-m{0%{transform:rotate(-30deg)}50%{transform:rotate(30deg)}100%{transform:rotate(-30deg)}}`,
    }),
  },

  // ════════════ BATCH 5 ════════════
  // ── Spinners ──
  {
    id: "chase-ring", name: "Chase Ring", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const d = Math.max(5, w * 2);
      return {
        html: `<div class="${k}"></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;border:${w}px solid ${faint(c)};border-radius:50%}.${k}::after{content:"";position:absolute;top:-${w}px;left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;transform-origin:${d / 2}px ${s / 2 + w}px;animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },
  {
    id: "arc-trail", name: "Arc Trail", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;border:${w}px solid transparent;border-top-color:${c};border-right-color:${c}66;border-bottom-color:${c}33;animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "neon-ring", name: "Neon Ring", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border:${w}px solid transparent;border-top-color:${c};border-radius:50%;filter:drop-shadow(0 0 ${w * 2}px ${c});animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "sector-sweep", name: "Sector Sweep", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(${c} 0 60deg,${faint(c)} 0);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "squircle-spin", name: "Squircle", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border:${w}px solid ${faint(c)};border-top-color:${c};border-radius:30%;animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },

  // ── Dots ──
  {
    id: "dots-morph", name: "Morph Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;gap:${d / 2}px}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-m ${t}s ease-in-out infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-m{0%,100%{border-radius:50%;transform:scale(1)}50%{border-radius:25%;transform:scale(.85)}}`,
      };
    },
  },
  {
    id: "dot-pendulum", name: "Pendulum Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(8, s / 3.5);
      return {
        html: `<div class="${k}"><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 1.2}px;height:${d}px}.${k} span{position:absolute;top:0;width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} span:nth-child(1){left:0;animation:${k}-la ${t}s cubic-bezier(.7,0,.3,1) infinite alternate}.${k} span:nth-child(2){right:0;animation:${k}-ra ${t}s cubic-bezier(.7,0,.3,1) infinite alternate}@keyframes ${k}-la{to{transform:translateX(${s * 0.5}px)}}@keyframes ${k}-ra{to{transform:translateX(-${s * 0.5}px)}}`,
      };
    },
  },
  {
    id: "five-dots-ring", name: "Five Ring Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 6);
      let rules = "";
      for (let i = 0; i < 5; i++) rules += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 72}deg);animation-delay:${((i * t) / 5).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(5)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:0;left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;transform-origin:${d / 2}px ${s / 2}px;animation:${k}-f ${t}s linear infinite}${rules}@keyframes ${k}-f{0%,100%{opacity:1}50%{opacity:.1}}`,
      };
    },
  },

  // ── Bars ──
  {
    id: "bars-cascade", name: "Cascade Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(2, w - 1)}px;align-items:flex-end;height:${s}px}.${k} span{width:${Math.max(2, w - 1)}px;background:${c};transform-origin:bottom;animation:${k}-c ${t}s ease-in-out infinite}.${k} span:nth-child(1){height:16%}.${k} span:nth-child(2){height:32%}.${k} span:nth-child(3){height:48%}.${k} span:nth-child(4){height:64%}.${k} span:nth-child(5){height:80%}.${k} span:nth-child(6){height:100%}${delays(`.${k} span`, 6, t / 12)}@keyframes ${k}-c{0%,100%{opacity:.3}50%{opacity:1}}`,
    }),
  },
  {
    id: "bars-piano", name: "Piano Keys", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;align-items:flex-end;height:${s}px}.${k} span{width:${Math.max(4, w + 1)}px;height:100%;background:${c};transform-origin:bottom;animation:${k}-p ${t}s cubic-bezier(.3,1.5,.5,1) infinite}${delays(`.${k} span`, 5, t / 5)}@keyframes ${k}-p{0%,100%{transform:scaleY(1)}40%{transform:scaleY(.2)}}`,
    }),
  },
  {
    id: "bars-chat", name: "Chat Bubbles", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const bw = Math.max(4, w + 1);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;gap:${bw / 2}px;align-items:center}.${k} span{width:${bw}px;height:${bw}px;background:${c};border-radius:50%;animation:${k}-b ${t}s ease-in-out infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-b{0%,80%,100%{transform:scale(1)}40%{transform:scale(1.4)}}`,
      };
    },
  },

  // ── Wave ──
  {
    id: "sine-wave", name: "Sine Wave", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 6);
      return {
        html: `<div class="${k}">${"<span></span>".repeat(8)}</div>`,
        css: `.${k}{display:inline-flex;gap:${d / 3}px;align-items:center;height:${s}px}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-s ${t}s ease-in-out infinite}${delays(`.${k} span`, 8, t / 16)}@keyframes ${k}-s{0%,100%{transform:translateY(${s * 0.3}px)}50%{transform:translateY(-${s * 0.3}px)}}`,
      };
    },
  },
  {
    id: "zigzag-wave", name: "Zigzag", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 6);
      return {
        html: `<div class="${k}">${"<span></span>".repeat(6)}</div>`,
        css: `.${k}{display:inline-flex;gap:${d / 4}px;align-items:center;height:${s}px}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:2px;animation:${k}-z ${t}s ease-in-out infinite}.${k} span:nth-child(odd){animation-delay:0s}.${k} span:nth-child(even){animation-delay:${(t / 2).toFixed(2)}s}@keyframes ${k}-z{0%,100%{transform:translateY(-${s * 0.25}px)}50%{transform:translateY(${s * 0.25}px)}}`,
      };
    },
  },
  {
    id: "ocean-wave", name: "Ocean Wave", category: "Wave",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 2}px;height:${s}px;border-radius:50%;border:${w}px solid ${c};transform-origin:center;animation:${k}-w ${t}s ease-in-out infinite}@keyframes ${k}-w{0%,100%{transform:scaleX(1) scaleY(.4)}50%{transform:scaleX(.4) scaleY(1)}}`,
    }),
  },

  // ── Progress ──
  {
    id: "progress-marquee", name: "Marquee Bar", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s * 3}px;height:${w + 4}px;background:${faint(c)};border-radius:${w}px;overflow:hidden}.${k}::before{content:"";position:absolute;top:0;left:-60%;width:60%;height:100%;background:linear-gradient(90deg,transparent,${c},transparent);border-radius:${w}px;animation:${k}-m ${t}s ease-in-out infinite}@keyframes ${k}-m{0%{left:-60%}100%{left:100%}}`,
    }),
  },
  {
    id: "progress-step", name: "Step Progress", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:4px}.${k} span{width:${s * 0.5}px;height:${w + 4}px;background:${faint(c)};border-radius:2px;animation:${k}-s ${t}s steps(1) infinite}${delays(`.${k} span`, 4, t / 4)}@keyframes ${k}-s{0%,75%,100%{background:${faint(c)}}25%{background:${c}}}`,
    }),
  },

  // ── Geometric ──
  {
    id: "arrow-spin", name: "Spinning Arrow", category: "Geometric",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s linear infinite}.${k}::before,.${k}::after{content:"";position:absolute;border-color:${c};border-style:solid;border-width:0}.${k}::before{top:0;left:20%;width:60%;height:60%;border-top-width:${w}px;border-right-width:${w}px}.${k}::after{top:0;right:20%;width:60%;height:60%;border-bottom-width:${w}px;border-left-width:${w}px;top:40%}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "pacman-geo", name: "Spinning Pacman", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:${c};animation:${k}-c ${(t * 0.4).toFixed(2)}s ease-in-out infinite,${k}-r ${t}s linear infinite}@keyframes ${k}-c{0%,100%{clip-path:polygon(50% 50%,100% 30%,100% 0,0 0,0 100%,100% 100%,100% 70%)}50%{clip-path:polygon(50% 50%,100% 50%,100% 0,0 0,0 100%,100% 100%,100% 50%)}}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "rhombus-spin", name: "Rhombus", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 0.7}px;height:${s * 0.7}px;background:${c};animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg) skewX(15deg)}}`,
    }),
  },
  {
    id: "squares-orbit", name: "Orbiting Squares", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 5);
      return {
        html: `<div class="${k}"><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s linear infinite}.${k} span{position:absolute;width:${d}px;height:${d}px;background:${c};border-radius:2px}.${k} span:nth-child(1){top:0;left:calc(50% - ${d / 2}px)}.${k} span:nth-child(2){bottom:0;right:calc(50% - ${d / 2}px)}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },

  // ── 3D ──
  {
    id: "cube-explode", name: "Exploding Cube", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => {
      const q = s * 0.45;
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;perspective:${s * 4}px}.${k} span{position:absolute;width:${q}px;height:${q}px;background:${c};animation:${k}-e ${(t * 2).toFixed(2)}s ease-in-out infinite}.${k} span:nth-child(1){top:0;left:0;animation-delay:0s}.${k} span:nth-child(2){top:0;right:0;animation-delay:${(t * 0.25).toFixed(2)}s}.${k} span:nth-child(3){bottom:0;right:0;animation-delay:${(t * 0.5).toFixed(2)}s}.${k} span:nth-child(4){bottom:0;left:0;animation-delay:${(t * 0.75).toFixed(2)}s}@keyframes ${k}-e{0%,100%{transform:scale(1) rotateY(0);opacity:1}50%{transform:scale(1.3) rotateY(180deg);opacity:.6}}`,
      };
    },
  },
  {
    id: "sphere-3d", name: "Sphere", category: "3D",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;border:${w}px solid ${faint(c)};box-shadow:inset 0 0 ${w * 2}px ${c};animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotateY(360deg)}}`,
    }),
  },
  {
    id: "pyramid-spin", name: "Pyramid", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:0;height:0;border-left:${s / 2}px solid transparent;border-right:${s / 2}px solid transparent;border-bottom:${s}px solid ${c};transform-origin:50% 66%;animation:${k}-r ${(t * 1.4).toFixed(2)}s linear infinite}@keyframes ${k}-r{to{transform:rotateX(360deg)}}`,
    }),
  },

  // ── Gooey ──
  {
    id: "gooey-snake", name: "Gooey Snake", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.3;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/></filter></defs></svg><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 2}px;height:${d}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:0;width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-s ${t}s linear infinite}${delays(`.${k} span`, 4, t / 5)}@keyframes ${k}-s{0%{left:-${d}px;opacity:0}10%{opacity:1}90%{opacity:1}100%{left:calc(100% + ${d}px);opacity:0}}`,
      };
    },
  },
  {
    id: "gooey-split", name: "Gooey Split", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.55;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"/></filter></defs></svg><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 2}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;left:calc(50% - ${d / 2}px);animation:${k}-sp ${t}s ease-in-out infinite}.${k} span:nth-child(2){animation-direction:reverse}@keyframes ${k}-sp{0%,100%{transform:translateX(0)}50%{transform:translateX(${s * 0.4}px)}}`,
      };
    },
  },

  // ── Skeleton ──
  {
    id: "skeleton-nav", name: "Skeleton Nav", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="logo"></div><div class="links"><div class="l"></div><div class="l"></div><div class="l"></div></div></div>`,
      css: `.${k}{display:flex;align-items:center;gap:${s * 0.3}px;width:${s * 3}px}.${k} .logo{width:${s * 0.7}px;height:${s * 0.5}px;border-radius:6px;flex:none}.${k} .links{flex:1;display:flex;gap:${s * 0.2}px}.${k} .l{height:${s * 0.3}px;flex:1;border-radius:4px}.${k} .logo,.${k} .l{background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },
  {
    id: "skeleton-table", name: "Skeleton Table", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="row h"><div class="c"></div><div class="c"></div><div class="c"></div></div><div class="row"><div class="c"></div><div class="c"></div><div class="c"></div></div><div class="row"><div class="c"></div><div class="c"></div><div class="c"></div></div></div>`,
      css: `.${k}{width:${s * 3}px;display:flex;flex-direction:column;gap:4px}.${k} .row{display:flex;gap:4px}.${k} .c{flex:1;height:${s * 0.26}px;border-radius:3px}.${k} .h .c{height:${s * 0.32}px}.${k} .c{background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },
  {
    id: "skeleton-button", name: "Skeleton Buttons", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="b"></div><div class="b sm"></div></div>`,
      css: `.${k}{display:inline-flex;gap:${s * 0.2}px;align-items:center}.${k} .b{height:${s * 0.55}px;width:${s * 1.4}px;border-radius:${s * 0.28}px;background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}.${k} .b.sm{width:${s * 0.8}px}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },

  // ── Misc ──
  {
    id: "wifi-signal", name: "WiFi Signal", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const d = Math.max(4, w - 1);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s * 0.7}px}.${k} span{position:absolute;bottom:0;left:50%;border:${d}px solid transparent;border-top-color:${c};border-radius:50%;transform:translateX(-50%)}.${k} span:nth-child(1){width:${d * 3}px;height:${d * 3}px;margin-left:-${d / 2}px;border-radius:50%;background:${c};border:none}.${k} span:nth-child(2){width:${s * 0.35}px;height:${s * 0.35}px}.${k} span:nth-child(3){width:${s * 0.6}px;height:${s * 0.6}px}.${k} span:nth-child(4){width:${s * 0.9}px;height:${s * 0.9}px}.${k} span:nth-child(1),.${k} span:nth-child(2),.${k} span:nth-child(3),.${k} span:nth-child(4){animation:${k}-f ${t}s ease-in-out infinite}${delays(`.${k} span`, 4, t / 8)}@keyframes ${k}-f{0%,100%{opacity:.25}50%{opacity:1}}`,
      };
    },
  },
  {
    id: "dna", name: "DNA", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 6);
      let dots = "";
      for (let i = 0; i < 6; i++) dots += `<span data-i="${i}"></span>`;
      let rules = "";
      for (let i = 0; i < 6; i++) rules += `.${k} span:nth-child(${i + 1}){animation-delay:${((i * t) / 6).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${dots}</div>`,
        css: `.${k}{position:relative;width:${d * 2 + s}px;height:${s}px;display:flex;flex-direction:column;justify-content:space-between}.${k} span{display:block;width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-d ${t}s ease-in-out infinite}${rules}@keyframes ${k}-d{0%,100%{transform:translateX(0)}50%{transform:translateX(${s}px)}}`,
      };
    },
  },
  {
    id: "typing-cursor", name: "Cursor Blink", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${Math.max(3, w - 1)}px;height:${s}px;background:${c};animation:${k}-b ${t}s step-end infinite}@keyframes ${k}-b{0%,100%{opacity:1}50%{opacity:0}}`,
    }),
  },
  {
    id: "firework", name: "Firework", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(4, s / 7);
      let rules = "";
      for (let i = 0; i < 8; i++) {
        const ang = i * 45;
        const tx = Math.round(Math.cos((ang * Math.PI) / 180) * s * 0.5);
        const ty = Math.round(Math.sin((ang * Math.PI) / 180) * s * 0.5);
        rules += `.${k} span:nth-child(${i + 1}){animation:${k}-f${i} ${t}s ease-out infinite;animation-delay:${((i * t) / 16).toFixed(2)}s}@keyframes ${k}-f${i}{0%{transform:translate(0,0);opacity:1}100%{transform:translate(${tx}px,${ty}px);opacity:0}}`;
      }
      return {
        html: `<div class="${k}">${"<span></span>".repeat(8)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}${rules}`,
      };
    },
  },

  // ════════════ BATCH 6 — trendy / unique ════════════
  // ── Spinners ──
  {
    id: "aurora-ring", name: "Aurora Ring", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(from 0deg,#22d3ee,#a78bfa,#f472b6,#22d3ee);-webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - ${w}px),#000 0);mask:radial-gradient(farthest-side,#0000 calc(100% - ${w}px),#000 0);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "orbit-moon", name: "Orbit Moon", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const d = Math.max(6, s / 5);
      return {
        html: `<div class="${k}"><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;border-radius:50%;border:${w}px solid ${faint(c)}}.${k} span{position:absolute;top:-${d / 2}px;left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;transform-origin:${d / 2}px ${s / 2 + d / 2}px;animation:${k}-o ${t}s linear infinite}@keyframes ${k}-o{to{transform:rotate(360deg)}}`,
      };
    },
  },
  {
    id: "blade-spin", name: "Blades", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:repeating-conic-gradient(${c} 0 30deg,#0000 30deg 120deg);-webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - ${w * 2.4}px),#000 0);mask:radial-gradient(farthest-side,#0000 calc(100% - ${w * 2.4}px),#000 0);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "twin-speed-ring", name: "Twin Speed", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k}::before,.${k}::after{content:"";position:absolute;border-radius:50%;border:${w}px solid transparent}.${k}::before{inset:0;border-top-color:${c};border-right-color:${c};animation:${k}-r ${t}s linear infinite}.${k}::after{inset:${w * 2}px;border-bottom-color:${c};animation:${k}-r ${(t * 0.6).toFixed(2)}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "quad-orbit", name: "Quad Orbit", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 5);
      let f = "";
      for (let i = 0; i < 4; i++) f += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 90}deg)}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(4)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s linear infinite}.${k} span{position:absolute;top:0;left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;transform-origin:${d / 2}px ${s / 2}px}${f}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },

  // ── Dots ──
  {
    id: "dots-chase", name: "Chase Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 5);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:0;left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;transform-origin:${d / 2}px ${s / 2}px;animation:${k}-r ${t}s cubic-bezier(.5,0,.5,1) infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },
  {
    id: "hexa-dots", name: "Hexa Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 6);
      let f = "";
      for (let i = 0; i < 6; i++) f += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 60}deg) translateY(-${(s / 2 - d / 2).toFixed(1)}px)}.${k} span:nth-child(${i + 1})::before{animation-delay:${((i * t) / 6).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(6)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px}.${k} span::before{content:"";display:block;width:100%;height:100%;background:${c};border-radius:50%;animation:${k}-p ${t}s ease-in-out infinite}${f}@keyframes ${k}-p{0%,100%{opacity:.2;transform:scale(.5)}50%{opacity:1;transform:scale(1)}}`,
      };
    },
  },
  {
    id: "dots-squash", name: "Squash Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;gap:${d / 2}px;align-items:flex-end;height:${d * 2}px}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-sq ${t}s ease-in-out infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-sq{0%,100%{transform:translateY(-${d}px) scaleY(1)}50%{transform:translateY(0) scale(1.2,.7)}}`,
      };
    },
  },
  {
    id: "dots-flip", name: "Flip Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(7, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;gap:${d / 2}px}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:3px;animation:${k}-f ${t}s ease-in-out infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-f{0%,100%{transform:perspective(90px) rotateY(0)}50%{transform:perspective(90px) rotateY(180deg)}}`,
      };
    },
  },

  // ── Bars ──
  {
    id: "bars-center", name: "Center Out", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;align-items:center;height:${s}px}.${k} span{width:${Math.max(3, w)}px;height:100%;background:${c};transform-origin:center;animation:${k}-c ${t}s ease-in-out infinite}.${k} span:nth-child(1),.${k} span:nth-child(5){animation-delay:${((t / 5) * 2).toFixed(2)}s}.${k} span:nth-child(2),.${k} span:nth-child(4){animation-delay:${(t / 5).toFixed(2)}s}.${k} span:nth-child(3){animation-delay:0s}@keyframes ${k}-c{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}`,
    }),
  },
  {
    id: "bars-pendulum", name: "Pendulum Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;align-items:flex-end;height:${s}px}.${k} span{width:${Math.max(3, w)}px;height:100%;background:${c};transform-origin:bottom;animation:${k}-pd ${t}s ease-in-out infinite}${delays(`.${k} span`, 4, t / 8)}@keyframes ${k}-pd{0%,100%{transform:rotate(-25deg)}50%{transform:rotate(25deg)}}`,
    }),
  },
  {
    id: "bars-sequence", name: "Fill Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      let dl = "";
      for (let i = 0; i < 5; i++) dl += `.${k} span:nth-child(${i + 1})::after{animation-delay:${((i * t) / 10).toFixed(2)}s}`;
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;align-items:flex-end;height:${s}px}.${k} span{width:${Math.max(3, w)}px;height:100%;background:${faint(c)};border-radius:2px;position:relative;overflow:hidden}.${k} span::after{content:"";position:absolute;bottom:0;left:0;width:100%;height:100%;background:${c};transform:scaleY(0);transform-origin:bottom;animation:${k}-fl ${t}s ease-in-out infinite}${dl}@keyframes ${k}-fl{0%,100%{transform:scaleY(0)}50%{transform:scaleY(1)}}`,
      };
    },
  },
  {
    id: "bars-blocks", name: "Building Blocks", category: "Bars",
    build: ({ size: s, speed: t, color: c }, k) => {
      const u = Math.max(4, s / 5);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{display:flex;flex-direction:column-reverse;gap:2px;height:${s}px;justify-content:flex-start}.${k} span{width:${u * 2}px;height:${u}px;background:${c};border-radius:2px;transform-origin:bottom;animation:${k}-b ${t}s ease-in-out infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-b{0%{transform:scaleY(0);opacity:0}20%,80%{transform:scaleY(1);opacity:1}100%{transform:scaleY(0);opacity:0}}`,
      };
    },
  },

  // ── Wave ──
  {
    id: "wave-orbit", name: "Wavy Ring", category: "Wave",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border:${w}px solid ${c};border-radius:38% 62% 63% 37% / 41% 44% 56% 59%;animation:${k}-w ${t}s linear infinite}@keyframes ${k}-w{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "bounce-balls", name: "Bounce Balls", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 5);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;gap:${d / 2}px;align-items:flex-end;height:${s}px}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-bb ${t}s cubic-bezier(.5,.05,.5,.95) infinite}${delays(`.${k} span`, 4, t / 8)}@keyframes ${k}-bb{0%,100%{transform:translateY(0)}50%{transform:translateY(-${s - d}px)}}`,
      };
    },
  },
  {
    id: "wave-ribbon", name: "Ribbon", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 1.5}px;height:${s * 0.5}px;background:${c};border-radius:50%;animation:${k}-rb ${(t * 1.4).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-rb{0%,100%{border-radius:50%;transform:rotate(0)}33%{border-radius:60% 40% 60% 40%;transform:rotate(8deg)}66%{border-radius:40% 60% 40% 60%;transform:rotate(-8deg)}}`,
    }),
  },

  // ── Progress ──
  {
    id: "progress-converge", name: "Converge Bar", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s * 3}px;height:${w + 4}px;background:${faint(c)};border-radius:${w}px;overflow:hidden}.${k}::before,.${k}::after{content:"";position:absolute;top:0;height:100%;width:50%;background:${c}}.${k}::before{left:0;transform:scaleX(0);transform-origin:left;animation:${k}-cv ${t}s ease-in-out infinite}.${k}::after{right:0;transform:scaleX(0);transform-origin:right;animation:${k}-cv ${t}s ease-in-out infinite}@keyframes ${k}-cv{0%,100%{transform:scaleX(0)}50%{transform:scaleX(1)}}`,
    }),
  },
  {
    id: "progress-comet", name: "Comet Bar", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s * 3}px;height:${w + 4}px;background:${faint(c)};border-radius:${w}px;overflow:hidden}.${k}::before{content:"";position:absolute;top:0;left:-35%;height:100%;width:35%;background:linear-gradient(90deg,#0000,${c});border-radius:${w}px;box-shadow:0 0 ${w * 2}px ${c};animation:${k}-cm ${t}s linear infinite}@keyframes ${k}-cm{0%{left:-35%}100%{left:100%}}`,
    }),
  },
  {
    id: "dots-fill-row", name: "Dot Fill", category: "Progress",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 5);
      return {
        html: `<div class="${k}">${"<span></span>".repeat(5)}</div>`,
        css: `.${k}{display:inline-flex;gap:${d / 2}px}.${k} span{width:${d}px;height:${d}px;background:${faint(c)};border-radius:50%;animation:${k}-fr ${t}s linear infinite}${delays(`.${k} span`, 5, t / 5)}@keyframes ${k}-fr{0%,100%{background:${faint(c)};transform:scale(.8)}30%{background:${c};transform:scale(1.15)}}`,
      };
    },
  },
  {
    id: "donut-spin", name: "Donut", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(${c} 0 140deg,${faint(c)} 140deg);-webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - ${w * 2}px),#000 0);mask:radial-gradient(farthest-side,#0000 calc(100% - ${w * 2}px),#000 0);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },

  // ── Geometric ──
  {
    id: "shape-shift", name: "Shape Shift", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 0.75}px;height:${s * 0.75}px;background:${c};animation:${k}-ss ${(t * 1.6).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-ss{0%,100%{border-radius:0;transform:rotate(0)}33%{border-radius:50%;transform:rotate(120deg)}66%{border-radius:0;transform:rotate(240deg)}}`,
    }),
  },
  {
    id: "diamond-ring", name: "Diamond Ring", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4);
      let f = "";
      for (let i = 0; i < 4; i++) f += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 90}deg) translateY(-${(s / 2 - d / 2).toFixed(1)}px) rotate(45deg)}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(4)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s linear infinite}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c}}${f}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },
  {
    id: "nested-squares", name: "Nested Squares", category: "Geometric",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k}::before,.${k}::after{content:"";position:absolute;border:${w}px solid ${c}}.${k}::before{inset:0;animation:${k}-r ${t}s ease-in-out infinite}.${k}::after{inset:${w * 2.5}px;border-color:${faint(c)};animation:${k}-r ${t}s ease-in-out infinite reverse}@keyframes ${k}-r{to{transform:rotate(180deg)}}`,
    }),
  },
  {
    id: "morph-tri-square", name: "Triangle Morph", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};animation:${k}-m ${(t * 2).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-m{0%,100%{clip-path:polygon(50% 0,100% 100%,0 100%)}50%{clip-path:polygon(0 0,100% 0,100% 100%,0 100%)}}`,
    }),
  },

  // ── 3D ──
  {
    id: "card-flip-stack", name: "Page Flip", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s * 0.7}px;height:${s}px;perspective:${s * 3}px}.${k} span{position:absolute;inset:0;background:${c};border-radius:4px;transform-origin:left center;animation:${k}-fl ${(t * 2).toFixed(2)}s ease-in-out infinite;opacity:.9}${delays(`.${k} span`, 3, t / 3)}@keyframes ${k}-fl{0%,40%{transform:rotateY(0)}60%,100%{transform:rotateY(-160deg)}}`,
    }),
  },
  {
    id: "globe-3d", name: "Globe", category: "3D",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;border-radius:50%;border:${w}px solid ${c}}.${k}::before,.${k}::after{content:"";position:absolute;inset:0;border-radius:50%;border:${Math.max(1, w - 1)}px solid ${c}}.${k}::before{animation:${k}-a ${t}s ease-in-out infinite}.${k}::after{animation:${k}-b ${t}s ease-in-out infinite}@keyframes ${k}-a{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.1)}}@keyframes ${k}-b{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.1)}}`,
    }),
  },
  {
    id: "carousel-3d", name: "Carousel", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(8, s / 3);
      let f = "";
      for (let i = 0; i < 6; i++) f += `.${k} span:nth-child(${i + 1}){animation-delay:${((i * t) / 6).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(6)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${d}px}.${k} span{position:absolute;top:0;left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-c ${t}s ease-in-out infinite}${f}@keyframes ${k}-c{0%{transform:translateX(-${s / 2}px) scale(.4);opacity:.3;z-index:0}50%{transform:translateX(${s / 2}px) scale(1);opacity:1;z-index:1}100%{transform:translateX(-${s / 2}px) scale(.4);opacity:.3;z-index:0}}`,
      };
    },
  },

  // ── Gooey ──
  {
    id: "gooey-square", name: "Gooey Square", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.4;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"/></filter></defs></svg><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-g ${(t * 1.6).toFixed(2)}s ease-in-out infinite}.${k} span:nth-child(2){animation-delay:0s}.${k} span:nth-child(3){animation-delay:${(t * 0.4).toFixed(2)}s}.${k} span:nth-child(4){animation-delay:${(t * 0.8).toFixed(2)}s}.${k} span:nth-child(5){animation-delay:${(t * 1.2).toFixed(2)}s}@keyframes ${k}-g{0%,100%{transform:translate(0,0)}25%{transform:translate(${s * 0.3}px,-${s * 0.3}px)}50%{transform:translate(${s * 0.3}px,${s * 0.3}px)}75%{transform:translate(-${s * 0.3}px,${s * 0.3}px)}}`,
      };
    },
  },
  {
    id: "gooey-wave-row", name: "Gooey Wave", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.34;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/></filter></defs></svg><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 1.6}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-w ${t}s ease-in-out infinite}.${k} span:nth-child(2){left:8%}.${k} span:nth-child(3){left:36%;animation-delay:${(t / 6).toFixed(2)}s}.${k} span:nth-child(4){left:64%;animation-delay:${(t / 3).toFixed(2)}s}.${k} span:nth-child(5){left:88%;animation-delay:${(t / 2).toFixed(2)}s}@keyframes ${k}-w{0%,100%{transform:translateY(-${s * 0.25}px)}50%{transform:translateY(${s * 0.25}px)}}`,
      };
    },
  },

  // ── Skeleton ──
  {
    id: "skeleton-chart", name: "Skeleton Chart", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:flex;align-items:flex-end;gap:${s * 0.12}px;height:${s}px;width:${s * 1.6}px}.${k} span{flex:1;border-radius:3px 3px 0 0;background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}.${k} span:nth-child(1){height:60%}.${k} span:nth-child(2){height:90%}.${k} span:nth-child(3){height:45%}.${k} span:nth-child(4){height:75%}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },
  {
    id: "skeleton-comment", name: "Skeleton Comment", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="av"></div><div class="bub"></div></div>`,
      css: `.${k}{display:flex;align-items:flex-start;gap:${s * 0.2}px;width:${s * 3}px}.${k} .av{width:${s * 0.7}px;height:${s * 0.7}px;border-radius:50%;flex:none}.${k} .bub{flex:1;height:${s}px;border-radius:4px 12px 12px 12px}.${k} .av,.${k} .bub{background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },

  // ── Misc ──
  {
    id: "cog-spin", name: "Cog", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};-webkit-mask:radial-gradient(circle,#000 58%,#0000 59%),repeating-conic-gradient(#000 0 22deg,#0000 22deg 45deg);mask:radial-gradient(circle,#000 58%,#0000 59%),repeating-conic-gradient(#000 0 22deg,#0000 22deg 45deg);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "scan-line", name: "Scanner", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;border:${Math.max(2, w - 2)}px solid ${faint(c)};border-radius:6px;overflow:hidden}.${k}::after{content:"";position:absolute;left:0;top:0;width:100%;height:${Math.max(3, w)}px;background:${c};box-shadow:0 0 ${w * 2}px ${c};animation:${k}-sc ${t}s ease-in-out infinite}@keyframes ${k}-sc{0%{top:0}50%{top:calc(100% - ${Math.max(3, w)}px)}100%{top:0}}`,
    }),
  },
  {
    id: "newton-cradle", name: "Newton's Cradle", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(7, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;height:${s}px;align-items:flex-start}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:50%;transform-origin:center -${(s - d).toFixed(1)}px}.${k} span:nth-child(1){animation:${k}-l ${t}s ease-in-out infinite}.${k} span:nth-child(4){animation:${k}-r ${t}s ease-in-out infinite}@keyframes ${k}-l{0%,50%,100%{transform:rotate(0)}25%{transform:rotate(-48deg)}}@keyframes ${k}-r{0%,50%,100%{transform:rotate(0)}75%{transform:rotate(48deg)}}`,
      };
    },
  },
  {
    id: "morse", name: "Morse", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;align-items:center}.${k} span{height:${Math.max(3, w)}px;background:${c};border-radius:${w}px;animation:${k}-m ${t}s steps(1) infinite}.${k} span:nth-child(1){width:${s * 0.3}px}.${k} span:nth-child(2){width:${s * 0.6}px}.${k} span:nth-child(3){width:${s * 0.3}px}${delays(`.${k} span`, 3, t / 3)}@keyframes ${k}-m{0%,100%{opacity:.2}40%{opacity:1}}`,
    }),
  },

  // ════════════ BATCH 7 — trendy / unique ════════════
  // ── Spinners ──
  {
    id: "notch-ring", name: "Notch Ring", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(${c} 0 300deg,#0000 300deg);-webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - ${w}px),#000 0);mask:radial-gradient(farthest-side,#0000 calc(100% - ${w}px),#000 0);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "orbit-pulse", name: "Orbit Pulse", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 5);
      let f = "";
      for (let i = 0; i < 3; i++) f += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 120}deg)}.${k} span:nth-child(${i + 1})::before{animation-delay:${((i * t) / 3).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(3)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${(t * 1.5).toFixed(2)}s linear infinite}.${k} span{position:absolute;top:0;left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;transform-origin:${d / 2}px ${s / 2}px}.${k} span::before{content:"";display:block;width:100%;height:100%;background:${c};border-radius:50%;animation:${k}-p ${t}s ease-in-out infinite}${f}@keyframes ${k}-r{to{transform:rotate(360deg)}}@keyframes ${k}-p{0%,100%{transform:scale(.5)}50%{transform:scale(1)}}`,
      };
    },
  },
  {
    id: "square-trace", name: "Square Trace", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 5);
      return {
        html: `<div class="${k}"><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;border:2px solid ${faint(c)};border-radius:4px}.${k} span{position:absolute;top:-${d / 2}px;left:-${d / 2}px;width:${d}px;height:${d}px;background:${c};border-radius:50%;box-shadow:0 0 ${d}px ${c};animation:${k}-tr ${t}s linear infinite}@keyframes ${k}-tr{0%{top:-${d / 2}px;left:-${d / 2}px}25%{top:-${d / 2}px;left:calc(100% - ${d / 2}px)}50%{top:calc(100% - ${d / 2}px);left:calc(100% - ${d / 2}px)}75%{top:calc(100% - ${d / 2}px);left:-${d / 2}px}100%{top:-${d / 2}px;left:-${d / 2}px}}`,
      };
    },
  },
  {
    id: "spiral-spin", name: "Whirl", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(from 0deg,#0000,${c});-webkit-mask:radial-gradient(farthest-side,#0000 30%,#000 32%);mask:radial-gradient(farthest-side,#0000 30%,#000 32%);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "ring-echo", name: "Echo Ring", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;border:${w}px solid ${faint(c)};border-top-color:${c};border-radius:50%;animation:${k}-r ${t}s linear infinite}.${k} span{position:absolute;inset:-${w}px;border:${w}px solid ${c};border-radius:50%;animation:${k}-e ${(t * 1.6).toFixed(2)}s ease-out infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}@keyframes ${k}-e{0%{transform:scale(.8);opacity:.6}100%{transform:scale(1.4);opacity:0}}`,
    }),
  },

  // ── Dots ──
  {
    id: "dots-rain", name: "Rain", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 6);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:0;width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-rn ${t}s linear infinite}.${k} span:nth-child(1){left:15%}.${k} span:nth-child(2){left:45%;animation-delay:${(t / 3).toFixed(2)}s}.${k} span:nth-child(3){left:75%;animation-delay:${(t * 0.66).toFixed(2)}s}@keyframes ${k}-rn{0%{top:-${d}px;opacity:0}20%{opacity:1}80%{opacity:1}100%{top:100%;opacity:0}}`,
      };
    },
  },
  {
    id: "dots-merge", name: "Merge", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(7, s / 3.5);
      return {
        html: `<div class="${k}"><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${d}px}.${k} span{position:absolute;top:0;width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} span:nth-child(1){left:0;animation:${k}-a ${t}s ease-in-out infinite}.${k} span:nth-child(2){right:0;animation:${k}-b ${t}s ease-in-out infinite}@keyframes ${k}-a{0%,100%{left:0;transform:scale(1)}50%{left:calc(50% - ${d / 2}px);transform:scale(1.3)}}@keyframes ${k}-b{0%,100%{right:0;transform:scale(1)}50%{right:calc(50% - ${d / 2}px);transform:scale(1.3)}}`,
      };
    },
  },
  {
    id: "dots-dual-ring", name: "Dual Dot Ring", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(4, s / 8);
      let outer = "", inner = "";
      for (let i = 0; i < 4; i++) outer += `.${k} .o span:nth-child(${i + 1}){transform:rotate(${i * 90}deg) translateY(-${(s / 2 - d / 2).toFixed(1)}px)}`;
      for (let i = 0; i < 4; i++) inner += `.${k} .i span:nth-child(${i + 1}){transform:rotate(${i * 90 + 45}deg) translateY(-${(s / 4).toFixed(1)}px)}`;
      return {
        html: `<div class="${k}"><div class="o"><span></span><span></span><span></span><span></span></div><div class="i"><span></span><span></span><span></span><span></span></div></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} .o,.${k} .i{position:absolute;inset:0}.${k} .o{animation:${k}-r ${t}s linear infinite}.${k} .i{animation:${k}-r ${t}s linear infinite reverse}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}${outer}${inner}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },
  {
    id: "satellite", name: "Satellite", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 6), cd = Math.max(7, s / 4);
      return {
        html: `<div class="${k}"><b></b><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s linear infinite}.${k} b{position:absolute;top:calc(50% - ${cd / 2}px);left:calc(50% - ${cd / 2}px);width:${cd}px;height:${cd}px;background:${c};border-radius:50%}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} span:nth-child(2){transform:translateX(${(s / 2 - d / 2).toFixed(1)}px)}.${k} span:nth-child(3){transform:translateX(-${(s / 2 - d / 2).toFixed(1)}px)}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },

  // ── Bars ──
  {
    id: "bars-twist", name: "Twist Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;height:${s}px;perspective:${s * 3}px}.${k} span{width:${Math.max(4, w + 1)}px;height:100%;background:${c};border-radius:${w}px;animation:${k}-tw ${t}s ease-in-out infinite}${delays(`.${k} span`, 4, t / 8)}@keyframes ${k}-tw{0%,100%{transform:rotateX(0)}50%{transform:rotateX(360deg)}}`,
    }),
  },
  {
    id: "bars-dna", name: "DNA Bars", category: "Bars",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 6);
      let f = "";
      for (let i = 0; i < 5; i++) f += `.${k} span:nth-child(${i + 1})::before,.${k} span:nth-child(${i + 1})::after{animation-delay:${((i * t) / 10).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(5)}</div>`,
        css: `.${k}{display:inline-flex;gap:${(d * 0.7).toFixed(1)}px;align-items:center;height:${s}px}.${k} span{position:relative;width:${d}px;height:${s}px}.${k} span::before,.${k} span::after{content:"";position:absolute;left:0;width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} span::before{top:0;animation:${k}-a ${t}s ease-in-out infinite}.${k} span::after{bottom:0;animation:${k}-b ${t}s ease-in-out infinite}${f}@keyframes ${k}-a{0%,100%{transform:translateY(0)}50%{transform:translateY(${(s * 0.5).toFixed(1)}px)}}@keyframes ${k}-b{0%,100%{transform:translateY(0)}50%{transform:translateY(-${(s * 0.5).toFixed(1)}px)}}`,
      };
    },
  },
  {
    id: "bars-meter", name: "Audio Meter", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;align-items:flex-end;height:${s}px}.${k} span{width:${Math.max(5, w + 2)}px;height:100%;background:repeating-linear-gradient(${c} 0 ${Math.max(3, Math.round(s / 8))}px,#0000 ${Math.max(3, Math.round(s / 8))}px ${Math.max(5, Math.round(s / 6))}px);transform-origin:bottom;animation:${k}-mt ${t}s steps(6) infinite alternate}${delays(`.${k} span`, 4, t / 8)}@keyframes ${k}-mt{0%{transform:scaleY(.2)}100%{transform:scaleY(1)}}`,
    }),
  },
  {
    id: "bars-elastic", name: "Elastic Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(4, w)}px;align-items:center;height:${s}px}.${k} span{width:${Math.max(4, w)}px;height:${s * 0.4}px;background:${c};border-radius:${w}px;animation:${k}-el ${t}s cubic-bezier(.68,-.55,.27,1.55) infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-el{0%,100%{height:${s * 0.3}px}50%{height:${s}px}}`,
    }),
  },

  // ── Wave ──
  {
    id: "wave-pulse-travel", name: "Travelling Pulse", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 7);
      return {
        html: `<div class="${k}">${"<span></span>".repeat(6)}</div>`,
        css: `.${k}{display:inline-flex;gap:${d / 2}px;align-items:center}.${k} span{width:${d}px;height:${d}px;background:${faint(c)};border-radius:50%;animation:${k}-tv ${t}s ease-in-out infinite}${delays(`.${k} span`, 6, t / 8)}@keyframes ${k}-tv{0%,100%{transform:scale(1);background:${faint(c)}}40%{transform:scale(1.8);background:${c}}}`,
      };
    },
  },
  {
    id: "wave-curtain", name: "Curtain", category: "Wave",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}">${"<span></span>".repeat(7)}</div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(2, w - 1)}px;align-items:flex-start;height:${s}px}.${k} span{width:${Math.max(2, w - 1)}px;height:100%;background:linear-gradient(${c},${faint(c)});border-radius:0 0 ${w}px ${w}px;transform-origin:top;animation:${k}-cu ${t}s ease-in-out infinite}${delays(`.${k} span`, 7, t / 14)}@keyframes ${k}-cu{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`,
    }),
  },
  {
    id: "wave-jelly", name: "Jelly Blob", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s * 0.8}px;background:${c};border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;animation:${k}-jl ${(t * 1.2).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-jl{0%,100%{transform:scale(1,1)}25%{transform:scale(1.1,.9)}50%{transform:scale(.92,1.08)}75%{transform:scale(1.05,.95)}}`,
    }),
  },

  // ── Progress ──
  {
    id: "progress-zigzag", name: "Zigzag Bead", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const d = Math.max(7, w * 2);
      return {
        html: `<div class="${k}"><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 3}px;height:${s * 0.6}px}.${k} span{position:absolute;top:0;left:0;width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-x ${t}s linear infinite,${k}-y ${(t / 4).toFixed(2)}s ease-in-out infinite alternate}@keyframes ${k}-x{0%{left:0}100%{left:calc(100% - ${d}px)}}@keyframes ${k}-y{0%{top:0}100%{top:calc(100% - ${d}px)}}`,
      };
    },
  },
  {
    id: "progress-glow", name: "Glow Segments", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:3px}.${k} span{width:${s * 0.5}px;height:${w + 4}px;background:${faint(c)};border-radius:2px;animation:${k}-gl ${t}s ease-in-out infinite}${delays(`.${k} span`, 5, t / 10)}@keyframes ${k}-gl{0%,100%{background:${faint(c)};box-shadow:none}40%{background:${c};box-shadow:0 0 ${w * 2}px ${c}}}`,
    }),
  },
  {
    id: "progress-sweep", name: "Sweep Glow", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 3}px;height:${w + 4}px;border-radius:${w}px;background:linear-gradient(90deg,${faint(c)},${c},${faint(c)});background-size:200% 100%;animation:${k}-sw ${t}s linear infinite}@keyframes ${k}-sw{0%{background-position:200% 0}100%{background-position:0 0}}`,
    }),
  },
  {
    id: "ring-dots-fill", name: "Ring Fill Dots", category: "Progress",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(4, s / 7);
      let f = "";
      for (let i = 0; i < 8; i++) f += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 45}deg) translateY(-${(s / 2 - d / 2).toFixed(1)}px);animation-delay:${((i * t) / 8).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(8)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${faint(c)};border-radius:50%;animation:${k}-fl ${t}s linear infinite}${f}@keyframes ${k}-fl{0%,100%{background:${faint(c)}}30%{background:${c}}}`,
      };
    },
  },

  // ── Geometric ──
  {
    id: "triforce", name: "Triforce", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;width:${s / 2}px;height:${s / 2}px;background:${c};clip-path:polygon(50% 0,100% 100%,0 100%);animation:${k}-p ${t}s ease-in-out infinite}.${k} span:nth-child(1){top:0;left:${s / 4}px}.${k} span:nth-child(2){bottom:0;left:0;animation-delay:${(t / 6).toFixed(2)}s}.${k} span:nth-child(3){bottom:0;right:0;animation-delay:${(t / 3).toFixed(2)}s}@keyframes ${k}-p{0%,100%{opacity:.3;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}`,
    }),
  },
  {
    id: "corner-converge", name: "Converge", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4), o = (s / 2 - d / 2).toFixed(1);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;width:${d}px;height:${d}px;background:${c};border-radius:2px;animation:${k}-cv ${t}s ease-in-out infinite}.${k} span:nth-child(1){top:0;left:0;--x:${o}px;--y:${o}px}.${k} span:nth-child(2){top:0;right:0;--x:-${o}px;--y:${o}px}.${k} span:nth-child(3){bottom:0;right:0;--x:-${o}px;--y:-${o}px}.${k} span:nth-child(4){bottom:0;left:0;--x:${o}px;--y:-${o}px}@keyframes ${k}-cv{0%,100%{transform:translate(0,0);opacity:1}50%{transform:translate(var(--x),var(--y));opacity:.5}}`,
      };
    },
  },
  {
    id: "hexa-nested", name: "Nested Hexagons", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;inset:0;background:${c};clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)}.${k} span:nth-child(1){animation:${k}-a ${t}s linear infinite}.${k} span:nth-child(2){inset:25%;background:${faint(c)};animation:${k}-b ${t}s linear infinite}@keyframes ${k}-a{to{transform:rotate(360deg)}}@keyframes ${k}-b{to{transform:rotate(-360deg)}}`,
    }),
  },
  {
    id: "poly-morph", name: "Polygon Morph", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};animation:${k}-pm ${(t * 2).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-pm{0%,100%{clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)}50%{clip-path:polygon(0 0,100% 0,100% 50%,100% 100%,0 100%,0 50%)}}`,
    }),
  },

  // ── 3D ──
  {
    id: "cube-roll", name: "Rolling Cube", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 0.7}px;height:${s * 0.7}px;background:${c};border-radius:4px;animation:${k}-rl ${t}s ease-in-out infinite alternate}@keyframes ${k}-rl{0%{transform:translateX(-${s * 0.6}px) rotate(0)}100%{transform:translateX(${s * 0.6}px) rotate(180deg)}}`,
    }),
  },
  {
    id: "ribbon-3d", name: "Ribbon", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 0.4}px;height:${s}px;background:linear-gradient(${c},${c}99);border-radius:4px;animation:${k}-rb ${t}s linear infinite}@keyframes ${k}-rb{0%{transform:rotateY(0) rotateX(0)}100%{transform:rotateY(360deg) rotateX(20deg)}}`,
    }),
  },
  {
    id: "coin-stack", name: "Coin Stack", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.${k} span{width:${s * 0.8}px;height:${s * 0.18}px;background:${c};border-radius:50%;animation:${k}-co ${t}s ease-in-out infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-co{0%,100%{transform:scaleX(.3);opacity:.4}50%{transform:scaleX(1);opacity:1}}`,
    }),
  },

  // ── Gooey ──
  {
    id: "gooey-tri-orbit", name: "Gooey Tri Orbit", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.34;
      let del = "";
      for (let i = 0; i < 3; i++) del += `.${k} span:nth-child(${i + 2}){animation-delay:${((i * t) / 3).toFixed(2)}s}`;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/></filter></defs></svg><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-o ${t}s linear infinite}${del}@keyframes ${k}-o{from{transform:rotate(0) translateY(-${(s * 0.28).toFixed(1)}px)}to{transform:rotate(360deg) translateY(-${(s * 0.28).toFixed(1)}px)}}`,
      };
    },
  },
  {
    id: "gooey-burst", name: "Gooey Burst", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.3;
      let del = "";
      for (let i = 0; i < 4; i++) del += `.${k} span:nth-child(${i + 2}){animation-delay:${((i * t) / 4).toFixed(2)}s}`;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"/></filter></defs></svg><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-bu ${t}s ease-in-out infinite}.${k} span:nth-child(2){--a:0deg}.${k} span:nth-child(3){--a:90deg}.${k} span:nth-child(4){--a:180deg}.${k} span:nth-child(5){--a:270deg}${del}@keyframes ${k}-bu{0%,100%{transform:rotate(var(--a)) translateY(0)}50%{transform:rotate(var(--a)) translateY(-${(s * 0.32).toFixed(1)}px)}}`,
      };
    },
  },

  // ── Skeleton ──
  {
    id: "skeleton-gallery", name: "Skeleton Gallery", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:grid;grid-template-columns:repeat(3,1fr);gap:${s * 0.12}px;width:${s * 2.6}px}.${k} span{height:${s * 0.8}px;border-radius:6px;background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },
  {
    id: "skeleton-form", name: "Skeleton Form", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span class="lbl"></span><span class="inp"></span><span class="lbl"></span><span class="inp"></span></div>`,
      css: `.${k}{display:flex;flex-direction:column;gap:${s * 0.14}px;width:${s * 2.8}px}.${k} .lbl{height:${s * 0.14}px;width:35%;border-radius:3px}.${k} .inp{height:${s * 0.36}px;border-radius:5px}.${k} .lbl,.${k} .inp{background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },

  // ── Misc ──
  {
    id: "sandclock", name: "Sandglass", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s * 0.7}px;height:${s}px;border:2px solid ${c};border-radius:4px;overflow:hidden}.${k}::before{content:"";position:absolute;left:0;right:0;top:0;background:${c};animation:${k}-top ${t}s ease-in-out infinite}.${k}::after{content:"";position:absolute;left:0;right:0;bottom:0;background:${c};animation:${k}-bot ${t}s ease-in-out infinite}@keyframes ${k}-top{0%{height:50%}50%,100%{height:0}}@keyframes ${k}-bot{0%{height:0}50%,100%{height:50%}}`,
    }),
  },
  {
    id: "compass", name: "Compass", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;border:${w}px solid ${faint(c)};border-radius:50%}.${k}::after{content:"";position:absolute;left:calc(50% - 1.5px);top:10%;width:3px;height:40%;background:${c};transform-origin:bottom;animation:${k}-cp ${(t * 2).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-cp{0%{transform:rotate(0)}20%{transform:rotate(160deg)}40%{transform:rotate(70deg)}60%{transform:rotate(280deg)}80%{transform:rotate(200deg)}100%{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "runner", name: "Runner", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4);
      return {
        html: `<div class="${k}"><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 2.4}px;height:${d}px}.${k} span{position:absolute;top:0;left:0;width:${d}px;height:${d}px;background:${c};border-radius:50%;box-shadow:0 0 ${d}px ${c};animation:${k}-rn ${t}s cubic-bezier(.6,0,.4,1) infinite}@keyframes ${k}-rn{0%{left:0}50%{left:calc(100% - ${d}px)}100%{left:0}}`,
      };
    },
  },
  {
    id: "beacon", name: "Beacon", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(8, s / 2.5);
      return {
        html: `<div class="${k}"><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center}.${k} span{position:absolute;width:${d}px;height:${d}px;border-radius:50%;background:${c}}.${k} span:nth-child(1){animation:${k}-core ${t}s ease-in-out infinite}.${k} span:nth-child(2){animation:${k}-ring ${t}s ease-out infinite}@keyframes ${k}-core{0%,100%{transform:scale(.8);opacity:1}50%{transform:scale(1);opacity:.8}}@keyframes ${k}-ring{0%{transform:scale(.8);opacity:.7}100%{transform:scale(2.4);opacity:0}}`,
      };
    },
  },

  // ════════════ BATCH 8 — final, trendy / unique ════════════
  // ── Spinners ──
  {
    id: "fan-spin", name: "Fan", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(${c} 0 90deg,${faint(c)} 90deg 180deg,${c} 180deg 270deg,${faint(c)} 270deg);-webkit-mask:radial-gradient(farthest-side,#0000 52%,#000 53%);mask:radial-gradient(farthest-side,#0000 52%,#000 53%);animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "arc-chase", name: "Arc Chase", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k}::before,.${k}::after{content:"";position:absolute;inset:0;border-radius:50%;border:${w}px solid transparent}.${k}::before{border-top-color:${c};border-bottom-color:${c};animation:${k}-r ${t}s cubic-bezier(.5,0,.5,1) infinite}.${k}::after{border-left-color:${faint(c)};border-right-color:${faint(c)};animation:${k}-r ${t}s cubic-bezier(.5,0,.5,1) infinite reverse}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "inner-orbit", name: "Inner Orbit", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const d = Math.max(6, s / 5);
      return {
        html: `<div class="${k}"><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;border:${w}px solid ${faint(c)};border-radius:50%}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-o ${t}s linear infinite}@keyframes ${k}-o{from{transform:rotate(0) translateX(${(s / 2 - d).toFixed(1)}px)}to{transform:rotate(360deg) translateX(${(s / 2 - d).toFixed(1)}px)}}`,
      };
    },
  },
  {
    id: "daisy", name: "Daisy", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => {
      let f = "";
      for (let i = 0; i < 6; i++) f += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 60}deg)}.${k} span:nth-child(${i + 1})::before{animation-delay:${((i * t) / 6).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(6)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${(t * 2).toFixed(2)}s linear infinite}.${k} span{position:absolute;top:0;left:calc(50% - ${s / 10}px);width:${s / 5}px;height:${s / 2.4}px;transform-origin:${s / 10}px ${s / 2}px}.${k} span::before{content:"";display:block;width:100%;height:100%;background:${c};border-radius:50% 50% 50% 50%/60% 60% 40% 40%;animation:${k}-p ${t}s ease-in-out infinite}${f}@keyframes ${k}-r{to{transform:rotate(360deg)}}@keyframes ${k}-p{0%,100%{opacity:.35}50%{opacity:1}}`,
      };
    },
  },
  {
    id: "dot-ring-trail", name: "Trail Ring", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(4, s / 8);
      let f = "";
      for (let i = 0; i < 8; i++) f += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 45}deg) translateY(-${(s / 2 - d / 2).toFixed(1)}px);opacity:${(1 - i * 0.1).toFixed(2)}}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(8)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s linear infinite}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}${f}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },

  // ── Dots ──
  {
    id: "dots-quad", name: "Quad Pulse", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{display:grid;grid-template-columns:repeat(2,${d}px);gap:${d / 2}px}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-p ${t}s ease-in-out infinite}.${k} span:nth-child(1){animation-delay:0s}.${k} span:nth-child(2),.${k} span:nth-child(3){animation-delay:${(t / 4).toFixed(2)}s}.${k} span:nth-child(4){animation-delay:${(t / 2).toFixed(2)}s}@keyframes ${k}-p{0%,100%{transform:scale(.4);opacity:.3}50%{transform:scale(1);opacity:1}}`,
      };
    },
  },
  {
    id: "dots-comet", name: "Comet Dots", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const head = Math.max(6, s / 4), tr = Math.max(4, s / 7), r = (s / 2 - head / 2).toFixed(1);
      let f = `.${k} span:nth-child(1){width:${head}px;height:${head}px}`;
      for (let i = 1; i < 4; i++) f += `.${k} span:nth-child(${i + 1}){width:${tr}px;height:${tr}px;opacity:${(0.7 - i * 0.18).toFixed(2)};animation-delay:-${((i * t) / 12).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(4)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;inset:0;margin:auto;background:${c};border-radius:50%;animation:${k}-r ${t}s linear infinite}${f}@keyframes ${k}-r{from{transform:rotate(0) translateY(-${r}px)}to{transform:rotate(360deg) translateY(-${r}px)}}`,
      };
    },
  },
  {
    id: "dots-spread", name: "Spread", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 5);
      let f = "";
      [0, 90, 180, 270].forEach((a, i) => (f += `.${k} span:nth-child(${i + 1}){--a:${a}deg}`));
      return {
        html: `<div class="${k}">${"<span></span>".repeat(4)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;inset:0;margin:auto;width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-sp ${t}s ease-in-out infinite}${f}@keyframes ${k}-sp{0%,100%{transform:rotate(var(--a)) translateY(0)}50%{transform:rotate(var(--a)) translateY(-${(s / 2 - d / 2).toFixed(1)}px)}}`,
      };
    },
  },
  {
    id: "dots-seesaw", name: "Seesaw", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(7, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;gap:${d}px;align-items:center;height:${s}px}.${k} span{width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-ss ${t}s ease-in-out infinite}.${k} span:nth-child(2){animation-delay:${(t / 2).toFixed(2)}s}@keyframes ${k}-ss{0%,100%{transform:translateY(-${(s / 2 - d / 2).toFixed(1)}px)}50%{transform:translateY(${(s / 2 - d / 2).toFixed(1)}px)}}`,
      };
    },
  },

  // ── Bars ──
  {
    id: "bars-fountain", name: "Fountain", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;align-items:center;height:${s}px}.${k} span{width:${Math.max(3, w)}px;height:100%;background:${c};border-radius:${w}px;transform-origin:center;animation:${k}-ft ${t}s ease-in-out infinite}.${k} span:nth-child(1),.${k} span:nth-child(5){animation-delay:0s}.${k} span:nth-child(2),.${k} span:nth-child(4){animation-delay:${(t / 6).toFixed(2)}s}.${k} span:nth-child(3){animation-delay:${(t / 3).toFixed(2)}s}@keyframes ${k}-ft{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`,
    }),
  },
  {
    id: "bars-fill-row", name: "Fill Row", category: "Bars",
    build: ({ size: s, speed: t, color: c }, k) => {
      let dl = "";
      for (let i = 0; i < 5; i++) dl += `.${k} span:nth-child(${i + 1})::after{animation-delay:${((i * t) / 5).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(5)}</div>`,
        css: `.${k}{display:inline-flex;gap:3px;height:${s}px}.${k} span{position:relative;width:${s * 0.4}px;height:100%;background:${faint(c)};border-radius:2px;overflow:hidden}.${k} span::after{content:"";position:absolute;inset:0;background:${c};transform:translateX(-100%);animation:${k}-fr ${t}s ease-in-out infinite}${dl}@keyframes ${k}-fr{0%{transform:translateX(-100%)}40%,60%{transform:translateX(0)}100%{transform:translateX(100%)}}`,
      };
    },
  },
  {
    id: "bars-typing", name: "Typing Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(3, w)}px;align-items:flex-end;height:${s}px}.${k} span{width:${Math.max(4, w + 1)}px;height:30%;background:${c};border-radius:${w}px;animation:${k}-ty ${t}s ease-in-out infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-ty{0%,100%{height:30%;opacity:.5}50%{height:100%;opacity:1}}`,
    }),
  },
  {
    id: "bars-scan", name: "Scan Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}">${"<span></span>".repeat(6)}</div>`,
      css: `.${k}{display:inline-flex;gap:${Math.max(2, w - 1)}px;align-items:center;height:${s}px}.${k} span{width:${Math.max(2, w - 1)}px;height:60%;background:${faint(c)};border-radius:${w}px;animation:${k}-sc ${t}s ease-in-out infinite}${delays(`.${k} span`, 6, t / 6)}@keyframes ${k}-sc{0%,100%{height:40%;background:${faint(c)}}50%{height:100%;background:${c}}}`,
    }),
  },

  // ── Wave ──
  {
    id: "wave-mountain", name: "Mountains", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(4, s / 8);
      let f = "";
      for (let i = 0; i < 7; i++) f += `.${k} span:nth-child(${i + 1}){animation-delay:${((i * t) / 14).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(7)}</div>`,
        css: `.${k}{display:inline-flex;gap:${d / 2}px;align-items:flex-end;height:${s}px}.${k} span{width:${d}px;background:${c};border-radius:${d / 2}px ${d / 2}px 0 0;transform-origin:bottom;animation:${k}-mt ${t}s ease-in-out infinite}.${k} span:nth-child(1),.${k} span:nth-child(5){height:40%}.${k} span:nth-child(2),.${k} span:nth-child(4),.${k} span:nth-child(6){height:65%}.${k} span:nth-child(3),.${k} span:nth-child(7){height:90%}${f}@keyframes ${k}-mt{0%,100%{transform:scaleY(.7)}50%{transform:scaleY(1)}}`,
      };
    },
  },
  {
    id: "wave-bob", name: "Bob", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(8, s / 3);
      return {
        html: `<div class="${k}"><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center}.${k} span:nth-child(1){width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-bob ${t}s ease-in-out infinite}.${k} span:nth-child(2){position:absolute;width:${d}px;height:${d}px;border:2px solid ${c};border-radius:50%;animation:${k}-rp ${t}s ease-out infinite}@keyframes ${k}-bob{0%,100%{transform:translateY(-${s * 0.12}px)}50%{transform:translateY(${s * 0.12}px)}}@keyframes ${k}-rp{0%{transform:scale(1);opacity:.6}100%{transform:scale(2);opacity:0}}`,
      };
    },
  },
  {
    id: "wave-flag", name: "Flag", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 1.4}px;height:${s * 0.5}px;background:${c};animation:${k}-fg ${(t * 1.2).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-fg{0%,100%{clip-path:polygon(0 0,100% 8%,100% 92%,0 100%)}50%{clip-path:polygon(0 8%,100% 0,100% 100%,0 92%)}}`,
    }),
  },

  // ── Progress ──
  {
    id: "caterpillar", name: "Caterpillar", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s * 3}px;height:${w + 4}px;background:${faint(c)};border-radius:${w}px;overflow:hidden}.${k}::before{content:"";position:absolute;top:0;left:0;height:100%;width:30%;background:${c};border-radius:${w}px;animation:${k}-ct ${t}s ease-in-out infinite}@keyframes ${k}-ct{0%{left:0;width:30%}50%{left:35%;width:65%}100%{left:100%;width:30%}}`,
    }),
  },
  {
    id: "spin-arc", name: "Spin Arc", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(#0000 0 270deg,${c} 270deg);-webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - ${w}px),#000 0);mask:radial-gradient(farthest-side,#0000 calc(100% - ${w}px),#000 0);animation:${k}-r ${t}s cubic-bezier(.6,.1,.4,.9) infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "progress-pendulum", name: "Track Balls", category: "Progress",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(7, s / 4);
      return {
        html: `<div class="${k}"><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 2.4}px;height:${d}px}.${k} span{position:absolute;top:0;width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} span:nth-child(1){left:0;animation:${k}-a ${t}s cubic-bezier(.5,0,.5,1) infinite}.${k} span:nth-child(2){right:0;animation:${k}-b ${t}s cubic-bezier(.5,0,.5,1) infinite}@keyframes ${k}-a{0%,100%{left:0}50%{left:calc(50% - ${d}px)}}@keyframes ${k}-b{0%,100%{right:0}50%{right:calc(50% - ${d}px)}}`,
      };
    },
  },
  {
    id: "stepper", name: "Stepper", category: "Progress",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(8, s / 3);
      let f = "";
      for (let i = 0; i < 4; i++) f += `.${k} span:nth-child(${i + 1}){animation-delay:${((i * t) / 4).toFixed(2)}s}`;
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;align-items:center;gap:${(d * 0.8).toFixed(1)}px;position:relative}.${k}::before{content:"";position:absolute;top:50%;left:${d / 2}px;right:${d / 2}px;height:2px;background:${faint(c)};transform:translateY(-50%)}.${k} span{position:relative;width:${d}px;height:${d}px;border-radius:50%;background:${faint(c)};border:2px solid ${faint(c)};box-sizing:border-box;animation:${k}-st ${t}s ease-in-out infinite}${f}@keyframes ${k}-st{0%,100%{background:${faint(c)};border-color:${faint(c)};transform:scale(1)}40%{background:${c};border-color:${c};transform:scale(1.2)}}`,
      };
    },
  },

  // ── Geometric ──
  {
    id: "square-pulse", name: "Square Pulse", category: "Geometric",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s * 0.6}px;height:${s * 0.6}px;background:${c};animation:${k}-sp ${t}s ease-in-out infinite}.${k}::after{content:"";position:absolute;inset:0;border:${w}px solid ${c};animation:${k}-rp ${t}s ease-out infinite}@keyframes ${k}-sp{0%,100%{transform:scale(.8)}50%{transform:scale(1)}}@keyframes ${k}-rp{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.8);opacity:0}}`,
    }),
  },
  {
    id: "tri-spin", name: "Tri Spin", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => {
      let f = "";
      for (let i = 0; i < 3; i++) f += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 120}deg) translateY(-${(s / 4).toFixed(1)}px)}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(3)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s linear infinite}.${k} span{position:absolute;top:calc(50% - ${s / 8}px);left:calc(50% - ${s / 8}px);width:${s / 4}px;height:${s / 4}px;background:${c};clip-path:polygon(50% 0,100% 100%,0 100%)}${f}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },
  {
    id: "chevrons", name: "Chevrons", category: "Geometric",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${s * 0.06}px}.${k} span{width:${s * 0.3}px;height:${s * 0.3}px;border-top:${w}px solid ${c};border-right:${w}px solid ${c};transform:rotate(45deg);animation:${k}-ch ${t}s ease-in-out infinite}${delays(`.${k} span`, 3, t / 6)}@keyframes ${k}-ch{0%,100%{opacity:.2}50%{opacity:1}}`,
    }),
  },
  {
    id: "ring-morph", name: "Ring Morph", category: "Geometric",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border:${w}px solid ${c};box-sizing:border-box;animation:${k}-mp ${(t * 1.6).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-mp{0%,100%{border-radius:50%;transform:rotate(0)}50%{border-radius:8%;transform:rotate(90deg)}}`,
    }),
  },

  // ── 3D ──
  {
    id: "domino", name: "Dominoes", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{display:inline-flex;gap:${s * 0.12}px;height:${s}px;perspective:${s * 4}px}.${k} span{width:${s * 0.12}px;height:100%;background:${c};border-radius:2px;transform-origin:bottom;animation:${k}-dm ${t}s ease-in-out infinite}${delays(`.${k} span`, 4, t / 8)}@keyframes ${k}-dm{0%,40%{transform:rotateZ(0)}60%,100%{transform:rotateZ(-32deg)}}`,
    }),
  },
  {
    id: "helix", name: "Helix", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 6);
      let f = "";
      for (let i = 0; i < 6; i++) f += `.${k} span:nth-child(${i + 1}){left:${(i * (s / 6)).toFixed(1)}px;animation-delay:-${((i * t) / 6).toFixed(2)}s}`;
      return {
        html: `<div class="${k}">${"<span></span>".repeat(6)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%;animation:${k}-hx ${t}s ease-in-out infinite}${f}@keyframes ${k}-hx{0%,100%{transform:translateY(-${s * 0.3}px) scale(.6);opacity:.5}50%{transform:translateY(${s * 0.3}px) scale(1);opacity:1}}`,
      };
    },
  },
  {
    id: "disc-3d", name: "Tilt Coin", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,${c},${c}77);animation:${k}-d ${t}s linear infinite}@keyframes ${k}-d{0%{transform:perspective(200px) rotateY(0) rotateX(20deg)}100%{transform:perspective(200px) rotateY(360deg) rotateX(20deg)}}`,
    }),
  },

  // ── Gooey ──
  {
    id: "gooey-swing", name: "Gooey Swing", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.4;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"/></filter></defs></svg><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 1.5}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} span:nth-child(2){animation:${k}-sw ${t}s ease-in-out infinite}.${k} span:nth-child(3){animation:${k}-sw ${t}s ease-in-out infinite reverse}@keyframes ${k}-sw{0%,100%{transform:translateX(-${s * 0.45}px)}50%{transform:translateX(${s * 0.45}px)}}`,
      };
    },
  },
  {
    id: "gooey-drip", name: "Gooey Drip", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.4;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/></filter></defs></svg><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s * 1.4}px;filter:url(#goo-${k})}.${k} span:nth-child(2){position:absolute;top:0;left:calc(50% - ${d / 2}px);width:${d}px;height:${d * 1.2}px;background:${c};border-radius:50%}.${k} span:nth-child(3){position:absolute;top:0;left:calc(50% - ${(d * 0.7) / 2}px);width:${d * 0.7}px;height:${d * 0.7}px;background:${c};border-radius:50%;animation:${k}-dr ${t}s ease-in infinite}@keyframes ${k}-dr{0%{top:${d * 0.6}px;transform:scale(.6)}70%{top:calc(100% - ${d * 0.7}px);transform:scale(1)}100%{top:calc(100% - ${d * 0.7}px);transform:scale(.2);opacity:0}}`,
      };
    },
  },

  // ── Skeleton ──
  {
    id: "skeleton-video", name: "Skeleton Video", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="scr"></div><div class="bar"></div></div>`,
      css: `.${k}{width:${s * 3}px;display:flex;flex-direction:column;gap:${s * 0.14}px}.${k} .scr{height:${s * 1.4}px;border-radius:8px;position:relative}.${k} .scr::after{content:"";position:absolute;top:50%;left:50%;width:${s * 0.5}px;height:${s * 0.5}px;transform:translate(-50%,-50%);background:#0000001a;border-radius:50%}.${k} .bar{height:${s * 0.16}px;border-radius:4px}.${k} .scr,.${k} .bar{background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },
  {
    id: "skeleton-price", name: "Skeleton Price", category: "Skeleton",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><div class="t"></div><div class="p"></div><div class="l"></div><div class="l"></div><div class="b"></div></div>`,
      css: `.${k}{width:${s * 2}px;display:flex;flex-direction:column;align-items:center;gap:${s * 0.14}px;padding:${s * 0.2}px;border:1px solid ${faint(c)};border-radius:10px}.${k} .t{width:50%;height:${s * 0.16}px}.${k} .p{width:70%;height:${s * 0.4}px}.${k} .l{width:85%;height:${s * 0.12}px}.${k} .b{width:100%;height:${s * 0.4}px;margin-top:${s * 0.1}px}.${k} .t,.${k} .p,.${k} .l,.${k} .b{border-radius:5px;background:linear-gradient(90deg,${faint(c)} 25%,${c} 37%,${faint(c)} 63%);background-size:400% 100%;animation:${k}-sh ${t}s ease-in-out infinite}@keyframes ${k}-sh{0%{background-position:100% 0}100%{background-position:-100% 0}}`,
    }),
  },

  // ── Misc ──
  {
    id: "fidget", name: "Fidget Spinner", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.34;
      let f = "";
      for (let i = 0; i < 3; i++) f += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 120}deg) translateY(-${(s / 2 - d / 2).toFixed(1)}px)}`;
      return {
        html: `<div class="${k}"><b></b>${"<span></span>".repeat(3)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s cubic-bezier(.4,0,.2,1) infinite}.${k} b{position:absolute;top:calc(50% - ${(d * 0.35).toFixed(1)}px);left:calc(50% - ${(d * 0.35).toFixed(1)}px);width:${(d * 0.7).toFixed(1)}px;height:${(d * 0.7).toFixed(1)}px;background:${c};border-radius:50%}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}${f}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },
  {
    id: "pendulum", name: "Pendulum", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const d = Math.max(7, s / 4);
      return {
        html: `<div class="${k}"><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:0;left:calc(50% - ${Math.max(1, (w - 1) / 2)}px);width:${Math.max(2, w - 1)}px;height:70%;background:${faint(c)};transform-origin:top center;animation:${k}-pd ${(t * 1.4).toFixed(2)}s ease-in-out infinite}.${k} span::after{content:"";position:absolute;bottom:-${d / 2}px;left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}@keyframes ${k}-pd{0%,100%{transform:rotate(-40deg)}50%{transform:rotate(40deg)}}`,
      };
    },
  },
  {
    id: "flame", name: "Flame", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 0.6}px;height:${s * 0.6}px;background:${c};border-radius:0 50% 50% 50%;transform:rotate(45deg);box-shadow:0 0 ${s * 0.3}px ${c}88;animation:${k}-fl ${(t * 0.7).toFixed(2)}s ease-in-out infinite}@keyframes ${k}-fl{0%,100%{transform:rotate(45deg) scale(1);box-shadow:0 0 ${s * 0.25}px ${c}88}50%{transform:rotate(45deg) scale(1.1,.95);box-shadow:0 0 ${s * 0.45}px ${c}}}`,
    }),
  },
  {
    id: "power", name: "Power Spin", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;border:${w}px solid ${faint(c)};border-top-color:${c};border-radius:50%;animation:${k}-r ${t}s linear infinite}.${k}::after{content:"";position:absolute;top:8%;left:calc(50% - ${Math.max(1, w / 2)}px);width:${Math.max(2, w)}px;height:35%;background:${c};border-radius:${w}px}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },

  // ════════════ BATCH 3 — Energy / Complex ════════════
  {
    id: "hyper-cube", name: "Hyper Cube", category: "3D",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><div class="inner"></div><div class="outer"></div></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;perspective:${s*4}px;transform-style:preserve-3d}.${k} div{position:absolute;inset:0;border:${w}px solid ${c};animation:${k}-r ${t*2}s infinite linear;transform-style:preserve-3d}.${k} .inner{inset:${s*0.2}px;border-color:${c}33;animation-direction:reverse}@keyframes ${k}-r{to{transform:rotateX(360deg) rotateY(360deg) rotateZ(360deg)}}`
    })
  },
  {
    id: "portal-ring", name: "Portal", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(from 0deg, #0000, ${c}, #0000);-webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - ${w*1.5}px),#000 0);mask:radial-gradient(farthest-side,#0000 calc(100% - ${w*1.5}px),#000 0);animation:${k}-r ${t}s linear infinite, ${k}-p ${t*1.5}s ease-in-out infinite alternate;box-shadow:0 0 ${s*0.5}px ${c}}@keyframes ${k}-r{to{transform:rotate(360deg)}}@keyframes ${k}-p{0%{transform:scale(0.8);filter:hue-rotate(0deg)}100%{transform:scale(1.1);filter:hue-rotate(45deg)}}`
    })
  },
  {
    id: "galaxy-spin", name: "Galaxy Orbit", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;inset:0;border:1px solid ${c}33;border-radius:50%;animation:${k}-r ${t*3}s linear infinite}.${k} span::before{content:"";position:absolute;top:calc(50% - 3px);left:-3px;width:6px;height:6px;background:${c};border-radius:50%;box-shadow:0 0 8px ${c}}.${k} span:nth-child(1){transform:rotateX(60deg) rotateY(0deg);animation-duration:${t*1.5}s}.${k} span:nth-child(2){transform:rotateX(60deg) rotateY(60deg);animation-duration:${t*2}s}.${k} span:nth-child(3){transform:rotateX(60deg) rotateY(120deg);animation-duration:${t*2.5}s}@keyframes ${k}-r{to{transform:rotateX(60deg) rotateZ(360deg)}}`
    })
  },
  {
    id: "matrix-rain", name: "Matrix Rain", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const bw = Math.max(2, w);
      return {
        html: `<div class="${k}"><span></span><span></span><span></span><span></span><span></span></div>`,
        css: `.${k}{display:inline-flex;gap:${bw*1.5}px;align-items:flex-start;height:${s}px;overflow:hidden}.${k} span{width:${bw}px;height:40%;background:linear-gradient(to bottom, #0000, ${c});border-radius:2px;animation:${k}-d ${t}s linear infinite}.${k} span:nth-child(1){animation-delay:0s}.${k} span:nth-child(2){animation-delay:${t*0.3}s}.${k} span:nth-child(3){animation-delay:${t*0.7}s}.${k} span:nth-child(4){animation-delay:${t*0.2}s}.${k} span:nth-child(5){animation-delay:${t*0.5}s}@keyframes ${k}-d{0%{transform:translateY(-100%);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateY(300%);opacity:0}}`
      }
    }
  },
  {
    id: "neon-pulse", name: "Neon Pulse", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"/></filter></defs></svg><div class="g"><span></span><span></span><span></span></div></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} .g{position:absolute;inset:0;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${s*0.2}px);left:calc(50% - ${s*0.2}px);width:${s*0.4}px;height:${s*0.4}px;background:${c};border-radius:50%;box-shadow:0 0 15px ${c};animation:${k}-p ${t*1.5}s infinite alternate ease-in-out}.${k} span:nth-child(1){animation-name:${k}-p1}.${k} span:nth-child(2){animation-name:${k}-p2}.${k} span:nth-child(3){animation-name:${k}-p3}@keyframes ${k}-p1{0%{transform:translateY(-${s*0.3}px)}100%{transform:translateY(${s*0.1}px)}}@keyframes ${k}-p2{0%{transform:translate(${s*0.3}px, ${s*0.2}px)}100%{transform:translate(-${s*0.1}px, -${s*0.1}px)}}@keyframes ${k}-p3{0%{transform:translate(-${s*0.3}px, ${s*0.2}px)}100%{transform:translate(${s*0.1}px, -${s*0.1}px)}}`
    })
  },
  {
    id: "laser-scan", name: "Laser Scan", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s*2.5}px;height:${s*0.8}px;border:1px solid ${c}33;border-radius:4px;overflow:hidden;background:repeating-linear-gradient(90deg, #0000 0, #0000 4px, ${c}33 4px, ${c}33 5px)}.${k}::after{content:"";position:absolute;top:0;left:0;width:10%;height:100%;background:${c};box-shadow:0 0 15px ${c};animation:${k}-s ${t}s infinite alternate ease-in-out}@keyframes ${k}-s{0%{transform:translateX(-50%)}100%{transform:translateX(950%)}}`
    })
  },
  {
    id: "polymorph-burst", name: "Polymorph", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:${c};animation:${k}-m ${t*2}s infinite ease-in-out;box-shadow:0 0 10px ${c}}@keyframes ${k}-m{0%,100%{clip-path:polygon(50% 0%, 0% 100%, 100% 100%);transform:rotate(0deg)}25%{clip-path:polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);transform:rotate(90deg)}50%{clip-path:polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);transform:rotate(180deg)}75%{clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);transform:rotate(270deg)}}`
    })
  },
  {
    id: "liquid-fill", name: "Liquid Fill", category: "Wave",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><div class="l"></div></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;border:${w}px solid ${c};border-radius:50%;overflow:hidden;animation:${k}-sw ${t*1.5}s infinite ease-in-out alternate}.${k} .l{position:absolute;bottom:-10%;left:-50%;width:200%;height:200%;background:${c};opacity:0.8;border-radius:40% 45% 42% 48%;animation:${k}-r ${t*1.2}s infinite linear, ${k}-f ${t*3}s infinite alternate ease-in-out}@keyframes ${k}-sw{0%{transform:rotate(-15deg)}100%{transform:rotate(15deg)}}@keyframes ${k}-r{to{transform:rotate(360deg)}}@keyframes ${k}-f{0%{bottom:-150%}100%{bottom:-10%}}`
    })
  },
  {
    id: "hypnotic-spiral", name: "Hypnotic Spiral", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:repeating-conic-gradient(from 0deg, ${c} 0 15deg, #0000 15deg 30deg);animation:${k}-z ${t*1.5}s infinite linear;mask:radial-gradient(circle, #000 40%, #0000 100%);-webkit-mask:radial-gradient(circle, #000 40%, #0000 100%)}@keyframes ${k}-z{0%{transform:scale(0.5) rotate(0deg)}100%{transform:scale(1.5) rotate(360deg);opacity:0}}`
    })
  },
  {
    id: "quantum-entanglement", name: "Quantum", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s/5);
      return {
        html: `<div class="${k}"><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;width:${d}px;height:${d}px;background:${c};border-radius:50%;box-shadow:0 0 10px ${c};animation:${k}-t ${t}s infinite steps(5, end)}.${k} span:nth-child(1){top:10%;left:10%;animation-name:${k}-t1}.${k} span:nth-child(2){bottom:10%;right:10%;animation-name:${k}-t2}@keyframes ${k}-t1{0%{top:10%;left:10%}25%{top:80%;left:10%}50%{top:80%;left:80%}75%{top:10%;left:80%}100%{top:10%;left:10%}}@keyframes ${k}-t2{0%{bottom:10%;right:10%}25%{bottom:80%;right:10%}50%{bottom:80%;right:80%}75%{bottom:10%;right:80%}100%{bottom:10%;right:10%}}`
      }
    }
  },
  {
    id: "orbital-station", name: "Orbital Station", category: "3D",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><div class="r"></div></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;perspective:${s*3}px}.${k} span{position:absolute;top:calc(50% - ${s*0.15}px);left:calc(50% - ${s*0.15}px);width:${s*0.3}px;height:${s*0.3}px;background:${c};border-radius:50%;box-shadow:inset -2px -2px 5px rgba(0,0,0,0.5)}.${k} .r{position:absolute;inset:0;border:${w}px solid ${c}33;border-top-color:${c};border-bottom-color:${c};border-radius:50%;animation:${k}-r ${t}s infinite linear;transform-style:preserve-3d}@keyframes ${k}-r{0%{transform:rotateX(70deg) rotateZ(0deg)}100%{transform:rotateX(70deg) rotateZ(360deg)}}`
    })
  },
  {
    id: "shuriken-spin", name: "Shuriken", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t*0.8}s infinite linear}.${k} span{position:absolute;top:25%;left:25%;width:50%;height:50%;background:${c};clip-path:polygon(50% 0%, 100% 100%, 0% 100%);transform-origin:50% 100%;box-shadow:0 0 8px ${c}}.${k} span:nth-child(1){transform:rotate(0deg) translateY(-50%)}.${k} span:nth-child(2){transform:rotate(90deg) translateY(-50%)}.${k} span:nth-child(3){transform:rotate(180deg) translateY(-50%)}.${k} span:nth-child(4){transform:rotate(270deg) translateY(-50%)}@keyframes ${k}-r{to{transform:rotate(360deg)}}`
    })
  },
  {
    id: "meteor-shower", name: "Meteor Shower", category: "Wave",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s*1.5}px;height:${s*1.5}px;overflow:hidden;transform:rotate(-45deg)}.${k} span{position:absolute;top:50%;left:-50%;width:100%;height:2px;background:linear-gradient(90deg, #0000, ${c}, #fff);animation:${k}-m ${t}s infinite linear}.${k} span:nth-child(1){top:20%;animation-delay:0s}.${k} span:nth-child(2){top:50%;animation-delay:${t*0.4}s}.${k} span:nth-child(3){top:80%;animation-delay:${t*0.8}s}@keyframes ${k}-m{0%{transform:translateX(-100%);opacity:1}100%{transform:translateX(100%);opacity:0}}`
    })
  },
  {
    id: "plasma-core", name: "Plasma Core", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:radial-gradient(circle, ${c} 10%, #0000 60%);box-shadow:0 0 ${s*0.3}px ${c}, inset 0 0 ${s*0.2}px ${c};animation:${k}-p ${t*0.5}s infinite alternate ease-in-out, ${k}-s ${t*2}s infinite linear}@keyframes ${k}-p{0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(1.2);opacity:1}}@keyframes ${k}-s{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(90deg)}}`
    })
  },
  {
    id: "gravity-well", name: "Gravity Well", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;inset:0;border:${w}px solid ${c}33;border-radius:50%;animation:${k}-g ${t*2}s infinite cubic-bezier(0.5,0,0.5,1)}.${k} span:nth-child(2){animation-delay:${t*0.6}s}.${k} span:nth-child(3){animation-delay:${t*1.2}s}.${k}::after{content:"";position:absolute;top:calc(50% - ${s*0.1}px);left:calc(50% - ${s*0.1}px);width:${s*0.2}px;height:${s*0.2}px;background:${c};border-radius:50%;box-shadow:0 0 ${s*0.2}px ${c}}@keyframes ${k}-g{0%{transform:scale(1);opacity:0}50%{opacity:1;border-color:${c}}100%{transform:scale(0);opacity:0}}`
    })
  },
  {
    id: "sonic-boom", name: "Sonic Boom", category: "Wave",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center}.${k}::before,.${k}::after{content:"";position:absolute;width:10%;height:100%;border-radius:50%;border:${w}px solid ${c};animation:${k}-s ${t}s infinite ease-out}.${k}::after{animation-delay:${t/2}s}@keyframes ${k}-s{0%{transform:scaleX(0.1);opacity:1}100%{transform:scaleX(2);opacity:0}}`
    })
  },

  // ════════════ BATCH 6 — PREMIUM (curated) ════════════
  // ── Spinners ──
  {
    id: "halo-spin", name: "Halo", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(from 0deg,#0000,${c});-webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - ${w * 1.5}px),#000 0);mask:radial-gradient(farthest-side,#0000 calc(100% - ${w * 1.5}px),#000 0);filter:drop-shadow(0 0 ${w}px ${c});animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "comet-ring", name: "Comet Ring", category: "Spinners",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;border:${w}px solid ${faint(c)};border-radius:50%;animation:${k}-r ${t}s linear infinite}.${k} span{position:absolute;top:-${w}px;left:calc(50% - ${w}px);width:${w * 2}px;height:${w * 2}px;background:${c};border-radius:50%;box-shadow:0 0 ${w * 3}px ${c}}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "twin-glow-orbit", name: "Twin Glow", category: "Spinners",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 5);
      return {
        html: `<div class="${k}"><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px;animation:${k}-r ${t}s linear infinite}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;border-radius:50%;background:${c};box-shadow:0 0 ${d}px ${c}}.${k} span:nth-child(1){transform:translateX(-${s / 2 - d / 2}px)}.${k} span:nth-child(2){transform:translateX(${s / 2 - d / 2}px);background:#fff}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
      };
    },
  },
  // ── Dots ──
  {
    id: "dots-wave-glow", name: "Glow Wave", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 7);
      return {
        html: `<div class="${k}">${"<span></span>".repeat(5)}</div>`,
        css: `.${k}{display:inline-flex;gap:${d * 0.7}px;align-items:center;height:${s}px}.${k} span{width:${d}px;height:${d}px;border-radius:50%;background:${c};box-shadow:0 0 ${d}px ${c};animation:${k}-w ${t}s ease-in-out infinite}${delays(`.${k} span`, 5, t / 10)}@keyframes ${k}-w{0%,100%{transform:translateY(${s * 0.18}px) scale(.7);opacity:.5}50%{transform:translateY(-${s * 0.18}px) scale(1);opacity:1}}`,
      };
    },
  },
  {
    id: "dots-ring-chase", name: "Ring Chase", category: "Dots",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(5, s / 7);
      let pos = "", del = "";
      for (let i = 0; i < 6; i++) { pos += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 60}deg)}`; del += `.${k} span:nth-child(${i + 1})::before{animation-delay:${((i * t) / 6).toFixed(2)}s}`; }
      return {
        html: `<div class="${k}">${"<span></span>".repeat(6)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:0;left:calc(50% - ${d / 2}px);width:${d}px;height:${s / 2}px;transform-origin:${d / 2}px ${s / 2}px}.${k} span::before{content:"";display:block;width:${d}px;height:${d}px;border-radius:50%;background:${c};box-shadow:0 0 ${d}px ${c};animation:${k}-p ${t}s ease-in-out infinite}${pos}${del}@keyframes ${k}-p{0%,100%{transform:scale(.3);opacity:.3}50%{transform:scale(1);opacity:1}}`,
      };
    },
  },
  // ── Bars ──
  {
    id: "bars-spectrum", name: "Spectrum", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const bw = Math.max(3, w);
      return {
        html: `<div class="${k}">${"<span></span>".repeat(6)}</div>`,
        css: `.${k}{display:inline-flex;gap:${bw * 0.7}px;align-items:flex-end;height:${s}px}.${k} span{width:${bw}px;height:100%;border-radius:${bw}px;background:linear-gradient(${c},${faint(c)});box-shadow:0 0 ${bw}px ${c}66;transform-origin:bottom;animation:${k}-e ${t}s ease-in-out infinite}${delays(`.${k} span`, 6, t / 12)}@keyframes ${k}-e{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}`,
      };
    },
  },
  {
    id: "bars-liquid", name: "Liquid Bars", category: "Bars",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      const bw = Math.max(4, w * 1.4);
      return {
        html: `<div class="${k}">${"<span></span>".repeat(4)}</div>`,
        css: `.${k}{display:inline-flex;gap:${bw * 0.6}px;align-items:flex-end;height:${s}px}.${k} span{width:${bw}px;height:100%;border-radius:${bw}px ${bw}px ${bw * 0.4}px ${bw * 0.4}px;background:linear-gradient(${c},${c}aa);box-shadow:inset 0 ${w}px ${w}px #ffffff44,0 0 ${bw}px ${c}55;transform-origin:bottom;animation:${k}-l ${t}s cubic-bezier(.4,0,.2,1) infinite}${delays(`.${k} span`, 4, t / 8)}@keyframes ${k}-l{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`,
      };
    },
  },
  // ── Wave ──
  {
    id: "wave-neon-flow", name: "Neon Flow", category: "Wave",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s * 2.4}px;height:${w + 4}px;border-radius:${w}px;background:linear-gradient(90deg,${faint(c)},${c},#fff,${c},${faint(c)});background-size:200% 100%;box-shadow:0 0 ${w * 2}px ${c}66;animation:${k}-f ${t}s linear infinite}@keyframes ${k}-f{to{background-position:-200% 0}}`,
    }),
  },
  {
    id: "ripple-glow", name: "Glow Ripple", category: "Wave",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;inset:0;border:${w}px solid ${c};border-radius:50%;box-shadow:0 0 ${w * 2}px ${c},inset 0 0 ${w * 2}px ${c};animation:${k}-r ${(t * 1.6).toFixed(2)}s cubic-bezier(0,.5,.5,1) infinite}.${k} span:nth-child(2){animation-delay:${(t * 0.5).toFixed(2)}s}.${k} span:nth-child(3){animation-delay:${t.toFixed(2)}s}@keyframes ${k}-r{0%{transform:scale(.1);opacity:1}100%{transform:scale(1);opacity:0}}`,
    }),
  },
  // ── Progress ──
  {
    id: "progress-aurora", name: "Aurora Bar", category: "Progress",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s * 3}px;height:${w + 2}px;background:${faint(c)};border-radius:${w}px;overflow:hidden}.${k}::before{content:"";position:absolute;top:0;height:100%;width:40%;background:linear-gradient(90deg,#0000,${c},#fff,${c},#0000);box-shadow:0 0 ${w * 2}px ${c};border-radius:${w}px;animation:${k}-a ${(t * 1.4).toFixed(2)}s cubic-bezier(.4,0,.2,1) infinite}@keyframes ${k}-a{0%{left:-40%}100%{left:100%}}`,
    }),
  },
  {
    id: "progress-glow-dots", name: "Glow Dot Bar", category: "Progress",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = Math.max(6, s / 5);
      return {
        html: `<div class="${k}">${"<span></span>".repeat(5)}</div>`,
        css: `.${k}{display:inline-flex;gap:${d * 0.6}px}.${k} span{width:${d}px;height:${d}px;border-radius:50%;background:${faint(c)};animation:${k}-g ${t}s ease-in-out infinite}${delays(`.${k} span`, 5, t / 10)}@keyframes ${k}-g{0%,100%{background:${faint(c)};box-shadow:none}40%{background:${c};box-shadow:0 0 ${d}px ${c}}}`,
      };
    },
  },
  // ── Geometric ──
  {
    id: "hex-orbit", name: "Hex Orbit", category: "Geometric",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"><i></i></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center}.${k}::before{content:"";width:${s * 0.6}px;height:${s * 0.6}px;background:${c};clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);animation:${k}-p ${(t * 2).toFixed(2)}s ease-in-out infinite}.${k} i{position:absolute;top:0;left:calc(50% - ${w}px);width:${w * 2}px;height:${w * 2}px;border-radius:50%;background:#fff;box-shadow:0 0 ${w * 2}px ${c};transform-origin:${w}px ${s / 2}px;animation:${k}-r ${t}s linear infinite}@keyframes ${k}-r{to{transform:rotate(360deg)}}@keyframes ${k}-p{0%,100%{transform:scale(.85);opacity:.7}50%{transform:scale(1);opacity:1}}`,
    }),
  },
  {
    id: "prism-morph", name: "Prism Morph", category: "Geometric",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;background:linear-gradient(135deg,${c},${faint(c)});animation:${k}-m ${(t * 2).toFixed(2)}s ease-in-out infinite,${k}-r ${(t * 4).toFixed(2)}s linear infinite}@keyframes ${k}-m{0%,100%{clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)}50%{clip-path:polygon(25% 0,100% 0,75% 100%,0 100%)}}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  // ── 3D ──
  {
    id: "cube-glow", name: "Glow Cube", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => {
      const h = s / 2;
      const tr = [`rotateY(0deg)`, `rotateY(90deg)`, `rotateY(180deg)`, `rotateY(270deg)`, `rotateX(90deg)`, `rotateX(-90deg)`];
      let faces = "";
      tr.forEach((r, i) => (faces += `.${k} span:nth-child(${i + 1}){transform:${r} translateZ(${h}px)}`));
      return {
        html: `<div class="${k}"><div class="b">${"<span></span>".repeat(6)}</div></div>`,
        css: `.${k}{width:${s}px;height:${s}px;perspective:${s * 4}px}.${k} .b{position:relative;width:100%;height:100%;transform-style:preserve-3d;animation:${k}-r ${(t * 3).toFixed(2)}s linear infinite}.${k} span{position:absolute;width:${s}px;height:${s}px;background:${c}22;border:1px solid ${c};box-shadow:inset 0 0 ${s * 0.3}px ${c}88}${faces}@keyframes ${k}-r{from{transform:rotateX(-22deg) rotateY(0)}to{transform:rotateX(-22deg) rotateY(360deg)}}`,
      };
    },
  },
  {
    id: "coin-edge", name: "Spinning Coin", category: "3D",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{width:${s}px;height:${s}px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff,${c} 60%,${c}99);box-shadow:0 0 ${s * 0.15}px ${c}88;animation:${k}-r ${t}s cubic-bezier(.45,0,.55,1) infinite}@keyframes ${k}-r{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}`,
    }),
  },
  // ── Gooey ──
  {
    id: "gooey-pendulum", name: "Gooey Pendulum", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.4;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/></filter></defs></svg><span></span><span></span><span></span></div>`,
        css: `.${k}{position:relative;width:${s * 1.6}px;height:${s}px;filter:url(#goo-${k})}.${k} span{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} span:nth-child(2){animation:${k}-l ${t}s ease-in-out infinite}.${k} span:nth-child(3){animation:${k}-r ${t}s ease-in-out infinite}@keyframes ${k}-l{0%,100%{transform:translateX(0)}50%{transform:translateX(-${s * 0.5}px)}}@keyframes ${k}-r{0%,100%{transform:translateX(0)}50%{transform:translateX(${s * 0.5}px)}}`,
      };
    },
  },
  {
    id: "gooey-nucleus", name: "Nucleus", category: "Gooey",
    build: ({ size: s, speed: t, color: c }, k) => {
      const d = s * 0.3;
      return {
        html: `<div class="${k}"><svg width="0" height="0" style="position:absolute"><defs><filter id="goo-${k}"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"/></filter></defs></svg><div class="g"><i></i><i></i><i></i><b></b></div></div>`,
        css: `.${k}{width:${s}px;height:${s}px}.${k} .g{position:relative;width:100%;height:100%;filter:url(#goo-${k});animation:${k}-r ${(t * 3).toFixed(2)}s linear infinite}.${k} b,.${k} i{position:absolute;top:calc(50% - ${d / 2}px);left:calc(50% - ${d / 2}px);width:${d}px;height:${d}px;background:${c};border-radius:50%}.${k} i:nth-child(1){animation:${k}-o1 ${(t * 1.5).toFixed(2)}s ease-in-out infinite alternate}.${k} i:nth-child(2){animation:${k}-o2 ${(t * 1.5).toFixed(2)}s ease-in-out infinite alternate -.5s}.${k} i:nth-child(3){animation:${k}-o3 ${(t * 1.5).toFixed(2)}s ease-in-out infinite alternate -1s}@keyframes ${k}-r{to{transform:rotate(360deg)}}@keyframes ${k}-o1{to{transform:translateX(${s * 0.32}px)}}@keyframes ${k}-o2{to{transform:translate(-${s * 0.28}px,${s * 0.2}px)}}@keyframes ${k}-o3{to{transform:translate(-${s * 0.28}px,-${s * 0.2}px)}}`,
      };
    },
  },
  // ── Misc ──
  {
    id: "black-hole", name: "Black Hole", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => ({
      html: `<div class="${k}"></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(${c},${faint(c)},#0000 75%);filter:drop-shadow(0 0 ${w * 2}px ${c}88);animation:${k}-r ${t}s linear infinite}.${k}::after{content:"";position:absolute;inset:30%;background:#0b1220;border-radius:50%;box-shadow:inset 0 0 ${w * 2}px #000}@keyframes ${k}-r{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "pulse-core", name: "Pulse Core", category: "Misc",
    build: ({ size: s, speed: t, color: c }, k) => ({
      html: `<div class="${k}"><span></span><span></span></div>`,
      css: `.${k}{position:relative;width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center}.${k}::after{content:"";width:${s * 0.4}px;height:${s * 0.4}px;border-radius:50%;background:${c};box-shadow:0 0 ${s * 0.3}px ${c};animation:${k}-p ${t}s ease-in-out infinite}.${k} span{position:absolute;inset:0;border:2px solid ${c};border-radius:50%;animation:${k}-e ${t}s ease-out infinite}.${k} span:nth-child(2){animation-delay:${(t * 0.5).toFixed(2)}s}@keyframes ${k}-p{0%,100%{transform:scale(.7);opacity:.7}50%{transform:scale(1);opacity:1}}@keyframes ${k}-e{0%{transform:scale(.3);opacity:1}100%{transform:scale(1);opacity:0}}`,
    }),
  },
  {
    id: "spark-burst", name: "Spark Burst", category: "Misc",
    build: ({ size: s, speed: t, thickness: w, color: c }, k) => {
      let sp = "";
      for (let i = 0; i < 8; i++) { sp += `.${k} span:nth-child(${i + 1}){transform:rotate(${i * 45}deg)}.${k} span:nth-child(${i + 1})::after{animation-delay:${((i * t) / 8).toFixed(2)}s}`; }
      return {
        html: `<div class="${k}">${"<span></span>".repeat(8)}</div>`,
        css: `.${k}{position:relative;width:${s}px;height:${s}px}.${k} span{position:absolute;top:calc(50% - ${w / 2}px);left:50%;width:50%;height:${w}px;transform-origin:0 50%}.${k} span::after{content:"";position:absolute;right:0;width:60%;height:100%;background:linear-gradient(90deg,#0000,${c});border-radius:${w}px;box-shadow:0 0 ${w * 2}px ${c};animation:${k}-b ${t}s ease-in-out infinite}${sp}@keyframes ${k}-b{0%,100%{opacity:.15;transform:scaleX(.3)}50%{opacity:1;transform:scaleX(1)}}`,
      };
    },
  },
];
