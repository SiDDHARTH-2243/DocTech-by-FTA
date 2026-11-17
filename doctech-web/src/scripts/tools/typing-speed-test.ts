// Typing Speed Test â€” a Monkeytype-class engine: time / words / quote modes,
// live WPM, animated caret, per-character states, restart-on-Tab, a results
// screen with a speed-over-time graph, consistency, and local best scores.
//
// The math lives in lib/typing.ts (pure + tested by driving); this file owns the
// DOM, the keystroke state machine, timing, focus and rendering.
import {
  bestFor,
  computeChars,
  consistency,
  generateWords,
  QUOTES,
  randomQuote,
  saveScore,
  tokenize,
  wpm,
  type TestResult,
} from "../lib/typing";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const root = $("tt");
const viewport = $("tt-viewport");
const wordsEl = $("tt-words");
const caret = $("tt-caret");
const capture = $<HTMLInputElement>("tt-capture");
const veil = $("tt-veil");

if (root && viewport && wordsEl && caret && capture && veil) {
  type Mode = "time" | "words" | "quote";

  /* â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const TIME_VALUES = [15, 30, 60, 120];
  const WORD_VALUES = [10, 25, 50, 100];
  const QUOTE_VALUES = ["short", "medium", "long"] as const;
  const CONFIG_KEY = "doctech-typing-config";

  const config = {
    mode: "time" as Mode,
    time: 30,
    words: 25,
    quote: "medium" as (typeof QUOTE_VALUES)[number],
    punctuation: false,
    numbers: false,
  };

  try {
    Object.assign(config, JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}"));
  } catch {
    /* ignore malformed config */
  }
  const persist = () => {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch {
      /* non-fatal */
    }
  };

  /* â”€â”€ Test state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  let words: string[] = [];
  let typed: string[] = [""];
  let wordEls: HTMLElement[] = [];
  let wordIndex = 0;
  let running = false;
  let finished = false;
  let startTime = 0;
  let blurAt = 0;
  let timerId: number | undefined;

  // Keystroke accounting for accuracy (corrections never restore it).
  let correctKeys = 0;
  let incorrectKeys = 0;

  // Per-second samples for the graph + consistency.
  let samples: { t: number; net: number; raw: number; err: number }[] = [];
  let lastSecond = 0;
  let lastIncorrect = 0;

  let lineHeight = 40;

  /* â”€â”€ Cyber: combo, sound, screen effects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const comboEl = $("tt-combo");
  const comboVal = $("tt-combo-val");
  const comboTag = $("tt-combo-tag");
  const flashEl = $("tt-flash");
  const soundBtn = $("tt-sound");

  let combo = 0;
  let maxCombo = 0;
  let booting = true; // the boot overlay swallows input until dismissed

  const SOUND_KEY = "doctech-typing-sound";
  let soundOn = localStorage.getItem(SOUND_KEY) !== "off";

  // Lazy Web Audio â€” everything is synthesised (no assets); the context resumes
  // on the first keystroke, which satisfies the autoplay gesture requirement.
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
  function tone(freq: number, dur = 0.06, type: OscillatorType = "square", gain = 0.06) {
    const ac = audio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(g).connect(ac.destination);
    const t0 = ac.currentTime;
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.start(t0);
    osc.stop(t0 + dur);
  }
  const sndKey = () => tone(420 + Math.min(combo, 40) * 6, 0.035, "square", 0.03); // pitch rises with combo
  const sndErr = () => tone(90, 0.14, "sawtooth", 0.09);
  const sndCombo = (lvl: number) => {
    tone(660 + lvl * 40, 0.09, "triangle", 0.07);
    tone(990 + lvl * 40, 0.12, "triangle", 0.05);
  };
  const arpeggio = (notes: number[], type: OscillatorType, gain: number) =>
    notes.forEach((f, i) => window.setTimeout(() => tone(f, 0.17, type, gain), i * 85));
  const sndFinish = () => arpeggio([523, 659, 784, 1047], "triangle", 0.06);
  const sndBest = () => arpeggio([784, 988, 1319, 1568], "square", 0.05);

  function restartAnim(el: HTMLElement, cls: string) {
    el.classList.remove(cls);
    void el.offsetWidth; // force reflow so the animation replays
    el.classList.add(cls);
  }
  const shake = () => restartAnim(viewport!, "tt-shake");
  function flash(kind: "err" | "combo") {
    if (!flashEl) return;
    flashEl.classList.remove("err", "combo");
    void flashEl.offsetWidth;
    flashEl.classList.add(kind);
  }

  const COMBO_MILESTONES = new Set([10, 25, 50, 75, 100, 150, 200, 300]);
  const setIntensity = () => root!.style.setProperty("--cy-intensity", String(Math.min(1, combo / 120)));

  function showCombo() {
    if (!comboEl || !comboVal) return;
    comboVal.textContent = String(combo);
    comboEl.classList.toggle("show", combo >= 5);
    if (combo >= 5) restartAnim(comboEl, "bump");
  }
  function bumpCombo() {
    combo++;
    if (combo > maxCombo) maxCombo = combo;
    setIntensity();
    showCombo();
    if (COMBO_MILESTONES.has(combo)) {
      flash("combo");
      sndCombo([...COMBO_MILESTONES].indexOf(combo));
      if (comboTag) comboTag.textContent = combo >= 100 ? "OVERCLOCK" : combo >= 50 ? "SURGE" : "COMBO";
    }
  }
  function breakCombo() {
    combo = 0;
    setIntensity();
    showCombo();
    if (comboTag) comboTag.textContent = "COMBO";
  }

  /* â”€â”€ Word buffer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function makeWordEl(word: string): HTMLElement {
    const el = document.createElement("span");
    el.className = "tt-word";
    for (const ch of word) {
      const c = document.createElement("span");
      c.className = "tt-c";
      c.textContent = ch;
      el.appendChild(c);
    }
    return el;
  }

  function buildWords(list: string[]) {
    words = list;
    typed = [""];
    wordEls = list.map(makeWordEl);
    wordsEl!.replaceChildren(...wordEls);
  }

  function appendWords(list: string[]) {
    const els = list.map(makeWordEl);
    words.push(...list);
    wordEls.push(...els);
    wordsEl!.append(...els);
  }

  /** Rebuild one word's character spans from its typed value. */
  function renderWord(i: number) {
    const el = wordEls[i];
    if (!el) return;
    const target = words[i];
    const got = typed[i] ?? "";
    const span = Math.max(target.length, got.length);
    const frag = document.createDocumentFragment();
    let hasError = false;

    for (let p = 0; p < span; p++) {
      const c = document.createElement("span");
      if (p < target.length) {
        c.textContent = target[p];
        if (p < got.length) {
          const ok = got[p] === target[p];
          c.className = ok ? "tt-c tt-correct" : "tt-c tt-incorrect";
          if (!ok) hasError = true;
        } else {
          c.className = "tt-c";
          if (i < wordIndex) hasError = true; // untyped char in a left-behind word
        }
      } else {
        c.textContent = got[p];
        c.className = "tt-c tt-extra";
        hasError = true;
      }
      frag.appendChild(c);
    }

    el.replaceChildren(frag);
    // Underline a completed word that still holds a mistake.
    el.classList.toggle("tt-word-error", i < wordIndex && hasError);
  }

  /* â”€â”€ Caret + line scrolling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function updateCaret() {
    const el = wordEls[wordIndex];
    if (!el) return;
    const pos = (typed[wordIndex] ?? "").length;
    const kids = el.children;
    let left: number, top: number;

    if (kids.length === 0) {
      left = el.offsetLeft;
      top = el.offsetTop;
    } else if (pos < kids.length) {
      const c = kids[pos] as HTMLElement;
      left = c.offsetLeft;
      top = c.offsetTop;
    } else {
      const c = kids[kids.length - 1] as HTMLElement;
      left = c.offsetLeft + c.offsetWidth;
      top = c.offsetTop;
    }

    // Keep the active line as the middle row once we've descended past line one.
    const line = Math.round(top / lineHeight);
    const offset = Math.max(0, (line - 1) * lineHeight);
    wordsEl!.style.transform = `translateY(${-offset}px)`;
    caret!.style.left = `${left}px`;
    caret!.style.top = `${top - offset}px`;
  }

  let blinkTimer: number | undefined;
  function pokeCaret() {
    caret!.classList.remove("blink");
    window.clearTimeout(blinkTimer);
    blinkTimer = window.setTimeout(() => caret!.classList.add("blink"), 900);
  }

  /* â”€â”€ Focus â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  let focused = false;
  function focus() {
    if (finished) return;
    focused = true;
    viewport!.classList.add("focused");
    capture!.focus({ preventScroll: true });
    pokeCaret();
    if (running && blurAt) {
      // Resume: shift the clock forward by the paused span so no time is lost.
      startTime += Date.now() - blurAt;
      blurAt = 0;
    }
  }
  function unfocus() {
    focused = false;
    viewport!.classList.remove("focused");
    caret!.classList.add("blink");
    if (running) blurAt = Date.now();
  }

  viewport.addEventListener("mousedown", (e) => {
    e.preventDefault(); // don't steal selection; just focus
    focus();
  });
  veil.addEventListener("mousedown", (e) => {
    e.preventDefault();
    focus();
  });
  capture.addEventListener("blur", unfocus);

  /* â”€â”€ Timing + live readout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function elapsed(): number {
    if (!startTime) return 0;
    const end = blurAt || Date.now();
    return end - startTime;
  }

  function liveChars() {
    const c = computeChars(words, typed, wordIndex);
    return { net: c.correct + c.spaces, raw: c.correct + c.incorrect + c.extra + c.spaces };
  }

  function tick() {
    const ms = elapsed();

    if (config.mode === "time") {
      const remaining = Math.max(0, config.time - ms / 1000);
      $("tt-timer")!.textContent = String(Math.ceil(remaining));
      if (remaining <= 0) return finish();
    } else {
      $("tt-timer")!.textContent = `${Math.min(wordIndex, words.length)}/${words.length}`;
    }

    const { net } = liveChars();
    $("tt-wpm-now")!.textContent = String(Math.round(wpm(net, ms)));

    // Record one sample per whole second.
    const sec = Math.floor(ms / 1000);
    if (sec > lastSecond) {
      const lc = liveChars();
      const errThisSec = incorrectKeys - lastIncorrect;
      lastIncorrect = incorrectKeys;
      for (let s = lastSecond + 1; s <= sec; s++) {
        samples.push({
          t: s,
          net: wpm(lc.net, s * 1000),
          raw: wpm(lc.raw, s * 1000),
          err: s === sec ? errThisSec : 0,
        });
      }
      lastSecond = sec;
    }
  }

  function startTest() {
    if (running || finished) return;
    running = true;
    startTime = Date.now();
    lastSecond = 0;
    lastIncorrect = 0;
    samples = [];
    $("tt-live-wpm")!.style.opacity = "1";
    timerId = window.setInterval(tick, 100);
  }

  /* â”€â”€ Keystroke state machine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const MAX_EXTRA = 8; // cap runaway extra characters so the caret stays sane

  function handleChar(ch: string) {
    if (finished) return;
    startTest();
    const target = words[wordIndex];
    const cur = typed[wordIndex] ?? "";
    if (cur.length >= target.length + MAX_EXTRA) return;

    const correct = cur.length < target.length && ch === target[cur.length];
    if (correct) {
      correctKeys++;
      bumpCombo();
      sndKey();
    } else {
      incorrectKeys++;
      breakCombo();
      shake();
      flash("err");
      sndErr();
    }
    typed[wordIndex] = cur + ch;
    renderWord(wordIndex);
    updateCaret();
    pokeCaret();

    // words / quote modes end when the final word is fully typed.
    if (config.mode !== "time" && wordIndex === words.length - 1 && typed[wordIndex].length >= target.length) {
      finish();
    }
  }

  function handleSpace() {
    if (finished) return;
    const cur = typed[wordIndex] ?? "";
    if (cur.length === 0) return; // ignore leading spaces
    startTest();
    correctKeys++; // the separating space is a required, correct keystroke
    bumpCombo();
    sndKey();
    const prev = wordIndex;
    wordIndex++;
    renderWord(prev); // apply any error underline now the word is behind us

    if (config.mode === "time") {
      if (wordIndex > words.length - 12) appendWords(generateWords(30, config));
    } else if (wordIndex >= words.length) {
      return finish();
    }

    if (typed[wordIndex] === undefined) typed[wordIndex] = "";
    updateCaret();
    pokeCaret();
  }

  function handleBackspace(wholeWord: boolean) {
    if (finished) return;
    const cur = typed[wordIndex] ?? "";
    if (cur.length > 0) {
      typed[wordIndex] = wholeWord ? "" : cur.slice(0, -1);
      renderWord(wordIndex);
    } else if (wordIndex > 0) {
      // Step back only into a previous word that still has a mistake.
      const pWord = words[wordIndex - 1];
      const pGot = typed[wordIndex - 1] ?? "";
      const imperfect = pGot !== pWord;
      if (imperfect) {
        wordIndex--;
        wordEls[wordIndex].classList.remove("tt-word-error");
        if (wholeWord) {
          typed[wordIndex] = "";
          renderWord(wordIndex);
        }
      }
    }
    updateCaret();
    pokeCaret();
  }

  document.addEventListener(
    "keydown",
    (e) => {
      if (booting) return; // the boot overlay owns input until it's dismissed
      // Restart works whether or not the surface is focused.
      if (e.key === "Tab") {
        e.preventDefault();
        newTest(true);
        focus();
        return;
      }
      if (!focused) {
        // A printable key on the blurred surface focuses and is then typed.
        if (!finished && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          focus();
          handleChar(e.key);
          e.preventDefault();
        }
        return;
      }
      if (e.key === "Escape") {
        unfocus();
        capture.blur();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace(e.ctrlKey || e.altKey);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return; // leave âŒ˜K etc. alone
      if (e.key === " ") {
        e.preventDefault();
        handleSpace();
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        handleChar(e.key);
      }
    },
    true,
  );

  /* â”€â”€ Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function modeLabel(): string {
    return config.mode === "time"
      ? `time ${config.time}`
      : config.mode === "words"
        ? `words ${config.words}`
        : `quote ${config.quote}`;
  }

  function finish() {
    if (finished) return;
    finished = true;
    running = false;
    window.clearInterval(timerId);
    unfocus();
    capture.blur();

    const ms = elapsed() || 1;
    const chars = computeChars(words, typed, wordIndex);
    const netChars = chars.correct + chars.spaces;
    const rawChars = chars.correct + chars.incorrect + chars.extra + chars.spaces;
    const totalKeys = correctKeys + incorrectKeys;

    const result: TestResult = {
      wpm: Math.round(wpm(netChars, ms)),
      raw: Math.round(wpm(rawChars, ms)),
      accuracy: totalKeys ? Math.round((correctKeys / totalKeys) * 100) : 100,
      consistency: Math.round(consistency(samples.map((s) => s.raw))),
      chars,
      timeMs: ms,
      mode: modeLabel(),
      date: Date.now(),
    };

    const priorBest = bestFor(result.mode);
    saveScore(result);
    showResults(result, priorBest);
  }

  // Cyberpunk rank ladder, keyed to net WPM.
  function rankFor(w: number): { name: string; sub: string } {
    if (w < 20) return { name: "FLATLINE", sub: "signal barely detected â€” jack back in" };
    if (w < 35) return { name: "SCRIPT KIDDIE", sub: "rookie fingers, but you're learning" };
    if (w < 50) return { name: "CODE JOCKEY", sub: "warming up nicely, choom" };
    if (w < 65) return { name: "NETRUNNER", sub: "slicing clean through the ICE" };
    if (w < 80) return { name: "CYBER SAMURAI", sub: "fast, precise, lethal" };
    if (w < 100) return { name: "CONSOLE COWBOY", sub: "riding the datastream" };
    if (w < 130) return { name: "GHOST", sub: "untouchable in the grid" };
    return { name: "SINGULARITY", sub: "you ARE the machine now" };
  }

  // setTimeout-based (works in a throttled/hidden tab, unlike rAF).
  function countUp(el: HTMLElement, to: number, ms = 800) {
    const start = Date.now();
    const step = () => {
      const p = Math.min(1, (Date.now() - start) / ms);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) window.setTimeout(step, 24);
      else el.textContent = String(to);
    };
    step();
  }

  function showResults(r: TestResult, priorBest: number) {
    $("tt-stage")!.classList.add("hidden");
    root!.querySelector<HTMLElement>("#tt-live")!.parentElement!.classList.add("hidden");
    $("tt-results")!.classList.remove("hidden");

    countUp($("tt-r-wpm")!, r.wpm);
    $("tt-r-acc")!.textContent = `${r.accuracy}%`;
    $("tt-r-con")!.textContent = `${r.consistency}%`;
    $("tt-r-raw")!.textContent = String(r.raw);
    $("tt-r-time")!.textContent = `${(r.timeMs / 1000).toFixed(1)}s`;
    $("tt-r-combo")!.textContent = `Ã—${maxCombo}`;
    $("tt-r-chars")!.innerHTML =
      `<span class="g">${r.chars.correct}</span> Â· ` +
      `<span class="r">${r.chars.incorrect}</span> Â· ` +
      `<span class="y">${r.chars.extra}</span> Â· ` +
      `<span class="d">${r.chars.missed}</span>`;

    // Rank reveal with a glitch flourish.
    const rank = rankFor(r.wpm);
    const rankEl = $("tt-r-rank")!;
    rankEl.textContent = rank.name;
    rankEl.setAttribute("data-text", rank.name);
    restartAnim(rankEl, "glitch");
    $("tt-r-rank-sub")!.textContent = rank.sub;

    const best = bestFor(r.mode);
    const bestEl = $("tt-r-best")!;
    const isPB = r.wpm > priorBest && priorBest > 0;
    if (isPB) {
      bestEl.innerHTML = `<span class="tt-pb">â˜… NEW PERSONAL BEST</span>`;
    } else if (best > 0) {
      bestEl.textContent = `best ${best} wpm Â· ${modeLabel()}`;
    } else {
      bestEl.textContent = `first result Â· ${modeLabel()}`;
    }

    if (isPB) sndBest();
    else sndFinish();

    drawGraph();
  }

  function drawGraph() {
    const host = $("tt-graph")!;
    if (samples.length < 2) {
      host.innerHTML = `<p style="padding:1.4rem;text-align:center;font-size:.8rem;color:#a98d78">// run too short to chart â€” go longer</p>`;
      return;
    }
    const W = 700, H = 200, padL = 34, padB = 22, padT = 10, padR = 8;
    const iw = W - padL - padR;
    const ih = H - padB - padT;
    const maxRaw = Math.max(...samples.map((s) => s.raw), 10);
    const yMax = Math.ceil(maxRaw / 20) * 20;
    const n = samples.length;
    const x = (i: number) => padL + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
    const y = (v: number) => padT + ih - (Math.min(v, yMax) / yMax) * ih;

    const line = (key: "net" | "raw") =>
      samples.map((s, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(s[key]).toFixed(1)}`).join(" ");

    const grid: string[] = [];
    for (let g = 0; g <= yMax; g += yMax / 4) {
      const gy = y(g).toFixed(1);
      grid.push(
        `<line x1="${padL}" y1="${gy}" x2="${W - padR}" y2="${gy}" class="g-line" />` +
          `<text x="${padL - 6}" y="${Number(gy) + 3}" text-anchor="end" class="g-axis">${Math.round(g)}</text>`,
      );
    }

    const errDots = samples
      .filter((s) => s.err > 0)
      .map((s) => {
        const idx = samples.indexOf(s);
        return `<circle cx="${x(idx).toFixed(1)}" cy="${y(s.net).toFixed(1)}" r="${Math.min(2 + s.err, 5)}" class="g-err" />`;
      })
      .join("");

    // x labels: first, middle, last second.
    const xticks = [0, Math.floor((n - 1) / 2), n - 1]
      .map((i) => `<text x="${x(i).toFixed(1)}" y="${H - 6}" text-anchor="middle" class="g-axis">${samples[i].t}s</text>`)
      .join("");

    // Class names are prefixed `g-` so they never collide with the global
    // `.tt-grid` background layer.
    host.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-height:220px" preserveAspectRatio="none" role="img" aria-label="Words per minute over time">
        <defs>
          <filter id="g-glow"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <style>
          .g-line { stroke: #ff5c1a; opacity: 0.1; stroke-width: 1; }
          .g-axis { fill: #a98d78; font-size: 11px; font-family: ui-monospace, monospace; }
          .g-raw { fill: none; stroke: #6d5849; stroke-width: 2; stroke-linejoin: round; }
          .g-net { fill: none; stroke: #ff5c1a; stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; filter: url(#g-glow); }
          .g-err { fill: #ff3d2b; filter: url(#g-glow); }
        </style>
        ${grid.join("")}
        <path d="${line("raw")}" class="g-raw" />
        <path d="${line("net")}" class="g-net" />
        ${errDots}
        ${xticks}
      </svg>`;
  }

  /* â”€â”€ New test / config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function passageForMode(): string[] {
    if (config.mode === "time") return generateWords(60, config);
    if (config.mode === "words") return generateWords(config.words, config);
    // quote: pick by length bucket
    const buckets = { short: [0, 45], medium: [45, 90], long: [90, Infinity] } as const;
    const [lo, hi] = buckets[config.quote];
    const pool = QUOTES.filter((q) => q.text.length >= lo && q.text.length < hi);
    const q = (pool.length ? pool : QUOTES)[Math.floor(Math.random() * (pool.length ? pool.length : QUOTES.length))] ?? randomQuote();
    return tokenize(q.text);
  }

  let lastPassage: string[] | null = null;

  function newTest(regenerate: boolean) {
    window.clearInterval(timerId);
    running = false;
    finished = false;
    wordIndex = 0;
    startTime = 0;
    blurAt = 0;
    correctKeys = 0;
    incorrectKeys = 0;
    samples = [];
    lastSecond = 0;
    lastIncorrect = 0;
    combo = 0;
    maxCombo = 0;
    setIntensity();
    comboEl?.classList.remove("show");
    if (comboTag) comboTag.textContent = "COMBO";

    const passage = regenerate || !lastPassage ? passageForMode() : lastPassage.slice();
    lastPassage = passage.slice();
    buildWords(passage);
    wordsEl!.style.transform = "translateY(0)";

    $("tt-results")!.classList.add("hidden");
    $("tt-stage")!.classList.remove("hidden");
    root!.querySelector<HTMLElement>("#tt-live")!.parentElement!.classList.remove("hidden");
    $("tt-live-wpm")!.style.opacity = "0";
    $("tt-wpm-now")!.textContent = "0";
    $("tt-timer")!.textContent = config.mode === "time" ? String(config.time) : `0/${words.length}`;

    // Measure the line height once the passage is in the DOM.
    lineHeight = parseFloat(getComputedStyle(wordsEl!).lineHeight) || 40;
    caret!.classList.add("blink");
    // Direct call (reading offsetLeft forces the layout we need); rAF is only a
    // belt-and-braces re-measure once fonts settle â€” never the sole positioner.
    updateCaret();
    requestAnimationFrame(updateCaret);
  }

  /* â”€â”€ Config-bar wiring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function renderValues() {
    const host = $("tt-values")!;
    const vals: (string | number)[] =
      config.mode === "time" ? TIME_VALUES : config.mode === "words" ? WORD_VALUES : [...QUOTE_VALUES];
    const current = config.mode === "time" ? config.time : config.mode === "words" ? config.words : config.quote;
    host.innerHTML = vals
      .map(
        (v) =>
          `<button type="button" data-val="${v}" class="tt-val${v === current ? " tt-active" : ""}" aria-pressed="${v === current}">${v}</button>`,
      )
      .join("");
    host.querySelectorAll<HTMLButtonElement>(".tt-val").forEach((b) => {
      b.addEventListener("click", () => {
        const v = b.dataset.val!;
        if (config.mode === "time") config.time = Number(v);
        else if (config.mode === "words") config.words = Number(v);
        else config.quote = v as (typeof QUOTE_VALUES)[number];
        persist();
        renderValues();
        newTest(true);
      });
    });
  }

  function paintModes() {
    root!.querySelectorAll<HTMLButtonElement>(".tt-mode").forEach((b) => {
      const active = b.dataset.mode === config.mode;
      b.setAttribute("aria-pressed", String(active));
      b.classList.toggle("tt-active", active);
    });
  }
  function paintOpts() {
    // `[data-opt]` scopes this to punctuation/numbers â€” the sound button also
    // carries `.tt-opt` but paints itself separately.
    root!.querySelectorAll<HTMLButtonElement>(".tt-opt[data-opt]").forEach((b) => {
      const on = config[b.dataset.opt as "punctuation" | "numbers"];
      b.setAttribute("aria-pressed", String(on));
      b.classList.toggle("tt-active", on);
    });
  }

  root.querySelectorAll<HTMLButtonElement>(".tt-mode").forEach((b) => {
    b.addEventListener("click", () => {
      config.mode = b.dataset.mode as Mode;
      persist();
      paintModes();
      renderValues();
      newTest(true);
    });
  });
  root.querySelectorAll<HTMLButtonElement>(".tt-opt[data-opt]").forEach((b) => {
    b.addEventListener("click", () => {
      const k = b.dataset.opt as "punctuation" | "numbers";
      config[k] = !config[k];
      persist();
      paintOpts();
      newTest(true);
    });
  });

  $("tt-restart")?.addEventListener("click", () => {
    newTest(true);
    focus();
  });
  $("tt-again")?.addEventListener("click", () => {
    newTest(true);
    focus();
  });
  $("tt-repeat")?.addEventListener("click", () => {
    newTest(false);
    focus();
  });

  // Keep the caret aligned if the passage reflows on resize.
  let resizeRaf: number | undefined;
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeRaf!);
    resizeRaf = window.requestAnimationFrame(updateCaret);
  });

  /* â”€â”€ Cyber boot: scope class + fonts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     Dark mode itself is locked by the Layout's `forceDark` inline script, which
     runs before first paint (so the navbar never flashes light) and restores the
     user's real preference on the way out. This only owns the cyberpunk scope
     class and the address-bar colour. */
  const de = document.documentElement;
  de.classList.add("cyber-active");
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  metaTheme?.setAttribute("content", "#0a0603");

  // Load the two display faces once; the boot overlay hides them loading in.
  if (!document.getElementById("tt-fonts")) {
    const link = document.createElement("link");
    link.id = "tt-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap";
    document.head.appendChild(link);
  }

  window.addEventListener("pagehide", () => {
    de.classList.remove("cyber-active");
    metaTheme?.setAttribute("content", "#f4efe7");
  });

  function paintSound() {
    soundBtn?.classList.toggle("tt-active", soundOn);
    soundBtn?.setAttribute("aria-pressed", String(soundOn));
    const lbl = $("tt-sound-label");
    if (lbl) lbl.textContent = soundOn ? "sound" : "muted";
  }
  soundBtn?.addEventListener("click", () => {
    soundOn = !soundOn;
    localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
    paintSound();
    if (soundOn) sndKey();
  });

  paintModes();
  paintOpts();
  paintSound();
  renderValues();
  newTest(true);

  /* â”€â”€ Boot intro sequence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const boot = $("tt-boot");
  const bootLog = $("tt-boot-log");
  const bootBar = $("tt-boot-bar");

  function endBoot() {
    if (!booting) return;
    booting = false;
    boot?.classList.add("tt-boot-out");
    window.setTimeout(() => boot?.remove(), 550);
    focus();
  }

  if (boot) {
    const lines = [
      "> establishing uplink . . . OK",
      "> decrypting lexicon . . . OK",
      "> calibrating neural I/O . . . OK",
      "> loading corpus [200 tokens] . . . OK",
      "> READY. jack in.",
    ];
    let li = 0;
    const typeLine = () => {
      if (!booting) return;
      if (li < lines.length) {
        if (bootLog) bootLog.textContent += (li ? "\n" : "") + lines[li];
        if (bootBar) bootBar.style.width = `${((li + 1) / lines.length) * 100}%`;
        li++;
        window.setTimeout(typeLine, 230 + Math.random() * 150);
      } else {
        window.setTimeout(endBoot, 420);
      }
    };
    window.setTimeout(typeLine, 260);
    boot.addEventListener("mousedown", endBoot);
    // Any key skips the intro (handled before the main keydown, which ignores
    // input while `booting` is true).
    document.addEventListener(
      "keydown",
      function skip(e) {
        if (booting) {
          e.preventDefault();
          endBoot();
        }
        document.removeEventListener("keydown", skip, true);
      },
      true,
    );
  } else {
    booting = false;
    focus();
  }
}
