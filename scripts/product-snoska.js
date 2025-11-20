export function toggleSnoska() {
  const CLS = {
    visible: "footnote__visible",
    noScroll: "no-scroll",
  };

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
    if (btn) {
      open(btn.previousElementSibling);
      return;
    }
    const self = e.target.closest(".snoska-trigger");
    if (self) {
      open(self);
      return;
    }
    const prev = e.target.closest(".snoska-trigger-prev");
    if (prev) {
      open(prev.nextElementSibling);
      return;
    }
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

    const backdropZ = BASE_Z + index * 2;
    const sheetZ = BASE_Z + index * 2 + 1;

    backdrop.style.zIndex = backdropZ;
    quest.style.zIndex = sheetZ;

    if (index > 0) {
      const prev = sheetStack[index - 1];
      prev.backdrop.style.opacity = "0";
      prev.backdrop.style.pointerEvents = "none";
    }

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

    quest.scrollTop = 0;

    sheetStack.push({ layer, backdrop, quest });

    backdrop.style.opacity = "1";
    backdrop.style.pointerEvents = "auto";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        layer.classList.add(CLS.visible);
        attachDrag(layer, quest, backdrop);
      });
    });

    document.body.classList.add(CLS.noScroll);
  }

  function close() {
    if (sheetStack.length === 0) return;

    const { layer, backdrop: topBack, quest } = sheetStack.pop();

    const prev = sheetStack[sheetStack.length - 1];
    const prevBack = prev ? prev.backdrop : null;

    if (prevBack) {
      prevBack.style.transition = "opacity .3s ease";
      prevBack.style.pointerEvents = "auto";
    }

    topBack.style.transition = "opacity .3s ease";
    quest.style.transition = "transform .3s ease";

    topBack.style.opacity = "0";
    quest.style.transform = "translateY(100%)";

    if (prevBack) {
      prevBack.style.opacity = "1";
    }

    quest.addEventListener(
      "transitionend",
      () => {
        layer.remove();
        if (!prevBack) {
          document.body.classList.remove(CLS.noScroll);
        }
        rebuildZ();
      },
      { once: true }
    );
  }

  function rebuildZ() {
    sheetStack.forEach((item, i) => {
      item.backdrop.style.zIndex = BASE_Z + i * 2;
      item.layer.style.zIndex = BASE_Z + i * 2 + 1;
    });
  }

  function attachDrag(layer, quest, backdrop) {
    let startY = 0;
    let deltaY = 0;
    let dragging = false;
    let gesture = "undecided";

    quest.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      startY = t.clientY;
      deltaY = 0;
      dragging = false;
      gesture = "undecided";
    });

    quest.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        deltaY = t.clientY - startY;

        if (gesture === "undecided") {
          if (deltaY < 0) {
            gesture = "scroll";
            return;
          }
          if (quest.scrollTop > 0) {
            gesture = "scroll";
            return;
          }
          if (deltaY > 10) {
            gesture = "drag";
            dragging = true;
            quest.style.transition = "none";
          } else {
            return;
          }
        }

        if (gesture === "scroll") return;

        if (gesture === "drag" && dragging) {
          if (deltaY > 0) {
            quest.style.transform = `translateY(${deltaY}px)`;
            const h = quest.offsetHeight;
            const p = Math.min(deltaY / h, 1);
            backdrop.style.opacity = String(1 - p);
            e.preventDefault();
          }
        }
      },
      { passive: false }
    );

    quest.addEventListener("touchend", () => {
      if (gesture !== "drag") return;

      dragging = false;

      if (deltaY > 130) {
        close();
      } else {
        quest.style.transition = "transform .3s ease";
        quest.style.transform = "";
        backdrop.style.opacity = "1";
      }

      gesture = "undecided";
    });
  }

  document.addEventListener("click", (e) => {
    if (sheetStack.length === 0) return;

    const top = sheetStack[sheetStack.length - 1];

    if (e.target === top.backdrop) {
      close();
    }
  });
}
