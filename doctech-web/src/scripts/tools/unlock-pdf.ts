// Unlock PDF — hybrid. Ported from legacy TOOL_VIEWS['unlock'] / loadUnlock / doUnlock.
// Attempts local decryption first; falls back to the server for AES-256 files.
import { PDFDocument, API_BASE, isPDF, fmtSize, readBytes, download } from "../lib/pdf";
import { toast, showSpin, setSpinText, hideSpin, setupDropzone } from "../lib/ui";

const dropzone = document.getElementById("ul-dropzone");
const input = document.getElementById("ul-input") as HTMLInputElement | null;
const opts = document.getElementById("ul-opts");
const info = document.getElementById("ul-info");
const pwd = document.getElementById("ul-pwd") as HTMLInputElement | null;
const btn = document.getElementById("ul-btn");
const rail = document.getElementById("ul-rail");

if (dropzone && input && opts && info && pwd && btn && rail) {
  let data: { file: File; bytes: Uint8Array; name: string; size: number } | null = null;

  async function load(file: File) {
    if (!file || !isPDF(file)) {
      toast("Not a PDF", "err");
      return;
    }
    const bytes = await readBytes(file);

    // If it loads without a password, it isn't actually encrypted.
    try {
      await PDFDocument.load(bytes.slice());
      toast("File is not password protected.", "err");
      return;
    } catch {
      /* expected — encrypted, proceed */
    }

    data = { file, bytes, name: file.name, size: file.size };
    info!.textContent = `🔒 ${file.name} — ${fmtSize(file.size)}`;
    rail!.textContent = `🔒 ${file.name}`;
    opts!.classList.remove("hidden");
    dropzone!.classList.add("hidden");
  }

  async function doUnlock() {
    if (!data) {
      toast("No file loaded", "err");
      return;
    }
    const userPassword = pwd!.value || "";
    if (!userPassword) {
      toast("Enter the PDF password", "err");
      return;
    }

    showSpin("Unlocking PDF locally…");
    try {
      // Attempt rapid local browser decryption first.
      const pdf = await PDFDocument.load(data.bytes.slice(), {
        // pdf-lib has no password option; this throws for encrypted input and
        // we fall through to the server, mirroring the legacy behavior.
        password: userPassword,
      } as Parameters<typeof PDFDocument.load>[1] & { password: string });
      const cleanBytes = await pdf.save();
      download(cleanBytes, data.name.replace(/\.pdf$/i, "_unlocked_doctech.pdf"));
      toast("✓ PDF unlocked successfully!", "ok");
      hideSpin();
    } catch (e) {
      const msg = (e as Error).message || String(e);
      if (
        msg.includes("not supported") ||
        msg.includes("AES-256") ||
        msg.includes("is encrypted") ||
        msg.toLowerCase().includes("password")
      ) {
        setSpinText("Decrypting file securely…");
        const formData = new FormData();
        formData.append("pdf", data.file);
        formData.append("password", userPassword);
        try {
          const response = await fetch(`${API_BASE}/api/unlock`, { method: "POST", body: formData });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({ error: response.statusText }));
            toast("Server Execution Failed: " + errData.error, "err");
            hideSpin();
            return;
          }
          const blob = await response.blob();
          download(blob, data.name.replace(/\.pdf$/i, "_unlocked_doctech.pdf"));
          toast("✓ AES-256 PDF unlocked successfully!", "ok");
        } catch (netErr) {
          console.error(netErr);
          toast("Connection refused. Is the Node server running on port 3000?", "err");
        }
      } else {
        toast("Incorrect password structure.", "err");
      }
      hideSpin();
    }
  }

  setupDropzone(dropzone, input, (files) => load(files[0]));
  btn.addEventListener("click", doUnlock);
}
