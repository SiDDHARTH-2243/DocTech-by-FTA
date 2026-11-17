// Base64 Encoder & Decoder — Unicode-safe text conversion plus file → data URI.
import { b64Decode, b64Encode, bytesToB64, fmtBytes, readFileBytes } from "../lib/code";
import { initPane } from "../lib/codepane";
import { toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const inPane = initPane("b64-in", {
  sample: "DocTech by FTA — encode anything, even emoji 🎉 and accents (café).",
  debounce: 120,
});
const outPane = initPane("b64-out", { downloadName: "encoded.txt", showBytes: true });
const urlSafe = $<HTMLInputElement>("b64-urlsafe");
const wrapBox = $<HTMLInputElement>("b64-wrap");
const modeBtns = [...document.querySelectorAll<HTMLButtonElement>(".b64-mode")];

if (inPane && outPane && urlSafe && wrapBox && modeBtns.length) {
  let mode: "encode" | "decode" = "encode";

  const ON = ["bg-orange-500", "text-white"];
  const OFF = ["text-slate-500", "dark:text-slate-400"];

  function paintTabs() {
    for (const b of modeBtns) {
      const active = b.dataset.mode === mode;
      b.setAttribute("aria-pressed", String(active));
      b.classList.toggle(ON[0], active);
      b.classList.toggle(ON[1], active);
      b.classList.toggle(OFF[0], !active);
      b.classList.toggle(OFF[1], !active);
    }
    const inLabel = document.querySelector<HTMLLabelElement>('label[for="b64-in-ta"]');
    if (inLabel) inLabel.textContent = mode === "encode" ? "Plain text" : "Base64";
    const outLabel = document.querySelector<HTMLLabelElement>('label[for="b64-out-ta"]');
    if (outLabel) outLabel.textContent = mode === "encode" ? "Base64" : "Plain text";
    outPane!.setDownloadName(mode === "encode" ? "encoded.txt" : "decoded.txt");
    const ta = inPane!.el as HTMLTextAreaElement;
    ta.placeholder = mode === "encode" ? "Type or paste text…" : "Paste Base64…";
  }

  // The output pane's <label> targets the pre, not a textarea — patch both ids.
  function labelFor(paneId: string, text: string) {
    const el = document.querySelector<HTMLLabelElement>(`[data-pane="${paneId}"] label`);
    if (el) el.textContent = text;
  }

  function wrap76(s: string): string {
    return s.replace(/.{1,76}/g, "$&\n").trimEnd();
  }

  function run() {
    const src = inPane!.get();
    if (!src) {
      outPane!.set("");
      inPane!.clearStatus();
      outPane!.clearStatus();
      return;
    }

    if (mode === "encode") {
      const out = b64Encode(src, urlSafe!.checked);
      outPane!.set(wrapBox!.checked ? wrap76(out) : out);
      inPane!.clearStatus();
      outPane!.clearStatus();
    } else {
      try {
        outPane!.set(b64Decode(src));
        inPane!.setStatus("Valid Base64", "ok");
        outPane!.clearStatus();
      } catch (e) {
        outPane!.set("");
        const msg =
          e instanceof RangeError || (e as Error).name === "TypeError"
            ? "Decoded bytes aren't valid UTF-8 text — this looks like binary data."
            : "Not valid Base64 — check for stray characters.";
        inPane!.setStatus(msg, "err");
        outPane!.clearStatus();
      }
    }
  }

  for (const b of modeBtns) {
    b.addEventListener("click", () => {
      mode = b.dataset.mode as "encode" | "decode";
      paintTabs();
      labelFor("b64-in", mode === "encode" ? "Plain text" : "Base64");
      labelFor("b64-out", mode === "encode" ? "Base64" : "Plain text");
      run();
    });
  }

  // Swap sends the current output back through as input — the fast round-trip check.
  $("b64-swap")?.addEventListener("click", () => {
    const out = outPane!.get();
    if (!out) return;
    mode = mode === "encode" ? "decode" : "encode";
    paintTabs();
    labelFor("b64-in", mode === "encode" ? "Plain text" : "Base64");
    labelFor("b64-out", mode === "encode" ? "Base64" : "Plain text");
    inPane!.set(out);
    run();
  });

  inPane.onInput(run);
  urlSafe.addEventListener("change", run);
  wrapBox.addEventListener("change", run);

  /* ── File → data URI ──────────────────────────────────────────────────── */
  const fileIn = $<HTMLInputElement>("b64-filein");
  const info = $("b64-fileinfo");
  const outWrap = $("b64-fileout");
  const outText = $<HTMLTextAreaElement>("b64-file-text");
  let rawB64 = "";

  $("b64-pick")?.addEventListener("click", () => fileIn?.click());

  fileIn?.addEventListener("change", async () => {
    const f = fileIn.files?.[0];
    if (!f) return;
    try {
      const bytes = await readFileBytes(f);
      rawB64 = bytesToB64(bytes);
      const mime = f.type || "application/octet-stream";
      if (outText) outText.value = `data:${mime};base64,${rawB64}`;
      if (info) info.textContent = `${f.name} · ${fmtBytes(f.size)} · ${fmtBytes(rawB64.length)} encoded`;
      outWrap?.classList.remove("hidden");
    } catch {
      toast("Could not read that file", "err");
    }
    fileIn.value = "";
  });

  const copy = async (text: string, what: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast(`${what} copied`, "ok");
    } catch {
      toast("Copy failed — copy manually", "err");
    }
  };
  $("b64-file-copy")?.addEventListener("click", () => copy(outText?.value ?? "", "Data URI"));
  $("b64-file-raw")?.addEventListener("click", () => copy(rawB64, "Base64"));

  paintTabs();
  run();
}
