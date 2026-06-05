/* include.js — pulls the shared header + footer partials (components/header.html
   and components/footer.html) into each page, then wires up the few per-page
   bits the header carries: the blurb line, the current-page nav highlight, and
   the portrait images. Page scripts that touch the injected DOM (moving_bug,
   stories, nonfiction) are loaded last, in order, from <body data-scripts>. */
(function () {
  "use strict";

  var body = document.body;

  function inject(targetId, url) {
    return fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var el = document.getElementById(targetId);
        if (el) el.outerHTML = html;   // replace placeholder so .head / .socials
      });                              // stay direct flex children of .center
  }

  function wireHeader() {
    // page-specific blurb
    var blurb = document.querySelector(".blurb");
    if (blurb && body.dataset.blurb) blurb.textContent = body.dataset.blurb;

    // highlight the link for the current page (about | stories | nonfic)
    if (body.dataset.page) {
      var current = document.querySelector(".loop-link--" + body.dataset.page);
      if (current) current.classList.add("is-current");
    }

    // portrait: light image, plus an optional dark image that bleeds over it.
    // Pages without a dark portrait (e.g. about) drop it and stay static.
    var light = document.getElementById("portrait-light");
    if (light && body.dataset.portraitLight) light.src = body.dataset.portraitLight;

    var dark = document.getElementById("portrait-dark");
    if (dark) {
      if (body.dataset.portraitDark) dark.src = body.dataset.portraitDark;
      else dark.remove();
    }
  }

  function loadScripts() {
    var list = (body.dataset.scripts || "")
      .split(",")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    (function next(i) {
      if (i >= list.length) return;
      var s = document.createElement("script");
      s.src = list[i];
      s.onload = function () { next(i + 1); };
      document.body.appendChild(s);
    })(0);
  }

  Promise.all([
    inject("site-header", "components/header.html"),
    inject("site-footer", "components/footer.html")
  ]).then(function () {
    wireHeader();
    loadScripts();
  });
})();
