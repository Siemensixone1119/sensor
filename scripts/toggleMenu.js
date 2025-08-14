export function mountMobileMenu() {
  // основные элементы
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

  // состояния
  const state = {
    root: null,
    sheet: null,
    stackWrap: null,
    stack: [], // сюда добавляются открытые меню
    sourceUl: source,
    rootProfileLi: source.querySelector(':scope > li[data-role="profile"]'),
    rootLangLi: source.querySelector(':scope > li[data-role="language-link"]'),
  };

  // создание svg стрелочек и иконок, а также их размер и поворот
  function iconUse(symbolId, rotateDeg = 0, size) {
    const wrap = document.createElement("span");
    wrap.className = CLS.chevron;

    // поворот для стрелочек
    wrap.style.setProperty("--mm-rot", rotateDeg + "deg");
    if (size) wrap.style.setProperty("--mm-size", size);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      `${svgSprite}#${symbolId}`
    );

    svg.appendChild(use);
    wrap.appendChild(svg);
    return wrap;
  }

  // настройки svg
  const icons = {
    // задание вариантов направлений стрелочек
    chevron(dir = "right", size) {
      const rot = { right: 270, down: 0, left: 90, up: 180 }[dir] ?? 0;
      return iconUse("icon-arrow", rot, size);
    },
    // задание размера крестика
    close(size) {
      return iconUse("icon-menu_close", 0, size);
    },
  };

  openBtn?.addEventListener("click", open);

  // открытие меню
  function open() {
    document.body.classList.add("no-scroll");
    if (state.root) return;
    createRoot();
    document.body.appendChild(state.root);
    pushPanelFromUL(state.sourceUl, "Меню");
    state.root.classList.add(CLS.open);
  }

  function close() {
    if (!state.root) return;

    state.root.classList.remove(CLS.open);

    const sheet = state.sheet;
    let cleaned = false;

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;

      // очищение стека и DOM
      state.stack = [];
      state.root.remove();
      state.root = state.sheet = state.stackWrap = null;

      document.documentElement.classList.remove("mm-lock");
      document.body.classList.remove("mm-lock", "no-scroll");
    };

    // ждём окончания анимации
    const onEnd = (e) => {
      if (e.target !== sheet || e.propertyName !== "transform") return;
      sheet.removeEventListener("transitionend", onEnd);
      cleanup();
    };
    sheet.addEventListener("transitionend", onEnd);

    setTimeout(cleanup, 350); //на всякий случайы
  }

  // создаие подложки для меню
  function createRoot() {
    state.root = document.createElement("div");
    state.root.className = CLS.root;

    state.sheet = document.createElement("div");
    state.sheet.className = CLS.sheet;

    state.stackWrap = document.createElement("div");
    state.sheet.appendChild(state.stackWrap);

    state.root.appendChild(state.sheet);
  }

  // добавление панели со всеми разделами меню в интерфейс
  function pushPanelFromUL(ul, fallbackTitle) {
    const currentTop = state.stack[state.stack.length - 1];
    cleanupOpenExpansions(currentTop);
    // создание контейнера для всего содержимого
    const panel = document.createElement("div");
    panel.className = `${CLS.panel} ${CLS.panelEnter}`;
    // панель поверх предыдущих
    panel.style.setProperty("--mm-z", String(state.stack.length + 1));

    // создание шапки меню
    const header = document.createElement("div");
    header.className = CLS.header;

    // создание кнопки "назад"
    const backBtn = document.createElement("button");
    backBtn.className = CLS.headerBtn;
    backBtn.appendChild(icons.chevron("left"));
    backBtn.addEventListener("click", goBack);

    // создание заголовка меню
    const titleEl = document.createElement("div");
    titleEl.className = CLS.headerTitle;
    const foundHeader = ul.querySelector(':scope > [data-role="header"]');
    titleEl.textContent = titleTrim(foundHeader) || fallbackTitle;

    // создание кнопочки "закрыть"
    const closeBtn = document.createElement("button");
    closeBtn.className = CLS.headerBtn;
    closeBtn.appendChild(icons.close("44px"));
    closeBtn.addEventListener("click", close);

    if (state.stack.length === 0) {
      header.appendChild(titleEl);
    } else {
      header.appendChild(backBtn);
      header.appendChild(titleEl);
    }
    header.appendChild(closeBtn);

    // body
    const body = document.createElement("div");
    body.className = CLS.body;

    // корневой список текущей панели
    const rootList = document.createElement("ul");
    rootList.className = CLS.list;
    body.appendChild(rootList);

    // добавление раздела в начало первого экрана
    if (state.stack.length === 0) {
      const topLine = buildTopline();
      if (topLine) body.prepend(topLine);
    }

    // контент уровня
    const liChildren = ul.querySelectorAll(":scope > li");

    liChildren.forEach((li) => {
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
    requestAnimationFrame(() => panel.classList.add(CLS.panelActive));
  }

  // закрытие экрана
  function goBack() {
    if (state.stack.length <= 1) {
      close();
      return;
    }
    const leaving = state.stack.pop();
    leaving.classList.remove(CLS.panelEnter, CLS.panelActive);
    leaving.classList.add(CLS.panelLeave);
    requestAnimationFrame(() => leaving.classList.add(CLS.panelActive));
    setTimeout(() => leaving.remove(), 300);
  }

  // создание строки со входом и выбором языка
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
      a.textContent = pf.textContent;
      topLine.appendChild(a);
    }

    // язык
    if (lg) {
      const a = document.createElement("a");
      a.href = lg.getAttribute("href") || "#";
      a.textContent = lg.textContent;
      topLine.appendChild(a);
    }
    return topLine;
  }

  // создание самой структуры вложенных списков
  function renderGroup(li) {
    const headerEl = li.querySelector(':scope > [data-role="header"]');
    const links = li.querySelectorAll(":scope > a");
    const subUls = li.querySelectorAll(":scope > ul");

    const visAttr = li.getAttribute("data-visibility");
    const hasVis = visAttr !== null;
    let visibleCount = hasVis ? parseInt(visAttr, 10) : links.length;
    if (Number.isNaN(visibleCount)) visibleCount = links.length;

    // создание li группы
    const groupLi = document.createElement("li");
    groupLi.className = CLS.group;

    // создание ul внутри группы
    const innerUl = document.createElement("ul");
    innerUl.className = CLS.list;
    groupLi.appendChild(innerUl);

    if (visibleCount === 0 && headerEl && links.length) {
      innerUl.classList.add(CLS.listHidden);
    }

    // ссылки вложенной группы
    const initialToShow = Math.min(links.length, visibleCount);
    for (let i = 0; i < initialToShow; i++) {
      const hasHidden = links.length > visibleCount;

      if (hasHidden && i === initialToShow - 1) {
        // последний видимый пункт делает раскрытие остальных
        const makeHiddenNodes = () => {
          const nodes = [];
          for (let j = visibleCount; j < links.length; j++) {
            nodes.push(createLinkLi(links[j]));
          }
          return nodes;
        };

        const expanderLi = createFullRowExpander(
          links[i],
          makeHiddenNodes,
          innerUl
        );
        innerUl.appendChild(expanderLi);
      } else {
        const itemLi = createLinkLi(links[i]);
        innerUl.appendChild(itemLi);
      }
    }

    // вложенные подменю
    for (const subUl of subUls) {
      innerUl.appendChild(createSubmenuLi(subUl));
    }

    return groupLi;
  }

  // создание ссылки/кнопки в группе
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

    const label = document.createElement("div");
    label.className = CLS.itemLabel;
    label.innerHTML = anchorEl.innerHTML || (anchorEl.textContent || "").trim();

    a.appendChild(label);
    li.appendChild(a);
    return li;
  }

  // функционал выпадающего списка
  function createFullRowExpander(anchorEl, makeHiddenNodes) {
    const href = (anchorEl.getAttribute("href") || "").trim();
    const li = document.createElement("li");

    // создание ссылок
    const a = document.createElement("a");
    a.className = CLS.item;
    if (href) a.href = href;
    else a.setAttribute("role", "link");

    // текст ссылки
    const label = document.createElement("div");
    label.className = CLS.itemLabel;
    label.innerHTML = anchorEl.innerHTML || (anchorEl.textContent || "").trim();
    a.appendChild(label);

    // создание стрелочек
    const chevron = icons.chevron("down");
    a.appendChild(chevron);

    let isAnimating = false; //чтобы не было ошибки, когда много нажимаешь
    let wrap = null; //вложенный список

    const isCurrentlyOpen = () =>
      !!(wrap && wrap.isConnected && wrap.classList.contains("is-open"));

    // открытие списка
    const openAnim = () => {
      if (isAnimating) return;
      isAnimating = true;

      //если не сощдвн, то создаем
      if (!wrap) {
        wrap = document.createElement("ul");
        wrap.className = `${CLS.list} ${CLS.listCollapsible}`;
        li.appendChild(wrap);
      } else if (!wrap.isConnected) {
        li.appendChild(wrap);
      }

      // отрисовка скрытых подпунктов
      const nodes = makeHiddenNodes() || [];
      wrap.innerHTML = "";
      nodes.forEach((n) => wrap.appendChild(n));

      // окончание
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

    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (isAnimating) return;
      if (!isCurrentlyOpen()) openAnim();
      else closeAnim();
    });

    li.appendChild(a);
    return li;
  }

  // создние элементов выпадающего списка
  function createSubmenuLi(ul) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = CLS.item;

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

  //
  function slideForward() {
    const count = state.stack.length;
    if (count < 2) return;
    const incoming = state.stack[count - 1];
    incoming.classList.add(CLS.panelEnter);
    requestAnimationFrame(() => incoming.classList.add(CLS.panelActive));
  }

  // обрезка лишнего вокруг заголовка
  function titleTrim(el) {
    return (el?.textContent || "").trim();
  }

  // чтобы при открытии других вложенностей выпадающие списки закрывались
  function cleanupOpenExpansions(scopeEl) {
    if (!scopeEl) return;
    scopeEl.querySelectorAll(`.${CLS.listCollapsible}`).forEach((el) => {
      const li = el.closest("li");
      el.remove();
      const chev = li?.querySelector(`.${CLS.chevron}`);
      if (chev) chev.style.setProperty("--mm-rot", "0deg");
    });
  }
}
