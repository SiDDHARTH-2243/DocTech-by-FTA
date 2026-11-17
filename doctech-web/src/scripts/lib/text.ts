// Shared, framework-free text helpers for the Text Tools category. All pure.

// ── Case conversions ──────────────────────────────────────────────────────────
export function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function toSentenceCase(s: string): string {
  return s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
}

/** Split a string into word tokens regardless of existing delimiters/case. */
function words(s: string): string[] {
  return (
    s
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // split camelCase
      .replace(/[_-]+/g, " ")
      .match(/[A-Za-z0-9]+/g) || []
  );
}

export function toCamelCase(s: string): string {
  return words(s)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join("");
}

export function toSnakeCase(s: string): string {
  return words(s)
    .map((w) => w.toLowerCase())
    .join("_");
}

export function toKebabCase(s: string): string {
  return words(s)
    .map((w) => w.toLowerCase())
    .join("-");
}

export function toAlternating(s: string): string {
  let i = 0;
  return s.replace(/[a-zA-Z]/g, (c) => {
    const out = i % 2 === 0 ? c.toLowerCase() : c.toUpperCase();
    i++;
    return out;
  });
}

// ── Counting ──────────────────────────────────────────────────────────────────
export interface TextStats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMin: number;
}

export function countStats(text: string): TextStats {
  const trimmed = text.trim();
  const wordCount = trimmed ? (trimmed.match(/\S+/g) || []).length : 0;
  const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || []).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const lines = text === "" ? 0 : text.split(/\n/).length;
  return {
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, "").length,
    words: wordCount,
    sentences,
    paragraphs,
    lines,
    readingTimeMin: wordCount / 200, // ~200 wpm
  };
}

// ── Bionic reading ────────────────────────────────────────────────────────────
/** Bold the leading `fixation` fraction (0..1) of each word. Returns HTML. */
export function bionicHtml(text: string, fixation = 0.5): string {
  const esc = (s: string) =>
    s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] || c);
  return esc(text).replace(/[\p{L}\p{N}]+/gu, (word) => {
    const n = Math.max(1, Math.ceil(word.length * fixation));
    return `<b>${word.slice(0, n)}</b>${word.slice(n)}`;
  });
}

// ── Whitespace cleaning ───────────────────────────────────────────────────────
export interface CleanOpts {
  collapseSpaces?: boolean; // multiple spaces/tabs → single space
  trimLines?: boolean; // trim each line
  removeEmptyLines?: boolean; // drop blank lines
  removeLineBreaks?: boolean; // join everything onto one line
  removeSpecial?: boolean; // strip non-printable / zero-width chars
}

// Char-code helpers (avoids non-ASCII regex literals).
function isZeroWidthOrBom(code: number): boolean {
  return code === 0x200b || code === 0x200c || code === 0x200d || code === 0xfeff;
}
function isStrippableControl(code: number): boolean {
  // Control chars except tab (9) and newline (10).
  return (code < 0x20 && code !== 9 && code !== 10) || code === 0x7f;
}
function isUnicodeSpace(code: number): boolean {
  return (
    code === 0xa0 ||
    (code >= 0x2000 && code <= 0x200a) ||
    code === 0x202f ||
    code === 0x205f ||
    code === 0x3000
  );
}

export function cleanWhitespace(text: string, opts: CleanOpts): string {
  let out = text;
  if (opts.removeSpecial) {
    out = Array.from(out)
      .filter((ch) => {
        const code = ch.codePointAt(0)!;
        return !isZeroWidthOrBom(code) && !isStrippableControl(code);
      })
      .map((ch) => (isUnicodeSpace(ch.codePointAt(0)!) ? " " : ch))
      .join("");
  }
  if (opts.removeLineBreaks) {
    out = out.replace(/\s*\n\s*/g, " ");
  }
  if (opts.collapseSpaces) {
    out = out.replace(/[ \t]{2,}/g, " ");
  }
  if (opts.trimLines) {
    out = out
      .split("\n")
      .map((l) => l.trim())
      .join("\n");
  }
  if (opts.removeEmptyLines) {
    out = out
      .split("\n")
      .filter((l) => l.trim() !== "")
      .join("\n");
  }
  return out.trim();
}

// ── Lorem ipsum ───────────────────────────────────────────────────────────────
const LOREM_WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(
    " ",
  );

