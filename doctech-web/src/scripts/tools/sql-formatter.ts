// SQL Formatter — thin wrapper over the `sql-formatter` package (loaded on
// demand). All dialect/case/indent knobs map straight to its options.
import { initPane } from "../lib/codepane";
import { toast } from "../lib/ui";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const SAMPLE =
  "select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id=u.id " +
  "where u.active=true and o.created_at > '2024-01-01' group by u.id, u.name having count(o.id) > 3 order by orders desc limit 10;";

const inPane = initPane("sql-in", { sample: SAMPLE, debounce: 350 });
const outPane = initPane("sql-out", { downloadName: "query.sql" });
const dialectSel = $<HTMLSelectElement>("sql-dialect");

if (inPane && outPane && dialectSel) {
  const caseSel = $<HTMLSelectElement>("sql-case");
  const tabSel = $<HTMLSelectElement>("sql-tab");

  let busy = false;
  let pending = false;
  async function run() {
    const src = inPane!.get();
    if (!src.trim()) {
      outPane!.set("", "sql");
      inPane!.clearStatus();
      return;
    }
    if (busy) {
      pending = true;
      return;
    }
    busy = true;
    try {
      const { format } = await import("sql-formatter");
      const tab = tabSel!.value;
      const out = format(src, {
        language: dialectSel!.value as never,
        keywordCase: caseSel!.value as "upper" | "lower" | "preserve",
        tabWidth: tab === "tab" ? 1 : Number(tab),
        useTabs: tab === "tab",
      });
      outPane!.set(out, "sql");
      inPane!.setStatus("Formatted", "ok");
      outPane!.clearStatus();
    } catch (e) {
      inPane!.setStatus((e instanceof Error ? e.message : String(e)).split("\n")[0], "err");
      outPane!.set("", "sql");
    } finally {
      busy = false;
      if (pending) {
        pending = false;
        run();
      }
    }
  }

  inPane.onInput(run);
  [dialectSel, caseSel, tabSel].forEach((el) => el?.addEventListener("change", run));
  $("sql-run")?.addEventListener("click", run);

  inPane.onUpload(async (file) => {
    try {
      inPane!.set(await file.text());
      run();
      toast(`Loaded ${file.name}`, "ok");
    } catch {
      toast("Could not read that file", "err");
    }
  });

  inPane.set(SAMPLE);
  run();
}
