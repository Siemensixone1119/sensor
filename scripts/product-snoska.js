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

  let isAnimating = false;
  let animationTimer = null;

  openDesc.forEach((cell) => {
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
    if (isAnimating || productDesc.classList.contains(CLS.visible)) return;
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
    isAnimating = true;

    clearTimeout(animationTimer);
    animationTimer = setTimeout(endAnimation, 600);

    function endAnimation() {
      if (!isAnimating) return;
      isAnimating = false;
      document.body.classList.add(CLS.noScroll);
    }

    productDesc.addEventListener("transitionend", endAnimation, { once: true });
  }

  function close() {
    if (isAnimating || !productDesc.classList.contains(CLS.visible)) return;
    productDesc.classList.add(CLS.closing);
    isAnimating = true;

    clearTimeout(animationTimer);
    animationTimer = setTimeout(endClose, 600);

    function endClose() {
      productDesc.classList.remove(CLS.visible, CLS.closing);
      document.body.classList.remove(CLS.noScroll);
      content.innerHTML = "";
      isAnimating = false;
    }

    desc.addEventListener("transitionend", endClose, { once: true });
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
