// Variable Name Case Converter — renders every case style live; click to copy.
import { CASE_STYLES, toCase } from "../lib/convert";
import { copyText } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const input = $<HTMLTextAreaElement>("case-in");
const out = $("case-out");

if (input && out) {
  // Build the rows once; only their values change on input.
  out.innerHTML = CASE_STYLES.map(
    (c) => `
    <button type="button" data-style="${c.style}" class="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-orange-400 hover:bg-orange-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-orange-500/10">
      <span class="min-w-0">
        <span class="block text-[11px] font-bold uppercase tracking-wide text-slate-400">${c.label}</span>
        <code data-out="${c.style}" class="block truncate font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">—</code>
      </span>
      <span class="shrink-0 text-xs font-semibold text-orange-500 opacity-0 transition-opacity group-hover:opacity-100">Copy</span>
    </button>`,
  ).join("");

  function run() {
    const src = input!.value;
    for (const c of CASE_STYLES) {
      const el = out!.querySelector<HTMLElement>(`[data-out="${c.style}"]`);
      if (el) el.textContent = src.trim() ? toCase(src, c.style) || "—" : "—";
    }
  }

  out.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button[data-style]") as HTMLElement | null;
    if (!btn) return;
    const val = out!.querySelector(`[data-out="${btn.dataset.style}"]`)?.textContent ?? "";
    if (val && val !== "—") copyText(val);
  });

  input.addEventListener("input", run);
  input.value = "user profile image URL";
  run();
}
