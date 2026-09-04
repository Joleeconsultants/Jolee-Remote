/*
 * Tiny overlay: when the Selkies sidebar overflows, add .has-scrollbar so
 * jolee-theme.css widens by the scrollbar width. Class drops when content
 * fits again — no permanent scrollbar-gutter. Safe across upstream Sidebar
 * refreshes (watches .sidebar in the DOM; no JSX patch).
 */
const ATTR = "data-jolee-gutter";

function sync(el) {
  const had = el.classList.contains("has-scrollbar");
  el.classList.remove("has-scrollbar");
  // Measure at stock width so we do not oscillate.
  const needs = el.scrollHeight > el.clientHeight + 1;
  if (needs) el.classList.add("has-scrollbar");
  return had !== needs;
}

function attach(el) {
  if (el.getAttribute(ATTR) === "1") return;
  el.setAttribute(ATTR, "1");
  let pending = false;
  const run = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      sync(el);
    });
  };
  new ResizeObserver(run).observe(el);
  new MutationObserver(run).observe(el, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });
  window.addEventListener("resize", run);
  run();
}

function scan() {
  document.querySelectorAll(".sidebar").forEach(attach);
}

scan();
new MutationObserver(scan).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
