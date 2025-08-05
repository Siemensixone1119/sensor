import refs from "./domRefs.js";

export function setupHeaderScroll() {
  let lastScroll = window.scrollY;
  let offset = 0;
  const headerHeight = refs.headerTop.offsetHeight;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    const delta = lastScroll - currentScroll;

    if (delta > 0 && currentScroll > 0) {
      offset = Math.min(offset + delta, headerHeight);
    } else if (delta < 0) {
      offset = Math.max(offset + delta, 0);
    }

    if (offset <= 0) {
      refs.headerTop.classList.remove("header__top--visible");
      refs.headerBottom.classList.remove("header__bottom--shifted");
    } else {
      refs.headerTop.classList.add("header__top--visible");
      refs.headerBottom.classList.add("header__bottom--shifted");
    }

    lastScroll = currentScroll;
  });
}
