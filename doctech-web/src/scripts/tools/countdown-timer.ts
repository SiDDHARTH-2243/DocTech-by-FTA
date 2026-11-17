// Countdown & Pomodoro Timer — setInterval-based, fully client-side.
import { toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new Ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ac.destination);
    gain.gain.setValueAtTime(0.15, ac.currentTime);
    osc.start();
    osc.stop(ac.currentTime + 0.35);
  } catch {
    /* audio not available */
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

// ── Pomodoro ────────────────────────────────────────────────────────────────
const pDisplay = $("pomo-display");
const pPhase = $("pomo-phase");
const pStart = $("pomo-start");
const pReset = $("pomo-reset");
const pWork = $<HTMLInputElement>("pomo-work");
const pBreak = $<HTMLInputElement>("pomo-break");

if (pDisplay && pStart) {
  let phase: "Work" | "Break" = "Work";
  let remaining = 25 * 60;
  let timer: number | null = null;

  function workSecs() {
    return (parseInt(pWork?.value || "25") || 25) * 60;
  }
  function breakSecs() {
    return (parseInt(pBreak?.value || "5") || 5) * 60;
  }
  function paint() {
    pDisplay!.textContent = `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)}`;
    if (pPhase) pPhase.textContent = phase;
  }
  function stop() {
    if (timer !== null) clearInterval(timer);
    timer = null;
    pStart!.textContent = "Start";
  }
  function reset() {
    stop();
    phase = "Work";
    remaining = workSecs();
    paint();
  }
  function tick() {
    remaining--;
    if (remaining < 0) {
      beep();
      phase = phase === "Work" ? "Break" : "Work";
      remaining = phase === "Work" ? workSecs() : breakSecs();
      toast(phase === "Break" ? "Break time! 🎉" : "Back to work 💪", "info");
    }
    paint();
  }

  pStart.addEventListener("click", () => {
    if (timer !== null) {
      stop();
    } else {
      if (remaining <= 0) remaining = workSecs();
      timer = window.setInterval(tick, 1000);
      pStart!.textContent = "Pause";
    }
  });
  pReset?.addEventListener("click", reset);
  [pWork, pBreak].forEach((el) =>
    el?.addEventListener("input", () => {
      if (timer === null) reset();
    }),
  );
  reset();
}

// ── Countdown ────────────────────────────────────────────────────────────────
const cDisplay = $("cd-display");
const cTarget = $<HTMLInputElement>("cd-target");
const cStart = $("cd-start");
const cDone = $("cd-done");

if (cDisplay && cTarget && cStart) {
  let timer: number | null = null;

  function paint() {
    const target = new Date(cTarget!.value).getTime();
    if (isNaN(target)) {
      cDisplay!.textContent = "—";
      return;
    }
    let diff = Math.floor((target - Date.now()) / 1000);
    if (diff <= 0) {
      cDisplay!.textContent = "00d 00:00:00";
      cDone?.classList.remove("hidden");
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
        beep();
      }
      return;
    }
    cDone?.classList.add("hidden");
    const d = Math.floor(diff / 86400);
    diff %= 86400;
    const h = Math.floor(diff / 3600);
    diff %= 3600;
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    cDisplay!.textContent = `${pad(d)}d ${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  cStart.addEventListener("click", () => {
    if (!cTarget!.value || isNaN(new Date(cTarget!.value).getTime())) {
      toast("Pick a target date and time", "err");
      return;
    }
    if (timer !== null) clearInterval(timer);
    paint();
    timer = window.setInterval(paint, 1000);
  });
}
