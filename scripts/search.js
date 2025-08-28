import { renderResentRequest } from "./renderResentRequest.js";

export function search() {
  const BASE_URL = "https://www.nppsensor.ru/search";

  const form       = document.querySelector(".search form");
  const input      = form.querySelector("input");
  const result     = document.querySelector(".search__result");
  const resultList = result.querySelector(".search__result-list");
  const clearBtn   = document.querySelector(".search__clear-btn");
  const loader     = document.querySelector(".animation_block");

  let recentRequest = JSON.parse(localStorage.getItem("recent_request")) || [];

  function debounce(fn, delay = 500) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  let currentCtrl = null;

  input.addEventListener(
    "input",
    debounce(() => {
      const inputValue  = input.value.trim();
      const inputLength = inputValue.length;

      if (inputLength >= 2) {
        result.innerHTML = "";
        resultList.innerHTML = "";

        const hint = result.querySelector(".search__hint");
        if (hint) hint.remove();
        const recent = result.querySelector(".search__recent");
        if (recent) recent.remove();

        if (currentCtrl) currentCtrl.abort();
        currentCtrl = new AbortController();

        loader.classList.remove("is-hidden");
        clearBtn.classList.add("is-hidden");

        fetch(`${BASE_URL}?qs=${encodeURIComponent(inputValue)}`, { signal: currentCtrl.signal })
          .then((response) => response.text())
          .then((resultHTML) => {
            if (currentCtrl?.signal.aborted) return;
            resultList.insertAdjacentHTML("beforeend", resultHTML);
            if (!result.contains(resultList)) {
              result.appendChild(resultList);
            }
          })
          .catch((err) => {
            if (err.name !== "AbortError") console.log("Bad request", err);
          })
          .finally(() => {
            if (!currentCtrl || currentCtrl.signal.aborted) return;
            loader.classList.add("is-hidden");
            clearBtn.classList.remove("is-hidden");
            currentCtrl = null;
          });

      } else if (inputLength === 1) {
        result.innerHTML = "";
        if (currentCtrl) { currentCtrl.abort(); currentCtrl = null; }
        resultList.innerHTML = "";

        let hint = result.querySelector(".search__hint");
        if (!hint) {
          hint = document.createElement("span");
          hint.className = "search__hint search__recent-text";
          result.appendChild(hint);
        }
        hint.textContent = "Введите минимум 2 символа";

        loader.classList.add("is-hidden");
        clearBtn.classList.remove("is-hidden");

      } else {
        result.innerHTML = "";
        if (currentCtrl) { currentCtrl.abort(); currentCtrl = null; }
        resultList.innerHTML = "";
        renderResentRequest(result, recentRequest, true);

        loader.classList.add("is-hidden");
        clearBtn.classList.remove("is-hidden");
      }
    }, 500)
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputValue = input.value.trim();
    if (!inputValue) return;

    recentRequest = recentRequest.filter((item) => item.request !== inputValue);
    recentRequest.push({
      request: inputValue,
      url: `${BASE_URL}?q=${encodeURIComponent(inputValue)}`,
    });
    if (recentRequest.length > 5) recentRequest.shift();

    localStorage.setItem("recent_request", JSON.stringify(recentRequest));

    window.location.href = `${BASE_URL}?q=${encodeURIComponent(inputValue)}`;
  });

  result.addEventListener("click", (e) => {
    const btn = e.target.closest(".search__recent-remove");
    if (!btn || !result.contains(btn)) return;

    const key = btn.dataset.key;
    if (!key) return;

    const decoded = decodeURIComponent(key);
    recentRequest = recentRequest.filter((item) => item.request !== decoded);

    localStorage.setItem("recent_request", JSON.stringify(recentRequest));
    renderResentRequest(result, recentRequest, true);
  });

  renderResentRequest(result, recentRequest, true);
}
