import refs from "./domRefs.js";

export function setupHeaderScroll() {
  // let lastScroll = window.scrollY;

  // window.addEventListener("scroll", () => {
  //   const currentScroll = window.scrollY;

  //   if (currentScroll < lastScroll) {
  //     refs.headerTop.classList.add("visible");
  //     refs.headerBottom.classList.add("shifted");
  //   } else {
  //     refs.headerTop.classList.remove("visible");
  //     refs.headerBottom.classList.remove("shifted");
  //   }

  //   lastScroll = currentScroll;
  // });

  let lastScroll = window.scrollY;
let offset = 0;
const headerHeight = refs.headerTop.offsetHeight; // предполагаем, что это верхняя часть хедера

// Убедимся, что у элементов есть нужные классы для трансформации
refs.headerTop.classList.add('scroll-behavior-top');
refs.headerBottom.classList.add('scroll-behavior-bottom');

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;
  const delta = lastScroll - currentScroll;

  // Скроллим вверх
  if (delta > 0 && currentScroll > 0) {
    offset = Math.min(offset + delta, headerHeight);
  } 
  // Скроллим вниз
  else if (delta < 0) {
    offset = Math.max(offset + delta, 0);
  }

  // Применяем классы на основе смещения
  if (offset <= 0) {
    refs.headerTop.classList.remove("visible");
    refs.headerBottom.classList.remove("shifted");
  } else {
    refs.headerTop.classList.add("visible");
    refs.headerBottom.classList.add("shifted");
  }

  lastScroll = currentScroll;
});


}
