import { renderResentRequest } from "./renderResentRequest.js";

export function search() {
  // базовая ссылка
    const BASE_URL = "https://www.nppsensor.ru/search";
  // ссылки на элементы
  const form = document.querySelector(".search form");
  const input = form.querySelector("input");
  const result = document.querySelector(".search__result");

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

  // рендер недавних запросов
  renderResentRequest(result, recentRequest, true);
}
