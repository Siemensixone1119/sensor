document.addEventListener('DOMContentLoaded', () => {
  const openAllBtn = document.querySelector('[data-appointment="open"]');
  const closeAllBtn = document.querySelector('[data-appointment="close"]');

  const showArchiveCb = document.querySelector('[data-appointment="arhive_yes"]'); // Архивные
  const showNowCb = document.querySelector('[data-appointment="arhive_no"]');  // Действующие

  const sections = document.querySelectorAll('.openable-section__control');

  const nowCertificates = document.querySelectorAll('.old_certeficate_no');  // действующие
  const archiveCertificates = document.querySelectorAll('.old_certeficate_yes'); // архивные

  const setHidden = (nodes, hidden) => {
    nodes.forEach((node) => node.classList.toggle('is-hidden', hidden));
  };

  const applyFilters = () => {
    const showNow = !!showNowCb?.checked;
    const showArchive = !!showArchiveCb?.checked;

    setHidden(nowCertificates, !showNow);
    setHidden(archiveCertificates, !showArchive);
  };

  applyFilters();

  showNowCb?.addEventListener('change', applyFilters);
  showArchiveCb?.addEventListener('change', applyFilters);

  openAllBtn?.addEventListener('click', () => {
    sections.forEach((s) => (s.checked = true));
  });

  closeAllBtn?.addEventListener('click', () => {
    sections.forEach((s) => (s.checked = false));
  });
});