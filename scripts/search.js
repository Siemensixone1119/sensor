import { renderResentRequest } from "./renderResentRequest.js";

export function search() {
  // базовая ссылка
  const BASE_URL = "https://www.nppsensor.ru/search";
  // ссылки на элементы
  const form = document.querySelector(".search form");
  const input = form.querySelector("input");
  const result = document.querySelector(".search__result");
  const resultList = result.querySelector(".search__result-list");
  const clearBtn = document.querySelector(".search__clear-btn");
  const loader = document.querySelector(".search__loader");

  // debounce, чтобы не нагружать импортирую сторонии библиотеки
  function debounce(fn, delay = 500) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // при вводе
  input.addEventListener(
    "input",
    debounce(() => {
      const inputValue = input.value.trim();

      if (inputValue.length >= 2) {
        result.innerHTML = "";
        fetch(`${BASE_URL}?qs=${encodeURIComponent(inputValue)}`)
          .then((response) => response.text())
          .then((resultHTML) => {
            clearBtn.classList.add("is-hidden");
            loader.classList.remove("is-hidden");
            resultList.innerHTML = "";
            resultList.insertAdjacentHTML("beforeend", resultHTML);
          })
          .catch(() => console.log("Bad request"))
          .finally(() => {
            clearBtn.classList.remove("is-hidden");
            loader.classList.add("is-hidden");
          });
      } else if (inputValue.length === 1) {
        result.innerHTML = "";
        document.createElement("span");
        result.insertAdjacentHTML(
          "beforeend",
          `
            <span class="search__recent-text">Введите минимум 2 символа</span>
          `
        );
      } else {
        resultList.innerHTML = "";
        renderResentRequest(result, recentRequest, true);
      }
    }, 500)
  );

  // получение массива последних запросов
  let recentRequest = JSON.parse(localStorage.getItem("recent_request")) || [];

  // при сабмите
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputValue = input.value.trim();
    if (!inputValue) return;

    // чтобы не было повторов в массиве
    recentRequest = recentRequest.filter((item) => item.request !== inputValue);
    // добавление в массив
    recentRequest.push({
      request: inputValue,
      url: `${BASE_URL}?q=${encodeURIComponent(inputValue)}`,
    });

    // чтобы не более 5
    if (recentRequest.length > 5) recentRequest.shift();

    // запись в локал стордж
    localStorage.setItem("recent_request", JSON.stringify(recentRequest));

    // редирект
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
}
