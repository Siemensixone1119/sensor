export function toggleSnoska() {
  const BASE_Z = 200000;
  const sheetStack = [];
  let isClosing = false;

  const footnoteTemplate =
    document.querySelector("template[data-template-footnote]") ||
    document.querySelector("template[data-footnote-template]") ||
    null;

  processInfoBlocks();

  function processInfoBlocks(root = document) {
    const blocks = root.querySelectorAll("[data-info]");
    blocks.forEach((block) => {
      const btnText = block.dataset.buttonText;
      const triggerPrev = block.dataset.trigger === "prev";

      if (triggerPrev) {
        const prev = block.previousElementSibling;
        if (prev) prev.classList.add("snoska-trigger-prev");
        return;
      }

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

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".compare__info-btn");
    if (btn) return open(btn.previousElementSibling);

    const self = e.target.closest(".snoska-trigger");
    if (self) return open(self);

    const prev = e.target.closest(".snoska-trigger-prev");
    if (prev) return open(prev.nextElementSibling);

    if (sheetStack.length && !isClosing) {
      const top = sheetStack[sheetStack.length - 1];
      if (e.target === top.backdrop) close();
    }
  });

  function createLayer() {
    // ✅ если есть template — берём из него
    if (footnoteTemplate?.content) {
      const el = footnoteTemplate.content.firstElementChild?.cloneNode(true);
      if (el) return el;
    }

    // 🔁 fallback на старый вариант (если template не найден/пустой)
    const base = document.querySelector(".footnote");
    if (!base) return null;
    return base.cloneNode(true);
  }

  function open(infoBlock) {
    const layer = createLayer();
    if (!layer) return;

    document.body.appendChild(layer);

    const backdrop = layer.querySelector(".footnote__backdrop");
    const quest = layer.querySelector(".footnote__quest");
    const header = layer.querySelector(".footnote__header-title");
    const content = layer.querySelector(".footnote__content");
    const scroller = layer.querySelector(".footnote__cont");
    const closeBtn = layer.querySelector(".footnote__close-btn");

    // если вдруг в template сломалась структура — аккуратно выходим
    if (!backdrop || !quest || !header || !content || !scroller || !closeBtn) {
      layer.remove();
      return;
    }

    const index = sheetStack.length;

    backdrop.style.zIndex = BASE_Z + index * 2;
    quest.style.zIndex = BASE_Z + index * 2 + 1;

    const caption = infoBlock.dataset.caption?.trim() || "";
    header.style.display = caption ? "" : "none";
    header.textContent = caption;

    content.innerHTML = "";
    const clone = infoBlock.cloneNode(true);

    Array.from(clone.attributes).forEach((attr) => {
      if (!attr.name.startsWith("data-")) clone.removeAttribute(attr.name);
    });

    clone.childNodes.forEach((n) => {
      if (n.nodeType === 1 || n.nodeType === 3) {
        content.appendChild(n.cloneNode(true));
      }
    });

    scroller.scrollTop = 0;

    sheetStack.push({ layer, backdrop, quest, scroller });

    layer.style.pointerEvents = "auto";
    layer.style.opacity = "1";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const realHeight = quest.scrollHeight;
        const maxHeight = window.innerHeight * 0.95;
        const finalHeight = Math.min(realHeight, maxHeight);

        quest.style.setProperty("--snoska-height", finalHeight + "px");

        backdrop.style.setProperty("--backdrop-opacity", "1");
        backdrop.style.pointerEvents = "auto";
        quest.style.setProperty("--sheet-pos", "0px");

        attachDrag(layer, quest, backdrop, scroller, finalHeight);
      });
    });

    closeBtn.addEventListener("click", close);
  }

  function close() {
    if (!sheetStack.length) return;
    if (isClosing) return;

    isClosing = true;

    const { layer, backdrop: topBack, quest } = sheetStack.pop();
    const prev = sheetStack[sheetStack.length - 1];

    topBack.style.transition = "opacity .25s ease";
    quest.style.transition = "transform .25s ease";

    topBack.style.setProperty("--backdrop-opacity", "0");
    quest.style.setProperty("--sheet-pos", "100%");

    quest.addEventListener(
      "transitionend",
      () => {
        layer.remove();

        isClosing = false;
      },
      { once: true }
    );
  }

  function attachDrag(layer, quest, backdrop, scroller, sheetHeight) {
    const handle = layer.querySelector(".footnote__line-wrapper");

    let startY = 0;
    let deltaY = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocity = 0;
    let gesture = "none";
    let activeId = null;

    function onStart(e) {
      if (isClosing) return;
      if (activeId !== null) return;

      const t = e.changedTouches[0];
      activeId = t.identifier;

      startY = lastY = t.clientY;
      lastTime = performance.now();
      deltaY = 0;
      velocity = 0;

      gesture = "undecided";

      quest.style.transition = "none";
      backdrop.style.transition = "none";
    }

    function onMove(e) {
      if (isClosing) return;
      if (activeId === null) return;

      const touch = [...e.touches].find((t) => t.identifier === activeId);
      if (!touch) return;

      const now = performance.now();
      const y = touch.clientY;

      deltaY = y - startY;

      if (deltaY < 0) {
        if (gesture === "drag") {
          deltaY = 0;
        } else {
          gesture = "scroll";
          return;
        }
      }

      velocity = (y - lastY) / (now - lastTime);
      lastY = y;
      lastTime = now;

      const isHandle = !!e.target.closest(".footnote__line-wrapper");
      const atTop = scroller.scrollTop <= 0;

      if (gesture === "undecided") {
        if (isHandle || (atTop && deltaY > 5)) {
          gesture = "drag";
        } else {
          gesture = "scroll";
          return;
        }
      }

      if (gesture !== "drag") return;

      if (e.cancelable) e.preventDefault();

      const safeY = Math.max(0, deltaY);

      quest.style.setProperty("--sheet-pos", safeY + "px");

      const opacity = 1 - safeY / sheetHeight;
      backdrop.style.setProperty("--backdrop-opacity", Math.max(0, opacity));
    }

    function onEnd(e) {
      if (isClosing) return;
      if (activeId === null) return;

      const ended = [...e.changedTouches].some((t) => t.identifier === activeId);
      if (!ended) return;

      activeId = null;

      if (gesture !== "drag") {
        gesture = "none";
        return;
      }

      const projected = deltaY + velocity * 120;

      if (projected > sheetHeight * 0.5) {
        close();
      } else {
        quest.style.transition = "transform .25s ease";
        backdrop.style.transition = "opacity .25s ease";
        quest.style.setProperty("--sheet-pos", "0px");
        backdrop.style.setProperty("--backdrop-opacity", "1");
      }

      gesture = "none";
    }

    if (handle) {
      handle.addEventListener("touchstart", onStart);
      handle.addEventListener("touchmove", onMove, { passive: false });
      handle.addEventListener("touchend", onEnd);
    }

    scroller.addEventListener("touchstart", onStart);
    scroller.addEventListener("touchmove", onMove, { passive: false });
    scroller.addEventListener("touchend", onEnd);
  }
}
