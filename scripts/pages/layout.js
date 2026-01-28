import { bgElement } from "../partials/layout/bgElement.js";
import { initContactsPanel } from "../partials/layout/contactsPanel.js";
import { initHeaderAutoHide } from "../partials/layout/headerAutoHide.js";
import { initMessageButtonAutoHide } from "../partials/layout/messageButtonAutohide.js";
import { toggleSnoska } from "../partials/layout/productSnoska.js";
import { search } from "../partials/layout/search.js";
import { initSearchOverlay } from "../partials/layout/searchOverlay.js";
import { mountMobileMenu } from "../partials/layout/toggleMenu.js";


bgElement();
initContactsPanel();
initHeaderAutoHide();
initMessageButtonAutoHide();
toggleSnoska();
search();
initSearchOverlay();
mountMobileMenu();