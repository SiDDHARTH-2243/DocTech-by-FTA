// URL Encoder & Decoder — percent-encoding both ways plus a live URL breakdown.
import { escapeHtml, parseUrl, urlDecode, urlEncode, type UrlMode } from "../lib/code";
import { initPane } from "../lib/codepane";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const inPane = initPane("url-in", {
  sample: "https://example.com/search?q=hello world&lang=en#results",
  debounce: 120,
});
const outPane = initPane("url-out", { downloadName: "url.txt" });
const scope = $<HTMLSelectElement>("url-scope");
const modeBtns = [...document.querySelectorAll<HTMLButtonElement>(".url-mode")];

if (inPane && outPane && scope && modeBtns.length) {
  let mode: "encode" | "decode" = "encode";

  function paintTabs() {
    for (const b of modeBtns) {
      const active = b.dataset.mode === mode;
      b.setAttribute("aria-pressed", String(active));
      b.classList.toggle("bg-orange-500", active);
      b.classList.toggle("text-white", active);
      b.classList.toggle("text-slate-500", !active);
      b.classList.toggle("dark:text-slate-400", !active);
    }
  }

  function inspect(raw: string) {
    const parts = parseUrl(raw);
    const box = $("url-inspect");
    const empty = $("url-inspect-empty");
    const paramsWrap = $("url-params-wrap");
    const tbody = $("url-params");

    if (!parts) {
      box?.classList.add("hidden");
      empty?.classList.remove("hidden");
      return;
    }
    box?.classList.remove("hidden");
    empty?.classList.add("hidden");

    const put = (id: string, v: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v || "—";
    };
    put("url-p-protocol", parts.protocol);
    put("url-p-host", parts.host);
    put("url-p-port", parts.port);
    put("url-p-path", parts.path);
    put("url-p-hash", parts.hash);

    if (tbody) {
      // URLSearchParams already decodes values for us.
      tbody.innerHTML = parts.params
        .map(
          ([k, v]) =>
            `<tr class="border-b border-slate-100 last:border-0 dark:border-slate-800">
               <td class="py-2 pr-4 font-mono text-xs font-semibold text-sky-700 dark:text-sky-300">${escapeHtml(k)}</td>
               <td class="py-2 font-mono text-xs break-all text-slate-700 dark:text-slate-200">${escapeHtml(v)}</td>
             </tr>`,
        )
        .join("");
    }
    paramsWrap?.classList.toggle("hidden", parts.params.length === 0);
  }

  function run() {
    const src = inPane!.get();
    if (!src.trim()) {
      outPane!.set("");
      inPane!.clearStatus();
      $("url-inspect")?.classList.add("hidden");
      $("url-inspect-empty")?.classList.remove("hidden");
      return;
    }

    const m = scope!.value as UrlMode;
    try {
      outPane!.set(mode === "encode" ? urlEncode(src, m) : urlDecode(src, m));
      inPane!.clearStatus();
    } catch {
      // decodeURIComponent throws URIError on a malformed sequence like "%E0%A4%A".
      outPane!.set("");
      inPane!.setStatus("Malformed percent-encoding — check for a stray % or an incomplete escape.", "err");
    }

    inspect(mode === "decode" ? (outPane!.get() || src) : src);
  }

  for (const b of modeBtns) {
    b.addEventListener("click", () => {
      mode = b.dataset.mode as "encode" | "decode";
      paintTabs();
      run();
    });
  }

  $("url-swap")?.addEventListener("click", () => {
    const out = outPane!.get();
    if (!out) return;
    mode = mode === "encode" ? "decode" : "encode";
    paintTabs();
    inPane!.set(out);
    run();
  });

  inPane.onInput(run);
  scope.addEventListener("change", run);

  paintTabs();
  run();
}
