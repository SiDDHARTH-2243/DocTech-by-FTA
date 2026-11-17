// Extract from Text — pull structured bits out of prose via lib/text.ts.
import { escapeHtml } from "../lib/code";
import { extractFrom, type ExtractKind } from "../lib/text";
import { copyFlash } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const input = $<HTMLTextAreaElement>("ex-in");
const resultsEl = $("ex-results");

if (input && resultsEl) {
  const dedupeEl = $<HTMLInputElement>("ex-dedupe")!;
  const kindEls = [...document.querySelectorAll<HTMLInputElement>(".ex-kind")];
  const LABELS: Record<ExtractKind, string> = {
    emails: "Emails", urls: "URLs", phones: "Phones", hashtags: "Hashtags",
    mentions: "@Mentions", numbers: "Numbers", ips: "IP addresses",
  };

  const SAMPLE =
    "Contact ada@dev.io or grace@navy.mil — call +1 (555) 010-2020 or 555.867.5309.\n" +
    "Docs at https://doctech.dev/guide and http://example.com. Server 192.168.0.1, backup 10.0.0.42.\n" +
    "Follow @doctech #tools #privacy — order 42 costs 19.99, qty 3.";

  function run() {
    const text = input!.value;
    const dedupe = dedupeEl.checked;
    const active = kindEls.filter((k) => k.checked).map((k) => k.dataset.kind as ExtractKind);

    if (!active.length) {
      resultsEl!.innerHTML = `<p class="text-sm text-slate-400">Tick at least one thing to extract.</p>`;
      return;
    }

    resultsEl!.innerHTML = active
      .map((kind) => {
        const items = extractFrom(text, kind, dedupe);
        return `
        <div class="tool-panel !py-3">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-200">${LABELS[kind]}</span>
            <div class="flex items-center gap-2">
              <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">${items.length}</span>
              ${items.length ? `<button type="button" data-copy="${escapeHtml(items.join("\n")).replace(/"/g, "&quot;")}" class="rounded-lg bg-orange-500 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-orange-600">Copy</button>` : ""}
            </div>
          </div>
          ${
            items.length
              ? `<div class="max-h-40 overflow-auto rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs leading-6 text-slate-700 dark:bg-slate-800/50 dark:text-slate-200">${items.map((i) => escapeHtml(i)).join("<br>")}</div>`
              : `<p class="text-xs text-slate-400">None found.</p>`
          }
        </div>`;
      })
      .join("");
  }

  resultsEl.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button[data-copy]") as HTMLElement | null;
    if (btn?.dataset.copy) copyFlash(btn, btn.dataset.copy);
  });

  input.addEventListener("input", run);
  dedupeEl.addEventListener("change", run);
  kindEls.forEach((k) => k.addEventListener("change", run));

  input.value = SAMPLE;
  run();
}
