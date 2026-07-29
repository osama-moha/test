// Home page interactions: property-card touch reveal + drawer CTA delegation.
// Extracted from index.html inline handlers on 2026-07-11.

(function () {
  "use strict";

  document.addEventListener("click", function (event) {
    // Drawer CTA delegation — buttons/links carry data-drawer-* attributes.
    var trigger = event.target.closest("[data-drawer]");
    if (trigger && typeof window.openServiceDrawer === "function") {
      window.openServiceDrawer(
        trigger.getAttribute("data-drawer-source") || "",
        trigger.getAttribute("data-drawer-service") || "",
        trigger.getAttribute("data-drawer-title") || "",
        trigger.getAttribute("data-drawer-intro") || ""
      );
      // For anchor triggers with a fallback href, don't intercept navigation
      // if the drawer isn't available — but when it is, prevent the default.
      if (trigger.tagName === "A") event.preventDefault();
    }
  });
})();
