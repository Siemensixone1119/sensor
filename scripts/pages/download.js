document.addEventListener('DOMContentLoaded', () => {
  const openAllBtn = document.querySelector('[data-appointment="open"]');
  const closeAllBtn = document.querySelector('[data-appointment="close"]');

  const showArchiveCb = document.querySelector('[data-appointment="arhive_yes"]')
  const showNowCb = document.querySelector('[data-appointment="arhive_no"]');

  const emptyBox = document.querySelector('[data-certificates-empty]');

  const nowCertificates = document.querySelectorAll('.old_certeficate_no');
  const archiveCertificates = document.querySelectorAll('.old_certeficate_yes')

  const setHidden = (nodes, hidden) => {
    nodes.forEach((node) => node.classList.toggle('is-hidden', hidden));
  };

  const updateSectionsVisibility = () => {
    const sections = document.querySelectorAll('.openable-section');
    let anyVisibleSection = false;

    sections.forEach((section) => {
      const items = section.querySelectorAll('.files-list__item');
      const hasVisibleItem = Array.from(items).some((item) => !item.classList.contains('is-hidden'));

      section.classList.toggle('is-hidden', !hasVisibleItem);

      if (hasVisibleItem) anyVisibleSection = true;
    });

    if (emptyBox) {
      emptyBox.classList.toggle('is-hidden', anyVisibleSection);
    }
  };

  const applyFilters = () => {
    const showNow = !!showNowCb?.checked;
    const showArchive = !!showArchiveCb?.checked;

    setHidden(nowCertificates, !showNow);
    setHidden(archiveCertificates, !showArchive);

    updateSectionsVisibility();
  };

  applyFilters();

  showNowCb?.addEventListener('change', applyFilters);
  showArchiveCb?.addEventListener('change', applyFilters);

  openAllBtn?.addEventListener('click', () => {
    document.querySelectorAll('.openable-section:not(.is-hidden) .openable-section__control')
      .forEach((s) => (s.checked = true));
  });

  closeAllBtn?.addEventListener('click', () => {
    document.querySelectorAll('.openable-section:not(.is-hidden) .openable-section__control')
      .forEach((s) => (s.checked = false));
  });
});