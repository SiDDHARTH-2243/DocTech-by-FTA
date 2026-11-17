// RGBA → HEX converter (6- or 8-digit). Client-side.
import { rgbaToHex } from "../lib/color";
import { copyText } from "../lib/ui";

const get = (id: string) => document.getElementById(id) as HTMLInputElement | null;
const swatch = document.getElementById("r2h-swatch");
const hexOut = document.getElementById("r2h-hex");
const rgbaOut = document.getElementById("r2h-rgba");
const copyBtn = document.getElementById("r2h-copy");
const alphaVal = document.getElementById("r2h-A-val");

const num = { R: get("r2h-R"), G: get("r2h-G"), B: get("r2h-B") };
const range = { R: get("r2h-R-range"), G: get("r2h-G-range"), B: get("r2h-B-range") };
const alpha = get("r2h-A");

if (num.R && num.G && num.B && range.R && range.G && range.B && alpha && swatch && hexOut && rgbaOut && copyBtn && alphaVal) {
  const clampByte = (v: string) => Math.min(255, Math.max(0, Math.round(Number(v) || 0)));

  function update() {
    const r = clampByte(num.R!.value);
    const g = clampByte(num.G!.value);
    const b = clampByte(num.B!.value);
    const a = Math.min(1, Math.max(0, Number(alpha!.value)));
    alphaVal!.textContent = String(a);
    swatch!.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
    hexOut!.textContent = rgbaToHex(r, g, b, a).toUpperCase();
    rgbaOut!.textContent = `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // Keep number + range inputs in sync per channel.
  (["R", "G", "B"] as const).forEach((ch) => {
    num[ch]!.addEventListener("input", () => {
      range[ch]!.value = num[ch]!.value;
      update();
    });
    range[ch]!.addEventListener("input", () => {
      num[ch]!.value = range[ch]!.value;
      update();
    });
  });
  alpha.addEventListener("input", update);
  copyBtn.addEventListener("click", () => copyText(hexOut!.textContent || ""));

  update();
}
