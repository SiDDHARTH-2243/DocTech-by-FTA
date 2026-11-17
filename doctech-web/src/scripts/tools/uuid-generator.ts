// UUID Generator — crypto.randomUUID with a manual fallback.
import { copyText, toast } from "../lib/ui";
import { downloadBlob } from "../lib/image";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const count = $<HTMLInputElement>("uuid-count");
const upper = $<HTMLInputElement>("uuid-upper");
const hyphens = $<HTMLInputElement>("uuid-hyphens");
const genBtn = $("uuid-generate");
const output = $<HTMLTextAreaElement>("uuid-output");
const label = $("uuid-count-label");
const copyBtn = $("uuid-copy");
const dlBtn = $("uuid-download");

if (count && output && genBtn) {
  function uuidv4(): string {
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const hex = [...b].map((x) => x.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
  }

  function generate() {
    const n = Math.min(1000, Math.max(1, parseInt(count!.value) || 1));
    const items = Array.from({ length: n }, () => {
      let id = uuidv4();
      if (!hyphens?.checked) id = id.replace(/-/g, "");
      if (upper?.checked) id = id.toUpperCase();
      return id;
    });
    output!.value = items.join("\n");
    if (label) label.textContent = String(n);
  }

  genBtn.addEventListener("click", generate);
  [upper, hyphens, count].forEach((el) => el?.addEventListener("input", generate));
  copyBtn?.addEventListener("click", () => {
    if (!output!.value) return toast("Generate some UUIDs first", "err");
    copyText(output!.value).then(() => toast("Copied", "ok"));
  });
  dlBtn?.addEventListener("click", () => {
    if (!output!.value) return toast("Generate some UUIDs first", "err");
    downloadBlob(new Blob([output!.value], { type: "text/plain" }), "uuids.txt");
  });

  generate();
}
