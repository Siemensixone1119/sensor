import refs from "./domRefs.js";

export function setupSearchToggle() {
  refs.fakeSearch.addEventListener("click", () => {
    refs.search.classList.remove("no-transition");
    refs.search.classList.remove("search--closing");
    refs.search.classList.add("search--open");
    setTimeout(() =>  refs.search.querySelector("input").focus(), 200);
  });

  refs.backInputBtn.addEventListener("click", () => {
    refs.search.classList.remove("search--open");
    refs.search.classList.add("search--closing");
    refs.search.addEventListener("transitionend", function handler(e) {
      if (e.propertyName === "transform") {
        refs.search.classList.add("no-transition");
        refs.search.classList.remove("search--closing");
        refs.search.removeEventListener("transitionend", handler);
      }
    });
  });
}
