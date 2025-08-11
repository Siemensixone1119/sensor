import refs from "./domRefs.js";

export function setupHeaderScroll() {
  const headerOverlayHeight = refs.headerOverlay.offsetHeight;
  const headerOverlayInnerHeight = refs.headerOverlayInner.offsetHeight;
  const adjust = 67;
  let lastScrollTop = window.scrollY;
  let offset = headerOverlayInnerHeight;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    const delta = lastScrollTop - currentScroll;

    if (delta > 0 && currentScroll > 0) {
      offset = Math.min(offset + delta, headerOverlayInnerHeight);
    } else if (delta < 0) {
      offset = Math.max(offset + delta, 0);
    }

    if (offset > 0) {
      refs.headerOverlay.style.transform = `translateY(${
        -headerOverlayInnerHeight + offset - adjust
      }px)`;
      for (const submenuSticker of refs.submenuStickers)
        submenuSticker.style.top = `${
          headerOverlayHeight - headerOverlayInnerHeight + offset - adjust
        }px`;
    } else {
      refs.headerOverlay.style.transform = `translateY(calc(${
        headerOverlayHeight - headerOverlayInnerHeight - adjust
      }px - 100%))`;
      for (const submenuSticker of refs.submenuStickers)
        submenuSticker.style.top = `${
          headerOverlayHeight - headerOverlayInnerHeight - adjust
        }px`;
    }

    lastScrollTop = currentScroll;
  });
}
