// WhatsApp Chat Generator — client-side canvas mockup.
import { canvasToBlob, downloadBlob, loadImage } from "../lib/image";
import { renderChat, avatar, SANS, type ChatTheme, type Msg } from "../lib/mockup";
import { createChatEditor } from "../lib/chatEditor";

const canvas = document.getElementById("wa-canvas") as HTMLCanvasElement | null;
const nameEl = document.getElementById("wa-name") as HTMLInputElement | null;
const themeEl = document.getElementById("wa-theme") as HTMLSelectElement | null;
const avatarEl = document.getElementById("wa-avatar") as HTMLInputElement | null;
const list = document.getElementById("wa-list");
const add = document.getElementById("wa-add");
const downloadBtn = document.getElementById("wa-download");

if (canvas && nameEl && themeEl && avatarEl && list && add && downloadBtn) {
  let avatarImg: HTMLImageElement | null = null;
  const HEADER = 56;

  function theme(): ChatTheme {
    const dark = themeEl!.value === "dark";
    return {
      paint: (ctx, w, h) => { ctx.fillStyle = dark ? "#0b141a" : "#e5ddd5"; ctx.fillRect(0, 0, w, h); },
      outBubble: dark ? "#005c4b" : "#d9fdd3", outText: dark ? "#e9edef" : "#111b21",
      inBubble: dark ? "#202c33" : "#ffffff", inText: dark ? "#e9edef" : "#111b21",
      radius: 9, fontSize: 16,
    };
  }

  function drawHeader(ctx: CanvasRenderingContext2D, w: number) {
    const dark = themeEl!.value === "dark";
    ctx.fillStyle = dark ? "#202c33" : "#075e54"; ctx.fillRect(0, 0, w, HEADER);
    avatar(ctx, 34, HEADER / 2, 38, { img: avatarImg, name: nameEl!.value, bg: "#128c7e" });
    ctx.fillStyle = "#fff"; ctx.font = `600 16px ${SANS}`; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
    ctx.fillText(nameEl!.value || "Contact", 62, 26);
    ctx.fillStyle = dark ? "#8696a0" : "#d7efe9"; ctx.font = `12px ${SANS}`;
    ctx.fillText("online", 62, 43);
  }

  let getMsgs: () => Msg[];
  function render() { renderChat(canvas!, { messages: getMsgs(), theme: theme(), width: 420, headerH: HEADER, drawHeader }); }

  getMsgs = createChatEditor(list, add, [
    { side: "in", text: "Hey! Are you coming tonight? 🎉" },
    { side: "out", text: "Yeah! Just leaving now 🚗" },
    { side: "in", text: "Awesome — see you soon!" },
  ], render);

  nameEl.addEventListener("input", render);
  themeEl.addEventListener("change", render);
  avatarEl.addEventListener("change", async () => {
    const f = avatarEl.files?.[0];
    avatarImg = f ? await loadImage(f).catch(() => null) : null;
    render();
  });
  downloadBtn.addEventListener("click", async () => downloadBlob(await canvasToBlob(canvas, "image/png"), "whatsapp_chat_doctech.png"));
  render();
}
