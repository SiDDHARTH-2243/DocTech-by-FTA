// Shared, dependency-free primitives for the Coding Tools category.
//
// Everything here is pure and synchronous (except the File readers) so tools can
// call it on every keystroke for live preview. Nothing touches the DOM — the
// per-tool scripts own the markup. Do NOT import pdf.ts or image.ts here.

/* ── Base64 ──────────────────────────────────────────────────────────────── */

// btoa/atob are byte-oriented and throw on any code point > 0xFF, so we round-trip
// through UTF-8 bytes. This is what makes "café" and emoji survive a re-encode.
const enc = new TextEncoder();
const dec = new TextDecoder("utf-8", { fatal: true });

export function b64Encode(text: string, urlSafe = false): string {
  const bytes = enc.encode(text);
  let bin = "";
  // Chunked to avoid "too many arguments" on large inputs.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  const out = btoa(bin);
  return urlSafe ? out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : out;
}

export function b64Decode(b64: string): string {
  const bytes = b64ToBytes(b64);
  return dec.decode(bytes); // throws on invalid UTF-8 → caller reports "not text"
}

/** Decode base64 (standard or URL-safe, padding optional) to raw bytes. */
export function b64ToBytes(b64: string): Uint8Array {
  const norm = b64.trim().replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = norm + "=".repeat((4 - (norm.length % 4)) % 4);
  const bin = atob(padded); // throws on invalid alphabet
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToB64(bytes: Uint8Array, urlSafe = false): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  const out = btoa(bin);
  return urlSafe ? out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : out;
}

/** True if the string is plausibly base64 (alphabet + length). Used for auto-detect. */
export function looksBase64(s: string): boolean {
  const t = s.trim().replace(/\s+/g, "");
  if (t.length < 4 || t.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(t);
}

/* ── URL ─────────────────────────────────────────────────────────────────── */

export type UrlMode = "component" | "uri";

export function urlEncode(s: string, mode: UrlMode = "component"): string {
  return mode === "component" ? encodeURIComponent(s) : encodeURI(s);
}
export function urlDecode(s: string, mode: UrlMode = "component"): string {
  return mode === "component" ? decodeURIComponent(s) : decodeURI(s);
}

/** Split a URL into its parts + query pairs. Returns null if it isn't a valid URL. */
export function parseUrl(raw: string): {
  protocol: string;
  host: string;
  port: string;
  path: string;
  hash: string;
  params: [string, string][];
} | null {
  try {
    const u = new URL(raw.trim());
    return {
      protocol: u.protocol.replace(/:$/, ""),
      host: u.hostname,
      port: u.port,
      path: u.pathname,
      hash: u.hash.replace(/^#/, ""),
      params: [...u.searchParams.entries()],
    };
  } catch {
    return null;
  }
}

/* ── HTML entities ───────────────────────────────────────────────────────── */

const NAMED: Record<string, string> = {
  "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "apos",
  " ": "nbsp", "©": "copy", "®": "reg", "™": "trade", "€": "euro",
  "£": "pound", "¥": "yen", "¢": "cent", "§": "sect", "¶": "para",
  "•": "bull", "…": "hellip", "–": "ndash", "—": "mdash", "‘": "lsquo",
  "’": "rsquo", "“": "ldquo", "”": "rdquo", "«": "laquo", "»": "raquo",
  "×": "times", "÷": "divide", "±": "plusmn", "°": "deg", "µ": "micro",
  "¼": "frac14", "½": "frac12", "¾": "frac34", "†": "dagger", "‡": "Dagger",
  "←": "larr", "→": "rarr", "↑": "uarr", "↓": "darr", "↔": "harr",
};

/**
 * Encode text as HTML entities.
 * - "minimal" escapes only the five characters that can break markup.
 * - "named"   also uses the named table above where one exists.
 * - "all"     numerically encodes every non-ASCII character.
 */
export function encodeEntities(s: string, mode: "minimal" | "named" | "all" = "named"): string {
  // Split by code point so astral characters (emoji) encode as one entity.
  return [...s]
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      if (mode === "minimal") return NAMED[ch] && cp < 128 ? `&${NAMED[ch]};` : ch;
      if (NAMED[ch]) return `&${NAMED[ch]};`;
      if (mode === "all" && cp > 127) return `&#${cp};`;
      return ch;
    })
    .join("");
}

