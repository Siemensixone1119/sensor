export function setupCloseAllMenus() {
  const allCloseButtons = document.querySelectorAll(".mobile-menu__close-btn");
  const mainMenu = document.querySelector(".mobile-menu__wrap");
  const subMenu = document.querySelector(".mobile-menu__wrap.v");

  allCloseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      mainMenu.classList.remove("open");
      subMenu.classList.remove("open");
      document.body.classList.remove("no-scroll");
    });
  });
}
