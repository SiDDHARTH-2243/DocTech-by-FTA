// Random Number Generator — crypto-backed, with unique + sort options.
import { copyText, toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const minEl = $<HTMLInputElement>("rn-min");
const maxEl = $<HTMLInputElement>("rn-max");
const countEl = $<HTMLInputElement>("rn-count");
const unique = $<HTMLInputElement>("rn-unique");
const sortEl = $<HTMLSelectElement>("rn-sort");
const genBtn = $("rn-generate");
const output = $("rn-output");
const copyBtn = $("rn-copy");

if (minEl && maxEl && countEl && genBtn && output) {
  function randInt(min: number, max: number): number {
    const range = max - min + 1;
    const limit = Math.floor(0xffffffff / range) * range;
    const buf = new Uint32Array(1);
    let x = 0;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return min + (x % range);
  }

  let last: number[] = [];

  function generate() {
    let lo = Math.floor(parseFloat(minEl!.value));
    let hi = Math.floor(parseFloat(maxEl!.value));
    if (isNaN(lo) || isNaN(hi)) return toast("Enter a valid range", "err");
    if (lo > hi) [lo, hi] = [hi, lo];
    let n = Math.min(1000, Math.max(1, parseInt(countEl!.value) || 1));

    const span = hi - lo + 1;
    if (unique?.checked && n > span) {
      n = span;
      countEl!.value = String(n);
      toast(`Only ${span} unique values fit in that range`, "info");
    }

    let nums: number[];
    if (unique?.checked) {
      const pool = Array.from({ length: span }, (_, i) => lo + i);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = randInt(0, i);
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      nums = pool.slice(0, n);
    } else {
      nums = Array.from({ length: n }, () => randInt(lo, hi));
    }

    if (sortEl?.value === "asc") nums.sort((a, b) => a - b);
    else if (sortEl?.value === "desc") nums.sort((a, b) => b - a);

    last = nums;
    output!.innerHTML = "";
    for (const num of nums) {
      const chip = document.createElement("span");
      chip.className = "rounded-xl bg-orange-100 px-3 py-1.5 font-mono text-sm font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-400";
      chip.textContent = String(num);
      output!.appendChild(chip);
    }
  }

  genBtn.addEventListener("click", generate);
  copyBtn?.addEventListener("click", () => {
    if (!last.length) return toast("Generate some numbers first", "err");
    copyText(last.join(", ")).then(() => toast("Copied", "ok"));
  });

  generate();
}
