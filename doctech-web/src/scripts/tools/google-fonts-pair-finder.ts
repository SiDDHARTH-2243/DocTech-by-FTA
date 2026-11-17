// Google Fonts Pair Finder — hybrid online/offline. Client-side.
import { copyText } from "../lib/ui";

const generateBtn = document.getElementById("gf-generate");
const swapBtn = document.getElementById("gf-swap");
const copyBtn = document.getElementById("gf-copy");
const offlineBadge = document.getElementById("gf-offline");
const hName = document.getElementById("gf-h-name");
const bName = document.getElementById("gf-b-name");
const hSample = document.getElementById("gf-h-sample");
const bSample = document.getElementById("gf-b-sample");
const hLock = document.getElementById("gf-h-lock");
const bLock = document.getElementById("gf-b-lock");

// Curated popular Google Fonts (loaded only when online).
const GOOGLE_FONTS = [
  "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Raleway", "Inter", "Nunito",
  "Playfair Display", "Merriweather", "Lora", "PT Serif", "Bitter", "Source Serif 4",
  "Oswald", "Bebas Neue", "Anton", "Archivo", "Work Sans", "Rubik", "Karla", "Mukta",
  "DM Sans", "DM Serif Display", "Josefin Sans", "Quicksand", "Cormorant Garamond",
  "Libre Baskerville", "Space Grotesk", "Manrope", "Fraunces", "Crimson Text",
  "Abril Fatface", "Comfortaa", "Asap", "Cabin",
];

// Always-available system fonts (offline fallback).
const SYSTEM_FONTS = [
  "Georgia", "Times New Roman", "Garamond", "Palatino Linotype", "Arial", "Helvetica",
  "Verdana", "Trebuchet MS", "Tahoma", "Courier New",
];

if (generateBtn && swapBtn && copyBtn && offlineBadge && hName && bName && hSample && bSample && hLock && bLock) {
  let pool: string[] = SYSTEM_FONTS;
  let usingGoogle = false;
  const state = {
    heading: { font: "Playfair Display", locked: false },
    body: { font: "Roboto", locked: false },
  };

  function loadGoogle() {
    if (document.getElementById("gf-google-link")) return;
    const families = GOOGLE_FONTS.map((f) => `family=${f.replace(/ /g, "+")}`).join("&");
    const link = document.createElement("link");
    link.id = "gf-google-link";
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  }

  function refreshSource() {
    usingGoogle = navigator.onLine;
    offlineBadge!.classList.toggle("hidden", usingGoogle);
    if (usingGoogle) {
      loadGoogle();
      pool = GOOGLE_FONTS;
    } else {
      pool = SYSTEM_FONTS;
    }
  }

  const pick = (exclude: string) => {
    let f = exclude;
    while (f === exclude) f = pool[Math.floor(Math.random() * pool.length)];
    return f;
  };

  function generate() {
    if (!state.heading.locked) state.heading.font = pick(state.body.font);
    if (!state.body.locked) state.body.font = pick(state.heading.font);
    render();
  }

  function fontStack(name: string): string {
    const serifish = /serif|playfair|merriweather|lora|bitter|garamond|baskerville|georgia|times|fraunces|crimson|cormorant|abril|dm serif/i;
    return `"${name}", ${serifish.test(name) ? "serif" : "sans-serif"}`;
  }

  function render() {
    hSample!.style.fontFamily = fontStack(state.heading.font);
    bSample!.style.fontFamily = fontStack(state.body.font);
    hName!.textContent = state.heading.font;
    bName!.textContent = state.body.font;
    hLock!.textContent = state.heading.locked ? "🔒" : "🔓";
    bLock!.textContent = state.body.locked ? "🔒" : "🔓";
  }

  generateBtn.addEventListener("click", generate);
  swapBtn.addEventListener("click", () => {
    [state.heading.font, state.body.font] = [state.body.font, state.heading.font];
    render();
  });
  [hLock, bLock].forEach((btn) =>
    btn.addEventListener("click", () => {
      const slot = (btn as HTMLElement).dataset.slot as "heading" | "body";
      state[slot].locked = !state[slot].locked;
      render();
    }),
  );
  copyBtn.addEventListener("click", () => {
    const fams = [state.heading.font, state.body.font]
      .map((f) => `family=${f.replace(/ /g, "+")}`)
      .join("&");
    const snippet = usingGoogle
      ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fams}&display=swap">\n` +
        `h1, h2, h3 { font-family: ${fontStack(state.heading.font)}; }\n` +
        `body { font-family: ${fontStack(state.body.font)}; }`
      : `h1, h2, h3 { font-family: ${fontStack(state.heading.font)}; }\n` +
        `body { font-family: ${fontStack(state.body.font)}; }`;
    copyText(snippet);
  });

  window.addEventListener("online", refreshSource);
  window.addEventListener("offline", refreshSource);

  refreshSource();
  generate();
}
