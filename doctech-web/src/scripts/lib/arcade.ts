// VOIDSTRIKE — pure simulation for the typing arcade shooter.
//
// Deliberately DOM-free and renderer-agnostic: the canvas layer only reads this
// state and draws it. That split keeps the game loop cheap, makes the rules
// deterministic (inject `rng` to replay a run), and — importantly here — lets the
// whole game be driven and verified without `requestAnimationFrame`, which never
// fires in a hidden tab (see handoff §9a).
//
// All motion is in CSS pixels per SECOND and every fall speed is derived from the
// arena height, so difficulty feels identical on any screen size.
import { COMMON_WORDS } from "./typing";

/* ── Word banks ──────────────────────────────────────────────────────────── */

// Longer, techy words that start appearing in later waves.
const CYBER_WORDS = [
  "neon", "cipher", "vector", "proxy", "daemon", "kernel", "packet", "socket",
  "matrix", "binary", "quantum", "circuit", "android", "implant", "netrunner",
  "protocol", "firewall", "override", "encrypt", "decrypt", "bandwidth",
  "hologram", "synapse", "reactor", "plasma", "railgun", "chrome", "glitch",
  "phantom", "spectre", "orbital", "nebula", "photon", "ion", "flux", "core",
  "grid", "node", "byte", "hex", "void", "echo", "pulse", "drift", "surge",
  "cascade", "fragment", "terminal", "mainframe", "subroutine", "interface",
];

const byLen = (words: string[], min: number, max: number) =>
  [...new Set(words.map((w) => w.toLowerCase()))].filter((w) => w.length >= min && w.length <= max && /^[a-z]+$/.test(w));

const POOL = {
  short: byLen(COMMON_WORDS, 2, 4),
  mid: byLen([...COMMON_WORDS, ...CYBER_WORDS], 5, 6),
  long: byLen(CYBER_WORDS, 7, 11),
};

/* ── Entities ────────────────────────────────────────────────────────────── */

export type EnemyKind = "grunt" | "swift" | "hulk";

export interface Enemy {
  id: number;
  word: string;
  /** How many leading characters have been shot off. */
  typed: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Collision + draw radius. */
  r: number;
  kind: EnemyKind;
  /** 0→1, decays; drives the hit flash in the renderer. */
  flash: number;
  /** Word fully typed — dies when its last bullet lands. */
  doomed: boolean;
  spin: number;
  seed: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetId: number;
  /** True for the bullet fired at the final letter — the one that destroys. */
  kill: boolean;
  dead: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  /** 0 = cyan, 1 = magenta, 2 = amber/white. */
  tint: number;
}

export type Status = "idle" | "running" | "paused" | "over";
export type TypeResult = "none" | "lock" | "hit" | "kill" | "miss";

export interface ArcadeStats {
  score: number;
  kills: number;
  wave: number;
  correct: number;
  miss: number;
  bestCombo: number;
  timeMs: number;
  accuracy: number;
  wpm: number;
}

const MAX_PARTICLES = 420;
const BULLET_SPEED = 1150;
const BEST_KEY = "doctech-arcade-best";

export class Arcade {
  width: number;
  height: number;
  status: Status = "idle";

  enemies: Enemy[] = [];
  bullets: Bullet[] = [];
  particles: Particle[] = [];

  shipX = 0;
  shipY = 0;
  /** Recoil/impact shake, consumed by the renderer. */
  shake = 0;

  lockedId: number | null = null;
  score = 0;
  kills = 0;
  wave = 1;
  combo = 0;
  bestCombo = 0;
  correct = 0;
  miss = 0;
  elapsed = 0; // seconds

  private nextId = 1;
  private spawnTimer = 0;
  private rng: () => number;

  constructor(width: number, height: number, rng: () => number = Math.random) {
    this.width = width;
    this.height = height;
    this.rng = rng;
    this.layout();
  }

  private layout() {
    this.shipX = this.width / 2;
    this.shipY = this.height - 62;
  }

  resize(width: number, height: number) {
    // Keep everything proportional so a resize mid-run isn't a death sentence.
    const sx = this.width ? width / this.width : 1;
    const sy = this.height ? height / this.height : 1;
    this.width = width;
    this.height = height;
    this.layout();
    for (const e of this.enemies) {
      e.x *= sx;
      e.y *= sy;
    }
  }

  /* ── Difficulty curve ─────────────────────────────────────────────────── */

  /** Seconds an enemy takes to cross the arena at the current wave. */
  private crossTime(): number {
    return Math.max(4.6, 13.5 - this.wave * 0.65);
  }
  private spawnInterval(): number {
    return Math.max(0.6, 2.1 - this.wave * 0.115);
  }
  private maxAlive(): number {
    return Math.min(9, 3 + Math.floor(this.wave / 2));
  }

