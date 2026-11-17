// Twitter Ad Revenue Generator — playful earnings card → PNG.
import { canvasToBlob, downloadBlob } from "../lib/image";
import { roundRect } from "../lib/canvasText";
import { SANS } from "../lib/mockup";

const $ = (id: string) => document.getElementById(id);
const handleEl = $("tar-handle") as HTMLInputElement | null;
const themeEl = $("tar-theme") as HTMLSelectElement | null;
const amountEl = $("tar-amount") as HTMLInputElement | null;
const periodEl = $("tar-period") as HTMLInputElement | null;
const imprEl = $("tar-impressions") as HTMLInputElement | null;
const engEl = $("tar-engagements") as HTMLInputElement | null;
const canvas = $("tar-canvas") as HTMLCanvasElement | null;
const downloadBtn = $("tar-download");

if (handleEl && themeEl && amountEl && periodEl && imprEl && engEl && canvas && downloadBtn) {
  function compact(n: number): string {
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K";
    return n.toLocaleString("en-US");
  }
  const money = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function render() {
    const S = 2, W = 520, H = 300;
    const dark = themeEl!.value !== "light";
    const bg = dark ? "#000000" : "#ffffff", card = dark ? "#16181c" : "#f7f9f9", text = dark ? "#e7e9ea" : "#0f1419", sub = dark ? "#71767b" : "#536471", accent = "#00ba7c";

    canvas!.width = W * S; canvas!.height = H * S;
    const ctx = canvas!.getContext("2d")!;
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // 𝕏 mark
    ctx.fillStyle = text; ctx.font = `bold 26px ${SANS}`; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText("𝕏", 28, 48);
    ctx.font = `600 16px ${SANS}`; ctx.fillStyle = sub;
    ctx.fillText("Ad Revenue Sharing", 60, 47);

    // earnings card
    roundRect(ctx, 24, 70, W - 48, 150, 18);
    ctx.fillStyle = card; ctx.fill();

    ctx.fillStyle = sub; ctx.font = `15px ${SANS}`;
    ctx.fillText("You've earned", 48, 104);
    ctx.fillStyle = accent; ctx.font = `800 46px ${SANS}`;
    ctx.fillText(money(+amountEl!.value || 0), 48, 152);
    ctx.fillStyle = sub; ctx.font = `14px ${SANS}`;
    ctx.fillText(`for ${periodEl!.value || "the last 30 days"} · @${(handleEl!.value || "you").replace(/^@/, "")}`, 48, 182);

    // stats row
    const stat = (x: number, label: string, val: string) => {
      ctx.fillStyle = text; ctx.font = `bold 18px ${SANS}`; ctx.fillText(val, x, 244);
      ctx.fillStyle = sub; ctx.font = `13px ${SANS}`; ctx.fillText(label, x, 264);
    };
    stat(28, "Impressions", compact(+imprEl!.value || 0));
    stat(200, "Engagements", compact(+engEl!.value || 0));

    ctx.fillStyle = sub; ctx.font = `12px ${SANS}`; ctx.textAlign = "right";
    ctx.fillText("Payout processed via Stripe", W - 28, 264);
    ctx.textAlign = "left";
  }

  [handleEl, themeEl, amountEl, periodEl, imprEl, engEl].forEach((el) => { el.addEventListener("input", render); el.addEventListener("change", render); });
  downloadBtn.addEventListener("click", async () => downloadBlob(await canvasToBlob(canvas, "image/png"), "ad_revenue_doctech.png"));
  render();
}
