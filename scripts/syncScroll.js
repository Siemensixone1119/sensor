export function syncScroll() {
  document.addEventListener("DOMContentLoaded", () => {
    const headerScrolls = document.querySelectorAll(".compare__header");
    const bodyScrolls = document.querySelectorAll(".compare__body");

    let isSyncingHeader = false;
    let isSyncingBody = false;

    headerScrolls.forEach((header) => {
      header.addEventListener("scroll", () => {
        if (!isSyncingHeader) {
          isSyncingBody = true;
          bodyScrolls.forEach((body) => {
            body.scrollLeft = header.scrollLeft;
          });
        }
        isSyncingHeader = false;
      });
    });

    bodyScrolls.forEach((body) => {
      body.addEventListener("scroll", () => {
        if (!isSyncingBody) {
          isSyncingHeader = true;
          headerScrolls.forEach((header) => {
            header.scrollLeft = body.scrollLeft;
          });
        }
        isSyncingBody = false;
      });
    });
  });
}
