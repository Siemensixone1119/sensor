import { renderResentRequest } from "./renderResentRequest.js";

export function search() {
  const BASE_URL = "https://www.nppsensor.ru/search";

  // ссылки на элементы
  const search = document.querySelector(".search");
  if (!search) return;

  const form = search.querySelector("form");
  const input = search.querySelector(".search__input");
  const result = search.querySelector(".search__result");
  const list = result?.querySelector(".search__result-list");
  if (!form || !input || !result || !list) return;

  // local storage
  const LS_KEY = "searchHistory"; // текущее значение
  const OLD_KEY = "recent_request"; // старое значение

  // это чтобы все значение в хранилище были преведены к строке
  const normalize = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((x) => (typeof x === "string" ? x : x?.request))
      .filter((s) => typeof s === "string")
      .map((s) => s.trim())
      .filter(Boolean);

  // обновление записей в хранилище
  (function migrate() {
    const oldRaw = localStorage.getItem(OLD_KEY);
    if (!oldRaw) return;
    try {
      const current = normalize(
        JSON.parse(localStorage.getItem(LS_KEY) || "[]")
      );
      const legacy = normalize(JSON.parse(oldRaw));
      // добавление нового зпроса в хранилище
      const combined = [...legacy, ...current];
      // фильруем элементы в количестве 5 штук
      const dedup = combined
        .filter((q, i) => combined.lastIndexOf(q) === i)
        .slice(-5);
      if (dedup.length) localStorage.setItem(LS_KEY, JSON.stringify(dedup));
    } catch {}
    localStorage.removeItem(OLD_KEY);
  })();

  // чтение истории поиска
  const readHistory = () =>
    normalize(JSON.parse(localStorage.getItem(LS_KEY) || "[]"));

  // запись истории поиска
  const writeHistory = (arr) => {
    const uniq = Array.from(
      // только уникальные запросы
      new Set(arr.filter((s) => typeof s === "string" && s.trim()))
    );
    if (uniq.length)
      localStorage.setItem(LS_KEY, JSON.stringify(uniq.slice(-5)));
    else localStorage.removeItem(LS_KEY);

    // кастомное событие, оповещает об обновлении истории поиска
    window.dispatchEvent(new CustomEvent("recent:updated"));
  };

  // добавление в историю поиска
  const addToHistory = (q) =>
    writeHistory([...readHistory().filter((x) => x !== q), q]);

  // удаление из истории
  const removeFromHist = (q) =>
    writeHistory(readHistory().filter((x) => x !== q));

  // состояния qs
  let currentCtrl = null; // AbortController активного fetch
  let fetchTimer = null; // debounce
  let isSubmitting = false; // сабмит формы
  let activeFetches = 0; // счётчик, чтобы лоадер не мигал
  let lastIssued = 0; // токены для актуальности ответов
  let latestToken = 0;
  let renderedQuery = ""; // текст, для которого сейчас отображены быстрые результаты

  const nextToken = () => ++lastIssued;

  // флаги для классов
  let ui = {
    hasText: false,
    hint: false,
    history: false,
    loading: false,
    results: false,
    empty: false,
  };

  // модификаторы состояния css
  const applyClasses = () => {
    search.classList.toggle("search--has-text", ui.hasText);
    search.classList.toggle("search--hint", ui.hint);
    search.classList.toggle("search--history", ui.history);
    search.classList.toggle("search--loading", ui.loading);
    search.classList.toggle("search--results", ui.results);
    search.classList.toggle("search--empty", ui.empty);
  };

  // обновление нескольких флагов за раз
  const setState = (patch) => {
    ui = { ...ui, ...patch };
    applyClasses();
  };

  // отмена запроса
  const abortCurrent = () => {
    if (currentCtrl) {
      currentCtrl.abort();
      currentCtrl = null;
    }
  };

  // отмена debounce
  const cancelPendingFetch = () => {
    if (fetchTimer) {
      clearTimeout(fetchTimer);
      fetchTimer = null;
    }
  };

  // показ лоадера
  const showLoader = () => {
    activeFetches++;
    setState({ loading: true });
  };

  // скрытие лоадера
  const hideLoaderMaybe = () => {
    activeFetches = Math.max(0, activeFetches - 1);
    if (activeFetches === 0) setState({ loading: false });
  };

  // НЕ очищаем список при старте; прячем его для нового текста и показываем только на ответ
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

      // быстрый запрос
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

          // фиксируем текст, для которого показаны результаты, и включаем их видимость
          const now2 = input.value.trim();
          renderedQuery = now2;
          setState({ results: true, history: false }); // NEW: при ответе — показываем результаты и прячем историю
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

  // изменеие интерфейса в зависимости от значения в инпуте
  const applyUIForValue = () => {
    const val = input.value.trim();
    const len = val.length;

    // len = 0
    if (len === 0) {
      renderedQuery = "";
      cancelPendingFetch();
      abortCurrent();
      const hist = readHistory();
      renderResentRequest(result, hist, true, BASE_URL);
      setState({
        hasText: false,
        hint: false,
        history: hist.length > 0,
        results: false,                 // список быстрых результатов скрыт
        loading: activeFetches > 0,
        empty: true,
      });
      return;
    }

    // len = 1
    if (len === 1) {
      renderedQuery = "";
      cancelPendingFetch();
      abortCurrent();
      setState({
        hasText: true,
        hint: true,
        history: false,
        results: false,                 // список быстрых результатов скрыт
        loading: activeFetches > 0,
        empty: false,
      });
      return;
    }

    // len >= 2
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

  // делегирование
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

  // сабмит
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

  // возврат со страницы результатов
  window.addEventListener("pageshow", (ev) => {
    if (ev.persisted) {
      isSubmitting = false;
      const val = input.value.trim();
      renderedQuery = val.length >= 2 ? val : "";
      applyUIForValue();
    }
  });

  // закрытие поиска
  window.addEventListener("search:close", () => {
    if (fetchTimer) {
      clearTimeout(fetchTimer);
      fetchTimer = null;
    }
    if (currentCtrl) {
      currentCtrl.abort();
      currentCtrl = null;
    }
    isSubmitting = false;
    activeFetches = 0;
    renderedQuery = "";

    list.replaceChildren();
    setState({ loading: false, results: false }); // подсказку/историю расставит input-событие из initSearchOverlay
  });

  // подстраховка при уходе
  window.addEventListener("beforeunload", () => {
    isSubmitting = true;
    cancelPendingFetch();
    abortCurrent();
  });

  // синхронизация истории между вкладками
  const rerenderHistoryIfEmptyInput = () => {
    if (input.value.trim().length === 0) {
      renderedQuery = "";
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
