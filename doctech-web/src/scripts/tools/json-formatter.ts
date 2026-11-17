// JSON Formatter & Validator — live validation with located errors, beautify /
// minify, optional key sorting, a collapsible tree view and shape stats.
import { escapeHtml, jsonFormat, jsonMinify, jsonStats, parseJson } from "../lib/code";
import { initPane } from "../lib/codepane";
import { toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const SAMPLE = `{
  "name": "DocTech",
  "by": "FutureTech Automation",
  "private": true,
  "tools": 86,
  "categories": ["pdf", "image", "coding"],
  "meta": { "clientSide": true, "uploads": null }
}`;

const inPane = initPane("jf-in", { sample: SAMPLE, debounce: 180 });
const outPane = initPane("jf-out", { downloadName: "formatted.json", downloadMime: "application/json" });
const indentSel = $<HTMLSelectElement>("jf-indent");
const sortBox = $<HTMLInputElement>("jf-sort");
const treeBtn = $<HTMLButtonElement>("jf-tree");
const treeWrap = $("jf-treewrap");
const treeRoot = $("jf-treeroot");
const outPre = $("jf-out-pre");

if (inPane && outPane && indentSel && sortBox) {
  let minified = false;
  let treeOn = false;

  const indent = (): number | "\t" => (indentSel.value === "tab" ? "\t" : Number(indentSel.value));

  function setStats(v: unknown | null) {
    const s = v === null ? null : jsonStats(v);
    const put = (id: string, n: number | null) => {
      const el = document.getElementById(id);
      if (el) el.textContent = n === null ? "—" : n.toLocaleString();
    };
    put("jf-s-nodes", s?.nodes ?? null);
    put("jf-s-objects", s?.objects ?? null);
    put("jf-s-arrays", s?.arrays ?? null);
    put("jf-s-keys", s?.keys ?? null);
    put("jf-s-depth", s?.depth ?? null);
  }

  /** Render a collapsible tree. Each expandable node is a <details>. */
  function treeHtml(value: unknown, keyLabel: string | null): string {
    const key = keyLabel === null ? "" : `<span class="text-sky-700 dark:text-sky-300">${escapeHtml(keyLabel)}</span><span class="text-slate-400">: </span>`;

    if (Array.isArray(value) || (value && typeof value === "object")) {
      const isArr = Array.isArray(value);
      const entries: [string, unknown][] = isArr
        ? (value as unknown[]).map((v, i) => [String(i), v])
        : Object.entries(value as Record<string, unknown>);
      const brace = isArr ? ["[", "]"] : ["{", "}"];
      const summary = `<summary class="cursor-pointer list-none marker:content-none"><span class="select-none text-slate-400">▸ </span>${key}<span class="text-slate-500">${brace[0]}</span><span class="text-slate-400"> ${entries.length} ${entries.length === 1 ? "item" : "items"} </span><span class="text-slate-500">${brace[1]}</span></summary>`;
      const kids = entries.map(([k, v]) => `<div class="border-l border-slate-200 pl-3 dark:border-slate-700">${treeHtml(v, isArr ? `[${k}]` : k)}</div>`).join("");
      return `<details open class="[&[open]>summary_span:first-child]:rotate-90 [&>summary_span:first-child]:inline-block [&>summary_span:first-child]:transition-transform">${summary}${kids}</details>`;
    }

    let lit: string;
    if (typeof value === "string") lit = `<span class="text-emerald-700 dark:text-emerald-300">"${escapeHtml(value)}"</span>`;
    else if (typeof value === "number") lit = `<span class="text-violet-700 dark:text-violet-300">${value}</span>`;
    else if (typeof value === "boolean") lit = `<span class="text-orange-700 dark:text-orange-300">${value}</span>`;
    else lit = `<span class="text-slate-400 italic">null</span>`;
    return `<div>${key}${lit}</div>`;
  }

  function run() {
    const src = inPane!.get();

    if (!src.trim()) {
      inPane!.clearStatus();
      outPane!.set("", "json");
      outPane!.clearStatus();
      setStats(null);
      if (treeRoot) treeRoot.innerHTML = "";
      return;
    }

    const res = parseJson(src);
    if (!res.ok) {
      const { message, line, col } = res.error;
      inPane!.setStatus(`Line ${line}, col ${col} — ${message}`, "err");
      outPane!.set("", "json");
      outPane!.setStatus("Fix the error to see output", "warn");
      setStats(null);
      if (treeRoot) treeRoot.innerHTML = "";
      return;
    }

    inPane!.setStatus("Valid JSON", "ok");
    outPane!.clearStatus();
    const text = minified
      ? jsonMinify(sortBox!.checked ? JSON.parse(jsonFormat(res.value, 0, true)) : res.value)
      : jsonFormat(res.value, indent(), sortBox!.checked);
    outPane!.set(text, "json");
    outPane!.setDownloadName(minified ? "minified.json" : "formatted.json");
    setStats(res.value);
    if (treeRoot && treeOn) treeRoot.innerHTML = treeHtml(res.value, null);
  }

  inPane.onInput(run);
  indentSel.addEventListener("change", () => { minified = false; run(); });
  sortBox.addEventListener("change", run);

  $("jf-format")?.addEventListener("click", () => { minified = false; run(); });
  $("jf-minify")?.addEventListener("click", () => { minified = true; run(); });

  treeBtn?.addEventListener("click", () => {
    treeOn = !treeOn;
    treeBtn.setAttribute("aria-pressed", String(treeOn));
    treeBtn.classList.toggle("!bg-orange-500", treeOn);
    treeBtn.classList.toggle("!text-white", treeOn);
    treeBtn.classList.toggle("!border-orange-500", treeOn);
    treeWrap?.classList.toggle("hidden", !treeOn);
    outPre?.classList.toggle("hidden", treeOn);
    if (treeOn) run();
  });

  inPane.onUpload(async (file) => {
    try {
      inPane!.set(await file.text());
      run();
      toast(`Loaded ${file.name}`, "ok");
    } catch {
      toast("Could not read that file", "err");
    }
  });

  run();
}
