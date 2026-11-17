// YAML ⇄ JSON — js-yaml (loaded on demand) in one direction, JSON.parse in the
// other. Errors from either side are surfaced on the input pane with their line.
import { initPane } from "../lib/codepane";
import { parseJson } from "../lib/code";
import { toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const SAMPLE_YAML = `# app config\nname: doctech\nversion: 2\nfeatures:\n  - pdf\n  - image\n  - code\nserver:\n  host: localhost\n  port: 3000\n  tls: false\ntags: { a: 1, b: 2 }`;

const inPane = initPane("yj-in", { debounce: 250 });
const outPane = initPane("yj-out", {});
const modeBtns = [...document.querySelectorAll<HTMLButtonElement>(".yj-mode")];

if (inPane && outPane && modeBtns.length) {
  const indentSel = $<HTMLSelectElement>("yj-indent");
  let mode: "y2j" | "j2y" = "y2j";

  function paintTabs() {
    for (const b of modeBtns) {
      const active = b.dataset.mode === mode;
      b.setAttribute("aria-pressed", String(active));
      b.classList.toggle("bg-orange-500", active);
      b.classList.toggle("text-white", active);
      b.classList.toggle("text-slate-500", !active);
      b.classList.toggle("dark:text-slate-400", !active);
    }
    // Relabel + re-highlight the panes for the active direction.
    const setLabel = (paneId: string, text: string) => {
      const el = document.querySelector<HTMLLabelElement>(`[data-pane="${paneId}"] label`);
      if (el) el.textContent = text;
    };
    setLabel("yj-in", mode === "y2j" ? "YAML" : "JSON");
    setLabel("yj-out", mode === "y2j" ? "JSON" : "YAML");
    outPane!.setDownloadName(mode === "y2j" ? "data.json" : "data.yaml");
  }

  async function run() {
    const src = inPane!.get();
    const outLang = mode === "y2j" ? "json" : "yaml";
    if (!src.trim()) {
      outPane!.set("", outLang);
      inPane!.clearStatus();
      return;
    }
    const indent = Number(indentSel!.value);
    try {
      const yaml = await import("js-yaml");
      if (mode === "y2j") {
        const data = yaml.load(src);
        outPane!.set(JSON.stringify(data, null, indent), "json");
      } else {
        // Validate as JSON first so we can point at the exact error.
        const res = parseJson(src);
        if (!res.ok) {
          inPane!.setStatus(`Line ${res.error.line}, col ${res.error.col} — ${res.error.message}`, "err");
          outPane!.set("", "yaml");
          return;
        }
        outPane!.set(yaml.dump(res.value, { indent, lineWidth: 120, noRefs: true }).replace(/\n$/, ""), "yaml");
      }
      inPane!.setStatus("Valid", "ok");
      outPane!.clearStatus();
    } catch (e) {
      // js-yaml errors include a `mark` with the line/column.
      const err = e as { message?: string; mark?: { line: number; column: number } };
      const where = err.mark ? `Line ${err.mark.line + 1}, col ${err.mark.column + 1} — ` : "";
      inPane!.setStatus(where + (err.message ?? "Parse error").split("\n")[0], "err");
      outPane!.set("", outLang);
    }
  }

  for (const b of modeBtns) {
    b.addEventListener("click", () => {
      mode = b.dataset.mode as "y2j" | "j2y";
      paintTabs();
      run();
    });
  }

  $("yj-swap")?.addEventListener("click", () => {
    // Send the current output back as input in the opposite direction.
    const out = outPane!.get();
    mode = mode === "y2j" ? "j2y" : "y2j";
    paintTabs();
    if (out) inPane!.set(out);
    run();
  });

  indentSel?.addEventListener("change", run);
  inPane.onInput(run);

  inPane.onUpload(async (file) => {
    try {
      inPane!.set(await file.text());
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "json" && mode === "y2j") { mode = "j2y"; paintTabs(); }
      if ((ext === "yaml" || ext === "yml") && mode === "j2y") { mode = "y2j"; paintTabs(); }
      run();
      toast(`Loaded ${file.name}`, "ok");
    } catch {
      toast("Could not read that file", "err");
    }
  });

  paintTabs();
  inPane.set(SAMPLE_YAML);
  run();
}
