// Tweet to Image Converter — client-side canvas render → PNG.
import { canvasToBlob, downloadBlob } from "../lib/image";
import { wrapText, roundRect } from "../lib/canvasText";

const textEl = document.getElementById("tw-text") as HTMLTextAreaElement | null;
const nameEl = document.getElementById("tw-name") as HTMLInputElement | null;
const handleEl = document.getElementById("tw-handle") as HTMLInputElement | null;
const themeEl = document.getElementById("tw-theme") as HTMLSelectElement | null;
const sizeEl = document.getElementById("tw-size") as HTMLInputElement | null;
const sizeVal = document.getElementById("tw-size-val");
const verifiedEl = document.getElementById("tw-verified") as HTMLInputElement | null;
const bgWrap = document.getElementById("tw-bg");
const canvas = document.getElementById("tw-canvas") as HTMLCanvasElement | null;
const downloadBtn = document.getElementById("tw-download");

if (textEl && nameEl && handleEl && themeEl && sizeEl && sizeVal && verifiedEl && bgWrap && canvas && downloadBtn) {
  const BGS = [
    { id: "sky", a: "#38bdf8", b: "#6366f1" },
    { id: "sunset", a: "#fb923c", b: "#ec4899" },
    { id: "mint", a: "#34d399", b: "#06b6d4" },
    { id: "grape", a: "#a78bfa", b: "#d946ef" },
    { id: "night", a: "#334155", b: "#0f172a" },
    { id: "plain", a: "#e2e8f0", b: "#cbd5e1" },
  ];
  let bg = BGS[0];
  const FONT = `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

  bgWrap.innerHTML = BGS.map((g, i) => `<button type="button" data-bg="${i}" title="${g.id}" class="h-8 w-8 rounded-full border-2 ${i === 0 ? "border-orange-500" : "border-transparent"}" style="background:linear-gradient(135deg,${g.a},${g.b})"></button>`).join("");

  function render() {
    sizeVal!.textContent = sizeEl!.value;
    const S = 2, W = 600, pad = 40, cardPad = 28;
    const cardW = W - pad * 2, innerW = cardW - cardPad * 2;
    const dark = themeEl!.value === "dark";
    const fs = parseInt(sizeEl!.value), lineH = Math.round(fs * 1.42);

    const scratch = document.createElement("canvas").getContext("2d")!;
    scratch.font = `${fs}px ${FONT}`;
    const lines = wrapText(scratch, textEl!.value || "Your tweet text goes here…", innerW);
    const headerH = 52, footerH = 30, textH = lines.length * lineH;
    const cardH = cardPad * 2 + headerH + 14 + textH + 14 + footerH;
    const H = cardH + pad * 2;

    canvas!.width = W * S; canvas!.height = H * S;
    const ctx = canvas!.getContext("2d")!;
    ctx.setTransform(S, 0, 0, S, 0, 0);

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, bg.a); grad.addColorStop(1, bg.b);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    ctx.save();
    roundRect(ctx, pad, pad, cardW, cardH, 22);
    ctx.shadowColor = "rgba(0,0,0,.2)"; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10;
    ctx.fillStyle = dark ? "#15202b" : "#ffffff";
    ctx.fill();
    ctx.restore();

    const cx = pad + cardPad;
    let y = pad + cardPad;
    const name = nameEl!.value || "Your Name";
    const handle = (handleEl!.value || "you").replace(/^@/, "");

    // avatar (initial)
    const av = 44;
    ctx.beginPath(); ctx.arc(cx + av / 2, y + av / 2, av / 2, 0, Math.PI * 2);
    ctx.fillStyle = bg.a; ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `bold ${Math.round(av * 0.42)}px ${FONT}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText((name.trim()[0] || "Y").toUpperCase(), cx + av / 2, y + av / 2 + 1);

    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = dark ? "#ffffff" : "#0f1419";
    ctx.font = `bold 16px ${FONT}`;
    const nameW = ctx.measureText(name).width;
    ctx.fillText(name, cx + av + 12, y + 18);
    if (verifiedEl!.checked) {
      const bx = cx + av + 12 + nameW + 8, by = y + 12;
      ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fillStyle = "#1d9bf0"; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.8; ctx.beginPath();
      ctx.moveTo(bx - 3.5, by); ctx.lineTo(bx - 1, by + 2.5); ctx.lineTo(bx + 3.5, by - 2.5); ctx.stroke();
    }
    ctx.fillStyle = dark ? "#8b98a5" : "#536471";
    ctx.font = `15px ${FONT}`;
    ctx.fillText("@" + handle, cx + av + 12, y + 38);

    y += headerH + 14;
    ctx.fillStyle = dark ? "#e7e9ea" : "#0f1419";
    ctx.font = `${fs}px ${FONT}`;
    for (const line of lines) { ctx.fillText(line, cx, y + fs * 0.85); y += lineH; }

    y += 14;
    ctx.fillStyle = dark ? "#8b98a5" : "#536471";
    ctx.font = `14px ${FONT}`;
    const now = new Date();
    ctx.fillText(`${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`, cx, y + 12);
  }

  bgWrap.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("[data-bg]") as HTMLElement | null;
    if (!b) return;
    bg = BGS[+b.dataset.bg!];
    bgWrap.querySelectorAll("[data-bg]").forEach((x) => x.classList.remove("border-orange-500"));
    bgWrap.querySelectorAll("[data-bg]").forEach((x) => { if (x !== b) x.classList.add("border-transparent"); });
    b.classList.remove("border-transparent"); b.classList.add("border-orange-500");
    render();
  });
  [textEl, nameEl, handleEl, themeEl, sizeEl, verifiedEl].forEach((el) => { el.addEventListener("input", render); el.addEventListener("change", render); });
  downloadBtn.addEventListener("click", async () => downloadBlob(await canvasToBlob(canvas, "image/png"), "tweet_doctech.png"));
  render();
}
