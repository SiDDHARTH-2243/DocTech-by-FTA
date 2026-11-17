// Glassmorphism Generator — premium frosted-glass engine. Client-side.
// Features: animated gradient backgrounds, curated presets, shape switching,
// glass tuning (blur, opacity, saturation, border, radius, shadow),
// dual-pane code output (CSS + HTML), and full CSS export.
import { hexToRgb, hslToRgb, rgbToHex } from "../lib/color";
import { copyText, toast } from "../lib/ui";

// ── Types ────────────────────────────────────────────────────────────────────
type Shape = "rounded" | "pill" | "circle" | "square";
type BgMode = "gradient" | "image";

interface GmState {
  glassColor: string;
  blur: number;
  opacity: number;
  saturate: number;
  borderAlpha: number;
  radius: number;
  shadowAlpha: number;
  bgColor1: string;
  bgColor2: string;
  shape: Shape;
  showContent: boolean;
  bgMode: BgMode;
  bgImageIndex: number;
}

// ── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULTS: GmState = {
  glassColor: "#ffffff",
  blur: 12,
  opacity: 25,
  saturate: 180,
  borderAlpha: 18,
  radius: 16,
  shadowAlpha: 37,
  bgColor1: "#7c3aed",
  bgColor2: "#2563eb",
  shape: "rounded",
  showContent: true,
  bgMode: "gradient",
  bgImageIndex: 0,
};

// Vibrant background photos (Unsplash CDN) for image mode.
const BACKGROUNDS = [
  "https://images.unsplash.com/photo-1502790671504-542ad42d5189?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80",
];

// ── Curated presets ──────────────────────────────────────────────────────────
const PRESETS: {
  name: string;
  state: Partial<GmState>;
}[] = [
  {
    name: "Crystal Clear",
    state: {
      glassColor: "#ffffff", blur: 16, opacity: 15, saturate: 180,
      borderAlpha: 20, radius: 20, shadowAlpha: 30,
      bgColor1: "#6366f1", bgColor2: "#ec4899",
    },
  },
  {
    name: "Smoky Dark",
    state: {
      glassColor: "#0f172a", blur: 20, opacity: 40, saturate: 120,
      borderAlpha: 12, radius: 16, shadowAlpha: 50,
      bgColor1: "#1e293b", bgColor2: "#334155",
    },
  },
  {
    name: "Aurora",
    state: {
      glassColor: "#a5f3fc", blur: 14, opacity: 20, saturate: 200,
      borderAlpha: 25, radius: 24, shadowAlpha: 25,
      bgColor1: "#059669", bgColor2: "#7c3aed",
    },
  },
  {
    name: "Sunset Haze",
    state: {
      glassColor: "#fbbf24", blur: 10, opacity: 22, saturate: 160,
      borderAlpha: 18, radius: 16, shadowAlpha: 35,
      bgColor1: "#f97316", bgColor2: "#ec4899",
    },
  },
  {
    name: "Ocean Depth",
    state: {
      glassColor: "#0ea5e9", blur: 18, opacity: 30, saturate: 140,
      borderAlpha: 15, radius: 20, shadowAlpha: 45,
      bgColor1: "#0f172a", bgColor2: "#0369a1",
    },
  },
  {
    name: "Neon Frost",
    state: {
      glassColor: "#22d3ee", blur: 8, opacity: 18, saturate: 200,
      borderAlpha: 30, radius: 12, shadowAlpha: 40,
      bgColor1: "#0f0f23", bgColor2: "#581c87",
    },
  },
  {
    name: "Rose Petal",
    state: {
      glassColor: "#fda4af", blur: 12, opacity: 28, saturate: 150,
      borderAlpha: 22, radius: 20, shadowAlpha: 30,
      bgColor1: "#be123c", bgColor2: "#9f1239",
    },
  },
  {
    name: "Minimal White",
    state: {
      glassColor: "#ffffff", blur: 6, opacity: 50, saturate: 100,
      borderAlpha: 10, radius: 8, shadowAlpha: 15,
      bgColor1: "#e2e8f0", bgColor2: "#cbd5e1",
    },
  },
  {
    name: "Deep Space",
    state: {
      glassColor: "#7c3aed", blur: 24, opacity: 12, saturate: 200,
      borderAlpha: 20, radius: 24, shadowAlpha: 55,
      bgColor1: "#020617", bgColor2: "#1e1b4b",
    },
  },
  {
    name: "Emerald Ice",
    state: {
      glassColor: "#6ee7b7", blur: 14, opacity: 20, saturate: 180,
      borderAlpha: 22, radius: 18, shadowAlpha: 30,
      bgColor1: "#064e3b", bgColor2: "#0d9488",
    },
  },
  {
    name: "Golden Hour",
    state: {
      glassColor: "#ffffff", blur: 10, opacity: 20, saturate: 160,
      borderAlpha: 25, radius: 16, shadowAlpha: 35,
      bgColor1: "#d97706", bgColor2: "#dc2626",
    },
  },
  {
    name: "Arctic Mist",
    state: {
      glassColor: "#e0f2fe", blur: 30, opacity: 18, saturate: 200,
      borderAlpha: 15, radius: 28, shadowAlpha: 20,
      bgColor1: "#0c4a6e", bgColor2: "#1e40af",
    },
  },
];

