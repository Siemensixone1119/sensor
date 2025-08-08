// index.js
import refs from "./domRefs.js";

export function setupHeaderScroll() {
  const headerOverlayInner = document.getElementById("headerOverlayInner");

  // 1) измеряем
  const h = headerOverlayInner.offsetHeight;
  console.log(document.documentElement.style);
  
  // 2) записываем в CSS-переменную
  document.documentElement.style.setProperty("--header-inner-height", `${h}px`);
  const headerOverlay = document.getElementById("headerOverlay");

  const headerOverlaySearch = document.getElementById("headerOverlaySearch");
  const submenuStickers = document.getElementsByClassName("submenu-sticker");

  const content = document.getElementsByClassName("content");
  const headerOverlayHeight = headerOverlay.offsetHeight; //высота двух строк заголовка
  const headerOverlayInnerHeight = headerOverlayInner.offsetHeight; //высота логотипа
  let lastScrollTop = window.scrollY;
  let offset = headerOverlayInnerHeight;

  for (const el of content) el.style.marginTop = `${headerOverlayHeight}px`;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    const delta = lastScrollTop - currentScroll;

    if (delta > 0 && currentScroll > 0) {
      // scrolling up
      offset = Math.min(offset + delta, headerOverlayInnerHeight);
    } else if (delta < 0) {
      // scrolling down
      offset = Math.max(offset + delta, 0);
    }

    if (offset > 0) {
      headerOverlay.style.transform = `translateY(${
        -headerOverlayInnerHeight + offset
      }px)`;
      // Двигаем заголовок вместе с хедером
      for (const submenuSticker of submenuStickers)
        submenuSticker.style.top = `${
          headerOverlayHeight - headerOverlayInnerHeight + offset
        }px`;
    } else {
      headerOverlay.style.transform = `translateY(calc(${
        headerOverlayHeight - headerOverlayInnerHeight
      }px - 100%))`;
      for (const submenuSticker of submenuStickers)
        submenuSticker.style.top = `${
          headerOverlayHeight - headerOverlayInnerHeight
        }px`;
    }
    console.log(headerOverlayHeight, headerOverlayInnerHeight);
    lastScrollTop = currentScroll;
  });
}

setupHeaderScroll();
