export function initSearchOverlay() {
  // получение элементов
  const search = document?.querySelector(".search");
  const input = search?.querySelector(".search__input");
  const backBtn = search?.querySelector(".search__arrow");
  const clearBtn = search?.querySelector(".search__clear");
  const openBtn = document?.querySelector(".header__search");

  if (!search || !input || !backBtn || !clearBtn || !openBtn) {
    throw new Error("Элемент не найден");
  }

  // классы
  const CLS = {
    open: "search--open",
    closing: "search--closing",
    noTrans: "no-transition",
    clear: "search__clear--visible",
    noScroll: "no-scroll",
  };

  //  появление кнопочки для очистки инпута
  const showClear = () => {
    clearBtn.classList.toggle(CLS.clear, input.value !== "");
  };

  // открытие поиска
  const open = () => {
    if (search.classList.contains(CLS.open)) return;
    search.classList.remove(CLS.noTrans, CLS.closing);
    search.classList.add(CLS.open);
    document.body.classList.add(CLS.noScroll);
  };

  // закрытие поиска
  const close = () => {
    if (!search.classList.contains(CLS.open)) return;
    search.classList.remove(CLS.open);
    search.classList.add(CLS.closing);
    document.body.classList.remove(CLS.noScroll);
    search.addEventListener(
      "transitionend",
      (e) => {
        if (e.propertyName !== "transform") return;
        search.classList.add(CLS.noTrans);
        search.classList.remove(CLS.closing);
      },
      { once: true } //снимает слушатель после первого раза
    );
  };

  // очистка инпута
  const clear = () => {
    input.value = "";
    showClear();
  };

  openBtn.addEventListener("click", open);
  backBtn.addEventListener("click", () => {
    clear();
    close();
  });
  input.addEventListener("input", showClear);
  clearBtn.addEventListener("click", clear);
  // чтобы при очистке фокус оставался в инпуте
  clearBtn.addEventListener("pointerdown", (e) => e.preventDefault());
  showClear();
}
