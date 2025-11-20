import { renderResentRequest } from "./renderResentRequest.js";

export function search() {
  const BASE_URL = "https://www.nppsensor.ru/search";

  const search = document.querySelector(".search");
  if (!search) return;

  const form = search.querySelector("form");
  const input = search.querySelector(".search__input");
  const result = search.querySelector(".search__result");
  const list = result?.querySelector(".search__result-list");
  if (!form || !input || !result || !list) return;

  const LS_KEY = "searchHistory";
  const OLD_KEY = "recent_request";

  const normalize = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((x) => (typeof x === "string" ? x : x?.request))
      .filter((s) => typeof s === "string")
      .map((s) => s.trim())
      .filter(Boolean);

  (function migrate() {
    const oldRaw = localStorage.getItem(OLD_KEY);
    if (!oldRaw) return;
    try {
      const current = normalize(JSON.parse(localStorage.getItem(LS_KEY) || "[]"));
      const legacy = normalize(JSON.parse(oldRaw));
      const combined = [...legacy, ...current];
      const dedup = combined
        .filter((q, i) => combined.lastIndexOf(q) === i)
        .slice(-5);
      if (dedup.length) localStorage.setItem(LS_KEY, JSON.stringify(dedup));
    } catch {}
    localStorage.removeItem(OLD_KEY);
  })();

  const readHistory = () =>
    normalize(JSON.parse(localStorage.getItem(LS_KEY) || "[]"));

  const writeHistory = (arr) => {
    const uniq = Array.from(new Set(arr.filter((s) => s.trim())));
    if (uniq.length)
      localStorage.setItem(LS_KEY, JSON.stringify(uniq.slice(-5)));
    else localStorage.removeItem(LS_KEY);

    window.dispatchEvent(new CustomEvent("recent:updated"));
  };

  const addToHistory = (q) =>
    writeHistory([...readHistory().filter((x) => x !== q), q]);

  const removeFromHist = (q) =>
    writeHistory(readHistory().filter((x) => x !== q));

  let currentCtrl = null;
  let fetchTimer = null;
  let isSubmitting = false;
  let activeFetches = 0;
  let lastIssued = 0;
  let latestToken = 0;
  let renderedQuery = "";

  const nextToken = () => ++lastIssued;

  let ui = {
    hasText: false,
    hint: false,
    history: false,
    loading: false,
    results: false,
    empty: false,
  };

  const applyClasses = () => {
    search.classList.toggle("search--has-text", ui.hasText);
    search.classList.toggle("search--hint", ui.hint);
    search.classList.toggle("search--history", ui.history);
    search.classList.toggle("search--loading", ui.loading);
    search.classList.toggle("search--results", ui.results);
    search.classList.toggle("search--empty", ui.empty);
  };

  const setState = (patch) => {
    ui = { ...ui, ...patch };
    applyClasses();
  };

  const abortCurrent = () => {
    if (currentCtrl) {
      currentCtrl.abort();
      currentCtrl = null;
    }
  };

  const cancelPendingFetch = () => {
    if (fetchTimer) {
      clearTimeout(fetchTimer);
      fetchTimer = null;
    }
  };

  const showLoader = () => {
    activeFetches++;
    setState({ loading: true });
  };

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

      fetch(`${BASE_URL}?qs=${encodeURIComponent(query)}`, {
        signal: currentCtrl.signal,
      })
        .then((r) => r.text())
        .then((html) => {
          if (
            isSubmitting ||
            currentCtrl?.signal.aborted ||
            token !== latestToken
          )
            return;

          list.replaceChildren();
          list.insertAdjacentHTML("afterbegin", html);

          const now2 = input.value.trim();
          renderedQuery = now2;
          setState({ results: true, history: false });
        })
        .catch((err) => {
          if (err.name !== "AbortError") console.log("Bad request", err);
        })
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
      renderedQuery = "";
      cancelPendingFetch();
      abortCurrent();
      list.replaceChildren();
      const hist = readHistory();
      renderResentRequest(result, hist, true, BASE_URL);
      setState({
        hasText: false,
        hint: false,
        history: hist.length > 0,
        results: false,
        loading: activeFetches > 0,
        empty: true,
      });
      return;
    }

    if (len === 1) {
      renderedQuery = "";
      cancelPendingFetch();
      abortCurrent();
      list.replaceChildren();
      setState({
        hasText: true,
        hint: true,
        history: false,
        results: false,
        loading: activeFetches > 0,
        empty: false,
      });
      return;
    }

    setState({
      hasText: true,
      hint: false,
      history: false,
      results: true,
      loading: activeFetches > 0,
      empty: false,
    });
    queueFetch(val);
  };

  input.addEventListener("input", applyUIForValue);

  search.addEventListener("click", (e) => {
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
      const hist = readHistory();
      renderResentRequest(result, hist, true, BASE_URL);
      if (input.value.trim().length === 0) {
        setState({ history: hist.length > 0, results: false, empty: true });
      }
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (val.length < 2) {
      setState({
        hasText: !!val,
        hint: true,
        history: false,
        results: false,
        empty: false,
      });
      return;
    }

    isSubmitting = true;
    cancelPendingFetch();
    abortCurrent();
    activeFetches = 0;
    setState({
      loading: false,
      history: false,
      hint: false,
      results: true,
      empty: false,
    });

    addToHistory(val);
    window.location.href = `${BASE_URL}?q=${encodeURIComponent(val)}`;
  });

  window.addEventListener("pageshow", (ev) => {
    if (ev.persisted) {
      isSubmitting = false;
      const val = input.value.trim();
      renderedQuery = val.length >= 2 ? val : "";
      applyUIForValue();
    }
  });

  
  window.addEventListener("search:close", () => {
    cancelPendingFetch();
    abortCurrent();
    isSubmitting = false;
    activeFetches = 0;
    renderedQuery = "";
  });

  
  window.addEventListener("search:closed-final", () => {
    list.replaceChildren();
    setState({ loading: false, results: false });
  });

  window.addEventListener("beforeunload", () => {
    isSubmitting = true;
    cancelPendingFetch();
    abortCurrent();
  });

  const rerenderHistoryIfEmptyInput = () => {
    if (input.value.trim().length === 0) {
      renderedQuery = "";
      list.replaceChildren();
      const hist = readHistory();
      renderResentRequest(result, hist, true, BASE_URL);
      setState({
        hasText: false,
        hint: false,
        history: hist.length > 0,
        results: false,
        loading: activeFetches > 0,
        empty: true,
      });
    }
  };

  window.addEventListener("storage", (ev) => {
    if (ev.key === LS_KEY) rerenderHistoryIfEmptyInput();
  });

  window.addEventListener("recent:updated", rerenderHistoryIfEmptyInput);

  applyUIForValue();
}
