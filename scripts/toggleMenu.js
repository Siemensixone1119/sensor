import refs from "./domRefs.js";

export function setupMenuToggle() {
  refs.openBtn.addEventListener("click", toggleMenu);
  refs.closeBtn.addEventListener("click", toggleMenu);

  function toggleMenu() {
    refs.menu.classList.toggle("open");
    document.body.classList.toggle("no-scroll");
  }
}
