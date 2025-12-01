export function toggleSnoska() {
  const CLS = { noScroll: "no-scroll" }; //это для блокировки боди
  const BASE_Z = 200000; // для z-индекса
  const sheetStack = []; // стэк слоев
  let isClosing = false; // чтобы закрытие не происходило повторно и не лагало

  // генерация кнопочек открытия сноскок
  function processInfoBlocks(root = document) {
    const blocks = root.querySelectorAll("[data-info]");
    // генерация каждой снсоски в зависимости от data-prev
    blocks.forEach((block) => {
      const btnText = block.dataset.buttonText; // текст кнопочки
      const triggerPrev = block.dataset.trigger === "prev"; // наличие аттрибута prev

      // генерация сноски не в виде кнопки
      if (triggerPrev) {
        const prev = block.previousElementSibling;
        if (prev) prev.classList.add("snoska-trigger-prev");
        return;
      }

      // генерация сноски в виде кнопочки
      if (btnText && btnText.trim()) {
        const next = block.nextElementSibling;
        if (!next || !next.classList.contains("compare__info-btn")) {
          block.insertAdjacentHTML(
            "afterend",
            `<button type="button" class="compare__info-btn">${btnText}</button>`
          );
        }
      } else {
        block.classList.add("snoska-trigger");
      }
    });
  }

  // вызов генерации кнопок
  processInfoBlocks();

  document.addEventListener("click", (e) => {
    // кнопка сноска
    const btn = e.target.closest(".compare__info-btn");
    if (btn) return open(btn.previousElementSibling);

    // а это если контент сноски в аттрибуте
    const self = e.target.closest(".snoska-trigger");
    if (self) return open(self);

    // сноской становится предидущий элемент
    const prev = e.target.closest(".snoska-trigger-prev");
    if (prev) return open(prev.nextElementSibling);
  });

  // открытие сноски
  function open(infoBlock) {
    const base = document.querySelector(".footnote"); // изначальная сноска
    const layer = base.cloneNode(true); // клон сноски, чтобы можно было кидать их в стек
    document.body.appendChild(layer);

    const backdrop = layer.querySelector(".footnote__backdrop");
    const quest = layer.querySelector(".footnote__quest");
    const header = layer.querySelector(".footnote__header");
    const content = layer.querySelector(".footnote__content");
    const scroller = layer.querySelector(".footnote__cont"); // это контент, который скролится

    const index = sheetStack.length;

    // рассчет z-индексов
    backdrop.style.zIndex = BASE_Z + index * 2;
    quest.style.zIndex = BASE_Z + index * 2 + 1;

    // блокировка кликов по хэдеру сайта
    const siteHeader = document.querySelector(".header");
    if (siteHeader) siteHeader.style.pointerEvents = "none";

    // изменение стилей при открытии
    if (index > 0) {
      const prev = sheetStack[index - 1];
      prev.layer.style.pointerEvents = "none";
      prev.backdrop.style.setProperty("--backdrop-opacity", "1");
      prev.backdrop.style.pointerEvents = "none";
    }

    // генерация заголовка
    const caption = infoBlock.dataset.caption?.trim() || "";
    if (caption) {
      header.style.display = "";
      header.textContent = caption;
    } else {
      header.style.display = "none";
    }

    content.innerHTML = "";
    const clone = infoBlock.cloneNode(true);
    Array.from(clone.attributes).forEach((attr) => {
      if (!attr.name.startsWith("data-")) clone.removeAttribute(attr.name);
    });
    clone.childNodes.forEach((n) => {
      if (n.nodeType === 1 || n.nodeType === 3) {
        // 1 - element, 3 - text
        content.appendChild(n.cloneNode(true));
      }
    });

    scroller.scrollTop = 0; // контент наверху

    sheetStack.push({ layer, backdrop, quest, scroller }); // один слой в стэк

    layer.style.pointerEvents = "auto";
    layer.style.opacity = "1";

    requestAnimationFrame(() => {
      backdrop.style.setProperty("--backdrop-opacity", "1");
      backdrop.style.pointerEvents = "auto";

      quest.style.setProperty("--sheet-pos", "0px");

      attachDrag(layer, quest, backdrop, scroller); // обработчик движений
    });

    document.body.classList.add(CLS.noScroll);
  }

  // закрытие сноски
  function close() {
    if (sheetStack.length === 0) return;
    if (isClosing) return;
    isClosing = true;

    const { layer, backdrop: topBack, quest } = sheetStack.pop(); // деструктуризация
    const prev = sheetStack[sheetStack.length - 1];

    // стили
    topBack.style.transition = "opacity .25s ease";
    quest.style.transition = "transform .25s ease";

    topBack.style.setProperty("--backdrop-opacity", "0");
    topBack.style.pointerEvents = "none";
    quest.style.setProperty("--sheet-pos", "100%");

    quest.addEventListener(
      "transitionend",
      () => {
        layer.remove();

        // возврат стилей хэдера
        const siteHeader = document.querySelector(".header");
        if (sheetStack.length === 0 && siteHeader) {
          siteHeader.style.pointerEvents = "auto";
        }

        if (prev) {
          prev.layer.style.pointerEvents = "auto";
          prev.backdrop.style.pointerEvents = "auto";
        } else document.body.classList.remove(CLS.noScroll);

        rebuildZ();
        isClosing = false;
      },
      { once: true }
    );
  }

  // пересчет z-индекса
  function rebuildZ() {
    sheetStack.forEach((item, i) => {
      item.backdrop.style.zIndex = BASE_Z + i * 2;
      item.quest.style.zIndex = BASE_Z + i * 2 + 1;
    });
  }

  // обработка движений и кликов
  // обработка движений и кликов
  function attachDrag(layer, quest, backdrop, scroller) {
    const handle = layer.querySelector(".footnote__line-wrapper");

    let startY = 0;
    let deltaY = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocity = 0;

    let gesture = "none";
    let canDragFromContent = false;

    // палец, который УПРАВЛЯЕТ шторкой
    let activeId = null;

    function onStart(e) {
      if (isClosing) return;

      // если уже тащим шторку — новые пальцы вообще игнорируем
      if (activeId !== null) return;

      const touch = e.changedTouches[0];
      activeId = touch.identifier;

      startY = touch.clientY;
      lastY = startY;
      lastTime = performance.now();
      deltaY = 0;
      velocity = 0;

      gesture = "undecided";
      canDragFromContent = scroller.scrollTop === 0;

      quest.style.transition = "none";
      backdrop.style.transition = "none";

      scroller.style.overflowY = "auto";
      scroller.style.overscrollBehavior = "contain";
    }

    function onMove(e) {
      if (isClosing) return;
      if (activeId === null) return;

      // берём КОНКРЕТНО тот палец, который начал жест
      const touch = Array.from(e.touches).find(
        (t) => t.identifier === activeId
      );

      // если по какой-то причине нашего пальца нет в списке — просто выходим
      if (!touch) return;

      const currentY = touch.clientY;
      const currentTime = performance.now();

      deltaY = currentY - startY;

      if (deltaY < 0) {
        gesture = gesture === "undecided" ? "scroll" : gesture;
        return;
      }

      velocity = (currentY - lastY) / (currentTime - lastTime);
      lastY = currentY;
      lastTime = currentTime;

      const isHandle = !!e.target.closest(".footnote__line-wrapper");
      const pullingDown = deltaY > 5;

      canDragFromContent = scroller.scrollTop === 0;

      if (gesture === "undecided") {
        if (isHandle || (canDragFromContent && pullingDown)) {
          gesture = "drag";
          scroller.style.overflowY = "hidden";
          scroller.style.overscrollBehavior = "none";
        } else {
          gesture = "scroll";
          return;
        }
      }

      if (gesture !== "drag") return;

      if (e.cancelable) e.preventDefault();

      quest.style.setProperty("--sheet-pos", deltaY + "px");
      backdrop.style.setProperty(
        "--backdrop-opacity",
        1 - deltaY / quest.offsetHeight
      );
    }

    function onEnd(e) {
      if (isClosing) return;
      if (activeId === null) return;

      // проверяем: это отпустили ИМЕННО активный палец или какой-то другой?
      const activeFingerEnded = Array.from(e.changedTouches).some(
        (t) => t.identifier === activeId
      );

      // если отпустили второй/третий палец — просто игнор
      if (!activeFingerEnded) {
        return;
      }

      // вот тут уже точно отпустили основной палец
      activeId = null;

      scroller.style.overflowY = "auto";
      scroller.style.overscrollBehavior = "contain";

      if (gesture !== "drag") {
        gesture = "none";
        deltaY = 0;
        velocity = 0;
        return;
      }

      const h = quest.offsetHeight;
      const projected = deltaY + velocity * 120;

      if (projected > h / 2) {
        close();
      } else {
        quest.style.transition = "transform .25s ease";
        backdrop.style.transition = "opacity .25s ease";

        quest.style.setProperty("--sheet-pos", "0px");
        backdrop.style.setProperty("--backdrop-opacity", "1");
        backdrop.style.pointerEvents = "auto";
      }

      gesture = "none";
      deltaY = 0;
      velocity = 0;
    }

    handle.addEventListener("touchstart", onStart);
    handle.addEventListener("touchmove", onMove, { passive: false });
    handle.addEventListener("touchend", onEnd);

    scroller.addEventListener("touchstart", onStart);
    scroller.addEventListener("touchmove", onMove, { passive: false });
    scroller.addEventListener("touchend", onEnd);
  }



  // клик в бэкдроп
  document.addEventListener("click", (e) => {
    if (sheetStack.length === 0 || isClosing) return;
    const top = sheetStack[sheetStack.length - 1];
    if (e.target === top.backdrop) close();
  });
}
