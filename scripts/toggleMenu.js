// menu.js
export function mountMobileMenu() {
  const mm = "mobile-menu";
  const svgSprite = "./assets/image/symbol-defs.svg";
  const source = document.querySelector(".root-menu");
  const openBtn = document.getElementById("open-menu");
  if (!source) throw new Error("Элемент не найден");

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

  const state = {
    root: null,
    sheet: null,
    stackWrap: null,
    stack: [],
    sourceUl: source,
    rootProfileLi: source.querySelector(':scope > li[data-role="profile"]'),
    rootLangLi: source.querySelector(':scope > li[data-role="language-link"]'),
  };

  function iconUse(symbolId, rotateDeg = 0, size, isClose = false) {
    const wrap = document.createElement("span");
    wrap.className = CLS.chevron;
    wrap.style.setProperty("--mm-rot", rotateDeg + "deg");
    if (size) wrap.style.setProperty("--mm-size", size);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `${svgSprite}#${symbolId}`);
    use.setAttribute("href", `${svgSprite}#${symbolId}`);
    if (isClose) svg.setAttribute("data-close", "true");
    svg.appendChild(use);
    wrap.appendChild(svg);
    return wrap;
  }
  const icons = {
    chevron(dir = "right", size) {
      const rot = { right: 270, down: 0, left: 90, up: 180 }[dir] ?? 0;
      return iconUse("icon-arrow", rot, size);
    },
    close(size) {
      return iconUse("icon-menu_close", 0, size, true);
    },
  };

  openBtn?.addEventListener("click", open);

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
      state.stack = [];
      state.root.remove();
      state.root = state.sheet = state.stackWrap = null;
      document.documentElement.classList.remove("mm-lock");
      document.body.classList.remove("mm-lock", "no-scroll");
    };
    const onEnd = (e) => {
      if (e.target !== sheet) return;
      sheet.removeEventListener("transitionend", onEnd);
      cleanup();
    };
    sheet.addEventListener("transitionend", onEnd);
    setTimeout(cleanup, 400);
  }

  function createRoot() {
    state.root = document.createElement("div");
    state.root.className = CLS.root;

    state.sheet = document.createElement("div");
    state.sheet.className = CLS.sheet;

    state.stackWrap = document.createElement("div");
    state.sheet.appendChild(state.stackWrap);

    state.root.appendChild(state.sheet);
  }

  function pushPanelFromUL(ul, fallbackTitle) {
    const panel = document.createElement("div");
    panel.className = `${CLS.panel} ${CLS.panelEnter}`;
    panel.style.setProperty("--mm-z", String(state.stack.length + 1));

    const header = document.createElement("div");
    header.className = CLS.header;

    const backBtn = document.createElement("button");
    backBtn.className = CLS.headerBtn;
    backBtn.appendChild(icons.chevron("left"));
    backBtn.addEventListener("click", goBack);

    const titleEl = document.createElement("div");
    titleEl.className = CLS.headerTitle;
    const foundHeader = ul.querySelector(':scope > [data-role="header"]');
    titleEl.textContent = titleTrim(foundHeader) || fallbackTitle;

    const closeBtn = document.createElement("button");
    closeBtn.className = CLS.headerBtn;
    closeBtn.appendChild(icons.close("44px"));
    closeBtn.addEventListener("click", close);

    if (state.stack.length === 0) {
      // 1-й экран: вместо «Меню» показываем «Войти»
      const pf = state.rootProfileLi?.querySelector("a.login-link");
      if (pf) {
        const loginBtn = document.createElement("a");
        loginBtn.className = `${CLS.headerBtn} ${mm}__header-login`;
        loginBtn.href = pf.getAttribute("href") || "#";
        loginBtn.textContent = (pf.textContent || "Войти").trim();
        header.appendChild(loginBtn);
      } else {
        header.appendChild(titleEl);
      }
    } else {
      header.appendChild(backBtn);
      header.appendChild(titleEl);
    }
    header.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = CLS.body;

    const rootList = document.createElement("ul");
    rootList.className = CLS.list;
    body.appendChild(rootList);

    // На первом экране НЕ показываем язык в топлайне
    if (state.stack.length === 0) {
      const topLine = buildTopline({ includeLogin: false, includeLanguage: false });
      if (topLine) body.prepend(topLine);
    }

    // Контент по исходному DOM-порядку
    const liChildren = ul.querySelectorAll(":scope > li");
    liChildren.forEach((li) => {
      const role = li.getAttribute("data-role");
      if (role === "profile" || role === "language-link" || role === "header") return;
      const frag = renderGroup(li);
      if (frag) rootList.appendChild(frag);
    });

    // ЯЗЫК — ПОСЛЕДНИМ ПУНКТОМ (одна ссылка со стрелкой внутри)
    if (state.stack.length === 0) {
      const lg = state.rootLangLi?.querySelector("a.language-link");
      if (lg) {
        rootList.appendChild(createLanguageItem(lg));
      }
    }

    panel.appendChild(header);
    panel.appendChild(body);

    state.stackWrap.appendChild(panel);
    state.stack.push(panel);

    requestAnimationFrame(() => {
      panel.classList.add(CLS.panelActive);
      afterPanelAnimation(panel, () => cleanupAllExpansionsExcept(panel));
    });
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
    setTimeout(() => leaving.remove(), 300);
  }

  function buildTopline(opts = {}) {
    const { includeLogin = true, includeLanguage = true } = opts;
    const pf = includeLogin ? state.rootProfileLi?.querySelector("a.login-link") : null;
    const lg = includeLanguage ? state.rootLangLi?.querySelector("a.language-link") : null;
    if (!pf && !lg) return null;

    const topLine = document.createElement("div");
    topLine.className = CLS.topline;

    if (pf) {
      const a = document.createElement("a");
      a.href = pf.getAttribute("href") || "#";
      a.textContent = (pf.textContent || "").trim();
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
    const links = li.querySelectorAll(":scope > a");
    const subUls = li.querySelectorAll(":scope > ul");

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

    const initialToShow = Math.min(links.length, visibleCount);
    for (let i = 0; i < initialToShow; i++) {
      const hasHidden = links.length > visibleCount;

      if (hasHidden && i === initialToShow - 1) {
        const makeHiddenNodes = () => {
          const nodes = [];
          for (let j = visibleCount; j < links.length; j++) {
            nodes.push(createLinkLi(links[j]));
          }
          return nodes;
        };
        const expanderLi = createFullRowExpander(links[i], makeHiddenNodes);
        innerUl.appendChild(expanderLi);
      } else {
        innerUl.appendChild(createLinkLi(links[i]));
      }
    }

    for (const subUl of subUls) {
      innerUl.appendChild(createSubmenuLi(subUl));
    }

    return groupLi;
  }

  function createLinkLi(anchorEl) {
    const href = (anchorEl.getAttribute("href") || "").trim();

    const li = document.createElement("li");
    const row = document.createElement("div");
    row.className = CLS.item;

    const labelLink = document.createElement("a");
    labelLink.className = CLS.itemLabel;
    if (href) labelLink.setAttribute("href", href);
    else {
      labelLink.setAttribute("role", "link");
      labelLink.setAttribute("tabindex", "0");
    }
    labelLink.innerHTML = anchorEl.innerHTML || (anchorEl.textContent || "").trim();

    row.appendChild(labelLink);
    li.appendChild(row);
    return li;
  }

  // ЯЗЫК как один пункт-ссылка со стрелкой внутри (кликабельно целиком)
  function createLanguageItem(lgAnchorEl) {
    const li = document.createElement("li");
    li.className = CLS.group;

    const innerUl = document.createElement("ul");
    innerUl.className = CLS.list;

    const rowLi = document.createElement("li");
    const a = document.createElement("a");
    a.className = CLS.item;           // тот же стиль строки
    a.href = lgAnchorEl.getAttribute("href") || "#";

    const label = document.createElement("div");
    label.className = CLS.itemLabel;
    label.textContent = (lgAnchorEl.textContent || "").trim();

    const chev = icons.chevron("right"); // визуальная стрелка внутри ссылки

    a.appendChild(label);
    a.appendChild(chev);
    rowLi.appendChild(a);
    innerUl.appendChild(rowLi);
    li.appendChild(innerUl);
    return li;
  }

  // раскрывалка управляется ТОЛЬКО стрелкой
  function createFullRowExpander(anchorEl, makeHiddenNodes) {
    const href = (anchorEl.getAttribute("href") || "").trim();
    const li = document.createElement("li");

    const row = document.createElement("div");
    row.className = CLS.item;

    const labelLink = document.createElement("a");
    labelLink.className = CLS.itemLabel;
    if (href) labelLink.href = href;
    else {
      labelLink.setAttribute("role", "link");
      labelLink.setAttribute("tabindex", "0");
    }
    labelLink.innerHTML = anchorEl.innerHTML || (anchorEl.textContent || "").trim();
    row.appendChild(labelLink);

    const chevron = icons.chevron("down");
    chevron.setAttribute("role", "button");
    chevron.setAttribute("tabindex", "0");
    chevron.style.padding = "8px";
    row.appendChild(chevron);

    let isAnimating = false;
    let wrap = null;

    const isCurrentlyOpen = () =>
      !!(wrap && wrap.isConnected && wrap.classList.contains("is-open"));

    const openAnim = () => {
      if (isAnimating) return;
      isAnimating = true;

      if (!wrap) {
        wrap = document.createElement("ul");
        wrap.className = `${CLS.list} ${CLS.listCollapsible}`;
        li.appendChild(wrap);
      } else if (!wrap.isConnected) {
        li.appendChild(wrap);
      }

      const nodes = (makeHiddenNodes && makeHiddenNodes()) || [];
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

    const toggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isAnimating) return;
      if (!isCurrentlyOpen()) openAnim();
      else closeAnim();
    };
    chevron.addEventListener("click", toggle);
    chevron.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") toggle(e);
    });

    li.appendChild(row);
    return li;
  }

  function createSubmenuLi(ul) {
    const li = document.createElement("li");
    const row = document.createElement("button");
    row.className = CLS.item;

    const label = document.createElement("div");
    label.className = CLS.itemLabel;

    const header = ul.querySelector(':scope > [data-role="header"]');
    label.textContent = titleTrim(header) || "Раздел";

    const chev = icons.chevron("right");

    row.appendChild(label);
    row.appendChild(chev);
    row.addEventListener("click", () => {
      pushPanelFromUL(ul, label.textContent);
      slideForward();
    });

    li.appendChild(row);
    return li;
  }

  function slideForward() {
    const count = state.stack.length;
    if (count < 2) return;
    const incoming = state.stack[count - 1];
    incoming.classList.add(CLS.panelEnter);
    requestAnimationFrame(() => incoming.classList.add(CLS.panelActive));
  }

  function titleTrim(el) {
    return (el?.textContent || "").trim();
  }

  function cleanupOpenExpansions(scopeEl) {
    if (!scopeEl) return;
    scopeEl.querySelectorAll(`.${CLS.listCollapsible}`).forEach((el) => {
      const li = el.closest("li");
      el.remove();
      const chev = li?.querySelector(`.${CLS.chevron}`);
      if (chev) chev.style.setProperty("--mm-rot", "0deg");
    });
  }

  function cleanupAllExpansionsExcept(exceptPanel) {
    state.stack.forEach((panel) => {
      if (panel !== exceptPanel) cleanupOpenExpansions(panel);
    });
  }

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
    setTimeout(() => {
      if (done) return;
      try {
        panel.removeEventListener("transitionend", onEnd);
      } catch {}
      cb();
    }, 500);
  }
}
