export function initHeaderAutoHide() {
  const overlay = document.querySelector(".header__overlay");
  const inner   = document.querySelector(".header__overlay-inner");
  const search  = document.querySelector(".header__overlay-search");
  const content = document.querySelector(".x-scroll") || document.querySelector("main");
  if (!overlay || !inner || !search || !content) return;

  // метрики (целые px)
  let H_INNER   = Math.round(inner.offsetHeight);
  let H_SEARCH  = Math.round(search.offsetHeight);
  let H_OVERLAY = Math.round(overlay.offsetHeight);

  // состояние
  let offset = H_INNER;           // видимая высота верхней полосы [0..H_INNER]
  const headerHeight = H_INNER;   // фикс для читаемости
  let lastScrollTop = getScrollY();

  // helpers
  function getScrollY() {
    const y = window.scrollY ?? document.documentElement.scrollTop ?? 0;
    return Math.max(0, y); // защищаемся от отрицательных значений (iOS bounce)
  }
  function updateStickyTop() {
    const visibleHeader = Math.round(offset + H_SEARCH);
    document.documentElement.style.setProperty("--sticky-top", `${visibleHeader}px`);
  }

  function draw() {
    if (offset > 0) {
      overlay.style.transform = `translateY(${-headerHeight + offset}px)`;
    } else {
      overlay.style.transform = `translateY(calc(${H_OVERLAY - H_INNER}px - 100%))`;
    }
    updateStickyTop();
  }

  function onScroll() {
    const currentScroll = getScrollY();
    let delta = lastScrollTop - currentScroll;

    // если на самом верху страницы — всегда полностью раскрываем верхнюю полосу
    if (currentScroll <= 0) {
      offset = headerHeight;
      draw();
      lastScrollTop = 0;
      return;
    }

    if (delta > 0) {
      // скролл вверх — раскрываем
      offset = Math.min(offset + delta, headerHeight);
    } else if (delta < 0) {
      // скролл вниз — скрываем
      offset = Math.max(offset + delta, 0);
    }

    // лёгкий snap возле границ, чтобы не залипать полуприкрытым
    const EPS = 6; // px (можешь увеличить до 8–10, если всё ещё ловишь полутона)
    if (offset > headerHeight - EPS && delta > 0) offset = headerHeight;
    if (offset < EPS && delta < 0)               offset = 0;

    draw();
    lastScrollTop = currentScroll;
  }

  function recalc() {
    const prevInner = H_INNER;

    H_INNER   = Math.round(inner.offsetHeight);
    H_SEARCH  = Math.round(search.offsetHeight);
    H_OVERLAY = Math.round(overlay.offsetHeight);

    // если мы у верхней кромки — раскрыть полностью; иначе сохранить долю раскрытия
    if (getScrollY() <= 0) {
      offset = H_INNER;
    } else {
      const frac = prevInner > 0 ? (offset / prevInner) : 1;
      offset = Math.max(0, Math.min(1, frac)) * H_INNER;
    }

    // сдвиг контента (как в твоём демо — через transform)
  

    draw();
  }

  // старт

  updateStickyTop();
  draw();

  // события
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", recalc, { passive: true });
  window.addEventListener("orientationchange", () => {
    // маленькая задержка помогает после поворота экрана
    setTimeout(recalc, 150);
  }, { passive: true });
}
