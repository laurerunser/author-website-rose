/* app.js — turns the three-page site into one page so the moving blob never
   reloads. The header (which hosts the blob) and the footer are injected once
   and kept forever; navigating between About / Stories / Non-fiction only swaps
   the #view content, the rail art and the <body> data-* (theme / blurb /
   portrait), with a short crossfade. Routing is hash-based:
       (no hash) → about     #stories → stories     #nonfic → non-fiction
   Page scripts load once and expose an init() the router calls after each swap;
   moving_bug.js loads once and runs for the life of the page. Every page is
   still a complete document, so direct loads and no-JS both work. */
(function () {
  "use strict";

  var body = document.body;

  var ROUTES = {
    about: { file: "index.html", page: "about" },
    stories: {
      file: "stories.html", page: "stories", script: "js/stories.js?v=9",
      init: function (tab) { if (window.StoriesPage) window.StoriesPage.init(tab); }
    },
    nonfic: {
      file: "nonfiction.html", page: "nonfic", script: "js/nonfiction.js?v=4",
      init: function (tab) { if (window.NonficPage) window.NonficPage.init(tab); }
    }
  };

  // loaded once, then left running — this is what keeps the blob alive.
  // easter-eggs.js (window.tabEggFor) must run before moving_bug.js so the
  // blob can wire up its click-to-open-egg on the right tab; they load in order.
  var PERSIST = ["js/easter-eggs.js?v=1", "js/moving_bug.js?v=11"];
  var FADE = 220;

  function $(s) { return document.querySelector(s); }
  function railImgs() { return [].slice.call(document.querySelectorAll(".rail-img")); }
  function fadeEls() { var v = document.getElementById("view"); return (v ? [v] : []).concat(railImgs()); }

  // hash is "<route>" or "<route>/<tab>" (tab = a story tab's theme), e.g.
  // #stories or #stories/green — so a deep link / egg "back" can restore a tab.
  function parseHash() {
    var h = location.hash.replace(/^#/, "");
    var i = h.indexOf("/");
    var r = i < 0 ? h : h.slice(0, i);
    return { route: ROUTES[r] ? r : "about", tab: i < 0 ? null : h.slice(i + 1) };
  }
  function routeOfPage(p) { for (var k in ROUTES) if (ROUTES[k].page === p) return k; return "about"; }
  function routeOfHref(href) { if (!href) return null; var f = href.split("/").pop().split("?")[0]; for (var k in ROUTES) if (ROUTES[k].file === f) return k; return null; }

  function inject(id, url) {
    return fetch(url).then(function (r) { return r.text(); }).then(function (html) {
      var el = document.getElementById(id);
      if (el) el.outerHTML = html;   // replace placeholder so .head/.socials stay direct flex children
    });
  }

  var scriptCache = {};
  function loadScript(src) {
    if (!src) return Promise.resolve();
    if (scriptCache[src]) return scriptCache[src];
    scriptCache[src] = new Promise(function (res) {
      var s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = res;
      document.body.appendChild(s);
    });
    return scriptCache[src];
  }
  function runRoute(route, tab) { return loadScript(route.script).then(function () { if (route.init) route.init(tab); }); }

  function wireHeader() {
    var blurb = $(".blurb"); if (blurb) blurb.textContent = body.dataset.blurb || "";
    var links = document.querySelectorAll(".loop-link");
    for (var i = 0; i < links.length; i++) links[i].classList.remove("is-current");
    var cur = $(".loop-link--" + body.dataset.page); if (cur) cur.classList.add("is-current");
    var light = document.getElementById("portrait-light");
    if (light && body.dataset.portraitLight) light.src = body.dataset.portraitLight;
    var dark = document.getElementById("portrait-dark");
    if (dark) {
      if (body.dataset.portraitDark) { dark.src = body.dataset.portraitDark; dark.style.display = ""; }
      else { dark.removeAttribute("src"); dark.style.display = "none"; }
    }
  }

  var docCache = {};
  function fetchDoc(file) {
    if (docCache[file]) return Promise.resolve(docCache[file]);
    return fetch(file).then(function (r) { return r.text(); }).then(function (html) {
      var d = new DOMParser().parseFromString(html, "text/html");
      docCache[file] = d; return d;
    });
  }

  function applyDoc(doc) {
    var nb = doc.body;
    body.dataset.theme = nb.dataset.theme || "";
    body.dataset.page = nb.dataset.page || "";
    body.dataset.blurb = nb.dataset.blurb || "";
    if (nb.dataset.portraitLight) body.dataset.portraitLight = nb.dataset.portraitLight; else delete body.dataset.portraitLight;
    if (nb.dataset.portraitDark) body.dataset.portraitDark = nb.dataset.portraitDark; else delete body.dataset.portraitDark;
    var nv = doc.getElementById("view"), lv = document.getElementById("view");
    if (nv && lv) lv.innerHTML = nv.innerHTML;
    ["rail-left", "rail-right"].forEach(function (id) {
      var s = doc.getElementById(id), l = document.getElementById(id);
      if (s && l) l.src = s.getAttribute("src");
    });
    if (doc.title) document.title = doc.title;
  }

  var current = null, busy = false;

  function navigate(rk, tab) {
    var route = ROUTES[rk] || ROUTES.about;
    if (busy) return;
    if (rk === current) {                  // already on this page —
      if (tab && route.init) route.init(tab);  // just switch tab (e.g. egg "back")
      return;
    }
    busy = true;
    fadeEls().forEach(function (e) { e.classList.add("is-fading"); });
    setTimeout(function () {
      fetchDoc(route.file).then(function (doc) {
        applyDoc(doc);
        wireHeader();
        runRoute(route, tab).then(function () {
          current = rk;
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              fadeEls().forEach(function (e) { e.classList.remove("is-fading"); });
              busy = false;
            });
          });
        });
      });
    }, FADE);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest(".loop-link") : null;
    if (!a) return;
    var rk = routeOfHref(a.getAttribute("href"));
    if (!rk) return;                       // leave anything that isn't a page link alone
    e.preventDefault();
    var want = rk === "about" ? "" : "#" + rk;
    if (location.hash === want) { navigate(rk); return; }
    location.hash = want;                  // → hashchange → navigate
  });
  window.addEventListener("hashchange", function () { var p = parseHash(); navigate(p.route, p.tab); });

  Promise.all([
    inject("site-header", "components/header.html"),
    inject("site-footer", "components/footer.html")
  ]).then(function () {
    PERSIST.reduce(function (p, src) {     // start the blob, once and for all (in order)
      return p.then(function () { return loadScript(src); });
    }, Promise.resolve());
    current = routeOfPage(body.dataset.page);
    var ph = parseHash();
    if (location.hash && ph.route !== current) {
      navigate(ph.route, ph.tab);          // deep link (incl. egg "back" to a tab)
    } else {
      wireHeader();
      runRoute(ROUTES[current], ph.tab);   // render the inline page in place (maybe a specific tab)
      if (current !== "about" && !location.hash) history.replaceState(null, "", "#" + current);
    }
  });
})();
