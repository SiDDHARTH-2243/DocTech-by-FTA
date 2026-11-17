// Scalable pure-CSS checkbox registry. Each checkbox is parametric on
// CheckboxParams, so the same definitions power the grid (default params) and
// the customization modal (live params). Add a new entry here and it appears
// in the grid + filter. Mirrors the loaders.ts architecture.

export interface CheckboxParams {
  size: number; // px — box edge
  color: string; // accent / checked color (#rrggbb)
  radius: number; // px — corner radius
  speed: number; // seconds — transition / animation duration
  bg: string; // canvas background (#rrggbb) — applied by the canvas, not by build()
}

export const DEFAULT_PARAMS: CheckboxParams = {
  size: 30,
  color: "#f97316",
  radius: 7,
  speed: 0.35,
  bg: "#1e293b",
};

export const CATEGORIES = [
  "All",
  "Classic",
  "Rounded",
  "Fill",
  "Animated",
  "Outline",
  "Gradient",
  "Neon",
  "Glass",
  "Material",
  "3D",
  "Playful",
] as const;

export interface CheckboxDef {
  id: string;
  name: string;
  category: (typeof CATEGORIES)[number];
  /** Build scoped CSS + HTML. `k` scopes the class name + @keyframes names. */
  build: (p: CheckboxParams, k: string) => { css: string; html: string };
}

// Helpers ----------------------------------------------------------------------
const faint = (c: string) => `${c}33`; // ~20% alpha track/border
const bw = (s: number) => Math.max(2, Math.round(s * 0.08)); // border thickness
const sw = (s: number) => Math.max(2, Math.round(s * 0.09)); // checkmark stroke
/** A classic rotated-border checkmark drawn on a pseudo-element selector. */
const tick = (s: number, col: string, sel: string) =>
  `${sel}{content:"";position:absolute;left:${(s * 0.36).toFixed(1)}px;top:${(s * 0.15).toFixed(1)}px;width:${(s * 0.22).toFixed(1)}px;height:${(s * 0.44).toFixed(1)}px;border:solid ${col};border-width:0 ${sw(s)}px ${sw(s)}px 0;box-sizing:border-box;transform:rotate(45deg)}`;
/** Base reset shared by input-only checkboxes. */
const base = (s: number, r: number) =>
  `appearance:none;-webkit-appearance:none;margin:0;width:${s}px;height:${s}px;border-radius:${r}px;cursor:pointer;position:relative;box-sizing:border-box;flex:none`;

