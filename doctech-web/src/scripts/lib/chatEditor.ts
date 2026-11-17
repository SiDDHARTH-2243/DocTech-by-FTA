// Shared message-list editor for the chat mockup generators. Manages add /
// remove / side-toggle / text rows and reports the current message array.
import type { Msg } from "./mockup";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function createChatEditor(list: HTMLElement, addBtn: HTMLElement, seed: Msg[], onChange: () => void): () => Msg[] {
  const msgs: Msg[] = seed.slice();

  function makeRow(m: Msg, i: number): HTMLElement {
    const div = document.createElement("div");
    div.className = "flex items-center gap-2";
    div.innerHTML = `
      <select data-side class="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
        <option value="in">Them</option><option value="out">You</option>
      </select>
      <input data-text type="text" value="${esc(m.text)}" class="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
      <button data-rm type="button" title="Remove" class="px-1.5 text-slate-400 hover:text-red-500">✕</button>`;
    (div.querySelector("[data-side]") as HTMLSelectElement).value = m.side;
    div.querySelector("[data-side]")!.addEventListener("change", (e) => { msgs[i].side = (e.target as HTMLSelectElement).value as "in" | "out"; onChange(); });
    div.querySelector("[data-text]")!.addEventListener("input", (e) => { msgs[i].text = (e.target as HTMLInputElement).value; onChange(); });
    div.querySelector("[data-rm]")!.addEventListener("click", () => { msgs.splice(i, 1); rebuild(); onChange(); });
    return div;
  }

  function rebuild() {
    list.innerHTML = "";
    msgs.forEach((m, i) => list.appendChild(makeRow(m, i)));
  }

  addBtn.addEventListener("click", () => { msgs.push({ side: msgs.length % 2 ? "out" : "in", text: "New message" }); rebuild(); onChange(); });
  rebuild();
  return () => msgs;
}
