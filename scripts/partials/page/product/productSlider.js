export function productSlider() {
  const track = document.querySelector(".product-slider__list");
  const slides = document.querySelectorAll(".product-slider__item");
  const pagination = document.querySelector(".product-slider__pagination");

  let currentIndex = 0;
  let startX = 0;

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("div");
    dot.classList.add("product-slider__dot");
    pagination.appendChild(dot);
  }

  const dots = document.querySelectorAll(".product-slider__dot");

  function updateSlider() {
    track.style.transform = `translateX(-${100 * currentIndex}%)`;

    dots.forEach((dot) => dot.classList.remove("active"));

    if (currentIndex === 0) {
      dots[0].classList.add("active");
    } else if (currentIndex === slides.length - 1) {
      dots[2].classList.add("active");
    } else {
      dots[1].classList.add("active");
    }
  }

  // свайпы
  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  track.addEventListener("touchend", (e) => {
    let endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) {
      currentIndex = Math.min(currentIndex + 1, slides.length - 1);
    } else if (endX - startX > 50) {
      currentIndex = Math.max(currentIndex - 1, 0);
    }
    updateSlider();
  });

  updateSlider();
}