export function addFieldset() {
  document.addEventListener('DOMContentLoaded', function () {
    const productContainer = document.querySelector('.fieldset-wrap');
    if (!productContainer) return;

    const templateFieldset = productContainer.querySelector('.fieldset');
    if (!templateFieldset) return;

    function getNextIndex() {
      const all = productContainer.querySelectorAll('.fieldset');
      let max = 0;
      all.forEach((fs) => {
        const n = Number(fs.dataset.productIndex || 0);
        if (n > max) max = n;
      });
      return max + 1;
    }

    function updateButtons() {
      const allFieldsets = productContainer.querySelectorAll('.fieldset');

      allFieldsets.forEach((fs, index) => {
        const addBtn = fs.querySelector('.fieldset__button--add');
        const removeBtn = fs.querySelector('.fieldset__button--remove');

        if (addBtn) addBtn.style.display = (index === allFieldsets.length - 1) ? 'inline-block' : 'none';
        if (removeBtn) removeBtn.style.display = (allFieldsets.length > 1) ? 'inline-block' : 'none';
      });
    }

    function renumberFieldset(fs, index) {
      fs.dataset.productIndex = String(index);

      const elements = fs.querySelectorAll('[id], label[for], [name]');

      elements.forEach((el) => {
        if (el.tagName === 'LABEL' && el.hasAttribute('for')) {
          const oldFor = el.getAttribute('for');
          el.setAttribute('for', oldFor.replace(/-\d+$/, `-${index}`));
        }

        if (el.hasAttribute('id')) {
          const oldId = el.getAttribute('id');
          el.setAttribute('id', oldId.replace(/-\d+$/, `-${index}`));
        }

        if (el.hasAttribute('name')) {
          const oldName = el.getAttribute('name');
          el.setAttribute('name', oldName.replace(/products\[\d+\]/, `products[${index}]`));
        }
      });
    }

    function cloneFieldset() {
      const nextIndex = getNextIndex();

      const clone = templateFieldset.cloneNode(true);

      clone.querySelectorAll('input, textarea, select').forEach((control) => {
        if (control.tagName === 'SELECT') {
          control.selectedIndex = 0;
        } else if (control.type === 'checkbox' || control.type === 'radio') {
          control.checked = false;
        } else {
          control.value = '';
        }
      });

      clone.querySelectorAll('.input__error').forEach((err) => (err.textContent = ''));

      renumberFieldset(clone, nextIndex);

      return clone;
    }

    renumberFieldset(templateFieldset, 1);
    updateButtons();

    productContainer.addEventListener('click', function (e) {
      const addBtn = e.target.closest('.fieldset__button--add');
      const removeBtn = e.target.closest('.fieldset__button--remove');

      if (addBtn) {
        const newFieldset = cloneFieldset();
        productContainer.appendChild(newFieldset);
        updateButtons();
        return;
      }

      if (removeBtn) {
        const fs = removeBtn.closest('.fieldset');
        if (!fs) return;
        fs.remove();
        updateButtons();
      }
    });
  });
}
