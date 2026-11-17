// Tweet Generator — realistic single-tweet mockup → PNG.
import { canvasToBlob, downloadBlob, loadImage } from "../lib/image";
import { wrapText } from "../lib/canvasText";
import { avatar, verifiedBadge, commas, SANS } from "../lib/mockup";

const $ = (id: string) => document.getElementById(id);
const textEl = $("tg-text") as HTMLTextAreaElement | null;
const nameEl = $("tg-name") as HTMLInputElement | null;
const handleEl = $("tg-handle") as HTMLInputElement | null;
const themeEl = $("tg-theme") as HTMLSelectElement | null;
const verifiedEl = $("tg-verified") as HTMLInputElement | null;
const avatarEl = $("tg-avatar") as HTMLInputElement | null;
const repliesEl = $("tg-replies") as HTMLInputElement | null;
const repostsEl = $("tg-reposts") as HTMLInputElement | null;
const likesEl = $("tg-likes") as HTMLInputElement | null;
const canvas = $("tg-canvas") as HTMLCanvasElement | null;
const downloadBtn = $("tg-download");

if (textEl && nameEl && handleEl && themeEl && verifiedEl && avatarEl && repliesEl && repostsEl && likesEl && canvas && downloadBtn) {
  let avatarImg: HTMLImageElement | null = null;
  const THEMES: Record<string, { bg: string; text: string; sub: string; div: string }> = {
    light: { bg: "#ffffff", text: "#0f1419", sub: "#536471", div: "#eff3f4" },
    dim: { bg: "#15202b", text: "#f7f9f9", sub: "#8b98a5", div: "#38444d" },
    dark: { bg: "#000000", text: "#e7e9ea", sub: "#71767b", div: "#2f3336" },
  };

  function render() {
    const S = 2, W = 560, pad = 22;
    const th = THEMES[themeEl!.value];
    const fs = 23, lineH = 30;
    const scratch = document.createElement("canvas").getContext("2d")!;
    scratch.font = `${fs}px ${SANS}`;
    const lines = wrapText(scratch, textEl!.value || " ", W - pad * 2);
    const textH = lines.length * lineH;
    const H = pad + 52 + 14 + textH + 16 + 20 + 16 + 1 + 16 + 20 + pad;

    canvas!.width = W * S; canvas!.height = H * S;
    const ctx = canvas!.getContext("2d")!;
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);

    // header
    const name = nameEl!.value || "Your Name";
    const handle = (handleEl!.value || "you").replace(/^@/, "");
    avatar(ctx, pad + 24, pad + 24, 48, { img: avatarImg, name, bg: "#1d9bf0" });
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = th.text; ctx.font = `bold 16px ${SANS}`;
    ctx.fillText(name, pad + 60, pad + 20);
    const nameW = ctx.measureText(name).width;
    if (verifiedEl!.checked) verifiedBadge(ctx, pad + 60 + nameW + 11, pad + 14, 8);
    ctx.fillStyle = th.sub; ctx.font = `15px ${SANS}`;
    ctx.fillText("@" + handle, pad + 60, pad + 42);

    // text
    let y = pad + 52 + 14;
    ctx.fillStyle = th.text; ctx.font = `${fs}px ${SANS}`;
    for (const line of lines) { ctx.fillText(line, pad, y + fs * 0.8); y += lineH; }

    // timestamp
    y += 16;
    ctx.fillStyle = th.sub; ctx.font = `15px ${SANS}`;
    const now = new Date();
    ctx.fillText(`${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · ${now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`, pad, y + 8);

    // divider
    y += 20;
    ctx.strokeStyle = th.div; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, y + 8); ctx.lineTo(W - pad, y + 8); ctx.stroke();

    // stats
    y += 24;
    let x = pad;
    const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K" : commas(n));
    const stat = (countStr: string, label: string) => {
      ctx.font = `bold 14px ${SANS}`; ctx.fillStyle = th.text; ctx.fillText(countStr, x, y + 6);
      const cw = ctx.measureText(countStr).width;
      ctx.font = `14px ${SANS}`; ctx.fillStyle = th.sub; ctx.fillText(" " + label, x + cw, y + 6);
      x += cw + ctx.measureText(" " + label).width + 18;
    };
    stat(fmt(+repostsEl!.value || 0), "Reposts");
    stat(fmt(+likesEl!.value || 0), "Likes");
    stat(fmt(+repliesEl!.value || 0), "Replies");
  }

  [textEl, nameEl, handleEl, themeEl, verifiedEl, repliesEl, repostsEl, likesEl].forEach((el) => { el.addEventListener("input", render); el.addEventListener("change", render); });
  avatarEl.addEventListener("change", async () => { const f = avatarEl.files?.[0]; avatarImg = f ? await loadImage(f).catch(() => null) : null; render(); });
  downloadBtn.addEventListener("click", async () => downloadBlob(await canvasToBlob(canvas, "image/png"), "tweet_doctech.png"));
  render();
}
