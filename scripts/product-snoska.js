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
    const scroller = layer.querySelector(".footnote__cont"); // это контен, который скролится, то есть без верхней полосочки

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
        // 1 -element, 3 - text
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

    const { layer, backdrop: topBack, quest } = sheetStack.pop(); // деструктуризация одного слоя стэка
    const prev = sheetStack[sheetStack.length - 1]; //  какая по счету сноска

    // стили
    topBack.style.transition = "opacity .25s ease";
    quest.style.transition = "transform .25s ease";

    topBack.style.setProperty("--backdrop-opacity", "0");
    topBack.style.pointerEvents = "none";
    quest.style.setProperty("--sheet-pos", "100%");

    // ожидание окончания анимации
    quest.addEventListener(
      "transitionend",
      () => {
        layer.remove(); // удаление сноски

        // возврат стидей хэдера
        const siteHeader = document.querySelector(".header");
        if (sheetStack.length === 0 && siteHeader) {
          siteHeader.style.pointerEvents = "auto";
        }

        // если сноска не последняя
        if (prev) {
          prev.layer.style.pointerEvents = "auto";
          prev.backdrop.style.pointerEvents = "auto";
        } else document.body.classList.remove(CLS.noScroll);

        rebuildZ(); // пересчет z-индекса
        isClosing = false;
      },
      { once: true } //  обработчик вешается один раз
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
  function attachDrag(layer, quest, backdrop, scroller) {
    const handle = layer.querySelector(".footnote__line-wrapper"); // контейнер полосочки

    let startY = 0; // начальная позиция пальцы
    let deltaY = 0; // смещение пальца
    let lastY = 0; // позиция пальца на предидущем кадре
    let lastTime = 0; // время предидущего кадра
    let velocity = 0; // скорость свайпа

    let gesture = "none"; // тип движения dragon drop или scroll
    let canDragFromContent = false; // можно ли закрыть при свайпу по контенту, а не только полосочке
    let sheetHeight = 0;

    // палец прикладывается к экрану
    function onStart(e) {
      if (isClosing) return;

      startY = e.touches[0].clientY;
      lastY = startY;
      lastTime = performance.now();
      deltaY = 0;
      velocity = 0;
      sheetHeight = quest.offsetHeight;

      gesture = "undecided";
      canDragFromContent = scroller.scrollTop === 0;

      quest.style.transition = "none";
      backdrop.style.transition = "none";
      e.stopPropagation();
    }

    // движение пальца
    function onMove(e) {
      if (isClosing) return;

      const currentY = e.touches[0].clientY;
      const currentTime = performance.now();

      deltaY = currentY - startY;
      // если листать в низ то будет обычный скрол
      if (deltaY < 0) {
        gesture = gesture === "undecided" ? "scroll" : gesture;
        return;
      }

      velocity = (currentY - lastY) / (currentTime - lastTime);
      lastY = currentY;
      lastTime = currentTime;

      const isHandle = !!e.target.closest(".footnote__line-wrapper");
      const pullingDown = deltaY > 5; // трогают ли сейчас полосочку

      if (gesture === "undecided") {
        if (isHandle) {
          gesture = "drag"; // если трогают полосочку, счиаем это свайпом
        } else if (canDragFromContent && pullingDown) {
          gesture = "drag"; // если трогают и полосочку и контент, считаем свайпом
        } else {
          gesture = "scroll"; // если трогаем только контент - скроллим его
          return;
        }
      }

      if (gesture !== "drag") return;

      if (e.cancelable) {
        e.preventDefault();
      }
      e.stopPropagation(); // cancelable - можно ли отменить событие, то уьираем дефолт скрол

      quest.style.setProperty("--sheet-pos", deltaY + "px");
      backdrop.style.setProperty(
        "--backdrop-opacity",
        1 - deltaY / sheetHeight
      );
    }

    // при убирании пальца с экрана
    function onEnd() {
      if (isClosing) return;

      if (gesture !== "drag") {
        gesture = "none";
        deltaY = 0;
        velocity = 0;
        return;
      }

      const h = sheetHeight; // высота сноски
      const projected = deltaY + velocity * 120; // куда бы ушла шторка через 120 мс
      // если свайп до второй половина, то закрываем
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
