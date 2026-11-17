// List Randomizer — Fisher–Yates shuffle with crypto-backed randomness.
import { copyText, toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const input = $<HTMLTextAreaElement>("lr-input");
const blanks = $<HTMLInputElement>("lr-blanks");
const dedupe = $<HTMLInputElement>("lr-dedupe");
const pick = $<HTMLInputElement>("lr-pick");
const runBtn = $("lr-run");
const output = $("lr-output");
const countEl = $("lr-count");
const copyBtn = $("lr-copy");

if (input && runBtn && output) {
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

  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let last: string[] = [];

  function run() {
    let items = input!.value.split("\n");
    if (blanks?.checked) items = items.map((s) => s.trim()).filter((s) => s.length > 0);
    if (dedupe?.checked) items = [...new Set(items)];

    if (items.length === 0) {
      toast("Add some list items first", "err");
      return;
    }

    let result = shuffle(items);
    const n = parseInt(pick?.value || "0") || 0;
    if (n > 0) result = result.slice(0, n);

    last = result;
    output!.innerHTML = "";
    for (const item of result) {
      const li = document.createElement("li");
      li.textContent = item;
      output!.appendChild(li);
    }
    if (countEl) countEl.textContent = `${result.length} item${result.length === 1 ? "" : "s"}`;
  }

  runBtn.addEventListener("click", run);
  copyBtn?.addEventListener("click", () => {
    if (!last.length) {
      toast("Nothing to copy yet", "err");
      return;
    }
    copyText(last.join("\n")).then(() => toast("Copied", "ok"));
  });
}
