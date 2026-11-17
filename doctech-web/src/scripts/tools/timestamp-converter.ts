// Unix Timestamp Converter — epoch ⇄ date, both directions live, with a ticking
// "now" readout and a spread of output formats.
import { copyText, toast } from "../lib/ui";
import { detectEpochUnit, localIso, relativeTime } from "../lib/code";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const epochIn = $<HTMLInputElement>("ts-epoch");
const dateIn = $<HTMLInputElement>("ts-date");
const unitSel = $<HTMLSelectElement>("ts-unit");
const zoneSel = $<HTMLSelectElement>("ts-date-zone");

if (epochIn && dateIn && unitSel && zoneSel) {
  const nowEl = $("ts-now");
  const nowLocalEl = $("ts-now-local");
  const noteEl = $("ts-epoch-note");
  const tzEl = $("ts-tz");

  // Guards against the two inputs re-triggering each other in a loop.
  let syncing = false;

  const pad = (n: number, w = 2) => String(n).padStart(w, "0");

  /** Value for <input type="datetime-local">, which has no timezone of its own. */
  function toLocalInput(d: Date, utc: boolean): string {
    const g = utc
      ? [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()]
      : [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()];
    return `${g[0]}-${pad(g[1])}-${pad(g[2])}T${pad(g[3])}:${pad(g[4])}:${pad(g[5])}`;
  }

  function dayOfYear(d: Date): number {
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
  }

  /** ISO-8601 week number (weeks start Monday; week 1 contains the first Thursday). */
  function isoWeek(d: Date): number {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  }

  function put(id: string, v: string) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function clearOutputs() {
    ["ts-o-s", "ts-o-ms", "ts-o-isolocal", "ts-o-isoutc", "ts-o-rfc", "ts-o-human", "ts-o-humanutc", "ts-o-rel", "ts-o-doy"]
      .forEach((id) => put(id, "—"));
  }

  function render(d: Date) {
    const ms = d.getTime();
    put("ts-o-s", String(Math.floor(ms / 1000)));
    put("ts-o-ms", String(ms));
    put("ts-o-isolocal", localIso(d));
    put("ts-o-isoutc", d.toISOString());
    put("ts-o-rfc", d.toUTCString());
    put("ts-o-human", d.toLocaleString(undefined, { dateStyle: "full", timeStyle: "long" }));
    put("ts-o-humanutc", d.toLocaleString(undefined, { dateStyle: "full", timeStyle: "long", timeZone: "UTC" }));
    put("ts-o-rel", relativeTime(d));
    put("ts-o-doy", `Day ${dayOfYear(d)} · Week ${isoWeek(d)}`);
  }

  function fromEpoch() {
    const raw = epochIn!.value.trim().replace(/[_,\s]/g, "");
    if (!raw) {
      if (noteEl) noteEl.textContent = "";
      clearOutputs();
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      if (noteEl) noteEl.textContent = "That isn't a number.";
      clearOutputs();
      return;
    }

    const unit = unitSel!.value === "auto" ? detectEpochUnit(n) : (unitSel!.value as "s" | "ms");
    const ms = unit === "s" ? n * 1000 : n;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) {
      if (noteEl) noteEl.textContent = "Out of the range JavaScript dates can represent.";
      clearOutputs();
      return;
    }

    if (noteEl) {
      noteEl.textContent =
        unitSel!.value === "auto"
          ? `Read as ${unit === "s" ? "seconds" : "milliseconds"} (${String(Math.trunc(Math.abs(n))).length} digits).`
          : "";
    }

    render(d);
    if (!syncing) {
      syncing = true;
      dateIn!.value = toLocalInput(d, zoneSel!.value === "utc");
      syncing = false;
    }
  }

  function fromDate() {
    const v = dateIn!.value;
    if (!v) return;
    // For UTC mode, append Z so the string is parsed as UTC rather than local.
    const d = new Date(zoneSel!.value === "utc" ? `${v}Z` : v);
    if (Number.isNaN(d.getTime())) return;

    render(d);
    if (!syncing) {
      syncing = true;
      epochIn!.value = String(Math.floor(d.getTime() / 1000));
      if (noteEl) noteEl.textContent = "";
      syncing = false;
    }
  }

  epochIn.addEventListener("input", fromEpoch);
  unitSel.addEventListener("change", fromEpoch);
  dateIn.addEventListener("input", fromDate);
  zoneSel.addEventListener("change", () => {
    // Re-project the currently shown instant into the newly chosen zone.
    const n = Number(epochIn!.value.trim());
    if (Number.isFinite(n) && epochIn!.value.trim()) fromEpoch();
  });

  $("ts-use-now")?.addEventListener("click", () => {
    epochIn!.value = String(Math.floor(Date.now() / 1000));
    unitSel!.value = "auto";
    fromEpoch();
  });

  $("ts-now-copy")?.addEventListener("click", () => {
    copyText(String(Math.floor(Date.now() / 1000)));
  });

  document.querySelectorAll<HTMLButtonElement>("[data-tscopy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = document.getElementById(btn.dataset.tscopy!)?.textContent ?? "";
      if (v && v !== "—") {
        navigator.clipboard.writeText(v).then(
          () => toast("Copied", "ok"),
          () => toast("Copy failed — copy manually", "err"),
        );
      }
    });
  });

  if (tzEl) tzEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function tick() {
    const now = new Date();
    if (nowEl) nowEl.textContent = String(Math.floor(now.getTime() / 1000));
    if (nowLocalEl) nowLocalEl.textContent = now.toLocaleString(undefined, { dateStyle: "full", timeStyle: "medium" });
  }
  tick();
  setInterval(tick, 1000);

  // Seed with the current moment so the page is never empty.
  epochIn.value = String(Math.floor(Date.now() / 1000));
  fromEpoch();
}
