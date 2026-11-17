// HTML Entity Encoder & Decoder — escape text for markup or read entities back,
// with a rendered preview and a click-to-insert reference table.
import { decodeEntities, encodeEntities } from "../lib/code";
import { initPane } from "../lib/codepane";
import { toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const inPane = initPane("ent-in", {
  sample: '<p class="promo">Tom & Jerry — 50% off "today" only… © 2026</p>',
  debounce: 120,
});
const outPane = initPane("ent-out", { downloadName: "encoded.html", downloadMime: "text/html" });
const level = $<HTMLSelectElement>("ent-level");
const modeBtns = [...document.querySelectorAll<HTMLButtonElement>(".ent-mode")];

if (inPane && outPane && level && modeBtns.length) {
  let mode: "encode" | "decode" = "encode";
  const preview = $("ent-preview");
  const levelWrap = $("ent-levelwrap");

  function paintTabs() {
    for (const b of modeBtns) {
      const active = b.dataset.mode === mode;
      b.setAttribute("aria-pressed", String(active));
      b.classList.toggle("bg-orange-500", active);
      b.classList.toggle("text-white", active);
      b.classList.toggle("text-slate-500", !active);
      b.classList.toggle("dark:text-slate-400", !active);
    }
    // The encoding level only means something when encoding.
    levelWrap?.classList.toggle("opacity-40", mode === "decode");
    levelWrap?.classList.toggle("pointer-events-none", mode === "decode");
    outPane!.setDownloadName(mode === "encode" ? "encoded.html" : "decoded.txt");
  }

  function run() {
    const src = inPane!.get();
    if (!src) {
      outPane!.set("");
      if (preview) preview.textContent = "";
      return;
    }

    const out =
      mode === "encode"
        ? encodeEntities(src, level!.value as "minimal" | "named" | "all")
        : decodeEntities(src);
    outPane!.set(out);

    // Preview shows what the output *means* as text. Assigning to textContent
    // (never innerHTML) keeps this safe — we're displaying, not executing.
    if (preview) preview.textContent = mode === "encode" ? decodeEntities(out) : out;
  }

  for (const b of modeBtns) {
    b.addEventListener("click", () => {
      mode = b.dataset.mode as "encode" | "decode";
      paintTabs();
      run();
    });
  }

  $("ent-swap")?.addEventListener("click", () => {
    const out = outPane!.get();
    if (!out) return;
    mode = mode === "encode" ? "decode" : "encode";
    paintTabs();
    inPane!.set(out);
    run();
  });

  inPane.onInput(run);
  level.addEventListener("change", run);

  // Reference table: insert whichever form is useful for the current direction —
  // the character when encoding, the entity when decoding. Inserting the entity
  // while encoding would just double-encode it to &amp;mdash;.
  document.querySelectorAll<HTMLButtonElement>(".ent-ref").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ent = mode === "encode" ? btn.dataset.char! : btn.dataset.entity!;
      const ta = inPane!.el as HTMLTextAreaElement;
      const at = ta.selectionStart ?? ta.value.length;
      ta.value = ta.value.slice(0, at) + ent + ta.value.slice(ta.selectionEnd ?? at);
      ta.selectionStart = ta.selectionEnd = at + ent.length;
      ta.dispatchEvent(new Event("input"));
      inPane!.refresh();
      run();
      toast(`Inserted ${ent}`, "ok");
    });
  });

  paintTabs();
  run();
}
