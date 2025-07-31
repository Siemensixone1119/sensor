const refs = {
  openBtn: document.querySelector(".header__menu-toggle"),
  closeBtn: document.querySelector(".mobile-menu__close-btn"),
  menu: document.querySelector(".mobile-menu__wrap"),
  headerTop: document.querySelector(".header__top"),
  headerBottom: document.querySelector(".header__bottom"),
  
menuTitle: document.querySelector("[data-title]")
};

// открытие меню

refs.openBtn.addEventListener("click", toggleMenu);
refs.closeBtn.addEventListener("click", toggleMenu);

function toggleMenu() {
  refs.menu.classList.toggle("open");
  document.body.classList.toggle("no-scroll");
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

  const menuButtons = document.querySelectorAll('.mobile-menu__link button[data-title]');
const subMenu = document.querySelector('.mobile-menu__wrap.v');
const subMenuTitle = document.querySelector('.mobile-menu__wrap.v .mobile-menu__title');
const backBtn = document.querySelector('.mobile-menu__back-btn');

backBtn.addEventListener('click', () => {
  subMenu.classList.remove('open'); // Скрываем подменю
});

menuButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const title = btn.getAttribute('data-title');
    subMenuTitle.textContent = title;
    subMenu.classList.add('open'); // Показываем подменю
  });
});
