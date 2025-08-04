import refs from "./domRefs.js";

export function setupMenuToggle() {
  refs.openBtn.addEventListener("click", toggleMenu);
  refs.closeBtn.addEventListener("click", toggleMenu);

  function toggleMenu() {
     const expanded = refs.openBtn.getAttribute("aria-expanded") === "true";
    const newState = !expanded;
    refs.openBtn.setAttribute("aria-expanded", String(newState));
    refs.menu.setAttribute("aria-hidden", String(!newState));
    refs.menu.classList.toggle("open");
    document.body.classList.toggle("no-scroll");
  }
}
