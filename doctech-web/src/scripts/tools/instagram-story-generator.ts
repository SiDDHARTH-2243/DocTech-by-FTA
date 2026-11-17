// Instagram Story Generator — 9:16 story mockup → PNG (1080×1920).
import { canvasToBlob, downloadBlob, loadImage } from "../lib/image";
import { wrapText } from "../lib/canvasText";
import { avatar, SANS } from "../lib/mockup";

const $ = (id: string) => document.getElementById(id);
const userEl = $("igs-username") as HTMLInputElement | null;
const posEl = $("igs-pos") as HTMLSelectElement | null;
const avatarEl = $("igs-avatar") as HTMLInputElement | null;
const bgEl = $("igs-bg") as HTMLInputElement | null;
const textEl = $("igs-text") as HTMLTextAreaElement | null;
const canvas = $("igs-canvas") as HTMLCanvasElement | null;
const downloadBtn = $("igs-download");

if (userEl && posEl && avatarEl && bgEl && textEl && canvas && downloadBtn) {
  let avatarImg: HTMLImageElement | null = null;
  let bgImg: HTMLImageElement | null = null;
  const GRADS = [["#f09433", "#dc2743", "#bc1888"], ["#4f46e5", "#06b6d4"], ["#0f172a", "#334155"]];

  function render() {
    const S = 2, W = 540, H = 960;
    canvas!.width = W * S; canvas!.height = H * S;
    const ctx = canvas!.getContext("2d")!;
    ctx.setTransform(S, 0, 0, S, 0, 0);

    // background
    if (bgImg) {
      const sc = Math.max(W / bgImg.naturalWidth, H / bgImg.naturalHeight);
      const dw = bgImg.naturalWidth * sc, dh = bgImg.naturalHeight * sc;
      ctx.drawImage(bgImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      const cols = GRADS[0];
      const g = ctx.createLinearGradient(0, 0, W, H);
      cols.forEach((c, i) => g.addColorStop(i / (cols.length - 1), c));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // top + bottom scrims for legibility
    const top = ctx.createLinearGradient(0, 0, 0, 120);
    top.addColorStop(0, "rgba(0,0,0,.35)"); top.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = top; ctx.fillRect(0, 0, W, 120);

    // progress bars
    const segs = 3, m = 12, bw = (W - m * 2 - (segs - 1) * 4) / segs;
    for (let i = 0; i < segs; i++) {
      ctx.fillStyle = i === 0 ? "#ffffff" : "rgba(255,255,255,.4)";
      ctx.beginPath(); ctx.roundRect(m + i * (bw + 4), 12, bw, 3, 2); ctx.fill();
    }

    // header
    avatar(ctx, 32, 44, 34, { img: avatarImg, name: userEl!.value, bg: "#c13584" });
    ctx.fillStyle = "#fff"; ctx.font = `600 15px ${SANS}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 4;
    ctx.fillText(userEl!.value || "username", 56, 44);
    const uw = ctx.measureText(userEl!.value || "username").width;
    ctx.font = `13px ${SANS}`; ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fillText("2h", 56 + uw + 10, 45);
    ctx.shadowBlur = 0;
    // close X
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(W - 28, 38); ctx.lineTo(W - 16, 50); ctx.moveTo(W - 16, 38); ctx.lineTo(W - 28, 50); ctx.stroke();

    // text overlay
    const txt = textEl!.value.trim();
    if (txt) {
      const fs = 40, lineH = 50;
      ctx.font = `800 ${fs}px ${SANS}`;
      const lines = wrapText(ctx, txt, W - 80);
      const blockH = lines.length * lineH;
      const pos = posEl!.value;
      let y = pos === "top" ? 150 : pos === "bottom" ? H - blockH - 90 : (H - blockH) / 2;
      ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 10;
      ctx.fillStyle = "#fff";
      for (const ln of lines) { ctx.fillText(ln, W / 2, y + fs); y += lineH; }
      ctx.shadowBlur = 0;
    }
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  }

  [userEl, posEl, textEl].forEach((el) => { el.addEventListener("input", render); el.addEventListener("change", render); });
  avatarEl.addEventListener("change", async () => { const f = avatarEl.files?.[0]; avatarImg = f ? await loadImage(f).catch(() => null) : null; render(); });
  bgEl.addEventListener("change", async () => { const f = bgEl.files?.[0]; bgImg = f ? await loadImage(f).catch(() => null) : null; render(); });
  downloadBtn.addEventListener("click", async () => downloadBlob(await canvasToBlob(canvas, "image/png"), "instagram_story_doctech.png"));
  render();
}
