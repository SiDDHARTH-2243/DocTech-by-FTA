// WCAG Contrast Checker — live ratio + AA/AAA verdicts, plus an "auto-fix" that
// walks the text color's lightness until it clears AA.
import { contrastRatio, hslToRgb, parseAnyColor, rgbToHex, rgbToHsl, wcagAssess, type RGB } from "../lib/color";
import { CSS_NAMED_COLORS } from "../lib/colornames";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const fg = $<HTMLInputElement>("ct-fg");
const bg = $<HTMLInputElement>("ct-bg");
const fgText = $<HTMLInputElement>("ct-fg-text");
const bgText = $<HTMLInputElement>("ct-bg-text");

if (fg && bg && fgText && bgText) {
  const preview = $("ct-preview")!;
  const ratioEl = $("ct-ratio")!;
  const ratioNote = $("ct-ratio-note")!;

  const parse = (s: string): RGB | null => {
    const c = parseAnyColor(s);
    if (c) return { r: c.r, g: c.g, b: c.b };
    const named = CSS_NAMED_COLORS[s.trim().toLowerCase()];
    return named ? parse(named) : null;
  };

  const badge = (id: string, pass: boolean) => {
    const el = $(id)!;
    el.textContent = pass ? "✓ Pass" : "✗ Fail";
    el.className = `rounded-full px-3 py-1 text-xs font-bold ${
      pass
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
        : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
    }`;
  };

  function run() {
    const f = parse(fgText.value);
    const b = parse(bgText.value);
    if (f) fgText.classList.remove("!border-red-400");
    else fgText.classList.add("!border-red-400");
    if (b) bgText.classList.remove("!border-red-400");
    else bgText.classList.add("!border-red-400");
    if (!f || !b) return;

    const fHex = rgbToHex(f.r, f.g, f.b);
    const bHex = rgbToHex(b.r, b.g, b.b);
    fg.value = fHex;
    bg.value = bHex;
    preview.style.background = bHex;
    preview.style.color = fHex;

    const ratio = contrastRatio(f, b);
    const a = wcagAssess(ratio);
    ratioEl.textContent = `${ratio.toFixed(2)}:1`;
    ratioEl.className = `font-mono text-6xl font-extrabold tabular-nums ${
      a.aaNormal ? "text-emerald-500" : a.aaLarge ? "text-amber-500" : "text-red-500"
    }`;
    ratioNote.textContent = a.aaaNormal
      ? "Excellent — passes everything"
      : a.aaNormal
        ? "Good for body text"
        : a.aaLarge
          ? "Large text / headings only"
          : "Fails — hard to read";

    badge("ct-aan", a.aaNormal);
    badge("ct-aaan", a.aaaNormal);
    badge("ct-aal", a.aaLarge);
    badge("ct-aaal", a.aaaLarge);
    badge("ct-ui", a.uiComponent);
  }

  const syncFromPicker = (picker: HTMLInputElement, txt: HTMLInputElement) =>
    picker.addEventListener("input", () => {
      txt.value = picker.value;
      run();
    });
  syncFromPicker(fg, fgText);
  syncFromPicker(bg, bgText);
  fgText.addEventListener("input", run);
  bgText.addEventListener("input", run);

  $("ct-swap")?.addEventListener("click", () => {
    const t = fgText.value;
    fgText.value = bgText.value;
    bgText.value = t;
    run();
  });

  // Nudge the text color's HSL lightness away from the background until AA passes.
  $("ct-fix")?.addEventListener("click", () => {
    const f = parse(fgText.value);
    const b = parse(bgText.value);
    if (!f || !b) return;
    const hsl = rgbToHsl(f.r, f.g, f.b);
    const bgLum = rgbToHsl(b.r, b.g, b.b).l;
    const dir = bgLum > 50 ? -1 : 1; // darken text on light bg, lighten on dark bg
    let best = f;
    for (let l = hsl.l; l >= 0 && l <= 100; l += dir * 2) {
      const cand = hslToRgb(hsl.h, hsl.s, l);
      best = cand;
      if (contrastRatio(cand, b) >= 4.5) break;
    }
    fgText.value = rgbToHex(best.r, best.g, best.b);
    run();
  });

  run();
}
