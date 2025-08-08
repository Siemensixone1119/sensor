const refs = {
  openBtn: document.querySelector("#open-menu"),
  closeBtn: document.querySelector(".mobile-menu__close-btn"),
  menu: document.querySelector(".mobile-menu__wrap"),
  headerTop: document.querySelector(".header__top"),
  headerBottom: document.querySelector(".header__bottom"),
  menuButtons: document.querySelectorAll(
    ".mobile-menu__link button[data-title]"
  ),
  subMenu: document.querySelector(".mobile-menu__wrap.v"),
  subMenuTitle: document.querySelector(
    ".mobile-menu__wrap.v .mobile-menu__title"
  ),
  backBtn: document.querySelector(".mobile-menu__back-btn"),
  menuTitle: document.querySelector("[data-title]"),
  searchResult: document.querySelector(".header__search-result"),
  backInputBtn: document.querySelector(".search button"),
  cartBtn: document.querySelector(".header__cart"),
  searchIcon: document.querySelector(".header__search-icon"),
  search: document.querySelector(".search"),
  msgBtn: document.querySelector(".message__btn"),
  openContactBtn: document.querySelector(".header__phone-button"),
  closeContactBtn: document.querySelector(".contacts__close-btn"),
  contacts: document.querySelector(".contacts"),
  header: document.querySelector(".header"),
  searchCont: document.querySelector(".header__search-wrap"),
  searchFalse: document.querySelector(".header__search--false"),
  fakeSearch: document.querySelector(".header__search"),
  realSearch: document.querySelector(".search"),
  realInput: document.querySelector(".search__input"),
  closeSearch: document.querySelector(".search__wrap button"),
};

export default refs;
