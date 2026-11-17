// Lightweight, framework-free UI helpers shared by every tool:
// toasts, a blocking spinner overlay, a cloud-upload consent modal, and a
// dropzone wiring helper. All styled with Tailwind utility classes.

let toastRoot: HTMLElement | null = null;
function ensureToastRoot(): HTMLElement {
  if (toastRoot && document.body.contains(toastRoot)) return toastRoot;
  toastRoot = document.createElement("div");
  toastRoot.className = "fixed top-4 right-4 z-[100] flex flex-col gap-2";
  document.body.appendChild(toastRoot);
  return toastRoot;
}

export function toast(msg: string, type: "info" | "ok" | "err" = "info"): void {
  const root = ensureToastRoot();
  const el = document.createElement("div");
  const tone =
    type === "ok"
      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
      : type === "err"
        ? "border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        : "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";
  el.className = `max-w-xs rounded-lg border px-4 py-2.5 text-sm font-medium shadow-lg ${tone}`;
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3300);
}

/** Copy text to the clipboard and show a confirmation toast. */
export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast(`Copied ${text}`, "ok");
  } catch {
    toast("Copy failed — copy manually", "err");
  }
}

/** Copy text and briefly pulse the clicked element — premium visual feedback. */
export function copyFlash(el: HTMLElement, text: string): void {
  void copyText(text);
  el.classList.remove("copy-flash");
  void el.offsetWidth; // restart the animation
  el.classList.add("copy-flash");
}

let spinEl: HTMLElement | null = null;
export function showSpin(label = "Processing…"): void {
  if (!spinEl) {
    spinEl = document.createElement("div");
    spinEl.className =
      "fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-slate-900/60 backdrop-blur-sm";
    spinEl.innerHTML = `
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-orange-500"></div>
      <p id="spin-label" class="text-sm font-semibold text-white"></p>`;
    document.body.appendChild(spinEl);
  }
  spinEl.style.display = "flex";
  setSpinText(label);
}
export function setSpinText(label: string): void {
  const l = spinEl?.querySelector("#spin-label");
  if (l) l.textContent = label;
}
export function hideSpin(): void {
  if (spinEl) spinEl.style.display = "none";
}

/** Show the cloud consent modal. Resolves true if the user agrees to upload. */
export function cloudConsent(): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm";
    overlay.innerHTML = `
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <h3 class="text-base font-bold">Server processing required ☁️</h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          This tool runs on the server. Your file is uploaded over the network,
          processed, and removed shortly after. Continue?
        </p>
        <div class="mt-5 flex justify-end gap-3">
          <button data-act="cancel" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
          <button data-act="ok" class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">I understand, upload</button>
        </div>
      </div>`;
    const done = (v: boolean) => {
      overlay.remove();
      resolve(v);
    };
    overlay.querySelector('[data-act="cancel"]')!.addEventListener("click", () => done(false));
    overlay.querySelector('[data-act="ok"]')!.addEventListener("click", () => done(true));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) done(false);
    });
    document.body.appendChild(overlay);
  });
}

/**
 * Catalog card markup for the premium generator grids (loaders, checkboxes, …).
 *
 * Layout: a fixed top "stage" holds the live preview (always visible +
 * interactive), a fixed-height footer shows the name at rest, and an action
 * drawer of the SAME height is pinned to the bottom — hidden via
 * `translate-y-full` and revealed on `group-hover`. Because the drawer occupies
 * exactly the footer band, it covers only the label and never intersects the
 * preview's bounding box. The drawer is a child of the hovered card, so moving
 * the cursor onto its buttons keeps the group-hover state and the drawer steady.
 */
export function cardMarkup(
  id: string,
  name: string,
  category: string,
  previewHtml: string,
  stageBg: string,
): string {
  return `
    <div class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10 dark:border-slate-700 dark:bg-slate-900" data-cat="${category}">
      <div class="flex h-24 items-center justify-center" style="background:${stageBg}">${previewHtml}</div>
      <div class="flex h-9 items-center justify-center px-2 text-xs font-medium text-slate-600 dark:text-slate-300"><span class="truncate">${name}</span></div>
      <div class="absolute inset-x-0 bottom-0 flex h-9 translate-y-full items-center gap-1.5 border-t border-slate-200 bg-white px-1.5 transition-transform duration-200 group-hover:translate-y-0 dark:border-slate-700 dark:bg-slate-900">
        <button data-act="customize" data-id="${id}" class="flex-1 rounded-md bg-orange-500 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-orange-600">Customize</button>
        <button data-act="getcode" data-id="${id}" class="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Get Code</button>
      </div>
    </div>`;
}

/** Wire drag-and-drop highlight + drop + file-input change to a single callback. */
export function setupDropzone(
  zone: HTMLElement,
  input: HTMLInputElement,
  onFiles: (files: File[]) => void,
): void {
  const hi = ["border-orange-400", "bg-orange-50", "dark:bg-orange-500/10"];
  ["dragenter", "dragover"].forEach((ev) =>
    zone.addEventListener(ev, (e) => {
      e.preventDefault();
      zone.classList.add(...hi);
    }),
  );
  ["dragleave", "drop"].forEach((ev) =>
    zone.addEventListener(ev, (e) => {
      e.preventDefault();
      zone.classList.remove(...hi);
    }),
  );
  zone.addEventListener("drop", (e) => {
    const fl = (e as DragEvent).dataTransfer?.files;
    if (fl?.length) onFiles([...fl]);
  });
  input.addEventListener("change", (e) => {
    const fl = (e.target as HTMLInputElement).files;
    if (fl?.length) onFiles([...fl]);
    input.value = "";
  });
}
