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
    // для совместимости можно добавить и href, но xlink достаточно
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
    // задание вариантов аправлений стрелочек
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
    if (state.root) return;
    createRoot();
    document.body.appendChild(state.root);
    pushPanelFromUL(state.sourceUl, "Меню");
    state.root.classList.add(CLS.open);
  }

  function close() {
    if (!state.root) return;
    state.root.classList.remove(CLS.open);
    // очищение всего стека меню
    state.stack = [];
    state.root.remove();
    state.root = null;
    state.sheet = null;
    state.stackWrap = null;
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
    // создание контейнера для всего содержимого
    const panel = document.createElement("div");
    panel.className = `${CLS.panel} ${CLS.panelEnter}`;

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
    titleEl.textContent = foundHeader ? titleTrim(foundHeader) : fallbackTitle;

    // создани кнопочки ""
    const closeBtn = document.createElement("button");
    closeBtn.className = CLS.headerBtn;
    closeBtn.appendChild(icons.close("25px"));
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

    // верхняя линия с профилем/языком только на корневой панели
    if (state.stack.length === 0) {
      const topLine = buildTopline();
      if (topLine) body.prepend(topLine);
    }

    // контент уровня
    const liChildren = [...ul.querySelectorAll(":scope > li")];
    for (const li of liChildren) {
      const role = li.getAttribute("data-role") || "";
      if (role === "profile" || role === "language-link" || role === "header")
        continue;
      const frag = renderGroup(li);
      if (frag) rootList.appendChild(frag); // теперь вставляем в <ul>
    }

    panel.appendChild(header);
    panel.appendChild(body);

    state.stackWrap.appendChild(panel);
    state.stack.push(panel);
    requestAnimationFrame(() => panel.classList.add(CLS.panelActive));
  }

  function goBack() {
    if (state.stack.length <= 1) {
      close();
      return;
    }
    const leaving = state.stack.pop();
    leaving.classList.remove(CLS.panelEnter, CLS.panelActive);
    leaving.classList.add(CLS.panelLeave);
    requestAnimationFrame(() => leaving.classList.add(CLS.panelActive));
    setTimeout(() => leaving.remove(), 200);
  }

  function buildTopline() {
    const pf = state.rootProfileLi?.querySelector("a.login-link");
    const lg = state.rootLangLi?.querySelector("a.language-link");
    if (!pf && !lg) return null;

    const topLine = document.createElement("div");
    topLine.className = CLS.topline;

    if (pf) {
      const a = document.createElement("a");
      a.href = pf.getAttribute("href") || "#";
      a.textContent = (pf.textContent || "Войти").trim();
      topLine.appendChild(a);
    }
    if (lg) {
      const a = document.createElement("a");
      a.href = lg.getAttribute("href") || "#";
      a.textContent = (lg.textContent || "").trim();
      topLine.appendChild(a);
    }
    return topLine;
  }

  function renderGroup(li) {
    const headerEl = li.querySelector(':scope > [data-role="header"]');
    const directLinks = [...li.querySelectorAll(":scope > a")];
    const nestedSubUls = [...li.querySelectorAll(":scope > ul")];

    const visAttr = li.getAttribute("data-visibility");
    const hasVis = visAttr !== null;
    let visibleCount = hasVis ? parseInt(visAttr, 10) : directLinks.length;
    if (Number.isNaN(visibleCount)) visibleCount = directLinks.length;

    if (hasVis && visibleCount === 0 && !headerEl) {
      if (directLinks.length === 0 && nestedSubUls.length === 0) return null;
    }

    // <li> группа
    const groupLi = document.createElement("li");
    groupLi.className = CLS.group;

    // header
    if (headerEl) {
      const gh = document.createElement("div");
      gh.className = CLS.groupHeader;
      gh.textContent = titleTrim(headerEl);
      groupLi.appendChild(gh);

      if (hasVis && visibleCount === 0 && directLinks.length) {
        const t = createToggleButton(() => {
          innerUl.classList.remove(CLS.listHidden);
          t.remove();
        });
        gh.appendChild(t);
      }
    }

    // внутри группы всегда <ul>
    const innerUl = document.createElement("ul");
    innerUl.className = CLS.list;
    groupLi.appendChild(innerUl);

    if (hasVis && visibleCount === 0 && headerEl && directLinks.length) {
      innerUl.classList.add(CLS.listHidden);
    }

    // ссылки группы
    const initialToShow = Math.min(directLinks.length, visibleCount);
    for (let i = 0; i < initialToShow; i++) {
      const itemLi = createLinkLi(directLinks[i]);
      const hasHidden = directLinks.length > visibleCount;
      if (hasHidden && i === initialToShow - 1) {
        const t = createToggleButton(() => {
          for (let j = visibleCount; j < directLinks.length; j++) {
            innerUl.appendChild(createLinkLi(directLinks[j]));
          }
          t.remove();
        });
        // добавляем кнопку разворота внутрь интерактивного элемента
        itemLi.querySelector(`.${CLS.item}`)?.appendChild(t);
      }
      innerUl.appendChild(itemLi);
    }

    // вложенные подменю
    for (const subUl of nestedSubUls) {
      innerUl.appendChild(createSubmenuLi(subUl));
    }

    if (!headerEl && directLinks.length === 0 && nestedSubUls.length === 0)
      return null;
    return groupLi;
  }

  function createLinkLi(anchorEl) {
    const isHref = !!anchorEl.getAttribute("href");
    const li = document.createElement("li");
    const el = document.createElement(isHref ? "a" : "button");
    el.className = CLS.item;
    if (isHref) {
      el.href = anchorEl.getAttribute("href") || "#";
    } else {
      el.type = "button";
      el.addEventListener("click", (e) => e.preventDefault());
    }
    const label = document.createElement("div");
    label.className = CLS.itemLabel;
    label.innerHTML = anchorEl.innerHTML || (anchorEl.textContent || "").trim();
    el.appendChild(label);
    li.appendChild(el);
    return li;
  }

  function createSubmenuLi(ul) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = CLS.item;

    const label = document.createElement("div");
    label.className = CLS.itemLabel;

    const header = ul.querySelector(':scope > [data-role="header"]');
    label.textContent = header ? titleTrim(header) : "Раздел";

    btn.appendChild(label);
    btn.appendChild(icons.chevron("right"));
    btn.addEventListener("click", () => {
      pushPanelFromUL(ul, label.textContent);
      slideForward();
    });

    li.appendChild(btn);
    return li;
  }

  function createToggleButton(onOpen) {
    const b = document.createElement("button");
    b.className = CLS.headerBtn;
    b.appendChild(icons.chevron("down"));
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      onOpen();
    });
    return b;
  }

  function slideForward() {
    const n = state.stack.length;
    if (n < 2) return;
    const incoming = state.stack[n - 1];
    incoming.classList.add(CLS.panelEnter);
    requestAnimationFrame(() => incoming.classList.add(CLS.panelActive));
  }

  function titleTrim(el) {
    return (el.textContent || "").trim();
  }
}

export default mountMobileMenu;
