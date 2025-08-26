import { renderResentRequest } from "./renderResentRequest.js";

export function initSearchOverlay() {
  const search   = document.querySelector(".search");
  const input    = search?.querySelector(".search__input");
  const backBtn  = search?.querySelector(".search__arrow");
  const clearBtn = search?.querySelector(".search__clear");
  const result   = search?.querySelector(".search__result");
  const openBtn = document?.querySelector(".header__search");

  if (!search || !input || !backBtn || !clearBtn || !openBtn || !result) {
    throw new Error("Элемент не найден");
  }

  let recentRequest = JSON.parse(localStorage.getItem("recent_request") || "[]");

  const CLS = {
    open: "search--open",
    closing: "search--closing",
    noTrans: "no-transition",
    clear: "search__clear--visible",
    noScroll: "no-scroll",
  };

  const showClear = () => {
    clearBtn.classList.toggle(CLS.clear, input.value !== "");
  };

  const open = () => {
    if (search.classList.contains(CLS.open)) return;
    search.classList.remove(CLS.noTrans, CLS.closing);
    search.classList.add(CLS.open);
    document.body.classList.add(CLS.noScroll);
    renderResentRequest(result, recentRequest, true);
    input.focus();
    showClear();
  };

  const close = () => {
    if (!search.classList.contains(CLS.open)) return;
    search.classList.remove(CLS.open);
    search.classList.add(CLS.closing);
    document.body.classList.remove(CLS.noScroll);
    search.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "transform") return;
      search.classList.add(CLS.noTrans);
      search.classList.remove(CLS.closing);
    }, { once: true });
  };

  const clear = () => {
    input.value = "";
    showClear();
    const list = result.querySelector(".search__list");
    if (list) list.innerHTML = "";
  };

  openBtn.addEventListener("click", open);
  backBtn.addEventListener("click", close);
  input.addEventListener("input", showClear);
  clearBtn.addEventListener("click", clear);
  clearBtn.addEventListener("pointerdown", (e) => e.preventDefault());

  showClear();
}
