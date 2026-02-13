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



function partnersCenteredLoop() {
  const root = document.querySelector(".partners");
  if (!root) return;

  const track = root.querySelector(".partners__list");
  if (!track) return;

  const originalItems = Array.from(track.querySelectorAll(".partners__item"));
  const len = originalItems.length;
  if (len < 2) return;

  const frag = document.createDocumentFragment();

  originalItems.forEach((it) => frag.appendChild(it.cloneNode(true)));
  originalItems.forEach((it) => frag.appendChild(it.cloneNode(true)));
  originalItems.forEach((it) => frag.appendChild(it.cloneNode(true)));

  track.innerHTML = "";
  track.appendChild(frag);

  const items = Array.from(track.querySelectorAll(".partners__item"));
  const total = items.length;

  let index = len + Math.floor(len / 2);

  function getTranslateX(el) {
    const tr = getComputedStyle(el).transform;
    if (!tr || tr === "none") return 0;
    const m = tr.match(/matrix(3d)?\((.+)\)/);
    if (!m) return 0;
    const parts = m[2].split(",").map((v) => parseFloat(v));
    return m[1] ? parts[12] : parts[4];
  }

  function setX(x, animate) {
    track.style.transition = animate ? "transform 300ms ease" : "none";
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  function centerTo(i, animate = true) {
    const item = items[i];
    if (!item) return;

    const rootRect = root.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    const rootCenter = rootRect.left + rootRect.width / 2;
    const itemCenter = itemRect.left + itemRect.width / 2;

    const currentX = getTranslateX(track);
    const delta = itemCenter - rootCenter;

    setX(currentX - delta, animate);
  }

  function snapIndexIfNeeded() {
    if (index < len) {
      index += len;
      requestAnimationFrame(() => centerTo(index, false));
    } else if (index >= len * 2) {
      index -= len;
      requestAnimationFrame(() => centerTo(index, false));
    }
  }

  requestAnimationFrame(() => centerTo(index, false));

  let startX = 0;

  track.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
    },
    { passive: true }
  );

  track.addEventListener(
    "touchend",
    (e) => {
      const endX = e.changedTouches[0].clientX;
      const delta = startX - endX;

      if (delta > 50) index += 1;
      else if (delta < -50) index -= 1;

      if (index < 0) index = 0;
      if (index > total - 1) index = total - 1;

      centerTo(index, true);
    },
    { passive: true }
  );

  track.addEventListener("transitionend", () => {
    snapIndexIfNeeded();
  });

  window.addEventListener("resize", () => {
    centerTo(index, false);
  });
}

partnersCenteredLoop();
