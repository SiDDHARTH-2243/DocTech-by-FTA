// Tweet / X Character Counter — client-side. X weighted counting (URLs = 23,
// CJK / emoji = 2) plus Threads + Bluesky limits.

const text = document.getElementById("tc-text") as HTMLTextAreaElement | null;
const xEl = document.getElementById("tc-x");
const xRem = document.getElementById("tc-x-rem");
const xCard = document.getElementById("tc-x-card");
const threadsEl = document.getElementById("tc-threads");
const bskyEl = document.getElementById("tc-bsky");
const charsEl = document.getElementById("tc-chars");
const wordsEl = document.getElementById("tc-words");

if (text && xEl && xRem && xCard && threadsEl && bskyEl && charsEl && wordsEl) {
  const URL_RE = /https?:\/\/[^\s]+|(?:^|\s)(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/gi;

  function weight2(cp: number): boolean {
    return (
      cp > 0xffff || // emoji / astral
      (cp >= 0x1100 && cp <= 0x115f) || // Hangul Jamo
      (cp >= 0x2e80 && cp <= 0x303e) || // CJK radicals / punctuation
      (cp >= 0x3041 && cp <= 0x33ff) || // Hiragana, Katakana, CJK symbols
      (cp >= 0x3400 && cp <= 0x4dbf) || // CJK ext A
      (cp >= 0x4e00 && cp <= 0x9fff) || // CJK unified
      (cp >= 0xa000 && cp <= 0xa4cf) || // Yi
      (cp >= 0xac00 && cp <= 0xd7a3) || // Hangul syllables
      (cp >= 0xf900 && cp <= 0xfaff) || // CJK compat
      (cp >= 0xff00 && cp <= 0xff60) || // full-width forms
      (cp >= 0xffe0 && cp <= 0xffe6)
    );
  }

  function xWeighted(s: string): number {
    let count = 0;
    const rest = s.replace(URL_RE, (m) => { count += 23; return " ".repeat(Math.max(0, m.length - m.trimStart().length)); });
    for (const ch of rest) count += weight2(ch.codePointAt(0)!) ? 2 : 1;
    return count;
  }

  function render() {
    const s = text!.value;
    const x = xWeighted(s);
    const chars = [...s].length;
    const words = s.trim() ? s.trim().split(/\s+/).length : 0;

    xEl!.textContent = String(x);
    const rem = 280 - x;
    xRem!.textContent = rem >= 0 ? `${rem} left` : `${-rem} over`;
    const over = x > 280;
    xEl!.classList.toggle("text-red-500", over);
    xCard!.classList.toggle("border-red-400", over);
    xCard!.classList.toggle("dark:border-red-500/50", over);
    xRem!.classList.toggle("text-red-500", over);
    xRem!.classList.toggle("text-slate-400", !over);

    threadsEl!.textContent = String(chars);
    threadsEl!.classList.toggle("text-red-500", chars > 500);
    bskyEl!.textContent = String(chars);
    bskyEl!.classList.toggle("text-red-500", chars > 300);
    charsEl!.textContent = String(chars);
    wordsEl!.textContent = String(words);
  }

  text.addEventListener("input", render);
  render();
}