/** Decode named, decimal and hex entities back to text. */
export function decodeEntities(s: string): string {
  const byName = new Map(Object.entries(NAMED).map(([ch, name]) => [name, ch]));
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (whole, body: string) => {
    if (body[0] === "#") {
      const cp = body[1] === "x" || body[1] === "X"
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isFinite(cp) && cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : whole;
    }
    return byName.get(body) ?? whole;
  });
}

/* ── JSON ────────────────────────────────────────────────────────────────── */

export interface JsonError {
  message: string;
  line: number;
  col: number;
  /** Absolute character offset, or -1 when the engine didn't report one. */
  pos: number;
}

/** Convert an absolute offset into 1-based line/column. */
export function offsetToLineCol(src: string, pos: number): { line: number; col: number } {
  let line = 1;
  let last = -1;
  for (let i = 0; i < pos && i < src.length; i++) {
    if (src[i] === "\n") {
      line++;
      last = i;
    }
  }
  return { line, col: pos - last };
}

/**
 * Minimal recursive-descent JSON scanner used purely to *locate* syntax errors.
 *
 * We don't rely on the engine's exception message for this. There's no standard
 * for those strings and V8 alone emits three different shapes — including one
 * that carries no offset at all, only a quoted excerpt — so messages that look
 * parseable on one browser silently degrade to "line 1" elsewhere. Scanning the
 * source ourselves gives an exact offset on every engine.
 *
 * JSON.parse remains the source of truth for whether the document is valid;
 * this only runs after it has already thrown.
 */
interface ScanErr {
  pos: number;
  message: string;
}

function scanJson(src: string): ScanErr | null {
  let i = 0;
  const len = src.length;

  const fail = (message: string, at: number = i): never => {
    throw { pos: at, message } as ScanErr;
  };

  const ws = () => {
    while (i < len && (src[i] === " " || src[i] === "\t" || src[i] === "\n" || src[i] === "\r")) i++;
  };
  const need = () => {
    if (i >= len) fail("Unexpected end of input", len);
  };

  function string(): void {
    const start = i;
    i++; // opening quote
    for (;;) {
      if (i >= len) fail("Unterminated string", start);
      const c = src[i];
      if (c === '"') {
        i++;
        return;
      }
      if (c === "\\") {
        i++;
        if (i >= len) fail("Unterminated string", start);
        const e = src[i];
        if (!'"\\/bfnrtu'.includes(e)) fail(`Invalid escape sequence \\${e}`);
        if (e === "u") {
          for (let k = 1; k <= 4; k++) {
            if (i + k >= len || !/[0-9a-fA-F]/.test(src[i + k])) fail("Invalid \\u escape — needs 4 hex digits", i);
          }
          i += 4;
        }
        i++;
      } else if (c < " ") {
        fail("Bad control character in string literal");
      } else {
        i++;
      }
    }
  }

  function number(): void {
    const start = i;
    if (src[i] === "-") i++;
    if (src[i] === "0") i++;
    else if (src[i] >= "1" && src[i] <= "9") while (i < len && src[i] >= "0" && src[i] <= "9") i++;
    else fail("Invalid number", start);
    if (src[i] === ".") {
      i++;
      if (!(src[i] >= "0" && src[i] <= "9")) fail("Invalid number — digits expected after the decimal point");
      while (i < len && src[i] >= "0" && src[i] <= "9") i++;
    }
    if (src[i] === "e" || src[i] === "E") {
      i++;
      if (src[i] === "+" || src[i] === "-") i++;
      if (!(src[i] >= "0" && src[i] <= "9")) fail("Invalid number — digits expected in the exponent");
      while (i < len && src[i] >= "0" && src[i] <= "9") i++;
    }
  }

  function object(): void {
    i++; // {
    ws();
    need();
    if (src[i] === "}") {
      i++;
      return;
    }
    for (;;) {
      ws();
      need();
      if (src[i] !== '"') fail("Expected a property name in double quotes");
      string();
      ws();
      need();
      if (src[i] !== ":") fail("Expected ':' after the property name");
      i++;
      value();
      ws();
      need();
      if (src[i] === ",") {
        i++;
        ws();
        if (i < len && src[i] === "}") fail("Trailing comma before '}'");
        continue;
      }
      if (src[i] === "}") {
        i++;
        return;
      }
      fail("Expected ',' or '}' after the property value");
    }
  }

  function array(): void {
    i++; // [
    ws();
    need();
    if (src[i] === "]") {
      i++;
      return;
    }
    for (;;) {
      value();
      ws();
      need();
      if (src[i] === ",") {
        i++;
        ws();
        if (i < len && src[i] === "]") fail("Trailing comma before ']'");
        continue;
      }
      if (src[i] === "]") {
        i++;
        return;
      }
      fail("Expected ',' or ']' after the array element");
    }
  }

  function value(): void {
    ws();
    need();
    const c = src[i];
    if (c === "{") return object();
    if (c === "[") return array();
    if (c === '"') return string();
    if (c === "-" || (c >= "0" && c <= "9")) return number();
    if (src.startsWith("true", i)) { i += 4; return; }
    if (src.startsWith("false", i)) { i += 5; return; }
    if (src.startsWith("null", i)) { i += 4; return; }
    fail(`Unexpected token ${JSON.stringify(c)}`);
  }

  try {
    ws();
    if (i >= len) return { pos: 0, message: "Empty document" };
    value();
    ws();
    if (i < len) fail("Unexpected trailing content after the JSON value");
    return null; // scanner found nothing — caller falls back to the engine message
  } catch (e) {
    const err = e as ScanErr;
    return typeof err?.pos === "number" ? err : null;
  }
}

