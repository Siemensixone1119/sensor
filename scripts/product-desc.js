// export function hideDesk() {
//   const desc = document.querySelector(".description");
//   const toggleBtn = document.querySelector(".description__toggle");

//   toggleBtn.addEventListener("click", () => {
//     desc.classList.toggle("expanded");
//     toggleBtn.textContent = desc.classList.contains("expanded")
//       ? "Свернуть"
//       : "Развернуть";
//   });
// }

export function hideTitle() {
  const title = document.querySelector(".product__title--main");

  title.addEventListener("click", () => {
    title.classList.toggle("expanded");
  });
}
