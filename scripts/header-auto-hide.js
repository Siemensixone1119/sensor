let _vvhInited = false;
export function ensureDynamicVh() {
  if (_vvhInited) return;
  const setVvh = () => {
    const h = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty('--vvh', `${Math.round(h * 100) / 100}px`);
  };
  setVvh();
  window.addEventListener('resize', setVvh, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setVvh, { passive: true });
    window.visualViewport.addEventListener('scroll', setVvh, { passive: true });
  }
  _vvhInited = true;
}

export function initHeaderAutoHide() {
  ensureDynamicVh();

  const headerOverlay = document.querySelector('.header__overlay');
  const headerOverlayInner = document.querySelector('.header__overlay-inner');
  if (!headerOverlay || !headerOverlayInner) return;

  const docEl = document.documentElement;
  const getHeaderInnerHeight = () => headerOverlayInner.offsetHeight;

  let lastScrollY = window.scrollY;
  let headerRevealOffset = 0;
  let lastViewportWidth = window.innerWidth;
  let isInitialized = false;
  let lastTick = performance.now();

  const updateStickyTopVar = () => {
    const headerBottom = Math.max(0, Math.round(headerOverlay.getBoundingClientRect().bottom));
    docEl.style.setProperty('--sticky-top', `${headerBottom}px`);
  };

  const renderHeaderPosition = () => {
    const h = getHeaderInnerHeight();
    headerOverlay.style.transform = `translateY(${-h + headerRevealOffset}px)`;
    updateStickyTopVar();
  };

  const recalcLayout = (preserveFraction = true) => {
    const currentH = getHeaderInnerHeight();
    const prevH = parseFloat(docEl.style.getPropertyValue('--header-inner-prev-height')) || currentH;

    if (!isInitialized) {
      headerRevealOffset = currentH;
      isInitialized = true;
    } else if (preserveFraction && prevH && prevH !== currentH) {
      const fractionVisible = Math.max(0, Math.min(1, headerRevealOffset / prevH));
      headerRevealOffset = Math.round(fractionVisible * currentH);
    } else {
      headerRevealOffset = Math.max(0, Math.min(headerRevealOffset, currentH));
    }

    docEl.style.setProperty('--header-inner-prev-height', `${currentH}`);
    lastScrollY = window.scrollY;
    renderHeaderPosition();
  };

const onScroll = () => {
  const now = performance.now();
  const dt = now - lastTick;           // мс между кадрами
  const y = window.scrollY;
  const delta = lastScrollY - y;       // >0 — тянем вверх
  const h = getHeaderInnerHeight();
  const atTop = y <= 0;                // самый верх
  const flickUp = delta > 25 && dt < 60;

  if (delta > 0) { // прокрутка вверх
    headerRevealOffset = Math.min(headerRevealOffset + delta, h);

    // снап: у самого верха или при резком рывке — раскрываем шапку полностью
    if (atTop || flickUp || headerRevealOffset > h * 0.85) {
      headerRevealOffset = h;
    }
  } else if (delta < 0) { // прокрутка вниз
    headerRevealOffset = Math.max(headerRevealOffset + delta, 0);

    // опционально: быстрый «закрывающий» снап при резком рывке вниз
    if ((-delta) > 25 && dt < 60 && headerRevealOffset < h * 0.15) {
      headerRevealOffset = 0;
    }
  }

  renderHeaderPosition();
  lastScrollY = y;
  lastTick = now;
};
  const onVisualViewportChange = () => {

    updateStickyTopVar();
    renderHeaderPosition();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => recalcLayout(true), { once: true });
  } else {
    recalcLayout(true);
  }

  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });

  window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth;
    if (currentWidth !== lastViewportWidth) {
      lastViewportWidth = currentWidth;
      recalcLayout(true);
    } else {
      updateStickyTopVar();
    }
  }, { passive: true });

  window.addEventListener('orientationchange', () => recalcLayout(true), { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onVisualViewportChange, { passive: true });
    window.visualViewport.addEventListener('scroll', onVisualViewportChange, { passive: true });
  }
}
