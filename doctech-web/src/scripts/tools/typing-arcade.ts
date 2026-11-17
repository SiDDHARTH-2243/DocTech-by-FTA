// VOIDSTRIKE â€” canvas renderer, game loop and input for the arcade shooter.
//
// All game RULES live in lib/arcade.ts; this file only draws that state, feeds it
// keystrokes and runs the clock. Performance notes:
//   â€¢ one canvas, cleared per frame, DPR capped at 2
//   â€¢ particles are a cached radial-gradient sprite blitted with `lighter`
//     (additive) â€” far cheaper than per-particle gradients or shadowBlur
//   â€¢ shadowBlur is reserved for the ship, enemy hulls and the LOCKED word only
//   â€¢ fixed-timestep accumulator, so physics are identical at 30/60/144 Hz
import { Arcade, type Enemy, type TypeResult } from "../lib/arcade";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const root = $("va");
const arena = $("va-arena");
const canvas = $<HTMLCanvasElement>("va-canvas");

if (root && arena && canvas) {
  const ctx = canvas.getContext("2d", { alpha: true })!;

  /* â”€â”€ Theme: scope class + cyber fonts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     Dark mode is locked by the Layout's `forceDark` inline script (before first
     paint, restored on leave). This only owns the arcade scope class and the
     address-bar colour. */
  const de = document.documentElement;
  de.classList.add("arcade-active");
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  metaTheme?.setAttribute("content", "#080503");

  if (!document.getElementById("va-fonts")) {
    const link = document.createElement("link");
    link.id = "va-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap";
    document.head.appendChild(link);
  }
  window.addEventListener("pagehide", () => {
    de.classList.remove("arcade-active");
    metaTheme?.setAttribute("content", "#f4efe7");
  });

  // Canvas text needs the face actually loaded, else it silently falls back.
  let fontReady = false;
  const MONO = (px: number, weight = "400") =>
    `${weight} ${px}px ${fontReady ? '"Share Tech Mono", ' : ""}ui-monospace, SFMono-Regular, Menlo, monospace`;
  document.fonts?.load('16px "Share Tech Mono"').then(
    () => {
      fontReady = true;
    },
    () => {},
  );

  /* â”€â”€ Sizing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  let cssW = 800;
  let cssH = 500;
  const game = new Arcade(cssW, cssH);

  function resize() {
    const rect = arena!.getBoundingClientRect();
    cssW = Math.max(240, rect.width);
    cssH = Math.max(240, rect.height);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas!.width = Math.round(cssW * dpr);
    canvas!.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    game.resize(cssW, cssH);
    makeStars();
    render(); // repaint immediately â€” never wait on rAF for a resize
  }

  /* â”€â”€ Starfield (presentation only, not part of the sim) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  interface Star {
    x: number;
    y: number;
    z: number;
    s: number;
  }
  let stars: Star[] = [];
  function makeStars() {
    const n = Math.round((cssW * cssH) / 5200); // density scales with area
    stars = Array.from({ length: Math.min(260, Math.max(60, n)) }, () => ({
      x: Math.random() * cssW,
      y: Math.random() * cssH,
      z: Math.random(),
      s: Math.random() < 0.85 ? 1 : 2,
    }));
  }
  function stepStars(dt: number) {
    for (const st of stars) {
      st.y += (12 + st.z * 78) * dt;
      if (st.y > cssH) {
        st.y = -2;
        st.x = Math.random() * cssW;
      }
    }
  }

  /* â”€â”€ Cached particle sprites (additive blits) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const SPRITE_TINTS = ["255,92,26", "255,61,43", "255,214,69"];
  const sprites: HTMLCanvasElement[] = SPRITE_TINTS.map((rgb) => {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, `rgba(${rgb},1)`);
    grad.addColorStop(0.4, `rgba(${rgb},0.55)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
    return c;
  });

  /* â”€â”€ Sound (tiny synth, no assets) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const SOUND_KEY = "doctech-arcade-sound";
  let soundOn = localStorage.getItem(SOUND_KEY) !== "off";
  let actx: AudioContext | null = null;
  function audio(): AudioContext | null {
    if (!soundOn) return null;
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      actx = actx ?? new Ctor();
      if (actx.state === "suspended") void actx.resume();
      return actx;
    } catch {
      return null;
    }
  }
  function blip(from: number, to: number, dur: number, type: OscillatorType, gain: number) {
    const ac = audio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    const t0 = ac.currentTime;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  }
  function sfx(kind: TypeResult) {
    if (kind === "hit" || kind === "lock") blip(880, 420, 0.07, "square", 0.03);
    else if (kind === "kill") {
      blip(220, 40, 0.3, "sawtooth", 0.08);
      blip(660, 120, 0.22, "triangle", 0.04);
    } else if (kind === "miss") blip(150, 90, 0.07, "sawtooth", 0.035);
  }
  const sfxOver = () => {
    blip(320, 30, 0.9, "sawtooth", 0.09);
    blip(150, 25, 1.1, "square", 0.05);
  };

  /* â”€â”€ Rendering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function drawStars() {
    for (const st of stars) {
      // Warm-tinted starfield so the backdrop sits in the same ember world as
      // the rest of the arcade rather than reading as cold blue space.
      ctx.fillStyle = st.z > 0.66 ? "rgba(255,240,224,0.85)" : st.z > 0.33 ? "rgba(230,190,150,0.5)" : "rgba(170,125,90,0.35)";
      ctx.fillRect(st.x, st.y, st.s, st.s);
    }
  }

  function enemyPath(e: Enemy) {
    const r = e.r;
    ctx.beginPath();
    if (e.kind === "swift") {
      ctx.moveTo(0, r);
      ctx.lineTo(r * 0.62, -r * 0.5);
      ctx.lineTo(0, -r * 0.16);
      ctx.lineTo(-r * 0.62, -r * 0.5);
    } else if (e.kind === "hulk") {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
    } else {
      ctx.moveTo(0, r);
      ctx.lineTo(r * 0.85, -r * 0.55);
      ctx.lineTo(0, -r * 0.25);
      ctx.lineTo(-r * 0.85, -r * 0.55);
    }
    ctx.closePath();
  }

  function drawEnemies() {
    const locked = game.locked();
    for (const e of game.enemies) {
      const isLocked = locked?.id === e.id;
      const hue = e.kind === "hulk" ? "255,61,43" : e.kind === "swift" ? "255,214,69" : "255,92,26";

      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(Math.sin(e.spin) * 0.14);
      ctx.lineWidth = 2;
      ctx.shadowColor = `rgba(${hue},0.9)`;
      ctx.shadowBlur = isLocked ? 18 : 10;
      ctx.strokeStyle = e.flash > 0 ? "#ffffff" : `rgba(${hue},0.95)`;
      ctx.fillStyle = `rgba(${hue},${0.1 + e.flash * 0.5})`;
      enemyPath(e);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      if (isLocked) drawLockBrackets(e);
      drawWord(e, isLocked);
    }
  }

  function drawLockBrackets(e: Enemy) {
    const t = performance.now() / 1000;
    const d = e.r + 12 + Math.sin(t * 6) * 2;
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(t * 0.9);
    // Bright cream, not gold — gold is now the "swift" enemy hull colour, and the
    // lock indicator has to read unmistakably against every enemy type.
    ctx.strokeStyle = "rgba(255,245,228,0.98)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(255,150,40,0.95)";
    ctx.shadowBlur = 14;
    const arm = d * 0.45;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(d, d - arm);
      ctx.lineTo(d, d);
      ctx.lineTo(d - arm, d);
      ctx.stroke();
    }
    ctx.restore();

    // Targeting beam from the ship.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(255,214,69,0.16)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(game.shipX, game.shipY - 14);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawWord(e: Enemy, isLocked: boolean) {
    const size = e.kind === "hulk" ? 17 : 15;
    ctx.font = MONO(size, "400");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const charW = ctx.measureText("M").width;
    const total = e.word.length * charW;
    const startX = e.x - total / 2 + charW / 2;
    const y = e.y + e.r + 16;

    // Backing plate keeps words legible over the starfield.
    ctx.save();
    ctx.fillStyle = "rgba(3,6,14,0.62)";
    ctx.fillRect(e.x - total / 2 - 5, y - size * 0.72, total + 10, size * 1.44);
    if (isLocked) {
      ctx.strokeStyle = "rgba(255,214,69,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(e.x - total / 2 - 5, y - size * 0.72, total + 10, size * 1.44);
    }
    ctx.restore();

    for (let i = 0; i < e.word.length; i++) {
      const done = i < e.typed;
      ctx.save();
      if (done) {
        // Shot-away letters linger as ghosts so progress is legible.
        ctx.fillStyle = "rgba(255,92,26,0.22)";
      } else if (isLocked) {
        ctx.fillStyle = "#fff1cf";
        ctx.shadowColor = "rgba(255,214,69,0.9)";
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = "#ffeadb";
      }
      ctx.fillText(e.word[i], startX + i * charW, y);
      ctx.restore();
    }
  }

  function drawBullets() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (const b of game.bullets) {
      const tx = b.x - b.vx * 0.018;
      const ty = b.y - b.vy * 0.018;
      ctx.strokeStyle = b.kill ? "rgba(255,214,69,0.85)" : "rgba(255,92,26,0.8)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const p of game.particles) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      const s = p.size * (1 + (1 - a) * 2.2);
      ctx.drawImage(sprites[p.tint] ?? sprites[0], p.x - s, p.y - s, s * 2, s * 2);
    }
    ctx.restore();
  }

  function drawShip() {
    if (game.status === "over") return;
    const { shipX: x, shipY: y } = game;
    const t = performance.now() / 1000;

    // Hull line â€” the threshold enemies must not cross.
    ctx.save();
    ctx.strokeStyle = "rgba(255,92,26,0.16)";
    ctx.setLineDash([6, 10]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y - 26);
    ctx.lineTo(cssW, y - 26);
    ctx.stroke();
    ctx.restore();

    // Engine plume.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const flame = 12 + Math.sin(t * 22) * 4;
    const g = ctx.createLinearGradient(x, y + 6, x, y + 6 + flame);
    // Both stops stay in the ember family — RGBA gradients interpolate the colour
    // as well as the alpha, so a cool end-stop would wash the flame out mid-tail.
    g.addColorStop(0, "rgba(255,92,26,0.75)");
    g.addColorStop(1, "rgba(255,214,69,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 6);
    ctx.lineTo(x + 6, y + 6);
    ctx.lineTo(x, y + 6 + flame);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Hull.
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = "rgba(255,92,26,0.9)";
    ctx.shadowBlur = 16;
    ctx.strokeStyle = "#ffd0a6";
    ctx.fillStyle = "rgba(255,92,26,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(15, 10);
    ctx.lineTo(0, 3);
    ctx.lineTo(-15, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, cssW, cssH);
    const s = game.shake;
    ctx.save();
    if (s > 0.2) ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    drawStars();
    drawEnemies();
    drawBullets();
    drawParticles();
    drawShip();
    ctx.restore();
  }

  /* â”€â”€ HUD + overlays â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const titleEl = $("va-title");
  const pauseEl = $("va-pause");
  const overEl = $("va-over");
  const set = (id: string, v: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };

  let hudAt = 0;
  function hud(now: number) {
    if (now - hudAt < 100) return; // 10 Hz is plenty for numbers
    hudAt = now;
    const st = game.stats();
    set("va-score", st.score.toLocaleString());
    set("va-wave", String(st.wave));
    set("va-combo", `Ã—${game.multiplier()}`);
    set("va-wpm", String(st.wpm));
    set("va-acc", `${st.accuracy}%`);
  }

  const showScreen = (el: HTMLElement | null) => {
    for (const s of [titleEl, pauseEl, overEl]) s?.classList.toggle("hidden", s !== el);
  };

  function showOver() {
    const st = game.stats();
    set("va-final-score", st.score.toLocaleString());
    set("va-o-wave", String(st.wave));
    set("va-o-kills", String(st.kills));
    set("va-o-acc", `${st.accuracy}%`);
    set("va-o-wpm", String(st.wpm));
    set("va-o-combo", `Ã—${st.bestCombo}`);
    set("va-o-time", `${Math.round(st.timeMs / 1000)}s`);
    const best = game.loadBest();
    const bestEl = $("va-final-best");
    if (bestEl) {
      bestEl.textContent = st.score >= best && st.score > 0 ? "â˜… NEW HIGH SCORE" : `HIGH SCORE ${best.toLocaleString()}`;
    }
    set("va-best-idle", best.toLocaleString());
    showScreen(overEl);
  }

  /* â”€â”€ Loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const STEP = 1 / 60;
  let acc = 0;
  let last = 0;
  let raf = 0;
  let wasOver = false;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!last) last = now;
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.25) dt = 0.25; // a stalled tab must not fast-forward the world
    acc += dt;
    let guard = 0;
    while (acc >= STEP && guard++ < 5) {
      game.step(STEP);
      stepStars(STEP);
      acc -= STEP;
    }
    render();
    hud(now);

    if (game.status === "over" && !wasOver) {
      wasOver = true;
      sfxOver();
      showOver();
    }
  }

  function startLoop() {
    if (!raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  }
  function stopLoop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  /* â”€â”€ Control â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function launch() {
    wasOver = false;
    game.start();
    showScreen(null);
    hudAt = 0;
    capture.focus({ preventScroll: true });
    startLoop();
  }

  function togglePause() {
    if (game.status === "running") {
      game.pause();
      showScreen(pauseEl);
    } else if (game.status === "paused") {
      game.resume();
      showScreen(null);
    }
  }

  // Hidden input purely to raise the on-screen keyboard for touch devices.
  const capture = document.createElement("input");
  capture.setAttribute("aria-hidden", "true");
  capture.tabIndex = -1;
  capture.autocapitalize = "off";
  capture.autocomplete = "off";
  capture.spellcheck = false;
  capture.style.cssText = "position:absolute;left:-9999px;top:0;width:1px;height:1px;opacity:0";
  arena.appendChild(capture);

  arena.addEventListener("mousedown", (e) => {
    e.preventDefault();
    if (game.status === "idle") launch();
    else capture.focus({ preventScroll: true });
  });
  $("va-start")?.addEventListener("click", launch);
  $("va-retry")?.addEventListener("click", launch);

  /**
   * True when the keystroke belongs to a real text field â€” the âŒ˜K palette, the
   * sidebar filter, anything contenteditable. Without this the running game
   * swallows (and preventDefaults) those keys, breaking site search mid-run.
   * Our own off-screen capture input is exempt: it exists to receive them.
   */
  function typingElsewhere(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el || el === capture) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable === true;
  }

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return; // leave âŒ˜K and friends alone
      if (typingElsewhere(e.target)) return; // don't hijack the palette / search
      if (e.key === "Tab") {
        e.preventDefault();
        launch();
        return;
      }
      if (e.key === "Escape") {
        togglePause();
        return;
      }
      const isLetter = e.key.length === 1 && /[a-z0-9]/i.test(e.key);
      if (!isLetter) return;

      if (game.status === "idle" || game.status === "over") {
        e.preventDefault();
        launch();
        return;
      }
      if (game.status === "paused") return;
      e.preventDefault();
      sfx(game.type(e.key));
    },
    true,
  );

  // Auto-pause rather than letting the player die to a lost tab.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && game.status === "running") {
      game.pause();
      showScreen(pauseEl);
    }
  });
  window.addEventListener("blur", () => {
    if (game.status === "running") {
      game.pause();
      showScreen(pauseEl);
    }
  });

  const soundBtn = $("va-sound");
  function paintSound() {
    soundBtn?.setAttribute("aria-pressed", String(soundOn));
    set("va-sound-label", soundOn ? "sound" : "muted");
  }
  soundBtn?.addEventListener("click", () => {
    soundOn = !soundOn;
    localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
    paintSound();
    if (soundOn) sfx("hit");
  });

  /* â”€â”€ Boot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  new ResizeObserver(resize).observe(arena);
  resize();
  paintSound();
  set("va-best-idle", game.loadBest().toLocaleString());
  showScreen(titleEl);
  startLoop(); // idle starfield drifts behind the title card
  window.addEventListener("pagehide", stopLoop);

  // Dev-only handle so the simulation can be driven deterministically in the
  // preview, where requestAnimationFrame never fires (handoff Â§9a).
  // `import.meta.env.DEV` is statically false in production, so this is stripped.
  if (import.meta.env.DEV) {
    (window as unknown as { __voidstrike: unknown }).__voidstrike = {
      game,
      render,
      launch,
      // ResizeObserver callbacks are delivered on the rendering step, which is
      // suspended in a hidden tab just like rAF â€” expose resize() so the
      // re-layout path stays verifiable.
      resize,
      step: (dt: number) => {
        game.step(dt);
        stepStars(dt);
      },
      // Mirrors exactly what frame() does, minus rAF, so a driven run exercises
      // the renderer, the HUD and the game-over transition just like a real one.
      frames: (n: number, dt = STEP) => {
        for (let i = 0; i < n; i++) {
          game.step(dt);
          stepStars(dt);
        }
        render();
        hudAt = 0; // bypass the 10 Hz throttle when stepping manually
        hud(performance.now());
        if (game.status === "over" && !wasOver) {
          wasOver = true;
          showOver();
        }
      },
    };
  }
}
