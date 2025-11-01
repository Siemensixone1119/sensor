export function toggleSnoska() {
  const footnote = document.querySelector(".footnote");
  if (!footnote) return;

  const backdrop = footnote.querySelector(".footnote__backdrop");
  const quest = footnote.querySelector(".footnote__quest");
  const header = footnote.querySelector(".footnote__header");
  const content = footnote.querySelector(".footnote__content");
  const openCells = document.querySelectorAll(".compare__cell");

  if (!quest || !header || !content || !backdrop || !openCells) return;

  const CLS = {
    visible: "footnote__visible",
    noScroll: "no-scroll",
  };

  let activeInfoBlock = null;
  let originalParent = null;

  openCells.forEach((cell) => {
    const infoBlocks = cell.querySelectorAll("[data-info]");
    if (!infoBlocks.length) return;

    infoBlocks.forEach((infoBlock) => {
      const btnText = infoBlock.dataset.buttonText || "i";

      if (
        !infoBlock.nextElementSibling ||
        !infoBlock.nextElementSibling.classList.contains("compare__info-btn")
      ) {
        infoBlock.insertAdjacentHTML(
          "afterend",
          `<button type="button" class="compare__info-btn" aria-label="Показать описание">${btnText}</button>`
        );
      }
    });
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".compare__info-btn");
    if (!btn) return;
    open(btn);
  });

  function open(btn) {
    const cell = btn.closest(".compare__cell");
    const infoBlocks = Array.from(cell.querySelectorAll("[data-info]"));
    const btnIndex = Array.from(
      cell.querySelectorAll(".compare__info-btn")
    ).indexOf(btn);
    const infoBlock = infoBlocks[btnIndex];
    if (!infoBlock) return;

    const caption = infoBlock.dataset.caption?.trim() || "";
    const hasCaption = caption.length > 0;
    const hasContent = infoBlock.innerHTML.trim().length > 0;
    if (!hasCaption && !hasContent) return;

    header.textContent = caption;
    header.style.display = hasCaption ? "" : "none";

    content.innerHTML = infoBlock.innerHTML;
    footnote.classList.add(CLS.visible);
    document.body.classList.add(CLS.noScroll);
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

      if (activeInfoBlock && originalParent) {
        activeInfoBlock.hidden = true;
        originalParent.appendChild(activeInfoBlock);
        activeInfoBlock = null;
        originalParent = null;
      }

      quest.removeEventListener("transitionend", onEnd);
    };

    quest.addEventListener("transitionend", onEnd, { once: true });
  }

  footnote.addEventListener("click", (e) => {
    if (!e.target.closest(".footnote__quest")) close();
  });

  let yDown = null;
  quest.addEventListener(
    "touchstart",
    (evt) => (yDown = evt.touches[0].clientY)
  );
  quest.addEventListener("touchmove", (evt) => {
    if (!yDown) return;
    const yDiff = yDown - evt.touches[0].clientY;
    if (yDiff < -10) close();
    yDown = null;
  });
}
