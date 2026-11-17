// Text & Code Diff Checker — LCS line diff with optional word-level highlighting
// inside changed line pairs, rendered side-by-side or unified.
import { diffLines, diffWords, escapeHtml, type DiffRow } from "../lib/code";
import { initPane } from "../lib/codepane";
import { toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const SAMPLE_A = `function greet(name) {
  const greeting = "Hello, " + name;
  console.log(greeting);
  return greeting;
}`;
const SAMPLE_B = `function greet(name, punctuation = "!") {
  const greeting = \`Hello, \${name}\${punctuation}\`;
  console.log(greeting);
  return greeting.trim();
}`;

const paneA = initPane("df-a", { sample: SAMPLE_A, debounce: 200 });
const paneB = initPane("df-b", { sample: SAMPLE_B, debounce: 200 });

if (paneA && paneB) {
  const out = $("df-out");
  const caseBox = $<HTMLInputElement>("df-case");
  const wsBox = $<HTMLInputElement>("df-ws");
  const wordBox = $<HTMLInputElement>("df-words");
  const viewBtns = [...document.querySelectorAll<HTMLButtonElement>(".df-view")];
  let view: "split" | "unified" = "split";

  const NUM = "w-12 shrink-0 select-none px-2 text-right text-slate-400";

  function paintTabs() {
    for (const b of viewBtns) {
      const active = b.dataset.view === view;
      b.setAttribute("aria-pressed", String(active));
      b.classList.toggle("bg-orange-500", active);
      b.classList.toggle("text-white", active);
      b.classList.toggle("text-slate-500", !active);
      b.classList.toggle("dark:text-slate-400", !active);
    }
  }

  /** Render one line's text, optionally with word-level marks against its counterpart. */
  function lineHtml(text: string, counterpart: string | null, op: "add" | "del"): string {
    if (!wordBox?.checked || counterpart === null) return escapeHtml(text) || "&nbsp;";
    const parts = op === "del" ? diffWords(text, counterpart) : diffWords(counterpart, text);
    const want = op === "del" ? "del" : "add";
    return (
      parts
        .filter((p) => p.op === "same" || p.op === want)
        .map((p) =>
          p.op === "same"
            ? escapeHtml(p.text)
            : `<mark class="${op === "del" ? "bg-red-400/40" : "bg-emerald-400/40"} rounded-sm text-inherit">${escapeHtml(p.text)}</mark>`,
        )
        .join("") || "&nbsp;"
    );
  }

  /**
   * Consecutive del rows followed by add rows are a "modified block" — pair them
   * up so side-by-side view lines them up and word highlighting has a counterpart.
   */
  function pairRows(rows: DiffRow[]): { left: DiffRow | null; right: DiffRow | null }[] {
    const outRows: { left: DiffRow | null; right: DiffRow | null }[] = [];
    let i = 0;
    while (i < rows.length) {
      const r = rows[i];
      if (r.op === "same") {
        outRows.push({ left: r, right: r });
        i++;
        continue;
      }
      const dels: DiffRow[] = [];
      const adds: DiffRow[] = [];
      while (i < rows.length && rows[i].op === "del") dels.push(rows[i++]);
      while (i < rows.length && rows[i].op === "add") adds.push(rows[i++]);
      const n = Math.max(dels.length, adds.length);
      for (let k = 0; k < n; k++) outRows.push({ left: dels[k] ?? null, right: adds[k] ?? null });
    }
    return outRows;
  }

  function run() {
    const a = paneA!.get();
    const b = paneB!.get();

    if (!a && !b) {
      if (out) {
        out.innerHTML = `<p class="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">Paste text into both panes to see the differences.</p>`;
      }
      setStats(0, 0, 0);
      return;
    }

    const rows = diffLines(a, b, !!caseBox?.checked, !!wsBox?.checked);
    const added = rows.filter((r) => r.op === "add").length;
    const removed = rows.filter((r) => r.op === "del").length;
    setStats(added, removed, rows.length - added - removed);

    if (!out) return;

    if (added === 0 && removed === 0) {
      out.innerHTML = `<p class="px-5 py-8 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">The two texts are identical${caseBox?.checked || wsBox?.checked ? " under the current options" : ""}.</p>`;
      return;
    }

    if (view === "unified") {
      out.innerHTML = rows
        .map((r) => {
          const tone =
            r.op === "add"
              ? "bg-emerald-50 dark:bg-emerald-500/10"
              : r.op === "del"
                ? "bg-red-50 dark:bg-red-500/10"
                : "";
          const sign = r.op === "add" ? "+" : r.op === "del" ? "−" : " ";
          const signTone =
            r.op === "add" ? "text-emerald-600" : r.op === "del" ? "text-red-600" : "text-slate-300";
          return `<div class="flex ${tone}">
              <span class="${NUM}">${r.left ?? ""}</span>
              <span class="${NUM}">${r.right ?? ""}</span>
              <span class="w-5 shrink-0 select-none text-center font-bold ${signTone}">${sign}</span>
              <span class="min-w-0 flex-1 whitespace-pre-wrap break-words px-2 text-slate-700 dark:text-slate-200">${escapeHtml(r.text) || "&nbsp;"}</span>
            </div>`;
        })
        .join("");
      return;
    }

    out.innerHTML = pairRows(rows)
      .map(({ left, right }) => {
        const lTone = left && left.op === "del" ? "bg-red-50 dark:bg-red-500/10" : left ? "" : "bg-slate-50 dark:bg-slate-800/40";
        const rTone = right && right.op === "add" ? "bg-emerald-50 dark:bg-emerald-500/10" : right ? "" : "bg-slate-50 dark:bg-slate-800/40";
        const lText = left
          ? left.op === "del"
            ? lineHtml(left.text, right?.op === "add" ? right.text : null, "del")
            : escapeHtml(left.text) || "&nbsp;"
          : "";
        const rText = right
          ? right.op === "add"
            ? lineHtml(right.text, left?.op === "del" ? left.text : null, "add")
            : escapeHtml(right.text) || "&nbsp;"
          : "";
        return `<div class="flex">
            <div class="flex min-w-0 flex-1 ${lTone}">
              <span class="${NUM}">${left?.left ?? ""}</span>
              <span class="min-w-0 flex-1 whitespace-pre-wrap break-words px-2 text-slate-700 dark:text-slate-200">${lText}</span>
            </div>
            <div class="w-px shrink-0 bg-slate-200 dark:bg-slate-700"></div>
            <div class="flex min-w-0 flex-1 ${rTone}">
              <span class="${NUM}">${right?.right ?? ""}</span>
              <span class="min-w-0 flex-1 whitespace-pre-wrap break-words px-2 text-slate-700 dark:text-slate-200">${rText}</span>
            </div>
          </div>`;
      })
      .join("");
  }

  function setStats(add: number, del: number, same: number) {
    const a = $("df-stat-add");
    const d = $("df-stat-del");
    const s = $("df-stat-same");
    if (a) a.textContent = `+${add}`;
    if (d) d.textContent = `−${del}`;
    if (s) s.textContent = `${same} unchanged`;
  }

  paneA.onInput(run);
  paneB.onInput(run);
  [caseBox, wsBox, wordBox].forEach((el) => el?.addEventListener("change", run));

  for (const b of viewBtns) {
    b.addEventListener("click", () => {
      view = b.dataset.view as "split" | "unified";
      paintTabs();
      run();
    });
  }

  $("df-swap")?.addEventListener("click", () => {
    const a = paneA!.get();
    paneA!.set(paneB!.get());
    paneB!.set(a);
    run();
  });

  const wireUpload = (pane: typeof paneA) =>
    pane?.onUpload(async (file) => {
      try {
        pane.set(await file.text());
        run();
        toast(`Loaded ${file.name}`, "ok");
      } catch {
        toast("Could not read that file", "err");
      }
    });
  wireUpload(paneA);
  wireUpload(paneB);

  paintTabs();
  run();
}
