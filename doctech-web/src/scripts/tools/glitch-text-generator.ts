// Glitch Text Generator — premium multi-style with full customization. Client-side.
import { copyText } from "../lib/ui";

const textInput = document.getElementById("gx-text") as HTMLInputElement | null;
const c1 = document.getElementById("gx-c1") as HTMLInputElement | null;
const c2 = document.getElementById("gx-c2") as HTMLInputElement | null;
const mainColor = document.getElementById("gx-main-color") as HTMLInputElement | null;
const intensity = document.getElementById("gx-intensity") as HTMLInputElement | null;
const speedInput = document.getElementById("gx-speed") as HTMLInputElement | null;
const fontSizeInput = document.getElementById("gx-font-size") as HTMLInputElement | null;
const letterSpacingInput = document.getElementById("gx-letter-spacing") as HTMLInputElement | null;
const fontWeightInput = document.getElementById("gx-font-weight") as HTMLSelectElement | null;
const bgColorInput = document.getElementById("gx-bg-color") as HTMLInputElement | null;
const uppercaseCheck = document.getElementById("gx-uppercase") as HTMLInputElement | null;
const scanlinesCheck = document.getElementById("gx-scanlines") as HTMLInputElement | null;
const textShadowCheck = document.getElementById("gx-text-shadow") as HTMLInputElement | null;
const preview = document.getElementById("gx-preview");
const stage = document.getElementById("gx-stage");
const cssEl = document.getElementById("gx-css");
const copyBtn = document.getElementById("gx-copy");
const stylesEl = document.getElementById("gx-styles");

