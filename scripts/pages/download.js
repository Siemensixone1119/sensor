document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.querySelector('[data-appointment="open"]');
  const closeBtn = document.querySelector('[data-appointment="close"]');
  const arhiveBtn = document.querySelector('[data-appointment="arhive"]');
  const sections = document.querySelectorAll('.openable-section__control');
  const oldCerteficates = document.querySelectorAll(".old_certeficate_no");

  if (oldCerteficates) {
    oldCerteficates.forEach(certeficate => {
      certeficate.style.display = "none";
    })
  }

  if (closeBtn && openBtn !== undefined) {
    openBtn.addEventListener('click', () => {
      sections.forEach((section) => {
        section.checked = true;
      });
    });

    closeBtn.addEventListener('click', () => {
      sections.forEach((section) => {
        section.checked = false;
      });
    });
  } else if (openBtn !== undefined) {
    openBtn.addEventListener('click', () => {
      if (openBtn.textContent === 'развернуть все') {
        sections.forEach((section) => {
          section.checked = true;
        });

        openBtn.innerHTML =
          '<button href="" class="downloads__filter-name" data-appointment="close">свернуть все</button>';
      } else {
        sections.forEach((section) => {
          section.checked = false;
        });

        openBtn.innerHTML =
          '<button href="" class="downloads__filter-name" data-appointment="open">резвернуть все</button>';
      }
    });
  }

  if (arhiveBtn) {
    arhiveBtn.addEventListener("click", () => {
      oldCerteficates.forEach(certeficate => {
        certeficate.style.display = "flex";
        certeficate.style.opacity = "0.65"
      })
    })
  }
});