export function heightTable() {
  document.addEventListener("DOMContentLoaded", () => {
    const features = document.querySelectorAll(".compare__feature");

    features.forEach((feature) => {
      const p = feature.querySelector("p");
      if (p) {
        const pHeight = p.offsetHeight;
        feature.style.height = pHeight + 25 + "px";
      }
    });
  });
}
