const refs = {
  openBtn: document.querySelector("#open-menu"),
  closeBtn: document.querySelector(".mobile-menu__close-btn"),
  menu: document.querySelector(".mobile-menu__wrap"),
  menuButtons: document.querySelectorAll(
    ".mobile-menu__link button[data-title]"
  ),
  subMenuTitle: document.querySelector(
    ".mobile-menu__wrap.v .mobile-menu__title"
  ),
  backBtn: document.querySelector(".mobile-menu__back-btn"),
  backInputBtn: document.querySelector(".search button"),
  dropInputbtn: document.querySelector(".search__drop"),
  saerchInput: document.querySelector(".search__input"),
  search: document.querySelector(".search"),
  msgBtn: document.querySelector(".message__btn"),
  openContactBtn: document.querySelector(".header__phone-button"),
  closeContactBtn: document.querySelector(".contacts__close-btn"),
  contacts: document.querySelector(".contacts"),
  fakeSearch: document.querySelector(".header__search"),
  headerOverlay: document.getElementById("headerOverlay"),
  headerOverlayInner: document.getElementById("headerOverlayInner"),
  allCloseButtons: document.querySelectorAll(".mobile-menu__close-btn"),
  mainMenu: document.querySelector(".mobile-menu__wrap"),
  subMenu: document.querySelector(".mobile-menu__wrap.v"),
  headerOverlay: document.getElementById("headerOverlay"),
  headerOverlayInner: document.getElementById("headerOverlayInner"),
  submenuStickers: document.getElementsByClassName("submenu-sticker"),
};

export default refs;
