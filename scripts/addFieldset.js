export function addFieldset() {
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.appeal__form');
    const addProductButton = document.querySelector('.appeal__button--add');
    const productContainer = document.querySelector('.appeal__fieldset-wrap');

    let productCount = 1;

    if (!productContainer) {
      console.error('Контейнер для продуктов не найден');
      return;
    }

    addProductButton.addEventListener('click', function () {
      productCount++;

      const newFieldset = document.createElement('fieldset');
      newFieldset.classList.add('appeal__fieldset', 'product-fieldset');

      newFieldset.innerHTML = `
        <button class="appeal__button--remove" type="button">Удалить</button>
        <legend class="appeal__legend">Продукция</legend>
        <ul class="appeal__list">
          <li class="appeal__list-item">
            <label class="appeal__label" for="product-type-${productCount}">Тип изделия:</label>
            <select class="appeal__select" id="product-type-${productCount}">
              <option value="" disabled selected>--Выберите тип прибора--</option>
              <option value="magnetic-converter">Преобразователь магнитный поплавковый</option>
              <option value="electromagnetic-valve">Клапан электромагнитный</option>
              <option value="other">Другой прибор</option>
            </select>
          </li>
          <li class="appeal__list-item">
            <label class="appeal__label" for="manufacture-year-${productCount}">Год выпуска:</label>
            <input required class="appeal__input" type="number" id="manufacture-year-${productCount}" min="1970" max="2026" placeholder="Указан на шильде или в паспорте">
          </li>
          <li class="appeal__list-item">
            <label class="appeal__label" for="serial-number-${productCount}">Заводской номер:</label>
            <input required class="appeal__input" type="text" id="serial-number-${productCount}" placeholder="Указан на шильде или в паспорте">
          </li>
          <li class="appeal__list-item">
            <label class="appeal__label" for="appeal-reason-${productCount}">Причина обращения:</label>
            <select class="appeal__select" id="appeal-reason-${productCount}">
              <option value="" disabled selected>--Выберите--</option>
              <option value="consultation-setup">Нужна консультация по настройке</option>
              <option value="consultation-diagnostics">Нужна консультация по диагностике</option>
              <option value="report-failure">Сообщить о неисправности</option>
              <option value="send-for-repair">Сообщить об отправке для диагностики, обслуживания, ремонта, проверки</option>
              <option value="order-parts">Хочу заказать запчасти</option>
            </select>
          </li>
          <li class="appeal__list-item">
            <label class="appeal__label" for="short-description-${productCount}">Краткое описание:</label>
            <textarea class="appeal__textarea" id="short-description-${productCount}"></textarea>
          </li>
        </ul>
        <button class="appeal__button--remove" type="button">Удалить</button>
      `;

      productContainer.appendChild(newFieldset);
      newFieldset.querySelector('.appeal__button--remove').style.display = 'inline-block';
    });

    productContainer.addEventListener('click', function (event) {
      if (event.target && event.target.classList.contains('appeal__button--remove')) {
        const fieldsetToRemove = event.target.closest('.product-fieldset');
        if (fieldsetToRemove) {
          fieldsetToRemove.remove();
          productCount--;
        }

        if (productCount === 1) {
          const removeBtn = productContainer.querySelector('.appeal__button--remove');
          if (removeBtn) removeBtn.style.display = 'none';
        }
      }
    });
  });
}
