export function addFieldset() {
  document.addEventListener('DOMContentLoaded', function () {
    const productContainer = document.querySelector('.appeal__fieldset-wrap');
    if (!productContainer) return;

    let productCount = 0;

    function createFieldset(count) {
      const fieldset = document.createElement('fieldset');
      fieldset.classList.add('appeal__fieldset', 'product-fieldset');
      fieldset.innerHTML = `
        <button class="appeal__button--remove" type="button">Удалить</button>
        <legend class="appeal__legend">Продукция</legend>
        <ul class="appeal__list">
          <li class="appeal__list-item">
            <label class="appeal__label required" for="product-type-${count}">Тип изделия:</label>
            <select class="appeal__select" id="product-type-${count}">
              <option value="" disabled selected>--Выберите тип прибора--</option>
              <option value="magnetic-converter">Преобразователь магнитный поплавковый</option>
              <option value="electromagnetic-valve">Клапан электромагнитный</option>
              <option value="other">Другой прибор</option>
            </select>
          </li>
          <li class="appeal__list-item">
            <label class="appeal__label required" for="manufacture-year-${count}">Год выпуска:</label>
            <input required class="appeal__input" type="number" id="manufacture-year-${count}" min="1970" max="2026" placeholder="Указан на шильде или в паспорте">
          </li>
          <li class="appeal__list-item">
            <label class="appeal__label required" for="serial-number-${count}">Заводской номер:</label>
            <input required class="appeal__input" type="text" id="serial-number-${count}" placeholder="Указан на шильде или в паспорте">
          </li>
          <li class="appeal__list-item">
            <label class="appeal__label required" for="appeal-reason-${count}">Причина обращения:</label>
            <select class="appeal__select" id="appeal-reason-${count}">
              <option value="" disabled selected>--Выберите--</option>
              <option value="consultation-setup">Нужна консультация по настройке</option>
              <option value="consultation-diagnostics">Нужна консультация по диагностике</option>
              <option value="report-failure">Сообщить о неисправности</option>
              <option value="send-for-repair">Сообщить об отправке для диагностики, обслуживания, ремонта, проверки</option>
              <option value="order-parts">Хочу заказать запчасти</option>
            </select>
          </li>
          <li class="appeal__list-item">
            <label class="appeal__label required" for="short-description-${count}">Краткое описание:</label>
            <textarea class="appeal__textarea" id="short-description-${count}"></textarea>
          </li>
        </ul>
        <button class="appeal__button--add" type="button">Добавить ещё продукт</button>
      `;
      return fieldset;
    }

    function updateButtons() {
      const allFieldsets = productContainer.querySelectorAll('.product-fieldset');

      allFieldsets.forEach((fs, index) => {
        const addBtn = fs.querySelector('.appeal__button--add');
        const removeBtn = fs.querySelector('.appeal__button--remove');

        if (addBtn) addBtn.style.display = (index === allFieldsets.length - 1) ? 'inline-block' : 'none';
        if (removeBtn) removeBtn.style.display = (allFieldsets.length > 1) ? 'inline-block' : 'none';
      });

      productCount = allFieldsets.length;
    }

    // Создаём первую карточку при загрузке страницы
    const firstFieldset = createFieldset(1);
    productContainer.appendChild(firstFieldset);
    updateButtons();

    productContainer.addEventListener('click', function (e) {
      if (e.target.classList.contains('appeal__button--add')) {
        const newFieldset = createFieldset(productCount + 1);
        productContainer.appendChild(newFieldset);
        updateButtons();
      }

      if (e.target.classList.contains('appeal__button--remove')) {
        const fs = e.target.closest('.product-fieldset');
        if (!fs) return;
        fs.remove();
        updateButtons();
      }
    });
  });

}