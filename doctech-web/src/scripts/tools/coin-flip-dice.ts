// Coin Flip & Dice Roller — crypto-backed randomness with light animation.
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

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

// ── Coin ──────────────────────────────────────────────────────────────────
const coinVisual = $("coin-visual");
const coinFlip = $("coin-flip");
const coinHeads = $("coin-heads");
const coinTails = $("coin-tails");

if (coinVisual && coinFlip) {
  let heads = 0;
  let tails = 0;
  let spinning = false;

  coinFlip.addEventListener("click", () => {
    if (spinning) return;
    spinning = true;
    coinVisual.style.transform = "rotateY(900deg)";
    let ticks = 0;
    const iv = setInterval(() => {
      coinVisual.textContent = randInt(2) ? "H" : "T";
      if (++ticks > 8) {
        clearInterval(iv);
        const isHeads = randInt(2) === 0;
        coinVisual.textContent = isHeads ? "H" : "T";
        if (isHeads) heads++;
        else tails++;
        if (coinHeads) coinHeads.textContent = String(heads);
        if (coinTails) coinTails.textContent = String(tails);
        coinVisual.style.transform = "rotateY(0deg)";
        spinning = false;
      }
    }, 60);
  });
}

// ── Dice ──────────────────────────────────────────────────────────────────
const diceSides = $<HTMLSelectElement>("dice-sides");
const diceQty = $<HTMLInputElement>("dice-qty");
const diceRoll = $("dice-roll");
const diceResult = $("dice-result");
const diceTotal = $("dice-total");

if (diceSides && diceQty && diceRoll && diceResult) {
  diceRoll.addEventListener("click", () => {
    const sides = parseInt(diceSides.value);
    const qty = Math.min(12, Math.max(1, parseInt(diceQty.value) || 1));
    diceResult.innerHTML = "";
    let total = 0;
    for (let i = 0; i < qty; i++) {
      const v = randInt(sides) + 1;
      total += v;
      const die = document.createElement("span");
      die.className = "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-xl font-black text-white shadow-lg shadow-orange-500/30";
      die.textContent = String(v);
      diceResult.appendChild(die);
    }
    if (diceTotal) diceTotal.textContent = `${total}`;
  });
}
