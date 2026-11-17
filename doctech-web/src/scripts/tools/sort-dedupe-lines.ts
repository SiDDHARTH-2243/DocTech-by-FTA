// Sort & Dedupe Lines — pure line processing from lib/text.ts.
import { processLines, type SortMode } from "../lib/text";
import { copyFlash, toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const input = $<HTMLTextAreaElement>("sd-in");
const output = $<HTMLTextAreaElement>("sd-out");

if (input && output) {
  const sortEl = $<HTMLSelectElement>("sd-sort")!;
  const dupesEl = $<HTMLInputElement>("sd-dupes")!;
  const ciEl = $<HTMLInputElement>("sd-ci")!;
  const emptyEl = $<HTMLInputElement>("sd-empty")!;
  const trimEl = $<HTMLInputElement>("sd-trim")!;
  const statsEl = $("sd-stats")!;

  const SAMPLE = "Banana\napple\nCherry\napple\n\n  Date  \nbanana\nElderberry\n42\n7\n100";

  function run() {
    const { result, before, after } = processLines(input!.value, {
      sort: sortEl.value as SortMode,
      removeDuplicates: dupesEl.checked,
      caseInsensitiveDupes: ciEl.checked,
      removeEmpty: emptyEl.checked,
      trim: trimEl.checked,
    });
    output!.value = result;
    const removed = before - after;
    statsEl.textContent = `${before} → ${after} lines${removed > 0 ? ` · ${removed} removed` : ""}`;
  }

  input.addEventListener("input", run);
  [sortEl, dupesEl, ciEl, emptyEl, trimEl].forEach((el) => el.addEventListener("change", run));
  // Re-shuffle on each click even if nothing else changed.
  sortEl.addEventListener("click", () => sortEl.value === "shuffle" && run());

  $("sd-copy")?.addEventListener("click", (e) => {
    if (output.value) copyFlash(e.currentTarget as HTMLElement, output.value);
  });
  $("sd-download")?.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([output.value], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "lines.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Downloaded lines.txt", "ok");
  });

  input.value = SAMPLE;
  run();
}
