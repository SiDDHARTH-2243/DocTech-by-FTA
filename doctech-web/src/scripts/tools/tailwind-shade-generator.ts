// Tailwind Shade Scale Generator — one base color → 50–950 scale + exports.
import { hexToRgb, idealTextColor, parseAnyColor, rgbToHex, tailwindScale } from "../lib/color";
import { copyFlash, copyText } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const hexEl = $<HTMLInputElement>("tw-hex");
const picker = $<HTMLInputElement>("tw-picker");
const nameEl = $<HTMLInputElement>("tw-name");

if (hexEl && picker && nameEl) {
  const scaleEl = $("tw-scale")!;
  const exportEl = $("tw-export")!;
  let fmt: "tailwind" | "css" | "scss" = "tailwind";
  let shades: { step: number; hex: string }[] = [];

  function run() {
    const rgb = hexToRgb(hexEl!.value) ?? (parseAnyColor(hexEl!.value) as { r: number; g: number; b: number } | null);
    if (!rgb) {
      hexEl!.classList.add("!border-red-400");
      return;
    }
    hexEl!.classList.remove("!border-red-400");
    picker!.value = rgbToHex(rgb.r, rgb.g, rgb.b);

    shades = tailwindScale(rgb).map((s) => ({ step: s.step, hex: rgbToHex(s.rgb.r, s.rgb.g, s.rgb.b) }));

    scaleEl.innerHTML = shades
      .map((s) => {
        const txt = idealTextColor(hexToRgb(s.hex)!);
        return `<button type="button" data-copy="${s.hex}" class="copy-swatch flex h-20 flex-col items-center justify-between rounded-xl border border-slate-200 py-2 dark:border-slate-700" style="background:${s.hex};color:${txt}">
            <span class="text-xs font-bold">${s.step}</span>
            <span class="font-mono text-[10px] opacity-80">${s.hex}</span>
          </button>`;
      })
      .join("");

    renderExport();
  }

  function renderExport() {
    const name = (nameEl!.value.trim() || "brand").replace(/[^a-zA-Z0-9_-]/g, "");
    let text = "";
    if (fmt === "tailwind") {
      text = `${name}: {\n${shades.map((s) => `  ${s.step}: '${s.hex}',`).join("\n")}\n}`;
    } else if (fmt === "css") {
      text = `:root {\n${shades.map((s) => `  --${name}-${s.step}: ${s.hex};`).join("\n")}\n}`;
    } else {
      text = shades.map((s) => `$${name}-${s.step}: ${s.hex};`).join("\n");
    }
    exportEl.textContent = text;
  }

  scaleEl.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button[data-copy]") as HTMLElement | null;
    if (btn?.dataset.copy) copyFlash(btn, btn.dataset.copy);
  });

  picker.addEventListener("input", () => {
    hexEl.value = picker.value;
    run();
  });
  hexEl.addEventListener("input", run);
  nameEl.addEventListener("input", renderExport);

  document.querySelectorAll<HTMLButtonElement>(".tw-fmt").forEach((b) =>
    b.addEventListener("click", () => {
      fmt = b.dataset.fmt as typeof fmt;
      document.querySelectorAll<HTMLButtonElement>(".tw-fmt").forEach((x) => {
        const on = x === b;
        x.setAttribute("aria-pressed", String(on));
        x.classList.toggle("bg-orange-500", on);
        x.classList.toggle("text-white", on);
        x.classList.toggle("text-slate-500", !on);
      });
      renderExport();
    }),
  );

  $("tw-copy")?.addEventListener("click", () => copyText(exportEl.textContent ?? ""));

  // Prime the active export-format button.
  document.querySelector<HTMLButtonElement>('.tw-fmt[data-fmt="tailwind"]')?.classList.add("bg-orange-500", "text-white");
  run();
}
