// Open Graph Meta Generator — client-side. Form → og:/twitter: meta tags + live
// share-card preview.
import { copyText } from "../lib/ui";

const ids = ["og-title", "og-desc", "og-url", "og-image", "og-site", "og-type", "og-tw-card", "og-tw-handle"];
const els = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)])) as Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>;
const code = document.getElementById("og-code");
const copy = document.getElementById("og-copy");
const prevImg = document.getElementById("og-prev-img");
const prevDomain = document.getElementById("og-prev-domain");
const prevTitle = document.getElementById("og-prev-title");
const prevDesc = document.getElementById("og-prev-desc");

if (code && copy && prevImg && prevDomain && prevTitle && prevDesc && ids.every((id) => els[id])) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const v = (id: string) => (els[id] as HTMLInputElement).value;

  function tag(prop: string, content: string, name = false): string {
    if (!content.trim()) return "";
    return `<meta ${name ? "name" : "property"}="${prop}" content="${esc(content)}">`;
  }

  function build(): string {
    const og = [
      tag("og:title", v("og-title")),
      tag("og:description", v("og-desc")),
      tag("og:url", v("og-url")),
      tag("og:image", v("og-image")),
      tag("og:type", v("og-type")),
      tag("og:site_name", v("og-site")),
    ].filter(Boolean).join("\n");
    const tw = [
      tag("twitter:card", v("og-tw-card"), true),
      tag("twitter:title", v("og-title"), true),
      tag("twitter:description", v("og-desc"), true),
      tag("twitter:image", v("og-image"), true),
      tag("twitter:site", v("og-tw-handle"), true),
    ].filter(Boolean).join("\n");
    return `<!-- Open Graph / Facebook -->\n${og}\n\n<!-- Twitter -->\n${tw}`;
  }

  function domainOf(url: string): string {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
  }

  function render() {
    code!.textContent = build();
    const img = v("og-image").trim();
    if (img) {
      (prevImg as HTMLElement).style.cssText = `background-image:url("${img.replace(/"/g, "%22")}");background-size:cover;background-position:center`;
      prevImg!.textContent = "";
    } else {
      (prevImg as HTMLElement).style.cssText = "";
      prevImg!.textContent = "no image";
    }
    prevDomain!.textContent = domainOf(v("og-url")) || "example.com";
    prevTitle!.textContent = v("og-title") || "Your title";
    prevDesc!.textContent = v("og-desc") || "Your description";
  }

  ids.forEach((id) => { els[id]!.addEventListener("input", render); els[id]!.addEventListener("change", render); });
  copy.addEventListener("click", () => copyText(code!.textContent || ""));
  render();
}
