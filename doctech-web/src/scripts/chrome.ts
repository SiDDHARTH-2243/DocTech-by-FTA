// Global chrome: theme toggle, ⌘K command palette (navigates to real tool
// routes), mobile menu, scroll-shadow header, toast. Runs on every page.

interface PTool { name: string; cat: string; href: string; desc: string; icon: string; color: string; soft: string }

const tools: PTool[] = JSON.parse(document.getElementById("__toolsdata")?.textContent || "[]");

const overlay = document.getElementById("commandOverlay");
const input = document.getElementById("commandInput") as HTMLInputElement | null;
const results = document.getElementById("commandResults");
const toastEl = document.getElementById("toast");

let selection = 0;
let matches: PTool[] = [];

export function showToast(message: string) {
  if (!toastEl) return;
  toastEl.querySelector("p")!.textContent = message;
  toastEl.classList.add("show");
  clearTimeout((showToast as any).t);
  (showToast as any).t = setTimeout(() => toastEl.classList.remove("show"), 2400);
}

function renderResults() {
  if (!results || !input) return;
  const q = input.value.trim().toLowerCase();
  matches = tools
    .filter((t) => !q || `${t.name} ${t.cat} ${t.desc}`.toLowerCase().includes(q))
    .slice(0, 8);
  selection = Math.min(selection, Math.max(matches.length - 1, 0));
  results.innerHTML = matches.length
    ? `<span class="command-label">${q ? "SEARCH RESULTS" : "TOOLS"}</span>` +
      matches
        .map(
          (t, i) => `<a class="command-result ${i === selection ? "selected" : ""}" href="${t.href}">
            <span class="tool-icon" style="background:${t.soft}">${t.icon}</span>
            <span><strong>${t.name}</strong><small>${t.cat} · ${t.desc}</small></span>
            <span>↵</span>
          </a>`,
        )
        .join("")
    : `<div class="empty-state"><span>⌕</span><h3>No matches</h3><p>Try another word or category.</p></div>`;
}

function openCommand() {
  if (!overlay || !input) return;
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  input.value = "";
  selection = 0;
  renderResults();
  // Autofocus the moment it opens (overlay toggles via opacity, not visibility,
  // so the input is focusable immediately).
  input.focus();
  requestAnimationFrame(() => input.focus());
}

function closeCommand() {
  if (!overlay) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

// theme toggle — circular reveal via View Transitions API
document.querySelector(".theme-toggle")?.addEventListener("click", (e) => {
  const toggle = e.currentTarget as HTMLElement;

  const applyTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#0d0d0f" : "#f4efe7");
    showToast(`${isDark ? "Dark" : "Light"} mode enabled`);
  };

  // Fall back to an instant toggle when the API is unavailable or the user
  // prefers reduced motion.
  if (
    !(document as any).startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    applyTheme();
    return;
  }

  // Grab the centre of the toggle button for the reveal origin.
  const { top, left, width, height } = toggle.getBoundingClientRect();
  const x = left + width / 2;
  const y = top + height / 2;

  // Radius large enough to cover the farthest viewport corner.
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  );

  const transition = (document as any).startViewTransition(() => {
    applyTheme();
  });

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 450,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
});

// search triggers open the palette
document.querySelectorAll(".search-trigger").forEach((b) => b.addEventListener("click", openCommand));

// palette interactions
input?.addEventListener("input", () => { selection = 0; renderResults(); });
input?.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); selection = Math.min(selection + 1, matches.length - 1); renderResults(); }
  if (e.key === "ArrowUp") { e.preventDefault(); selection = Math.max(selection - 1, 0); renderResults(); }
  if (e.key === "Enter" && matches[selection]) { e.preventDefault(); window.location.href = matches[selection].href; }
});
document.querySelector(".command-backdrop")?.addEventListener("click", closeCommand);

// slide-out tool sidebar (quick-jump to individual tools)
const sidebar = document.getElementById("appSidebar");
const sidebarToggle = document.querySelector(".sidebar-toggle");
const sidebarBackdrop = document.querySelector(".sidebar-backdrop");
const sidebarClose = document.querySelector(".sidebar-close");
const sidebarFilter = document.getElementById("sidebarFilter") as HTMLInputElement | null;

function openSidebar() {
  sidebar?.classList.add("open");
  sidebar?.setAttribute("aria-hidden", "false");
  sidebarBackdrop?.classList.add("open");
  sidebarBackdrop?.setAttribute("aria-hidden", "false");
  sidebarToggle?.setAttribute("aria-expanded", "true");
  document.body.classList.add("no-scroll");
  requestAnimationFrame(() => sidebarFilter?.focus());
}
function closeSidebar() {
  sidebar?.classList.remove("open");
  sidebar?.setAttribute("aria-hidden", "true");
  sidebarBackdrop?.classList.remove("open");
  sidebarBackdrop?.setAttribute("aria-hidden", "true");
  sidebarToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
}
sidebarToggle?.addEventListener("click", () =>
  sidebar?.classList.contains("open") ? closeSidebar() : openSidebar(),
);
sidebarBackdrop?.addEventListener("click", closeSidebar);
sidebarClose?.addEventListener("click", closeSidebar);

// sidebar category accordions
document.querySelectorAll(".sidebar-cat-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cat = btn.parentElement;
    const open = cat?.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(!!open));
  });
});

// sidebar tool filter — narrow tools inside the category dropdowns, auto-expanding
// categories that have a match and hiding the ones that don't
const sidebarEmpty = sidebar?.querySelector(".sidebar-empty");
sidebarFilter?.addEventListener("input", () => {
  const q = sidebarFilter.value.trim().toLowerCase();
  let totalShown = 0;
  sidebar?.querySelectorAll<HTMLElement>(".sidebar-cat").forEach((cat) => {
    let catShown = 0;
    cat.querySelectorAll<HTMLElement>(".sidebar-tool[data-name]").forEach((a) => {
      const hit = !q || (a.dataset.name || "").includes(q);
      a.classList.toggle("hidden", !hit);
      if (hit) catShown++;
    });
    cat.classList.toggle("hidden", !!q && catShown === 0);
    cat.classList.toggle("open", !!q && catShown > 0);
    cat.querySelector(".sidebar-cat-btn")?.setAttribute("aria-expanded", String(!!q && catShown > 0));
    totalShown += catShown;
  });
  sidebar?.querySelector(".sidebar-home")?.classList.toggle("hidden", !!q);
  sidebarEmpty?.toggleAttribute("hidden", totalShown > 0);
});

// scroll shadow on header
window.addEventListener("scroll", () => {
  document.querySelector(".site-header")?.classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

// global shortcuts
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openCommand(); }
  if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")) { e.preventDefault(); openCommand(); }
  if (e.key === "Escape") { closeCommand(); closeSidebar(); }
});
