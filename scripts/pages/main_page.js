function heroMobileSlider() {
  const hero = document.querySelector(".hero");
  const track = document.querySelector(".slider__list");
  const slides = document.querySelectorAll(".slider__item");

  if (!hero || !track || slides.length === 0) return;

  let currentIndex = 0;
  let startX = 0;

  function updateSlider() {
    const width = hero.getBoundingClientRect().width;
    track.style.transition = "transform 300ms ease";
    track.style.transform = `translateX(-${currentIndex * width}px)`;
  }

  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;

    if (startX - endX > 50) {
      currentIndex = Math.min(currentIndex + 1, slides.length - 1);
    } else if (endX - startX > 50) {
      currentIndex = Math.max(currentIndex - 1, 0);
    }

    updateSlider();
  });

  window.addEventListener("resize", updateSlider);

  updateSlider();
}
heroMobileSlider()