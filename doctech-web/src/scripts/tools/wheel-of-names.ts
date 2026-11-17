// Wheel of Names — canvas wheel with eased spin to a crypto-random winner.
import { toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const namesEl = $<HTMLTextAreaElement>("wheel-names");
const canvas = $<HTMLCanvasElement>("wheel-canvas");
const spinBtn = $("wheel-spin");
const winnerEl = $("wheel-winner");
const removeEl = $<HTMLInputElement>("wheel-remove");

if (namesEl && canvas && spinBtn) {
  const ctx = canvas.getContext("2d")!;
  const COLORS = ["#ff5c1a", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6", "#ef4444"];
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = cx - 6;

  let angle = 0; // current rotation (radians)
  let spinning = false;

  function names(): string[] {
    return namesEl!.value.split("\n").map((s) => s.trim()).filter(Boolean);
  }

  function draw() {
    const list = names();
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    if (list.length === 0) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 15px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Add some names", cx, cy);
      return;
    }
    const seg = (Math.PI * 2) / list.length;
    for (let i = 0; i < list.length; i++) {
      const start = angle + i * seg;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      // label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + seg / 2);
      ctx.fillStyle = "#fff";
      ctx.font = "700 14px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const label = list[i].length > 14 ? list[i].slice(0, 13) + "…" : list[i];
      ctx.fillText(label, r - 12, 0);
      ctx.restore();
    }
    // hub
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
  }

  function randInt(max: number): number {
    const limit = Math.floor(0xffffffff / max) * max;
    const buf = new Uint32Array(1);
    let x = 0;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % max;
  }

  function spin() {
    const list = names();
    if (spinning) return;
    if (list.length < 2) {
      toast("Add at least two names", "err");
      return;
    }
    spinning = true;
    if (winnerEl) winnerEl.textContent = "";

    const seg = (Math.PI * 2) / list.length;
    const winner = randInt(list.length);
    // Pointer sits at angle 0 (pointing left, at 3 o'clock we drew right-aligned labels
    // toward radius; pointer is on the right ◀). We want the winner segment centered at 0.
    const target = Math.PI * 2 * 6 + (Math.PI * 2 - (winner * seg + seg / 2));
    const startAngle = angle % (Math.PI * 2);
    const total = target - startAngle;
    const duration = 4200;
    const t0 = performance.now();

    function frame(now: number) {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      angle = startAngle + total * eased;
      draw();
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        spinning = false;
        if (winnerEl) winnerEl.textContent = `🎉 ${list[winner]}`;
        if (removeEl?.checked) {
          const remaining = list.filter((_, i) => i !== winner);
          namesEl!.value = remaining.join("\n");
          draw();
        }
      }
    }
    requestAnimationFrame(frame);
  }

  namesEl.addEventListener("input", () => !spinning && draw());
  spinBtn.addEventListener("click", spin);
  draw();
}
