// Color Scale Generator — even interpolation across N stops, RGB or HSL.
import { colorScale, hexToRgb, idealTextColor, rgbToHex, type MixSpace, type RGB } from "../lib/color";
import { copyFlash, copyText } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const stopsEl = $("cs-stops");
const stepsEl = $<HTMLInputElement>("cs-steps");
const spaceEl = $<HTMLSelectElement>("cs-space");

if (stopsEl && stepsEl && spaceEl) {
  const barEl = $("cs-bar")!;
  const swatchesEl = $("cs-swatches")!;
  let stops: string[] = ["#ff5c1a", "#6d28d9", "#0ea5e9"];
  let scale: RGB[] = [];

  function renderStops() {
    stopsEl.innerHTML = stops
      .map(
        (c, i) => `
        <span class="relative">
          <input type="color" value="${c}" data-idx="${i}" class="cs-stop h-11 w-11 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0 dark:border-slate-700" />
          ${stops.length > 2 ? `<button type="button" data-remove="${i}" class="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-white hover:bg-red-500">×</button>` : ""}
        </span>`,
      )
      .join("");
    stopsEl.querySelectorAll<HTMLInputElement>(".cs-stop").forEach((el) =>
      el.addEventListener("input", () => {
        stops[Number(el.dataset.idx)] = el.value;
        run();
      }),
    );
    stopsEl.querySelectorAll<HTMLButtonElement>("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", () => {
        stops.splice(Number(btn.dataset.remove), 1);
        renderStops();
        run();
      }),
    );
  }

  function run() {
    const rgbStops = stops.map((h) => hexToRgb(h)).filter((c): c is RGB => c !== null);
    scale = colorScale(rgbStops, Number(stepsEl!.value), spaceEl!.value as MixSpace);
    $("cs-steps-val")!.textContent = stepsEl!.value;

    barEl.innerHTML = scale.map((c) => `<span class="flex-1" style="background:${rgbToHex(c.r, c.g, c.b)}"></span>`).join("");

    swatchesEl.innerHTML = scale
      .map((c) => {
        const hex = rgbToHex(c.r, c.g, c.b);
        const txt = idealTextColor(c);
        return `<button type="button" data-copy="${hex}" class="copy-swatch flex h-16 items-end justify-center rounded-xl border border-slate-200 pb-1.5 font-mono text-[11px] font-bold dark:border-slate-700" style="background:${hex};color:${txt}">${hex}</button>`;
      })
      .join("");
  }

  swatchesEl.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button[data-copy]") as HTMLElement | null;
    if (btn?.dataset.copy) copyFlash(btn, btn.dataset.copy);
  });

  $("cs-add")?.addEventListener("click", () => {
    if (stops.length >= 6) return;
    stops.push("#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"));
    renderStops();
    run();
  });
  stepsEl.addEventListener("input", run);
  spaceEl.addEventListener("change", run);

  const hexes = () => scale.map((c) => rgbToHex(c.r, c.g, c.b));
  $("cs-copy-css")?.addEventListener("click", () => copyText(hexes().map((h) => `"${h}"`).join(", ")));
  $("cs-copy-json")?.addEventListener("click", () => copyText(JSON.stringify(hexes())));

  renderStops();
  run();
}
