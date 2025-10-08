export function toggleSnoska() {
  const productDesc = document.querySelector(".product__backdrop");
  const openDesc = document.querySelector(".compare__cell button");
  const productCloseBtn = productDesc.querySelector(".product__close-btn");
  const desc = productDesc.querySelector(".product__quest");

  const CLS = {
    visible: "product--visible",
    noScroll: "no-scroll",
  };

  function open() {
    productDesc.classList.add(CLS.visible);
    desc.classList.add(CLS.visible);
    document.body.classList.add(CLS.noScroll);
  }

  function close() {
    productDesc.classList.remove(CLS.visible);
    desc.classList.remove(CLS.visible);
    document.body.classList.remove(CLS.noScroll);
  }

  openDesc.addEventListener("click", open);

  productDesc.addEventListener("click", (e) => {
    console.log(e.target.className);

    if (e.target.className != "product__quest product--visible") {
      close();
    }
  });
}
