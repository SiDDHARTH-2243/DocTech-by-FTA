// Image Downloader by URL — cloud. Preview via <img>, download via the server
// image-proxy so cross-origin links save cleanly.
import { API_BASE, downloadBlob } from "../lib/image";
import { toast, showSpin, hideSpin, cloudConsent } from "../lib/ui";

const input = document.getElementById("idl-url") as HTMLInputElement | null;
const loadBtn = document.getElementById("idl-load");
const work = document.getElementById("idl-work");
const preview = document.getElementById("idl-preview") as HTMLImageElement | null;
const downloadBtn = document.getElementById("idl-download");

if (input && loadBtn && work && preview && downloadBtn) {
  function fileName(url: string): string {
    try {
      const p = new URL(url).pathname.split("/").pop() || "";
      if (/\.(jpe?g|png|webp|gif|bmp|avif|svg)$/i.test(p)) return p;
    } catch { /* ignore */ }
    return "image_doctech.jpg";
  }

  function showPreview() {
    const url = input!.value.trim();
    if (!url) { toast("Paste an image URL first", "err"); return; }
    preview!.onerror = () => toast("Couldn't load that image — check the URL points directly to an image", "err");
    preview!.src = url;
    work!.classList.remove("hidden");
  }

  async function download() {
    const url = input!.value.trim();
    if (!url) { toast("Paste an image URL first", "err"); return; }
    if (!(await cloudConsent())) return;
    showSpin("Fetching image…");
    try {
      const res = await fetch(`${API_BASE}/api/fetch-image?url=${encodeURIComponent(url)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        toast("Download failed: " + (err.error || res.status), "err");
        hideSpin();
        return;
      }
      downloadBlob(await res.blob(), fileName(url));
      toast("✓ Image downloaded!", "ok");
    } catch {
      toast("Connection refused. Is the Node server running?", "err");
    }
    hideSpin();
  }

  loadBtn.addEventListener("click", showPreview);
  input.addEventListener("keydown", (e) => { if ((e as KeyboardEvent).key === "Enter") showPreview(); });
  downloadBtn.addEventListener("click", download);
}
