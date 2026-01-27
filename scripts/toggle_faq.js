document.addEventListener('click', (e) => {
  const title = e.target.closest('.faq__title');
  if (!title) return;

  const item = title.closest('.faq__item');
  if (!item) return;

  item.classList.toggle('is-open');
});
