export function setupMenuHighlight() {
  document
    .querySelectorAll('.menu input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        document.querySelectorAll(".menu li").forEach((li) => {
          li.classList.remove("with-border");
        });

        document
          .querySelectorAll('.menu input[type="checkbox"]:checked')
          .forEach((cb) => {
            const currentLi = cb.closest("li");
            const nextLi = currentLi?.nextElementSibling;

            if (nextLi && nextLi.tagName === "LI") {
              nextLi.classList.add("with-border");
            }
          });
      });
    });
}
