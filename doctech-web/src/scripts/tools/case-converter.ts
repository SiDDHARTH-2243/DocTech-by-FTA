// Case Converter — client-side.
import {
  toTitleCase,
  toSentenceCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toAlternating,
} from "../lib/text";
import { copyText } from "../lib/ui";

const input = document.getElementById("cc-input") as HTMLTextAreaElement | null;
const output = document.getElementById("cc-output") as HTMLTextAreaElement | null;
const modesWrap = document.getElementById("cc-modes");
const copyBtn = document.getElementById("cc-copy");

if (input && output && modesWrap && copyBtn) {
  const transforms: Record<string, (s: string) => string> = {
    upper: (s) => s.toUpperCase(),
    lower: (s) => s.toLowerCase(),
    title: toTitleCase,
    sentence: toSentenceCase,
    camel: toCamelCase,
    snake: toSnakeCase,
    kebab: toKebabCase,
    alt: toAlternating,
  };

  let mode = "title";

  function render() {
    output!.value = (transforms[mode] || ((s: string) => s))(input!.value);
    modesWrap!.querySelectorAll<HTMLButtonElement>(".cc-mode").forEach((b) => {
      const active = b.dataset.mode === mode;
      b.classList.toggle("bg-orange-50", active);
      b.classList.toggle("border-orange-400", active);
      b.classList.toggle("text-orange-600", active);
      b.classList.toggle("dark:bg-orange-500/10", active);
    });
  }

  modesWrap.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest(".cc-mode") as HTMLElement | null;
    if (!btn) return;
    mode = btn.dataset.mode!;
    render();
  });
  input.addEventListener("input", render);
  copyBtn.addEventListener("click", () => copyText(output!.value));

  render();
}
