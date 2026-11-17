// Code Formatter — Prettier in the browser. Prettier + its parser plugins are
// heavy, so they're dynamically import()ed per language: a JS format never loads
// the HTML/CSS/YAML parsers, and none of it touches the shared coding chunk.
import { initPane } from "../lib/codepane";
import { toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

type Lang = "js" | "ts" | "jsx" | "css" | "scss" | "less" | "html" | "json" | "md" | "yaml";

// Which highlight.js grammar renders each language's output.
const HLJS: Record<Lang, string> = {
  js: "javascript", jsx: "javascript", ts: "javascript", json: "json",
  css: "css", scss: "css", less: "css", html: "xml", md: "markdown", yaml: "yaml",
};

const SAMPLES: Partial<Record<Lang, string>> = {
  js: `const greet=(name)=>{return 'hello, '+name}\nconst nums=[1,2,3].map(n=>n*2).filter(n=>n>2)\nconsole.log(greet('world'),nums)`,
  ts: `interface User{id:number;name:string;roles?:string[]}\nfunction find(users:User[],id:number):User|undefined{return users.find(u=>u.id===id)}`,
  css: `.card{display:flex;padding:10px;color:#FF5C1A;background:white}.card:hover{transform:translateY(-2px)}`,
  html: `<div class="wrap"><h1>Title</h1><p>Some <b>bold</b> text and a <a href="#">link</a>.</p></div>`,
  json: `{"name":"doctech","tags":["pdf","image"],"nested":{"a":1,"b":[2,3]}}`,
  md: `# Title\nSome **bold** and *italic*.\n- one\n- two\n\n\n\nToo many blanks above.`,
  yaml: `name:   doctech\nlist:\n    - a\n    - b\nnested: {x: 1, y: 2}`,
};

/** Dynamically load Prettier + only the plugins this language needs. */
async function loadPrettier(lang: Lang): Promise<{ format: (src: string, opts: object) => Promise<string>; parser: string; plugins: unknown[] }> {
  const prettier = await import("prettier/standalone");
  const plugins: unknown[] = [];
  let parser: string;

  const estree = () => import("prettier/plugins/estree");
  const babel = () => import("prettier/plugins/babel");

  if (lang === "js" || lang === "jsx") {
    parser = "babel";
    plugins.push(await babel(), await estree());
  } else if (lang === "ts") {
    parser = "typescript";
    plugins.push(await import("prettier/plugins/typescript"), await estree());
  } else if (lang === "json") {
    parser = "json";
    plugins.push(await babel(), await estree());
  } else if (lang === "css" || lang === "scss" || lang === "less") {
    parser = lang;
    plugins.push(await import("prettier/plugins/postcss"));
  } else if (lang === "html") {
    parser = "html";
    plugins.push(await import("prettier/plugins/html"), await babel(), await estree(), await import("prettier/plugins/postcss"));
  } else if (lang === "md") {
    parser = "markdown";
    plugins.push(await import("prettier/plugins/markdown"));
  } else {
    parser = "yaml";
    plugins.push(await import("prettier/plugins/yaml"));
  }
  return { format: (src, opts) => prettier.format(src, opts), parser, plugins };
}

const inPane = initPane("fmt-in", { debounce: 400 });
const outPane = initPane("fmt-out", { downloadName: "formatted.txt" });
const langSel = $<HTMLSelectElement>("fmt-lang");

if (inPane && outPane && langSel) {
  const widthEl = $<HTMLInputElement>("fmt-width");
  const tabEl = $<HTMLSelectElement>("fmt-tab");
  const trailingEl = $<HTMLSelectElement>("fmt-trailing");
  const semiEl = $<HTMLInputElement>("fmt-semi");
  const singleEl = $<HTMLInputElement>("fmt-single");
  const jsOpts = $("fmt-js-opts");

  const lang = () => langSel.value as Lang;
  const EXT: Record<Lang, string> = { js: "js", jsx: "jsx", ts: "ts", css: "css", scss: "scss", less: "less", html: "html", json: "json", md: "md", yaml: "yaml" };

  // A format can be in flight (Prettier loads async) when another option changes.
  // Don't drop that change — remember it and re-run once the current finishes,
  // so the output always reflects the latest settings.
  let busy = false;
  let pending = false;
  async function run() {
    const src = inPane!.get();
    const l = lang();
    if (!src.trim()) {
      outPane!.set("", HLJS[l]);
      inPane!.clearStatus();
      outPane!.clearStatus();
      return;
    }
    if (busy) {
      pending = true;
      return;
    }
    busy = true;

    const tab = tabEl!.value;
    const opts = {
      parser: "",
      plugins: [] as unknown[],
      printWidth: Math.max(20, Math.min(200, Number(widthEl!.value) || 80)),
      tabWidth: tab === "tab" ? 2 : Number(tab),
      useTabs: tab === "tab",
      semi: semiEl!.checked,
      singleQuote: singleEl!.checked,
      trailingComma: trailingEl!.value as "all" | "es5" | "none",
    };

    try {
      const { format, parser, plugins } = await loadPrettier(l);
      opts.parser = parser;
      opts.plugins = plugins;
      const out = await format(src, opts);
      outPane!.set(out.replace(/\n$/, ""), HLJS[l]);
      outPane!.setDownloadName(`formatted.${EXT[l]}`);
      inPane!.setStatus("Formatted", "ok");
      outPane!.clearStatus();
    } catch (e) {
      // Prettier throws a codeframe error with the exact line/column.
      const msg = (e instanceof Error ? e.message : String(e)).split("\n")[0];
      inPane!.setStatus(msg, "err");
      outPane!.set("", HLJS[l]);
    } finally {
      busy = false;
      if (pending) {
        pending = false;
        run();
      }
    }
  }

  // JS-only options (semicolons, quotes) are meaningless for CSS/HTML/YAML.
  function syncOptsVisibility() {
    const l = lang();
    const jsish = l === "js" || l === "jsx" || l === "ts";
    jsOpts?.classList.toggle("opacity-40", !jsish);
    jsOpts?.classList.toggle("pointer-events-none", !jsish);
    trailingEl!.parentElement?.classList.toggle("opacity-40", !(jsish || l === "json"));
  }

  inPane.onInput(run);
  langSel.addEventListener("change", () => {
    syncOptsVisibility();
    const s = SAMPLES[lang()];
    if (!inPane!.get().trim() && s) inPane!.set(s);
    run();
  });
  [widthEl, tabEl, trailingEl, semiEl, singleEl].forEach((el) => el?.addEventListener("change", run));
  $("fmt-run")?.addEventListener("click", run);

  inPane.onUpload(async (file) => {
    try {
      inPane!.set(await file.text());
      // Guess the language from the extension.
      const ext = file.name.split(".").pop()?.toLowerCase();
      const guess = (Object.entries(EXT).find(([, e]) => e === ext)?.[0] ?? "") as Lang | "";
      if (guess) langSel.value = guess;
      syncOptsVisibility();
      run();
      toast(`Loaded ${file.name}`, "ok");
    } catch {
      toast("Could not read that file", "err");
    }
  });

  // Seed with a sample so the page is never empty.
  syncOptsVisibility();
  inPane.set(SAMPLES.js!);
  run();
}
