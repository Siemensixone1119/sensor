import { renderResentRequest } from "./renderResentRequest.js";

export function search() {
  const BASE_URL = "https://www.nppsensor.ru/search";

  const root   = document.querySelector(".search");
  if (!root) return;

  const form   = root.querySelector("form");
  const input  = root.querySelector(".search__input");
  const result = root.querySelector(".search__result");
  const list   = result?.querySelector(".search__result-list");
  if (!form || !input || !result || !list) return;

  const LS_KEY  = "searchHistory";
  const OLD_KEY = "recent_request";

  const normalize = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map(x => (typeof x === "string" ? x : x?.request))
      .filter(s => typeof s === "string")
      .map(s => s.trim())
      .filter(Boolean);

  (function migrate() {
    const oldRaw = localStorage.getItem(OLD_KEY);
    if (!oldRaw) return;
    try {
      const current = normalize(JSON.parse(localStorage.getItem(LS_KEY) || "[]"));
      const legacy  = normalize(JSON.parse(oldRaw));
      const combined = [...legacy, ...current];
      const dedup = combined.filter((q, i) => combined.lastIndexOf(q) === i).slice(-5);
      if (dedup.length) localStorage.setItem(LS_KEY, JSON.stringify(dedup));
    } catch {}
    localStorage.removeItem(OLD_KEY);
  })();

  const readHistory  = () => normalize(JSON.parse(localStorage.getItem(LS_KEY) || "[]"));
  const writeHistory = (arr) => {
    const uniq = Array.from(new Set(arr.filter(s => typeof s === "string" && s.trim())));
    if (uniq.length) localStorage.setItem(LS_KEY, JSON.stringify(uniq.slice(-5)));
    else localStorage.removeItem(LS_KEY);
    window.dispatchEvent(new CustomEvent("recent:updated"));
  };
  const addToHistory    = (q) => writeHistory([...readHistory().filter(x => x !== q), q]);
  const removeFromHist  = (q) => writeHistory(readHistory().filter(x => x !== q));

  let currentCtrl   = null;
  let fetchTimer    = null;
  let isSubmitting  = false;
  let activeFetches = 0;
  let lastIssued    = 0;
  let latestToken   = 0;
  const nextToken   = () => (++lastIssued);

  let ui = { hasText: false, hint: false, history: false, loading: false, results: false };
  const applyClasses = () => {
    root.classList.toggle("search--has-text", ui.hasText);
    root.classList.toggle("search--hint", ui.hint);
    root.classList.toggle("search--history", ui.history);
    root.classList.toggle("search--loading", ui.loading);
    root.classList.toggle("search--results", ui.results);
  };
  const setState = (patch) => { ui = { ...ui, ...patch }; applyClasses(); };

  const abortCurrent = () => { if (currentCtrl) { currentCtrl.abort(); currentCtrl = null; } };
  const cancelPendingFetch = () => { if (fetchTimer) { clearTimeout(fetchTimer); fetchTimer = null; } };

  const showLoader = () => { activeFetches++; setState({ loading: true }); };
  const hideLoaderMaybe = () => {
    activeFetches = Math.max(0, activeFetches - 1);
    if (activeFetches === 0) setState({ loading: false });
  };

  const queueFetch = (query) => {
    if (isSubmitting) return;
    cancelPendingFetch();
    fetchTimer = setTimeout(() => {
      fetchTimer = null;
      if (isSubmitting) return;

      const now = input.value.trim();
      if (now.length < 2 || now !== query) return;

      abortCurrent();
      const token = nextToken();
      latestToken = token;

      currentCtrl = new AbortController();
      showLoader();

      fetch(`${BASE_URL}?qs=${encodeURIComponent(query)}`, { signal: currentCtrl.signal })
        .then(r => r.text())
        .then(html => {
          if (isSubmitting || currentCtrl?.signal.aborted || token !== latestToken) return;
          list.replaceChildren();
          list.insertAdjacentHTML("afterbegin", html);
        })
        .catch(err => { if (err.name !== "AbortError") console.log("Bad request", err); })
        .finally(() => {
          if (token === latestToken) currentCtrl = null;
          hideLoaderMaybe();
        });
    }, 500);
  };

  const applyUIForValue = () => {
    const val = input.value.trim();
    const len = val.length;

    if (len === 0) {
      cancelPendingFetch(); abortCurrent();
      renderResentRequest(result, readHistory(), true, BASE_URL);
      setState({
        hasText: false,
        hint: false,
        history: readHistory().length > 0,
        results: false,
        loading: activeFetches > 0,
      });
      return;
    }

    if (len === 1) {
      cancelPendingFetch(); abortCurrent();
      setState({
        hasText: true,
        hint: true,
        history: false,
        results: false,
        loading: activeFetches > 0,
      });
      return;
    }

    setState({
      hasText: true,
      hint: false,
      history: false,
      results: true,
      loading: activeFetches > 0,
    });
    queueFetch(val);
  };

  input.addEventListener("input", applyUIForValue);

  root.addEventListener("click", (e) => {
    const clearBtn = e.target.closest(".search__clear-btn");
    if (clearBtn) {
      input.value = "";
      applyUIForValue();
      input.focus();
      return;
    }

    const rm = e.target.closest(".search__recent-remove");
    if (rm && result.contains(rm)) {
      const key = rm.dataset.key;
      if (!key) return;
      const decoded = decodeURIComponent(key);
      removeFromHist(decoded);
      renderResentRequest(result, readHistory(), true, BASE_URL);
      if (input.value.trim().length === 0) {
        setState({ history: readHistory().length > 0, results: false });
      }
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (val.length < 2) {
      setState({ hasText: !!val, hint: true, history: false, results: false });
      return;
    }

    isSubmitting = true;
    cancelPendingFetch();
    abortCurrent();
    activeFetches = 0;
    setState({ loading: false, history: false, hint: false, results: true });

    addToHistory(val);
    window.location.href = `${BASE_URL}?q=${encodeURIComponent(val)}`;
  });

  window.addEventListener("pageshow", (ev) => {
    if (ev.persisted) {
      isSubmitting = false;
      applyUIForValue();
    }
  });

  window.addEventListener("beforeunload", () => {
    isSubmitting = true; cancelPendingFetch(); abortCurrent();
  });

  const rerenderHistoryIfEmptyInput = () => {
    if (input.value.trim().length === 0) {
      renderResentRequest(result, readHistory(), true, BASE_URL);
      setState({
        hasText: false,
        hint: false,
        history: readHistory().length > 0,
        results: false,
        loading: activeFetches > 0,
      });
    }
  };
  window.addEventListener("storage", (ev) => { if (ev.key === LS_KEY) rerenderHistoryIfEmptyInput(); });
  window.addEventListener("recent:updated", rerenderHistoryIfEmptyInput);

  // init
  applyUIForValue();
}
