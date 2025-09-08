export function initHeaderAutoHide() {
  const overlay = document.querySelector(".header__overlay");
  const inner   = document.querySelector(".header__overlay-inner");
  const search  = document.querySelector(".header__overlay-search");
  const content = document.querySelector(".x-scroll") || document.querySelector("main");
  if (!overlay || !inner || !search || !content) return;

  const dpr  = window.devicePixelRatio || 1;
  const snap = v => Math.round(v * dpr) / dpr;

  let H_INNER   = Math.round(inner.offsetHeight);
  let H_SEARCH  = Math.round(search.offsetHeight);
  let H_OVERLAY = Math.round(overlay.offsetHeight);

  let offset = H_INNER;
  const headerHeight = H_INNER;
  let lastScrollTop = getScrollY();

  function getScrollY() {
    const y = window.scrollY ?? document.documentElement.scrollTop ?? 0;
    return Math.max(0, y);
  }
  function updateStickyTop() {
    const visibleHeader = snap(offset + H_SEARCH);
    document.documentElement.style.setProperty("--sticky-top", `${visibleHeader}px`);
  }

  function draw() {
    const y = snap(-headerHeight + offset);
    overlay.style.transform = `translate3d(0, ${y}px, 0)`;
    updateStickyTop();
  }

  function onScroll() {
    const currentScroll = getScrollY();
    let delta = lastScrollTop - currentScroll;
    if (currentScroll <= 0) {
      offset = headerHeight;
      draw();
      lastScrollTop = 0;
      return;
    }

    // if (Math.abs(delta) < 0.5) delta = 0;

    if (delta > 0) {
      offset = Math.min(offset + delta, headerHeight);
    } else if (delta < 0) {
      offset = Math.max(offset + delta, 0);
    }

    draw();
    lastScrollTop = currentScroll;
  }

  function recalc() {
    const prevInner = H_INNER;

    H_INNER   = Math.round(inner.offsetHeight);
    H_SEARCH  = Math.round(search.offsetHeight);
    H_OVERLAY = Math.round(overlay.offsetHeight);

    if (getScrollY() <= 0) {
      offset = H_INNER;
    } else {
      const frac = prevInner > 0 ? (offset / prevInner) : 1;
      offset = Math.max(0, Math.min(1, frac)) * H_INNER;
    }

    draw();
  }

  updateStickyTop();
  draw();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", recalc, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(recalc, 150), { passive: true });
}