/**
 * Fallback locator that reads the engine's exception message, used only when the
 * scanner somehow accepts input that JSON.parse rejected.
 * Returns -1 when the position can't be recovered.
 */
function locateJsonError(src: string, msg: string): number {
  // Shape 1 — trust the engine's own line/column.
  const lc = /line (\d+) column (\d+)/i.exec(msg);
  if (lc) {
    const targetLine = Number(lc[1]);
    const targetCol = Number(lc[2]);
    let line = 1;
    for (let i = 0; i < src.length; i++) {
      if (line === targetLine) return i + targetCol - 1;
      if (src[i] === "\n") line++;
    }
    return src.length;
  }

  // Shape 2 — absolute offset.
  const p = /position (\d+)/i.exec(msg);
  if (p) return Number(p[1]);

  // "Unexpected end of JSON input" points past the last character.
  if (/unexpected end of (json )?input/i.test(msg)) return src.length;

  // Shape 3 — find the quoted excerpt in the source, then the offending token
  // inside it. An approximation, but far better than defaulting to line 1.
  const MARKER = " is not valid JSON";
  if (msg.endsWith(MARKER)) {
    let snippet = msg.slice(0, -MARKER.length).trim();
    const dots = snippet.lastIndexOf("...");
    if (dots >= 0) snippet = snippet.slice(dots + 3);
    snippet = snippet.replace(/^"/, "").replace(/"$/, "");
    if (snippet) {
      const base = src.indexOf(snippet);
      if (base >= 0) {
        const tok = /Unexpected token '(.)'/.exec(msg);
        if (tok) {
          const at = src.indexOf(tok[1], base);
          if (at >= 0) return at;
        }
        return base;
      }
    }
  }
  return -1;
}

/** Strip the engine's positional suffix so the UI can show its own line/col. */
function tidyJsonMessage(msg: string): string {
  return msg
    .replace(/\s*in JSON at position \d+(\s*\(line \d+ column \d+\))?/i, "")
    .replace(/,?\s*\.{3}?"[\s\S]*"\s*is not valid JSON$/i, "")
    .replace(/\s*is not valid JSON$/i, "")
    .trim();
}

/**
 * Parse JSON, returning either the value or an error located to a line/column.
 */
export function parseJson(src: string): { ok: true; value: unknown } | { ok: false; error: JsonError } {
  try {
    return { ok: true, value: JSON.parse(src) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const scanned = scanJson(src);
    const pos = scanned ? scanned.pos : locateJsonError(src, msg);
    const { line, col } = pos >= 0 ? offsetToLineCol(src, pos) : { line: 1, col: 1 };
    return {
      ok: false,
      error: { message: scanned?.message ?? tidyJsonMessage(msg) ?? "Invalid JSON", line, col, pos },
    };
  }
}

/** Pretty-print with a tab or N spaces. `sortKeys` gives stable, diffable output. */
export function jsonFormat(value: unknown, indent: number | "\t" = 2, sortKeys = false): string {
  return JSON.stringify(sortKeys ? sortDeep(value) : value, null, indent);
}
export function jsonMinify(value: unknown): string {
  return JSON.stringify(value);
}

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.keys(v as Record<string, unknown>)
        .sort()
        .map((k) => [k, sortDeep((v as Record<string, unknown>)[k])]),
    );
  }
  return v;
}

