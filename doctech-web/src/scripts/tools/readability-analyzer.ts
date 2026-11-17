// Readability & Keyword Density — Flesch scoring + keyword frequency from lib/text.ts.
import { keywordDensity, readability } from "../lib/text";
import { copyFlash } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const input = $<HTMLTextAreaElement>("ra-in");
const kwEl = $("ra-keywords");

if (input && kwEl) {
  const SAMPLE =
    "Good writing is clear writing. When you keep your sentences short and your words simple, readers understand you faster. " +
    "Long, complicated sentences with many subordinate clauses and elaborate vocabulary can obscure your meaning and exhaust your audience. " +
    "Aim for clarity. Test your text, revise it, and read it aloud.";

  const put = (id: string, v: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  const fmtTime = (sec: number) => (sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`);

  function easeBand(score: number): { note: string; color: string } {
    if (score >= 90) return { note: "Very easy (5th grade)", color: "#10b981" };
    if (score >= 70) return { note: "Easy (6–7th grade)", color: "#22c55e" };
    if (score >= 60) return { note: "Plain English (8–9th grade)", color: "#84cc16" };
    if (score >= 50) return { note: "Fairly hard (10–12th grade)", color: "#f59e0b" };
    if (score >= 30) return { note: "Hard (college)", color: "#f97316" };
    return { note: "Very hard (graduate)", color: "#ef4444" };
  }

  function run() {
    const text = input!.value;
    const r = readability(text);
    const easeEl = $("ra-ease")!;

    if (!r.words) {
      easeEl.textContent = "—";
      easeEl.style.color = "";
      put("ra-ease-note", "");
      ["ra-grade", "ra-read", "ra-speak", "ra-words", "ra-sentences", "ra-complex"].forEach((id) => put(id, "—"));
      kwEl!.innerHTML = `<p class="text-sm text-slate-400">Start typing to see keywords.</p>`;
      return;
    }

    const band = easeBand(r.fleschEase);
    easeEl.textContent = String(r.fleschEase);
    easeEl.style.color = band.color;
    put("ra-ease-note", band.note);
    put("ra-grade", String(r.grade));
    put("ra-read", fmtTime(r.readingSec));
    put("ra-speak", fmtTime(r.speakingSec));
    put("ra-words", r.words.toLocaleString());
    put("ra-sentences", String(r.sentences));
    put("ra-complex", `${r.complexWordPct}%`);

    const kws = keywordDensity(text, 10);
    const max = kws.length ? kws[0].count : 1;
    kwEl!.innerHTML = kws.length
      ? kws
          .map(
            (k) => `
        <button type="button" data-copy="${k.word}" class="group flex w-full items-center gap-3 rounded-lg px-2 py-1 text-left transition-colors hover:bg-orange-50 dark:hover:bg-orange-500/10">
          <span class="w-24 shrink-0 truncate font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">${k.word}</span>
          <span class="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <span class="absolute inset-y-0 left-0 rounded-full bg-orange-500" style="width:${Math.max(6, (k.count / max) * 100)}%"></span>
          </span>
          <span class="w-16 shrink-0 text-right font-mono text-xs text-slate-400">${k.count} · ${k.pct}%</span>
        </button>`,
          )
          .join("")
      : `<p class="text-sm text-slate-400">No significant keywords yet.</p>`;
  }

  kwEl.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button[data-copy]") as HTMLElement | null;
    if (btn?.dataset.copy) copyFlash(btn, btn.dataset.copy);
  });

  input.addEventListener("input", run);
  input.value = SAMPLE;
  run();
}
