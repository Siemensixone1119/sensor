export function toggleSnoska() {
  const productDesc = document.querySelector(".product__backdrop");
  const openDesc = document.querySelectorAll(".compare__cell button");
  const desc = productDesc.querySelector(".product__quest");
  const text = document.querySelectorAll(".compare__info-text");
  const span = productDesc.querySelector("span");

  const CLS = {
    visible: "product--visible",
    noScroll: "no-scroll",
  };

  function open(e) {
    const infoText = e.currentTarget
      .closest("span")
      .querySelector(".compare__info-text");
    productDesc.classList.add(CLS.visible);
    desc.classList.add(CLS.visible);
    document.body.classList.add(CLS.noScroll);
    span.textContent = infoText.textContent;
  }

  function close() {
    desc.classList.remove(CLS.visible);
    setTimeout(() => {
      productDesc.classList.remove(CLS.visible);
      document.body.classList.remove(CLS.noScroll);
      span.innerHTML = "";
    }, 300);
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
