export function mountMobileMenu() {

  // основые элементы
  const mm = "mobile-menu";
  const svgSprite = "./assets/image/symbol-defs.svg";
  const source = document.querySelector(".root-menu");
  const openBtn = document.getElementById("open-menu");
  if (!source) {
    throw new Error("Элемент не найден");
  }

  // классы
  const CLS = {
    root: mm,                                
    open: `${mm}--open`,
    sheet: `${mm}__sheet`,
    header: `${mm}__header`,
    headerBtn: `${mm}__header-btn`,
    headerTitle: `${mm}__header-title`,
    body: `${mm}__body`,
    topline: `${mm}__topline`,
    group: `${mm}__group`,
    groupHeader: `${mm}__group-header`,
    list: `${mm}__list`,
    listHidden: `${mm}__list--hidden`,
    item: `${mm}__item`,
    itemLabel: `${mm}__item-label`,
    chevron: `${mm}__chevron`,
    panel: `${mm}__panel`,
    panelEnter: `${mm}__panel--enter`,
    panelLeave: `${mm}__panel--leave`,
    panelActive: `${mm}__panel--active`,
    listCollapsible: `${mm}__list--collapsible`,
  };

  // состояния меню
  const state = {
    root: null,
    sheet: null,
    stackWrap: null,
    stack: [],
    sourceUl: source,
    rootProfileLi: source.querySelector(':scope > li[data-role="profile"]'),
    rootLangLi: source.querySelector(':scope > li[data-role="language-link"]'),
  };

  // создаются свгшки 
  function iconUse(symbolId, rotateDeg = 0, size, close = false) {

    const wrap = document.createElement("span");
    wrap.className = CLS.chevron;

    // задаются градусы
    wrap.style.setProperty("--mm-rot", rotateDeg + "deg");
    // задается размер
    if (size) wrap.style.setProperty("--mm-size", size);

    // само создание свгшки в ее пространств имен
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      `${svgSprite}#${symbolId}`
    );

    // это только для крестика
    if (close) {
      svg.setAttribute("data-close", "true");
    }

    svg.appendChild(use);
    wrap.appendChild(svg);
    return wrap;
  }

  // тут я задаю параметры свгшек
  const icons = {
    // здесь градусы поворота стрелочек
    chevron(dir = "right", size) {
      const rot = { right: 270, down: 0, left: 90, up: 180 }[dir] ?? 0;
      return iconUse("icon-arrow", rot, size);
    },
    // а это размер крестика
    close(size) {
      return iconUse("icon-menu_close", 0, size, true);
    },
  };

  openBtn?.addEventListener("click", open);

  // открытие менюшки
  function open() {
    document.body.classList.add("no-scroll");
    if (state.root) return;
    createRoot();
    document.body.appendChild(state.root);
    pushPanelFromUL(state.sourceUl, "Меню");
    state.root.classList.add(CLS.open);
  }

  // закрытие менюшки
  function close() {
    if (!state.root) return;
    state.root.classList.remove(CLS.open);

    // Локальная ссылка на sheet (нужно для transitionend)
    const sheet = state.sheet;
    // Флажок, чтобы cleanup выполнился ровно один раз
    let cleaned = false;

    // Очистка DOM и классов после завершения анимации
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;

      state.stack = [];
      state.root.remove();
      state.root = state.sheet = state.stackWrap = null;
      document.documentElement.classList.remove("mm-lock");
      document.body.classList.remove("mm-lock", "no-scroll");
    };

    // Когда у sheet закончится транзишн, запускаем cleanup
    const onEnd = (e) => {
      if (e.target !== sheet) return;
      sheet.removeEventListener("transitionend", onEnd);
      cleanup();
    };
    sheet.addEventListener("transitionend", onEnd);

    // это на всякий случай
    setTimeout(cleanup, 350);
  }

  // создание основы для нашей менюшки
  function createRoot() {

    // это корень
    state.root = document.createElement("div");
    state.root.className = CLS.root;

    // а это для того, чтобы сюда помещать само мобайл меню
    state.sheet = document.createElement("div");
    state.sheet.className = CLS.sheet;

    // обёртка для панелей
    state.stackWrap = document.createElement("div");
    state.sheet.appendChild(state.stackWrap);

    state.root.appendChild(state.sheet);
  }

  // создание и добавление структуры из ul
  function pushPanelFromUL(ul, fallbackTitle) {

    // сама панелька
    const panel = document.createElement("div");
    panel.className = `${CLS.panel} ${CLS.panelEnter}`;

    // шапка панельки
    const header = document.createElement("div");
    header.className = CLS.header;

    // Кнопочка "назад"
    const backBtn = document.createElement("button");
    backBtn.className = CLS.headerBtn;
    backBtn.appendChild(icons.chevron("left"));
    backBtn.addEventListener("click", goBack);

    // заголовок
    const titleEl = document.createElement("div");
    titleEl.className = CLS.headerTitle;
    const foundHeader = ul.querySelector(':scope > [data-role="header"]');
    titleEl.textContent = titleTrim(foundHeader) || fallbackTitle;

    // кнопочка "закрыть"
    const closeBtn = document.createElement("button");
    closeBtn.className = CLS.headerBtn;

    // Размер крестика
    closeBtn.appendChild(icons.close("44px"));
    closeBtn.addEventListener("click", close);

    // если это первый экран
    if (state.stack.length === 0) {
      header.appendChild(titleEl);
    } else {
      header.appendChild(backBtn);
      header.appendChild(titleEl);
    }

    header.appendChild(closeBtn);

    // тело панели
    const body = document.createElement("div");
    body.className = CLS.body;

    // корень этой панели
    const rootList = document.createElement("ul");
    rootList.className = CLS.list;
    body.appendChild(rootList);

    // На первом экране показываем верхнюю строку (войти/язык)
    if (state.stack.length === 0) {
      const topLine = buildTopline();
      if (topLine) body.prepend(topLine);
    }

    const liChildren = ul.querySelectorAll(":scope > li");
    liChildren.forEach((li) => {
      // пропускает служебные пункты, которые не являются реальным содержимым
      const role = li.getAttribute("data-role");
      if (role === "profile" || role === "language-link" || role === "header")
        return;

      const frag = renderGroup(li);
      if (frag) rootList.appendChild(frag);
    });

    panel.appendChild(header);
    panel.appendChild(body);

    state.stackWrap.appendChild(panel);
    state.stack.push(panel);

    // ожидание кадра, чтобы была нормальная анимация
    requestAnimationFrame(() => {
      panel.style.visibility = "visible";
      panel.classList.add(CLS.panelActive);

      // закрытие выпадающих списков при открытии других менюшек
      afterPanelAnimation(panel, () => cleanupAllExpansionsExcept(panel));
    });
  }

  // возврат к предидущей менюшке
  function goBack() {
    // снимаю из стека панель
    const leaving = state.stack.pop();

    leaving.classList.remove(CLS.panelEnter, CLS.panelActive);
    leaving.classList.add(CLS.panelLeave);
    // чтоб была нормальная анимация
    requestAnimationFrame(() => leaving.classList.add(CLS.panelActive));
    // чтобы анимация успела отрисоваться и только после этого удаляю меню
    setTimeout(() => leaving.remove(), 300);
  }

  // создание верхней строки на первом экране
  function buildTopline() {

    const pf = state.rootProfileLi?.querySelector("a.login-link");
    const lg = state.rootLangLi?.querySelector("a.language-link");

    if (!pf && !lg) return null;

    const topLine = document.createElement("div");
    topLine.className = CLS.topline;

    // вход
    if (pf) {
      const a = document.createElement("a");
      a.href = pf.getAttribute("href") || "#";
      a.textContent = (pf.textContent || "").trim();
      topLine.appendChild(a);
    }

    // язык
    if (lg) {
      const a = document.createElement("a");
      a.href = lg.getAttribute("href") || "#";
      a.textContent = (lg.textContent || "").trim();
      topLine.appendChild(a);
    }
    return topLine;
  }

  // парсим лишки в группу
  function renderGroup(li) {
    // заголовок, если он есть
    const headerEl = li.querySelector(':scope > [data-role="header"]');
    // сами ссылки
    const links = li.querySelectorAll(":scope > a");
    // это подменю
    const subUls = li.querySelectorAll(":scope > ul");

    // обработка data-visibility
    const visAttr = li.getAttribute("data-visibility");
    const hasVis = visAttr !== null;
    let visibleCount = hasVis ? parseInt(visAttr, 10) : links.length;
    if (Number.isNaN(visibleCount)) visibleCount = links.length;

    const groupLi = document.createElement("li");
    groupLi.className = CLS.group;

    const innerUl = document.createElement("ul");
    innerUl.className = CLS.list;
    groupLi.appendChild(innerUl);

    if (visibleCount === 0 && headerEl && links.length) {
      innerUl.classList.add(CLS.listHidden);
    }

    // рисуем первые N ссылок
    const initialToShow = Math.min(links.length, visibleCount);
    for (let i = 0; i < initialToShow; i++) {
      const hasHidden = links.length > visibleCount;

      if (hasHidden && i === initialToShow - 1) {
        // генератор скрытых пунктов (создаём по клику)
        const makeHiddenNodes = () => {
          const nodes = [];
          for (let j = visibleCount; j < links.length; j++) {
            nodes.push(createLinkLi(links[j]));
          }
          return nodes;
        };

        // создаём пункт-раскрыватель
        const expanderLi = createFullRowExpander(links[i], makeHiddenNodes);
        innerUl.appendChild(expanderLi);
      } else {
        // обычный пункт
        const itemLi = createLinkLi(links[i]);
        innerUl.appendChild(itemLi);
      }
    }

    // для вложенных ul создаём пункты, которые ведут на новые панели
    for (const subUl of subUls) {
      innerUl.appendChild(createSubmenuLi(subUl));
    }

    return groupLi;
  }
