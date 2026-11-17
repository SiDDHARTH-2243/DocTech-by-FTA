// Hash Generator — SHA-1/256/384/512 via the Web Crypto SubtleCrypto API.
import { copyText, toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const input = $<HTMLTextAreaElement>("hash-input");
const ALGOS: [string, string, string][] = [
  ["SHA-1", "hash-sha1", "SHA-1"],
  ["SHA-256", "hash-sha256", "SHA-256"],
  ["SHA-384", "hash-sha384", "SHA-384"],
  ["SHA-512", "hash-sha512", "SHA-512"],
];

if (input) {
  const enc = new TextEncoder();

  function toHex(buf: ArrayBuffer): string {
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function compute() {
    const data = enc.encode(input!.value);
    for (const [, id, algo] of ALGOS) {
      const el = document.getElementById(id);
      if (!el) continue;
      try {
        const digest = await crypto.subtle.digest(algo, data);
        el.textContent = toHex(digest);
      } catch {
        el.textContent = "—";
      }
    }
  }

  input.addEventListener("input", compute);

  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.copy!);
      const v = target?.textContent || "";
      if (v && v !== "—") copyText(v).then(() => toast("Hash copied", "ok"));
    });
  });

  compute();
}
