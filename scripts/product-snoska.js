export function toggleSnoska() {
  const productDesc = document.querySelector(".product__backdrop");
  if (!productDesc) return;

  const openDesc = document.querySelectorAll(".compare__cell");
  const desc = productDesc.querySelector(".product__quest");
  const header = productDesc.querySelector(".product__snoska-header");
  const content = productDesc.querySelector(".product__snoska-content");
  if (!desc || !header || !content) return;

  const CLS = {
    visible: "product--visible",
    closing: "product--closing",
    noScroll: "no-scroll",
  };

  let activeInfoBlock = null;
  let originalParent = null;

  openDesc.forEach((cell) => {
    const infoBlocks = cell.querySelectorAll("[data-info]");
    if (!infoBlocks.length) return;

    infoBlocks.forEach((infoBlock) => {
      let targetDiv = infoBlock.closest("div");
      if (targetDiv === infoBlock) {
        targetDiv =
          infoBlock.previousElementSibling || cell.querySelector("div");
      }
      if (!targetDiv) return;

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
    const infoBlock = btn.previousElementSibling?.matches("[data-info]")
      ? btn.previousElementSibling
      : null;

    if (!infoBlock) return;

    const caption = infoBlock.dataset.caption?.trim() || "";
    const hasCaption = caption.length > 0;
    const hasContent = infoBlock.innerHTML.trim().length > 0;

    if (!hasCaption && !hasContent) return;

    header.textContent = caption;
    header.style.display = hasCaption ? "" : "none";

    const clone = infoBlock.cloneNode(true);
    clone.hidden = false;

    content.innerHTML = "";
    content.appendChild(clone);

    productDesc.classList.add(CLS.visible);

    const onTransitionEnd = (e) => {
      if (e.target === productDesc) {
        document.body.classList.add(CLS.noScroll);
        productDesc.removeEventListener("transitionend", onTransitionEnd);
      }
    };
    productDesc.addEventListener("transitionend", onTransitionEnd, {
      once: true,
    });
  }

  function close() {
    productDesc.classList.add(CLS.closing);

    const onTransitionEnd = () => {
      productDesc.classList.remove(CLS.visible, CLS.closing);
      desc.removeEventListener("transitionend", onTransitionEnd);
      document.body.classList.remove(CLS.noScroll);

      content.innerHTML = "";
    };

    desc.addEventListener("transitionend", onTransitionEnd, { once: true });
  }

  function close() {
    productDesc.classList.add(CLS.closing);

    const onTransitionEnd = () => {
      productDesc.classList.remove(CLS.visible, CLS.closing);
      desc.removeEventListener("transitionend", onTransitionEnd);
      document.body.classList.remove(CLS.noScroll);

      if (activeInfoBlock && originalParent) {
        activeInfoBlock.hidden = true;
        originalParent.appendChild(activeInfoBlock);
        activeInfoBlock = null;
        originalParent = null;
      }
    };

    desc.addEventListener("transitionend", onTransitionEnd, { once: true });
  }

  productDesc.addEventListener("click", (e) => {
    if (!e.target.closest(".product__quest")) close();
  });

  let yDown = null;
  desc.addEventListener(
    "touchstart",
    (evt) => (yDown = evt.touches[0].clientY)
  );
  desc.addEventListener("touchmove", (evt) => {
    if (!yDown) return;
    const yDiff = yDown - evt.touches[0].clientY;
    if (yDiff < -10) close();
    yDown = null;
  });
}
