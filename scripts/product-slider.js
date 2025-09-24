export function slider() {
  const track = document.querySelector(".product__slider");
  const slides = document.querySelectorAll(".slider__item");
  const pagination = document.querySelector(".slider__pagination");

  let currentIndex = 0;
  let startX = 0;

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("div");
    dot.classList.add("slider__dot");
    pagination.appendChild(dot);
  }

  const dots = document.querySelectorAll(".slider__dot");

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

export function certSlider() {
  const slider = document.querySelector(".product__cert");
  const container = document.querySelector(".product__cert-slider");
  if (!slider || !container) return;

  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let isDragging = false;

  slider.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    slider.style.transition = "none";
  });

  slider.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    currentTranslate = prevTranslate + deltaX;
    slider.style.transform = `translateX(${currentTranslate}px)`;
  });

  slider.addEventListener("touchend", () => {
    isDragging = false;
    prevTranslate = currentTranslate;

    const maxTranslate = 0;
    const minTranslate = -(slider.scrollWidth - container.offsetWidth);

    // ограничение, чтобы не уезжал за края
    if (prevTranslate > maxTranslate) prevTranslate = maxTranslate;
    if (prevTranslate < minTranslate) prevTranslate = minTranslate;

    slider.style.transition = "transform 0.3s ease";
    slider.style.transform = `translateX(${prevTranslate}px)`;
  });
}