//🐟
// игорь евгеньевич, если вы это заметите, то перейдите пожалуйста по ссылке => https://siemensixone1119.github.io/sensor/assets/koe-chto-ochen-vaznoe/vaznoe.gif
//🐟

  // создание ссылки из a
  function createLinkLi(anchorEl) {

    const href = (anchorEl.getAttribute("href") || "").trim();

    const li = document.createElement("li");

    const a = document.createElement("a");
    a.className = CLS.item;
    if (href) {
      a.setAttribute("href", href);
    } else {
      a.setAttribute("role", "link");
    }

    // контейнер текста
    const label = document.createElement("div");
    label.className = CLS.itemLabel;
    label.innerHTML = anchorEl.innerHTML || (anchorEl.textContent || "").trim();

    // Собираем
    a.appendChild(label);
    li.appendChild(a);
    return li;
  }

  // аккордеон
  function createFullRowExpander(anchorEl, makeHiddenNodes) {
    const href = (anchorEl.getAttribute("href") || "").trim();
    const li = document.createElement("li");

    // строка-пункт
    const a = document.createElement("a");
    a.className = CLS.item;
    if (href) a.href = href;
    else a.setAttribute("role", "link");

    // текстовое содержимое
    const label = document.createElement("div");
    label.className = CLS.itemLabel;
    label.innerHTML = anchorEl.innerHTML || (anchorEl.textContent || "").trim();
    a.appendChild(label);

    // стрелочка
    const chevron = icons.chevron("down");
    a.appendChild(chevron);

    // чтоб не было двойных кликов
    let isAnimating = false;
    // контейнер для скрытых пунктов
    let wrap = null;

    // открыт список или нет
    const isCurrentlyOpen = () =>
      !!(wrap && wrap.isConnected && wrap.classList.contains("is-open"));

    // анимация открытия
    const openAnim = () => {
      if (isAnimating) return;
      isAnimating = true;

      // если контейнер ещё не создавали
      if (!wrap) {
        wrap = document.createElement("ul");
        wrap.className = `${CLS.list} ${CLS.listCollapsible}`;
        li.appendChild(wrap);
      } else if (!wrap.isConnected) {
        // если его удалили ранее
        li.appendChild(wrap);
      }

      // скрытые пункты
      const nodes = makeHiddenNodes() || [];
      wrap.innerHTML = "";
      nodes.forEach((n) => wrap.appendChild(n));

      const el = wrap;
      el.style.height = "0px";
      void el.offsetHeight;
      el.classList.add("is-open");
      el.style.height = el.scrollHeight + "px";

      const onEndOpen = (e) => {
        if (e.target !== el || e.propertyName !== "height") return;
        el.style.height = "auto";
        isAnimating = false;
        el.removeEventListener("transitionend", onEndOpen);
      };
      el.addEventListener("transitionend", onEndOpen);

      chevron.style.setProperty("--mm-rot", "180deg");
    };

    // анимация закрытия
    const closeAnim = () => {
      if (isAnimating || !wrap) return;
      isAnimating = true;

      const el = wrap;
      el.style.height = el.scrollHeight + "px";
      void el.offsetHeight;
      el.style.height = "0px";
      el.classList.remove("is-open");

      const onEndClose = (e) => {
        if (e.target !== el || e.propertyName !== "height") return;
        el.removeEventListener("transitionend", onEndClose);
        el.remove();
        if (wrap === el) wrap = null;
        isAnimating = false;
      };
      el.addEventListener("transitionend", onEndClose);

      chevron.style.setProperty("--mm-rot", "0deg");
    };

    // нажатие по строке, чтобы список раскрылся
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (isAnimating) return;
      if (!isCurrentlyOpen()) openAnim();
      else closeAnim();
    });

    li.appendChild(a);
    return li;
  }

  // пункт, который открывает новое меню
  function createSubmenuLi(ul) {
    const li = document.createElement("li");
    // кнопка-строка
    const btn = document.createElement("button");
    btn.className = CLS.item;

    // Текст пункта из заголовка вложенного ul
    const label = document.createElement("div");
    label.className = CLS.itemLabel;

    const header = ul.querySelector(':scope > [data-role="header"]');
    label.textContent = titleTrim(header) || "Раздел";

    btn.appendChild(label);
    btn.appendChild(icons.chevron("right"));

    btn.addEventListener("click", () => {
      pushPanelFromUL(ul, label.textContent);
      slideForward();
    });

    li.appendChild(btn);
    return li;
  }

  // анимации для открытия панели
  function slideForward() {
    const count = state.stack.length;
    if (count < 2) return;
    const incoming = state.stack[count - 1];
    incoming.classList.add(CLS.panelEnter);
    requestAnimationFrame(() => incoming.classList.add(CLS.panelActive));
  }

  // обрезка текста для заголовка
  function titleTrim(el) {
    return (el?.textContent || "").trim();
  }

  // закрыть все выпадающие
  function cleanupOpenExpansions(scopeEl) {
    if (!scopeEl) return;

    scopeEl.querySelectorAll(`.${CLS.listCollapsible}`).forEach((el) => {
      const li = el.closest("li");
      el.remove();
      const chev = li?.querySelector(`.${CLS.chevron}`);
      if (chev) chev.style.setProperty("--mm-rot", "0deg");
    });
  }

  // а это чтобы список не закрвлся на текущей панели
  function cleanupAllExpansionsExcept(exceptPanel) {
    state.stack.forEach((panel) => {
      if (panel !== exceptPanel) cleanupOpenExpansions(panel);
    });
  }

  // чтобы была нормальная анимация закрытия
  function afterPanelAnimation(panel, cb) {
    let done = false;

    const onEnd = (e) => {
      if (done) return;
      if (e.target !== panel || e.propertyName !== "transform") return;
      done = true;
      panel.removeEventListener("transitionend", onEnd);
      cb();
    };

    panel.addEventListener("transitionend", onEnd);
  }
}
