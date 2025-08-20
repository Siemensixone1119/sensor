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
    langBtn: `${mm}__lang-btn`,
    itemNoChevron: `${mm}__item--no-chevron`,
  };

  const state = {
    root: null,
    sheet: null,
    stackWrap: null,
    stack: [],
    sourceUl: source,
    rootProfileLi: source.querySelector(':scope > li[data-role="profile"]'),
    rootLangLi: source.querySelector(':scope > li[data-role="language-link"]'),
    adoptMap: new Map(),
  };

  function setPanelHeaderHeight(panel) {
    if (!panel) return;
    const header = panel.querySelector(`.${CLS.header}`);
    const h = header?.offsetHeight || 0;
    panel.style.setProperty("--header-height", `${h}px`);
  }
  function updateCurrentPanelHeaderHeight() {
    const current = state.stack[state.stack.length - 1];
    setPanelHeaderHeight(current);
  }
  const onResize = () => updateCurrentPanelHeaderHeight();

  function applyRootFontSizing(scopeEl, isRoot) {
    if (!isRoot || !scopeEl) return;
    if (scopeEl.classList && scopeEl.classList.contains(CLS.itemLabel)) {
      scopeEl.style.fontSize = "22px";
      scopeEl.style.lineHeight = "1.2";
    }
    scopeEl.querySelectorAll?.(".text-primary").forEach((el) => {
      el.style.fontSize = "22px";
      el.style.lineHeight = "1.2";
    });
  }

  function iconUse(symbolId, rotateDeg = 0, size, isClose = false) {
    const wrap = document.createElement("span");
    wrap.className = CLS.chevron;
    wrap.style.setProperty("--mm-rot", rotateDeg + "deg");
    if (size) wrap.style.setProperty("--mm-size", size);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",`${svgSprite}#${symbolId}`);
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
    groupChevron(size) {
      return iconUse("icon-arrow-right", 0, size);
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
    window.addEventListener("resize", onResize, { passive: true });
    updateCurrentPanelHeaderHeight();
  }

  function close() {
    if (!state.root) return;
    state.root.classList.remove(CLS.open);
    const sheet = state.sheet;
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      restoreAdoptedNodes();
      state.stack = [];
      state.root.remove();
      state.root = state.sheet = state.stackWrap = null;
      document.documentElement.classList.remove("mm-lock");
      document.body.classList.remove("mm-lock", "no-scroll");
      window.removeEventListener("resize", onResize);
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
    panel.className = CLS.panel;
    panel.style.setProperty("--mm-z", String(state.stack.length + 1));

    const header = document.createElement("div");
    header.className = CLS.header;

    const backBtn = document.createElement("button");
    backBtn.className = CLS.headerBtn;
    backBtn.appendChild(icons.chevron("left", "18px"));
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
      const pf = state.rootProfileLi?.querySelector("a.login-link");
      if (pf) {
        adoptElement(pf);
        pf.classList.add(CLS.headerBtn, `${mm}__header-login`);
        setCleanup(pf, () => pf.classList.remove(CLS.headerBtn, `${mm}__header-login`));
        header.appendChild(pf);
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

    const isRoot = state.stack.length === 0;

    const topLine = buildTopline({ includeLogin: false });
    if (isRoot && topLine) body.prepend(topLine);

    const liChildren = ul.querySelectorAll(":scope > li");
    liChildren.forEach((li) => {
      const role = li.getAttribute("data-role");
      if (role === "profile" || role === "language-link" || role === "header") return;
      const frag = renderGroup(li, isRoot);
      if (frag) rootList.appendChild(frag);
    });

    if (isRoot) {
      const lg = state.rootLangLi?.querySelector("a.language-link");
      if (lg) rootList.appendChild(createLanguageItem(lg, isRoot));
    }

    panel.appendChild(header);
    panel.appendChild(body);

    state.stackWrap.appendChild(panel);
    state.stack.push(panel);

    requestAnimationFrame(() => {
      panel.classList.add(CLS.panelEnter);
      requestAnimationFrame(() => {
        void panel.offsetWidth;
        panel.classList.add(CLS.panelActive);
        setPanelHeaderHeight(panel);
      });
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
    setTimeout(() => {
      leaving.remove();
      updateCurrentPanelHeaderHeight();
    }, 300);
  }

  function buildTopline(opts = {}) {
    const { includeLogin = true } = opts;
    const pf = includeLogin ? state.rootProfileLi?.querySelector("a.login-link") : null;
    if (!pf) return null;
    const topLine = document.createElement("div");
    topLine.className = CLS.topline;
    return topLine;
  }

  function renderGroup(li, isRoot) {
    const headerEl = li.querySelector(':scope > [data-role="header"]');
    const links = Array.from(li.querySelectorAll(":scope > a"));
    const children = Array.from(li.children).filter(
      (el) => el.getAttribute?.("data-role") !== "header"
    );

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

    if (headerEl) innerUl.appendChild(createGroupHeaderNode(headerEl));

    const showLimit = Math.max(0, visibleCount);
    const hasHidden = links.length > showLimit;

    const makeHiddenNodes = () => {
      const nodes = [];
      for (let j = showLimit; j < links.length; j++) {
        nodes.push(createLinkLi(links[j], isRoot));
      }
      return nodes;
    };

    let linkIndex = 0;
    for (const child of children) {
      if (child.tagName === "A") {
        if (showLimit === 0) { linkIndex++; continue; }
        if (hasHidden && linkIndex === showLimit - 1) {
          innerUl.appendChild(createFullRowExpander(links[linkIndex], makeHiddenNodes, isRoot));
        } else if (!hasHidden || linkIndex < showLimit) {
          innerUl.appendChild(createLinkLi(links[linkIndex], isRoot));
        }
        linkIndex++;
      } else if (child.tagName === "UL") {
        innerUl.appendChild(createSubmenuLi(child, isRoot));
      }
    }

    return groupLi;
  }

  function createGroupHeaderNode(headerEl) {
    const wrap = document.createElement("li");
    wrap.className = CLS.groupHeader;

    const link = headerEl.querySelector("a");
    if (link) {
      const { a: rowEl } = adoptAnchor(link);
      const chev = icons.groupChevron("18px");
      rowEl.appendChild(chev);
      wrap.appendChild(rowEl);
      return wrap;
    }

    const rowEl = document.createElement("div");
    rowEl.className = CLS.item;
    rowEl.setAttribute("role", "heading");
    rowEl.setAttribute("aria-level", "2");

    const label = document.createElement("div");
    label.className = CLS.itemLabel;
    label.textContent = (headerEl.textContent || "").trim();

    const chev = icons.chevron("right", "18px");
    rowEl.appendChild(label);
    rowEl.appendChild(chev);
    wrap.appendChild(rowEl);
    return wrap;
  }

  function createLinkLi(anchorEl, isRoot) {
    const li = document.createElement("li");
    const { a, label } = adoptAnchor(anchorEl);
    a.classList.add(CLS.itemNoChevron);
    a.style.paddingRight = "50px";
    applyRootFontSizing(label, isRoot);
    li.appendChild(a);
    return li;
  }

  function createLanguageItem(lgAnchorEl, isRoot) {
    const li = document.createElement("li");
    li.className = CLS.group;
    const innerUl = document.createElement("ul");
    innerUl.className = CLS.list;
    const rowLi = document.createElement("li");

    const { a, label } = adoptAnchor(lgAnchorEl);
    a.classList.add(CLS.langBtn);
    applyRootFontSizing(label, isRoot);
    const chev = icons.chevron("right", "18px");
    a.appendChild(chev);

    rowLi.appendChild(a);
    innerUl.appendChild(rowLi);
    li.appendChild(innerUl);
    return li;
  }

  function createFullRowExpander(anchorEl, makeHiddenNodes, isRoot) {
    const li = document.createElement("li");
    const { a: rowLink, label } = adoptAnchor(anchorEl);
    applyRootFontSizing(label, isRoot);

    const chevron = icons.chevron("down", "18px");
    chevron.setAttribute("role", "button");
    chevron.setAttribute("tabindex", "0");
    chevron.style.padding = "8px";
    rowLink.appendChild(chevron);
    li.appendChild(rowLink);

    let isAnimating = false;
    let wrap = null;
    const isOpen = () => !!(wrap && wrap.isConnected && wrap.classList.contains("is-open"));

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
      if (!isOpen()) openAnim();
      else closeAnim();
    };

    chevron.addEventListener("click", toggle);
    chevron.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") toggle(e);
    });

    return li;
  }

  function createSubmenuLi(ul, isRoot) {
    const li = document.createElement("li");
    const row = document.createElement("button");
    row.className = CLS.item;
    const label = document.createElement("div");
    label.className = CLS.itemLabel;
    const header = ul.querySelector(':scope > [data-role="header"]');
    label.textContent = titleTrim(header) || "Раздел";
    applyRootFontSizing(label, isRoot);
    const chev = icons.chevron("right", "18px");
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
    requestAnimationFrame(() => {
      void incoming.offsetWidth;
      incoming.classList.add(CLS.panelActive);
    });
  }

  function titleTrim(el) {
    return (el?.textContent || "").trim();
  }

  function adoptElement(el) {
    state.adoptMap.set(el, { parent: el.parentNode, next: el.nextSibling, cleanup: null });
    return el;
  }
  function setCleanup(el, fn) {
    const rec = state.adoptMap.get(el);
    if (rec) rec.cleanup = fn;
  }
  function restoreAdoptedNodes() {
    state.adoptMap.forEach((rec, node) => {
      try { rec.cleanup?.(); } catch {}
      if (!rec.parent) return;
      if (rec.next && rec.next.parentNode === rec.parent) rec.parent.insertBefore(node, rec.next);
      else rec.parent.appendChild(node);
    });
    state.adoptMap.clear();
  }

  function adoptAnchor(anchorEl) {
    adoptElement(anchorEl);
    const a = anchorEl;
    a.classList.add(CLS.item);
    let label = a.querySelector(`.${CLS.itemLabel}`);
    let createdLabel = false;
    if (!label) {
      createdLabel = true;
      label = document.createElement("div");
      label.className = CLS.itemLabel;
      while (a.firstChild) label.appendChild(a.firstChild);
      a.appendChild(label);
    }
    setCleanup(a, () => {
      if (createdLabel) {
        while (label.firstChild) a.appendChild(label.firstChild);
        label.remove();
      }
      a.classList.remove(CLS.item, CLS.itemNoChevron, CLS.langBtn, CLS.headerBtn, `${mm}__header-login`);
      a.style.removeProperty("padding-right");
    });
    return { a, label };
  }
}
