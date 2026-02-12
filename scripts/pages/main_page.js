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
heroMobileSlider();

function partnersSwipeSlider() {
  const root = document.querySelector(".partners");
  const track = document.querySelector(".partners__list");
  const slides = Array.from(track?.children ?? []).filter(n => n.nodeType === 1);

  if (!root || !track || slides.length === 0) return;

  const END_OFFSET = 5; // <-- сдвиг последнего положения влево на 5px

  let index = 0;
  let startX = 0;

  function getRootW() {
    return root.getBoundingClientRect().width;
  }

  function getStep() {
    // если есть gap в flex — учитываем
    const a = slides[0];
    const b = slides[1] || slides[0];
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    const step = rb.left - ra.left;
    return step > 0 ? step : ra.width;
  }

  function update(animate = true) {
    const rootW = getRootW();
    const step = getStep();

    const totalW = track.scrollWidth;
    const maxScroll = Math.max(0, totalW - rootW + END_OFFSET); // <-- тут магия

    const raw = index * step;
    const clamped = Math.max(0, Math.min(raw, maxScroll));

    track.style.transition = animate ? "transform 300ms ease" : "none";
    track.style.transform = `translate3d(${-clamped}px,0,0)`;
  }

  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    track.style.transition = "none";
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const delta = startX - endX;

    if (delta > 50) index += 1;
    if (delta < -50) index -= 1;

    if (index < 0) index = 0;
    // справа не ограничиваем по index жёстко — ограничивает clamp в update()

    update(true);
  }, { passive: true });

  window.addEventListener("resize", () => update(false));
  update(false);
}

partnersSwipeSlider();