  private pickWord(): string {
    const w = this.wave;
    const roll = this.rng();
    let pool: string[];
    if (w <= 2) pool = roll < 0.85 ? POOL.short : POOL.mid;
    else if (w <= 5) pool = roll < 0.5 ? POOL.short : roll < 0.9 ? POOL.mid : POOL.long;
    else pool = roll < 0.25 ? POOL.short : roll < 0.65 ? POOL.mid : POOL.long;
    if (!pool.length) pool = POOL.short;

    // Prefer a word whose first letter isn't already claimed by a live, untouched
    // enemy — otherwise one keypress would be ambiguous and the run feels unfair.
    const taken = new Set(this.enemies.filter((e) => e.typed === 0 && !e.doomed).map((e) => e.word[0]));
    for (let i = 0; i < 14; i++) {
      const cand = pool[Math.floor(this.rng() * pool.length)];
      if (!taken.has(cand[0])) return cand;
    }
    return pool[Math.floor(this.rng() * pool.length)];
  }

  /** Spawn one enemy at the top. Public so tests can force deterministic waves. */
  spawn(word?: string, x?: number): Enemy {
    const roll = this.rng();
    const kind: EnemyKind = roll < 0.16 ? "swift" : roll < 0.3 ? "hulk" : "grunt";
    const w = word ?? this.pickWord();
    const r = kind === "hulk" ? 26 : kind === "swift" ? 15 : 20;
    const speedMul = kind === "swift" ? 1.55 : kind === "hulk" ? 0.72 : 1;
    const margin = 60;
    const e: Enemy = {
      id: this.nextId++,
      word: w,
      typed: 0,
      x: x ?? margin + this.rng() * Math.max(1, this.width - margin * 2),
      y: -r - 10,
      vx: (this.rng() - 0.5) * 26,
      vy: (this.height / this.crossTime()) * speedMul,
      r,
      kind,
      flash: 0,
      doomed: false,
      spin: this.rng() * Math.PI * 2,
      seed: this.rng(),
    };
    this.enemies.push(e);
    return e;
  }

  /* ── Lifecycle ────────────────────────────────────────────────────────── */

  start() {
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.lockedId = null;
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.combo = 0;
    this.bestCombo = 0;
    this.correct = 0;
    this.miss = 0;
    this.elapsed = 0;
    this.shake = 0;
    this.spawnTimer = 0.35;
    this.status = "running";
  }

  pause() {
    if (this.status === "running") this.status = "paused";
  }
  resume() {
    if (this.status === "paused") this.status = "running";
  }

  private gameOver(at?: Enemy) {
    this.status = "over";
    this.lockedId = null;
    this.shake = 26;
    if (at) this.burst(at.x, at.y, 46, 1);
    this.burst(this.shipX, this.shipY, 60, 2);
    this.enemies = [];
    this.bullets = [];
    const best = this.loadBest();
    if (this.score > best) this.saveBest(this.score);
  }

  /* ── Input ────────────────────────────────────────────────────────────── */

  /**
   * Feed one printable character. Returns what happened so the renderer/audio
   * layer can react. Wrong keys never break an existing lock — they just miss,
   * which keeps a fumbled word recoverable.
   */
  type(raw: string): TypeResult {
    if (this.status !== "running") return "none";
    const ch = raw.toLowerCase();
    if (ch.length !== 1) return "none";

    const locked = this.lockedId === null ? null : this.enemies.find((e) => e.id === this.lockedId) ?? null;

    if (!locked) {
      // Acquire: among untouched enemies whose word starts with this key, take
      // the one nearest the ship — the most urgent threat.
      const cands = this.enemies.filter((e) => !e.doomed && e.typed === 0 && e.word[0] === ch);
      if (!cands.length) {
        this.registerMiss();
        return "miss";
      }
      const target = cands.reduce((a, b) => (b.y > a.y ? b : a));
      this.lockedId = target.id;
      return this.advance(target) ? "kill" : "lock";
    }

    if (locked.word[locked.typed] === ch) {
      return this.advance(locked) ? "kill" : "hit";
    }
    this.registerMiss();
    return "miss";
  }

  /** Consume one correct letter: fire a bullet, and report whether that finished the word. */
  private advance(e: Enemy): boolean {
    e.typed++;
    this.correct++;
    this.combo++;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;
    this.score += 5 * this.multiplier();

    const done = e.typed >= e.word.length;
    if (done) {
      e.doomed = true;
      this.lockedId = null; // free the player to start the next word immediately
    }
    this.fire(e, done);
    return done;
  }

  private registerMiss() {
    this.miss++;
    this.combo = 0;
  }

  multiplier(): number {
    return 1 + Math.min(4, Math.floor(this.combo / 15));
  }

