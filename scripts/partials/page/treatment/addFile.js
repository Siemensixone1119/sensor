export function addFile() {
  const fileInput = document.querySelector('.appeal__input-file');
  const filesBox = document.querySelector('.appeal__files');
  const filesList = document.querySelector('.appeal__files-list');
  const errorBox = document.querySelector('.appeal__files-error');

  const MAX_FILES = 20;
  const MAX_SIZE = 20 * 1024 * 1024;
  const MAX_NAME_LENGTH = 25;
  const ALLOWED_EXT = [
    'zip', 'pdf', 'rar', 'exe',
    'xlsx', 'docx', 'xls', 'doc',
    'jpg', 'jpeg', 'bmp', 'png', 'gif',
    'rtf', 'tsu'
  ];

  let storedFiles = [];

  errorBox.style.display = 'none';

  fileInput.addEventListener('change', () => {
    const newFiles = Array.from(fileInput.files);

    for (const file of newFiles) {
      const ext = file.name.split('.').pop().toLowerCase();

      if (!ALLOWED_EXT.includes(ext)) {
        showError(`Формат .${ext} запрещён`);
        resetInput();
        return;
      }

      if (file.size > MAX_SIZE) {
        showError(`Файл ${file.name} больше 20 МБ`);
        resetInput();
        return;
      }

      if (storedFiles.length + newFiles.length > MAX_FILES) {
        showError(`Можно прикрепить максимум ${MAX_FILES} файлов`);
        return resetInput();
      }
    }

    storedFiles.push(...newFiles);
    renderFiles();
    resetInput();
  });

  function renderFiles() {
    filesList.innerHTML = '';
    errorBox.style.display = 'none';

    storedFiles.forEach((file, index) => {
      let displayName = file.name;
      if (displayName.length > MAX_NAME_LENGTH) {
        const ext = displayName.split('.').pop();
        displayName = displayName.substring(0, MAX_NAME_LENGTH - ext.length - 3) + '...' + ext;
      }

      const li = document.createElement('li');
      li.className = 'appeal__files-item';
      li.innerHTML = `
        <div class="appeal__files-row">
          <div class="appeal__files-name">${displayName}</div>
          <div class="appeal__files-remove" data-index="${index}">
            <svg class="appeal__files-remove-icon">
              <use xlink:href="#icon-menu_close"></use>
            </svg>
          </div>
        </div>
      `;
      filesList.appendChild(li);
    });
  }

  filesList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.appeal__files-remove');
    if (!removeBtn) return;

    const index = Number(removeBtn.dataset.index);
    storedFiles.splice(index, 1);
    renderFiles();
  });

  function showError(text) {
    errorBox.textContent = text;
    errorBox.style.display = 'block';
  }

  function resetInput() {
    fileInput.value = '';
  }
}