// ── User list for content demo ───────────────────────────────────────────────
const USERS = [
  { name: "Rohan Desai", role: "Product Designer" },
  { name: "Ananya Sharma", role: "Frontend Engineer" },
  { name: "Vikram Singh", role: "Online" },
  { name: "Priya Nair", role: "Away" },
];

// ── DOM references ───────────────────────────────────────────────────────────
const $ = (id: string) => document.getElementById(id);
const stage = $("gm-stage");
const bgShapes = $("gm-bg-shapes");
const card = $("gm-card");
const settingsBtn = $("gm-settings");
const contentEl = $("gm-content");
const cssEl = $("gm-css");

if (stage && bgShapes && card && settingsBtn && contentEl && cssEl) {
  const state: GmState = structuredClone(DEFAULTS);

  // Controls
  const glassColorInput = $("gm-glass-color") as HTMLInputElement;
  const bgColor1Input = $("gm-bg-color-1") as HTMLInputElement;
  const bgColor2Input = $("gm-bg-color-2") as HTMLInputElement;
  const contentToggle = $("gm-content-toggle") as HTMLInputElement;

  const sliderIds = [
    "gm-blur", "gm-opacity", "gm-saturate",
    "gm-border-a", "gm-radius", "gm-shadow-a",
  ] as const;
  const sliders = Object.fromEntries(
    sliderIds.map((id) => [id, $(id) as HTMLInputElement]),
  );
  const SLIDER_KEY_MAP: Record<string, keyof GmState> = {
    "gm-blur": "blur",
    "gm-opacity": "opacity",
    "gm-saturate": "saturate",
    "gm-border-a": "borderAlpha",
    "gm-radius": "radius",
    "gm-shadow-a": "shadowAlpha",
  };

  // Code tabs
  let activeTab: "css" | "html" = "css";

  // ── Shape helpers ────────────────────────────────────────────────────────
  const SHAPE_STYLES: Record<Shape, { width: string; padding: string; borderRadius: string }> = {
    rounded: { width: "320px", padding: "24px", borderRadius: "RADIUS" },
    pill: { width: "360px", padding: "24px 32px", borderRadius: "999px" },
    circle: { width: "260px", padding: "24px", borderRadius: "50%" },
    square: { width: "300px", padding: "24px", borderRadius: "0" },
  };

  // ── Background rendering (gradient + image modes) ──────────────────────
  function renderBackground() {
    if (state.bgMode === "image") {
      // Image mode: hide floating shapes, show photo
      bgShapes!.innerHTML = "";
      stage!.style.background = `url("${BACKGROUNDS[state.bgImageIndex]}") center/cover no-repeat`;
    } else {
      // Gradient mode: animated floating shapes
      const shapes = [
        { size: 180, top: "10%", left: "15%", delay: "0s", bg: state.bgColor1 },
        { size: 140, top: "55%", left: "65%", delay: "2s", bg: state.bgColor2 },
        { size: 100, top: "70%", left: "20%", delay: "4s", bg: state.bgColor1 },
        { size: 120, top: "15%", left: "70%", delay: "1s", bg: state.bgColor2 },
        { size: 80, top: "40%", left: "40%", delay: "3s", bg: state.bgColor1 },
      ];

      bgShapes!.innerHTML = shapes
        .map(
          (s) => `<div style="
            position:absolute;
            width:${s.size}px;
            height:${s.size}px;
            top:${s.top};
            left:${s.left};
            background:${s.bg};
            border-radius:50%;
            filter:blur(40px);
            opacity:0.7;
            animation:gm-float ${6 + Math.random() * 4}s ease-in-out infinite alternate;
            animation-delay:${s.delay};
          "></div>`,
        )
        .join("");

      stage!.style.background = `linear-gradient(135deg, ${state.bgColor1}, ${state.bgColor2})`;
    }

    // Toggle UI controls visibility
    const gradControls = $("gm-bg-gradient-controls");
    const imgControls = $("gm-bg-image-controls");
    if (gradControls) gradControls.style.display = state.bgMode === "gradient" ? "" : "none";
    if (imgControls) imgControls.style.display = state.bgMode === "image" ? "" : "none";
  }

  // Inject keyframes once
  if (!document.getElementById("gm-keyframes")) {
    const style = document.createElement("style");
    style.id = "gm-keyframes";
    style.textContent = `
      @keyframes gm-float {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(30px, -20px) scale(1.1); }
      }
    `;
    document.head.appendChild(style);
  }

  // ── User content ─────────────────────────────────────────────────────────
  function nameHue(name: string): number {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return h;
  }

  contentEl.innerHTML = USERS.map((u) => {
    const c = hslToRgb(nameHue(u.name), 65, 55);
    const initials = u.name.split(" ").map((n) => n[0]).join("");
    return `
      <div class="flex items-center gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style="background:${rgbToHex(c.r, c.g, c.b)}">${initials}</span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold">${u.name}</span>
          <span class="block truncate text-xs opacity-75">${u.role}</span>
        </span>
      </div>`;
  }).join("");

  // ── Render ──────────────────────────────────────────────────────────────
  function render() {
    // Update slider labels
    sliderIds.forEach((id) => {
      $(`${id}-val`)!.textContent = sliders[id].value;
    });
    $("gm-glass-color-hex")!.textContent = state.glassColor;

    // Background
    renderBackground();

    // Glass card
    const rgb = hexToRgb(state.glassColor) || { r: 255, g: 255, b: 255 };
    const a = state.opacity / 100;
    const bgVal = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
    const borderVal = `1px solid rgba(255, 255, 255, ${(state.borderAlpha / 100).toFixed(2)})`;
    const blurVal = `blur(${state.blur}px) saturate(${state.saturate}%)`;
    const radiusVal = state.shape === "pill" ? "999px"
      : state.shape === "circle" ? "50%"
      : state.shape === "square" ? "0"
      : `${state.radius}px`;
    const shadowVal = `0 8px 32px rgba(0, 0, 0, ${(state.shadowAlpha / 100).toFixed(2)})`;

    const cs = card!.style;
    cs.background = bgVal;
    cs.backdropFilter = blurVal;
    (cs as any).webkitBackdropFilter = blurVal;
    cs.border = borderVal;
    cs.borderRadius = radiusVal;
    cs.boxShadow = shadowVal;

    // Shape sizing
    const shapeDef = SHAPE_STYLES[state.shape];
    cs.width = shapeDef.width;
    cs.padding = shapeDef.padding;
    cs.minHeight = state.shape === "circle" ? shapeDef.width : "";

    // Content toggle
    const show = state.showContent;
    contentEl!.style.display = show ? "" : "none";
    settingsBtn!.style.display = show ? "" : "none";

    // CSS output
    renderCode();
  }

  function renderCode() {
    const rgb = hexToRgb(state.glassColor) || { r: 255, g: 255, b: 255 };
    const a = state.opacity / 100;
    const radiusVal = state.shape === "pill" ? "999px"
      : state.shape === "circle" ? "50%"
      : state.shape === "square" ? "0"
      : `${state.radius}px`;

    if (activeTab === "css") {
      cssEl!.textContent = [
        `/* Glassmorphism */`,
        `background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a});`,
        `backdrop-filter: blur(${state.blur}px) saturate(${state.saturate}%);`,
        `-webkit-backdrop-filter: blur(${state.blur}px) saturate(${state.saturate}%);`,
        `border-radius: ${radiusVal};`,
        `border: 1px solid rgba(255, 255, 255, ${(state.borderAlpha / 100).toFixed(2)});`,
        `box-shadow: 0 8px 32px rgba(0, 0, 0, ${(state.shadowAlpha / 100).toFixed(2)});`,
      ].join("\n");
    } else {
      cssEl!.textContent = [
        `<div class="glass-card">`,
        `  <!-- Your content here -->`,
        `</div>`,
        ``,
        `<style>`,
        `.glass-card {`,
        `  background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a});`,
        `  backdrop-filter: blur(${state.blur}px) saturate(${state.saturate}%);`,
        `  -webkit-backdrop-filter: blur(${state.blur}px) saturate(${state.saturate}%);`,
        `  border-radius: ${radiusVal};`,
        `  border: 1px solid rgba(255, 255, 255, ${(state.borderAlpha / 100).toFixed(2)});`,
        `  box-shadow: 0 8px 32px rgba(0, 0, 0, ${(state.shadowAlpha / 100).toFixed(2)});`,
        `}`,
        `</style>`,
      ].join("\n");
    }
  }

  // ── Event: sliders ─────────────────────────────────────────────────────
  sliderIds.forEach((id) => {
    sliders[id].addEventListener("input", () => {
      const key = SLIDER_KEY_MAP[id];
      (state as any)[key] = parseInt(sliders[id].value);
      render();
    });
  });

  // ── Event: color inputs ────────────────────────────────────────────────
  glassColorInput.addEventListener("input", () => {
    state.glassColor = glassColorInput.value;
    render();
  });
  bgColor1Input.addEventListener("input", () => {
    state.bgColor1 = bgColor1Input.value;
    render();
  });
  bgColor2Input.addEventListener("input", () => {
    state.bgColor2 = bgColor2Input.value;
    render();
  });

  // ── Event: content toggle ──────────────────────────────────────────────
  contentToggle.addEventListener("change", () => {
    state.showContent = contentToggle.checked;
    render();
  });

  // ── Event: shape group ─────────────────────────────────────────────────
  function paintGroup(groupId: string, active: string) {
    $(groupId)!.querySelectorAll<HTMLButtonElement>("[data-val]").forEach((b) => {
      const on = b.dataset.val === active;
      b.className =
        "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors " +
        (on ? "bg-orange-500 text-white" : "text-slate-600 dark:text-slate-300");
    });
  }

  $("gm-shape-group")!.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-val]") as HTMLElement | null;
    if (b) {
      state.shape = b.dataset.val as Shape;
      paintGroup("gm-shape-group", state.shape);
      render();
    }
  });

  // ── Event: background mode toggle ──────────────────────────────────────
  $("gm-bgmode-group")!.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-val]") as HTMLElement | null;
    if (b) {
      state.bgMode = b.dataset.val as BgMode;
      paintGroup("gm-bgmode-group", state.bgMode);
      render();
    }
  });

  // ── Event: shuffle background photo ────────────────────────────────────
  const shuffleBgBtn = $("gm-shuffle-bg");
  if (shuffleBgBtn) {
    shuffleBgBtn.addEventListener("click", () => {
      let next = state.bgImageIndex;
      while (next === state.bgImageIndex) next = Math.floor(Math.random() * BACKGROUNDS.length);
      state.bgImageIndex = next;
      render();
    });
  }

  // ── Event: code tabs ───────────────────────────────────────────────────
  const tabCss = $("gm-tab-css")!;
  const tabHtml = $("gm-tab-html")!;

  function paintTabs() {
    const onCls = "rounded-md px-2.5 py-1 text-xs font-semibold bg-orange-500 text-white";
    const offCls = "rounded-md px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400";
    tabCss.className = activeTab === "css" ? onCls : offCls;
    tabHtml.className = activeTab === "html" ? onCls : offCls;
  }

  tabCss.addEventListener("click", () => { activeTab = "css"; paintTabs(); renderCode(); });
  tabHtml.addEventListener("click", () => { activeTab = "html"; paintTabs(); renderCode(); });

  // ── Preset gallery ─────────────────────────────────────────────────────
  const presetsEl = $("gm-presets")!;
  presetsEl.innerHTML = PRESETS.map((preset, i) => {
    const s = { ...DEFAULTS, ...preset.state };
    const rgb = hexToRgb(s.glassColor) || { r: 255, g: 255, b: 255 };
    const glassBg = `rgba(${rgb.r},${rgb.g},${rgb.b},${s.opacity / 100})`;
    const gradBg = `linear-gradient(135deg, ${s.bgColor1}, ${s.bgColor2})`;

    return `
      <button type="button" data-preset="${i}" class="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-2 transition-colors hover:border-orange-400 dark:border-slate-700" title="${preset.name}">
        <span class="flex h-14 w-full items-center justify-center rounded-lg" style="background:${gradBg}">
          <span style="width:32px;height:32px;background:${glassBg};border-radius:${Math.min(s.radius, 8)}px;backdrop-filter:blur(${Math.min(s.blur, 6)}px);border:1px solid rgba(255,255,255,${s.borderAlpha / 100});box-shadow:0 2px 8px rgba(0,0,0,${s.shadowAlpha / 200})"></span>
        </span>
        <span class="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">${preset.name}</span>
      </button>`;
  }).join("");

  presetsEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-preset]") as HTMLElement | null;
    if (b) {
      const preset = PRESETS[parseInt(b.dataset.preset!)];
      Object.assign(state, { ...DEFAULTS, ...preset.state });

      // Sync inputs
      glassColorInput.value = state.glassColor;
      bgColor1Input.value = state.bgColor1;
      bgColor2Input.value = state.bgColor2;
      contentToggle.checked = state.showContent;

      sliderIds.forEach((id) => {
        const key = SLIDER_KEY_MAP[id];
        sliders[id].value = String((state as any)[key]);
      });
      paintGroup("gm-shape-group", state.shape);
      render();
    }
  });

  // ── Shuffle ────────────────────────────────────────────────────────────
  const rand = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));
  const randHsl = () => {
    const c = hslToRgb(rand(0, 360), rand(50, 90), rand(30, 60));
    return rgbToHex(c.r, c.g, c.b);
  };

  $("gm-shuffle")!.addEventListener("click", () => {
    state.glassColor = Math.random() < 0.6 ? "#ffffff" : randHsl();
    state.blur = rand(6, 30);
    state.opacity = rand(10, 45);
    state.saturate = rand(100, 200);
    state.borderAlpha = rand(8, 35);
    state.radius = rand(8, 30);
    state.shadowAlpha = rand(15, 55);

    if (state.bgMode === "image") {
      // Shuffle to a different photo
      let next = state.bgImageIndex;
      while (next === state.bgImageIndex) next = Math.floor(Math.random() * BACKGROUNDS.length);
      state.bgImageIndex = next;
    } else {
      state.bgColor1 = randHsl();
      state.bgColor2 = randHsl();
      bgColor1Input.value = state.bgColor1;
      bgColor2Input.value = state.bgColor2;
    }

    // Sync inputs
    glassColorInput.value = state.glassColor;
    sliderIds.forEach((id) => {
      const key = SLIDER_KEY_MAP[id];
      sliders[id].value = String((state as any)[key]);
    });
    render();
  });

  // ── Reset ──────────────────────────────────────────────────────────────
  $("gm-reset")!.addEventListener("click", () => {
    Object.assign(state, structuredClone(DEFAULTS));
    glassColorInput.value = state.glassColor;
    bgColor1Input.value = state.bgColor1;
    bgColor2Input.value = state.bgColor2;
    contentToggle.checked = state.showContent;
    sliderIds.forEach((id) => {
      const key = SLIDER_KEY_MAP[id];
      sliders[id].value = String((state as any)[key]);
    });
    paintGroup("gm-shape-group", state.shape);
    paintGroup("gm-bgmode-group", state.bgMode);
    render();
  });

  // ── Copy ───────────────────────────────────────────────────────────────
  $("gm-copy")!.addEventListener("click", () => copyText(cssEl!.textContent || ""));

  // ── Initial render ─────────────────────────────────────────────────────
  paintGroup("gm-shape-group", state.shape);
  paintGroup("gm-bgmode-group", state.bgMode);
  render();
}
