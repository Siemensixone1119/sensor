export function addFieldset() {
  document.addEventListener('DOMContentLoaded', function () {
    const productContainer = document.querySelector('.appeal__fieldset-wrap');
    if (!productContainer) return;

    let productCount = 0;

    function createFieldset(count) {
      const fieldset = document.createElement('div');
      fieldset.classList.add('appeal__fieldset', 'product-fieldset');
      fieldset.innerHTML = `
        <button class="appeal__button--remove" type="button">Удалить</button>
        
      <div class="appeal__list">
        <div class="input">
          <label class="input_label required" for="product-type-${count}">
            <span class="input__label-main">Тип изделия:</span>
          </label>
          <div class="input__content">
            <select class="select" id="product-type-${count}">
              <option value="" disabled selected>--Выберите тип прибора--</option>
              <option value="magnetic-converter">Преобразователь магнитный поплавковый</option>
              <option value="electromagnetic-valve">Клапан электромагнитный</option>
              <option value="other">Другой прибор</option>
            </select>
            <div class="input__error"></div>
          </div>
        </div>
        <div class="input">
          <label class="input_label required" for="manufacture-year-${count}">
            <span class="input__label-main">Год выпуска:</span>
          </label>
          <div class="input__content">
            <input required class="appeal__input" type="number" id="manufacture-year-${count}" min="1970" max="2026">
              <span class="input__description">Указан на шильде или в паспорте</span>
            <div class="input__error"></div>
          </div>
        </div>
        <div class="input">
          <label class="input_label required" for="serial-number-${count}">
            <span class="input__label-main">Заводской номер:</span>
          </label>
          <div class="input__content">
            <input required class="appeal__input" type="text" id="serial-number-${count}">
              <span class="input__description">Указан на шильде или в паспорте</span>
            <div class="input__error"></div>
          </div>
        </div>
        <div class="input">
          <label class="input_label required" for="appeal-reason-${count}">
            <span class="input__label-main">Причина обращения:</span>
          </label>
          <div class="input__content">
            <select class="select" id="appeal-reason-${count}">
              <option value="" disabled selected>--Выберите--</option>
              <option value="consultation-setup">Нужна консультация по настройке</option>
              <option value="consultation-diagnostics">Нужна консультация по диагностике</option>
              <option value="report-failure">Сообщить о неисправности</option>
              <option value="send-for-repair">Сообщить об отправке для диагностики, обслуживания, ремонта, проверки</option>
              <option value="order-parts">Хочу заказать запчасти</option>
            </select>
            <div class="input__error"></div>
          </div>
        </div>
        <div class="input">
          <label class="input_label required" for="short-description-${count}">
            <span class="input__label-main">Краткое описание:</span>
          </label>
          <div class="input__content">
            <textarea class="textarea" id="short-description-${count}"></textarea>
            <div class="input__error"></div>
          </div>
        </div>
      </div>

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