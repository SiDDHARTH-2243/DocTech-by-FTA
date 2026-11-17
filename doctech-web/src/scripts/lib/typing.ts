// Corpus + generators + pure stats math for the Typing Speed Test.
//
// Everything here is deterministic given its inputs (aside from the RNG hooks)
// and DOM-free, so the engine can unit-drive it and call the math on every
// keystroke without side effects.

/* ── Corpus ──────────────────────────────────────────────────────────────── */

// The 200 most common English words — the standard "words" mode vocabulary,
// the same shape 10fastfingers / Monkeytype default lists use.
export const COMMON_WORDS: string[] = [
  "the", "of", "to", "and", "a", "in", "is", "it", "you", "that",
  "he", "was", "for", "on", "are", "with", "as", "I", "his", "they",
  "be", "at", "one", "have", "this", "from", "or", "had", "by", "hot",
  "word", "but", "what", "some", "we", "can", "out", "other", "were", "all",
  "there", "when", "up", "use", "your", "how", "said", "an", "each", "she",
  "which", "do", "their", "time", "if", "will", "way", "about", "many", "then",
  "them", "write", "would", "like", "so", "these", "her", "long", "make", "thing",
  "see", "him", "two", "has", "look", "more", "day", "could", "go", "come",
  "did", "number", "sound", "no", "most", "people", "my", "over", "know", "water",
  "than", "call", "first", "who", "may", "down", "side", "been", "now", "find",
  "any", "new", "work", "part", "take", "get", "place", "made", "live", "where",
  "after", "back", "little", "only", "round", "man", "year", "came", "show", "every",
  "good", "me", "give", "our", "under", "name", "very", "through", "just", "form",
  "sentence", "great", "think", "say", "help", "low", "line", "differ", "turn", "cause",
  "much", "mean", "before", "move", "right", "boy", "old", "too", "same", "tell",
  "does", "set", "three", "want", "air", "well", "also", "play", "small", "end",
  "put", "home", "read", "hand", "port", "large", "spell", "add", "even", "land",
  "here", "must", "big", "high", "such", "follow", "act", "why", "ask", "men",
  "change", "went", "light", "kind", "off", "need", "house", "picture", "try", "us",
  "again", "animal", "point", "mother", "world", "near", "build", "self", "earth", "father",
];

export interface Quote {
  text: string;
  author: string;
}

