/* stories.js — renders the stories tabs/cards. Exposes window.StoriesPage.init()
   so the SPA router (js/app.js) can (re)render it each time the page is shown;
   element lookups happen inside render() because #view is re-injected on every
   navigation. Picking a tab swaps the rails, portrait and body[data-theme]. */
(function () {
  "use strict";

  var STORIES = [
    {
      tab: "01", theme: "green",
      left: "components/02_green/birds.svg?v=2", right: "components/02_green/tree.svg?v=2",
      portraitLight: "images/portraits/02_light_green.webp", portraitDark: "images/portraits/02_dark_green.webp",
      label: "Blessed Be The Roots", title: "Blessed Be The Roots That Grow In The Blind-Dark",
      comingSoon: "coming to you soon this september 👀"
    }
  ];

  var active = 0;

  function render() {
    var tabsEl = document.getElementById("tabs");
    var storyEl = document.getElementById("story");
    if (!tabsEl || !storyEl) return;

    tabsEl.innerHTML = "";
    STORIES.forEach(function (s, i) {
      var b = document.createElement("button");
      b.className = "tab" + (s.theme ? " tab--" + s.theme : "") + (i === active ? " is-active" : "");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === active ? "true" : "false");
      b.innerHTML = '<span class="num">' + s.tab + '</span><span class="lbl">' + s.label + '</span>';
      b.addEventListener("click", function () { active = i; render(); });
      tabsEl.appendChild(b);
    });

    var s = STORIES[active];
    storyEl.innerHTML =
      '<h2 class="story-title">' + s.title + '</h2>' +
      '<p class="coming-soon">' + s.comingSoon + '</p>';

    if (s.theme) document.body.dataset.theme = s.theme;

    var railLeftEl = document.getElementById("rail-left");
    var railRightEl = document.getElementById("rail-right");
    if (railLeftEl && s.left) railLeftEl.src = s.left;
    if (railRightEl && s.right) railRightEl.src = s.right;

    var portraitLightEl = document.getElementById("portrait-light");
    var portraitDarkEl = document.getElementById("portrait-dark");
    if (portraitLightEl && s.portraitLight) portraitLightEl.src = s.portraitLight;
    if (portraitDarkEl && s.portraitDark) { portraitDarkEl.src = s.portraitDark; portraitDarkEl.style.display = ""; }
  }

  function indexOfTheme(t) { for (var i = 0; i < STORIES.length; i++) if (STORIES[i].theme === t) return i; return 0; }

  // init() opens tab 1; init("green") opens the tab whose theme is green, etc.
  // (used when returning from an easter egg so you land back on the same tab).
  window.StoriesPage = { init: function (tab) { active = tab ? indexOfTheme(tab) : 0; render(); } };
})();
