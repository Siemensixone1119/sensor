export function renderResentRequest(result, recentRequest, rerender = false) {
  if (!result) return;

  // очистка старых запросов
  if (rerender) {
    const old = result.querySelector(".search__recent");
    if (old) old.remove();
  }
  if (!recentRequest?.length) return;

  // создание контейнера для запросов
  const recentWrap = document.createElement("div");
  recentWrap.className = "search__recent";

  // текст в контейнере
  recentWrap.insertAdjacentHTML("beforeend", `
    <span class="search__recent-text">Вы недавно искали:</span>
  `);

  // отрисовка каждого запроса
  recentRequest.forEach(item => {
    const key = encodeURIComponent(item.request);
    recentWrap.insertAdjacentHTML("beforeend", `
      <div class="search__recent-item">
        <a href="${item.url}" class="search__recent-link">${item.request}</a>
        <button type="button" class="search__recent-remove" data-key="${key}" aria-label="Удалить запрос">
          <svg class="search__recent-clear" aria-hidden="true" focusable="false">
            <use xlink:href="#icon-menu_close"></use>
          </svg>
        </button>
      </div>
    `);
  });

  
  result.prepend(recentWrap);
}
