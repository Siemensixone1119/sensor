const refs = {
  openBtn: document.querySelector(".header__menu-toggle"),
  closeBtn: document.querySelector(".mobile-menu__close-btn"),
  menu: document.querySelector(".mobile-menu__wrap"),
  headerTop: document.querySelector(".header__top"),
  headerBottom: document.querySelector(".header__bottom"),
};

// открытие меню

refs.openBtn.addEventListener("click", toggleMenu);
refs.closeBtn.addEventListener("click", toggleMenu);

function toggleMenu() {
  refs.menu.classList.toggle("open");
  document.body.classList.toggle(".no-scroll");
}

// поведение хэдера

window.addEventListener("scroll", hideScroll);
let lastScroll = window.scrollY;

function hideScroll() {
  const currentScroll = window.scrollY;

  if (currentScroll < lastScroll) {
    refs.headerTop.classList.add("visible");
    refs.headerBottom.classList.add("shifted");
  } else {
    refs.headerTop.classList.remove("visible");
    refs.headerBottom.classList.remove("shifted");
  }

  lastScroll = currentScroll;
}

// отрисовка верхней рамки в выпадающем списке

document
  .querySelectorAll('.menu input[type="checkbox"]')
  .forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      document.querySelectorAll(".menu li").forEach((li) => {
        li.classList.remove("with-border");
      });
      document
        .querySelectorAll('.menu input[type="checkbox"]:checked')
        .forEach((cb) => {
          const currentLi = cb.closest("li");
          const nextLi = currentLi?.nextElementSibling;

          if (nextLi && nextLi.tagName === "LI") {
            nextLi.classList.add("with-border");
          }
        });
    });
  });
