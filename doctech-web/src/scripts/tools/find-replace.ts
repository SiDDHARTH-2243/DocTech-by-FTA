// Find & Replace — pure logic from lib/text.ts; live result + highlighted preview.
import { buildFindRegex, findReplace, highlightMatches, type FindReplaceOpts } from "../lib/text";
import { copyFlash, toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const input = $<HTMLTextAreaElement>("fr-in");
const output = $<HTMLTextAreaElement>("fr-out");
const findEl = $<HTMLInputElement>("fr-find");
const replaceEl = $<HTMLInputElement>("fr-replace");

if (input && output && findEl && replaceEl) {
  const regexEl = $<HTMLInputElement>("fr-regex")!;
  const ciEl = $<HTMLInputElement>("fr-ci")!;
  const wordEl = $<HTMLInputElement>("fr-word")!;
  const hlEl = $<HTMLInputElement>("fr-highlight")!;
  const countEl = $("fr-count")!;
  const preview = $("fr-preview")!;

  const SAMPLE = "The quick brown fox jumps over the lazy dog.\nThe dog was not amused. The Fox ran off.";

  const opts = (): FindReplaceOpts => ({ regex: regexEl.checked, caseInsensitive: ciEl.checked, wholeWord: wordEl.checked });

  function run() {
    const text = input!.value;
    const find = findEl!.value;
    const o = opts();

    // Invalid regex → flag the field, leave output as the source.
    if (find && o.regex && !buildFindRegex(find, o)) {
      findEl!.classList.add("!border-red-400");
      countEl.textContent = "bad regex";
      output!.value = text;
      preview.classList.add("hidden");
      return;
    }
    findEl!.classList.remove("!border-red-400");

    const { result, count } = findReplace(text, find, replaceEl!.value, o);
    output!.value = result;
    countEl.textContent = `${count} match${count === 1 ? "" : "es"}`;

    if (hlEl.checked && find) {
      preview.innerHTML = highlightMatches(text, find, o);
      preview.classList.remove("hidden");
    } else {
      preview.classList.add("hidden");
    }
  }

  [input, findEl, replaceEl].forEach((el) => el.addEventListener("input", run));
  [regexEl, ciEl, wordEl, hlEl].forEach((el) => el.addEventListener("change", run));

  $("fr-copy")?.addEventListener("click", (e) => {
    if (!output.value) return;
    copyFlash(e.currentTarget as HTMLElement, output.value);
  });
  $("fr-download")?.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([output.value], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "result.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Downloaded result.txt", "ok");
  });

  input.value = SAMPLE;
  findEl.value = "the";
  replaceEl.value = "a";
  run();
}