// Famous quotes for the quote-flavoured passages — punctuation and casing intact
// so accuracy actually matters.
export const QUOTES: Quote[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "That which does not kill us makes us stronger.", author: "Friedrich Nietzsche" },
  { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
  { text: "Whether you think you can or you think you cannot, you are right.", author: "Henry Ford" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Do not watch the clock; do what it does, keep going.", author: "Sam Levenson" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "The people who are crazy enough to think they can change the world are the ones who do.", author: "Rob Siltanen" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Everything you can imagine is real.", author: "Pablo Picasso" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "A room without books is like a body without a soul.", author: "Cicero" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
  { text: "What we think, we become.", author: "Buddha" },
  { text: "Life is what happens when you are busy making other plans.", author: "John Lennon" },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
  { text: "Believe you can and you are halfway there.", author: "Theodore Roosevelt" },
];

// Prose paragraphs for a "flow" feel — natural sentences with real punctuation.
export const PROSE: string[] = [
  "The morning sun spilled across the quiet valley, catching the dew on every blade of grass. Somewhere in the distance a river murmured, patient and unhurried, as it had for a thousand years. There was no rush here, only the slow turning of an ordinary day into something worth remembering.",
  "She opened the old book and the smell of paper carried her back at once. Each page was a small door, and behind every door was a voice that had waited years to be heard again. Reading, she thought, was simply the art of listening to people who were not in the room.",
  "Good software feels invisible. You reach for a button and it is exactly where your hand expected it to be. The best tools do not ask for your attention; they quietly return it, letting you finish the thought you started before the screen ever lit up.",
  "The city never truly sleeps, but near dawn it comes close. Streetlights hum over empty crossings, and the first train rattles through with only a handful of passengers, each lost in a private quiet. In an hour the crowds will return, but for now the whole place belongs to the dreamers.",
];

/* ── Word generation ─────────────────────────────────────────────────────── */

export interface GenOptions {
  punctuation?: boolean;
  numbers?: boolean;
  /** Injectable RNG for tests; defaults to Math.random. */
  rng?: () => number;
}

const pick = <T>(arr: T[], rng: () => number): T => arr[Math.floor(rng() * arr.length)];

/**
 * Build `count` space-separated tokens from the common-word list, optionally
 * salted with numbers and sentence punctuation (capitalisation, commas, terminal
 * marks, the occasional quote or parenthetical). The result is an array of
 * "words" — the engine joins them with single spaces.
 */
export function generateWords(count: number, opts: GenOptions = {}): string[] {
  const rng = opts.rng ?? Math.random;
  const out: string[] = [];
  let sentenceStart = true; // capitalise the next word

  for (let i = 0; i < count; i++) {
    let w: string;

    // ~12% of tokens become a number when numbers are on.
    if (opts.numbers && rng() < 0.12) {
      const digits = 1 + Math.floor(rng() * 4);
      w = String(Math.floor(rng() * 10 ** digits));
    } else {
      w = pick(COMMON_WORDS, rng);
    }

    if (opts.punctuation) {
      if (sentenceStart) {
        w = w.charAt(0).toUpperCase() + w.slice(1);
        sentenceStart = false;
      }
      const roll = rng();
      const isLast = i === count - 1;
      // Terminal punctuation ends a sentence (never on the very last token, which
      // gets a period below regardless).
      if (!isLast && roll < 0.09) {
        w += pick([".", ".", ".", "!", "?"], rng);
        sentenceStart = true;
      } else if (roll < 0.16) {
        w += ",";
      } else if (roll < 0.185) {
        w = `"${w}"`;
      } else if (roll < 0.2) {
        w = `(${w})`;
      }
    }

    out.push(w);
  }

  // Guarantee the passage closes on a full stop when punctuation is on.
  if (opts.punctuation && out.length) {
    const last = out[out.length - 1];
    if (!/[.!?]"?$/.test(last)) out[out.length - 1] = last.replace(/,$/, "") + ".";
  }

  return out;
}

/** Split a quote or prose string into word tokens (whitespace-separated). */
export function tokenize(text: string): string[] {
  return text.trim().split(/\s+/);
}

export function randomQuote(rng: () => number = Math.random): Quote {
  return pick(QUOTES, rng);
}
export function randomProse(rng: () => number = Math.random): string {
  return pick(PROSE, rng);
}

/* ── Stats math ──────────────────────────────────────────────────────────── */

export interface CharCounts {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  /** Spaces credited for completed words (word separators). */
  spaces: number;
}

/**
 * Walk the typed words against the targets and tally per-character outcomes.
 * `completedThrough` is the index of the last word the user has moved *past*
 * (so trailing untyped chars in those words count as "missed", while the current
 * word's untyped chars do not).
 *
 * This is the single source of truth for both the live readout and the final
 * results, so the number you watch climbing is the number you end on.
 */
export function computeChars(words: string[], typed: string[], completedThrough: number): CharCounts {
  let correct = 0, incorrect = 0, extra = 0, missed = 0, spaces = 0;
  const upto = Math.min(completedThrough, words.length - 1);

  for (let i = 0; i <= upto; i++) {
    const target = words[i] ?? "";
    const got = typed[i] ?? "";
    const span = Math.max(target.length, got.length);
    for (let p = 0; p < span; p++) {
      if (p < target.length && p < got.length) {
        got[p] === target[p] ? correct++ : incorrect++;
      } else if (p >= target.length) {
        extra++;
      } else if (i < completedThrough) {
        // Untyped tail of a word the user has already left behind.
        missed++;
      }
    }
    // Each completed word contributes one separating space to the char stream.
    if (i < completedThrough) spaces++;
  }

  return { correct, incorrect, extra, missed, spaces };
}

/** Words-per-minute from a character count: the universal (chars / 5) / minutes. */
export function wpm(chars: number, ms: number): number {
  if (ms <= 0) return 0;
  return (chars / 5) / (ms / 60000);
}

export function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

/** Population standard deviation. */
export function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

/**
 * Consistency as a percentage, from a series of per-second raw-WPM samples.
 * Defined as 100·(1 − coefficient of variation), the same measure Monkeytype
 * reports: steady typing → near 100, erratic bursts → lower.
 */
export function consistency(samples: number[]): number {
  const m = mean(samples);
  if (m <= 0) return 0;
  const cv = stdev(samples) / m;
  return Math.max(0, Math.min(100, (1 - cv) * 100));
}

export interface TestResult {
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  chars: CharCounts;
  timeMs: number;
  mode: string;
  date: number;
}

/* ── Best-score persistence ──────────────────────────────────────────────── */

const STORE_KEY = "doctech-typing-scores";
const MAX_STORED = 50;

export function loadScores(): TestResult[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as TestResult[]) : [];
  } catch {
    return [];
  }
}

export function saveScore(r: TestResult): TestResult[] {
  const all = [r, ...loadScores()].slice(0, MAX_STORED);
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  } catch {
    /* storage full or blocked — scores just won't persist */
  }
  return all;
}

/** Personal best WPM for a given mode label (accuracy ≥ 50 to count). */
export function bestFor(mode: string, scores = loadScores()): number {
  return scores
    .filter((s) => s.mode === mode && s.accuracy >= 50)
    .reduce((best, s) => Math.max(best, s.wpm), 0);
}
