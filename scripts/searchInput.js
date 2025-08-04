import refs from "./domRefs.js";

export function setupInputFocus() {
  refs.search.addEventListener("focus", () => {
    refs.headerTop.classList.add("is-hidden");
    refs.headerBottom.classList.remove("shifted");

    refs.searchResult.classList.remove("is-hidden");
    document.body.classList.add("no-scroll");

    refs.backInputBtn.classList.remove("is-hidden");
    refs.openBtn.classList.add("is-hidden");
    refs.cartBtn.classList.add("is-hidden");
    refs.searchIcon.classList.add("is-hidden");

    refs.searchWrap.style.width = "100vw";
  });

  refs.backInputBtn.addEventListener("click", () => {
    document.body.classList.remove("no-scroll");

    refs.headerTop.classList.remove("is-hidden");
    refs.headerTop.classList.add("visible");
    refs.headerBottom.classList.add("shifted");

    refs.searchResult.classList.add("is-hidden");
    refs.backInputBtn.classList.add("is-hidden");

    refs.openBtn.classList.remove("is-hidden");
    refs.cartBtn.classList.remove("is-hidden");
    refs.searchIcon.classList.remove("is-hidden");

    refs.search.value = "";
    refs.searchWrap.style.width = "";
  });

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

  let lastScroll = window.scrollY;
}
