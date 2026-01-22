const form = document.querySelector('.appeal-status__form');
const appealNumberInput = document.getElementById('appeal-number');
const innInput = document.getElementById('appeal-inn');
const errorBox = document.querySelector('.appeal-status__error');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const appealNumber = appealNumberInput.value.trim();
  const inn = innInput.value.trim();
  let errorMessage = '';

  const appealNumberPattern = /^P\d{2}-\d{3}$/;
  if (!appealNumberPattern.test(appealNumber)) {
    errorMessage += 'Номер обращения должен быть в формате PXX-XXX. ';
  }

  const innPattern = /^\d{10}$/;
  if (!innPattern.test(inn)) {
    errorMessage += 'ИНН должен содержать 10 цифр.';
  }

  if (errorMessage) {
    errorBox.textContent = errorMessage;
    errorBox.style.display = 'block';
    return;
  }

  errorBox.style.display = 'none';
})