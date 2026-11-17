// Instagram Post Generator — feed-post mockup → PNG.
import { canvasToBlob, downloadBlob, loadImage } from "../lib/image";
import { wrapText, drawCircleImage } from "../lib/canvasText";
import { avatar, verifiedBadge, commas, SANS } from "../lib/mockup";

const $ = (id: string) => document.getElementById(id);
const userEl = $("igp-username") as HTMLInputElement | null;
const themeEl = $("igp-theme") as HTMLSelectElement | null;
const likesEl = $("igp-likes") as HTMLInputElement | null;
const verifiedEl = $("igp-verified") as HTMLInputElement | null;
const avatarEl = $("igp-avatar") as HTMLInputElement | null;
const imageEl = $("igp-image") as HTMLInputElement | null;
const captionEl = $("igp-caption") as HTMLTextAreaElement | null;
const canvas = $("igp-canvas") as HTMLCanvasElement | null;
const downloadBtn = $("igp-download");

if (userEl && themeEl && likesEl && verifiedEl && avatarEl && imageEl && captionEl && canvas && downloadBtn) {
  let avatarImg: HTMLImageElement | null = null;
  let photoImg: HTMLImageElement | null = null;

  // simple line icons -------------------------------------------------------
  function heart(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.75);
    ctx.bezierCurveTo(cx - r * 1.3, cy - r * 0.1, cx - r * 0.45, cy - r, cx, cy - r * 0.25);
    ctx.bezierCurveTo(cx + r * 0.45, cy - r, cx + r * 1.3, cy - r * 0.1, cx, cy + r * 0.75);
    ctx.stroke();
  }
  function comment(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.85, Math.PI * 0.6, false);
    ctx.lineTo(cx - r * 0.7, cy + r * 1.25);
    ctx.stroke();
  }
  function send(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(cx + r, cy - r); ctx.lineTo(cx - r, cy - r * 0.05); ctx.lineTo(cx - r * 0.1, cy + r * 0.35);
    ctx.lineTo(cx + r, cy - r); ctx.lineTo(cx - r * 0.1, cy + r * 0.35); ctx.lineTo(cx - r * 0.1, cy + r);
    ctx.stroke();
  }
  function bookmark(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.65, cy - r); ctx.lineTo(cx + r * 0.65, cy - r); ctx.lineTo(cx + r * 0.65, cy + r);
    ctx.lineTo(cx, cy + r * 0.35); ctx.lineTo(cx - r * 0.65, cy + r); ctx.closePath();
    ctx.stroke();
  }

  function render() {
    const S = 2, W = 470;
    const dark = themeEl!.value === "dark";
    const bg = dark ? "#000000" : "#ffffff", text = dark ? "#f5f5f5" : "#0f1419", sub = dark ? "#a8a8a8" : "#737373", line = dark ? "#262626" : "#dbdbdb";
    const headerH = 56, actionH = 48;
    const user = userEl!.value || "username";

    const scratch = document.createElement("canvas").getContext("2d")!;
    scratch.font = `14px ${SANS}`;
    const combined = user + " " + (captionEl!.value || "");
    const capLines = wrapText(scratch, combined, W - 32);
    const capH = capLines.length * 20;
    const H = headerH + W + actionH + 26 + capH + 8 + 18 + 14;

    canvas!.width = W * S; canvas!.height = H * S;
    const ctx = canvas!.getContext("2d")!;
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // header
    avatar(ctx, 30, 28, 34, { img: avatarImg, name: user, bg: "#c13584" });
    ctx.fillStyle = text; ctx.font = `600 14px ${SANS}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(user, 54, 28);
    const uw = ctx.measureText(user).width;
    if (verifiedEl!.checked) verifiedBadge(ctx, 54 + uw + 10, 28, 7);
    ctx.fillStyle = sub; ctx.font = `bold 18px ${SANS}`; ctx.textBaseline = "alphabetic";
    ctx.fillText("⋯", W - 24, 33);

    // photo (cover-crop square)
    const iy = headerH;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, iy, W, W); ctx.clip();
    if (photoImg) {
      const sc = Math.max(W / photoImg.naturalWidth, W / photoImg.naturalHeight);
      const dw = photoImg.naturalWidth * sc, dh = photoImg.naturalHeight * sc;
      ctx.drawImage(photoImg, (W - dw) / 2, iy + (W - dh) / 2, dw, dh);
    } else {
      const g = ctx.createLinearGradient(0, iy, W, iy + W); g.addColorStop(0, "#cbd5e1"); g.addColorStop(1, "#94a3b8");
      ctx.fillStyle = g; ctx.fillRect(0, iy, W, W);
      ctx.fillStyle = "#ffffffcc"; ctx.font = `15px ${SANS}`; ctx.textAlign = "center";
      ctx.fillText("Add a photo", W / 2, iy + W / 2); ctx.textAlign = "left";
    }
    ctx.restore();

    // actions
    const ay = iy + W + actionH / 2;
    ctx.strokeStyle = text; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    heart(ctx, 26, ay, 11); comment(ctx, 60, ay, 10); send(ctx, 94, ay, 10); bookmark(ctx, W - 24, ay, 10);

    // likes
    let y = iy + W + actionH + 18;
    ctx.fillStyle = text; ctx.font = `600 14px ${SANS}`; ctx.textBaseline = "alphabetic";
    ctx.fillText(`${commas(+likesEl!.value || 0)} likes`, 16, y);

    // caption (bold username inline on first line)
    y += 22;
    capLines.forEach((ln, i) => {
      if (i === 0) {
        ctx.font = `600 14px ${SANS}`; ctx.fillStyle = text; ctx.fillText(user, 16, y);
        const w0 = ctx.measureText(user).width;
        ctx.font = `14px ${SANS}`; ctx.fillStyle = text;
        ctx.fillText(ln.slice(user.length), 16 + w0, y);
      } else {
        ctx.font = `14px ${SANS}`; ctx.fillStyle = text; ctx.fillText(ln, 16, y);
      }
      y += 20;
    });

    // time
    y += 4;
    ctx.fillStyle = sub; ctx.font = `11px ${SANS}`;
    ctx.fillText("2 HOURS AGO", 16, y);
  }

  [userEl, themeEl, likesEl, captionEl, verifiedEl].forEach((el) => { el.addEventListener("input", render); el.addEventListener("change", render); });
  avatarEl.addEventListener("change", async () => { const f = avatarEl.files?.[0]; avatarImg = f ? await loadImage(f).catch(() => null) : null; render(); });
  imageEl.addEventListener("change", async () => { const f = imageEl.files?.[0]; photoImg = f ? await loadImage(f).catch(() => null) : null; render(); });
  downloadBtn.addEventListener("click", async () => downloadBlob(await canvasToBlob(canvas, "image/png"), "instagram_post_doctech.png"));
  render();
}
