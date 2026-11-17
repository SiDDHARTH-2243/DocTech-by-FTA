// iMessage Chat Generator — client-side canvas mockup.
import { canvasToBlob, downloadBlob, loadImage } from "../lib/image";
import { renderChat, avatar, SANS, type ChatTheme, type Msg } from "../lib/mockup";
import { createChatEditor } from "../lib/chatEditor";

const canvas = document.getElementById("im-canvas") as HTMLCanvasElement | null;
const nameEl = document.getElementById("im-name") as HTMLInputElement | null;
const themeEl = document.getElementById("im-theme") as HTMLSelectElement | null;
const avatarEl = document.getElementById("im-avatar") as HTMLInputElement | null;
const list = document.getElementById("im-list");
const add = document.getElementById("im-add");
const downloadBtn = document.getElementById("im-download");

if (canvas && nameEl && themeEl && avatarEl && list && add && downloadBtn) {
  let avatarImg: HTMLImageElement | null = null;
  const HEADER = 64;

  function theme(): ChatTheme {
    const dark = themeEl!.value === "dark";
    return {
      paint: (ctx, w, h) => { ctx.fillStyle = dark ? "#000000" : "#ffffff"; ctx.fillRect(0, 0, w, h); },
      outBubble: "#007aff", outText: "#ffffff",
      inBubble: dark ? "#26252a" : "#e9e9eb", inText: dark ? "#ffffff" : "#000000",
      radius: 18, fontSize: 16,
    };
  }

  function drawHeader(ctx: CanvasRenderingContext2D, w: number) {
    const dark = themeEl!.value === "dark";
    ctx.fillStyle = dark ? "#000000" : "#ffffff"; ctx.fillRect(0, 0, w, HEADER);
    ctx.fillStyle = dark ? "#1c1c1e" : "#e5e5ea"; ctx.fillRect(0, HEADER - 1, w, 1);
    ctx.strokeStyle = "#007aff"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(20, 24); ctx.lineTo(13, 30); ctx.lineTo(20, 36); ctx.stroke();
    avatar(ctx, w / 2, 24, 34, { img: avatarImg, name: nameEl!.value, bg: "#8e8e93" });
    ctx.fillStyle = dark ? "#ffffff" : "#000000"; ctx.font = `600 13px ${SANS}`;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(nameEl!.value || "Contact", w / 2, 54);
    ctx.textAlign = "left";
  }

  function drawFooter(ctx: CanvasRenderingContext2D, w: number, y: number) {
    ctx.fillStyle = "#8e8e93"; ctx.font = `11px ${SANS}`; ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
    ctx.fillText("Delivered", w - 16, y + 11);
    ctx.textAlign = "left";
  }

  let getMsgs: () => Msg[];
  function render() {
    const msgs = getMsgs();
    const lastOut = msgs.length > 0 && msgs[msgs.length - 1].side === "out";
    renderChat(canvas!, { messages: msgs, theme: theme(), width: 420, headerH: HEADER, drawHeader, footerH: lastOut ? 16 : 0, drawFooter: lastOut ? drawFooter : undefined });
  }

  getMsgs = createChatEditor(list, add, [
    { side: "in", text: "Wait you got the job?? 🎉" },
    { side: "out", text: "I did!! Start in two weeks 😄" },
    { side: "in", text: "So proud of you!!" },
  ], render);

  nameEl.addEventListener("input", render);
  themeEl.addEventListener("change", render);
  avatarEl.addEventListener("change", async () => { const f = avatarEl.files?.[0]; avatarImg = f ? await loadImage(f).catch(() => null) : null; render(); });
  downloadBtn.addEventListener("click", async () => downloadBlob(await canvasToBlob(canvas, "image/png"), "imessage_chat_doctech.png"));
  render();
}
