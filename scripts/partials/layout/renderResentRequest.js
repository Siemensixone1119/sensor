// renderResentRequest.js
export function renderResentRequest(result, history, rerender = false, baseUrl = "/search") {
  if (!result) return;
  const wrap = result.querySelector(".search__recent");
  const body = wrap?.querySelector(".search__recent-body");
  if (!wrap || !body) return;

  if (rerender) body.innerHTML = "";

  if (!history?.length) {
    body.innerHTML = "";
    return;
  }

  body.innerHTML = "";
  history.forEach(q => {
    const key  = encodeURIComponent(q);
    const href = `${baseUrl}?q=${encodeURIComponent(q)}`;
    body.insertAdjacentHTML("beforeend", `
      <div class="search__recent-item">
        <a href="${href}" class="search__recent-link">${q}</a>
        <button type="button" class="search__recent-remove" data-key="${key}" aria-label="Удалить запрос">
          <svg class="search__recent-clear" aria-hidden="true" focusable="false">
            <use xlink:href="#icon-menu_close"></use>
          </svg>
        </button>
      </div>
    `);
  });
}
