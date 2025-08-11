import refs from "./domRefs.js";

export function setupHeaderScroll() {
  const { headerOverlay, headerOverlayInner } = refs;
  const root = document.documentElement;

  const H = () => headerOverlayInner.offsetHeight;
  let lastY = 0;
  let offset = 0;

  const updateStickyTop = () => {
    const bottom = Math.max(0, Math.round(headerOverlay.getBoundingClientRect().bottom));
    root.style.setProperty('--sticky-top', `${bottom}px`);
  };

  const apply = () => {
    headerOverlay.style.transform = `translateY(${ -H() + offset }px)`;
    updateStickyTop();
  };

  const init = () => {
    offset = H();
    lastY = window.scrollY;
    apply();
  };

  const onScroll = () => {
    const y = window.scrollY;
    const d = lastY - y;
    const h = H();

    if (d > 0 && y > 0) offset = Math.min(offset + d, h);
    else if (d < 0)     offset = Math.max(offset + d, 0);

    apply();
    lastY = y;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  window.addEventListener('resize', () => { init(); });
}
