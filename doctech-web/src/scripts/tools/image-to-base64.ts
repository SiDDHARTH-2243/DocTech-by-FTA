// Image to Base64 — client-side. Encodes a file as a data URI + CSS/HTML snippets.
import { fmtSize } from "../lib/image";
import { setupDropzone, toast, copyText } from "../lib/ui";

const drop = document.getElementById("b64-drop");
const input = document.getElementById("b64-input") as HTMLInputElement | null;
const work = document.getElementById("b64-work");
const preview = document.getElementById("b64-preview") as HTMLImageElement | null;
const resetBtn = document.getElementById("b64-reset");

if (drop && input && work && preview && resetBtn) {
  function load(file: File) {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "err"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      preview!.src = dataUri;
      document.getElementById("b64-out")!.textContent = dataUri;
      document.getElementById("b64-css")!.textContent = `background-image: url("${dataUri}");`;
      document.getElementById("b64-img")!.textContent = `<img src="${dataUri}" alt="" />`;
      document.getElementById("b64-fname")!.textContent = file.name;
      document.getElementById("b64-size")!.textContent = fmtSize(dataUri.length);
      drop!.classList.add("hidden"); work!.classList.remove("hidden"); resetBtn!.classList.remove("hidden");
    };
    reader.onerror = () => toast("Could not read that image", "err");
    reader.readAsDataURL(file);
  }

  setupDropzone(drop, input, (files) => files[0] && load(files[0]));
  document.getElementById("b64-copy-out")!.addEventListener("click", () => copyText(document.getElementById("b64-out")!.textContent || ""));
  document.getElementById("b64-copy-css")!.addEventListener("click", () => copyText(document.getElementById("b64-css")!.textContent || ""));
  document.getElementById("b64-copy-img")!.addEventListener("click", () => copyText(document.getElementById("b64-img")!.textContent || ""));
  resetBtn.addEventListener("click", () => {
    work!.classList.add("hidden"); resetBtn!.classList.add("hidden"); drop!.classList.remove("hidden"); input!.value = "";
  });
}
