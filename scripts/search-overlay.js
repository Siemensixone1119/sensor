export function initSearchOverlay() {
  const root    = document.querySelector(".search");
  const input   = root?.querySelector(".search__input");
  const backBtn = root?.querySelector("[aria-label='Назад'], .search__back-btn");
  const openBtn = document?.querySelector(".header__search");

  if (!root || !input) return;

  const CLS = {
    open: "search--open",
    closing: "search--closing",
    noTrans: "no-transition",
    noScroll: "no-scroll",
  };

  const open = () => {
    if (root.classList.contains(CLS.open)) return;
    root.classList.remove(CLS.noTrans, CLS.closing);
    root.classList.add(CLS.open);
    document.body.classList.add(CLS.noScroll);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  };

  const close = () => {
    if (!root.classList.contains(CLS.open)) return;
    root.classList.remove(CLS.open);
    root.classList.add(CLS.closing);
    document.body.classList.remove(CLS.noScroll);
    root.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "transform") return;
      root.classList.add(CLS.noTrans);
      root.classList.remove(CLS.closing);
    }, { once: true });

    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  openBtn && openBtn.addEventListener("click", open);
  backBtn && backBtn.addEventListener("click", close);
}
