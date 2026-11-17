// Instagram DM Generator — client-side canvas mockup.
import { canvasToBlob, downloadBlob, loadImage } from "../lib/image";
import { renderChat, avatar, SANS, type ChatTheme, type Msg } from "../lib/mockup";
import { createChatEditor } from "../lib/chatEditor";

const canvas = document.getElementById("igd-canvas") as HTMLCanvasElement | null;
const nameEl = document.getElementById("igd-name") as HTMLInputElement | null;
const themeEl = document.getElementById("igd-theme") as HTMLSelectElement | null;
const avatarEl = document.getElementById("igd-avatar") as HTMLInputElement | null;
const list = document.getElementById("igd-list");
const add = document.getElementById("igd-add");
const downloadBtn = document.getElementById("igd-download");

if (canvas && nameEl && themeEl && avatarEl && list && add && downloadBtn) {
  let avatarImg: HTMLImageElement | null = null;
  const HEADER = 56;

  function theme(): ChatTheme {
    const dark = themeEl!.value === "dark";
    return {
      paint: (ctx, w, h) => { ctx.fillStyle = dark ? "#000000" : "#ffffff"; ctx.fillRect(0, 0, w, h); },
      outBubble: "#3797f0", outText: "#ffffff",
      inBubble: dark ? "#262626" : "#efefef", inText: dark ? "#ffffff" : "#000000",
      radius: 20, fontSize: 16,
    };
  }

  function drawHeader(ctx: CanvasRenderingContext2D, w: number) {
    const dark = themeEl!.value === "dark";
    ctx.fillStyle = dark ? "#000000" : "#ffffff"; ctx.fillRect(0, 0, w, HEADER);
    ctx.fillStyle = dark ? "#262626" : "#dbdbdb"; ctx.fillRect(0, HEADER - 1, w, 1);
    ctx.strokeStyle = dark ? "#ffffff" : "#000000"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(22, 22); ctx.lineTo(14, 28); ctx.lineTo(22, 34); ctx.stroke();
    avatar(ctx, 54, HEADER / 2, 32, { img: avatarImg, name: nameEl!.value, bg: "#c13584" });
    ctx.fillStyle = dark ? "#ffffff" : "#000000"; ctx.font = `600 15px ${SANS}`;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(nameEl!.value || "username", 76, HEADER / 2);
    ctx.textBaseline = "alphabetic";
  }

  let getMsgs: () => Msg[];
  function render() { renderChat(canvas!, { messages: getMsgs(), theme: theme(), width: 420, headerH: HEADER, drawHeader }); }

  getMsgs = createChatEditor(list, add, [
    { side: "in", text: "omg did you see the new drop? 👀" },
    { side: "out", text: "just ordered it 🔥" },
    { side: "in", text: "no wayyy send pics when it arrives" },
  ], render);

  nameEl.addEventListener("input", render);
  themeEl.addEventListener("change", render);
  avatarEl.addEventListener("change", async () => { const f = avatarEl.files?.[0]; avatarImg = f ? await loadImage(f).catch(() => null) : null; render(); });
  downloadBtn.addEventListener("click", async () => downloadBlob(await canvasToBlob(canvas, "image/png"), "instagram_dm_doctech.png"));
  render();
}
