export function syncScroll() {
  const initialized = new WeakSet();

  function initCompare(compare) {
    if (!compare || initialized.has(compare)) return;

    const header = compare.querySelector(".compare__header");
    const body = compare.querySelector(".compare__body");
    if (!header || !body) return;

    initialized.add(compare);

    let isSyncingHeader = false;
    let isSyncingBody = false;

    header.addEventListener("scroll", () => {
      if (isSyncingHeader) return;
      isSyncingBody = true;
      body.scrollLeft = header.scrollLeft;
      isSyncingBody = false;
    });

    body.addEventListener("scroll", () => {
      if (isSyncingBody) return;
      isSyncingHeader = true;
      header.scrollLeft = body.scrollLeft;
      isSyncingHeader = false;
    });
  }

  function initAll(root = document) {
    if (root instanceof HTMLElement && root.matches(".compare")) {
      initCompare(root);
    }
    root.querySelectorAll?.(".compare").forEach((compare) => {
      initCompare(compare);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initAll(document);
  });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches(".compare") || node.querySelector?.(".compare")) {
          initAll(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
