// Age Calculator — exact years/months/days between two dates + totals.
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const fromEl = $<HTMLInputElement>("age-from");
const toEl = $<HTMLInputElement>("age-to");
const mainEl = $("age-main");
const totMonths = $("age-total-months");
const totWeeks = $("age-total-weeks");
const totDays = $("age-total-days");

if (fromEl && toEl && mainEl) {
  // Default the "to" field to today.
  const today = new Date();
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  toEl.value = iso(today);

  function plural(n: number, w: string) {
    return `${n} ${w}${n === 1 ? "" : "s"}`;
  }

  function compute() {
    if (!fromEl!.value || !toEl!.value) {
      mainEl!.textContent = "—";
      return;
    }
    let start = new Date(fromEl!.value + "T00:00:00");
    let end = new Date(toEl!.value + "T00:00:00");
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
    if (start > end) [start, end] = [end, start];

    // Exact Y/M/D
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    mainEl!.textContent = `${plural(years, "year")}, ${plural(months, "month")}, ${plural(days, "day")}`;

    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000);
    if (totDays) totDays.textContent = totalDays.toLocaleString();
    if (totWeeks) totWeeks.textContent = Math.floor(totalDays / 7).toLocaleString();
    if (totMonths) totMonths.textContent = String(years * 12 + months);
  }

  [fromEl, toEl].forEach((el) => el.addEventListener("input", compute));
  compute();
}
