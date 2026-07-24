/* moving_bug — a little blob that weaves between the header nav links. Its
   colour follows the active theme (body[data-theme]); the bounce is pure CSS.
   The blob rides over the "*" separators but stays above/below the bracketed
   links, never inside them. */
(function () {
  "use strict";

  function blob(fill, stroke) {
    return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M20 5 C 30 4 36 13 33 21 C 37 30 27 37 20 34 C 12 37 4 30 7 21 C 4 13 10 5 20 5 Z" ' +
      'fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<ellipse cx="15" cy="14" rx="3" ry="2" fill="rgba(255,255,255,.55)"/>' +
      '<circle cx="31" cy="32" r="2.2" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.2"/>' +
      '</svg>';
  }

  var ICONS = {
    blue:   blob('rgba(93,147,214,.42)', '#5d93d6'),   // light blue
    green:  blob('rgba(47,125,69,.42)',  '#2f7d45'),
    yellow: blob('rgba(169,121,26,.42)', '#a9791a'),
    red:    blob('rgba(196,59,39,.42)',  '#c43b27'),
    purple: blob('rgba(122,79,163,.42)', '#7a4fa3'),
    sepia:  blob('rgba(231,213,139,.5)', '#ddc77b')    // light dress yellow (non-fiction)
  };

  var host = document.getElementById("moving-bug");
  if (!host) return;

  var bug = document.createElement("div");
  bug.className = "bug";
  bug.setAttribute("aria-hidden", "true");
  host.appendChild(bug);

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function themeNow() { return document.body.dataset.theme || "blue"; }
  function pageNow() { return document.body.dataset.page || ""; }
  function setIcon(theme) {
    if (bug.dataset.theme === theme) return;
    bug.innerHTML = ICONS[theme] || ICONS.blue;
    bug.dataset.theme = theme;
  }

  // Easter eggs: on the right page + tab the blob becomes a secret doorway.
  // The mapping lives in easter-eggs/easter-eggs.js (window.tabEggFor); the blob only
  // catches clicks when an egg is registered for the current page+theme, so it
  // stays purely decorative everywhere else.
  function refreshEgg() {
    var href = (typeof window.tabEggFor === "function")
      ? window.tabEggFor(pageNow(), themeNow())
      : null;
    if (href) {
      bug.dataset.egg = href;
      bug.style.pointerEvents = "auto";
      bug.style.cursor = "pointer";
    } else {
      delete bug.dataset.egg;
      bug.style.pointerEvents = "";
      bug.style.cursor = "";
    }
  }
  bug.addEventListener("click", function () {
    if (!bug.dataset.egg) return;
    // remember where we left from (page + tab, identified by its theme) so the
    // egg's "back" link can return to this exact spot.
    var from = pageNow() + (themeNow() ? "/" + themeNow() : "");
    var sep = bug.dataset.egg.indexOf("?") < 0 ? "?" : "&";
    window.location.href = bug.dataset.egg + sep + "from=" + encodeURIComponent(from);
  });

  // the two nav links sit at these x-fractions (match nav.css); the blob
  // traces a figure-8 (a lemniscate of Gerono) between them, looping around
  // each link in turn and crossing back through the middle.
  var ANCHORS = [0.38, 0.62];
  var CENTER = (ANCHORS[0] + ANCHORS[1]) / 2;
  var LOBE = (ANCHORS[1] - ANCHORS[0]) / 2 * 1.35; // overshoot past each link so its loop encloses it
  var geo = { W: 0, H: 0, A: 8, bw: 40, bh: 40 };
  function computeGeo() {
    geo.bw = bug.offsetWidth || 40;
    geo.bh = bug.offsetHeight || 40;
    geo.W = host.clientWidth;
    geo.H = host.clientHeight;
    geo.A = Math.max(20, Math.min(geo.H / 2 - geo.bh / 2 - 2, 60));
  }

  computeGeo();
  setIcon(themeNow());
  refreshEgg();

  if (window.MutationObserver) {
    var obs = new MutationObserver(function () { setIcon(themeNow()); refreshEgg(); });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
  }

  window.addEventListener("resize", computeGeo);
  bug.style.transition = "none";

  if (reduceMotion) {
    bug.style.transform = "translate(" + (ANCHORS[0] * geo.W - geo.bw / 2).toFixed(1) +
      "px," + (geo.H / 2 - geo.bh / 2).toFixed(1) + "px)";
    return;
  }

  var t = 0;
  var lastTs = null;
  var PERIOD = 14; // seconds per full figure-8 loop
  function frame(ts) {
    if (lastTs === null) lastTs = ts;
    var dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    t += (2 * Math.PI / PERIOD) * dt;
    if (t > 2 * Math.PI) t -= 2 * Math.PI;

    // lemniscate of Gerono: x = sin(t), y = sin(t)cos(t) — a horizontal
    // infinity sign, its two lobes centred on the two links, crossing
    // through the middle at t = 0 and t = π.
    var cx = (CENTER + LOBE * Math.sin(t)) * geo.W;
    var cy = geo.H / 2 + geo.A * Math.sin(t) * Math.cos(t);

    bug.style.transform =
      "translate(" + (cx - geo.bw / 2).toFixed(1) + "px," + (cy - geo.bh / 2).toFixed(1) + "px)";
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
