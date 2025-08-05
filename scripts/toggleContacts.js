import refs from "./domRefs.js";

export function setupToggleContacts() {
  refs.openContactBtn.addEventListener("click", () => {
    refs.contacts.classList.add("contacts--visible");
    document.body.classList.add("no-scroll");
  });

  refs.closeContactBtn.addEventListener("click", () => {
    refs.contacts.classList.remove("contacts--visible");
    document.body.classList.remove("no-scroll");
  })
}
