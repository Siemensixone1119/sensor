const refs = {
  openBtn: document.querySelector(".header__menu-toggle"),
  closeBtn: document.querySelector(".mobile-menu__close-btn"),
  menu: document.querySelector(".mobile-menu__wrap"),
  headerTop: document.querySelector(".header__top"),
  headerBottom: document.querySelector(".header__bottom"),
  menuButtons: document.querySelectorAll(".mobile-menu__link button[data-title]"),
  subMenu: document.querySelector(".mobile-menu__wrap.v"),
  subMenuTitle: document.querySelector(".mobile-menu__wrap.v .mobile-menu__title"),
  backBtn: document.querySelector(".mobile-menu__back-btn"),
  menuTitle: document.querySelector("[data-title]"),
  search: document.querySelector(".header__search-input"),
  searchResult: document.querySelector(".header__search-res"),
  backInputBtn: document.querySelector(".header__search button"),
  cartBtn: document.querySelector(".header__cart"),
  searchIcon: document.querySelector(".header__search-icon"),
  searchWrap: document.querySelector(".header__search"),
  msgBtn: document.querySelector(".message__btn")
};

export default refs;
