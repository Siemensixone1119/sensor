export function toggleSnoska() {
  const productDesc = document.querySelector(".product__backdrop");
  const openDesc = document.querySelectorAll(".compare__cell button");
  const desc = productDesc.querySelector(".product__quest");
  const span = productDesc.querySelector("span");

  const CLS = {
    visible_opacity: "product--visible-opacity",
    visible_transform: "product--visible-transform",
    close_opacity: "product--close-opacity",
    close_transform: "product--close-transform",
    noScroll: "no-scroll",
  };

  function open(e) {
    const infoText = e.currentTarget
      .closest("span")
      .querySelector(".compare__info-text");
    productDesc.classList.add(CLS.visible_opacity);
    desc.classList.add(CLS.visible_transform);
    desc.classList.add(CLS.visible);
    document.body.classList.add(CLS.noScroll);
    span.textContent = infoText.textContent;
  }

  function close() {
    desc.classList.remove(CLS.visible);
    productDesc.classList.remove(CLS.visible_opacity);
    desc.classList.remove(CLS.visible_transform);

    productDesc.addEventListener(
      "transitionend",
      () => {
        productDesc.classList.remove(CLS.visible_opacity);
      },
      { once: true }
    );

    desc.addEventListener(
      "transitionend",
      () => {
        desc.classList.remove(CLS.visible_transform);
        span.innerHTML = "";
      },
      { once: true }
    );
  }

  openDesc.forEach((openBtn) => openBtn.addEventListener("click", open));

  productDesc.addEventListener("click", (e) => {
    console.log(e.target.className);

    if (e.target.className != "product__quest product--visible") {
      close();
    }
  });

  desc.addEventListener("touchstart", handleTouchStart, false);
  desc.addEventListener("touchmove", handleTouchMove, false);

  let yDown = null;

  function handleTouchStart(evt) {
    const { clientY } = evt.touches[0];
    yDown = clientY;
  }

  function handleTouchMove(evt) {
    if (!yDown) {
      return;
    }

    const { clientY } = evt.touches[0];
    const yDiff = yDown - clientY;

    if (yDiff < -10) {
      close();
    }
    yDown = null;
  }
}
