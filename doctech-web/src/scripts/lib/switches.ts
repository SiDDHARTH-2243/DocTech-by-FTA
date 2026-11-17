// Scalable pure-CSS toggle-switch registry. Each switch is parametric on
// SwitchParams so the same definitions power the grid (default params) and the
// customization modal (live params). Mirrors loaders.ts / checkboxes.ts.

export interface SwitchParams {
  size: number; // px — track height
  on: string; // checked/active color (#rrggbb)
  off: string; // unchecked track color (#rrggbb)
  speed: number; // seconds — transition duration
  bg: string; // canvas background (#rrggbb) — applied by the canvas, not build()
}

export const DEFAULT_PARAMS: SwitchParams = {
  size: 28,
  on: "#f97316",
  off: "#cbd5e1",
  speed: 0.3,
  bg: "#1e293b",
};

export const CATEGORIES = [
  "All",
  "Classic",
  "iOS",
  "Material",
  "Neumorphic",
  "Glass",
  "Neon",
  "3D",
  "Animated",
  "Playful",
  "Labeled",
  "Retro",
] as const;

export interface SwitchDef {
  id: string;
  name: string;
  category: (typeof CATEGORIES)[number];
  /** Build scoped CSS + HTML. `k` scopes the class + all @keyframes names. */
  build: (p: SwitchParams, k: string) => { css: string; html: string };
}

// Helpers ----------------------------------------------------------------------
const faint = (c: string) => `${c}33`;
const HTML = (k: string) => `<label class="${k}"><input type="checkbox" checked><span></span></label>`;
const HTML_INNER = (k: string, inner: string) => `<label class="${k}"><input type="checkbox" checked><span>${inner}</span></label>`;

interface Opt {
  ratio?: number;
  padR?: number;
  trackR?: number;
  knobR?: string;
  off?: string;
  knob?: string;
  trackBase?: string;
  knobBase?: string;
  onTrack?: string;
  onKnob?: string;
  kc?: string;
  kcc?: string;
  kf?: number;
  append?: string;
}

function dims(p: SwitchParams, ratio = 1.8, padR = 0.14) {
  const h = p.size;
  const w = Math.round(h * ratio);
  const pad = Math.max(2, Math.round(h * padR));
  const knob = h - pad * 2;
  const travel = w - knob - pad * 2;
  return { h, w, pad, knob, travel };
}

/** The shared pill-switch skeleton; most defs are thin overrides of this. */
function base(p: SwitchParams, k: string, o: Opt = {}): { css: string; html: string } {
  const { h, w, pad, knob, travel } = dims(p, o.ratio, o.padR);
  const tr = o.trackR ?? h;
  const kr = o.knobR ?? "50%";
  const knobFlex = `display:flex;align-items:center;justify-content:center;${o.kf ? `font-size:${o.kf}px;` : ""}`;
  return {
    html: HTML(k),
    css:
      `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}` +
      `.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}` +
      `.${k} span{position:absolute;inset:0;border-radius:${tr}px;background:${o.off ?? p.off};transition:${p.speed}s;${o.trackBase ?? ""}}` +
      `.${k} span::before{content:"${o.kc ?? ""}";position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:${o.knob ?? "#fff"};border-radius:${kr};transition:${p.speed}s;${knobFlex}${o.knobBase ?? ""}}` +
      `.${k} input:checked+span{${o.onTrack ?? `background:${p.on}`}}` +
      `.${k} input:checked+span::before{transform:translateX(${travel}px);${o.kcc ? `content:"${o.kcc}";` : ""}${o.onKnob ?? ""}}` +
      (o.append ?? ""),
  };
}

/** Material-style: thin track, larger overhanging knob that takes the on-color. */
function material(p: SwitchParams, k: string, o: Opt & { thR?: number; outline?: boolean } = {}): { css: string; html: string } {
  const h = p.size, w = Math.round(h * 1.9), th = Math.round(h * (o.thR ?? 0.62)), knob = h, travel = w - knob, off = (h - th) / 2;
  const trackBg = o.outline ? `transparent;box-shadow:inset 0 0 0 2px ${o.off ?? p.off}` : (o.off ?? p.off);
  return {
    html: HTML(k),
    css:
      `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}` +
      `.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}` +
      `.${k} span{position:absolute;top:${off}px;left:0;width:100%;height:${th}px;border-radius:${th}px;background:${trackBg};transition:${p.speed}s}` +
      `.${k} span::before{content:"";position:absolute;height:${knob}px;width:${knob}px;left:0;top:-${off}px;background:#fff;border-radius:50%;box-shadow:0 1px 3px #0006;transition:${p.speed}s;display:flex;align-items:center;justify-content:center;${o.kf ? `font-size:${o.kf}px;` : ""}${o.knobBase ?? ""}}` +
      `.${k} input:checked+span{background:${o.onTrack ?? faint(p.on)}${o.outline ? `;box-shadow:inset 0 0 0 2px ${p.on}` : ""}}` +
      `.${k} input:checked+span::before{transform:translateX(${travel}px);background:${p.on};${o.kcc ? `content:"${o.kcc}";color:#fff;` : ""}${o.onKnob ?? ""}}` +
      (o.append ?? ""),
  };
}

/** Track-label switch (ON/OFF text beside the knob, via ::after). */
function labeled(p: SwitchParams, k: string, offTxt: string, onTxt: string): { css: string; html: string } {
  const { h } = dims(p, 2.3);
  const b = base(p, k, { ratio: 2.3 });
  const fs = Math.round(h * 0.3), inset = Math.round(h * 0.32);
  return {
    css:
      b.css +
      `.${k} span::after{content:"${offTxt}";position:absolute;right:${inset}px;top:0;height:100%;display:flex;align-items:center;font-size:${fs}px;font-weight:800;letter-spacing:.5px;color:#ffffffcc}` +
      `.${k} input:checked+span::after{content:"${onTxt}";right:auto;left:${inset}px}`,
    html: b.html,
  };
}

/** Knob-less label button toggle (skewed/rounded chips that swap their text). */
function button(p: SwitchParams, k: string, offTxt: string, onTxt: string, o: { ratio?: number; r?: number; skew?: number; off?: string; on?: string; trackBase?: string } = {}): { css: string; html: string } {
  const h = p.size, w = Math.round(h * (o.ratio ?? 2.4)), fs = Math.round(h * 0.4);
  const unskew = o.skew ? `transform:skewX(${-o.skew}deg);` : "";
  return {
    html: HTML(k),
    css:
      `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}` +
      `.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}` +
      `.${k} span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:${o.r ?? 6}px;background:${o.off ?? p.off};color:#fff;font-weight:800;font-size:${fs}px;letter-spacing:.5px;transition:${p.speed}s;${o.skew ? `transform:skewX(${o.skew}deg);` : ""}${o.trackBase ?? ""}}` +
      `.${k} span::after{content:"${offTxt}";${unskew}}` +
      `.${k} input:checked+span{background:${o.on ?? p.on}}` +
      `.${k} input:checked+span::after{content:"${onTxt}"}`,
  };
}

