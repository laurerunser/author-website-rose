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
      file: "stories.html", page: "stories", script: "js/stories.js?v=8",
      init: function () { if (window.StoriesPage) window.StoriesPage.init(); }
    },
    nonfic: {
      file: "nonfiction.html", page: "nonfic", script: "js/nonfiction.js?v=4",
      init: function () { if (window.NonficPage) window.NonficPage.init(); }
    }
  };

  // loaded once, then left running — this is what keeps the blob alive.
  // easter-eggs.js (window.tabEggFor) must run before moving_bug.js so the
  // blob can wire up its click-to-open-egg on the right tab; they load in order.
  var PERSIST = ["js/easter-eggs.js?v=1", "js/moving_bug.js?v=10"];
  var FADE = 220;

  function $(s) { return document.querySelector(s); }
  function railImgs() { return [].slice.call(document.querySelectorAll(".rail-img")); }
  function fadeEls() { var v = document.getElementById("view"); return (v ? [v] : []).concat(railImgs()); }

  function routeFromHash() { var h = location.hash.replace(/^#/, ""); return ROUTES[h] ? h : "about"; }
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
  function runRoute(route) { return loadScript(route.script).then(function () { if (route.init) route.init(); }); }

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

  function navigate(rk) {
    var route = ROUTES[rk] || ROUTES.about;
    if (rk === current || busy) return;
    busy = true;
    fadeEls().forEach(function (e) { e.classList.add("is-fading"); });
    setTimeout(function () {
      fetchDoc(route.file).then(function (doc) {
        applyDoc(doc);
        wireHeader();
        runRoute(route).then(function () {
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
  window.addEventListener("hashchange", function () { navigate(routeFromHash()); });

  Promise.all([
    inject("site-header", "components/header.html"),
    inject("site-footer", "components/footer.html")
  ]).then(function () {
    PERSIST.reduce(function (p, src) {     // start the blob, once and for all (in order)
      return p.then(function () { return loadScript(src); });
    }, Promise.resolve());
    current = routeOfPage(body.dataset.page);
    var hashRoute = routeFromHash();
    if (location.hash && hashRoute !== current) {
      navigate(hashRoute);                 // deep link to a different page than the one served
    } else {
      wireHeader();
      runRoute(ROUTES[current]);           // render the inline page in place
      if (current !== "about" && !location.hash) history.replaceState(null, "", "#" + current);
    }
  });
})();
