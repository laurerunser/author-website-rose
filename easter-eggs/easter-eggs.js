/* easter-eggs.js — a tiny registry of tab easter eggs that the moving blob
   consults (see easter-eggs/moving_bug/moving_bug.js). Each entry maps a page + the active tab's
   theme to a destination URL. On the stories page a tab is identified by its
   theme colour (blue, green, yellow, red, purple), so "the first/blue tab" is
   simply theme:"blue".

   To wire a new egg to another tab, add one line to TAB_EGGS — nothing else to
   change. Paths are relative to the page that hosts the blob (the site root). */
(function () {
  "use strict";

  var TAB_EGGS = [
    { page: "stories", theme: "blue",   href: "easter-eggs/fiction/01_orbital_station.html" },
    { page: "stories", theme: "green",  href: "easter-eggs/fiction/02_barnacle_goose.html" },
    { page: "stories", theme: "purple", href: "easter-eggs/fiction/05_sheep_plush.html" }
    // , { page: "nonfic",  theme: "sepia", href: "..." }
  ];

  // returns the destination for the given page + theme, or null if none
  window.tabEggFor = function (page, theme) {
    for (var i = 0; i < TAB_EGGS.length; i++) {
      if (TAB_EGGS[i].page === page && TAB_EGGS[i].theme === theme) {
        return TAB_EGGS[i].href;
      }
    }
    return null;
  };
})();
