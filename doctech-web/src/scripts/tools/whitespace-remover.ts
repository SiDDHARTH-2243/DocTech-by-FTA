// Multiple Whitespace Remover — client-side.
import { cleanWhitespace } from "../lib/text";
import { copyText } from "../lib/ui";

const input = document.getElementById("ws-input") as HTMLTextAreaElement | null;
const output = document.getElementById("ws-output") as HTMLTextAreaElement | null;
const copyBtn = document.getElementById("ws-copy");
const opts = {
  collapseSpaces: document.getElementById("ws-collapse") as HTMLInputElement | null,
  trimLines: document.getElementById("ws-trim") as HTMLInputElement | null,
  removeEmptyLines: document.getElementById("ws-empty") as HTMLInputElement | null,
  removeLineBreaks: document.getElementById("ws-breaks") as HTMLInputElement | null,
  removeSpecial: document.getElementById("ws-special") as HTMLInputElement | null,
};

if (
  input &&
  output &&
  copyBtn &&
  opts.collapseSpaces &&
  opts.trimLines &&
  opts.removeEmptyLines &&
  opts.removeLineBreaks &&
  opts.removeSpecial
) {
  function render() {
    output!.value = cleanWhitespace(input!.value, {
      collapseSpaces: opts.collapseSpaces!.checked,
      trimLines: opts.trimLines!.checked,
      removeEmptyLines: opts.removeEmptyLines!.checked,
      removeLineBreaks: opts.removeLineBreaks!.checked,
      removeSpecial: opts.removeSpecial!.checked,
    });
  }

  input.addEventListener("input", render);
  Object.values(opts).forEach((cb) => cb!.addEventListener("change", render));
  copyBtn.addEventListener("click", () => copyText(output!.value));
  render();
}