if (textInput && c1 && c2 && mainColor && intensity && speedInput && fontSizeInput &&
    letterSpacingInput && fontWeightInput && bgColorInput && preview && stage && cssEl && copyBtn && stylesEl) {

  let styleEl = document.getElementById("gx-style") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "gx-style";
    document.head.appendChild(styleEl);
  }

  // ── Glitch Styles ──────────────────────────────────────────────────────
  interface GlitchStyle {
    id: string;
    name: string;
    icon: string;
    buildKeyframes: (o: number, c1v: string, c2v: string) => string;
    buildPseudos: (c1v: string, c2v: string, dur: string) => string;
    extraBase?: (mainC: string) => string;
  }

  const glitchStyles: GlitchStyle[] = [
    {
      id: "classic", name: "Classic", icon: "⚡",
      buildPseudos: (c1v, c2v, dur) => [
        `.glitch::before { color: ${c1v}; animation: glitch-1 ${dur}s infinite linear alternate-reverse; }`,
        `.glitch::after { color: ${c2v}; animation: glitch-2 ${dur}s infinite linear alternate-reverse; }`,
      ].join("\n"),
      buildKeyframes: (o) => [
        `@keyframes glitch-1 {`,
        `  0% { clip-path: inset(20% 0 60% 0); transform: translate(-${o}px); }`,
        `  20% { clip-path: inset(80% 0 5% 0); transform: translate(${o}px); }`,
        `  40% { clip-path: inset(10% 0 70% 0); transform: translate(-${o * 0.8}px); }`,
        `  60% { clip-path: inset(50% 0 30% 0); transform: translate(${o}px); }`,
        `  80% { clip-path: inset(35% 0 45% 0); transform: translate(-${o * 0.6}px); }`,
        `  100% { clip-path: inset(70% 0 10% 0); transform: translate(${o}px); }`,
        `}`,
        `@keyframes glitch-2 {`,
        `  0% { clip-path: inset(65% 0 15% 0); transform: translate(${o}px); }`,
        `  20% { clip-path: inset(5% 0 80% 0); transform: translate(-${o}px); }`,
        `  40% { clip-path: inset(45% 0 35% 0); transform: translate(${o * 0.7}px); }`,
        `  60% { clip-path: inset(15% 0 65% 0); transform: translate(-${o}px); }`,
        `  80% { clip-path: inset(55% 0 25% 0); transform: translate(${o * 0.5}px); }`,
        `  100% { clip-path: inset(25% 0 55% 0); transform: translate(-${o}px); }`,
        `}`,
      ].join("\n"),
    },
    {
      id: "chromatic", name: "Chromatic", icon: "🌈",
      buildPseudos: (c1v, c2v, dur) => [
        `.glitch::before { color: ${c1v}; animation: glitch-1 ${dur}s infinite ease-in-out; mix-blend-mode: screen; }`,
        `.glitch::after { color: ${c2v}; animation: glitch-2 ${dur}s infinite ease-in-out; mix-blend-mode: screen; }`,
      ].join("\n"),
      buildKeyframes: (o) => [
        `@keyframes glitch-1 {`,
        `  0%, 100% { transform: translate(-${o}px, 0); }`,
        `  33% { transform: translate(${o * 0.5}px, -${o * 0.3}px); }`,
        `  66% { transform: translate(-${o * 0.7}px, ${o * 0.2}px); }`,
        `}`,
        `@keyframes glitch-2 {`,
        `  0%, 100% { transform: translate(${o}px, 0); }`,
        `  33% { transform: translate(-${o * 0.5}px, ${o * 0.3}px); }`,
        `  66% { transform: translate(${o * 0.7}px, -${o * 0.2}px); }`,
        `}`,
      ].join("\n"),
    },
    {
      id: "distortion", name: "Distort", icon: "〰️",
      buildPseudos: (c1v, c2v, dur) => [
        `.glitch::before { color: ${c1v}; animation: glitch-1 ${dur}s steps(2, start) infinite; }`,
        `.glitch::after { color: ${c2v}; animation: glitch-2 ${dur}s steps(3, end) infinite; }`,
      ].join("\n"),
      buildKeyframes: (o) => [
        `@keyframes glitch-1 {`,
        `  0% { clip-path: inset(40% 0 40% 0); transform: translate(-${o}px, ${o * 0.5}px) skewX(${o * 2}deg); }`,
        `  33% { clip-path: inset(10% 0 70% 0); transform: translate(${o}px, -${o * 0.3}px) skewX(-${o}deg); }`,
        `  66% { clip-path: inset(60% 0 20% 0); transform: translate(-${o * 0.5}px, ${o * 0.2}px) skewX(${o * 1.5}deg); }`,
        `  100% { clip-path: inset(30% 0 50% 0); transform: translate(${o * 0.8}px, -${o * 0.4}px) skewX(-${o * 0.8}deg); }`,
        `}`,
        `@keyframes glitch-2 {`,
        `  0% { clip-path: inset(60% 0 20% 0); transform: translate(${o}px, -${o * 0.3}px) skewX(-${o * 1.5}deg); }`,
        `  33% { clip-path: inset(20% 0 60% 0); transform: translate(-${o * 0.7}px, ${o * 0.5}px) skewX(${o}deg); }`,
        `  66% { clip-path: inset(50% 0 30% 0); transform: translate(${o * 0.6}px, -${o * 0.2}px) skewX(-${o * 2}deg); }`,
        `  100% { clip-path: inset(10% 0 70% 0); transform: translate(-${o}px, ${o * 0.4}px) skewX(${o * 0.5}deg); }`,
        `}`,
      ].join("\n"),
    },
    {
      id: "slice", name: "Slice", icon: "✂️",
      buildPseudos: (c1v, c2v, dur) => [
        `.glitch::before { color: ${c1v}; animation: glitch-1 ${dur}s steps(1) infinite; }`,
        `.glitch::after { color: ${c2v}; animation: glitch-2 ${dur}s steps(1) infinite; }`,
      ].join("\n"),
      buildKeyframes: (o) => [
        `@keyframes glitch-1 {`,
        `  0%, 15% { clip-path: inset(0 0 85% 0); transform: translateX(-${o}px); }`,
        `  16%, 30% { clip-path: inset(15% 0 70% 0); transform: translateX(${o * 0.7}px); }`,
        `  31%, 45% { clip-path: inset(30% 0 55% 0); transform: translateX(-${o * 0.5}px); }`,
        `  46%, 60% { clip-path: inset(45% 0 40% 0); transform: translateX(${o}px); }`,
        `  61%, 75% { clip-path: inset(60% 0 25% 0); transform: translateX(-${o * 0.8}px); }`,
        `  76%, 100% { clip-path: inset(75% 0 10% 0); transform: translateX(${o * 0.6}px); }`,
        `}`,
        `@keyframes glitch-2 {`,
        `  0%, 15% { clip-path: inset(85% 0 0 0); transform: translateX(${o}px); }`,
        `  16%, 30% { clip-path: inset(70% 0 15% 0); transform: translateX(-${o * 0.6}px); }`,
        `  31%, 45% { clip-path: inset(55% 0 30% 0); transform: translateX(${o * 0.8}px); }`,
        `  46%, 60% { clip-path: inset(40% 0 45% 0); transform: translateX(-${o}px); }`,
        `  61%, 75% { clip-path: inset(25% 0 60% 0); transform: translateX(${o * 0.5}px); }`,
        `  76%, 100% { clip-path: inset(10% 0 75% 0); transform: translateX(-${o * 0.7}px); }`,
        `}`,
      ].join("\n"),
    },
    {
      id: "wave", name: "Wave", icon: "🌊",
      buildPseudos: (c1v, c2v, dur) => [
        `.glitch::before { color: ${c1v}; animation: glitch-1 ${dur}s ease-in-out infinite; }`,
        `.glitch::after { color: ${c2v}; animation: glitch-2 ${dur}s ease-in-out infinite; }`,
      ].join("\n"),
      buildKeyframes: (o) => [
        `@keyframes glitch-1 {`,
        `  0%, 100% { clip-path: inset(0 0 50% 0); transform: translate(-${o}px, -${o * 0.3}px); }`,
        `  50% { clip-path: inset(50% 0 0 0); transform: translate(${o}px, ${o * 0.3}px); }`,
        `}`,
        `@keyframes glitch-2 {`,
        `  0%, 100% { clip-path: inset(50% 0 0 0); transform: translate(${o}px, ${o * 0.3}px); }`,
        `  50% { clip-path: inset(0 0 50% 0); transform: translate(-${o}px, -${o * 0.3}px); }`,
        `}`,
      ].join("\n"),
    },
    {
      id: "flicker", name: "Flicker", icon: "💡",
      buildPseudos: (c1v, c2v, dur) => [
        `.glitch::before { color: ${c1v}; animation: glitch-1 ${dur}s steps(1) infinite; }`,
        `.glitch::after { color: ${c2v}; animation: glitch-2 ${dur}s steps(1) infinite; }`,
      ].join("\n"),
      buildKeyframes: (o) => [
        `@keyframes glitch-1 {`,
        `  0%, 5% { clip-path: inset(80% 0 0 0); transform: translate(-${o}px); opacity: 1; }`,
        `  6%, 20% { clip-path: inset(0); transform: translate(0); opacity: 0; }`,
        `  21%, 30% { clip-path: inset(20% 0 60% 0); transform: translate(${o}px); opacity: 1; }`,
        `  31%, 60% { clip-path: inset(0); transform: translate(0); opacity: 0; }`,
        `  61%, 70% { clip-path: inset(50% 0 30% 0); transform: translate(-${o * 0.5}px); opacity: 1; }`,
        `  71%, 100% { clip-path: inset(0); transform: translate(0); opacity: 0; }`,
        `}`,
        `@keyframes glitch-2 {`,
        `  0%, 10% { clip-path: inset(0); transform: translate(0); opacity: 0; }`,
        `  11%, 20% { clip-path: inset(40% 0 40% 0); transform: translate(${o}px); opacity: 1; }`,
        `  21%, 50% { clip-path: inset(0); transform: translate(0); opacity: 0; }`,
        `  51%, 60% { clip-path: inset(70% 0 10% 0); transform: translate(-${o * 0.8}px); opacity: 1; }`,
        `  61%, 80% { clip-path: inset(0); transform: translate(0); opacity: 0; }`,
        `  81%, 90% { clip-path: inset(10% 0 70% 0); transform: translate(${o * 0.6}px); opacity: 1; }`,
        `  91%, 100% { clip-path: inset(0); transform: translate(0); opacity: 0; }`,
        `}`,
      ].join("\n"),
    },
    {
      id: "neon", name: "Neon", icon: "✨",
      buildPseudos: (c1v, c2v, dur) => [
        `.glitch::before { color: ${c1v}; animation: glitch-1 ${dur}s infinite ease-in-out; text-shadow: 0 0 8px ${c1v}; }`,
        `.glitch::after { color: ${c2v}; animation: glitch-2 ${dur}s infinite ease-in-out; text-shadow: 0 0 8px ${c2v}; }`,
      ].join("\n"),
      buildKeyframes: (o) => [
        `@keyframes glitch-1 {`,
        `  0%, 100% { clip-path: inset(0 0 70% 0); transform: translate(-${o * 0.5}px); }`,
        `  25% { clip-path: inset(30% 0 50% 0); transform: translate(${o}px); }`,
        `  50% { clip-path: inset(60% 0 20% 0); transform: translate(-${o}px); }`,
        `  75% { clip-path: inset(10% 0 70% 0); transform: translate(${o * 0.7}px); }`,
        `}`,
        `@keyframes glitch-2 {`,
        `  0%, 100% { clip-path: inset(70% 0 0 0); transform: translate(${o * 0.5}px); }`,
        `  25% { clip-path: inset(50% 0 30% 0); transform: translate(-${o}px); }`,
        `  50% { clip-path: inset(20% 0 60% 0); transform: translate(${o}px); }`,
        `  75% { clip-path: inset(70% 0 10% 0); transform: translate(-${o * 0.7}px); }`,
        `}`,
      ].join("\n"),
      extraBase: (mainC) => `  text-shadow: 0 0 10px ${mainC}, 0 0 40px ${mainC}44;`,
    },
    {
      id: "matrix", name: "Matrix", icon: "🟢",
      buildPseudos: (c1v, c2v, dur) => [
        `.glitch::before { color: ${c1v}; animation: glitch-1 ${dur}s steps(4) infinite; }`,
        `.glitch::after { color: ${c2v}; animation: glitch-2 ${dur}s steps(3) infinite reverse; }`,
      ].join("\n"),
      buildKeyframes: (o) => [
        `@keyframes glitch-1 {`,
        `  0% { clip-path: inset(0 0 90% 0); transform: translate(-${o}px, ${o * 0.5}px); }`,
        `  25% { clip-path: inset(25% 0 65% 0); transform: translate(${o * 0.8}px, -${o * 0.3}px); }`,
        `  50% { clip-path: inset(50% 0 40% 0); transform: translate(-${o * 0.6}px, ${o * 0.4}px); }`,
        `  75% { clip-path: inset(75% 0 15% 0); transform: translate(${o}px, -${o * 0.2}px); }`,
        `  100% { clip-path: inset(0 0 90% 0); transform: translate(-${o * 0.4}px, ${o * 0.6}px); }`,
        `}`,
        `@keyframes glitch-2 {`,
        `  0% { clip-path: inset(90% 0 0 0); transform: translate(${o}px, -${o * 0.4}px); }`,
        `  33% { clip-path: inset(50% 0 30% 0); transform: translate(-${o * 0.7}px, ${o * 0.3}px); }`,
        `  66% { clip-path: inset(20% 0 60% 0); transform: translate(${o * 0.5}px, -${o * 0.5}px); }`,
        `  100% { clip-path: inset(90% 0 0 0); transform: translate(-${o}px, ${o * 0.2}px); }`,
        `}`,
      ].join("\n"),
    },
  ];

  let activeStyle: GlitchStyle = glitchStyles[0];
  let codeFormat: "both" | "html" | "css" = "both";

  // Speed labels
  const speedLabels = ["Very Slow", "Slow", "Normal", "Fast", "Very Fast"];

  // ── Render style preset buttons ─────────────────────────────────────
  function renderStyleButtons() {
    stylesEl!.innerHTML = glitchStyles.map((s) =>
      `<button type="button" data-style="${s.id}" class="group flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-center transition-all hover:-translate-y-0.5 hover:shadow-sm ${
        s.id === activeStyle.id
          ? "border-orange-400 bg-orange-500/5 shadow-sm shadow-orange-500/10 dark:border-orange-500"
          : "border-slate-200 hover:border-orange-400 hover:shadow-orange-500/10 dark:border-slate-700 dark:hover:border-orange-500"
      }">
        <span class="text-base leading-none">${s.icon}</span>
        <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">${s.name}</span>
      </button>`
    ).join("");
  }

  // ── Build CSS ───────────────────────────────────────────────────────
  function buildCss(): string {
    const o = parseInt(intensity!.value);
    const speedIdx = parseInt(speedInput!.value) - 1;
    const speeds = [2.5, 1.8, 1.2, 0.6, 0.3];
    const dur = speeds[speedIdx].toFixed(2);
    const fontSize = fontSizeInput!.value;
    const spacing = letterSpacingInput!.value;
    const weight = fontWeightInput!.value;
    const mc = mainColor!.value;
    const c1v = c1!.value;
    const c2v = c2!.value;
    const upper = uppercaseCheck?.checked;
    const glow = textShadowCheck?.checked;

    const base = [
      ".glitch {",
      "  position: relative;",
      `  color: ${mc};`,
      `  font-size: ${fontSize}px;`,
      `  font-weight: ${weight};`,
      `  letter-spacing: ${spacing}px;`,
      upper ? "  text-transform: uppercase;" : "",
      glow && activeStyle.id !== "neon" ? `  text-shadow: 0 0 6px ${mc}44;` : "",
      activeStyle.extraBase ? activeStyle.extraBase(mc) : "",
      "}",
    ].filter(Boolean).join("\n");

    const pseudoBase = [
      ".glitch::before, .glitch::after {",
      "  content: attr(data-text);",
      "  position: absolute;",
      "  top: 0; left: 0;",
      "  width: 100%;",
      "}",
    ].join("\n");

    const pseudoStyles = activeStyle.buildPseudos(c1v, c2v, dur);
    const keyframes = activeStyle.buildKeyframes(o, c1v, c2v);

    return [base, pseudoBase, pseudoStyles, keyframes].join("\n");
  }

  function buildHtml(): string {
    const txt = textInput!.value || "GLITCH";
    const safe = txt.replace(/"/g, "&quot;");
    return `<div class="glitch" data-text="${safe}">${safe}</div>`;
  }

  // ── Render ──────────────────────────────────────────────────────────
  function render() {
    // Update display values
    document.getElementById("gx-intensity-val")!.textContent = intensity!.value;
    document.getElementById("gx-font-size-val")!.textContent = fontSizeInput!.value;
    document.getElementById("gx-letter-spacing-val")!.textContent = letterSpacingInput!.value;
    document.getElementById("gx-speed-val")!.textContent = speedLabels[parseInt(speedInput!.value) - 1];
    if (document.getElementById("gx-bg-hex")) {
      document.getElementById("gx-bg-hex")!.textContent = bgColorInput!.value;
    }

    const css = buildCss();
    const html = buildHtml();
    styleEl!.textContent = css;
    preview!.innerHTML = html;

    // Stage background
    stage!.style.background = bgColorInput!.value;

    // Scanline overlay
    const scanlineEl = stage!.parentElement?.querySelector<HTMLElement>(".pointer-events-none:first-child");
    if (scanlineEl && scanlinesCheck) {
      scanlineEl.style.opacity = scanlinesCheck.checked ? "0.06" : "0.03";
    }

    // Code output
    updateCodeOutput(css, html);
  }

  function updateCodeOutput(css: string, html: string) {
    if (codeFormat === "both") {
      cssEl!.textContent = `/* CSS */\n${css}\n\n<!-- HTML -->\n${html}`;
    } else if (codeFormat === "html") {
      cssEl!.textContent = html;
    } else {
      cssEl!.textContent = css;
    }
  }

  // ── Event listeners ──────────────────────────────────────────────────
  const allInputs = [textInput, c1, c2, mainColor, intensity, speedInput, fontSizeInput,
                     letterSpacingInput, bgColorInput];
  allInputs.forEach((el) => el?.addEventListener("input", render));
  fontWeightInput.addEventListener("change", render);
  uppercaseCheck?.addEventListener("change", render);
  scanlinesCheck?.addEventListener("change", render);
  textShadowCheck?.addEventListener("change", render);

  // Style preset selection
  stylesEl.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("[data-style]") as HTMLElement | null;
    if (!btn) return;
    const style = glitchStyles.find((s) => s.id === btn.dataset.style);
    if (!style) return;
    activeStyle = style;
    renderStyleButtons();
    render();
  });

  // Color presets
  document.getElementById("gx-color-presets")?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("[data-colors]") as HTMLElement | null;
    if (!btn) return;
    const [col1, col2] = btn.dataset.colors!.split(",");
    c1!.value = col1;
    c2!.value = col2;
    render();
  });

  // Background presets
  document.querySelectorAll<HTMLElement>("[data-bg]").forEach((btn) => {
    btn.addEventListener("click", () => {
      bgColorInput!.value = btn.dataset.bg!;
      render();
    });
  });

  // Code format tabs
  document.querySelectorAll<HTMLElement>(".gx-code-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      codeFormat = (btn.dataset.code || "both") as typeof codeFormat;
      document.querySelectorAll<HTMLElement>(".gx-code-btn").forEach((b) => {
        if (b === btn) {
          b.className = "gx-code-btn rounded-md bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white";
        } else {
          b.className = "gx-code-btn rounded-md border border-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400";
        }
      });
      render();
    });
  });

  // BG toggle (cycle through quick bgs)
  const quickBgs = ["#0f172a", "#000000", "#1a1a2e", "#ffffff", "#1e293b"];
  let bgIdx = 0;
  document.getElementById("gx-bg-toggle")?.addEventListener("click", () => {
    bgIdx = (bgIdx + 1) % quickBgs.length;
    bgColorInput!.value = quickBgs[bgIdx];
    render();
  });

  // Fullscreen toggle
  document.getElementById("gx-fullscreen")?.addEventListener("click", () => {
    const stageWrapper = stage!.parentElement!;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      stageWrapper.requestFullscreen().catch(() => {});
    }
  });

  // Copy
  copyBtn.addEventListener("click", () => copyText(cssEl!.textContent || ""));

  // ── Initial render ──────────────────────────────────────────────────
  renderStyleButtons();
  render();
}
