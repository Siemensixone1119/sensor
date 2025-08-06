import refs from "./domRefs.js";

export function setupInputFocus() {
  refs.search.addEventListener("focus", () => {
        document.querySelector(".menu").classList.add("is-hidden")
    refs.headerTop.classList.add("is-hidden");
    refs.headerBottom.classList.remove("header__bottom--shifted");

    refs.searchResult.classList.remove("is-hidden");
    document.body.classList.add("no-scroll");

    refs.backInputBtn.classList.remove("is-hidden");
    refs.openBtn.classList.add("is-hidden");
    refs.cartBtn.classList.add("is-hidden");
    refs.searchIcon.classList.add("is-hidden");

    refs.searchWrap.style.width = "100vw";

  });

  refs.backInputBtn.addEventListener("click", () => {
    document.querySelector(".menu").classList.remove("is-hidden")
    document.body.classList.remove("no-scroll");

    refs.headerTop.classList.remove("is-hidden");
    refs.headerTop.classList.add("header__top--visible");
    refs.headerBottom.classList.add("header__bottom--shifted");

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
      refs.headerTop.classList.add("header__top--visible");
      refs.headerBottom.classList.add("header__bottom--shifted");
    } else {
      refs.headerTop.classList.remove("header__top--visible");
      refs.headerBottom.classList.remove("header__bottom--shifted");
    }

    lastScroll = currentScroll;
  });

  let lastScroll = window.scrollY;
}
