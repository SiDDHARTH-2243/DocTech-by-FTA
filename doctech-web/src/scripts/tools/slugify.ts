// Slugify — URL-safe slug generation from lib/text.ts.
import { slugify } from "../lib/text";
import { copyFlash } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const input = $<HTMLTextAreaElement>("sl-in");
const slugEl = $("sl-slug");

if (input && slugEl) {
  const sepEl = $<HTMLSelectElement>("sl-sep")!;
  const maxEl = $<HTMLInputElement>("sl-max")!;
  const lowerEl = $<HTMLInputElement>("sl-lower")!;
  const accentsEl = $<HTMLInputElement>("sl-accents")!;
  const lenEl = $("sl-len")!;

  function run() {
    const slug = slugify(input!.value, {
      separator: sepEl.value,
      lower: lowerEl.checked,
      stripAccents: accentsEl.checked,
      maxLength: Number(maxEl.value) || 0,
    });
    slugEl!.textContent = slug || "—";
    lenEl.textContent = slug ? `${slug.length} characters` : "";
  }

  input.addEventListener("input", run);
  [maxEl].forEach((el) => el.addEventListener("input", run));
  [sepEl, lowerEl, accentsEl].forEach((el) => el.addEventListener("change", run));

  $("sl-out")?.addEventListener("click", (e) => {
    const slug = slugEl!.textContent ?? "";
    if (slug && slug !== "—") copyFlash(e.currentTarget as HTMLElement, slug);
  });

  input.value = "10 Amazing Tips for Café Owners in 2025!";
  run();
}
