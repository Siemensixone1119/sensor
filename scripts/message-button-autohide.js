export function initMessageButtonAutoHide() {
  const delay = 1800;
  const btn = document?.querySelector(".message__btn");
  if (!btn) throw new Error("Элемент не найден");

  let timer = null;

  const onScroll = () => {
    btn.classList.add("hide");
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      btn.classList.remove("hide");
      timer = null;
    }, delay);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}