export interface LoremOpts {
  paragraphs: number;
  sentencesPerPara?: number;
  startWithLorem?: boolean;
  htmlWrap?: boolean;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loremSentence(): string {
  const len = randInt(6, 14);
  const ws = Array.from({ length: len }, () => LOREM_WORDS[randInt(0, LOREM_WORDS.length - 1)]);
  let s = ws.join(" ");
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return s + ".";
}

export function loremIpsum(opts: LoremOpts): string {
  const paras: string[] = [];
  for (let p = 0; p < Math.max(1, opts.paragraphs); p++) {
    const count = opts.sentencesPerPara ?? randInt(3, 6);
    const sentences = Array.from({ length: count }, () => loremSentence());
    if (p === 0 && opts.startWithLorem) {
      sentences[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
    }
    paras.push(sentences.join(" "));
  }
  if (opts.htmlWrap) return paras.map((p) => `<p>${p}</p>`).join("\n");
  return paras.join("\n\n");
}

/* ════════════════════════════════════════════════════════════════════════════
   Batch 2 — pure helpers for Find&Replace, line tools, repeat, slug, extract,
   readability. All framework-free; verified by direct import.
   ════════════════════════════════════════════════════════════════════════════ */

const escRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escHtml = (s: string) =>
  s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

/* ── Find & Replace ───────────────────────────────────────────────────────── */

export interface FindReplaceOpts {
  regex?: boolean;
  caseInsensitive?: boolean;
  wholeWord?: boolean;
}

/** Build the search RegExp, or null if the input is empty / an invalid pattern. */
export function buildFindRegex(find: string, opts: FindReplaceOpts): RegExp | null {
  if (!find) return null;
  let pattern = opts.regex ? find : escRegex(find);
  if (opts.wholeWord) pattern = `\\b(?:${pattern})\\b`;
  try {
    return new RegExp(pattern, "g" + (opts.caseInsensitive ? "i" : ""));
  } catch {
    return null;
  }
}

/** Replace all matches; returns the new text and the match count. */
export function findReplace(text: string, find: string, replace: string, opts: FindReplaceOpts): { result: string; count: number } {
  const re = buildFindRegex(find, opts);
  if (!re) return { result: text, count: 0 };
  const count = (text.match(re) || []).length;
  // In regex mode `$1` etc. expand; in plain mode `$` must stay literal.
  const repl = opts.regex ? replace : replace.replace(/\$/g, "$$$$");
  return { result: text.replace(re, repl), count };
}

/** HTML-escaped copy of `text` with matches wrapped in `<mark>`. */
export function highlightMatches(text: string, find: string, opts: FindReplaceOpts): string {
  const re = buildFindRegex(find, opts);
  if (!re) return escHtml(text);
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    out += escHtml(text.slice(last, m.index)) + `<mark>${escHtml(m[0]) || "∅"}</mark>`;
    last = m.index + m[0].length;
    if (m[0] === "") re.lastIndex++; // avoid an infinite loop on zero-width matches
  }
  return out + escHtml(text.slice(last));
}

/* ── Line tools: sort + dedupe ────────────────────────────────────────────── */

export type SortMode = "none" | "az" | "za" | "lenAsc" | "lenDesc" | "numAsc" | "numDesc" | "reverse" | "shuffle";

export interface LineOpts {
  sort: SortMode;
  removeDuplicates: boolean;
  caseInsensitiveDupes: boolean;
  removeEmpty: boolean;
  trim: boolean;
}

export function sortLines(lines: string[], mode: SortMode): string[] {
  const a = [...lines];
  const num = (s: string) => {
    const n = parseFloat(s);
    return Number.isNaN(n) ? 0 : n;
  };
  switch (mode) {
    case "az": return a.sort((x, y) => x.localeCompare(y, undefined, { numeric: true, sensitivity: "base" }));
    case "za": return a.sort((x, y) => y.localeCompare(x, undefined, { numeric: true, sensitivity: "base" }));
    case "lenAsc": return a.sort((x, y) => x.length - y.length);
    case "lenDesc": return a.sort((x, y) => y.length - x.length);
    case "numAsc": return a.sort((x, y) => num(x) - num(y));
    case "numDesc": return a.sort((x, y) => num(y) - num(x));
    case "reverse": return a.reverse();
    case "shuffle":
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    default:
      return a;
  }
}

export function processLines(text: string, opts: LineOpts): { result: string; before: number; after: number } {
  let lines = text.split(/\r?\n/);
  const before = lines.length;
  if (opts.trim) lines = lines.map((l) => l.trim());
  if (opts.removeEmpty) lines = lines.filter((l) => l.trim() !== "");
  if (opts.removeDuplicates) {
    const seen = new Set<string>();
    lines = lines.filter((l) => {
      const key = opts.caseInsensitiveDupes ? l.toLowerCase() : l;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  lines = sortLines(lines, opts.sort);
  return { result: lines.join("\n"), before, after: lines.length };
}

/* ── Repeat ───────────────────────────────────────────────────────────────── */

export function repeatText(text: string, count: number, separator: string, numbered = false): string {
  const n = Math.max(0, Math.min(100000, Math.floor(count) || 0));
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(numbered ? `${i + 1}. ${text}` : text);
  return out.join(separator);
}

/* ── Slugify ──────────────────────────────────────────────────────────────── */

export interface SlugOpts {
  separator?: string;
  lower?: boolean;
  stripAccents?: boolean;
  maxLength?: number;
}

export function slugify(text: string, opts: SlugOpts = {}): string {
  const sep = opts.separator ?? "-";
  const e = escRegex(sep);
  let s = text;
  if (opts.stripAccents ?? true) s = s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  if (opts.lower ?? true) s = s.toLowerCase();
  s = s
    .replace(/[^a-zA-Z0-9]+/g, sep)
    .replace(new RegExp(`${e}{2,}`, "g"), sep)
    .replace(new RegExp(`^${e}+|${e}+$`, "g"), "");
  if (opts.maxLength && opts.maxLength > 0) {
    s = s.slice(0, opts.maxLength).replace(new RegExp(`${e}+$`), "");
  }
  return s;
}

/* ── Extract ──────────────────────────────────────────────────────────────── */

export type ExtractKind = "emails" | "urls" | "phones" | "hashtags" | "mentions" | "numbers" | "ips";

const EXTRACT_PATTERNS: Record<ExtractKind, RegExp> = {
  emails: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  urls: /\bhttps?:\/\/[^\s<>"'`)]+/g,
  phones: /(?:\+?\d[\d ().-]{6,}\d)/g,
  hashtags: /#[A-Za-z0-9_]+/g,
  mentions: /@[A-Za-z0-9_]+/g,
  numbers: /-?\d+(?:\.\d+)?/g,
  ips: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
};

export function extractFrom(text: string, kind: ExtractKind, dedupe = true): string[] {
  const matches = text.match(EXTRACT_PATTERNS[kind]) || [];
  return dedupe ? [...new Set(matches)] : matches;
}

/* ── Readability + keyword density ────────────────────────────────────────── */

/** Rough English syllable count — good enough for readability scoring. */
export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

export interface Readability {
  words: number;
  sentences: number;
  syllables: number;
  fleschEase: number;
  grade: number;
  readingSec: number;
  speakingSec: number;
  complexWordPct: number;
}

export function readability(text: string): Readability {
  const words = text.match(/[A-Za-z0-9]+/g) || [];
  const wc = words.length;
  const sentences = Math.max(text.trim() ? 1 : 0, (text.match(/[.!?]+(?:\s|$)/g) || []).length);
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
  const wps = wc / Math.max(1, sentences);
  const spw = syllables / Math.max(1, wc);
  const ease = wc ? Math.max(0, Math.min(100, 206.835 - 1.015 * wps - 84.6 * spw)) : 0;
  const grade = wc ? Math.max(0, 0.39 * wps + 11.8 * spw - 15.59) : 0;
  const complex = words.filter((w) => countSyllables(w) >= 3).length;
  return {
    words: wc,
    sentences: sentences || 0,
    syllables,
    fleschEase: Math.round(ease),
    grade: Math.round(grade * 10) / 10,
    readingSec: Math.round((wc / 200) * 60),
    speakingSec: Math.round((wc / 130) * 60),
    complexWordPct: wc ? Math.round((complex / wc) * 100) : 0,
  };
}

const STOP_WORDS = new Set(
  "the a an and or but of to in on at for with is are was were be been being it its this that these those as by from up down out over under again then once he she they we you i me my your his her their our not no nor so if then than too very can will just don't".split(
    /\s+/,
  ),
);

export interface KeywordCount {
  word: string;
  count: number;
  pct: number;
}

export function keywordDensity(text: string, top = 12, minLen = 3): KeywordCount[] {
  const words = (text.toLowerCase().match(/[a-z0-9']+/g) || []).filter((w) => w.length >= minLen && !STOP_WORDS.has(w));
  const total = words.length;
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([word, count]) => ({ word, count, pct: total ? Math.round((count / total) * 1000) / 10 : 0 }));
}
