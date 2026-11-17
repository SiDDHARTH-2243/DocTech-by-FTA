// BMI Calculator — metric / imperial, live category readout.
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const unit = $<HTMLSelectElement>("bmi-unit");
const metric = $("bmi-metric");
const imperial = $("bmi-imperial");
const hCm = $<HTMLInputElement>("bmi-h-cm");
const wKg = $<HTMLInputElement>("bmi-w-kg");
const hFt = $<HTMLInputElement>("bmi-h-ft");
const hIn = $<HTMLInputElement>("bmi-h-in");
const wLb = $<HTMLInputElement>("bmi-w-lb");
const valueEl = $("bmi-value");
const catEl = $("bmi-cat");

if (unit && valueEl && catEl) {
  function category(bmi: number): { label: string; color: string } {
    if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6" };
    if (bmi < 25) return { label: "Normal weight", color: "#10b981" };
    if (bmi < 30) return { label: "Overweight", color: "#f59e0b" };
    return { label: "Obese", color: "#ef4444" };
  }

  function compute() {
    let heightM = 0;
    let weightKg = 0;
    if (unit!.value === "metric") {
      heightM = (parseFloat(hCm?.value || "0") || 0) / 100;
      weightKg = parseFloat(wKg?.value || "0") || 0;
    } else {
      const inches = (parseFloat(hFt?.value || "0") || 0) * 12 + (parseFloat(hIn?.value || "0") || 0);
      heightM = inches * 0.0254;
      weightKg = (parseFloat(wLb?.value || "0") || 0) * 0.45359237;
    }
    if (heightM <= 0 || weightKg <= 0) {
      valueEl!.textContent = "—";
      catEl!.textContent = "—";
      catEl!.style.color = "";
      return;
    }
    const bmi = weightKg / (heightM * heightM);
    const cat = category(bmi);
    valueEl!.textContent = bmi.toFixed(1);
    valueEl!.style.color = cat.color;
    catEl!.textContent = cat.label;
    catEl!.style.color = cat.color;
  }

  function toggleUnits() {
    const isMetric = unit!.value === "metric";
    metric?.classList.toggle("hidden", !isMetric);
    metric?.classList.toggle("grid", isMetric);
    imperial?.classList.toggle("hidden", isMetric);
    imperial?.classList.toggle("grid", !isMetric);
    compute();
  }

  unit.addEventListener("change", toggleUnits);
  [hCm, wKg, hFt, hIn, wLb].forEach((el) => el?.addEventListener("input", compute));
  compute();
}
