// Regex Tester — live matching with highlighting, group inspection and a
// replacement preview. Everything runs against the browser's own RegExp engine,
// so what you see here is exactly what your JavaScript will do.
import { escapeHtml } from "../lib/code";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

// A runaway pattern (catastrophic backtracking) can't be interrupted once RegExp
// starts, but we can at least stop an unbounded match *loop* from freezing the tab.
const MAX_MATCHES = 5000;

const SAMPLE = `Contact us at hello@doctech.dev or support@futuretechautomation.in.
Backup addresses: ada@example.org, grace+tags@example.co.uk
Not an email: just.text@ nor @nope.com
Phone: +91 98765 43210 · Order #A-1029 placed 2026-07-20.`;

const pattern = $<HTMLInputElement>("re-pattern");
const test = $<HTMLTextAreaElement>("re-test");
const replaceIn = $<HTMLInputElement>("re-replace");

if (pattern && test && replaceIn) {
  const flagBoxes = [...document.querySelectorAll<HTMLInputElement>(".re-flag")];
  const flagView = $("re-flagview");
  const errEl = $("re-error");
  const countEl = $("re-count");
  const hlEl = $("re-highlight");
  const matchesEl = $("re-matches");
  const replacedEl = $("re-replaced");

  const flags = () => flagBoxes.filter((b) => b.checked).map((b) => b.dataset.flag).join("");

  function run() {
    const flagStr = flags();
    if (flagView) flagView.textContent = flagStr || "—";

    const src = test!.value;
    const pat = pattern!.value;

    if (!pat) {
      errEl?.classList.add("hidden");
      if (hlEl) hlEl.innerHTML = escapeHtml(src);
      if (countEl) countEl.textContent = "0 matches";
      if (matchesEl) matchesEl.innerHTML = `<p class="text-sm text-slate-500 dark:text-slate-400">Enter a pattern to see matches.</p>`;
      if (replacedEl) replacedEl.textContent = "";
      return;
    }

    let re: RegExp;
    try {
      re = new RegExp(pat, flagStr);
    } catch (e) {
      if (errEl) {
        errEl.textContent = e instanceof Error ? e.message : "Invalid regular expression";
        errEl.classList.remove("hidden");
      }
      return;
    }
    errEl?.classList.add("hidden");

    // Collect matches. With /g we must advance lastIndex manually on zero-length
    // matches, or `while (exec())` never terminates on a pattern like /a*/g.
    const found: RegExpExecArray[] = [];
    if (re.global || re.sticky) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src)) !== null) {
        found.push(m);
        if (m[0] === "") re.lastIndex++;
        if (found.length >= MAX_MATCHES) break;
      }
    } else {
      const m = re.exec(src);
      if (m) found.push(m);
    }

    if (countEl) {
      const n = found.length;
      countEl.textContent = `${n === MAX_MATCHES ? `${n}+` : n} match${n === 1 ? "" : "es"}`;
    }

    // Highlight: walk the source once, wrapping each match span.
    if (hlEl) {
      if (!found.length) {
        hlEl.innerHTML = src ? escapeHtml(src) : `<span class="text-slate-400">Nothing to search yet.</span>`;
      } else {
        let out = "";
        let cursor = 0;
        found.forEach((m, i) => {
          const start = m.index;
          const end = start + m[0].length;
          if (start < cursor) return; // overlapping (sticky edge case) — skip
          out += escapeHtml(src.slice(cursor, start));
          const tone = i % 2 === 0 ? "bg-orange-400/40" : "bg-orange-400/25";
          out += m[0].length
            ? `<mark class="${tone} rounded-sm text-inherit">${escapeHtml(m[0])}</mark>`
            : `<span class="border-l-2 border-orange-500"></span>`;
          cursor = end;
        });
        out += escapeHtml(src.slice(cursor));
        hlEl.innerHTML = out;
      }
    }

    // Match list with numbered + named groups.
    if (matchesEl) {
      if (!found.length) {
        matchesEl.innerHTML = `<p class="text-sm text-slate-500 dark:text-slate-400">No matches.</p>`;
      } else {
        matchesEl.innerHTML = found
          .slice(0, 200)
          .map((m, i) => {
            const groups = m
              .slice(1)
              .map((g, gi) => `<div class="flex gap-2"><code class="shrink-0 font-mono text-[11px] font-bold text-slate-400">$${gi + 1}</code><span class="font-mono text-[11px] break-all text-slate-600 dark:text-slate-300">${g === undefined ? '<em class="text-slate-400">undefined</em>' : escapeHtml(g)}</span></div>`)
              .join("");
            const named = m.groups
              ? Object.entries(m.groups)
                  .map(([k, v]) => `<div class="flex gap-2"><code class="shrink-0 font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400">${escapeHtml(k)}</code><span class="font-mono text-[11px] break-all text-slate-600 dark:text-slate-300">${v === undefined ? '<em class="text-slate-400">undefined</em>' : escapeHtml(v)}</span></div>`)
                  .join("")
              : "";
            return `<div class="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
                <div class="flex items-baseline gap-2">
                  <span class="shrink-0 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">${i + 1}</span>
                  <code class="font-mono text-xs break-all text-slate-800 dark:text-slate-100">${escapeHtml(m[0]) || '<em class="text-slate-400">(empty match)</em>'}</code>
                  <span class="ml-auto shrink-0 font-mono text-[10px] text-slate-400">index ${m.index}</span>
                </div>
                ${groups || named ? `<div class="mt-1.5 space-y-0.5 border-l-2 border-slate-200 pl-2 dark:border-slate-700">${groups}${named}</div>` : ""}
              </div>`;
          })
          .join("");
      }
    }

    // Replacement preview — recreate the regex so our exec() lastIndex doesn't leak in.
    if (replacedEl) {
      if (!replaceIn!.value) {
        replacedEl.innerHTML = `<span class="text-slate-400">Type a replacement above to preview the result.</span>`;
      } else {
        try {
          replacedEl.textContent = src.replace(new RegExp(pat, flagStr), replaceIn!.value);
        } catch {
          replacedEl.innerHTML = `<span class="text-red-500">Invalid replacement pattern.</span>`;
        }
      }
    }
  }

  pattern.addEventListener("input", run);
  test.addEventListener("input", run);
  replaceIn.addEventListener("input", run);
  flagBoxes.forEach((b) => b.addEventListener("change", run));

  $("re-sample")?.addEventListener("click", () => {
    test!.value = SAMPLE;
    if (!pattern!.value) pattern!.value = "[\\w.+-]+@[\\w-]+\\.[\\w.]{2,}";
    run();
  });

  run();
}
