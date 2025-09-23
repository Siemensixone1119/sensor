
export function slider() {
  const leftBtn = document.querySelector(".product__btn--left");
  const rightBtn = document.querySelector(".product__btn--right");
  const slider = document.querySelector(".product__slider");
  const slides = document.querySelectorAll(".product__slider li");

  let currentIndex = 0;
  const totalSlides = slides.length;

  function updateSlider() {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  rightBtn.addEventListener("click", () => {
    currentIndex++;
    if (currentIndex >= totalSlides) currentIndex = 0;
    updateSlider();
  });

  leftBtn.addEventListener("click", () => {
    currentIndex--;
    if (currentIndex < 0) currentIndex = totalSlides - 1;
    updateSlider();
  });
}


