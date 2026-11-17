// JWT Decoder — splits a token, decodes header/payload, and explains the
// registered claims. Decoding only; signatures are never verified (see the UI note).
import { claimDate, decodeJwt, escapeHtml, localIso, relativeTime } from "../lib/code";
import { initPane } from "../lib/codepane";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

// A well-formed HS256 token with exp far in the future, for the Sample button.
const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlzcyI6ImRvY3RlY2guZnRhIiwiYXVkIjoiZG9jdGVjaC13ZWIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjA1MzAwMDAwMH0." +
  "T2xkU2lnbmF0dXJlUGxhY2Vob2xkZXJWYWx1ZQ";

const CLAIM_DOCS: Record<string, string> = {
  iss: "Issuer — who created the token",
  sub: "Subject — who the token is about",
  aud: "Audience — who it's intended for",
  exp: "Expires at",
  nbf: "Not valid before",
  iat: "Issued at",
  jti: "JWT ID — unique identifier",
  typ: "Token type",
  alg: "Signing algorithm",
  scope: "Granted scopes",
  azp: "Authorized party",
};

const input = $<HTMLTextAreaElement>("jwt-input");
const headerPane = initPane("jwt-header", {});
const payloadPane = initPane("jwt-payload", {});

if (input && headerPane && payloadPane) {
  const result = $("jwt-result");
  const errEl = $("jwt-error");
  const segWrap = $("jwt-segments");
  const claims = $("jwt-claims");

  function showError(msg: string) {
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.remove("hidden");
    }
    result?.classList.add("hidden");
    segWrap?.classList.add("hidden");
  }

  function clearError() {
    errEl?.classList.add("hidden");
  }

  function renderClaims(payload: Record<string, unknown>, header: Record<string, unknown>) {
    if (!claims) return;
    const now = new Date();
    const rows: string[] = [];

    const add = (key: string, value: unknown, from: "header" | "payload") => {
      const doc = CLAIM_DOCS[key] ?? (from === "header" ? "Header parameter" : "Custom claim");
      let rendered: string;
      const d = claimDate(value);

      if (d && (key === "exp" || key === "iat" || key === "nbf")) {
        // Time claims are the ones people actually open a decoder for — spell them out.
        const expired = key === "exp" && d.getTime() < now.getTime();
        const notYet = key === "nbf" && d.getTime() > now.getTime();
        const tone = expired || notYet
          ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300"
          : key === "exp"
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
        const badge = expired ? "expired" : notYet ? "not yet valid" : key === "exp" ? "valid" : relativeTime(d, now);
        rendered =
          `<div class="font-mono text-xs text-slate-700 dark:text-slate-200">${escapeHtml(localIso(d))}</div>` +
          `<span class="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}">${badge}${key === "exp" && !expired ? ` · ${relativeTime(d, now)}` : ""}</span>`;
      } else {
        const text = typeof value === "string" ? value : JSON.stringify(value);
        rendered = `<span class="font-mono text-xs break-all text-slate-700 dark:text-slate-200">${escapeHtml(String(text))}</span>`;
      }

      rows.push(
        `<tr class="border-b border-slate-100 last:border-0 dark:border-slate-800">
           <td class="py-2.5 pr-4 align-top font-mono text-xs font-bold text-orange-600 dark:text-orange-400">${escapeHtml(key)}</td>
           <td class="py-2.5 pr-4 align-top text-xs text-slate-500 dark:text-slate-400">${escapeHtml(doc)}</td>
           <td class="py-2.5 align-top">${rendered}</td>
         </tr>`,
      );
    };

    for (const [k, v] of Object.entries(header)) add(k, v, "header");
    for (const [k, v] of Object.entries(payload)) add(k, v, "payload");
    claims.innerHTML = rows.join("");
  }

  function run() {
    const raw = input!.value.trim();
    if (!raw) {
      clearError();
      result?.classList.add("hidden");
      segWrap?.classList.add("hidden");
      return;
    }

    let parts;
    try {
      parts = decodeJwt(raw);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Could not decode that token.");
      return;
    }

    clearError();
    result?.classList.remove("hidden");
    segWrap?.classList.remove("hidden");

    const seg = (id: string, v: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    seg("jwt-seg-h", parts.raw.header);
    seg("jwt-seg-p", parts.raw.payload);
    seg("jwt-seg-s", parts.raw.signature);

    headerPane!.set(JSON.stringify(parts.header, null, 2), "json");
    payloadPane!.set(JSON.stringify(parts.payload, null, 2), "json");
    renderClaims(parts.payload, parts.header);
  }

  input.addEventListener("input", run);
  $("jwt-sample")?.addEventListener("click", () => {
    input!.value = SAMPLE;
    run();
  });
  $("jwt-clear")?.addEventListener("click", () => {
    input!.value = "";
    run();
    input!.focus();
  });

  run();
}
