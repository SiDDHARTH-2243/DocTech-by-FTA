// Number Base Converter — BigInt conversions from lib/convert.ts.
import { groupDigits, parseInBase, toBase } from "../lib/convert";
import { copyText } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const input = $<HTMLInputElement>("nb-in");
const baseSel = $<HTMLSelectElement>("nb-base");

if (input && baseSel) {
  const groupEl = $<HTMLInputElement>("nb-group");
  const customBaseEl = $<HTMLInputElement>("nb-custom-base");
  const errEl = $("nb-error");

  const GROUP_SIZE: Record<string, number> = { bin: 4, oct: 3, dec: 3, hex: 2 };

  /** Auto-detect base from a 0x/0b/0o prefix, else fall back to the dropdown. */
  function effectiveBase(raw: string): number {
    if (baseSel!.value !== "auto") return Number(baseSel!.value);
    const s = raw.trim().toLowerCase().replace(/^[+-]/, "");
    if (s.startsWith("0x")) return 16;
    if (s.startsWith("0b")) return 2;
    if (s.startsWith("0o")) return 8;
    return 10;
  }

  function put(id: string, value: string) {
    const el = document.getElementById(`nb-${id}`);
    if (el) el.textContent = value;
  }

  function run() {
    const raw = input!.value.trim();
    const clear = () => ["bin", "oct", "dec", "hex", "custom"].forEach((id) => put(id, "—"));
    if (!raw) {
      errEl?.classList.add("hidden");
      clear();
      return;
    }
    try {
      const value = parseInBase(raw, effectiveBase(raw));
      const grouped = groupEl!.checked;
      const render = (s: string, size: number) => (grouped ? groupDigits(s, size) : s);

      put("bin", render(toBase(value, 2), GROUP_SIZE.bin));
      put("oct", render(toBase(value, 8), GROUP_SIZE.oct));
      put("dec", render(toBase(value, 10), GROUP_SIZE.dec));
      put("hex", render(toBase(value, 16), GROUP_SIZE.hex).toUpperCase());

      const cb = Math.max(2, Math.min(36, Number(customBaseEl!.value) || 36));
      put("custom", toBase(value, cb));
      errEl?.classList.add("hidden");
    } catch (e) {
      clear();
      if (errEl) {
        errEl.textContent = e instanceof Error ? e.message : "Invalid number.";
        errEl.classList.remove("hidden");
      }
    }
  }

  // Copy raw (ungrouped) values — spaces would break a paste back into code.
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = document.getElementById(`nb-${btn.dataset.copy}`)?.textContent ?? "";
      if (v && v !== "—") copyText(v.replace(/\s/g, ""));
    });
  });

  input.addEventListener("input", run);
  [baseSel, groupEl, customBaseEl].forEach((el) => el?.addEventListener("input", run));
  baseSel.addEventListener("change", run);

  input.value = "255";
  run();
}
