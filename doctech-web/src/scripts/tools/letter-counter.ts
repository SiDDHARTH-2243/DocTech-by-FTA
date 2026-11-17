// Letter Counter — live stats + common-limit meters. Client-side.
import { countStats } from "../lib/text";

const input = document.getElementById("lc-input") as HTMLTextAreaElement | null;
const statsEl = document.getElementById("lc-stats");
const limitsEl = document.getElementById("lc-limits");

if (input && statsEl && limitsEl) {
  const LIMITS: { label: string; max: number; metric: "chars" | "words" }[] = [
    { label: "X / Twitter post", max: 280, metric: "chars" },
    { label: "SMS message", max: 160, metric: "chars" },
    { label: "Meta title (SEO)", max: 60, metric: "chars" },
    { label: "Meta description (SEO)", max: 160, metric: "chars" },
  ];

  function statCard(label: string, value: string): string {
    return `
      <div class="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-700">
        <div class="text-2xl font-extrabold text-orange-500">${value}</div>
        <div class="mt-0.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">${label}</div>
      </div>`;
  }

  function meter(label: string, used: number, max: number): string {
    const pct = Math.min(100, (used / max) * 100);
    const over = used > max;
    const bar = over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500";
    return `
      <div>
        <div class="mb-1 flex justify-between text-xs">
          <span class="font-medium text-slate-600 dark:text-slate-300">${label}</span>
          <span class="${over ? "font-bold text-red-500" : "text-slate-400"}">${used} / ${max}</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div class="h-full rounded-full ${bar} transition-all" style="width:${pct}%"></div>
        </div>
      </div>`;
  }

  function render() {
    const s = countStats(input!.value);
    statsEl!.innerHTML = [
      statCard("Characters", String(s.chars)),
      statCard("No spaces", String(s.charsNoSpaces)),
      statCard("Words", String(s.words)),
      statCard("Sentences", String(s.sentences)),
      statCard("Paragraphs", String(s.paragraphs)),
      statCard("Lines", String(s.lines)),
      statCard("Reading time", `${Math.ceil(s.readingTimeMin) || 0}m`),
    ].join("");
    limitsEl!.innerHTML = LIMITS.map((l) =>
      meter(l.label, l.metric === "chars" ? s.chars : s.words, l.max),
    ).join("");
  }

  input.addEventListener("input", render);
  render();
}
