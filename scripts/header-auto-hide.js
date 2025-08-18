export function initHeaderAutoHide() {
  const docEl = document.documentElement;
  const overlay = document.querySelector(".header__overlay");
  const inner = document.querySelector(".header__overlay-inner");
  const search = document.querySelector(".header__overlay-search");
  if (!overlay || !inner || !search) return;

  let H_INNER = inner.offsetHeight;
  let H_SEARCH = search.offsetHeight;

  let reveal = H_INNER;
  let lastY = window.scrollY;
  let ticking = false;

  const draw = () => {
    const y = Math.round(-H_INNER + reveal);
    overlay.style.transform = `translate3d(0, ${y}px, 0)`;
    docEl.style.setProperty(
      "--sticky-top",
      `${Math.round(reveal + H_SEARCH)}px`
    );
  };

  const onScrollLogic = () => {
    const y = window.scrollY;
    const delta = lastY - y;

    if (delta !== 0) {
      reveal += delta;
      if (reveal < 0) reveal = 0;
      else if (reveal > H_INNER) reveal = H_INNER;

      draw();
    }
    lastY = y;
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        onScrollLogic();
        ticking = false;
      });
    }
  };

  const recalc = () => {
    const prev = H_INNER;
    H_INNER = inner.offsetHeight;
    H_SEARCH = search.offsetHeight;

    if (prev > 0) {
      const frac = reveal / prev;
      reveal = Math.max(0, Math.min(1, frac)) * H_INNER;
    } else {
      reveal = H_INNER;
    }
    draw();
  };
  draw();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", recalc, { passive: true });
  window.addEventListener("orientationchange", recalc, { passive: true });
}
