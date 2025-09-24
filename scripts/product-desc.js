export function hideDesk() {
  const desc = document.querySelector(".description");
  const toggleBtn = document.querySelector(".description__toggle");

  toggleBtn.addEventListener("click", () => {
    desc.classList.toggle("expanded");
    toggleBtn.textContent = desc.classList.contains("expanded")
      ? "Свернуть"
      : "Развернуть";
  });
}