  private fire(target: Enemy, kill: boolean) {
    const dx = target.x - this.shipX;
    const dy = target.y - this.shipY;
    const d = Math.hypot(dx, dy) || 1;
    this.bullets.push({
      x: this.shipX,
      y: this.shipY - 14,
      vx: (dx / d) * BULLET_SPEED,
      vy: (dy / d) * BULLET_SPEED,
      targetId: target.id,
      kill,
      dead: false,
    });
    this.shake = Math.min(this.shake + 1.6, 10);
  }

  /* ── Particles ────────────────────────────────────────────────────────── */

  private burst(x: number, y: number, count: number, tint: number) {
    const budget = Math.min(count, MAX_PARTICLES - this.particles.length);
    for (let i = 0; i < budget; i++) {
      const a = this.rng() * Math.PI * 2;
      const sp = 40 + this.rng() * 320;
      const life = 0.35 + this.rng() * 0.55;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life,
        maxLife: life,
        size: 1.4 + this.rng() * 2.6,
        tint,
      });
    }
  }

  /* ── Simulation step ──────────────────────────────────────────────────── */

  /** Advance the world by `dt` seconds. Call at a fixed timestep. */
  step(dt: number) {
    // Particles and shake keep animating on the game-over screen.
    this.stepParticles(dt);
    this.shake = Math.max(0, this.shake - dt * 34);
    if (this.status !== "running") return;

    this.elapsed += dt;
    this.wave = 1 + Math.floor(this.kills / 8);

    // Spawning
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      if (this.enemies.length < this.maxAlive()) this.spawn();
      this.spawnTimer = this.spawnInterval();
    }

    // Enemies
    for (const e of this.enemies) {
      e.y += e.vy * dt;
      e.x += e.vx * dt;
      e.spin += dt * (e.kind === "swift" ? 2.4 : 1.1);
      e.flash = Math.max(0, e.flash - dt * 4);
      // Bounce off the side walls.
      if (e.x < e.r + 6 && e.vx < 0) e.vx = -e.vx;
      if (e.x > this.width - e.r - 6 && e.vx > 0) e.vx = -e.vx;
      // Reached the ship line → the run is over.
      if (e.y + e.r >= this.shipY) {
        this.gameOver(e);
        return;
      }
    }

    // Bullets — homing on their target's current position.
    for (const b of this.bullets) {
      const target = this.enemies.find((e) => e.id === b.targetId);
      if (!target) {
        b.dead = true;
        continue;
      }
      const dx = target.x - b.x;
      const dy = target.y - b.y;
      const d = Math.hypot(dx, dy) || 1;
      b.vx = (dx / d) * BULLET_SPEED;
      b.vy = (dy / d) * BULLET_SPEED;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (d <= target.r + 6) {
        b.dead = true;
        target.flash = 1;
        this.burst(b.x, b.y, 6, 0);
        if (b.kill) this.destroy(target);
      }
    }

    if (this.bullets.some((b) => b.dead)) this.bullets = this.bullets.filter((b) => !b.dead);
  }

  private destroy(e: Enemy) {
    const i = this.enemies.indexOf(e);
    if (i === -1) return;
    this.enemies.splice(i, 1);
    this.kills++;
    this.score += (e.word.length * 15 + this.wave * 10) * this.multiplier();
    this.shake = Math.min(this.shake + 7, 16);
    this.burst(e.x, e.y, e.kind === "hulk" ? 40 : 26, e.kind === "hulk" ? 2 : 0);
    // Any bullets still flying at it have nothing to hit.
    for (const b of this.bullets) if (b.targetId === e.id) b.dead = true;
    if (this.lockedId === e.id) this.lockedId = null;
  }

  private stepParticles(dt: number) {
    let alive = 0;
    for (const p of this.particles) {
      p.life -= dt;
      if (p.life <= 0) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - 1.8 * dt; // drag
      p.vy *= 1 - 1.8 * dt;
      this.particles[alive++] = p;
    }
    this.particles.length = alive;
  }

  /* ── Readouts ─────────────────────────────────────────────────────────── */

  /** The enemy currently locked on, if any. */
  locked(): Enemy | null {
    return this.lockedId === null ? null : this.enemies.find((e) => e.id === this.lockedId) ?? null;
  }

  stats(): ArcadeStats {
    const keys = this.correct + this.miss;
    return {
      score: this.score,
      kills: this.kills,
      wave: this.wave,
      correct: this.correct,
      miss: this.miss,
      bestCombo: this.bestCombo,
      timeMs: this.elapsed * 1000,
      accuracy: keys ? Math.round((this.correct / keys) * 100) : 100,
      // Letters destroyed count as typed characters; the usual chars/5 per minute.
      wpm: this.elapsed > 0 ? Math.round(this.correct / 5 / (this.elapsed / 60)) : 0,
    };
  }

  loadBest(): number {
    try {
      return Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      return 0;
    }
  }
  saveBest(score: number) {
    try {
      localStorage.setItem(BEST_KEY, String(score));
    } catch {
      /* storage blocked — best just won't persist */
    }
  }
}
