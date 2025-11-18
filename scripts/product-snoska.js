export function toggleSnoska() {
  const footnote = document.querySelector(".footnote");
  if (!footnote) return;

  const backdrop = footnote.querySelector(".footnote__backdrop");
  const quest = footnote.querySelector(".footnote__quest");
  const header = footnote.querySelector(".footnote__header");
  const content = footnote.querySelector(".footnote__content");

  const CLS = {
    visible: "footnote__visible",
    noScroll: "no-scroll",
  };

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

      if (btnText && btnText.trim() !== "") {
        if (!block.nextElementSibling || !block.nextElementSibling.classList.contains("compare__info-btn")) {
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
      const infoBlock = btn.previousElementSibling;
      open(infoBlock);
      return;
    }

    const triggerSelf = e.target.closest(".snoska-trigger");
    if (triggerSelf) {
      open(triggerSelf);
      return;
    }

    const triggerPrev = e.target.closest(".snoska-trigger-prev");
    if (triggerPrev) {
      const infoBlock = triggerPrev.nextElementSibling;
      open(infoBlock);
      return;
    }
  });

  function open(infoBlock) {
    if (!infoBlock) return;

    const caption = infoBlock.dataset.caption?.trim() || "";
    header.style.display = caption ? "" : "none";
    header.textContent = caption;

    content.innerHTML = "";
    const clone = infoBlock.cloneNode(true);
    Array.from(clone.attributes).forEach((attr) =>
      attr.name.startsWith("data-") ? {} : clone.removeAttribute(attr.name)
    );

    clone.childNodes.forEach((node) => {
      if (node.nodeType === 1 || node.nodeType === 3) {
        content.appendChild(node.cloneNode(true));
      }
    });

    footnote.classList.add(CLS.visible);
    document.body.classList.add(CLS.noScroll);

    quest.scrollTop = 0;
  }

  function close() {
    if (!footnote.classList.contains(CLS.visible)) return;

    quest.style.transform = "translateY(100%)";
    backdrop.style.opacity = "0";
    quest.offsetHeight;

    const onEnd = () => {
      footnote.classList.remove(CLS.visible);
      quest.style.transform = "";
      backdrop.style.opacity = "";
      document.body.classList.remove(CLS.noScroll);
      quest.removeEventListener("transitionend", onEnd);
    };

    quest.addEventListener("transitionend", onEnd, { once: true });
  }

  footnote.addEventListener("click", (e) => {
    if (!e.target.closest(".footnote__quest")) close();
  });

  let yDown = null;
  quest.addEventListener("touchstart", (evt) => (yDown = evt.touches[0].clientY));
  quest.addEventListener("touchmove", (evt) => {
    if (!yDown) return;
    const yDiff = yDown - evt.touches[0].clientY;
    if (yDiff < -10) close();
    yDown = null;
  });
}
