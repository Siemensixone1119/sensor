// UI
import { initHeaderAutoHide } from "./scripts/header-auto-hide.js";
import { initSearchOverlay } from "./scripts/search-overlay.js";
import { initContactsPanel } from "./scripts/contacts-panel.js";
import { initMessageButtonAutoHide } from "./scripts/message-button-autohide.js";
import { mountMobileMenu } from "./scripts/toggleMenu.js";
import { search } from "./scripts/search.js";
import { slider } from "./scripts/product-slider.js";
import { bgElement } from "./scripts/bcg-element.js";
import { certSlider } from "./scripts/product-slider.js";
import { hideTitle } from "./scripts/product-desc.js";
import { heightTable } from "./scripts/product-table.js";

initHeaderAutoHide();
initSearchOverlay();
initMessageButtonAutoHide();
initContactsPanel();
mountMobileMenu();
search();
slider();
bgElement();
certSlider();
// hideDesk();
hideTitle();
// heightTable();

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
