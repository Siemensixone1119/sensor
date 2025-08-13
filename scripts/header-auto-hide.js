export function initHeaderAutoHide() {
  const headerOverlay = document?.querySelector(".header__overlay");
  const headerOverlayInner = document?.querySelector(".header__overlay-inner");
  const docEl = document.documentElement;
  const getHeaderInnerHeight = () => headerOverlayInner.offsetHeight;

  let lastScrollY = 0;
  let headerRevealOffset = 0;
  let lastViewportWidth = window.innerWidth;
  let isInitialized = false;

  const updateStickyTopVar = () => {
    const headerBottom = Math.max(
      0,
      Math.round(headerOverlay.getBoundingClientRect().bottom)
    );
    docEl.style.setProperty("--sticky-top", `${headerBottom}px`);
  };

  const renderHeaderPosition = () => {
    const h = getHeaderInnerHeight();
    headerOverlay.style.transform = `translateY(${-h + headerRevealOffset}px)`;
    updateStickyTopVar();
  };

  const recalcLayout = (preserveFraction = true) => {
    const currentH = getHeaderInnerHeight();
    const prevH =
      parseFloat(docEl.style.getPropertyValue("--header-inner-prev-height")) ||
      currentH;

    if (!isInitialized) {
      headerRevealOffset = currentH;
      isInitialized = true;
    } else if (preserveFraction && prevH && prevH !== currentH) {
      const fractionVisible = Math.max(
        0,
        Math.min(1, headerRevealOffset / prevH)
      );
      headerRevealOffset = Math.round(fractionVisible * currentH);
    } else {
      headerRevealOffset = Math.max(0, Math.min(headerRevealOffset, currentH));
    }

    docEl.style.setProperty("--header-inner-prev-height", `${currentH}`);
    lastScrollY = window.scrollY;
    renderHeaderPosition();
  };

  const handleScroll = () => {
    const y = window.scrollY;
    const delta = lastScrollY - y;
    const h = getHeaderInnerHeight();

    if (Math.abs(delta) < 1) {
      lastScrollY = y;
      updateStickyTopVar();
      return;
    }

    if (delta > 0 && y > 0) {
      headerRevealOffset = Math.min(headerRevealOffset + delta, h);
    } else if (delta < 0) {
      headerRevealOffset = Math.max(headerRevealOffset + delta, 0);
    }

    renderHeaderPosition();
    lastScrollY = y;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => recalcLayout(true), {
      once: true,
    });
  } else {
    recalcLayout(true);
  }

  window.addEventListener("scroll", () => requestAnimationFrame(handleScroll), {
    passive: true,
  });
  window.addEventListener(
    "resize",
    () => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== lastViewportWidth) {
        lastViewportWidth = currentWidth;
        recalcLayout(true);
      } else {
        updateStickyTopVar();
      }
    },
    { passive: true }
  );

  window.addEventListener("orientationchange", () => recalcLayout(true), {
    passive: true,
  });

  if (window.visualViewport) {
    const onVisualViewportChange = () => updateStickyTopVar();
    window.visualViewport.addEventListener("resize", onVisualViewportChange, {
      passive: true,
    });
    window.visualViewport.addEventListener("scroll", onVisualViewportChange, {
      passive: true,
    });
  }
}
