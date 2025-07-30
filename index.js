const refs = {
  openBtn: document.querySelector(".header__menu-toggle"),
  closeBtn: document.querySelector(".mobile-menu__close-btn"),
  menu: document.querySelector(".mobile-menu__wrap"),
  backdrop: document.querySelector(".backdrop"),
};

refs.openBtn.addEventListener("click", toggleMenu);
refs.closeBtn.addEventListener("click", toggleMenu);

function toggleMenu() {
  refs.menu.classList.toggle("open");
  refs.backdrop.classList.toggle("open");
}
