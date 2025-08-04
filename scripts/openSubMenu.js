import refs from "./domRefs.js";

export function setupSubmenu() {
  refs.backBtn.addEventListener("click", () => {
    refs.subMenu.classList.remove("open");
    refs.subMenu.setAttribute("aria-hidden", "true");
  });

  refs.menuButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.getAttribute("data-title");
      refs.subMenuTitle.textContent = title;
      refs.subMenu.classList.add("open");
      refs.subMenu.setAttribute("aria-hidden", "false");
    });
  });
}
