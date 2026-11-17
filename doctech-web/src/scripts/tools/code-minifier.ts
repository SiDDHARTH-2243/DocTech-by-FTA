// Code Minifier — Terser for JavaScript (loaded on demand, since it's large),
// and the pure minifiers from lib/convert.ts for CSS/HTML. JSON minifies with
// the native parser.
import { minifyCss, minifyHtml } from "../lib/convert";
import { byteLength, fmtBytes } from "../lib/code";
import { initPane } from "../lib/codepane";
import { toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

type Lang = "js" | "css" | "html" | "json";
const HLJS: Record<Lang, string> = { js: "javascript", css: "css", html: "xml", json: "json" };
const EXT: Record<Lang, string> = { js: "min.js", css: "min.css", html: "min.html", json: "min.json" };

const SAMPLES: Record<Lang, string> = {
  js: `// sum of even squares\nfunction evenSquares(numbers) {\n  return numbers\n    .filter(function (n) { return n % 2 === 0; })\n    .map(function (n) { return n * n; })\n    .reduce(function (a, b) { return a + b; }, 0);\n}\nconsole.log(evenSquares([1, 2, 3, 4, 5, 6]));`,
  css: `/* card */\n.card {\n  display: flex;\n  padding: 16px;\n  color: #ff5c1a;\n}\n.card:hover {\n  transform: translateY(-2px);\n}`,
  html: `<!DOCTYPE html>\n<html>\n  <head>\n    <title>Hi</title>\n  </head>\n  <body>\n    <!-- greeting -->\n    <h1>Hello</h1>\n    <p>World</p>\n  </body>\n</html>`,
  json: `{\n  "name": "doctech",\n  "tags": ["pdf", "image", "code"],\n  "nested": { "a": 1, "b": 2 }\n}`,
};

const inPane = initPane("min-in", { debounce: 400, showBytes: true });
const outPane = initPane("min-out", { downloadName: "output.min.txt", showBytes: true });
const langSel = $<HTMLSelectElement>("min-lang");

if (inPane && outPane && langSel) {
  const mangleEl = $<HTMLInputElement>("min-mangle");
  const statsEl = $("min-stats");
  const mangleWrap = $("min-mangle-wrap");
  const lang = () => langSel.value as Lang;

  async function minify(src: string, l: Lang): Promise<string> {
    if (l === "json") return JSON.stringify(JSON.parse(src)); // throws → caught below
    if (l === "css") return minifyCss(src);
    if (l === "html") return minifyHtml(src);
    // JS via Terser.
    const { minify: terser } = await import("terser");
    const res = await terser(src, { mangle: mangleEl!.checked, compress: true });
    if (res.error) throw res.error;
    return res.code ?? "";
  }

  let busy = false;
  let pending = false;
  async function run() {
    const src = inPane!.get();
    const l = lang();
    if (!src.trim()) {
      outPane!.set("", HLJS[l]);
      inPane!.clearStatus();
      if (statsEl) statsEl.textContent = "—";
      return;
    }
    if (busy) {
      pending = true;
      return;
    }
    busy = true;
    try {
      const out = await minify(src, l);
      outPane!.set(out, HLJS[l]);
      outPane!.setDownloadName(`output.${EXT[l]}`);
      inPane!.clearStatus();

      const before = byteLength(src);
      const after = byteLength(out);
      const saved = before ? Math.round((1 - after / before) * 100) : 0;
      if (statsEl) {
        statsEl.innerHTML =
          `${fmtBytes(before)} → <span class="font-bold text-slate-700 dark:text-slate-100">${fmtBytes(after)}</span> ` +
          `<span class="${saved >= 0 ? "text-emerald-500" : "text-red-500"} font-bold">(${saved >= 0 ? "−" : "+"}${Math.abs(saved)}%)</span>`;
      }
    } catch (e) {
      const msg = (e instanceof Error ? e.message : String(e)).split("\n")[0];
      inPane!.setStatus(msg, "err");
      outPane!.set("", HLJS[l]);
      if (statsEl) statsEl.textContent = "—";
    } finally {
      busy = false;
      if (pending) {
        pending = false;
        run();
      }
    }
  }

  function syncOpts() {
    mangleWrap?.classList.toggle("hidden", lang() !== "js");
  }

  inPane.onInput(run);
  langSel.addEventListener("change", () => {
    syncOpts();
    const cur = inPane!.get().trim();
    if (!cur || Object.values(SAMPLES).includes(cur)) inPane!.set(SAMPLES[lang()]);
    run();
  });
  mangleEl?.addEventListener("change", run);
  $("min-run")?.addEventListener("click", run);

  inPane.onUpload(async (file) => {
    try {
      inPane!.set(await file.text());
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "js" || ext === "css" || ext === "html" || ext === "json") langSel.value = ext;
      syncOpts();
      run();
      toast(`Loaded ${file.name}`, "ok");
    } catch {
      toast("Could not read that file", "err");
    }
  });

  syncOpts();
  inPane.set(SAMPLES.js);
  run();
}
