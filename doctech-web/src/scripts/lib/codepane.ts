// Behaviour for <CodePane />. One initPane(id) call per pane; the component
// guarantees the child ids this file looks up.
//
// highlight.js is imported from lib/core with only the languages the Coding
// Tools actually use registered — the full build pulls in ~190 grammars and
// would dwarf every other bundle in the app.
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import css from "highlight.js/lib/languages/css";
import plaintext from "highlight.js/lib/languages/plaintext";
import sql from "highlight.js/lib/languages/sql";
import yaml from "highlight.js/lib/languages/yaml";
import markdown from "highlight.js/lib/languages/markdown";
import { byteLength, downloadText, escapeHtml, fmtBytes } from "./code";
import { toast } from "./ui";

hljs.registerLanguage("json", json);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("markdown", markdown);

export type StatusKind = "ok" | "err" | "warn";

export interface PaneOptions {
  /** Filename offered by the Download button. */
  downloadName?: string;
  downloadMime?: string;
  /** Text inserted by the Sample button. */
  sample?: string;
  /** Debounce for onInput, in ms. */
  debounce?: number;
  /** Show a UTF-8 byte count alongside chars/lines. */
  showBytes?: boolean;
}

export interface Pane {
  /** The <textarea> for editors, the <code> for outputs. */
  readonly el: HTMLElement;
  get(): string;
  /** Set the pane's text; highlights and refreshes counts. */
  set(text: string, language?: string): void;
  /** Fires on user edits (editor panes only). */
  onInput(cb: (value: string) => void): void;
  setStatus(msg: string, kind?: StatusKind): void;
  clearStatus(): void;
  /** Enable/disable the Copy + Download buttons. */
  setActionsEnabled(on: boolean): void;
  setDownloadName(name: string): void;
  /** Fires when a file is chosen via the Upload button. */
  onUpload(cb: (file: File) => void): void;
  refresh(): void;
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

export function initPane(id: string, opts: PaneOptions = {}): Pane | null {
  const frame = $(`${id}-frame`);
  const gutter = $(`${id}-gutter`);
  const ta = $<HTMLTextAreaElement>(`${id}-ta`);
  const code = $(`${id}-code`);
  const pre = $(`${id}-pre`);
  const target = (ta ?? code) as HTMLElement | null;
  if (!frame || !gutter || !target) return null;

  const statusEl = $(`${id}-status`);
  const countsEl = $(`${id}-counts`);
  const copyBtn = $<HTMLButtonElement>(`${id}-copy`);
  const dlBtn = $<HTMLButtonElement>(`${id}-download`);
  const clearBtn = $<HTMLButtonElement>(`${id}-clear`);
  const sampleBtn = $<HTMLButtonElement>(`${id}-sample`);
  const upBtn = $<HTMLButtonElement>(`${id}-upload`);
  const fileInput = $<HTMLInputElement>(`${id}-file`);

  let downloadName = opts.downloadName ?? "output.txt";
  let language = code?.dataset.lang ?? "plaintext";
  const scroller = ta ?? pre;

  const read = () => (ta ? ta.value : (code!.textContent ?? ""));

  function renderGutter(text: string) {
    const lines = text.length === 0 ? 1 : text.split("\n").length;
    // Rebuild only when the count changed — this runs on every keystroke.
    if (gutter!.childElementCount === lines) return;
    let html = "";
    for (let i = 1; i <= lines; i++) html += `<div>${i}</div>`;
    gutter!.innerHTML = html;
  }

  function renderCounts(text: string) {
    if (!countsEl) return;
    const lines = text.length === 0 ? 1 : text.split("\n").length;
    const parts = [
      `${text.length.toLocaleString()} char${text.length === 1 ? "" : "s"}`,
      `${lines.toLocaleString()} line${lines === 1 ? "" : "s"}`,
    ];
    if (opts.showBytes) parts.push(fmtBytes(byteLength(text)));
    countsEl.textContent = parts.join(" · ");
  }

  function paint(text: string) {
    if (!code) return;
    if (language !== "plaintext" && hljs.getLanguage(language)) {
      code.innerHTML = hljs.highlight(text, { language, ignoreIllegals: true }).value;
    } else {
      code.innerHTML = escapeHtml(text);
    }
  }

  function refresh() {
    const text = read();
    renderGutter(text);
    renderCounts(text);
    const empty = text.trim().length === 0;
    if (copyBtn) copyBtn.disabled = empty;
    if (dlBtn) dlBtn.disabled = empty;
  }

  // Keep the gutter aligned with the content's vertical scroll.
  scroller?.addEventListener("scroll", () => {
    gutter.scrollTop = scroller.scrollTop;
  });

  if (ta) {
    ta.addEventListener("input", refresh);
    // Tab indents instead of leaving the field — expected in a code editor.
    ta.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      const { selectionStart: s, selectionEnd: en, value } = ta;
      ta.value = `${value.slice(0, s)}  ${value.slice(en)}`;
      ta.selectionStart = ta.selectionEnd = s + 2;
      ta.dispatchEvent(new Event("input"));
    });
  }

  copyBtn?.addEventListener("click", async () => {
    const text = read();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard", "ok");
    } catch {
      toast("Copy failed — copy manually", "err");
    }
  });

  dlBtn?.addEventListener("click", () => {
    const text = read();
    if (!text) return;
    downloadText(text, downloadName, opts.downloadMime ?? "text/plain");
    toast(`Downloaded ${downloadName}`, "ok");
  });

  clearBtn?.addEventListener("click", () => {
    if (ta) {
      ta.value = "";
      ta.dispatchEvent(new Event("input"));
      ta.focus();
    } else if (code) {
      code.textContent = "";
      refresh();
    }
  });

  upBtn?.addEventListener("click", () => fileInput?.click());

  const pane: Pane = {
    el: target,
    get: read,
    set(text, lang) {
      if (lang) language = lang;
      if (ta) ta.value = text;
      else paint(text);
      refresh();
    },
    onInput(cb) {
      if (!ta) return;
      let t: number | undefined;
      ta.addEventListener("input", () => {
        if (opts.debounce) {
          window.clearTimeout(t);
          t = window.setTimeout(() => cb(ta.value), opts.debounce);
        } else {
          cb(ta.value);
        }
      });
    },
    setStatus(msg, kind = "err") {
      if (!statusEl) return;
      const tone =
        kind === "ok"
          ? "bg-emerald-500/90 text-white"
          : kind === "warn"
            ? "bg-amber-500/90 text-white"
            : "bg-red-500/90 text-white";
      statusEl.className = `pointer-events-none absolute inset-x-0 bottom-0 px-3 py-1.5 font-mono text-[11px] font-semibold ${tone}`;
      statusEl.textContent = msg;
    },
    clearStatus() {
      if (!statusEl) return;
      statusEl.className =
        "pointer-events-none absolute inset-x-0 bottom-0 hidden px-3 py-1.5 font-mono text-[11px] font-semibold";
      statusEl.textContent = "";
    },
    setActionsEnabled(on) {
      if (copyBtn) copyBtn.disabled = !on;
      if (dlBtn) dlBtn.disabled = !on;
    },
    setDownloadName(name) {
      downloadName = name;
    },
    onUpload(cb) {
      fileInput?.addEventListener("change", () => {
        const f = fileInput.files?.[0];
        if (f) cb(f);
        fileInput.value = "";
      });
    },
    refresh,
  };

  if (sampleBtn && opts.sample !== undefined) {
    sampleBtn.addEventListener("click", () => {
      pane.set(opts.sample!);
      if (ta) ta.dispatchEvent(new Event("input"));
    });
  }

  if (code) paint(code.textContent ?? "");
  refresh();
  return pane;
}
