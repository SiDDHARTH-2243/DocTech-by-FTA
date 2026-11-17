// Text Repeater — repeat text N times with a separator + optional numbering.
import { repeatText } from "../lib/text";
import { byteLength, fmtBytes } from "../lib/code";
import { copyFlash, toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const input = $<HTMLTextAreaElement>("tr-in");
const output = $<HTMLTextAreaElement>("tr-out");

if (input && output) {
  const countEl = $<HTMLInputElement>("tr-count")!;
  const sepEl = $<HTMLSelectElement>("tr-sep")!;
  const customWrap = $("tr-custom-wrap")!;
  const customEl = $<HTMLInputElement>("tr-custom")!;
  const numEl = $<HTMLInputElement>("tr-num")!;
  const statsEl = $("tr-stats")!;

  function separator(): string {
    if (sepEl.value === "custom") return customEl.value;
    if (sepEl.value === "\\n") return "\n";
    return sepEl.value;
  }

  function run() {
    customWrap.classList.toggle("hidden", sepEl.value !== "custom");
    const count = Math.max(1, Math.min(100000, Number(countEl.value) || 0));
    const out = repeatText(input!.value, count, separator(), numEl.checked);
    output!.value = out;
    statsEl.textContent = `${count.toLocaleString()}× · ${fmtBytes(byteLength(out))}`;
  }

  input.addEventListener("input", run);
  [countEl, customEl].forEach((el) => el.addEventListener("input", run));
  [sepEl, numEl].forEach((el) => el.addEventListener("change", run));

  $("tr-copy")?.addEventListener("click", (e) => {
    if (output.value) copyFlash(e.currentTarget as HTMLElement, output.value);
  });
  $("tr-download")?.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([output.value], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "repeated.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Downloaded repeated.txt", "ok");
  });

  input.value = "DocTech";
  run();
}
