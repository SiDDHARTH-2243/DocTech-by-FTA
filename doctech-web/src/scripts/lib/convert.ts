// Pure, dependency-free converters for Coding Tools batch 2.
//
// Everything here is DOM-free and synchronous so the tools can call it on every
// keystroke and — as with lib/arcade.ts — so it can be import()ed and driven
// directly in tests rather than only exercised through the UI.

/* ════════════════════════════════════════════════════════════════════════════
   CSV ⇄ JSON  (RFC 4180: quoted fields, embedded commas/quotes/newlines, CRLF)
   ════════════════════════════════════════════════════════════════════════════ */

export type Delimiter = "," | ";" | "\t" | "|";

/** Guess the delimiter from the header line by counting candidates outside quotes. */
export function detectDelimiter(text: string): Delimiter {
  const line = text.split(/\r?\n/, 1)[0] ?? "";
  const cands: Delimiter[] = [",", ";", "\t", "|"];
  let best: Delimiter = ",";
  let bestN = -1;
  for (const d of cands) {
    let n = 0;
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === d && !inQ) n++;
    }
    if (n > bestN) {
      bestN = n;
      best = d;
    }
  }
  return best;
}

/** Parse CSV text into a matrix of string cells. */
export function parseCsvRows(text: string, delimiter: Delimiter = ","): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQ = false;
  let started = false; // did we see any char on this row? (to keep a trailing empty line out)

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
    started = false;
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    started = true;
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQ = true;
    } else if (ch === delimiter) {
      pushField();
    } else if (ch === "\n") {
      pushRow();
    } else if (ch === "\r") {
      if (text[i + 1] === "\n") i++;
      pushRow();
    } else {
      field += ch;
    }
  }
  // Flush the final field/row unless the file ended on a clean newline.
  if (started || field.length || row.length) pushRow();
  return rows;
}

export interface CsvToJsonOptions {
  delimiter?: Delimiter;
  header?: boolean;
  /** Turn "true"/"false"/numbers/"" into real JSON types instead of strings. */
  typed?: boolean;
}

function coerce(v: string): unknown {
  if (v === "") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  // A number, but not "007" / "1,2" / phone-like strings with leading zeros.
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(v)) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return v;
}

export function csvToJson(text: string, opts: CsvToJsonOptions = {}): unknown[] {
  const delimiter = opts.delimiter ?? detectDelimiter(text);
  const rows = parseCsvRows(text, delimiter);
  if (!rows.length) return [];
  const cast = opts.typed ? coerce : (v: string) => v;

  if (opts.header === false) return rows.map((r) => r.map(cast));

  const headers = rows[0];
  return rows.slice(1).map((r) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      obj[h] = cast(r[i] ?? "");
    });
    return obj;
  });
}

