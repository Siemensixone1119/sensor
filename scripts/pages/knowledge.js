document.addEventListener('click', (e) => {
  let item = e.target.closest('.faq__item');
  if (!item) return;

  item = item.closest('.faq__item');
  if (!item) return;

  item.classList.toggle('is-open');
});
