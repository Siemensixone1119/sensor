export function toggleSnoska() {
  const BASE_Z = 200000;
  const sheetStack = [];
  let isClosing = false;

  const footnoteTemplate =
    document.querySelector("template[data-template-footnote]") ||
    document.querySelector("template[data-footnote-template]") ||
    null;

  let dragActive = false;
  let activeQuestEl = null;

  document.addEventListener(
    "touchstart",
    (e) => {
      if (!dragActive || !activeQuestEl) return;
      if (!e.target.closest(".footnote__quest")) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true, passive: false }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!dragActive || !activeQuestEl) return;
      if (!e.target.closest(".footnote__quest")) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true, passive: false }
  );

  document.addEventListener(
    "touchend",
    (e) => {
      if (!dragActive || !activeQuestEl) return;
      if (!e.target.closest(".footnote__quest")) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true, passive: false }
  );

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
    if (footnoteTemplate?.content) {
      const el = footnoteTemplate.content.firstElementChild?.cloneNode(true);
      if (el) return el;
    }
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
      if (n.nodeType === 1 || n.nodeType === 3) content.appendChild(n.cloneNode(true));
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
    if (!sheetStack.length || isClosing) return;
    isClosing = true;

    const { layer, backdrop, quest } = sheetStack.pop();

    backdrop.style.transition = "opacity .25s ease";
    quest.style.transition = "transform .25s ease";

    backdrop.style.setProperty("--backdrop-opacity", "0");
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

  let startX = 0;
  let startY = 0;
  let lastY = 0;
  let lastTime = 0;
  let velocity = 0;

  let deltaY = 0;
  let activeId = null;
  let mode = "none";
  let axis = null;

  let atTopAtStart = false;
  let startedOnHandle = false;

  function lockScroll() {
    scroller.style.overflow = "hidden";
    scroller.style.touchAction = "none";
  }

  function unlockScroll() {
    scroller.style.overflow = "auto";
    scroller.style.touchAction = "pan-y";
  }

  function lockPage() {
    document.documentElement.style.overscrollBehavior = "none";
  }

  function unlockPage() {
    document.documentElement.style.overscrollBehavior = "";
  }

  function snapBack() {
    quest.style.transition = "transform .25s ease";
    backdrop.style.transition = "opacity .25s ease";
    quest.style.setProperty("--sheet-pos", "0px");
    backdrop.style.setProperty("--backdrop-opacity", "1");
  }

  function cancelAll() {
    if (activeId === null) return;

    activeId = null;
    axis = null;
    mode = "none";

    unlockScroll();
    unlockPage();
    snapBack();
  }

  function onStart(e) {
    if (isClosing || activeId !== null) return;

    const t = e.changedTouches[0];
    activeId = t.identifier;

    startX = t.clientX;
    startY = t.clientY;
    lastY = startY;
    lastTime = performance.now();
    velocity = 0;
    deltaY = 0;

    axis = null;

    startedOnHandle = !!e.target.closest(".footnote__line-wrapper");
    atTopAtStart = scroller.scrollTop <= 0;

    mode = startedOnHandle ? "drag" : "scroll";

    quest.style.transition = "none";
    backdrop.style.transition = "none";

    lockPage();
  }

  function onMove(e) {
    if (isClosing || activeId === null) return;

    const touch = [...e.touches].find(t => t.identifier === activeId);
    if (!touch) return;

    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (!axis) {
      if (Math.abs(dx) > Math.abs(dy)) {
        axis = "x";
      } else if (Math.abs(dy) > Math.abs(dx)) {
        axis = "y";
      } else {
        return;
      }
    }

    if (axis === "x") {
      return;
    }

    const now = performance.now();
    velocity = (touch.clientY - lastY) / (now - lastTime);
    lastY = touch.clientY;
    lastTime = now;

    deltaY = touch.clientY - startY;

    if (mode === "scroll") {
      if (!startedOnHandle && atTopAtStart && deltaY > 8) {
        mode = "drag";
        startY = touch.clientY;
        deltaY = 0;
        velocity = 0;
        lockScroll();
      } else {
        return;
      }
    }

    if (mode !== "drag") return;
    if (deltaY < 0) deltaY = 0;

    if (e.cancelable) e.preventDefault();

    quest.style.setProperty("--sheet-pos", deltaY + "px");
    backdrop.style.setProperty(
      "--backdrop-opacity",
      Math.max(0, 1 - deltaY / sheetHeight)
    );
  }

  function onEnd(e) {
    if (isClosing || activeId === null) return;

    const ended = [...e.changedTouches].some(t => t.identifier === activeId);
    if (!ended) return;

    activeId = null;
    axis = null;

    unlockScroll();
    unlockPage();

    if (mode !== "drag") {
      mode = "none";
      return;
    }

    const projected = deltaY + velocity * 120;

    if (projected > sheetHeight * 0.5) close();
    else snapBack();

    mode = "none";
  }

  const optsMove = { passive: false };

  if (handle) {
    handle.addEventListener("touchstart", onStart, { passive: true });
    handle.addEventListener("touchmove", onMove, optsMove);
    handle.addEventListener("touchend", onEnd, { passive: true });
    handle.addEventListener("touchcancel", cancelAll, { passive: true });
  }

  scroller.addEventListener("touchstart", onStart, { passive: true });
  scroller.addEventListener("touchmove", onMove, optsMove);
  scroller.addEventListener("touchend", onEnd, { passive: true });
  scroller.addEventListener("touchcancel", cancelAll, { passive: true });

  window.addEventListener("blur", cancelAll);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAll();
  });
}

}