function csvCell(value: unknown, delimiter: Delimiter): string {
  const s = value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  // Quote only when necessary: contains the delimiter, a quote, or a newline.
  const needsQuote = s.includes(delimiter) || s.includes('"') || s.includes("\n") || s.includes("\r");
  return needsQuote ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Serialise an array of objects (or array of arrays) back to CSV. */
export function jsonToCsv(value: unknown, delimiter: Delimiter = ","): string {
  if (!Array.isArray(value)) throw new Error("Top-level JSON must be an array to become CSV rows.");
  if (!value.length) return "";

  const EOL = "\r\n";
  const first = value[0];

  if (Array.isArray(first)) {
    return (value as unknown[][]).map((r) => r.map((c) => csvCell(c, delimiter)).join(delimiter)).join(EOL);
  }

  if (first && typeof first === "object") {
    // Column order = first appearance across every row (union of keys).
    const headers: string[] = [];
    const seen = new Set<string>();
    for (const row of value) {
      if (row && typeof row === "object") {
        for (const k of Object.keys(row)) {
          if (!seen.has(k)) {
            seen.add(k);
            headers.push(k);
          }
        }
      }
    }
    const head = headers.map((h) => csvCell(h, delimiter)).join(delimiter);
    const body = value.map((row) =>
      headers.map((h) => csvCell((row as Record<string, unknown>)?.[h], delimiter)).join(delimiter),
    );
    return [head, ...body].join(EOL);
  }

  // Array of scalars → single column.
  return value.map((v) => csvCell(v, delimiter)).join(EOL);
}

/* ════════════════════════════════════════════════════════════════════════════
   CRON  (standard 5-field: minute hour day-of-month month day-of-week)
   ════════════════════════════════════════════════════════════════════════════ */

interface CronField {
  values: Set<number>;
  /** True only for a literal "*" (a full, unstepped range). */
  star: boolean;
  /** Set for a whole-range step like "*​/5" → 5, so descriptions can say "every 5 minutes". */
  everyStep?: number;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DOWS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CRON_ALIASES: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

interface FieldSpec {
  min: number;
  max: number;
  names?: string[];
}
const SPECS: FieldSpec[] = [
  { min: 0, max: 59 }, // minute
  { min: 0, max: 23 }, // hour
  { min: 1, max: 31 }, // day of month
  { min: 1, max: 12, names: MONTHS }, // month
  { min: 0, max: 7, names: DOWS }, // day of week (0 or 7 = Sunday)
];

function parseField(raw: string, spec: FieldSpec, index: number): CronField {
  const values = new Set<number>();
  const star = raw === "*";
  // "*/n" (or "min-max/n" over the full range) → a regular step we can name.
  const stepMatch = /^\*\/(\d+)$/.exec(raw);
  const everyStep = stepMatch ? Number(stepMatch[1]) : undefined;

  const nameToNum = (tok: string): number => {
    const up = tok.toUpperCase();
    const ni = spec.names?.indexOf(up) ?? -1;
    if (ni >= 0) return index === 3 ? ni + 1 : ni; // months are 1-based, dows 0-based
    if (!/^\d+$/.test(tok)) throw new Error(`"${tok}" isn't valid in this field.`);
    return Number(tok);
  };

  for (const part of raw.split(",")) {
    const [rangePart, stepPart] = part.split("/");
    const step = stepPart === undefined ? 1 : Number(stepPart);
    if (!Number.isInteger(step) || step < 1) throw new Error(`Bad step "/${stepPart}".`);

    let lo: number, hi: number;
    if (rangePart === "*") {
      lo = spec.min;
      hi = spec.max;
    } else if (rangePart.includes("-")) {
      const [a, b] = rangePart.split("-");
      lo = nameToNum(a);
      hi = nameToNum(b);
    } else {
      lo = hi = nameToNum(rangePart);
      if (stepPart !== undefined) hi = spec.max; // "5/15" means 5,20,35,...
    }

    // Day-of-week 7 normalises to 0 (Sunday).
    if (index === 4) {
      if (lo === 7) lo = 0;
      if (hi === 7) hi = 0;
    }
    if (lo > hi) throw new Error(`Range ${lo}-${hi} is backwards.`);
    if (lo < spec.min || hi > spec.max) throw new Error(`Value out of range (${spec.min}-${spec.max}).`);
    for (let v = lo; v <= hi; v += step) values.add(v);
  }
  return { values, star, everyStep };
}

export interface CronParsed {
  fields: CronField[];
  normalized: string;
}

export function parseCron(expr: string): CronParsed {
  let e = expr.trim().toLowerCase();
  if (e in CRON_ALIASES) e = CRON_ALIASES[e];
  const parts = e.split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(
      `Expected 5 fields (minute hour day month weekday), got ${parts.length}. Try @daily, @hourly, etc.`,
    );
  }
  const fields = parts.map((p, i) => parseField(p, SPECS[i], i));
  return { fields, normalized: parts.join(" ") };
}

const list = (f: CronField) => [...f.values].sort((a, b) => a - b);

/** Turn a cron expression into a plain-English sentence. */
export function describeCron(expr: string): string {
  const { fields } = parseCron(expr);
  const [min, hour, dom, mon, dow] = fields;

  const pad = (n: number) => String(n).padStart(2, "0");
  // A minute field that's "*" or "*/n" reads as a frequency ("every minute",
  // "every 5 minutes"); anything else reads as a fixed minute list.
  const minEvery = min.star ? "every minute" : min.everyStep ? `every ${min.everyStep} minutes` : "";
  const hourScope = (): string =>
    hour.star ? "" : hour.everyStep ? ` (every ${hour.everyStep} hours)` : ` during hour ${list(hour).join(", ")}`;

  const time = (): string => {
    if (minEvery && hour.star) return minEvery;
    if (minEvery) return `${minEvery}${hourScope()}`;
    if (min.values.size === 1 && hour.values.size === 1) {
      return `at ${pad(list(hour)[0])}:${pad(list(min)[0])}`;
    }
    if (hour.star && min.values.size === 1) return `at minute ${list(min)[0]} of every hour`;
    const mins = list(min).map(pad).join(", ");
    return `at minute ${mins}${hour.star ? " past every hour" : ` past hour ${list(hour).join(", ")}`}`;
  };

  const domTxt = `on day-of-month ${list(dom).join(", ")}`;
  const dowTxt = `on ${list(dow).map((d) => DOWS[d % 7]).join(", ")}`;

  const parts: string[] = [time()];
  // When both day fields are restricted, cron fires if EITHER matches — spell the
  // "or" out, since that's the single most misunderstood part of cron.
  if (!dom.star && !dow.star) parts.push(`${domTxt} or ${dowTxt}`);
  else if (!dom.star) parts.push(domTxt);
  else if (!dow.star) parts.push(dowTxt);
  if (!mon.star) parts.push(`in ${list(mon).map((m) => MONTHS[m - 1]).join(", ")}`);
  if (dom.star && mon.star && dow.star) parts.push("every day");

  const s = parts.join(", ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

/** Does a Date satisfy the parsed expression? */
function matches(fields: CronField[], d: Date): boolean {
  const [min, hour, dom, mon, dow] = fields;
  if (!min.values.has(d.getMinutes())) return false;
  if (!hour.values.has(d.getHours())) return false;
  if (!mon.values.has(d.getMonth() + 1)) return false;
  // Standard cron: when BOTH dom and dow are restricted, either may match.
  const domOk = dom.values.has(d.getDate());
  const dowOk = dow.values.has(d.getDay());
  if (dom.star && dow.star) return true;
  if (dom.star) return dowOk;
  if (dow.star) return domOk;
  return domOk || dowOk;
}

/** Next `count` run times strictly after `from`. */
export function nextRuns(expr: string, from: Date = new Date(), count = 5): Date[] {
  const { fields } = parseCron(expr);
  const out: Date[] = [];
  const d = new Date(from.getTime());
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1); // strictly after

  let guard = 0;
  const LIMIT = 500_000; // ~ enough to skip to the next Feb-29-on-a-Monday etc.
  while (out.length < count && guard++ < LIMIT) {
    if (!fields[3].values.has(d.getMonth() + 1)) {
      // Jump to the 1st of next month at 00:00.
      d.setMonth(d.getMonth() + 1, 1);
      d.setHours(0, 0, 0, 0);
      continue;
    }
    const domOk = fields[2].values.has(d.getDate());
    const dowOk = fields[4].values.has(d.getDay());
    const dayOk = fields[2].star && fields[4].star ? true : fields[2].star ? dowOk : fields[4].star ? domOk : domOk || dowOk;
    if (!dayOk) {
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      continue;
    }
    if (!fields[1].values.has(d.getHours())) {
      d.setHours(d.getHours() + 1, 0, 0, 0);
      continue;
    }
    if (!fields[0].values.has(d.getMinutes())) {
      d.setMinutes(d.getMinutes() + 1, 0, 0);
      continue;
    }
    out.push(new Date(d.getTime()));
    d.setMinutes(d.getMinutes() + 1);
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════════════════
   CASE CONVERSION  (identifier / variable-name styles)
   ════════════════════════════════════════════════════════════════════════════ */

export type CaseStyle =
  | "camel"
  | "pascal"
  | "snake"
  | "constant"
  | "kebab"
  | "dot"
  | "path"
  | "title"
  | "sentence"
  | "lower"
  | "upper";

/**
 * Break an identifier or phrase into lowercased words, splitting on separators
 * AND camelCase / PascalCase / acronym / digit boundaries.
 *   "getHTTPResponse2Code" → ["get","http","response","2","code"]
 */
export function splitWords(input: string): string[] {
  return (
    input
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // fooBar → foo Bar
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // HTTPResponse → HTTP Response
      .replace(/([a-zA-Z])([0-9])/g, "$1 $2") // code2 → code 2
      .replace(/([0-9])([a-zA-Z])/g, "$1 $2") // 2code → 2 code
      .split(/[^a-zA-Z0-9]+/)
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean)
  );
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export function toCase(input: string, style: CaseStyle): string {
  const w = splitWords(input);
  if (!w.length) return "";
  switch (style) {
    case "camel": return w[0] + w.slice(1).map(cap).join("");
    case "pascal": return w.map(cap).join("");
    case "snake": return w.join("_");
    case "constant": return w.join("_").toUpperCase();
    case "kebab": return w.join("-");
    case "dot": return w.join(".");
    case "path": return w.join("/");
    case "title": return w.map(cap).join(" ");
    case "sentence": return cap(w.join(" "));
    case "lower": return w.join(" ");
    case "upper": return w.join(" ").toUpperCase();
  }
}

export const CASE_STYLES: { style: CaseStyle; label: string; example: string }[] = [
  { style: "camel", label: "camelCase", example: "helloWorld" },
  { style: "pascal", label: "PascalCase", example: "HelloWorld" },
  { style: "snake", label: "snake_case", example: "hello_world" },
  { style: "constant", label: "CONSTANT_CASE", example: "HELLO_WORLD" },
  { style: "kebab", label: "kebab-case", example: "hello-world" },
  { style: "dot", label: "dot.case", example: "hello.world" },
  { style: "path", label: "path/case", example: "hello/world" },
  { style: "title", label: "Title Case", example: "Hello World" },
  { style: "sentence", label: "Sentence case", example: "Hello world" },
  { style: "lower", label: "lower case", example: "hello world" },
  { style: "upper", label: "UPPER CASE", example: "HELLO WORLD" },
];

/* ════════════════════════════════════════════════════════════════════════════
   NUMBER BASE CONVERSION  (BigInt — arbitrary size, bases 2–36)
   ════════════════════════════════════════════════════════════════════════════ */

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

/** Parse a string in the given base to a BigInt. Accepts 0x/0b/0o prefixes, _ and space separators, and a sign. */
export function parseInBase(raw: string, base: number): bigint {
  let s = raw.trim().toLowerCase().replace(/[_\s]/g, "");
  if (!s) throw new Error("Empty input.");
  let neg = false;
  if (s[0] === "+" || s[0] === "-") {
    neg = s[0] === "-";
    s = s.slice(1);
  }
  if (base === 16 && s.startsWith("0x")) s = s.slice(2);
  else if (base === 2 && s.startsWith("0b")) s = s.slice(2);
  else if (base === 8 && s.startsWith("0o")) s = s.slice(2);
  if (!s) throw new Error("No digits after the sign/prefix.");

  const big = BigInt(base);
  let acc = 0n;
  for (const ch of s) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) throw new Error(`"${ch}" isn't a valid base-${base} digit.`);
    acc = acc * big + BigInt(d);
  }
  return neg ? -acc : acc;
}

/** Render a BigInt in the target base (2–36). */
export function toBase(value: bigint, base: number): string {
  if (base < 2 || base > 36) throw new Error("Base must be 2–36.");
  if (value === 0n) return "0";
  const neg = value < 0n;
  let v = neg ? -value : value;
  const big = BigInt(base);
  let out = "";
  while (v > 0n) {
    out = DIGITS[Number(v % big)] + out;
    v /= big;
  }
  return neg ? "-" + out : out;
}

/** Group digits for readability (e.g. binary in nibbles of 4, hex in bytes of 2). */
export function groupDigits(s: string, size: number): string {
  const neg = s.startsWith("-");
  const body = neg ? s.slice(1) : s;
  if (size <= 0 || body.length <= size) return s;
  const rem = body.length % size;
  const head = rem ? [body.slice(0, rem)] : [];
  const rest = body.slice(rem).match(new RegExp(`.{${size}}`, "g")) ?? [];
  return (neg ? "-" : "") + [...head, ...rest].join(" ");
}

/* ════════════════════════════════════════════════════════════════════════════
   MINIFIERS  (CSS + HTML — JS minification uses terser, loaded in the tool)
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * Minify CSS with a small state machine that respects strings and comments, so
 * it never mangles content inside quotes or url(). Conservative on purpose:
 * whitespace collapse + comment removal + tidy punctuation, nothing that could
 * change meaning.
 */
export function minifyCss(css: string): string {
  // Split into segments so the whitespace/punctuation cleanup can be applied to
  // ordinary CSS only — string literals and kept comments are copied VERBATIM and
  // never touched (a regex over the whole output would eat spaces inside quotes).
  const segments: { verbatim: boolean; text: string }[] = [];
  let buf = "";
  const flush = () => {
    if (buf) {
      segments.push({ verbatim: false, text: buf });
      buf = "";
    }
  };

  let i = 0;
  const n = css.length;
  while (i < n) {
    const ch = css[i];
    if (ch === "/" && css[i + 1] === "*") {
      const keep = css[i + 2] === "!"; // /*! … */ license comments survive
      const end = css.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      if (keep) {
        flush();
        segments.push({ verbatim: true, text: css.slice(i, stop) });
      } else {
        buf += " "; // a dropped comment still separates tokens
      }
      i = stop;
      continue;
    }
    if (ch === '"' || ch === "'") {
      flush();
      const start = i++;
      while (i < n && css[i] !== ch) {
        if (css[i] === "\\") i++;
        i++;
      }
      segments.push({ verbatim: true, text: css.slice(start, i + 1) });
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  flush();

  return segments
    .map((s) =>
      s.verbatim
        ? s.text
        : s.text
            .replace(/\s+/g, " ")
            .replace(/\s*([{}:;,>~+])\s*/g, "$1") // trim around punctuation/combinators
            .replace(/;}/g, "}"), // drop the last semicolon in a block
    )
    .join("")
    .trim();
}

/** Collapse HTML whitespace, preserving <pre>/<textarea>/<script>/<style> contents and comments. */
export function minifyHtml(html: string): string {
  const guards: string[] = [];
  // Stash the elements whose whitespace is significant, then collapse the rest.
  let stashed = html.replace(/<(pre|textarea|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, (m) => {
    guards.push(m);
    return ` ${guards.length - 1} `;
  });
  stashed = stashed
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, "") // strip comments (keep IE conditionals)
    .replace(/>\s+</g, "><") // whitespace between tags
    .replace(/\s{2,}/g, " ")
    .replace(/\s+>/g, ">")
    .trim();
  return stashed.replace(/ (\d+) /g, (_, i) => guards[Number(i)]);
}
