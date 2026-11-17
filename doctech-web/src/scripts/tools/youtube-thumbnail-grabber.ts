// YouTube Thumbnail Grabber — client-side. Thumbnails live at predictable URLs;
// downloads route through the server image-proxy (with an open-in-tab fallback).
import { API_BASE, downloadBlob } from "../lib/image";
import { toast } from "../lib/ui";

const input = document.getElementById("yt-url") as HTMLInputElement | null;
const go = document.getElementById("yt-go");
const grid = document.getElementById("yt-grid");
const empty = document.getElementById("yt-empty");

if (input && go && grid && empty) {
  const SIZES = [
    { key: "maxresdefault", label: "Max-res", w: 1280, h: 720 },
    { key: "sddefault", label: "SD", w: 640, h: 480 },
    { key: "hqdefault", label: "HQ", w: 480, h: 360 },
    { key: "mqdefault", label: "MQ", w: 320, h: 180 },
    { key: "default", label: "Default", w: 120, h: 90 },
  ];

  function parseId(raw: string): string | null {
    const s = raw.trim();
    const patterns = [
      /[?&]v=([A-Za-z0-9_-]{11})/,
      /youtu\.be\/([A-Za-z0-9_-]{11})/,
      /\/shorts\/([A-Za-z0-9_-]{11})/,
      /\/embed\/([A-Za-z0-9_-]{11})/,
      /\/live\/([A-Za-z0-9_-]{11})/,
    ];
    for (const re of patterns) { const m = s.match(re); if (m) return m[1]; }
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    return null;
  }

  const thumbUrl = (id: string, key: string) => `https://img.youtube.com/vi/${id}/${key}.jpg`;

  async function download(url: string, name: string) {
    try {
      const res = await fetch(`${API_BASE}/api/fetch-image?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error(String(res.status));
      downloadBlob(await res.blob(), name);
      toast("✓ Thumbnail downloaded!", "ok");
    } catch {
      window.open(url, "_blank", "noopener");
      toast("Opened in a new tab — right-click to save (start the server for direct downloads)", "info");
    }
  }

  function render() {
    const id = parseId(input!.value);
    if (!id) {
      grid!.innerHTML = "";
      empty!.textContent = input!.value.trim() ? "Couldn't find a video ID in that link." : "Paste a YouTube video URL above to see its thumbnails.";
      empty!.classList.remove("hidden");
      return;
    }
    empty!.classList.add("hidden");
    grid!.innerHTML = SIZES.map((sz, i) => `
      <div data-card="${i}" class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div class="flex aspect-video items-center justify-center bg-slate-100 dark:bg-slate-950">
          <img data-i="${i}" src="${thumbUrl(id, sz.key)}" alt="${sz.label} thumbnail" class="h-full w-full object-contain" loading="lazy" />
        </div>
        <div class="flex items-center justify-between gap-2 px-4 py-3">
          <div>
            <div class="text-sm font-semibold">${sz.label}</div>
            <div class="text-xs text-slate-400">${sz.w} × ${sz.h}</div>
          </div>
          <div class="flex gap-2">
            <a href="${thumbUrl(id, sz.key)}" target="_blank" rel="noopener" class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Open</a>
            <button data-dl="${i}" type="button" class="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600">Download</button>
          </div>
        </div>
      </div>`).join("");

    grid!.querySelectorAll<HTMLButtonElement>("[data-dl]").forEach((b) =>
      b.addEventListener("click", () => { const sz = SIZES[+b.dataset.dl!]; download(thumbUrl(id, sz.key), `youtube_${id}_${sz.key}.jpg`); }),
    );
    // Missing maxres/sd return a 120×90 grey placeholder — flag those cards.
    grid!.querySelectorAll<HTMLImageElement>("img[data-i]").forEach((img) =>
      img.addEventListener("load", () => {
        const sz = SIZES[+img.dataset.i!];
        if (img.naturalWidth <= 120 && sz.w > 120) {
          const card = grid!.querySelector(`[data-card="${img.dataset.i}"]`);
          card?.classList.add("opacity-50");
          const lab = card?.querySelector(".text-xs.text-slate-400");
          if (lab) lab.textContent = "not available for this video";
        }
      }),
    );
  }

  go.addEventListener("click", render);
  input.addEventListener("keydown", (e) => { if ((e as KeyboardEvent).key === "Enter") render(); });
  input.addEventListener("input", () => { if (!input!.value.trim()) render(); });
}
