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
        if (!block.nextElementSibling || !block.nextElementSibling.classList.contains("compare__info-btn")) {
          block.insertAdjacentHTML("afterend", `<button type="button" class="compare__info-btn">${btnText}</button>`);
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

    const s = e.target.closest(".snoska-trigger");
    if (s) return open(s);

    const p = e.target.closest(".snoska-trigger-prev");
    if (p) return open(p.nextElementSibling);
  });

  function open(infoBlock) {
    const base = document.querySelector(".footnote");
    const layer = base.cloneNode(true);
    document.body.appendChild(layer);

    const backdrop = layer.querySelector(".footnote__backdrop");
    const quest = layer.querySelector(".footnote__quest");
    const header = layer.querySelector(".footnote__header");
    const content = layer.querySelector(".footnote__content");
    const line = layer.querySelector(".footnote__line-wrapper"); // ← линия

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
    header.style.display = caption ? "" : "none";
    header.textContent = caption;

    content.innerHTML = "";
    const clone = infoBlock.cloneNode(true);
    Array.from(clone.attributes).forEach((a) => {
      if (!a.name.startsWith("data-")) clone.removeAttribute(a.name);
    });
    clone.childNodes.forEach((n) => {
      if (n.nodeType === 1 || n.nodeType === 3) content.appendChild(n.cloneNode(true));
    });

    quest.scrollTop = 0;

    sheetStack.push({ layer, backdrop, quest, line });

    layer.style.opacity = "1";
    layer.style.pointerEvents = "auto";

    requestAnimationFrame(() => {
      backdrop.style.setProperty("--backdrop-opacity", "1");
      quest.style.setProperty("--sheet-pos", "0px");
      attachDrag(layer, quest, backdrop, line);
    });

    document.body.classList.add(CLS.noScroll);
  }

  function close() {
    if (sheetStack.length === 0) return;

    const { layer, backdrop: topBack, quest } = sheetStack.pop();
    const prev = sheetStack[sheetStack.length - 1];
    const pb = prev ? prev.backdrop : null;

    quest.style.transition = "transform .3s ease";

    topBack.style.setProperty("--backdrop-opacity", "0");
    quest.style.setProperty("--sheet-pos", "100%");

    if (pb) {
      pb.style.opacity = "1";
      pb.style.pointerEvents = "auto";
    }

    quest.addEventListener(
      "transitionend",
      () => {
        layer.remove();
        if (!pb) document.body.classList.remove(CLS.noScroll);
        rebuildZ();
      },
      { once: true }
    );
  }

  function rebuildZ() {
    sheetStack.forEach((s, i) => {
      s.backdrop.style.zIndex = BASE_Z + i * 2;
      s.quest.style.zIndex = BASE_Z + i * 2 + 1;
    });
  }

  function attachDrag(layer, quest, backdrop, line) {
    let startY = 0;
    let deltaY = 0;
    let gesture = "undecided";
    let currentY = 0;
    let animating = false;
    let dragAllowed = false;

    function animate() {
      if (!animating) return;

      const diff = deltaY - currentY;
      currentY += diff * 0.25;
      currentY = Math.max(0, currentY);

      const h = quest.offsetHeight;
      const p = Math.min(Math.max(currentY / h, 0), 1);

      quest.style.setProperty("--sheet-pos", currentY + "px");
      backdrop.style.setProperty("--backdrop-opacity", 1 - p);

      if (Math.abs(diff) > 0.5) requestAnimationFrame(animate);
      else {
        currentY = deltaY;
        quest.style.setProperty("--sheet-pos", currentY + "px");
        animating = false;
      }
    }

    quest.addEventListener("touchstart", (e) => {
      dragAllowed = line && line.contains(e.target);

      startY = e.touches[0].clientY;
      deltaY = 0;
      currentY = 0;
      gesture = "undecided";

      quest.style.height = quest.offsetHeight + "px";
      quest.style.transition = "none";
    });

    quest.addEventListener(
      "touchmove",
      (e) => {
        if (!dragAllowed) return;

        deltaY = e.touches[0].clientY - startY;
        deltaY = Math.max(0, deltaY);

        if (gesture === "undecided") {
          if (deltaY > 10) gesture = "drag";
          else return;
        }

        if (!animating) {
          animating = true;
          requestAnimationFrame(animate);
        }

        e.preventDefault();
      },
      { passive: false }
    );

    quest.addEventListener("touchend", () => {
      quest.style.height = "";

      if (gesture !== "drag") return;

      const h = quest.offsetHeight;

      if (deltaY > h * 0.25) close();
      else {
        quest.style.transition = "transform .3s ease";
        backdrop.style.transition = "opacity .3s ease";
        quest.style.setProperty("--sheet-pos", "0px");
        backdrop.style.setProperty("--backdrop-opacity", "1");
      }

      deltaY = 0;
      currentY = 0;
      animating = false;
      gesture = "undecided";
    });
  }

  document.addEventListener("click", (e) => {
    if (sheetStack.length === 0) return;
    const top = sheetStack[sheetStack.length - 1];
    if (e.target === top.backdrop) close();
  });
}
