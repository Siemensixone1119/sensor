import refs from "./domRefs.js";

export function setupInputFocus() {
  refs.search.addEventListener("focus", () => {
    console.log();

    refs.headerTop.classList.add("is-hidden");
    refs.headerBottom.classList.remove("shifted");
    refs.searchResult.classList.remove("is-hidden");
    document.body.classList.add("no-scroll");
    refs.backInputBtn.classList.remove("is-hidden");
    refs.openBtn.classList.add("is-hidden");
    refs.cartBtn.classList.add("is-hidden");
    refs.searchIcon.classList.add("is-hidden");
    console.log(refs.searchWrap);
    refs.searchWrap.style.width = "100vw"
    
  });

  refs.backInputBtn.addEventListener("click", () => {
    document.body.classList.remove("no-scroll");
    refs.openBtn.classList.remove("is-hidden");
    refs.cartBtn.classList.remove("is-hidden");
    refs.searchIcon.classList.remove("is-hidden");
    refs.searchResult.classList.add("is-hidden");
    refs.headerTop.classList.remove("is-hidden");
    refs.headerBottom.classList.add("shifted");
    refs.search.value = ""
    refs.searchWrap.style.width = "70vw"
    refs.backInputBtn.classList.add("is-hidden")
  });
}
