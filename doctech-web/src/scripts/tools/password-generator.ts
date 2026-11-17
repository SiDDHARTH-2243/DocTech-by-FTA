// Strong Password Generator — fully client-side, crypto-backed.
import { copyText, toast } from "../lib/ui";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/";
const AMBIG = new Set("O0oIl1|`'\".,:;".split(""));

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const lengthEl = $<HTMLInputElement>("pw-length");
const lengthVal = $("pw-length-val");
const upper = $<HTMLInputElement>("pw-upper");
const lower = $<HTMLInputElement>("pw-lower");
const digits = $<HTMLInputElement>("pw-digits");
const symbols = $<HTMLInputElement>("pw-symbols");
const ambig = $<HTMLInputElement>("pw-ambig");
const count = $<HTMLInputElement>("pw-count");
const output = $("pw-output");
const strengthBar = $("pw-strength-bar");
const strengthLabel = $("pw-strength-label");
const generateBtn = $("pw-generate");
const regenBtn = $("pw-regen");
const copyBtn = $("pw-copy");
const listWrap = $("pw-list-wrap");
const list = $("pw-list");
const copyAllBtn = $("pw-copy-all");

if (lengthEl && output && generateBtn) {
  /** Unbiased random integer in [0, max) using rejection sampling. */
  function randInt(max: number): number {
    const limit = Math.floor(0xffffffff / max) * max;
    const buf = new Uint32Array(1);
    let x = 0;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % max;
  }

  function pool(): string {
    let chars = "";
    if (upper?.checked) chars += UPPER;
    if (lower?.checked) chars += LOWER;
    if (digits?.checked) chars += DIGITS;
    if (symbols?.checked) chars += SYMBOLS;
    if (ambig?.checked) chars = [...chars].filter((c) => !AMBIG.has(c)).join("");
    return chars;
  }

  function makeOne(chars: string, len: number): string {
    let out = "";
    for (let i = 0; i < len; i++) out += chars[randInt(chars.length)];
    return out;
  }

  function rateStrength(len: number, poolSize: number) {
    const bits = poolSize > 1 ? len * Math.log2(poolSize) : 0;
    if (bits < 40) return { label: "Weak", pct: 25, color: "#ef4444" };
    if (bits < 70) return { label: "Fair", pct: 55, color: "#f59e0b" };
    if (bits < 110) return { label: "Strong", pct: 80, color: "#10b981" };
    return { label: "Very strong", pct: 100, color: "#059669" };
  }

  function generate() {
    const chars = pool();
    if (!chars) {
      toast("Select at least one character set", "err");
      return;
    }
    const len = parseInt(lengthEl!.value);
    const n = Math.min(50, Math.max(1, parseInt(count?.value || "1") || 1));
    const items = Array.from({ length: n }, () => makeOne(chars, len));

    output!.textContent = items[0];

    const s = rateStrength(len, chars.length);
    if (strengthBar) {
      strengthBar.style.width = `${s.pct}%`;
      strengthBar.style.background = s.color;
    }
    if (strengthLabel) {
      strengthLabel.textContent = s.label;
      strengthLabel.style.color = s.color;
    }

    if (n > 1 && list && listWrap) {
      list.innerHTML = "";
      for (const p of items) {
        const li = document.createElement("li");
        li.className = "flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50";
        const span = document.createElement("span");
        span.className = "min-w-0 truncate";
        span.textContent = p;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "shrink-0 text-xs font-bold text-orange-500 hover:text-orange-600";
        btn.textContent = "Copy";
        btn.addEventListener("click", () => copyText(p).then(() => toast("Copied", "ok")));
        li.append(span, btn);
        list.appendChild(li);
      }
      listWrap.classList.remove("hidden");
    } else {
      listWrap?.classList.add("hidden");
    }
  }

  lengthEl.addEventListener("input", () => {
    if (lengthVal) lengthVal.textContent = lengthEl!.value;
    generate();
  });
  [upper, lower, digits, symbols, ambig, count].forEach((el) => el?.addEventListener("input", generate));
  generateBtn.addEventListener("click", generate);
  regenBtn?.addEventListener("click", generate);
  copyBtn?.addEventListener("click", () => {
    const v = output!.textContent || "";
    if (v && v !== "—") copyText(v).then(() => toast("Password copied", "ok"));
  });
  copyAllBtn?.addEventListener("click", () => {
    const all = [...(list?.querySelectorAll("span") || [])].map((s) => s.textContent).join("\n");
    if (all) copyText(all).then(() => toast("All copied", "ok"));
  });

  if (lengthVal) lengthVal.textContent = lengthEl.value;
  generate();
}
