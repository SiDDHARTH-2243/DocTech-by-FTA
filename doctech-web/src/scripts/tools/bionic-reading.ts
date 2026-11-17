// Bionic Reading Converter — client-side.
import { bionicHtml } from "../lib/text";
import { copyText } from "../lib/ui";

const input = document.getElementById("br-input") as HTMLTextAreaElement | null;
const fixation = document.getElementById("br-fixation") as HTMLInputElement | null;
const fixationVal = document.getElementById("br-fixation-val");
const output = document.getElementById("br-output");
const copyTextBtn = document.getElementById("br-copy-text");
const copyHtmlBtn = document.getElementById("br-copy-html");

if (input && fixation && fixationVal && output && copyTextBtn && copyHtmlBtn) {
  function render() {
    const f = parseInt(fixation!.value) / 100;
    fixationVal!.textContent = `${fixation!.value}%`;
    // Preserve line breaks in the preview.
    output!.innerHTML = bionicHtml(input!.value, f).replace(/\n/g, "<br>");
  }

  input.addEventListener("input", render);
  fixation.addEventListener("input", render);
  copyTextBtn.addEventListener("click", () => copyText(input!.value));
  copyHtmlBtn.addEventListener("click", () =>
    copyText(bionicHtml(input!.value, parseInt(fixation!.value) / 100)),
  );

  render();
}
