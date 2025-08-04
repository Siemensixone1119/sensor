import refs from "./domRefs.js";

export function setUpMsgBtn() {
  let scrollTimeout;
  window.addEventListener("scroll", () => {
    refs.msgBtn.classList.add("hide");
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      refs.msgBtn.classList.remove("hide");
    }, 1800);
  });
}
