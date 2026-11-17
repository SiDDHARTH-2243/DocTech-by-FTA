// CSV ⇄ JSON — all logic from the pure helpers in lib/convert.ts.
import { csvToJson, detectDelimiter, jsonToCsv, type Delimiter } from "../lib/convert";
import { parseJson } from "../lib/code";
import { initPane } from "../lib/codepane";
import { toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const SAMPLE_CSV = `name,role,age,active\n"Lovelace, Ada",Engineer,36,true\nGrace Hopper,Admiral,85,true\nAlan Turing,Researcher,41,false`;

const inPane = initPane("cj-in", { debounce: 250 });
const outPane = initPane("cj-out", {});
const modeBtns = [...document.querySelectorAll<HTMLButtonElement>(".cj-mode")];

if (inPane && outPane && modeBtns.length) {
  const delimSel = $<HTMLSelectElement>("cj-delim");
  const headerEl = $<HTMLInputElement>("cj-header");
  const typedEl = $<HTMLInputElement>("cj-typed");
  const typedWrap = $("cj-typed-wrap");
  let mode: "c2j" | "j2c" = "c2j";

  const delimiter = (text: string): Delimiter =>
    delimSel!.value === "auto" ? detectDelimiter(text) : (delimSel!.value === "\\t" ? "\t" : delimSel!.value) as Delimiter;

  function paintTabs() {
    for (const b of modeBtns) {
      const active = b.dataset.mode === mode;
      b.setAttribute("aria-pressed", String(active));
      b.classList.toggle("bg-orange-500", active);
      b.classList.toggle("text-white", active);
      b.classList.toggle("text-slate-500", !active);
      b.classList.toggle("dark:text-slate-400", !active);
    }
    const setLabel = (paneId: string, text: string) => {
      const el = document.querySelector<HTMLLabelElement>(`[data-pane="${paneId}"] label`);
      if (el) el.textContent = text;
    };
    setLabel("cj-in", mode === "c2j" ? "CSV" : "JSON");
    setLabel("cj-out", mode === "c2j" ? "JSON" : "CSV");
    outPane!.setDownloadName(mode === "c2j" ? "data.json" : "data.csv");
    // "Infer types" only applies when reading CSV.
    typedWrap?.classList.toggle("opacity-40", mode !== "c2j");
  }

  function run() {
    const src = inPane!.get();
    const outLang = mode === "c2j" ? "json" : "plaintext";
    if (!src.trim()) {
      outPane!.set("", outLang);
      inPane!.clearStatus();
      return;
    }
    try {
      if (mode === "c2j") {
        const data = csvToJson(src, { delimiter: delimiter(src), header: headerEl!.checked, typed: typedEl!.checked });
        outPane!.set(JSON.stringify(data, null, 2), "json");
        inPane!.setStatus(`${data.length} row${data.length === 1 ? "" : "s"}`, "ok");
      } else {
        const res = parseJson(src);
        if (!res.ok) {
          inPane!.setStatus(`Line ${res.error.line}, col ${res.error.col} — ${res.error.message}`, "err");
          outPane!.set("", "plaintext");
          return;
        }
        const d = delimSel!.value === "auto" ? "," : ((delimSel!.value === "\\t" ? "\t" : delimSel!.value) as Delimiter);
        outPane!.set(jsonToCsv(res.value, d), "plaintext");
        inPane!.setStatus("Converted", "ok");
      }
      outPane!.clearStatus();
    } catch (e) {
      inPane!.setStatus((e instanceof Error ? e.message : String(e)).split("\n")[0], "err");
      outPane!.set("", outLang);
    }
  }

  for (const b of modeBtns) {
    b.addEventListener("click", () => {
      mode = b.dataset.mode as "c2j" | "j2c";
      paintTabs();
      run();
    });
  }

  $("cj-swap")?.addEventListener("click", () => {
    const out = outPane!.get();
    mode = mode === "c2j" ? "j2c" : "c2j";
    paintTabs();
    if (out) inPane!.set(out);
    run();
  });

  [delimSel, headerEl, typedEl].forEach((el) => el?.addEventListener("change", run));
  inPane.onInput(run);

  inPane.onUpload(async (file) => {
    try {
      inPane!.set(await file.text());
      const ext = file.name.split(".").pop()?.toLowerCase();
      if ((ext === "csv" || ext === "tsv") && mode === "j2c") { mode = "c2j"; paintTabs(); }
      if (ext === "json" && mode === "c2j") { mode = "j2c"; paintTabs(); }
      run();
      toast(`Loaded ${file.name}`, "ok");
    } catch {
      toast("Could not read that file", "err");
    }
  });

  paintTabs();
  inPane.set(SAMPLE_CSV);
  run();
}
