import refs from "./domRefs.js";

export function setupCloseAllMenus() {
  refs.allCloseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
     refs.mainMenu.classList.remove("open");
      refs.subMenu.classList.remove("open");
      document.body.classList.remove("no-scroll");
    });
  });
}
