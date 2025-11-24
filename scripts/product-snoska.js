export function toggleSnoska() {
  const CLS = { noScroll: "no-scroll" };
  const BASE_Z = 200000;
  const sheetStack = [];

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
        if (
          !block.nextElementSibling ||
          !block.nextElementSibling.classList.contains("compare__info-btn")
        ) {
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

  processInfoBlocks();

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".compare__info-btn");
    if (btn) return open(btn.previousElementSibling);

    const self = e.target.closest(".snoska-trigger");
    if (self) return open(self);

    const prev = e.target.closest(".snoska-trigger-prev");
    if (prev) return open(prev.nextElementSibling);
  });

  function open(infoBlock) {
    const base = document.querySelector(".footnote");
    const layer = base.cloneNode(true);
    document.body.appendChild(layer);

    const backdrop = layer.querySelector(".footnote__backdrop");
    const quest = layer.querySelector(".footnote__quest");
    const header = layer.querySelector(".footnote__header");
    const content = layer.querySelector(".footnote__content");

    layer.appendChild(backdrop);
    layer.appendChild(quest);

    const index = sheetStack.length;
    backdrop.style.zIndex = BASE_Z + index * 2;
    quest.style.zIndex = BASE_Z + index * 2 + 1;

    if (index > 0) {
      const prev = sheetStack[index - 1];
      prev.backdrop.style.opacity = "0";
      prev.backdrop.style.pointerEvents = "none";
    }

    const caption = infoBlock.dataset.caption?.trim() || "";
    if (header) {
      header.style.display = caption ? "" : "none";
      header.textContent = caption;
    }

    if (content) {
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
    }

    quest.scrollTop = 0;
    sheetStack.push({ layer, backdrop, quest });

    layer.style.opacity = "1";
    layer.style.pointerEvents = "auto";

    requestAnimationFrame(() => {
      backdrop.style.setProperty("--backdrop-opacity", "1");
      quest.style.setProperty("--sheet-pos", "0px");
      attachDrag(layer, quest, backdrop);
    });

    document.body.classList.add(CLS.noScroll);
  }

  function close() {
    if (sheetStack.length === 0) return;

    const { layer, backdrop: topBack, quest } = sheetStack.pop();
    const prev = sheetStack[sheetStack.length - 1];
    const prevBack = prev ? prev.backdrop : null;

    topBack.style.transition = "opacity .2s ease";
    quest.style.transition = "transform .2s ease";

    topBack.style.setProperty("--backdrop-opacity", "0");
    quest.style.setProperty("--sheet-pos", "100%");

    if (prevBack) {
      prevBack.style.opacity = "1";
      prevBack.style.pointerEvents = "auto";
    }

    quest.addEventListener(
      "transitionend",
      () => {
        layer.remove();
        if (!prevBack) document.body.classList.remove(CLS.noScroll);
        rebuildZ();
      },
      { once: true }
    );
  }

  function rebuildZ() {
    sheetStack.forEach((item, i) => {
      item.backdrop.style.zIndex = BASE_Z + i * 2;
      item.quest.style.zIndex = BASE_Z + i * 2 + 1;
    });
  }

  function attachDrag(layer, quest, backdrop) {
    const handle = layer.querySelector(".footnote__line-wrapper");
    if (!handle) return;

    let startY = 0;
    let deltaY = 0;
    let gesture = "undecided";

    handle.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
      deltaY = 0;
      gesture = "drag";

      quest.style.transition = "none";
      backdrop.style.transition = "none";
    });

    handle.addEventListener(
      "touchmove",
      (e) => {
        if (gesture !== "drag") return;

        deltaY = e.touches[0].clientY - startY;
        deltaY = Math.max(0, deltaY);

        quest.style.setProperty("--sheet-pos", deltaY + "px");
        backdrop.style.setProperty(
          "--backdrop-opacity",
          1 - deltaY / quest.offsetHeight
        );

        e.preventDefault();
      },
      { passive: false }
    );

    handle.addEventListener("touchend", () => {
      if (gesture !== "drag") return;

      const h = quest.offsetHeight;

      quest.style.transition = "transform .2s ease";
      backdrop.style.transition = "opacity .2s ease";

      if (deltaY > h * 0.25) {
        close();
      } else {
        quest.style.setProperty("--sheet-pos", "0px");
        backdrop.style.setProperty("--backdrop-opacity", "1");
      }

      gesture = "undecided";
      deltaY = 0;
    });
  }

  document.addEventListener("click", (e) => {
    if (sheetStack.length === 0) return;
    const top = sheetStack[sheetStack.length - 1];
    if (e.target === top.backdrop) close();
  });
}
