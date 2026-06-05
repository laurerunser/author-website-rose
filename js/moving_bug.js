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
    sepia:  blob('rgba(107,74,47,.42)',  '#6b4a2f')    // brown (non-fiction)
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
  function setIcon(theme) {
    if (bug.dataset.theme === theme) return;
    bug.innerHTML = ICONS[theme] || ICONS.blue;
    bug.dataset.theme = theme;
  }

  // the three nav links sit at these x-fractions (match nav.css); the blob
  // weaves: above link 1, below link 2, above link 3, crossing the middle over
  // the "*" gaps between them.
  var ANCHORS = [0.16, 0.50, 0.84];
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

  if (window.MutationObserver) {
    var obs = new MutationObserver(function () { setIcon(themeNow()); });
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
  var PERIOD = 16; // seconds to weave across and back
  function frame(ts) {
    if (lastTs === null) lastTs = ts;
    var dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    t += (2 * Math.PI / PERIOD) * dt;
    if (t > 2 * Math.PI) t -= 2 * Math.PI;

    var u = (1 - Math.cos(t)) / 2;                              // ping-pong 0..1..0
    var cx = (ANCHORS[0] + (ANCHORS[2] - ANCHORS[0]) * u) * geo.W;
    var cy = geo.H / 2 - geo.A * Math.cos(2 * Math.PI * u);     // weave up/down

    bug.style.transform =
      "translate(" + (cx - geo.bw / 2).toFixed(1) + "px," + (cy - geo.bh / 2).toFixed(1) + "px)";
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
