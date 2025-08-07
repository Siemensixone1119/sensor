import refs from "./domRefs.js";

export function setupInputFocus() {
  let _scrollY = 0;
  function lockBodyScroll() {
    _scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${_scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }
  function unlockBodyScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, _scrollY);
  }

  const { header, searchWrap, searchResult, searchIcon, backInputBtn } = refs;

  function openSearch() {
    refs.headerBottom.classList.remove("header__bottom--shifted");
    lockBodyScroll();
    header.classList.add("search-active");
    searchWrap.classList.add("search-active");
    searchResult.classList.add("is-open");
    searchIcon.classList.add("is-hidden");
    backInputBtn.classList.remove("is-hidden");
    searchWrap.querySelector("input").focus();
    header.classList.add("search-active");
    refs.openBtn.classList.add("is-hidden");
    refs.cartBtn.classList.add("is-hidden");
    searchWrap.classList.add("header__search-wrap--active");
  }

  function closeSearch(e) {
    if (e) e.stopPropagation();
    refs.headerBottom.classList.add("header__bottom--shifted");
    unlockBodyScroll();
    header.classList.remove("search-active");
    searchWrap.classList.remove("search--active");
    searchWrap.classList.remove("header__search--active");
    searchResult.classList.remove("is-open");
    backInputBtn.classList.add("is-hidden");
    searchIcon.classList.remove("is-hidden");
    searchWrap.querySelector("input").value = "";
    refs.headerTop.classList.add("header__top--visible");
    refs.openBtn.classList.remove("is-hidden");
    refs.cartBtn.classList.remove("is-hidden");
    searchWrap.classList.remove("header__search-wrap--active");
  }

  refs.searchCont.addEventListener("click", openSearch);
  refs.search.addEventListener("focus", openSearch);
  backInputBtn.addEventListener("click", closeSearch);
}
