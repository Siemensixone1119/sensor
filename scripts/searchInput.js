import refs from "./domRefs.js";

export function setupSearchToggle() {
  refs.fakeSearch.addEventListener("click", () => {
    refs.search.classList.remove("no-transition");
    refs.search.classList.remove("search--closing");
    refs.search.classList.add("search--open");
    document.body.classList.add("no-scroll");
    setTimeout(() => refs.search.querySelector("input").focus(), 200);
  });

  refs.backInputBtn.addEventListener("click", () => {
    refs.search.classList.remove("search--open");
    refs.search.classList.add("search--closing");
    document.body.classList.remove("no-scroll");
    refs.search.addEventListener("transitionend", function handler(e) {
      if (e.propertyName === "transform") {
        refs.search.classList.add("no-transition");
        refs.search.classList.remove("search--closing");
        refs.search.removeEventListener("transitionend", handler);
      }
    });
  });

  refs.saerchInput.addEventListener("input", () => {
    if (refs.saerchInput.value !== "") {
      refs.dropInputbtn.classList.add("search__drop--visible");
    } else {
      refs.dropInputbtn.classList.remove("search__drop--visible");
    }
  });

  refs.dropInputbtn.addEventListener("click", () => {
    refs.saerchInput.value = "";
    refs.dropInputbtn.classList.remove("search__drop--visible");
  });
}
