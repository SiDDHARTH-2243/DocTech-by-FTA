// Cron Expression Parser — describe + next-runs, all from lib/convert.ts.
import { describeCron, nextRuns } from "../lib/convert";
import { relativeTime } from "../lib/code";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const input = $<HTMLInputElement>("cron-in");

if (input) {
  const errEl = $("cron-error");
  const resultEl = $("cron-result");
  const descEl = $("cron-desc");
  const nextEl = $<HTMLOListElement>("cron-next");
  const tzEl = $("cron-tz");

  if (tzEl) tzEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function run() {
    const expr = input!.value.trim();
    if (!expr) {
      errEl?.classList.add("hidden");
      resultEl?.classList.add("hidden");
      return;
    }
    try {
      const desc = describeCron(expr);
      const runs = nextRuns(expr, new Date(), 6);
      errEl?.classList.add("hidden");
      resultEl?.classList.remove("hidden");
      if (descEl) descEl.textContent = desc;

      if (nextEl) {
        nextEl.innerHTML = runs.length
          ? runs
              .map((d, i) => {
                const abs = d.toLocaleString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
                return `<li class="flex items-baseline justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
                    <span class="flex items-baseline gap-2">
                      <span class="w-5 shrink-0 text-center text-[11px] font-bold text-orange-500">${i + 1}</span>
                      <span class="font-mono text-sm text-slate-700 dark:text-slate-200">${abs}</span>
                    </span>
                    <span class="shrink-0 text-xs text-slate-400">${relativeTime(d)}</span>
                  </li>`;
              })
              .join("")
          : `<li class="text-sm text-slate-400">No upcoming runs found in a reasonable window.</li>`;
      }
    } catch (e) {
      resultEl?.classList.add("hidden");
      if (errEl) {
        errEl.textContent = e instanceof Error ? e.message : "Invalid cron expression.";
        errEl.classList.remove("hidden");
      }
    }
  }

  input.addEventListener("input", run);
  document.querySelectorAll<HTMLButtonElement>(".cron-preset").forEach((b) => {
    b.addEventListener("click", () => {
      input.value = b.dataset.cron!;
      run();
    });
  });

  input.value = "*/5 9-17 * * 1-5";
  run();
}
