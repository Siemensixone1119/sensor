document.addEventListener('DOMContentLoaded', () => {
  const openBtn  = document.querySelector('[data-appointment="open"]');
  const closeBtn = document.querySelector('[data-appointment="close"]');

  const getSections = () => document.querySelectorAll('.openable-section__control');

  const setAll = (value) => {
    getSections().forEach((section) => {
      section.checked = value;
      section.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

  const isAllOpen = () => {
    const sections = Array.from(getSections());
    return sections.length > 0 && sections.every(s => s.checked);
  };

  if (openBtn && closeBtn) {
    openBtn.addEventListener('click', () => setAll(true));
    closeBtn.addEventListener('click', () => setAll(false));
    return;
  }

  if (openBtn && !closeBtn) {
    const syncText = () => {
      openBtn.textContent = isAllOpen() ? 'свернуть все' : 'развернуть все';
    };

    syncText();

    openBtn.addEventListener('click', () => {
      setAll(!isAllOpen());
      syncText();
    });

    document.addEventListener('change', (e) => {
      if (e.target.matches('.openable-section__control')) syncText();
    });
  }
});