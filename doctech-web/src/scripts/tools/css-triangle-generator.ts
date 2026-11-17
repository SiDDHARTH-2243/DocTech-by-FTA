// CSS Triangle Generator — premium multi-directional border trick. Client-side.
import { copyText } from "../lib/ui";

const widthEl = document.getElementById("tri-width") as HTMLInputElement | null;
const heightEl = document.getElementById("tri-height") as HTMLInputElement | null;
const widthVal = document.getElementById("tri-width-val");
const heightVal = document.getElementById("tri-height-val");
const heightWrap = document.getElementById("tri-height-wrap");
const colorEl = document.getElementById("tri-color") as HTMLInputElement | null;
const colorHex = document.getElementById("tri-color-hex");
const typeRadios = document.querySelectorAll<HTMLInputElement>("input[name='tri-type']");
const dirBtns = document.querySelectorAll<HTMLButtonElement>(".tri-dir-btn");
const preview = document.getElementById("tri-preview");
const stage = document.getElementById("tri-stage");
const bgToggle = document.getElementById("tri-bg-toggle");
const cssEl = document.getElementById("tri-css");
const copyBtn = document.getElementById("tri-copy");
const formatBtns = document.querySelectorAll<HTMLButtonElement>(".tri-format-btn");

if (widthEl && heightEl && colorEl && preview && cssEl && copyBtn && stage && bgToggle) {
  let activeDir = "up";
  let isEquilateral = true;
  let codeFormat = "css"; // css | tailwind

  // Update button visual states
  function updateDirButtons() {
    dirBtns.forEach((btn) => {
      if (btn.dataset.dir === activeDir) {
        btn.className = "tri-dir-btn aspect-square rounded-xl border-2 border-orange-500 bg-orange-50 p-2 text-orange-500 shadow-sm shadow-orange-500/20 transition-all dark:bg-orange-500/10";
      } else {
        btn.className = "tri-dir-btn aspect-square rounded-xl border-2 border-slate-200 bg-slate-50 p-2 text-slate-400 transition-all hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-800";
      }
    });
  }

  // Calculate CSS borders based on direction & dimensions
  function getBorderRules(): Record<string, string> {
    const w = parseFloat(widthEl!.value);
    const h = isEquilateral ? (w * Math.sqrt(3)) / 2 : parseFloat(heightEl!.value); // Equilateral height = w * √3 / 2
    const c = colorEl!.value;

    const top = `${h / 2}px solid transparent`;
    const bottom = `${h / 2}px solid transparent`;
    const left = `${w / 2}px solid transparent`;
    const right = `${w / 2}px solid transparent`;
    
    // For cardinal directions, the perpendicular border is full width, the parallel borders are half
    const hFull = `${h}px solid ${c}`;
    const vFull = `${w}px solid ${c}`;
    // For diagonals, both are full
    const wFull = `${w}px solid ${c}`;
    const hFullDiag = `${h}px solid ${c}`;

    switch (activeDir) {
      case "up":
        return { "border-left": left, "border-right": right, "border-bottom": hFull };
      case "down":
        return { "border-left": left, "border-right": right, "border-top": hFull };
      case "left":
        return { "border-top": top, "border-bottom": bottom, "border-right": vFull };
      case "right":
        return { "border-top": top, "border-bottom": bottom, "border-left": vFull };
      case "up-left":
        return { "border-top": hFullDiag, "border-right": `${w}px solid transparent` };
      case "up-right":
        return { "border-top": hFullDiag, "border-left": `${w}px solid transparent` };
      case "down-left":
        return { "border-bottom": hFullDiag, "border-right": `${w}px solid transparent` };
      case "down-right":
        return { "border-bottom": hFullDiag, "border-left": `${w}px solid transparent` };
      default:
        return {};
    }
  }

  function render() {
    // Sync UI values
    widthVal!.textContent = widthEl!.value;
    heightVal!.textContent = heightEl!.value;
    colorHex!.textContent = colorEl!.value;

    // Handle Equilateral Mode
    if (isEquilateral) {
      heightWrap!.classList.add("hidden");
    } else {
      heightWrap!.classList.remove("hidden");
    }

    const rules = getBorderRules();

    // Update Visual Preview
    preview!.style.cssText = "width: 0; height: 0; transition: border-width 0.2s ease, border-color 0.2s ease;";
    Object.entries(rules).forEach(([k, v]) => preview!.style.setProperty(k, v));

    // Generate Code Output
    if (codeFormat === "css") {
      const body = ["  width: 0;", "  height: 0;", ...Object.entries(rules).map(([k, v]) => `  ${k}: ${v};`)].join("\n");
      cssEl!.textContent = `.triangle {\n${body}\n}`;
    } else if (codeFormat === "tailwind") {
      // Tailwind uses arbitrary values for custom borders since standard tailwind doesn't cover all sizes natively
      const classes = ["w-0", "h-0"];
      Object.entries(rules).forEach(([k, v]) => {
        // e.g., border-left: 50px solid transparent -> border-l-[50px] border-l-transparent
        const propMap: Record<string, string> = {
          "border-top": "t", "border-bottom": "b", "border-left": "l", "border-right": "r"
        };
        const dir = propMap[k];
        const match = v.match(/^([\d.]+)px solid (.*)$/);
        if (match) {
          const px = Math.round(parseFloat(match[1]) * 10) / 10; // Round to 1 dec
          const col = match[2];
          classes.push(`border-${dir}-[${px}px]`);
          if (col === "transparent") {
            classes.push(`border-${dir}-transparent`);
          } else {
            classes.push(`border-${dir}-[${col}]`);
          }
        }
      });
      cssEl!.textContent = `<div class="${classes.join(" ")}"></div>`;
    }
  }

  // ── Event Listeners ──────────────────────────────────────────────────

  // Dimensions & Color
  [widthEl, heightEl, colorEl].forEach((el) => {
    el!.addEventListener("input", render);
  });

  // Color presets
  document.getElementById("tri-color-presets")?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("[data-color]") as HTMLElement | null;
    if (!btn) return;
    colorEl!.value = btn.dataset.color!;
    render();
  });

  // Type Radios (Equilateral vs Custom)
  typeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        isEquilateral = radio.value === "equilateral";
        render();
      }
    });
  });

  // Direction Compass
  dirBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeDir = btn.dataset.dir!;
      updateDirButtons();
      render();
    });
  });

  // Code format toggle
  formatBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      codeFormat = btn.dataset.format!;
      formatBtns.forEach((b) => {
        if (b === btn) {
          b.className = "tri-format-btn rounded-md bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white";
        } else {
          b.className = "tri-format-btn rounded-md border border-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400";
        }
      });
      render();
    });
  });

  // Background toggle
  let bgActive = true;
  bgToggle.addEventListener("click", () => {
    bgActive = !bgActive;
    if (bgActive) {
      stage.style.backgroundImage = "radial-gradient(circle, #cbd5e1 1px, transparent 1px)";
      bgToggle.classList.replace("bg-white", "bg-slate-100");
    } else {
      stage.style.backgroundImage = "none";
      bgToggle.classList.replace("bg-slate-100", "bg-white");
    }
  });

  // Copy
  copyBtn.addEventListener("click", () => copyText(cssEl!.textContent || ""));

  // Initial draw
  updateDirButtons();
  render();
}
