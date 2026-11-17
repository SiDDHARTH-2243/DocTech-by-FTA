// Homepage tool grid — search, filter tabs, favorites, load-more, category
// filtering over the server-rendered `.tool-card` anchors.

const grid = document.getElementById("toolGrid");
const search = document.getElementById("toolSearch") as HTMLInputElement | null;
const tabs = document.getElementById("filterTabs");
const favCount = document.getElementById("favoriteCount");
const loadMore = document.getElementById("loadMore");
const toolTotal = document.getElementById("toolTotal");
const emptyState = document.getElementById("emptyState") as HTMLElement | null;
const clearBtn = document.getElementById("clearSearch");
const categoryGrid = document.querySelector(".category-grid");
const toastEl = document.getElementById("toast");

if (grid && search && tabs && favCount && loadMore && toolTotal && emptyState) {
  const cards = [...grid.querySelectorAll<HTMLAnchorElement>(".tool-card")];
  let activeFilter = "Popular";
  let expanded = false;
  let favorites = new Set<string>(JSON.parse(localStorage.getItem("doctech-favorites") || "[]"));

  const favName = (card: HTMLElement) => (card.querySelector("[data-favorite]") as HTMLElement | null)?.dataset.favorite || "";

  function toast(msg: string) {
    if (!toastEl) return;
    toastEl.querySelector("p")!.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout((toast as any).t);
    (toast as any).t = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  const slab = grid.querySelector<HTMLElement>(".arcade-slab");

  /**
   * Keep the arcade slab anchored after the 8th *visible* card. Its server-rendered
   * position is fixed, but filtering hides arbitrary cards — without this the slab
   * can drift to the very top of a filtered grid. It's also pulled entirely while
   * searching or browsing favourites: a promo has no business inside search results.
   */
  function placeSlab(visible: HTMLElement[], q: string) {
    if (!slab) return;
    const hide = Boolean(q) || activeFilter === "Favorites" || visible.length < 5;
    slab.classList.toggle("hidden", hide);
    if (hide) return;
    const anchor = visible[Math.min(7, visible.length - 1)];
    if (anchor && anchor.nextElementSibling !== slab) anchor.after(slab);
  }

  function apply() {
    const q = search!.value.trim().toLowerCase();
    const cap = expanded || q || activeFilter === "Favorites" || activeFilter === "All" ? Infinity : 12;
    const visible: HTMLElement[] = [];
    let matched = 0, shown = 0;
    for (const card of cards) {
      const hay = `${card.dataset.name} ${card.dataset.desc} ${(card.dataset.cat || "").toLowerCase()}`;
      const matchesSearch = !q || hay.includes(q);
      let matchesFilter = true;
      if (activeFilter === "Popular") matchesFilter = card.dataset.popular === "true";
      else if (activeFilter === "New") matchesFilter = card.dataset.new === "true";
      else if (activeFilter === "Favorites") matchesFilter = favorites.has(favName(card));
      const ok = matchesSearch && matchesFilter;
      if (ok) matched++;
      const isVisible = ok && shown < cap;
      if (isVisible) {
        shown++;
        visible.push(card);
      }
      card.classList.toggle("hidden", !isVisible);
      const fb = card.querySelector("[data-favorite]");
      fb?.classList.toggle("active", favorites.has(favName(card)));
    }
    placeSlab(visible, q);
    emptyState!.hidden = matched > 0;
    loadMore!.classList.toggle("hidden", matched <= 12 || expanded || Boolean(q) || activeFilter === "Favorites" || activeFilter === "All");
    toolTotal!.textContent = `(${matched})`;
    favCount!.textContent = String(favorites.size);
  }

  function setFilter(f: string) {
    activeFilter = f;
    expanded = f === "All";
    tabs!.querySelectorAll("button").forEach((b) => b.classList.toggle("active", (b as HTMLElement).dataset.filter === f));
    apply();
  }

  tabs.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("button[data-filter]") as HTMLElement | null;
    if (b) setFilter(b.dataset.filter!);
  });

  search.addEventListener("input", apply);
  search.addEventListener("keydown", (e) => { if ((e as KeyboardEvent).key === "Escape") { search.value = ""; apply(); } });

  loadMore.addEventListener("click", () => { expanded = true; apply(); });
  clearBtn?.addEventListener("click", () => { search.value = ""; setFilter("All"); search.focus(); });

  grid.addEventListener("click", (e) => {
    const fav = (e.target as HTMLElement).closest("[data-favorite]") as HTMLElement | null;
    if (!fav) return; // let the card <a> navigate normally
    e.preventDefault();
    e.stopPropagation();
    const name = fav.dataset.favorite!;
    if (favorites.has(name)) { favorites.delete(name); toast(`${name} removed from favorites`); }
    else { favorites.add(name); toast(`${name} saved to favorites`); }
    localStorage.setItem("doctech-favorites", JSON.stringify([...favorites]));
    apply();
  });

  categoryGrid?.addEventListener("click", (e) => {
    const card = (e.target as HTMLElement).closest("[data-category]") as HTMLElement | null;
    if (!card) return;
    search.value = card.dataset.category!;
    setFilter("All");
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
  });

  // Grid / List view toggle (persisted)
  const viewToggle = document.getElementById("viewToggle");
  function setView(view: string) {
    const list = view === "list";
    grid!.classList.toggle("list-view", list);
    viewToggle?.querySelectorAll("button").forEach((b) => b.classList.toggle("active", (b as HTMLElement).dataset.view === view));
    localStorage.setItem("doctech-view", view);
  }
  viewToggle?.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("button[data-view]") as HTMLElement | null;
    if (b) setView(b.dataset.view!);
  });
  setView(localStorage.getItem("doctech-view") === "list" ? "list" : "grid");

  apply();
}