export const CHECKBOXES: CheckboxDef[] = [
  // ── Classic ────────────────────────────────────────────────────────────────
  {
    id: "classic-check", name: "Classic Check", category: "Classic",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{background:${c}}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "classic-soft", name: "Soft Check", category: "Classic",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${faint(c)};transition:background ${t}s,border-color ${t}s}.${k}:checked{background:${faint(c)};border-color:${c}}${tick(s, c, `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "classic-tick", name: "Tick Only", category: "Classic",
    build: ({ size: s, color: c, radius: r }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c}}${tick(s, c, `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "classic-square", name: "Inner Square", category: "Classic",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c}}.${k}::after{content:"";position:absolute;inset:${Math.round(s * 0.22)}px;border-radius:${Math.max(1, r - 3)}px;background:${c};transform:scale(0);transition:transform ${t}s}.${k}:checked::after{transform:scale(1)}`,
    }),
  },
  {
    id: "classic-dash", name: "Dash", category: "Classic",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{background:${c}}.${k}:checked::after{content:"";position:absolute;left:25%;top:calc(50% - ${sw(s) / 2}px);width:50%;height:${sw(s)}px;border-radius:${sw(s)}px;background:#fff}`,
    }),
  },
  {
    id: "classic-cross", name: "Cross", category: "Classic",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{background:${c}}.${k}:checked::before,.${k}:checked::after{content:"";position:absolute;left:25%;top:calc(50% - ${sw(s) / 2}px);width:50%;height:${sw(s)}px;border-radius:${sw(s)}px;background:#fff}.${k}:checked::before{transform:rotate(45deg)}.${k}:checked::after{transform:rotate(-45deg)}`,
    }),
  },
  {
    id: "classic-dot", name: "Dot", category: "Classic",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c}}.${k}::after{content:"";position:absolute;inset:30%;border-radius:50%;background:${c};transform:scale(0);transition:transform ${t}s}.${k}:checked::after{transform:scale(1)}`,
    }),
  },
  {
    id: "classic-invert", name: "Bold Invert", category: "Classic",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s) + 1}px solid ${c};transition:background ${t}s,box-shadow ${t}s}.${k}:checked{background:${c};box-shadow:0 0 0 2px ${faint(c)}}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },

  // ── Rounded ────────────────────────────────────────────────────────────────
  {
    id: "round-check", name: "Round Check", category: "Rounded",
    build: ({ size: s, color: c, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, 0)};border-radius:50%;border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{background:${c}}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "round-tick", name: "Round Tick", category: "Rounded",
    build: ({ size: s, color: c }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, 0)};border-radius:50%;border:${bw(s)}px solid ${c}}${tick(s, c, `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "round-radio", name: "Radio Dot", category: "Rounded",
    build: ({ size: s, color: c, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, 0)};border-radius:50%;border:${bw(s)}px solid ${c}}.${k}::after{content:"";position:absolute;inset:25%;border-radius:50%;background:${c};transform:scale(0);transition:transform ${t}s}.${k}:checked::after{transform:scale(1)}`,
    }),
  },
  {
    id: "round-ring", name: "Ring", category: "Rounded",
    build: ({ size: s, color: c, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, 0)};border-radius:50%;border:${bw(s)}px solid ${faint(c)};transition:border-color ${t}s,border-width ${t}s}.${k}:checked{border-color:${c};border-width:${Math.round(s * 0.28)}px}`,
    }),
  },
  {
    id: "pill", name: "Pill", category: "Rounded",
    build: ({ size: s, color: c, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s * 1.5, s)};border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{background:${c}}${tick(s, "#fff", `.${k}:checked::after`).replace(`left:${(s * 0.36).toFixed(1)}px`, `left:${(s * 0.62).toFixed(1)}px`)}`,
    }),
  },
  {
    id: "round-pop", name: "Round Pop", category: "Rounded",
    build: ({ size: s, color: c, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, 0)};border-radius:50%;border:${bw(s)}px solid ${c};transition:background ${t}s,transform ${t}s cubic-bezier(.68,-.55,.27,1.55)}.${k}:checked{background:${c};transform:scale(1.12)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "round-soft", name: "Round Soft", category: "Rounded",
    build: ({ size: s, color: c, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, 0)};border-radius:50%;border:${bw(s)}px solid ${faint(c)};transition:background ${t}s,border-color ${t}s}.${k}:checked{background:${faint(c)};border-color:${c}}${tick(s, c, `.${k}:checked::after`)}`,
    }),
  },

  // ── Fill ───────────────────────────────────────────────────────────────────
  {
    id: "fill-slide-left", name: "Slide In", category: "Fill",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};overflow:hidden}.${k}::before{content:"";position:absolute;inset:0;background:${c};transform:translateX(-100%);transition:transform ${t}s}.${k}:checked::before{transform:translateX(0)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "fill-slide-up", name: "Slide Up", category: "Fill",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};overflow:hidden}.${k}::before{content:"";position:absolute;inset:0;background:${c};transform:translateY(100%);transition:transform ${t}s}.${k}:checked::before{transform:translateY(0)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "fill-zoom", name: "Zoom Fill", category: "Fill",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};overflow:hidden}.${k}::before{content:"";position:absolute;inset:0;background:${c};border-radius:${r}px;transform:scale(0);transition:transform ${t}s}.${k}:checked::before{transform:scale(1)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "fill-iris", name: "Iris", category: "Fill",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};overflow:hidden}.${k}::before{content:"";position:absolute;inset:0;background:${c};border-radius:50%;transform:scale(0);transition:transform ${t}s,border-radius ${t}s}.${k}:checked::before{transform:scale(1.6);border-radius:0}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "fill-corner", name: "Corner Fill", category: "Fill",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};overflow:hidden}.${k}::before{content:"";position:absolute;top:0;left:0;width:200%;height:200%;background:${c};transform:translate(-100%,-100%);transition:transform ${t}s}.${k}:checked::before{transform:translate(-25%,-25%)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "fill-diagonal", name: "Diagonal Wipe", category: "Fill",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};overflow:hidden}.${k}::before{content:"";position:absolute;inset:-20%;background:${c};clip-path:polygon(0 0,0 0,0 100%);transition:clip-path ${t}s}.${k}:checked::before{clip-path:polygon(0 0,200% 0,0 200%)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "fill-split", name: "Split Fill", category: "Fill",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};overflow:hidden}.${k}::before,.${k}::after{content:"";position:absolute;width:100%;height:50%;background:${c};transition:transform ${t}s}.${k}::before{top:0;transform:translateY(-100%)}.${k}::after{bottom:0;transform:translateY(100%)}.${k}:checked::before,.${k}:checked::after{transform:translateY(0)}`,
    }),
  },

  // ── Animated ───────────────────────────────────────────────────────────────
  {
    id: "draw-check", name: "Draw Check", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<label class="${k}"><input type="checkbox" checked><span class="b"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg></span></label>`,
      css: `.${k}{display:inline-block;cursor:pointer;line-height:0}.${k} input{display:none}.${k} .b{display:flex;align-items:center;justify-content:center;width:${s}px;height:${s}px;border:${bw(s)}px solid ${c};border-radius:${r}px;box-sizing:border-box;transition:background ${t}s}.${k} svg{width:72%;height:72%;fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:24;stroke-dashoffset:24;transition:stroke-dashoffset ${t}s ease ${(t * 0.5).toFixed(2)}s}.${k} input:checked+.b{background:${c}}.${k} input:checked+.b svg{stroke-dashoffset:0}`,
    }),
  },
  {
    id: "draw-outline-check", name: "Draw Outline", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<label class="${k}"><input type="checkbox" checked><span class="b"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg></span></label>`,
      css: `.${k}{display:inline-block;cursor:pointer;line-height:0}.${k} input{display:none}.${k} .b{display:flex;align-items:center;justify-content:center;width:${s}px;height:${s}px;border:${bw(s)}px solid ${faint(c)};border-radius:${r}px;box-sizing:border-box;transition:border-color ${t}s}.${k} svg{width:74%;height:74%;fill:none;stroke:${c};stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:24;stroke-dashoffset:24;transition:stroke-dashoffset ${t}s ease}.${k} input:checked+.b{border-color:${c}}.${k} input:checked+.b svg{stroke-dashoffset:0}`,
    }),
  },
  {
    id: "bounce-check", name: "Bounce", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{background:${c}}${tick(s, "#fff", `.${k}:checked::after`)}.${k}:checked::after{animation:${k}-b ${t}s ease}@keyframes ${k}-b{0%{transform:rotate(45deg) scale(0)}60%{transform:rotate(45deg) scale(1.4)}100%{transform:rotate(45deg) scale(1)}}`,
    }),
  },
  {
    id: "pop-scale", name: "Pop", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c}}.${k}:checked{background:${c};animation:${k}-p ${t}s cubic-bezier(.68,-.55,.27,1.55)}${tick(s, "#fff", `.${k}:checked::after`)}@keyframes ${k}-p{0%{transform:scale(.6)}50%{transform:scale(1.2)}100%{transform:scale(1)}}`,
    }),
  },
  {
    id: "rotate-check", name: "Rotate In", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{background:${c}}${tick(s, "#fff", `.${k}:checked::after`)}.${k}:checked::after{animation:${k}-r ${t}s ease}@keyframes ${k}-r{0%{transform:rotate(-90deg) scale(0)}100%{transform:rotate(45deg) scale(1)}}`,
    }),
  },
  {
    id: "flip-3d", name: "Flip", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:transform ${t}s,background ${t}s}.${k}:checked{background:${c};transform:rotateY(360deg)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "jelly", name: "Jelly", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c}}.${k}:checked{background:${c};animation:${k}-j ${(t * 1.4).toFixed(2)}s ease}${tick(s, "#fff", `.${k}:checked::after`)}@keyframes ${k}-j{0%{transform:scale(1,1)}30%{transform:scale(1.25,.75)}50%{transform:scale(.85,1.15)}70%{transform:scale(1.05,.95)}100%{transform:scale(1,1)}}`,
    }),
  },
  {
    id: "expand-border", name: "Border Expand", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};box-shadow:inset 0 0 0 ${bw(s)}px ${c};transition:box-shadow ${t}s}.${k}:checked{box-shadow:inset 0 0 0 ${Math.round(s / 2)}px ${c}}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },

  // ── Outline ────────────────────────────────────────────────────────────────
  {
    id: "outline-thick", name: "Thick Outline", category: "Outline",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${Math.round(s * 0.13)}px solid ${faint(c)};transition:border-color ${t}s}.${k}:checked{border-color:${c}}${tick(s, c, `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "outline-double", name: "Double Outline", category: "Outline",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px double ${c};transition:background ${t}s}.${k}:checked{background:${faint(c)}}${tick(s, c, `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "outline-dashed", name: "Dashed", category: "Outline",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px dashed ${c};transition:background ${t}s}.${k}:checked{background:${faint(c)}}${tick(s, c, `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "outline-dotted", name: "Dotted", category: "Outline",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${Math.max(2, sw(s))}px dotted ${c};transition:background ${t}s}.${k}:checked{background:${faint(c)}}${tick(s, c, `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "outline-offset", name: "Offset Ring", category: "Outline",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s,box-shadow ${t}s}.${k}:checked{background:${c};box-shadow:0 0 0 3px ${c}55}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "outline-corner", name: "Corner Brackets", category: "Outline",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<label class="${k}"><input type="checkbox" checked><span class="b"></span></label>`,
      css: `.${k}{display:inline-block;cursor:pointer;line-height:0}.${k} input{display:none}.${k} .b{display:block;position:relative;width:${s}px;height:${s}px;box-sizing:border-box;border:${bw(s)}px solid ${faint(c)};border-radius:${r}px;transition:border-color ${t}s}.${k} .b::after{content:"";position:absolute;left:${(s * 0.36).toFixed(1)}px;top:${(s * 0.15).toFixed(1)}px;width:${(s * 0.22).toFixed(1)}px;height:${(s * 0.44).toFixed(1)}px;border:solid ${c};border-width:0 ${sw(s)}px ${sw(s)}px 0;box-sizing:border-box;transform:rotate(45deg) scale(0);transition:transform ${t}s}.${k} input:checked+.b{border-color:${c}}.${k} input:checked+.b::after{transform:rotate(45deg) scale(1)}`,
    }),
  },

  // ── Gradient ───────────────────────────────────────────────────────────────
  {
    id: "gradient-fill", name: "Gradient Fill", category: "Gradient",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{border-color:transparent;background:linear-gradient(135deg,${c},${c}66)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "gradient-vivid", name: "Vivid", category: "Gradient",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${faint(c)};transition:background ${t}s,border-color ${t}s}.${k}:checked{border-color:transparent;background:linear-gradient(135deg,#ec4899,${c},#f59e0b)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "gradient-radial", name: "Radial", category: "Gradient",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{border-color:transparent;background:radial-gradient(circle at 30% 30%,${c}ff,${c}55)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "gradient-border", name: "Gradient Border", category: "Gradient",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<label class="${k}"><input type="checkbox" checked><span class="b"></span></label>`,
      css: `.${k}{display:inline-block;cursor:pointer;line-height:0}.${k} input{display:none}.${k} .b{display:block;position:relative;width:${s}px;height:${s}px;box-sizing:border-box;border-radius:${r}px;background:#0000;padding:${bw(s)}px;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;background-image:linear-gradient(135deg,${c},#ec4899);transition:padding ${t}s}.${k} .b::after{content:"";position:absolute;left:${(s * 0.36).toFixed(1)}px;top:${(s * 0.15).toFixed(1)}px;width:${(s * 0.22).toFixed(1)}px;height:${(s * 0.44).toFixed(1)}px;border:solid ${c};border-width:0 ${sw(s)}px ${sw(s)}px 0;box-sizing:border-box;transform:rotate(45deg) scale(0);transition:transform ${t}s}.${k} input:checked+.b::after{transform:rotate(45deg) scale(1)}`,
    }),
  },
  {
    id: "gradient-shift", name: "Shifting", category: "Gradient",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${faint(c)}}.${k}:checked{border-color:transparent;background:linear-gradient(90deg,${c},#ec4899,${c});background-size:200% 100%;animation:${k}-g ${(t * 4).toFixed(2)}s linear infinite}${tick(s, "#fff", `.${k}:checked::after`)}@keyframes ${k}-g{to{background-position:200% 0}}`,
    }),
  },
  {
    id: "gradient-ocean", name: "Ocean", category: "Gradient",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${faint(c)};transition:background ${t}s,border-color ${t}s}.${k}:checked{border-color:transparent;background:linear-gradient(135deg,#06b6d4,#3b82f6,#6366f1)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },

  // ── Neon ───────────────────────────────────────────────────────────────────
  {
    id: "neon-glow", name: "Neon Glow", category: "Neon",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s,box-shadow ${t}s}.${k}:checked{background:${c};box-shadow:0 0 ${Math.round(s * 0.4)}px ${c}}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "neon-outline", name: "Neon Outline", category: "Neon",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:box-shadow ${t}s}.${k}:checked{box-shadow:0 0 ${Math.round(s * 0.3)}px ${c},inset 0 0 ${Math.round(s * 0.25)}px ${c}88}${tick(s, c, `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "neon-pulse", name: "Neon Pulse", category: "Neon",
    build: ({ size: s, color: c, radius: r }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c}}.${k}:checked{background:${c};animation:${k}-p 1.4s ease-in-out infinite}${tick(s, "#fff", `.${k}:checked::after`)}@keyframes ${k}-p{0%,100%{box-shadow:0 0 ${Math.round(s * 0.2)}px ${c}}50%{box-shadow:0 0 ${Math.round(s * 0.6)}px ${c}}}`,
    }),
  },
  {
    id: "neon-check", name: "Neon Tick", category: "Neon",
    build: ({ size: s, color: c, radius: r }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${faint(c)}}.${k}:checked{border-color:${c};box-shadow:0 0 ${Math.round(s * 0.3)}px ${c}55}${tick(s, c, `.${k}:checked::after`)}.${k}:checked::after{filter:drop-shadow(0 0 ${Math.round(s * 0.12)}px ${c})}`,
    }),
  },
  {
    id: "cyber", name: "Cyber", category: "Neon",
    build: ({ size: s, color: c, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, 0)};border:${bw(s)}px solid ${c};clip-path:polygon(0 0,100% 0,100% 70%,70% 100%,0 100%);transition:background ${t}s,box-shadow ${t}s}.${k}:checked{background:${c};box-shadow:0 0 ${Math.round(s * 0.35)}px ${c}}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },

  // ── 3D ─────────────────────────────────────────────────────────────────────
  {
    id: "push-3d", name: "Push Button", category: "3D",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:none;background:${faint(c)};box-shadow:0 ${Math.round(s * 0.14)}px 0 ${c}99;transition:transform ${t}s,box-shadow ${t}s,background ${t}s}.${k}:checked{background:${c};transform:translateY(${Math.round(s * 0.12)}px);box-shadow:0 ${Math.round(s * 0.02)}px 0 ${c}99}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "emboss", name: "Emboss", category: "3D",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};background:${c};box-shadow:inset 2px 2px 4px #0006,inset -2px -2px 4px #ffffff44;transition:box-shadow ${t}s}.${k}:checked{box-shadow:inset -2px -2px 4px #0006,inset 2px 2px 4px #ffffff55}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "neumorph", name: "Neumorphic", category: "3D",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};background:#e0e5ec;box-shadow:5px 5px 10px #a3b1c6,-5px -5px 10px #fff;transition:box-shadow ${t}s}.${k}:checked{box-shadow:inset 4px 4px 8px #a3b1c6,inset -4px -4px 8px #fff}${tick(s, c, `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "glossy", name: "Glossy", category: "3D",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:1px solid ${c}99;background:linear-gradient(#ffffff22,#0000),${faint(c)};transition:background ${t}s}.${k}:checked{background:linear-gradient(#ffffff66,#0003),${c}}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "lifted", name: "Lifted", category: "3D",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:transform ${t}s,box-shadow ${t}s,background ${t}s}.${k}:checked{background:${c};transform:translateY(-${Math.round(s * 0.1)}px);box-shadow:0 ${Math.round(s * 0.16)}px ${Math.round(s * 0.2)}px ${c}55}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },

  // ── Playful ────────────────────────────────────────────────────────────────
  {
    id: "star", name: "Star", category: "Playful",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{background:${c}}.${k}::after{content:"";position:absolute;inset:18%;background:#fff;clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);transform:scale(0) rotate(-30deg);transition:transform ${t}s cubic-bezier(.68,-.55,.27,1.55)}.${k}:checked::after{transform:scale(1) rotate(0)}`,
    }),
  },
  {
    id: "diamond", name: "Diamond", category: "Playful",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{background:${c}}.${k}::after{content:"";position:absolute;inset:25%;background:#fff;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);transform:scale(0);transition:transform ${t}s}.${k}:checked::after{transform:scale(1)}`,
    }),
  },
  {
    id: "sparkle", name: "Sparkle", category: "Playful",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{background:${c}}.${k}::after{content:"";position:absolute;inset:16%;background:#fff;clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);transform:scale(0) rotate(90deg);transition:transform ${t}s ease}.${k}:checked::after{transform:scale(1) rotate(0)}`,
    }),
  },
  {
    id: "bubble-pop", name: "Bubble Pop", category: "Playful",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, 0)};border-radius:50%;border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{background:${c};animation:${k}-pop ${(t * 1.6).toFixed(2)}s ease}${tick(s, "#fff", `.${k}:checked::after`)}@keyframes ${k}-pop{0%{box-shadow:0 0 0 0 ${c}66}100%{box-shadow:0 0 0 ${Math.round(s * 0.5)}px ${c}00}}`,
    }),
  },
  {
    id: "heart", name: "Heart", category: "Playful",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s}.${k}:checked{background:${c}}.${k}::after{content:"";position:absolute;inset:20%;background:#fff;clip-path:polygon(50% 100%,8% 55%,8% 30%,28% 12%,50% 28%,72% 12%,92% 30%,92% 55%);transform:scale(0);transition:transform ${t}s cubic-bezier(.68,-.55,.27,1.55)}.${k}:checked::after{transform:scale(1.05)}`,
    }),
  },

  // ════════════ BATCH — Trendy / unique ════════════
  // ── Glass ──────────────────────────────────────────────────────────────────
  {
    id: "glass", name: "Glass", category: "Glass",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:1.5px solid #ffffff55;background:#ffffff1a;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);transition:background ${t}s,border-color ${t}s}.${k}:checked{background:${c}cc;border-color:${c}}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "glass-glow", name: "Glass Glow", category: "Glass",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:1.5px solid #ffffff55;background:#ffffff1a;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);transition:background ${t}s,box-shadow ${t}s}.${k}:checked{background:${c}aa;border-color:${c};box-shadow:0 0 ${Math.round(s * 0.4)}px ${c}}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "glass-tint", name: "Glass Tint", category: "Glass",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:1.5px solid #ffffff4d;background:linear-gradient(135deg,#ffffff33,#ffffff0d);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);transition:background ${t}s}.${k}:checked{background:linear-gradient(135deg,${c}dd,${c}77)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "glass-frost", name: "Frost", category: "Glass",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:1.5px solid ${c}88;background:#ffffff14;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);transition:box-shadow ${t}s,border-color ${t}s}.${k}:checked{border-color:${c};box-shadow:inset 0 0 ${Math.round(s * 0.3)}px ${c}66}${tick(s, c, `.${k}:checked::after`)}`,
    }),
  },

  // ── Material ───────────────────────────────────────────────────────────────
  {
    id: "material-ripple", name: "Ripple", category: "Material",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, Math.min(r, 4))};border:${bw(s)}px solid ${c};overflow:hidden;transition:background ${t}s}.${k}::before{content:"";position:absolute;inset:0;margin:auto;width:${Math.round(s * 0.2)}px;height:${Math.round(s * 0.2)}px;border-radius:50%;background:${c}55;transform:scale(0);transition:transform ${(t * 1.4).toFixed(2)}s ease}.${k}:checked{background:${c}}.${k}:checked::before{transform:scale(10);background:${c}00}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "material-elevated", name: "Elevated", category: "Material",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:none;background:${faint(c)};box-shadow:0 1px 3px #0003;transition:background ${t}s,box-shadow ${t}s,transform ${t}s}.${k}:checked{background:${c};box-shadow:0 ${Math.round(s * 0.12)}px ${Math.round(s * 0.2)}px ${c}66;transform:translateY(-1px)}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "progress-ring", name: "Progress Ring", category: "Material",
    build: ({ size: s, color: c, speed: t }, k) => ({
      html: `<label class="${k}"><input type="checkbox" checked><span class="b"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="16"/><path d="M11 18.5l4.5 4.5L25 13"/></svg></span></label>`,
      css: `.${k}{display:inline-block;cursor:pointer;line-height:0}.${k} input{display:none}.${k} .b{display:block;width:${s}px;height:${s}px}.${k} svg{width:100%;height:100%;fill:none;stroke-linecap:round}.${k} circle{stroke:${faint(c)};stroke-width:2.5}.${k} path{stroke:${c};stroke-width:3;stroke-linejoin:round;stroke-dasharray:24;stroke-dashoffset:24;transition:stroke-dashoffset ${t}s ease ${(t * 0.7).toFixed(2)}s}.${k} input:checked+.b circle{stroke:${c};animation:${k}-d ${t}s ease forwards}.${k} input:checked+.b path{stroke-dashoffset:0}@keyframes ${k}-d{from{stroke-dasharray:0 101}to{stroke-dasharray:101 0}}`,
    }),
  },

  // ── Animated (trendy) ──────────────────────────────────────────────────────
  {
    id: "spring-draw", name: "Spring Draw", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<label class="${k}"><input type="checkbox" checked><span class="b"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg></span></label>`,
      css: `.${k}{display:inline-block;cursor:pointer;line-height:0}.${k} input{display:none}.${k} .b{display:flex;align-items:center;justify-content:center;width:${s}px;height:${s}px;border:${bw(s)}px solid ${c};border-radius:${r}px;box-sizing:border-box;transition:background ${t}s}.${k} svg{width:72%;height:72%;fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:24;stroke-dashoffset:24;transition:stroke-dashoffset ${t}s ease ${(t * 0.35).toFixed(2)}s}.${k} input:checked+.b{background:${c};animation:${k}-pop ${t}s cubic-bezier(.68,-.55,.27,1.55)}.${k} input:checked+.b svg{stroke-dashoffset:0}@keyframes ${k}-pop{0%{transform:scale(.7)}55%{transform:scale(1.2)}100%{transform:scale(1)}}`,
    }),
  },
  {
    id: "stamp", name: "Stamp", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c}}.${k}:checked{background:${c};animation:${k}-st ${t}s cubic-bezier(.2,1.4,.4,1)}${tick(s, "#fff", `.${k}:checked::after`)}.${k}:checked::after{animation:${k}-sm ${t}s ease}@keyframes ${k}-st{0%{transform:scale(1.7) rotate(-12deg);opacity:.25}100%{transform:scale(1) rotate(0);opacity:1}}@keyframes ${k}-sm{0%,55%{opacity:0}100%{opacity:1}}`,
    }),
  },
  {
    id: "draw-circle", name: "Draw Circle", category: "Animated",
    build: ({ size: s, color: c, speed: t }, k) => ({
      html: `<label class="${k}"><input type="checkbox" checked><span class="b"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="16"/><path d="M11 18.5l4.5 4.5L25 13"/></svg></span></label>`,
      css: `.${k}{display:inline-block;cursor:pointer;line-height:0}.${k} input{display:none}.${k} .b{display:block;width:${s}px;height:${s}px}.${k} svg{width:100%;height:100%;fill:none;stroke:${c};stroke-linecap:round;stroke-linejoin:round}.${k} circle{stroke-width:2.5;stroke-dasharray:101;stroke-dashoffset:101;transition:stroke-dashoffset ${(t * 1.2).toFixed(2)}s ease}.${k} path{stroke-width:3;stroke-dasharray:24;stroke-dashoffset:24;transition:stroke-dashoffset ${t}s ease ${(t * 0.8).toFixed(2)}s}.${k} input:checked+.b circle{stroke-dashoffset:0}.${k} input:checked+.b path{stroke-dashoffset:0}`,
    }),
  },
  {
    id: "bounce-drop", name: "Drop In", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};overflow:hidden;transition:background ${t}s}.${k}:checked{background:${c}}${tick(s, "#fff", `.${k}:checked::after`)}.${k}:checked::after{animation:${k}-dp ${(t * 1.3).toFixed(2)}s cubic-bezier(.5,1.6,.4,1)}@keyframes ${k}-dp{0%{transform:translateY(-${s}px) rotate(45deg);opacity:0}50%{opacity:1}70%{transform:translateY(${Math.round(s * 0.08)}px) rotate(45deg)}100%{transform:translateY(0) rotate(45deg)}}`,
    }),
  },
  {
    id: "morph-square-circle", name: "Morph", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, 0)};border-radius:50%;border:${bw(s)}px solid ${c};transition:border-radius ${t}s,background ${t}s}.${k}:checked{border-radius:${r}px;background:${c}}${tick(s, "#fff", `.${k}:checked::after`)}`,
    }),
  },
  {
    id: "swing-in", name: "Swing In", category: "Animated",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c}}.${k}:checked{background:${c};animation:${k}-sw ${t}s ease}${tick(s, "#fff", `.${k}:checked::after`)}@keyframes ${k}-sw{0%{transform:perspective(220px) rotateY(-80deg);opacity:.2}100%{transform:perspective(220px) rotateY(0);opacity:1}}`,
    }),
  },

  // ── Gradient (trendy) ──────────────────────────────────────────────────────
  {
    id: "conic-border", name: "Conic Border", category: "Gradient",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<label class="${k}"><input type="checkbox" checked><span class="b"></span></label>`,
      css: `.${k}{display:inline-block;cursor:pointer;line-height:0}.${k} input{display:none}.${k} .b{position:relative;display:block;width:${s}px;height:${s}px;border-radius:${r}px;box-sizing:border-box}.${k} .b::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:${bw(s)}px;background:conic-gradient(${c},#ec4899,#8b5cf6,${c});-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}.${k} input:checked+.b::before{animation:${k}-sp ${(t * 5).toFixed(2)}s linear infinite}.${k} .b::after{content:"";position:absolute;left:${(s * 0.36).toFixed(1)}px;top:${(s * 0.15).toFixed(1)}px;width:${(s * 0.22).toFixed(1)}px;height:${(s * 0.44).toFixed(1)}px;border:solid ${c};border-width:0 ${sw(s)}px ${sw(s)}px 0;box-sizing:border-box;transform:rotate(45deg) scale(0);transition:transform ${t}s}.${k} input:checked+.b::after{transform:rotate(45deg) scale(1)}@keyframes ${k}-sp{to{transform:rotate(360deg)}}`,
    }),
  },
  {
    id: "holographic", name: "Holographic", category: "Gradient",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${faint(c)}}.${k}:checked{border-color:transparent;background:linear-gradient(115deg,#22d3ee,#a78bfa,#f472b6,#22d3ee);background-size:300% 300%;animation:${k}-ho ${(t * 6).toFixed(2)}s ease infinite}${tick(s, "#fff", `.${k}:checked::after`)}@keyframes ${k}-ho{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`,
    }),
  },
  {
    id: "shine-sweep", name: "Shine Sweep", category: "Gradient",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};overflow:hidden;transition:background ${t}s}.${k}:checked{background:${c}}.${k}:checked::before{content:"";position:absolute;top:0;left:-120%;width:60%;height:100%;background:linear-gradient(100deg,transparent,#ffffff99,transparent);animation:${k}-sh 1.8s ease-in-out infinite}${tick(s, "#fff", `.${k}:checked::after`)}@keyframes ${k}-sh{0%{left:-120%}60%,100%{left:140%}}`,
    }),
  },

  // ── Neon (trendy) ──────────────────────────────────────────────────────────
  {
    id: "glitch", name: "Glitch", category: "Neon",
    build: ({ size: s, color: c, radius: r }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c}}.${k}:checked{background:${c};animation:${k}-gl .4s steps(2) infinite}${tick(s, "#fff", `.${k}:checked::after`)}@keyframes ${k}-gl{0%{box-shadow:2px 0 #0ff,-2px 0 #f0f;transform:translateX(0)}33%{box-shadow:-2px 0 #0ff,2px 0 #f0f;transform:translateX(1px)}66%{box-shadow:1px 0 #0ff,-1px 0 #f0f;transform:translateX(-1px)}100%{box-shadow:2px 0 #0ff,-2px 0 #f0f;transform:translateX(0)}}`,
    }),
  },
  {
    id: "spotlight", name: "Spotlight", category: "Neon",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};overflow:hidden;transition:background ${t}s}.${k}:checked{background:${c}}.${k}:checked::before{content:"";position:absolute;inset:-50%;background:radial-gradient(circle,#ffffff80,transparent 60%);animation:${k}-sp ${(t * 4).toFixed(2)}s linear infinite}${tick(s, "#fff", `.${k}:checked::after`)}@keyframes ${k}-sp{0%{transform:translate(-30%,-30%)}50%{transform:translate(30%,30%)}100%{transform:translate(-30%,-30%)}}`,
    }),
  },
  {
    id: "laser-trace", name: "Laser Trace", category: "Neon",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<label class="${k}"><input type="checkbox" checked><span class="b"><i></i></span></label>`,
      css: `.${k}{display:inline-block;cursor:pointer;line-height:0}.${k} input{display:none}.${k} .b{position:relative;display:block;width:${s}px;height:${s}px;border:${bw(s)}px solid ${faint(c)};border-radius:${r}px;box-sizing:border-box;overflow:hidden;transition:border-color ${t}s}.${k} i{position:absolute;inset:-50%;border-radius:50%;background:conic-gradient(${c}00 0 78%,${c} 92%,${c}00 100%)}.${k} input:checked+.b{border-color:${c}44}.${k} input:checked+.b i{animation:${k}-sp ${(t * 3).toFixed(2)}s linear infinite}.${k} .b::after{content:"";position:absolute;left:${(s * 0.34).toFixed(1)}px;top:${(s * 0.14).toFixed(1)}px;width:${(s * 0.22).toFixed(1)}px;height:${(s * 0.42).toFixed(1)}px;border:solid ${c};border-width:0 ${sw(s)}px ${sw(s)}px 0;box-sizing:border-box;transform:rotate(45deg) scale(0);transition:transform ${t}s;z-index:1}.${k} input:checked+.b::after{transform:rotate(45deg) scale(1)}@keyframes ${k}-sp{to{transform:rotate(360deg)}}`,
    }),
  },

  // ── Fill (trendy) ──────────────────────────────────────────────────────────
  {
    id: "liquid-fill", name: "Liquid Fill", category: "Fill",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<label class="${k}"><input type="checkbox" checked><span class="b"><span class="w"></span></span></label>`,
      css: `.${k}{display:inline-block;cursor:pointer;line-height:0}.${k} input{display:none}.${k} .b{position:relative;display:block;width:${s}px;height:${s}px;border:${bw(s)}px solid ${c};border-radius:${r}px;box-sizing:border-box;overflow:hidden}.${k} .w{position:absolute;left:0;right:0;bottom:0;height:0;background:${c};transition:height ${(t * 1.5).toFixed(2)}s cubic-bezier(.5,0,.3,1)}.${k} .w::before{content:"";position:absolute;top:-${Math.round(s * 0.1)}px;left:0;width:100%;height:${Math.round(s * 0.2)}px;background:${c};border-radius:45%;animation:${k}-bob 1.6s ease-in-out infinite}.${k} input:checked+.b .w{height:118%}.${k} .b::after{content:"";position:absolute;left:${(s * 0.34).toFixed(1)}px;top:${(s * 0.14).toFixed(1)}px;width:${(s * 0.22).toFixed(1)}px;height:${(s * 0.42).toFixed(1)}px;border:solid #fff;border-width:0 ${sw(s)}px ${sw(s)}px 0;box-sizing:border-box;transform:rotate(45deg) scale(0);transition:transform ${t}s ${(t * 0.7).toFixed(2)}s;z-index:1}.${k} input:checked+.b::after{transform:rotate(45deg) scale(1)}@keyframes ${k}-bob{0%,100%{transform:translateX(-4%)}50%{transform:translateX(4%)}}`,
    }),
  },

  // ── Playful (trendy) ───────────────────────────────────────────────────────
  {
    id: "confetti", name: "Confetti", category: "Playful",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => {
      const o = (n: number) => Math.round(s * n);
      const dots = `${o(0.7)}px -${o(0.6)}px 0 #f43f5e,-${o(0.7)}px -${o(0.5)}px 0 #f59e0b,${o(0.75)}px ${o(0.35)}px 0 #22c55e,-${o(0.7)}px ${o(0.5)}px 0 #3b82f6,0 -${o(0.85)}px 0 #a855f7,0 ${o(0.8)}px 0 #ec4899,${o(0.85)}px 0 0 #06b6d4,-${o(0.85)}px 0 0 #eab308`;
      return {
        html: `<input type="checkbox" class="${k}" checked>`,
        css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c}}.${k}:checked{background:${c}}${tick(s, "#fff", `.${k}:checked::after`)}.${k}:checked::before{content:"";position:absolute;top:50%;left:50%;width:3px;height:3px;border-radius:50%;box-shadow:${dots};transform:translate(-50%,-50%) scale(.2);opacity:0;animation:${k}-cf ${(t * 1.8).toFixed(2)}s ease forwards}@keyframes ${k}-cf{0%{transform:translate(-50%,-50%) scale(.2);opacity:1}100%{transform:translate(-50%,-50%) scale(2.6);opacity:0}}`,
      };
    },
  },
  {
    id: "pixel", name: "Pixel Art", category: "Playful",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => {
      const p = Math.max(2, Math.round(s / 8));
      const px = `${-2 * p}px ${-2 * p}px 0 #fff,${-1 * p}px ${-1 * p}px 0 #fff,${p}px ${-1 * p}px 0 #fff,${2 * p}px ${-2 * p}px 0 #fff,${3 * p}px ${-3 * p}px 0 #fff,${4 * p}px ${-4 * p}px 0 #fff`;
      return {
        html: `<input type="checkbox" class="${k}" checked>`,
        css: `.${k}{${base(s, Math.min(r, 3))};border:${bw(s)}px solid ${c};image-rendering:pixelated;transition:background ${t}s}.${k}:checked{background:${c}}.${k}::after{content:"";position:absolute;left:${Math.round(s * 0.26)}px;top:${Math.round(s * 0.46)}px;width:${p}px;height:${p}px;background:#fff;box-shadow:${px};opacity:0;transition:opacity ${t}s}.${k}:checked::after{opacity:1}`,
      };
    },
  },
  {
    id: "emoji-fire", name: "Fire React", category: "Playful",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s,border-color ${t}s}.${k}:checked{background:${faint(c)};border-color:${c}}.${k}::after{content:"";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${Math.round(s * 0.62)}px;line-height:1;opacity:0;transform:scale(0);transition:transform ${t}s cubic-bezier(.68,-.55,.27,1.55),opacity ${t}s}.${k}:checked::after{content:"🔥";opacity:1;transform:scale(1)}`,
    }),
  },
  {
    id: "emoji-party", name: "Party React", category: "Playful",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c};transition:background ${t}s,border-color ${t}s}.${k}:checked{background:${faint(c)};border-color:${c}}.${k}::after{content:"";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${Math.round(s * 0.62)}px;line-height:1;opacity:0;transform:scale(0) rotate(-30deg);transition:transform ${t}s cubic-bezier(.68,-.55,.27,1.55),opacity ${t}s}.${k}:checked::after{content:"🎉";opacity:1;transform:scale(1) rotate(0)}`,
    }),
  },
  {
    id: "wobble-pop", name: "Wobble", category: "Playful",
    build: ({ size: s, color: c, radius: r, speed: t }, k) => ({
      html: `<input type="checkbox" class="${k}" checked>`,
      css: `.${k}{${base(s, r)};border:${bw(s)}px solid ${c}}.${k}:checked{background:${c};animation:${k}-wb ${(t * 1.7).toFixed(2)}s cubic-bezier(.36,.07,.19,.97)}${tick(s, "#fff", `.${k}:checked::after`)}@keyframes ${k}-wb{0%{transform:rotate(0) scale(.6)}30%{transform:rotate(-12deg) scale(1.1)}50%{transform:rotate(10deg) scale(1)}70%{transform:rotate(-6deg)}100%{transform:rotate(0)}}`,
    }),
  },
];