/** Shape summary shown in the stats rail. */
export function jsonStats(v: unknown): { keys: number; arrays: number; objects: number; depth: number; nodes: number } {
  let keys = 0, arrays = 0, objects = 0, depth = 0, nodes = 0;
  const walk = (n: unknown, d: number) => {
    nodes++;
    if (d > depth) depth = d;
    if (Array.isArray(n)) {
      arrays++;
      n.forEach((c) => walk(c, d + 1));
    } else if (n && typeof n === "object") {
      objects++;
      for (const k of Object.keys(n as object)) {
        keys++;
        walk((n as Record<string, unknown>)[k], d + 1);
      }
    }
  };
  walk(v, 1);
  return { keys, arrays, objects, depth, nodes };
}

/* ── JWT ─────────────────────────────────────────────────────────────────── */

export interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: { header: string; payload: string; signature: string };
}

/**
 * Decode a JWT. Decoding is NOT verification — we never check the signature,
 * because that needs the secret/public key. The UI must say so plainly.
 */
export function decodeJwt(token: string): JwtParts {
  const t = token.trim().replace(/^Bearer\s+/i, "");
  const parts = t.split(".");
  if (parts.length < 2) throw new Error("A JWT needs at least two dot-separated parts.");
  const [h, p, s = ""] = parts;
  const json = (seg: string, what: string) => {
    let text: string;
    try {
      text = b64Decode(seg);
    } catch {
      throw new Error(`The ${what} isn't valid base64url.`);
    }
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error(`The ${what} isn't valid JSON.`);
    }
  };
  return {
    header: json(h, "header"),
    payload: json(p, "payload"),
    signature: s,
    raw: { header: h, payload: p, signature: s },
  };
}

/** JWT time claims are seconds since epoch, not milliseconds. */
export function claimDate(v: unknown): Date | null {
  return typeof v === "number" && Number.isFinite(v) ? new Date(v * 1000) : null;
}

/* ── Timestamps ──────────────────────────────────────────────────────────── */

/** Heuristic: 13+ digits is milliseconds, 10 digits is seconds. */
export function detectEpochUnit(n: number): "s" | "ms" {
  return Math.abs(n) >= 1e12 ? "ms" : "s";
}

export function relativeTime(from: Date, to = new Date()): string {
  const diff = from.getTime() - to.getTime();
  const abs = Math.abs(diff);
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [1000, "second"], [60_000, "minute"], [3_600_000, "hour"],
    [86_400_000, "day"], [604_800_000, "week"], [2_629_800_000, "month"],
    [31_557_600_000, "year"],
  ];
  let chosen: [number, Intl.RelativeTimeFormatUnit] = units[0];
  for (const u of units) if (abs >= u[0]) chosen = u;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  return rtf.format(Math.round(diff / chosen[0]), chosen[1]);
}