export const SWITCHES: SwitchDef[] = [
  // ── Classic ────────────────────────────────────────────────────────────────
  { id: "basic", name: "Basic", category: "Classic", build: (p, k) => base(p, k, { knobBase: "box-shadow:0 1px 2px #0003" }) },
  { id: "minimal", name: "Minimal", category: "Classic", build: (p, k) => base(p, k, { off: "transparent", trackBase: `box-shadow:inset 0 0 0 2px ${p.off}`, knob: p.off, onTrack: `box-shadow:inset 0 0 0 2px ${p.on}`, onKnob: `background:${p.on}` }) },
  { id: "square", name: "Square", category: "Classic", build: (p, k) => base(p, k, { trackR: 4, knobR: "3px", knobBase: "box-shadow:0 1px 2px #0004" }) },
  { id: "slider", name: "Slider", category: "Classic", build: (p, k) => base(p, k, { ratio: 2, trackR: 6, knobR: "4px", padR: 0.12, off: "#e2e8f0", trackBase: "box-shadow:inset 0 1px 3px #00000022", knobBase: "box-shadow:0 1px 4px #00000044", onTrack: `background:${faint(p.on)}`, onKnob: `background:${p.on}` }) },
  { id: "brutalist", name: "Brutalist", category: "Classic", build: (p, k) => {
    const bw = Math.max(2, Math.round(p.size * 0.08)), off = Math.max(3, Math.round(p.size * 0.15)), h = p.size, w = Math.round(h * 2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML(k),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:${p.off};border:${bw}px solid #000;box-shadow:${off}px ${off}px 0 #000;transition:${p.speed}s;border-radius:0}.${k} span::before{content:"";position:absolute;height:${knob - bw * 2}px;width:${knob - bw * 2}px;left:${pad}px;top:${pad}px;background:#000;transition:${p.speed}s}.${k} input:checked+span{background:${p.on};transform:translate(${off}px, ${off}px);box-shadow:0 0 0 #000}.${k} input:checked+span::before{transform:translateX(${travel}px);background:#fff}`
    };
  }},

  // ── iOS ────────────────────────────────────────────────────────────────────
  { id: "ios", name: "iOS", category: "iOS", build: (p, k) => base(p, k, { padR: 0.1, knobBase: "box-shadow:0 2px 4px #00000033,0 0 1px #00000022" }) },
  { id: "ios-outline", name: "iOS Outline", category: "iOS", build: (p, k) => base(p, k, { off: "transparent", trackBase: `box-shadow:inset 0 0 0 2px ${p.off}`, knob: p.off, onKnob: "background:#fff", knobBase: "box-shadow:0 1px 2px #0003" }) },
  { id: "ios-snappy", name: "iOS Snappy", category: "iOS", build: (p, k) => base(p, k, { padR: 0.1, knobBase: `box-shadow:0 2px 4px #0003;transition:transform ${(p.speed * 0.6).toFixed(2)}s cubic-bezier(.4,1.7,.5,1),left ${p.speed}s,background ${p.speed}s` }) },

  // ── Material ───────────────────────────────────────────────────────────────
  { id: "material", name: "Material", category: "Material", build: (p, k) => material(p, k) },
  { id: "material-check", name: "Material Check", category: "Material", build: (p, k) => material(p, k, { kcc: "✓", kf: Math.round(p.size * 0.5) }) },
  { id: "material-ripple", name: "Material Ripple", category: "Material", build: (p, k) => material(p, k, { onKnob: `box-shadow:0 1px 3px #0006,0 0 0 ${Math.round(p.size * 0.35)}px ${p.on}22` }) },

  // ── Neumorphic ─────────────────────────────────────────────────────────────
  { id: "neu-inset", name: "Neu Inset", category: "Neumorphic", build: (p, k) => base(p, k, { off: "#e0e5ec", onTrack: `background:${faint(p.on)}`, trackBase: "box-shadow:inset 2px 2px 5px #b8bec7,inset -2px -2px 5px #fff", knob: p.on, knobBase: "box-shadow:1px 1px 3px #b8bec7" }) },
  { id: "neu-dark", name: "Neu Dark", category: "Neumorphic", build: (p, k) => base(p, k, { off: "#2a2e35", onTrack: `background:${p.on}`, trackBase: "box-shadow:inset 3px 3px 6px #1b1e23,inset -3px -3px 6px #3a3f47", knob: "#3a3f47", knobBase: "box-shadow:2px 2px 4px #1b1e23,-2px -2px 4px #44494f" }) },
  { id: "yoyo", name: "Yoyo", category: "Neumorphic", build: (p, k) => base(p, k, { off: "#e0e5ec", onTrack: `background:${faint(p.on)}`, trackBase: "box-shadow:inset 2px 2px 4px #b8bec7,inset -2px -2px 4px #fff", knob: "#e0e5ec", knobBase: `box-shadow:2px 2px 4px #b8bec7,-2px -2px 4px #fff,inset 0 0 0 2px #cbd5e1`, onKnob: `box-shadow:2px 2px 4px #b8bec7,-2px -2px 4px #fff,inset 0 0 0 2px ${p.on}` }) },

  // ── Glass ──────────────────────────────────────────────────────────────────
  { id: "glass", name: "Glass", category: "Glass", build: (p, k) => base(p, k, { off: "#ffffff22", trackBase: "border:1px solid #ffffff44;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)", onTrack: `background:${p.on}aa;border:1px solid ${p.on}`, knob: "#ffffffdd", knobBase: "box-shadow:0 1px 3px #0004" }) },
  { id: "glass-glow", name: "Glass Glow", category: "Glass", build: (p, k) => base(p, k, { off: "#ffffff1a", trackBase: "border:1px solid #ffffff44;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)", onTrack: `background:${p.on}99;box-shadow:0 0 ${Math.round(p.size * 0.5)}px ${p.on}`, knob: "#fff", knobBase: "box-shadow:0 1px 3px #0005" }) },
  { id: "glass-tint", name: "Glass Tint", category: "Glass", build: (p, k) => base(p, k, { off: "#ffffff14", trackBase: "background:linear-gradient(135deg,#ffffff33,#ffffff0d);border:1px solid #ffffff3a;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)", onTrack: `background:linear-gradient(135deg,${p.on}dd,${p.on}77)`, knob: "#ffffffe6", knobBase: "box-shadow:0 1px 3px #0004" }) },

  // ── Neon ───────────────────────────────────────────────────────────────────
  { id: "neon", name: "Neon", category: "Neon", build: (p, k) => base(p, k, { off: "#1e293b", onTrack: `background:${p.on};box-shadow:0 0 ${Math.round(p.size * 0.5)}px ${p.on}`, knobBase: "box-shadow:0 0 4px #fff" }) },
  { id: "neon-outline", name: "Neon Outline", category: "Neon", build: (p, k) => base(p, k, { off: "transparent", trackBase: `border:2px solid ${p.off}`, onTrack: `border:2px solid ${p.on};box-shadow:0 0 ${Math.round(p.size * 0.5)}px ${p.on},inset 0 0 ${Math.round(p.size * 0.3)}px ${p.on}66`, knob: p.off, onKnob: `background:${p.on};box-shadow:0 0 6px ${p.on}` }) },
  { id: "cyber-scanner", name: "Cyber Scanner", category: "Neon", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.5), travel = w - Math.round(h*0.4) - Math.round(h*0.2);
    return {
      html: HTML_INNER(k, '<i class="scan"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#0f172a;clip-path:polygon(10% 0, 100% 0, 90% 100%, 0 100%);transition:${p.speed}s;border-bottom:2px solid #334155}.${k} .scan{position:absolute;width:${Math.round(h*0.4)}px;height:100%;left:10%;top:0;background:${p.off};transition:${p.speed}s;box-shadow:0 0 ${h*0.5}px ${p.off};transform:skewX(-20deg)}.${k} span::after{content:"SYS";position:absolute;right:20%;top:50%;transform:translateY(-50%);font-family:monospace;font-size:${h*0.4}px;color:#475569;font-weight:bold}.${k} input:checked+span{background:#1e293b;border-bottom:2px solid ${p.on}}.${k} input:checked+span::after{content:"ON";color:${p.on};left:25%;right:auto;text-shadow:0 0 5px ${p.on}}.${k} input:checked+span .scan{transform:translateX(${travel}px) skewX(-20deg);background:${p.on};box-shadow:0 0 ${h*0.5}px ${p.on}}`
    };
  }},
  { id: "rgb-mech", name: "RGB Mechanical", category: "Neon", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.round(h * 0.1), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="knob"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#1e293b;border-radius:${h*0.2}px;box-shadow:inset 0 ${h*0.1}px ${h*0.2}px #000, 0 ${h*0.05}px 0 #0f172a;transition:${p.speed}s;border:1px solid #334155}.${k} .knob{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:linear-gradient(to bottom, #475569, #334155);border-radius:${h*0.15}px;transition:${p.speed}s;box-shadow:inset 0 ${h*0.08}px ${h*0.05}px #64748b, 0 ${h*0.15}px ${h*0.1}px #000;border:1px solid #0f172a}.${k} .knob::after{content:"";position:absolute;inset:${h*0.2}px;background:#1e293b;border-radius:${h*0.08}px;box-shadow:inset 0 ${h*0.05}px ${h*0.05}px #000;transition:${p.speed}s}.${k} input:checked+span{box-shadow:inset 0 ${h*0.1}px ${h*0.2}px #000, 0 ${h*0.05}px 0 #0f172a, 0 0 ${h*0.4}px ${p.on}66}.${k} input:checked+span .knob{transform:translateX(${travel}px);background:linear-gradient(to bottom, #1e293b, #0f172a);box-shadow:inset 0 ${h*0.05}px ${h*0.05}px #334155, 0 ${h*0.05}px ${h*0.05}px #000;top:${pad + h*0.05}px}.${k} input:checked+span .knob::after{background:${p.on};box-shadow:0 0 ${h*0.2}px ${p.on}, inset 0 0 ${h*0.05}px #fff}`
    };
  }},

  // ── 3D ─────────────────────────────────────────────────────────────────────
  { id: "3d-flip", name: "3D Flip", category: "3D", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<div class="f-face f-front"></div><div class="f-face f-back"></div>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer;perspective:${h*8}px}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;transform-style:preserve-3d;transition:transform ${p.speed}s cubic-bezier(.4,1.5,.6,1);border-radius:${h}px}.${k} .f-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:${h}px}.${k} .f-front{background:${p.off};box-shadow:inset 0 2px 4px #0003}.${k} .f-front::before{content:"";position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#fff;border-radius:50%;box-shadow:0 1px 3px #0004}.${k} .f-back{background:${p.on};transform:rotateX(180deg);box-shadow:inset 0 2px 4px #0003}.${k} .f-back::before{content:"";position:absolute;height:${knob}px;width:${knob}px;right:${pad}px;top:${pad}px;background:#fff;border-radius:50%;box-shadow:0 1px 3px #0004}.${k} input:checked+span{transform:rotateX(180deg)}`
    };
  }},
  { id: "three-d", name: "3D Pop", category: "3D", build: (p, k) => base(p, k, { trackBase: "box-shadow:0 4px 0 #00000022,inset 0 -2px 4px #00000018", knobBase: "box-shadow:0 3px 0 #0003", onKnob: "box-shadow:0 2px 0 #0003" }) },
  { id: "isometric", name: "Isometric", category: "3D", build: (p, k) => base(p, k, { trackBase: "box-shadow:0 6px 0 #00000026", knobBase: "box-shadow:0 4px 0 #00000033", onKnob: "box-shadow:0 4px 0 #00000033", append: `.${k}{transform:rotate(-28deg) skewX(28deg)}` }) },

  // ── Animated ───────────────────────────────────────────────────────────────
  { id: "stretch", name: "Stretch", category: "Animated", build: (p, k) => { const { knob, pad, travel } = dims(p); return base(p, k, { onKnob: `transform:translateX(${travel}px)`, append: `.${k} input:checked+span::before{animation:${k}-st ${p.speed}s ease}@keyframes ${k}-st{40%{width:${Math.round(knob * 1.6)}px}100%{width:${knob}px;left:${pad}px}}` }); } },
  { id: "bounce", name: "Bounce", category: "Animated", build: (p, k) => base(p, k, { knobBase: `transition:transform ${p.speed}s cubic-bezier(.68,-.6,.32,1.6),left ${p.speed}s cubic-bezier(.68,-.6,.32,1.6),background ${p.speed}s;box-shadow:0 1px 3px #0004` }) },
  { id: "liquid", name: "Liquid", category: "Animated", build: (p, k) => { const { knob, pad, travel } = dims(p); return base(p, k, { onKnob: `transform:translateX(${travel}px)`, append: `.${k} input:checked+span::before{animation:${k}-lq ${(p.speed * 1.2).toFixed(2)}s ease}@keyframes ${k}-lq{40%{width:${Math.round(knob * 1.9)}px;border-radius:42%}100%{width:${knob}px;border-radius:50%;left:${pad}px}}` }); } },

  // ── Playful ────────────────────────────────────────────────────────────────
  { id: "theme-morph", name: "Eclipse", category: "Playful", build: (p, k) => {
    const h = p.size, r1 = h * 0.35, r2 = h * 0.25, r3 = -h * 0.18;
    return {
      html: HTML(k),
      css: `.${k}{position:relative;display:inline-block;width:${h*1.2}px;height:${h*1.2}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:transparent;transition:${p.speed}s;border-radius:50%}.${k} span::before{content:"";position:absolute;width:${h*0.5}px;height:${h*0.5}px;top:${h*0.35}px;left:${h*0.35}px;background:#f59e0b;border-radius:50%;transition:${p.speed}s cubic-bezier(.4,1.5,.6,1);box-shadow:inset 0 0 0 0 #cbd5e1, 0 -${r1}px 0 ${r3}px #f59e0b, 0 ${r1}px 0 ${r3}px #f59e0b, ${r1}px 0 0 ${r3}px #f59e0b, -${r1}px 0 0 ${r3}px #f59e0b, ${r2}px ${r2}px 0 ${r3}px #f59e0b, -${r2}px -${r2}px 0 ${r3}px #f59e0b, ${r2}px -${r2}px 0 ${r3}px #f59e0b, -${r2}px ${r2}px 0 ${r3}px #f59e0b}.${k} input:checked+span::before{background:transparent;box-shadow:inset -${h*0.16}px -${h*0.12}px 0 0 ${p.on}, 0 0 0 -${h*0.25}px transparent, 0 0 0 -${h*0.25}px transparent, 0 0 0 -${h*0.25}px transparent, 0 0 0 -${h*0.25}px transparent, 0 0 0 -${h*0.25}px transparent, 0 0 0 -${h*0.25}px transparent, 0 0 0 -${h*0.25}px transparent, 0 0 0 -${h*0.25}px transparent;transform:scale(1.4) rotate(-45deg)}`
    };
  }},
  { id: "lock", name: "Lock / Unlock", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="lock"><i class="shackle"></i><i class="body"></i></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:${p.off};border-radius:${h}px;transition:${p.speed}s}.${k} .lock{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#fff;border-radius:50%;transition:${p.speed}s cubic-bezier(.4,1.5,.6,1);box-shadow:0 2px 4px #0004}.${k} .shackle{position:absolute;top:${knob*0.15}px;left:${knob*0.3}px;width:${knob*0.4}px;height:${knob*0.3}px;border:2px solid #94a3b8;border-bottom:0;border-radius:${knob*0.2}px ${knob*0.2}px 0 0;transition:${p.speed}s;transform-origin:left bottom}.${k} .body{position:absolute;top:${knob*0.45}px;left:${knob*0.25}px;width:${knob*0.5}px;height:${knob*0.4}px;background:#94a3b8;border-radius:${knob*0.1}px;transition:${p.speed}s}.${k} input:checked+span{background:${p.on}}.${k} input:checked+span .lock{transform:translateX(${travel}px)}.${k} input:checked+span .shackle{transform:rotateY(180deg);border-color:${p.on}}.${k} input:checked+span .body{background:${p.on}}`
    };
  }},
  { id: "emoji", name: "Emoji", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="face"><i class="eye l"></i><i class="eye r"></i><i class="mouth"></i></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:${p.off};border-radius:${h}px;transition:${p.speed}s}.${k} .face{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#fcd34d;border-radius:50%;transition:${p.speed}s cubic-bezier(.4,1.5,.6,1);box-shadow:0 2px 4px #0004}.${k} .eye{position:absolute;top:${knob*0.3}px;width:${knob*0.15}px;height:${knob*0.2}px;background:#475569;border-radius:50%;transition:${p.speed}s}.${k} .eye.l{left:${knob*0.25}px}.${k} .eye.r{right:${knob*0.25}px}.${k} .mouth{position:absolute;top:${knob*0.6}px;left:${knob*0.3}px;width:${knob*0.4}px;height:${knob*0.2}px;border:2px solid #475569;border-bottom:0;border-radius:${knob*0.2}px ${knob*0.2}px 0 0;transition:${p.speed}s;transform-origin:center}.${k} input:checked+span{background:${p.on}}.${k} input:checked+span .face{transform:translateX(${travel}px);background:#fbbf24}.${k} input:checked+span .mouth{transform:rotate(180deg) translateY(${knob*0.1}px);height:${knob*0.25}px}`
    };
  }},
  { id: "sun-moon", name: "Sun / Moon", category: "Playful", build: (p, k) => base(p, k, { off: "#38bdf8", onTrack: "background:#1e293b", kc: "☀️", kcc: "🌙", kf: Math.round(p.size * 0.5), knob: "#fde68a", onKnob: "background:#f1f5f9" }) },

  // ── Labeled ────────────────────────────────────────────────────────────────
  { id: "on-off", name: "ON / OFF", category: "Labeled", build: (p, k) => labeled(p, k, "OFF", "ON") },
  { id: "yeah-nope", name: "Yeah / Nope", category: "Labeled", build: (p, k) => button(p, k, "Nope", "Yeah!", { ratio: 2.8, r: 8, off: "#cbd5e1" }) },

  // ── New Premium Switches ───────────────────────────────────────────────────
  { id: "pacman", name: "Pacman", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.5), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="dots"></i><i class="pac"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#0f172a;border-radius:${h}px;transition:${p.speed}s;overflow:hidden}.${k} .dots{position:absolute;top:${h/2 - 2}px;left:${h}px;width:${w-h}px;height:4px;background-image:radial-gradient(circle, #fcd34d 2px, transparent 2px);background-size:16px 4px;background-position:0 0}.${k} .pac{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#facc15;border-radius:50%;transition:${p.speed}s linear;box-shadow:inset 0 2px 4px #0004;clip-path:polygon(100% 74%, 44% 48%, 100% 21%, 100% 0, 74% 0, 0 0, 0 100%, 100% 100%)}.${k} input:checked+span .pac{transform:translateX(${travel}px);clip-path:polygon(100% 50%, 50% 50%, 100% 50%, 100% 0, 74% 0, 0 0, 0 100%, 100% 100%);animation:${k}-chomp 0.3s infinite alternate}.${k} input:checked+span .dots{opacity:0;transition:${p.speed}s}@keyframes ${k}-chomp{0%{clip-path:polygon(100% 74%, 44% 48%, 100% 21%, 100% 0, 0 0, 0 100%, 100% 100%)}100%{clip-path:polygon(100% 50%, 50% 50%, 100% 50%, 100% 0, 0 0, 0 100%, 100% 100%)}}`
    };
  }},
  { id: "eye", name: "Eye", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="eye"><i class="pupil"></i><i class="lid"></i></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:${p.off};border-radius:${h}px;transition:${p.speed}s}.${k} .eye{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#fff;border-radius:50%;transition:${p.speed}s cubic-bezier(.4,1.5,.6,1);box-shadow:0 2px 4px #0004;overflow:hidden}.${k} .pupil{position:absolute;width:${knob*0.4}px;height:${knob*0.4}px;background:#0f172a;border-radius:50%;top:${knob*0.3}px;left:${knob*0.3}px;transition:${p.speed}s}.${k} .lid{position:absolute;inset:0;background:${p.off};transition:${p.speed}s;transform-origin:top;transform:scaleY(1)}.${k} input:checked+span{background:${p.on}}.${k} input:checked+span .eye{transform:translateX(${travel}px)}.${k} input:checked+span .lid{transform:scaleY(0);background:${p.on}}.${k} input:checked+span .pupil{background:${p.on}}`
    };
  }},
  { id: "target", name: "Sniper Target", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="crosshair"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:${p.off};border-radius:${h}px;transition:${p.speed}s;box-shadow:inset 0 0 10px #0003}.${k} .crosshair{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;border:2px solid #ef4444;border-radius:50%;transition:${p.speed}s cubic-bezier(.4,1.5,.6,1);display:flex;align-items:center;justify-content:center}.${k} .crosshair::before, .${k} .crosshair::after{content:"";position:absolute;background:#ef4444}.${k} .crosshair::before{width:2px;height:100%}.${k} .crosshair::after{width:100%;height:2px}.${k} input:checked+span{background:#1e293b}.${k} input:checked+span .crosshair{transform:translateX(${travel}px) rotate(90deg);border-color:${p.on};box-shadow:0 0 10px ${p.on}}.${k} input:checked+span .crosshair::before, .${k} input:checked+span .crosshair::after{background:${p.on}}`
    };
  }},
  { id: "rocket", name: "Rocket Blast", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.5), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="ship"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:${p.off};border-radius:${h}px;transition:${p.speed}s}.${k} .ship{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#fff;border-radius:50%;transition:${p.speed}s ease-in;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px #0004}.${k} .ship::before{content:"🚀";font-size:${Math.round(knob*0.6)}px;transition:${p.speed}s;transform:rotate(-45deg)}.${k} input:checked+span{background:#0f172a}.${k} input:checked+span .ship{transform:translateX(${travel}px);background:#ef4444;box-shadow:-10px 0 15px #f59e0b}.${k} input:checked+span .ship::before{transform:rotate(45deg)}`
    };
  }},
  { id: "sonar", name: "Sonar Pulse", category: "Neon", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="knob"><i class="ring r1"></i><i class="ring r2"></i></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:${p.off};border-radius:${h}px;transition:${p.speed}s}.${k} .knob{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#fff;border-radius:50%;transition:${p.speed}s;box-shadow:0 2px 4px #0004}.${k} .ring{position:absolute;inset:0;border-radius:50%;border:2px solid transparent}.${k} input:checked+span{background:#1e293b}.${k} input:checked+span .knob{transform:translateX(${travel}px);background:${p.on}}.${k} input:checked+span .r1{animation:${k}-pl 1.5s linear infinite}.${k} input:checked+span .r2{animation:${k}-pl 1.5s linear 0.75s infinite}@keyframes ${k}-pl{0%{transform:scale(1);border-color:${p.on};opacity:1}100%{transform:scale(2.5);border-color:${p.on};opacity:0}}`
    };
  }},
  { id: "roller", name: "Paint Roller", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="roller"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:${p.off};border-radius:${h}px;transition:${p.speed}s}.${k} span::before{content:"";position:absolute;inset:0;background:${p.on};border-radius:${h}px;clip-path:inset(0 100% 0 0);transition:${p.speed}s}.${k} .roller{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#fff;border-radius:30%;transition:${p.speed}s;box-shadow:inset 0 0 0 4px #cbd5e1, 0 2px 4px #0004;z-index:2}.${k} input:checked+span::before{clip-path:inset(0 0 0 0)}.${k} input:checked+span .roller{transform:translateX(${travel}px) rotate(360deg);box-shadow:inset 0 0 0 4px ${p.on}, 0 2px 4px #0004}`
    };
  }},
  { id: "glitch", name: "Glitch", category: "Neon", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="knob"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#0f172a;border-radius:0;transition:${p.speed}s;border:2px solid ${p.off}}.${k} .knob{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:${p.off};transition:${p.speed}s;border-radius:0}.${k} input:checked+span{border-color:${p.on};box-shadow:3px 3px 0 #0ff, -3px -3px 0 #f0f;animation:${k}-gl 0.2s 2}.${k} input:checked+span .knob{transform:translateX(${travel}px);background:${p.on}}@keyframes ${k}-gl{0%{transform:translate(0)}20%{transform:translate(-2px,2px)}40%{transform:translate(-2px,-2px)}60%{transform:translate(2px,2px)}80%{transform:translate(2px,-2px)}100%{transform:translate(0)}}`
    };
  }},
  { id: "battery", name: "Battery", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="cap"></i><i class="level"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:transparent;border:3px solid #94a3b8;border-radius:${h*0.2}px;transition:${p.speed}s}.${k} .cap{position:absolute;right:-6px;top:${h*0.25}px;height:${h*0.5}px;width:6px;background:#94a3b8;border-radius:0 3px 3px 0;transition:${p.speed}s}.${k} .level{position:absolute;left:2px;top:2px;bottom:2px;width:${knob*0.5}px;background:#ef4444;border-radius:${h*0.1}px;transition:${p.speed}s}.${k} input:checked+span{border-color:${p.on}}.${k} input:checked+span .cap{background:${p.on}}.${k} input:checked+span .level{width:calc(100% - 4px);background:${p.on}}`
    };
  }},
  { id: "book", name: "Book Flip", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="page"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer;perspective:400px}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#cbd5e1;border-radius:4px;transition:${p.speed}s;box-shadow:inset 0 0 10px #0002;border-left:${w/2}px solid ${p.off};border-right:${w/2}px solid ${p.on}}.${k} .page{position:absolute;left:50%;top:0;width:50%;height:100%;background:${p.off};transform-origin:left;transition:${p.speed}s ease-in-out;box-shadow:inset 0 0 5px #0003;border-radius:0 4px 4px 0}.${k} input:checked+span .page{transform:rotateY(-180deg);background:${p.on};border-radius:4px 0 0 4px}`
    };
  }},
  { id: "vinyl", name: "Vinyl Record", category: "Classic", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="record"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#d1d5db;border-radius:${h*0.2}px;transition:${p.speed}s;box-shadow:inset 0 2px 5px #0003}.${k} .record{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#1e293b;border-radius:50%;transition:${p.speed}s;box-shadow:inset 0 0 0 ${knob*0.1}px #000, inset 0 0 0 ${knob*0.2}px #1e293b, inset 0 0 0 ${knob*0.25}px #000, inset 0 0 0 ${knob*0.35}px #1e293b, inset 0 0 0 ${knob*0.45}px #ef4444;display:flex;align-items:center;justify-content:center}.${k} .record::after{content:"";width:4px;height:4px;background:#fff;border-radius:50%}.${k} input:checked+span{background:${p.on}}.${k} input:checked+span .record{transform:translateX(${travel}px);animation:${k}-sp 1s linear infinite;box-shadow:inset 0 0 0 ${knob*0.1}px #000, inset 0 0 0 ${knob*0.2}px #1e293b, inset 0 0 0 ${knob*0.25}px #000, inset 0 0 0 ${knob*0.35}px #1e293b, inset 0 0 0 ${knob*0.45}px ${p.on}}@keyframes ${k}-sp{100%{transform:translateX(${travel}px) rotate(360deg)}}`
    };
  }},
  { id: "door", name: "Sliding Door", category: "3D", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="door l"></i><i class="door r"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer;perspective:400px}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:${p.on};border-radius:4px;transition:${p.speed}s;box-shadow:inset 0 0 15px #000a}.${k} .door{position:absolute;top:0;width:50%;height:100%;background:${p.off};transition:${p.speed}s;box-shadow:inset 0 0 5px #0003}.${k} .door.l{left:0;border-right:1px solid #0003;transform-origin:left}.${k} .door.r{right:0;border-left:1px solid #0003;transform-origin:right}.${k} input:checked+span .door.l{transform:rotateY(-90deg)}.${k} input:checked+span .door.r{transform:rotateY(90deg)}`
    };
  }},
  { id: "lightbulb", name: "Lightbulb", category: "Classic", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="wire"></i><i class="bulb"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:transparent;transition:${p.speed}s}.${k} .wire{position:absolute;top:50%;left:${h/2}px;width:${travel}px;height:2px;background:#64748b;transform:translateY(-50%)}.${k} .bulb{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#94a3b8;border-radius:50%;transition:${p.speed}s;box-shadow:inset -2px -2px 5px #0003;display:flex;align-items:center;justify-content:center}.${k} .bulb::after{content:"";position:absolute;width:${knob*0.4}px;height:${knob*0.4}px;background:#cbd5e1;border-radius:50%}.${k} input:checked+span .bulb{transform:translateX(${travel}px);background:#fde047;box-shadow:0 0 15px #fde047, inset -2px -2px 5px #ca8a04}.${k} input:checked+span .wire{background:${p.on}}`
    };
  }},

  { id: "neu-blob", name: "Neu Blob", category: "Neumorphic", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="knob"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#e0e5ec;border-radius:${h}px;transition:${p.speed}s;box-shadow:inset 3px 3px 6px #b8bec7, inset -3px -3px 6px #ffffff}.${k} .knob{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#e0e5ec;border-radius:40% 60% 70% 30% / 40% 50% 60% 50%;transition:${p.speed}s;box-shadow:3px 3px 6px #b8bec7, -3px -3px 6px #ffffff;animation:${k}-bl 3s infinite linear}.${k} input:checked+span{background:${p.on};box-shadow:inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.2)}.${k} input:checked+span .knob{transform:translateX(${travel}px);background:${p.on};box-shadow:3px 3px 6px rgba(0,0,0,0.2), -3px -3px 6px rgba(255,255,255,0.2)}@keyframes ${k}-bl{0%,100%{border-radius:40% 60% 70% 30% / 40% 50% 60% 50%}34%{border-radius:70% 30% 50% 50% / 30% 30% 70% 70%}67%{border-radius:100% 60% 60% 100% / 100% 100% 60% 60%}}`
    };
  }},
  { id: "lightsaber", name: "Lightsaber", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.8), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="hilt"></i><i class="blade"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:transparent;transition:${p.speed}s}.${k} .hilt{position:absolute;left:0;top:${pad}px;height:${knob}px;width:${knob*1.5}px;background:linear-gradient(to bottom, #94a3b8, #cbd5e1, #64748b);border-radius:2px;box-shadow:2px 2px 5px #0006;z-index:2}.${k} .hilt::after{content:"";position:absolute;right:2px;top:0;bottom:0;width:4px;background:#1e293b}.${k} .blade{position:absolute;left:${knob*1.2}px;top:${h*0.3}px;height:${h*0.4}px;width:0;background:#fff;border-radius:0 ${h}px ${h}px 0;transition:${p.speed}s ease-in;box-shadow:0 0 10px ${p.on}, 0 0 20px ${p.on}}.${k} input:checked+span .blade{width:${w - knob*1.2}px}`
    };
  }},

  // ── Extra Premium Switches (Batch 2) ───────────────────────────────────────
  { id: "gearbox", name: "Gearbox", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="gear g1"></i><i class="gear g2"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#334155;border-radius:${h}px;transition:${p.speed}s;box-shadow:inset 0 2px 5px #000a;overflow:hidden}.${k} .gear{position:absolute;height:${knob*1.5}px;width:${knob*1.5}px;background:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87a.488.488 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>') center/contain no-repeat;transition:${p.speed}s cubic-bezier(0.4, 0, 0.2, 1)}.${k} .g1{left:${pad}px;top:${-h*0.25}px;transform:rotate(0deg)}.${k} .g2{right:${pad}px;top:${-h*0.25}px;transform:rotate(15deg) scale(0.8)}.${k} input:checked+span{background:${p.on}}.${k} input:checked+span .g1{transform:translateX(${travel*0.8}px) rotate(180deg);opacity:0}.${k} input:checked+span .g2{transform:translateX(${-travel*0.8}px) rotate(-180deg) scale(1.2);background-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87a.488.488 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>')}`
    };
  }},
  { id: "conveyor", name: "Conveyor Belt", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="box"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:repeating-linear-gradient(45deg, #475569, #475569 5px, #334155 5px, #334155 10px);background-size:200% 100%;border-radius:${h}px;transition:${p.speed}s;box-shadow:inset 0 2px 5px #000;border:2px solid #1e293b}.${k} .box{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#fcd34d;border-radius:4px;transition:${p.speed}s linear;box-shadow:0 2px 4px #0004;display:flex;align-items:center;justify-content:center}.${k} .box::before{content:"↑";color:#b45309;font-weight:bold;font-size:${knob*0.6}px}.${k} input:checked+span{background-position:100% 0;animation:${k}-cv 1s linear infinite}.${k} input:checked+span .box{transform:translateX(${travel}px);background:${p.on}}@keyframes ${k}-cv{100%{background-position:0 0}}`
    };
  }},

  { id: "check-morph", name: "Check Morph", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="box"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:${p.off};border-radius:4px;transition:${p.speed}s}.${k} .box{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#fff;border-radius:2px;transition:${p.speed}s cubic-bezier(0.4, 0, 0.2, 1);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px #0004}.${k} .box::after{content:"";position:absolute;width:${knob*0.3}px;height:${knob*0.6}px;border:3px solid transparent;border-top:0;border-left:0;transform:rotate(45deg) translate(-1px, -2px);transition:${p.speed}s}.${k} input:checked+span{background:${p.on};border-radius:${h}px}.${k} input:checked+span .box{transform:translateX(${travel}px);border-radius:50%;background:#1e293b}.${k} input:checked+span .box::after{border-color:${p.on}}`
    };
  }},
  { id: "weather", name: "Cloud / Rain", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.8), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob*1.8 - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="cloud"></i><i class="drops"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#bae6fd;border-radius:${h}px;transition:${p.speed}s;overflow:hidden}.${k} .cloud{position:absolute;height:${knob*0.8}px;width:${knob*0.8}px;left:${pad}px;top:${pad + knob*0.2}px;background:#fff;border-radius:50%;transition:${p.speed}s;box-shadow: ${knob*0.4}px ${-knob*0.3}px 0 ${knob*0.1}px #fff, ${knob*0.9}px 0 0 0 #fff;z-index:2}.${k} .drops{position:absolute;width:2px;height:6px;background:#38bdf8;left:${travel + pad + knob*0.6}px;top:${h}px;box-shadow:8px -4px 0 #38bdf8, 16px -8px 0 #38bdf8;opacity:0;transition:${p.speed}s}.${k} input:checked+span{background:#334155}.${k} input:checked+span .cloud{transform:translateX(${travel}px);background:#94a3b8;box-shadow: ${knob*0.4}px ${-knob*0.3}px 0 ${knob*0.1}px #94a3b8, ${knob*0.9}px 0 0 0 #94a3b8}.${k} input:checked+span .drops{opacity:1;animation:${k}-rn 0.5s linear infinite}@keyframes ${k}-rn{100%{transform:translate(-5px, 15px);opacity:0}}`
    };
  }},
  { id: "shutter", name: "Camera Shutter", category: "Classic", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="lens"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#e2e8f0;border-radius:${h}px;transition:${p.speed}s;box-shadow:inset 0 1px 4px #0004}.${k} .lens{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#1e293b;border-radius:50%;transition:${p.speed}s cubic-bezier(.4,1.5,.6,1);box-shadow:0 2px 4px #0006;display:flex;align-items:center;justify-content:center;overflow:hidden}.${k} .lens::before{content:"";position:absolute;inset:2px;border-radius:50%;border:2px solid #334155;transition:${p.speed}s;background:conic-gradient(from 0deg, #1e293b 0 60deg, #0f172a 60deg 120deg, #1e293b 120deg 180deg, #0f172a 180deg 240deg, #1e293b 240deg 300deg, #0f172a 300deg 360deg);clip-path:circle(100%)}.${k} input:checked+span{background:${p.on}}.${k} input:checked+span .lens{transform:translateX(${travel}px) rotate(180deg)}.${k} input:checked+span .lens::before{clip-path:circle(30%);background:#0f172a}`
    };
  }},
  { id: "mic", name: "Microphone", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="mic"></i><i class="wave"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#f87171;border-radius:${h}px;transition:${p.speed}s}.${k} .mic{position:absolute;height:${knob*0.6}px;width:${knob*0.3}px;left:${pad + knob*0.35}px;top:${pad + knob*0.1}px;background:#fff;border-radius:${knob*0.15}px;transition:${p.speed}s;z-index:2}.${k} .mic::after{content:"";position:absolute;bottom:-${knob*0.1}px;left:-${knob*0.15}px;width:${knob*0.6}px;height:${knob*0.4}px;border:2px solid #fff;border-top:0;border-radius:0 0 ${knob*0.3}px ${knob*0.3}px}.${k} .wave{position:absolute;left:${pad}px;top:${pad}px;width:${knob}px;height:${knob}px;border-radius:50%;border:2px solid #fff;opacity:0;transition:${p.speed}s;transform:scale(0.5)}.${k} input:checked+span{background:${p.on}}.${k} input:checked+span .mic{transform:translateX(${travel}px);background:#1e293b;opacity:0}.${k} input:checked+span .wave{transform:translateX(${travel}px) scale(1);opacity:1;border-color:#1e293b;animation:${k}-wv 1s infinite alternate}@keyframes ${k}-wv{0%{clip-path:polygon(0 40%, 100% 40%, 100% 60%, 0 60%)}100%{clip-path:polygon(0 10%, 100% 10%, 100% 90%, 0 90%)}}`
    };
  }},

  { id: "hourglass", name: "Hourglass", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="glass"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#cbd5e1;border-radius:${h}px;transition:${p.speed}s;box-shadow:inset 0 2px 4px #0004}.${k} .glass{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:transparent;border:2px solid #1e293b;border-radius:4px;transition:${p.speed}s cubic-bezier(0.4, 0, 0.2, 1);clip-path:polygon(0 0, 100% 0, 50% 50%, 100% 100%, 0 100%, 50% 50%);display:flex;align-items:center;justify-content:center;flex-direction:column}.${k} .glass::before, .${k} .glass::after{content:"";width:100%;height:50%;background:#ef4444;transition:${p.speed}s}.${k} .glass::after{height:0}.${k} input:checked+span{background:#1e293b}.${k} input:checked+span .glass{transform:translateX(${travel}px) rotate(180deg);border-color:${p.on}}.${k} input:checked+span .glass::before{height:0}.${k} input:checked+span .glass::after{height:50%;background:${p.on}}`
    };
  }},

  // ── Insane Detail Switches (Batch 3) ───────────────────────────────────────
  { id: "sunset", name: "Day / Night", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.5), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="celestial"></i><i class="stars"></i><i class="clouds"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#38bdf8;border-radius:${h}px;transition:${p.speed}s;overflow:hidden;box-shadow:inset 0 2px 5px #0004}.${k} .stars{position:absolute;inset:0;opacity:0;transition:${p.speed}s;background-image:radial-gradient(1px 1px at 20% 30%, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 70% 60%, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40% 80%, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 85% 30%, #fff, rgba(0,0,0,0))}.${k} .clouds{position:absolute;bottom:0;left:0;width:200%;height:40%;background:radial-gradient(circle at 10% 100%, #fff 40%, transparent 41%), radial-gradient(circle at 30% 100%, #fff 60%, transparent 61%), radial-gradient(circle at 50% 100%, #fff 50%, transparent 51%);transition:${p.speed}s}.${k} .celestial{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#fde047;border-radius:50%;transition:${p.speed}s cubic-bezier(.4,1.5,.6,1);box-shadow:0 0 15px #fef08a, 0 0 30px #fef08a;z-index:2}.${k} input:checked+span{background:#0f172a}.${k} input:checked+span .celestial{transform:translateX(${travel}px);background:#e2e8f0;box-shadow:inset -${knob*0.2}px -${knob*0.1}px 0 0 #94a3b8, 0 0 10px #ffffff44}.${k} input:checked+span .stars{opacity:1}.${k} input:checked+span .clouds{transform:translateY(100%);opacity:0}`
    };
  }},
  { id: "sword", name: "Katana Draw", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.8), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="scabbard"></i><i class="blade"></i><i class="hilt"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:transparent;transition:${p.speed}s}.${k} .scabbard{position:absolute;left:${knob}px;right:0;top:${pad}px;bottom:${pad}px;background:#1e293b;border-radius:0 ${h}px ${h}px 0;box-shadow:0 2px 5px #0004;z-index:3;transition:${p.speed}s}.${k} .scabbard::after{content:"";position:absolute;inset:2px;border:1px solid #334155;border-radius:0 ${h}px ${h}px 0}.${k} .blade{position:absolute;left:${knob}px;top:${pad + h*0.2}px;height:${knob - h*0.4}px;width:0;background:linear-gradient(to bottom, #cbd5e1, #94a3b8);border-radius:0 ${h}px ${h}px 0;transition:${p.speed}s cubic-bezier(0.4, 0, 0.2, 1);box-shadow:0 1px 3px #0004;z-index:1}.${k} .hilt{position:absolute;left:0;top:0;height:${h}px;width:${knob*1.2}px;background:repeating-linear-gradient(45deg, #7f1d1d, #7f1d1d 4px, #450a0a 4px, #450a0a 8px);border-radius:4px;box-shadow:2px 2px 5px #0006;z-index:2;transition:${p.speed}s cubic-bezier(0.4, 0, 0.2, 1);border-right:4px solid #f59e0b}.${k} input:checked+span .hilt{transform:translateX(${travel}px)}.${k} input:checked+span .blade{width:${travel}px}.${k} input:checked+span .scabbard{transform:translateX(10px);opacity:0}`
    };
  }},
  { id: "fader", name: "Studio Fader", category: "Classic", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = Math.round(h * 1.2), travel = w - knob;
    return {
      html: HTML_INNER(k, '<i class="groove"></i><i class="cap"><i class="led"></i></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#334155;border-radius:4px;transition:${p.speed}s;box-shadow:inset 0 1px 1px #64748b, inset 0 -1px 1px #0f172a, 0 2px 5px #0006}.${k} .groove{position:absolute;left:${pad}px;right:${pad}px;top:50%;height:6px;transform:translateY(-50%);background:#0f172a;border-radius:3px;box-shadow:inset 0 2px 4px #000;border-bottom:1px solid #475569}.${k} .cap{position:absolute;height:${h*1.4}px;width:${knob}px;left:0;top:-${h*0.2}px;background:linear-gradient(to bottom, #94a3b8, #64748b);border-radius:4px;transition:${p.speed}s cubic-bezier(0.4, 0, 0.2, 1);box-shadow:-2px 0 2px #0003, 2px 0 2px #0003, 0 5px 10px #000a, inset 0 2px 2px #cbd5e1;display:flex;align-items:center;justify-content:center;border:1px solid #475569}.${k} .led{width:4px;height:50%;background:#ef4444;border-radius:2px;box-shadow:inset 0 1px 2px #000;transition:${p.speed}s}.${k} input:checked+span .cap{transform:translateX(${travel}px)}.${k} input:checked+span .led{background:${p.on};box-shadow:0 0 10px ${p.on}, 0 0 2px #fff}`
    };
  }},
  { id: "cassette", name: "Cassette Tape", category: "Retro", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="spool l"></i><i class="spool r"></i><i class="bridge"></i><i class="tape"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#cbd5e1;border-radius:6px;transition:${p.speed}s;box-shadow:inset 0 1px 3px #fff, 0 2px 4px #0004;border:2px solid #94a3b8}.${k} .spool{position:absolute;height:${knob}px;width:${knob}px;top:${pad}px;background:#f8fafc;border-radius:50%;border:4px solid #1e293b;box-sizing:border-box;box-shadow:inset 0 0 0 2px #e2e8f0;display:flex;align-items:center;justify-content:center;transition:${p.speed}s}.${k} .spool::after{content:"";position:absolute;width:100%;height:4px;background:#1e293b}.${k} .spool::before{content:"";position:absolute;width:4px;height:100%;background:#1e293b}.${k} .spool.l{left:${pad}px}.${k} .spool.r{right:${pad}px}.${k} .bridge{position:absolute;bottom:0;left:25%;right:25%;height:${h*0.3}px;background:#94a3b8;border-radius:4px 4px 0 0;box-shadow:inset 0 2px 2px #fff}.${k} .tape{position:absolute;left:${pad + knob/2}px;top:${pad + knob/2 - 1}px;height:2px;width:0;background:#1e293b;transition:${p.speed}s linear}.${k} input:checked+span .spool{animation:${k}-rl 1s linear infinite}.${k} input:checked+span .tape{width:${w - knob - pad*2}px}@keyframes ${k}-rl{100%{transform:rotate(360deg)}}`
    };
  }},
  { id: "paperplane", name: "Paper Plane", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.5), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="trail"></i><i class="plane"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#38bdf8;border-radius:${h}px;transition:${p.speed}s}.${k} .plane{position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;background:#fff;clip-path:polygon(100% 50%, 0 0, 30% 50%, 0 100%);transition:${p.speed}s ease-in-out;filter:drop-shadow(0 2px 2px #0004)}.${k} .trail{position:absolute;left:${pad + knob/4}px;top:50%;height:2px;width:0;background:dashed 2px #fff;opacity:0;transition:${p.speed}s}.${k} input:checked+span{background:#0284c7}.${k} input:checked+span .plane{animation:${k}-fly 0.8s ease-in-out forwards}.${k} input:checked+span .trail{width:${travel}px;opacity:0.5;transition-delay:0.2s}@keyframes ${k}-fly{0%{transform:translate(0, 0) rotate(0deg)}30%{transform:translate(${travel*0.4}px, -${h}px) rotate(-45deg)}60%{transform:translate(${travel*0.7}px, ${h*0.5}px) rotate(45deg)}100%{transform:translate(${travel}px, 0) rotate(0deg)}}`
    };
  }},
  { id: "submarine", name: "Submarine", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.5), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="beam"></i><i class="sub"><i class="periscope"></i><i class="propeller"></i></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#0ea5e9;border-radius:${h}px;transition:${p.speed}s;overflow:hidden;box-shadow:inset 0 0 10px #0369a1}.${k} .sub{position:absolute;height:${knob*0.7}px;width:${knob*1.2}px;left:${pad}px;top:${pad + knob*0.15}px;background:#eab308;border-radius:${knob}px;transition:${p.speed}s cubic-bezier(0.4, 0, 0.2, 1);z-index:2;box-shadow:inset -2px -2px 4px #ca8a04}.${k} .periscope{position:absolute;top:-${knob*0.3}px;left:${knob*0.4}px;width:${knob*0.15}px;height:${knob*0.4}px;border:2px solid #ca8a04;border-bottom:0;border-radius:2px 2px 0 0}.${k} .propeller{position:absolute;left:-${knob*0.1}px;top:50%;width:${knob*0.1}px;height:${knob*0.5}px;background:#94a3b8;transform:translateY(-50%);border-radius:2px;transition:${p.speed}s}.${k} .beam{position:absolute;left:${pad + knob}px;top:50%;width:0;height:${h*2}px;background:linear-gradient(to right, #fef08a99, transparent);transform:translateY(-50%);clip-path:polygon(0 40%, 100% 0, 100% 100%, 0 60%);transition:${p.speed}s;opacity:0}.${k} input:checked+span{background:#0369a1}.${k} input:checked+span .sub{transform:translateX(${travel}px)}.${k} input:checked+span .propeller{animation:${k}-pr 0.2s linear infinite}.${k} input:checked+span .beam{width:${w}px;transform:translate(${travel}px, -50%);opacity:1}@keyframes ${k}-pr{0%{transform:translateY(-50%) scaleY(1)}50%{transform:translateY(-50%) scaleY(0.2)}100%{transform:translateY(-50%) scaleY(1)}}`
    };
  }},
  { id: "cyberhex", name: "Cyber Hex", category: "Neon", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.5), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="grid"></i><i class="hex"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#0f172a;transition:${p.speed}s;clip-path:polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%);border:1px solid #334155}.${k} .grid{position:absolute;inset:0;background-image:linear-gradient(30deg, #1e293b 12%, transparent 12.5%, transparent 87%, #1e293b 87.5%, #1e293b), linear-gradient(150deg, #1e293b 12%, transparent 12.5%, transparent 87%, #1e293b 87.5%, #1e293b), linear-gradient(30deg, #1e293b 12%, transparent 12.5%, transparent 87%, #1e293b 87.5%, #1e293b), linear-gradient(150deg, #1e293b 12%, transparent 12.5%, transparent 87%, #1e293b 87.5%, #1e293b), linear-gradient(60deg, #1e293b77 25%, transparent 25.5%, transparent 75%, #1e293b77 75%, #1e293b77), linear-gradient(60deg, #1e293b77 25%, transparent 25.5%, transparent 75%, #1e293b77 75%, #1e293b77);background-size:20px 35px;background-position:0 0, 0 0, 10px 17.5px, 10px 17.5px, 0 0, 10px 17.5px;opacity:0.3;transition:${p.speed}s}.${k} .hex{position:absolute;height:${knob}px;width:${knob*1.15}px;left:${pad}px;top:${pad}px;background:#475569;clip-path:polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);transition:${p.speed}s;box-shadow:inset 0 0 10px #000;display:flex;align-items:center;justify-content:center}.${k} .hex::after{content:"";position:absolute;inset:2px;background:#334155;clip-path:polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);transition:${p.speed}s}.${k} input:checked+span{background:#020617;border-color:${p.on}}.${k} input:checked+span .grid{opacity:1;background-image:linear-gradient(30deg, ${p.on}33 12%, transparent 12.5%, transparent 87%, ${p.on}33 87.5%, ${p.on}33), linear-gradient(150deg, ${p.on}33 12%, transparent 12.5%, transparent 87%, ${p.on}33 87.5%, ${p.on}33), linear-gradient(30deg, ${p.on}33 12%, transparent 12.5%, transparent 87%, ${p.on}33 87.5%, ${p.on}33), linear-gradient(150deg, ${p.on}33 12%, transparent 12.5%, transparent 87%, ${p.on}33 87.5%, ${p.on}33), linear-gradient(60deg, ${p.on}11 25%, transparent 25.5%, transparent 75%, ${p.on}11 75%, ${p.on}11), linear-gradient(60deg, ${p.on}11 25%, transparent 25.5%, transparent 75%, ${p.on}11 75%, ${p.on}11)}.${k} input:checked+span .hex{transform:translateX(${travel}px);background:${p.on};filter:drop-shadow(0 0 5px ${p.on})}.${k} input:checked+span .hex::after{background:#fff}`
    };
  }},
  { id: "ninja", name: "Ninja Slash", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="bg"></i><i class="star"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#ef4444;border-radius:${h}px;overflow:hidden}.${k} .bg{position:absolute;inset:0;background:#1e293b;clip-path:polygon(0 0, 100% 0, 100% 100%, 0 100%);transition:${p.speed}s cubic-bezier(.4,1.5,.6,1)}.${k} .star{position:absolute;height:${knob*1.2}px;width:${knob*1.2}px;left:${pad}px;top:${pad - h*0.1}px;background:#cbd5e1;clip-path:polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);transition:${p.speed}s cubic-bezier(.4,1.5,.6,1)}.${k} input:checked+span .bg{clip-path:polygon(100% 0, 100% 0, 100% 100%, 100% 100%)}.${k} input:checked+span .star{transform:translateX(${travel}px) rotate(720deg)}`
    };
  }},
  { id: "ufo", name: "UFO Abduction", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.5), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="cow">🐄</i><i class="ufo"><i class="dome"></i></i><i class="beam"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#0f172a;border-radius:${h}px;transition:${p.speed}s;overflow:hidden;border-bottom:2px solid #22c55e}.${k} .cow{position:absolute;right:${pad*2}px;bottom:0;font-size:${knob*0.6}px;transition:${p.speed}s}.${k} .ufo{position:absolute;height:${knob*0.4}px;width:${knob*1.2}px;left:${pad}px;top:${pad}px;background:#94a3b8;border-radius:${knob}px;transition:${p.speed}s;z-index:3;display:flex;justify-content:center}.${k} .dome{position:absolute;top:-${knob*0.3}px;width:${knob*0.6}px;height:${knob*0.5}px;background:#38bdf8;border-radius:50% 50% 0 0}.${k} .beam{position:absolute;left:${pad}px;top:${pad + knob*0.2}px;width:${knob*1.2}px;height:${h}px;background:linear-gradient(to bottom, #22c55eaa, transparent);clip-path:polygon(20% 0, 80% 0, 100% 100%, 0 100%);opacity:0;transition:${p.speed}s;z-index:2}.${k} input:checked+span .ufo{transform:translateX(${travel}px);animation:${k}-hov 2s infinite ease-in-out}.${k} input:checked+span .beam{transform:translateX(${travel}px);opacity:1}.${k} input:checked+span .cow{transform:translateY(-${h}px) scale(0.5);opacity:0;transition-delay:0.3s}@keyframes ${k}-hov{0%,100%{transform:translateX(${travel}px) translateY(0)}50%{transform:translateX(${travel}px) translateY(-3px)}}`
    };
  }},
  { id: "billiards", name: "Billiards Break", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.5), pad = Math.max(2, Math.round(h * 0.1)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML_INNER(k, '<i class="cue"></i><i class="eight">8</i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;background:#166534;border-radius:${h}px;transition:${p.speed}s;box-shadow:inset 0 3px 6px #052e16;border:2px solid #451a03}.${k} .cue, .${k} .eight{position:absolute;height:${knob}px;width:${knob}px;top:${pad}px;border-radius:50%;box-shadow:inset -2px -2px 4px #0006, inset 2px 2px 4px #fff6}.${k} .cue{left:${pad}px;background:#fff;transition:${p.speed}s cubic-bezier(0.4, 0, 0.2, 1);z-index:2}.${k} .eight{left:${pad + travel}px;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:${knob*0.5}px;transition:${p.speed}s cubic-bezier(0.4, 0, 0.2, 1);z-index:1}.${k} .eight::after{content:"";position:absolute;width:${knob*0.6}px;height:${knob*0.6}px;background:#fff;border-radius:50%;z-index:-1}.${k} input:checked+span .cue{transform:translateX(${travel}px)}.${k} input:checked+span .eight{transform:translateX(${travel*1.5}px);opacity:0}`
    };
  }},

  // ── Premium Batch (curated) ────────────────────────────────────────────────
  { id: "aurora-glass", name: "Aurora Glass", category: "Glass", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2), pad = Math.max(2, Math.round(h * 0.12)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML(k),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;border-radius:${h}px;background:${p.off}55;border:1px solid #ffffff44;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);transition:${p.speed}s}.${k} span::before{content:"";position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;border-radius:50%;background:linear-gradient(135deg,#fff,${p.on});box-shadow:0 2px 6px #0004;transition:${p.speed}s cubic-bezier(.4,1.5,.6,1)}.${k} input:checked+span{background:linear-gradient(135deg,${p.on}cc,${p.on}55);box-shadow:0 0 ${Math.round(h * 0.5)}px ${p.on}88}.${k} input:checked+span::before{transform:translateX(${travel}px);background:#fff}`
    };
  } },
  { id: "liquid-metal", name: "Liquid Metal", category: "3D", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2), pad = Math.max(2, Math.round(h * 0.12)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML(k),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;border-radius:${h}px;background:linear-gradient(${p.off},#0003);box-shadow:inset 0 2px 4px #0006;transition:${p.speed}s}.${k} span::before{content:"";position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;border-radius:50%;background:linear-gradient(135deg,#fff,#cbd5e1 40%,#64748b);box-shadow:0 2px 4px #0006,inset 0 1px 2px #fff;transition:${p.speed}s cubic-bezier(.4,1.5,.6,1)}.${k} input:checked+span{background:linear-gradient(${p.on},${p.on}99);box-shadow:inset 0 2px 4px ${p.on}88}.${k} input:checked+span::before{transform:translateX(${travel}px)}`
    };
  } },
  { id: "power-toggle", name: "Power", category: "Neon", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2), pad = Math.max(2, Math.round(h * 0.12)), knob = h - pad * 2, travel = w - knob - pad * 2, ic = Math.round(knob * 0.5);
    return {
      html: HTML_INNER(k, '<i class="pw"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;border-radius:${h}px;background:${p.off};transition:${p.speed}s}.${k} .pw{position:absolute;left:${pad}px;top:${pad}px;height:${knob}px;width:${knob}px;border-radius:50%;background:#1e293b;display:flex;align-items:center;justify-content:center;transition:${p.speed}s cubic-bezier(.4,1.5,.6,1)}.${k} .pw::before{content:"";width:${ic}px;height:${ic}px;border:2px solid #64748b;border-radius:50%;border-top-color:transparent;transition:${p.speed}s}.${k} .pw::after{content:"";position:absolute;top:${Math.round(knob * 0.2)}px;width:2px;height:${Math.round(knob * 0.32)}px;background:#64748b;transition:${p.speed}s}.${k} input:checked+span{background:#0f172a}.${k} input:checked+span .pw{transform:translateX(${travel}px)}.${k} input:checked+span .pw::before{border-color:${p.on};border-top-color:transparent;box-shadow:0 0 6px ${p.on}}.${k} input:checked+span .pw::after{background:${p.on};box-shadow:0 0 6px ${p.on}}`
    };
  } },
  { id: "traffic", name: "Traffic Light", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2), pad = Math.max(2, Math.round(h * 0.12)), knob = h - pad * 2, travel = w - knob - pad * 2, g = Math.round(knob * 0.4);
    return {
      html: HTML(k),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;border-radius:${h}px;background:#1e293b;transition:${p.speed}s}.${k} span::before{content:"";position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;border-radius:50%;background:#ef4444;box-shadow:0 0 ${g}px #ef4444;transition:${p.speed}s cubic-bezier(.4,1.5,.6,1)}.${k} input:checked+span::before{transform:translateX(${travel}px);background:#22c55e;box-shadow:0 0 ${g}px #22c55e}`
    };
  } },
  { id: "galaxy", name: "Galaxy", category: "Neon", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.3), pad = Math.max(2, Math.round(h * 0.12)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML(k),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;border-radius:${h}px;background:${p.off};overflow:hidden;transition:${p.speed}s}.${k} span::after{content:"";position:absolute;inset:0;opacity:0;transition:${p.speed}s;background-image:radial-gradient(1px 1px at 20% 40%,#fff,#0000),radial-gradient(1px 1px at 60% 70%,#fff,#0000),radial-gradient(1.5px 1.5px at 80% 30%,#fff,#0000),radial-gradient(1px 1px at 40% 80%,#fff,#0000)}.${k} span::before{content:"";position:absolute;z-index:1;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff,${p.on});box-shadow:0 0 ${Math.round(knob * 0.5)}px ${p.on};transition:${p.speed}s cubic-bezier(.4,1.5,.6,1)}.${k} input:checked+span{background:#0b1020}.${k} input:checked+span::after{opacity:1}.${k} input:checked+span::before{transform:translateX(${travel}px)}`
    };
  } },
  { id: "flip-face", name: "Flip Face", category: "Animated", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2), pad = Math.max(2, Math.round(h * 0.12)), knob = h - pad * 2, travel = w - knob - pad * 2, fs = Math.round(knob * 0.55);
    return {
      html: HTML_INNER(k, '<i class="kn"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;border-radius:${h}px;background:${p.off};transition:${p.speed}s}.${k} .kn{position:absolute;left:${pad}px;top:${pad}px;height:${knob}px;width:${knob}px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:${fs}px;line-height:1;box-shadow:0 1px 3px #0005;transition:transform ${p.speed}s cubic-bezier(.4,1.5,.6,1)}.${k} .kn::after{content:"✕";color:${p.off};transition:${p.speed}s}.${k} input:checked+span{background:${p.on}}.${k} input:checked+span .kn{transform:translateX(${travel}px) rotateY(360deg)}.${k} input:checked+span .kn::after{content:"✓";color:${p.on}}`
    };
  } },
  { id: "thermometer", name: "Thermometer", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.12)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML(k),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;border-radius:${h}px;background:linear-gradient(90deg,#38bdf8,#94a3b8);transition:${p.speed}s}.${k} span::before{content:"";position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0005;transition:${p.speed}s cubic-bezier(.4,1.5,.6,1)}.${k} input:checked+span{background:linear-gradient(90deg,#fbbf24,#ef4444)}.${k} input:checked+span::before{transform:translateX(${travel}px)}`
    };
  } },
  { id: "heart-toggle", name: "Heartbeat", category: "Playful", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2), pad = Math.max(2, Math.round(h * 0.12)), knob = h - pad * 2, travel = w - knob - pad * 2, fs = Math.round(knob * 0.55);
    return {
      html: HTML_INNER(k, '<i class="kn"></i>'),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;border-radius:${h}px;background:${p.off};transition:${p.speed}s}.${k} .kn{position:absolute;left:${pad}px;top:${pad}px;height:${knob}px;width:${knob}px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px #0005;transition:transform ${p.speed}s cubic-bezier(.4,1.5,.6,1)}.${k} .kn::after{content:"\\2665";font-size:${fs}px;line-height:1;color:#cbd5e1;transition:${p.speed}s}.${k} input:checked+span{background:${p.on}}.${k} input:checked+span .kn{transform:translateX(${travel}px)}.${k} input:checked+span .kn::after{color:#ef4444;animation:${k}-bt 0.6s ease-in-out infinite}@keyframes ${k}-bt{0%,100%{transform:scale(1)}30%{transform:scale(1.25)}}`
    };
  } },
  { id: "retro-led", name: "Retro LED", category: "Retro", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.14)), knob = h - pad * 2, travel = w - knob - pad * 2, kw = Math.round(knob * 0.7);
    return {
      html: HTML(k),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;border-radius:3px;background:#0a0f0a;border:2px solid #1a2e1a;box-shadow:inset 0 0 6px #000;transition:${p.speed}s}.${k} span::before{content:"";position:absolute;height:${knob}px;width:${kw}px;left:${pad}px;top:${pad}px;border-radius:2px;background:#ef4444;box-shadow:0 0 6px #ef4444,inset 0 0 3px #fff6;transition:${p.speed}s steps(2)}.${k} input:checked+span::before{transform:translateX(${travel + knob - kw}px);background:#22c55e;box-shadow:0 0 8px #22c55e,inset 0 0 3px #fff6}`
    };
  } },
  { id: "neon-tube", name: "Neon Tube", category: "Neon", build: (p, k) => {
    const h = p.size, w = Math.round(h * 2.2), pad = Math.max(2, Math.round(h * 0.12)), knob = h - pad * 2, travel = w - knob - pad * 2;
    return {
      html: HTML(k),
      css: `.${k}{position:relative;display:inline-block;width:${w}px;height:${h}px;cursor:pointer}.${k} input{position:absolute;opacity:0;width:0;height:0;margin:0}.${k} span{position:absolute;inset:0;border-radius:${h}px;background:#0f172a;border:2px solid ${p.off};transition:${p.speed}s}.${k} span::before{content:"";position:absolute;height:${knob}px;width:${knob}px;left:${pad}px;top:${pad}px;border-radius:50%;background:${p.off};transition:${p.speed}s cubic-bezier(.4,1.5,.6,1)}.${k} input:checked+span{border-color:${p.on};box-shadow:0 0 ${Math.round(h * 0.5)}px ${p.on},inset 0 0 ${Math.round(h * 0.3)}px ${p.on}66}.${k} input:checked+span::before{transform:translateX(${travel}px);background:${p.on};box-shadow:0 0 ${Math.round(knob * 0.5)}px ${p.on}}`
    };
  } },
  { id: "jelly-squish", name: "Jelly", category: "Animated", build: (p, k) => {
    const { knob, pad, travel } = dims(p);
    return base(p, k, { onKnob: `transform:translateX(${travel}px)`, append: `.${k} input:checked+span::before{animation:${k}-jl ${(p.speed * 1.1).toFixed(2)}s cubic-bezier(.68,-0.6,.32,1.6)}@keyframes ${k}-jl{40%{width:${Math.round(knob * 1.7)}px;border-radius:45%}100%{width:${knob}px;left:${pad}px}}` });
  } },
  { id: "spotlight", name: "Spotlight", category: "Glass", build: (p, k) => base(p, k, { off: "#ffffff14", trackBase: "border:1px solid #ffffff33;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)", onTrack: `background:radial-gradient(circle at 80% 50%,${p.on}aa,${p.on}22)`, knob: "#ffffffe6", knobBase: "box-shadow:0 1px 3px #0005", onKnob: `box-shadow:0 0 ${Math.round(p.size * 0.5)}px ${p.on}` }) },
];
