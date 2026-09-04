/*
 * Tiny overlay: when the Selkies sidebar overflows, add .has-scrollbar so
 * jolee-theme.css widens by the scrollbar width. Class drops when content
 * fits again — no permanent scrollbar-gutter. Safe across upstream Sidebar
 * refreshes (watches .sidebar in the DOM; no JSX patch).
 *
 * Never strip the class just to remeasure — that caused a one-frame left nudge.
 */
const ATTR = "data-jolee-gutter";
const FALLBACK_SB = 8; /* matches Overlay.css ::-webkit-scrollbar width */

function sync(el) {
  const had = el.classList.contains("has-scrollbar");
  if (had) {
    // Still overflowing inside the compensated box? Keep the class.
    if (el.scrollHeight > el.clientHeight + 1) return;
    // Content fits with compensation — try stock width.
    el.classList.remove("has-scrollbar");
    if (el.scrollHeight > el.clientHeight + 1) {
      el.classList.add("has-scrollbar");
    }
    return;
  }
  if (el.scrollHeight <= el.clientHeight + 1) return;
  // Scrollbar already eating layout; measure it, then widen so content stays put.
  const sb = Math.max(FALLBACK_SB, el.offsetWidth - el.clientWidth) || FALLBACK_SB;
  el.style.setProperty("--jolee-sb", `${sb}px`);
  el.classList.add("has-scrollbar");
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
  // childList only — do not watch class/style on self (avoids re-entry on toggle).
  new MutationObserver(run).observe(el, { childList: true, subtree: true });
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