/** Format a Date as a local-time ISO-8601 string with offset (not UTC). */
export function localIso(d: Date): string {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const pad = (n: number, w = 2) => String(Math.abs(Math.trunc(n))).padStart(w, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(off / 60)}:${pad(off % 60)}`
  );
}

/* ── Diff ────────────────────────────────────────────────────────────────── */

export type DiffOp = "same" | "add" | "del";
export interface DiffRow {
  op: DiffOp;
  /** 1-based line number in the left text, or null for added lines. */
  left: number | null;
  /** 1-based line number in the right text, or null for deleted lines. */
  right: number | null;
  text: string;
}

// LCS is O(n·m) in time and memory, which is fine for the text people actually
// paste but catastrophic for two large files. We trim the common prefix/suffix
// first (usually most of the input) and only fall back if the middle is still huge.
const MAX_CELLS = 4_000_000;

export function diffLines(a: string, b: string, ignoreCase = false, ignoreWs = false): DiffRow[] {
  const A = a.split("\n");
  const B = b.split("\n");
  const norm = (s: string) => {
    let t = s;
    if (ignoreWs) t = t.trim().replace(/\s+/g, " ");
    return ignoreCase ? t.toLowerCase() : t;
  };

  let head = 0;
  while (head < A.length && head < B.length && norm(A[head]) === norm(B[head])) head++;
  let tail = 0;
  while (
    tail < A.length - head &&
    tail < B.length - head &&
    norm(A[A.length - 1 - tail]) === norm(B[B.length - 1 - tail])
  ) tail++;

  const midA = A.slice(head, A.length - tail);
  const midB = B.slice(head, B.length - tail);
  const rows: DiffRow[] = [];

  for (let i = 0; i < head; i++) rows.push({ op: "same", left: i + 1, right: i + 1, text: A[i] });

  if (midA.length * midB.length > MAX_CELLS) {
    // Too big to align precisely — report the middle as a wholesale replacement.
    midA.forEach((t, i) => rows.push({ op: "del", left: head + i + 1, right: null, text: t }));
    midB.forEach((t, i) => rows.push({ op: "add", left: null, right: head + i + 1, text: t }));
  } else {
    const n = midA.length;
    const m = midB.length;
    const dp = new Uint32Array((n + 1) * (m + 1));
    const at = (i: number, j: number) => i * (m + 1) + j;
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[at(i, j)] =
          norm(midA[i]) === norm(midB[j])
            ? dp[at(i + 1, j + 1)] + 1
            : Math.max(dp[at(i + 1, j)], dp[at(i, j + 1)]);
      }
    }
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (norm(midA[i]) === norm(midB[j])) {
        rows.push({ op: "same", left: head + i + 1, right: head + j + 1, text: midA[i] });
        i++; j++;
      } else if (dp[at(i + 1, j)] >= dp[at(i, j + 1)]) {
        rows.push({ op: "del", left: head + i + 1, right: null, text: midA[i] });
        i++;
      } else {
        rows.push({ op: "add", left: null, right: head + j + 1, text: midB[j] });
        j++;
      }
    }
    while (i < n) { rows.push({ op: "del", left: head + i + 1, right: null, text: midA[i] }); i++; }
    while (j < m) { rows.push({ op: "add", left: null, right: head + j + 1, text: midB[j] }); j++; }
  }

  for (let k = 0; k < tail; k++) {
    const li = A.length - tail + k;
    const ri = B.length - tail + k;
    rows.push({ op: "same", left: li + 1, right: ri + 1, text: A[li] });
  }
  return rows;
}

/** Word-level diff used to highlight *what* changed inside a modified line pair. */
export function diffWords(a: string, b: string): { op: DiffOp; text: string }[] {
  const split = (s: string) => s.match(/\s+|[^\s]+/g) ?? [];
  const A = split(a);
  const B = split(b);
  const n = A.length, m = B.length;
  if (n * m > 250_000) return [{ op: "del", text: a }, { op: "add", text: b }];
  const dp = new Uint32Array((n + 1) * (m + 1));
  const at = (i: number, j: number) => i * (m + 1) + j;
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[at(i, j)] = A[i] === B[j] ? dp[at(i + 1, j + 1)] + 1 : Math.max(dp[at(i + 1, j)], dp[at(i, j + 1)]);

  const out: { op: DiffOp; text: string }[] = [];
  const push = (op: DiffOp, text: string) => {
    const last = out[out.length - 1];
    if (last && last.op === op) last.text += text;
    else out.push({ op, text });
  };
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { push("same", A[i]); i++; j++; }
    else if (dp[at(i + 1, j)] >= dp[at(i, j + 1)]) { push("del", A[i]); i++; }
    else { push("add", B[j]); j++; }
  }
  while (i < n) { push("del", A[i]); i++; }
  while (j < m) { push("add", B[j]); j++; }
  return out;
}

/* ── Misc ────────────────────────────────────────────────────────────────── */

export const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/** Byte length of a string once encoded as UTF-8 (≠ .length for non-ASCII). */
export const byteLength = (s: string): number => enc.encode(s).length;

export function downloadText(text: string, filename: string, mime = "text/plain"): void {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const readFileText = (f: File): Promise<string> => f.text();

export function readFileBytes(f: File): Promise<Uint8Array> {
  return f.arrayBuffer().then((b) => new Uint8Array(b));
}
