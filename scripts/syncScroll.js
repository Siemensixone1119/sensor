export function syncScroll() {
  document.addEventListener("DOMContentLoaded", () => {
    const headerScroll = document.querySelector(".compare__row--header");
    const bodyScroll = document.querySelector(".compare__scroll");

    let isSyncingHeader = false;
    let isSyncingBody = false;

    headerScroll.addEventListener("scroll", () => {
      if (!isSyncingHeader) {
        isSyncingBody = true;
        bodyScroll.scrollLeft = headerScroll.scrollLeft;
      }
      isSyncingHeader = false;
    });

    bodyScroll.addEventListener("scroll", () => {
      if (!isSyncingBody) {
        isSyncingHeader = true;
        headerScroll.scrollLeft = bodyScroll.scrollLeft;
      }
      isSyncingBody = false;
    });
    console.log(1);
  });
}
