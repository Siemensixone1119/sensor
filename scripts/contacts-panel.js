export function initContactsPanel() {
  // получение элементов
  const contacts = document?.querySelector(".contacts");
  const openEl = document?.querySelector(".header__phone-button");

  if (!contacts || !openEl) {
    throw new Error("Элемент не найден");
  }

  // классы
  const CLS = {
    visible: "contacts--visible",
    noScroll: "no-scroll",
  };

  //открытие меню контактов
  function open() {
    if (contacts.classList.contains(CLS.visible)) return;
    contacts.classList.add(CLS.visible);
    document.body.classList.add(CLS.noScroll);
  }

  openEl.addEventListener("click", open);
}
