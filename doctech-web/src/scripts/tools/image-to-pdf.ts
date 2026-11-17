// Image → PDF — client-side. Ported from legacy TOOL_VIEWS['img2pdf'] / normalizeToJpeg / doImg2Pdf.
import { PDFDocument, download } from "../lib/pdf";
import { toast, showSpin, setSpinText, hideSpin, setupDropzone } from "../lib/ui";

const IMG_TYPES = ["image/png", "image/jpeg", "image/webp", "image/bmp"];

const dropzone = document.getElementById("img-dropzone");
const input = document.getElementById("img-input") as HTMLInputElement | null;
const grid = document.getElementById("img-grid");
const btn = document.getElementById("img-btn") as HTMLButtonElement | null;
const count = document.getElementById("img-count");

if (dropzone && input && grid && btn && count) {
  let files: File[] = [];

  function addImgs(incoming: File[]) {
    let added = 0;
    for (const f of incoming) {
      if (IMG_TYPES.includes(f.type)) {
        files.push(f);
        added++;
      } else {
        toast(`"${f.name}" — unsupported format`, "err");
      }
    }
    if (added) render();
  }

  function remove(i: number) {
    files.splice(i, 1);
    render();
  }

  function render() {
    grid!.innerHTML = "";
    count!.textContent = String(files.length);
    btn!.disabled = files.length === 0;
    files.forEach((f, i) => {
      const url = URL.createObjectURL(f);
      const card = document.createElement("div");
      card.className =
        "relative rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800";
      card.innerHTML = `
        <img src="${url}" alt="${f.name}" class="h-[150px] w-[120px] rounded object-cover" loading="lazy" />
        <button type="button" data-act="remove" aria-label="Remove" class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow hover:bg-red-600">✕</button>
        <div class="mt-1 max-w-[120px] truncate text-center text-[11px] text-slate-500 dark:text-slate-400" title="${f.name}">${f.name}</div>`;
      card.querySelector('[data-act="remove"]')?.addEventListener("click", () => remove(i));
      grid!.appendChild(card);
    });
  }

  function normalizeToJpeg(
    file: File,
  ): Promise<{ bytes: Uint8Array; w: number; h: number }> {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        c.toBlob(
          (blob) => {
            if (!blob) {
              rej(new Error("Canvas export failed"));
              return;
            }
            blob.arrayBuffer().then((buf) =>
              res({ bytes: new Uint8Array(buf), w: img.naturalWidth, h: img.naturalHeight }),
            );
          },
          "image/jpeg",
          0.92,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        rej(new Error("Image load failed"));
      };
      img.src = url;
    });
  }

  async function doImg2Pdf() {
    if (!files.length) {
      toast("Add images first", "err");
      return;
    }
    showSpin("Converting images…");
    try {
      const doc = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        setSpinText(`Processing image ${i + 1} of ${files.length}…`);
        const { bytes, w, h } = await normalizeToJpeg(files[i]);
        const img = await doc.embedJpg(bytes);
        const page = doc.addPage([w, h]);
        page.drawImage(img, { x: 0, y: 0, width: w, height: h });
      }
      download(await doc.save(), "images_doctech.pdf");
      toast(`✓ Converted ${files.length} image(s) to PDF!`, "ok");
    } catch (e) {
      toast("Failed: " + (e as Error).message, "err");
    }
    hideSpin();
  }

  setupDropzone(dropzone, input, (fl) => addImgs(fl));
  btn.addEventListener("click", doImg2Pdf);
}
