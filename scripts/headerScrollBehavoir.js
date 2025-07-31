import refs from "./domRefs.js";

export function setupHeaderScroll() {
  let lastScroll = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    if (currentScroll < lastScroll) {
      refs.headerTop.classList.add("visible");
      refs.headerBottom.classList.add("shifted");
    } else {
      refs.headerTop.classList.remove("visible");
      refs.headerBottom.classList.remove("shifted");
    }

    lastScroll = currentScroll;
  });
}
