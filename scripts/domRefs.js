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
};

export default refs;
