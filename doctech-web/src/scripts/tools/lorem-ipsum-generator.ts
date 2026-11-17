// Lorem Ipsum Generator — client-side.
import { loremIpsum } from "../lib/text";
import { copyText } from "../lib/ui";

const paras = document.getElementById("li-paras") as HTMLInputElement | null;
const sentences = document.getElementById("li-sentences") as HTMLInputElement | null;
const startLorem = document.getElementById("li-startlorem") as HTMLInputElement | null;
const html = document.getElementById("li-html") as HTMLInputElement | null;
const generate = document.getElementById("li-generate");
const output = document.getElementById("li-output") as HTMLTextAreaElement | null;
const copyBtn = document.getElementById("li-copy");

if (paras && sentences && startLorem && html && generate && output && copyBtn) {
  function run() {
    output!.value = loremIpsum({
      paragraphs: Math.max(1, parseInt(paras!.value) || 1),
      sentencesPerPara: Math.max(1, parseInt(sentences!.value) || 4),
      startWithLorem: startLorem!.checked,
      htmlWrap: html!.checked,
    });
  }

  generate.addEventListener("click", run);
  copyBtn.addEventListener("click", () => copyText(output!.value));
  run();
}
