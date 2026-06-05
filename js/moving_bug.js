/* moving_bug — a little blob that loops a figure-8 in the header, around the
   two nav links. Its colour follows the active theme (body[data-theme], set
   per-tab on the stories page, or fixed on the about page). The bounce/wobble
   is pure CSS; this file only handles the colour + the figure-8 path. */
(function () {
  "use strict";

  // a blob of liquid, drawn in a given colour
  function blob(fill, stroke) {
    return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M20 5 C 30 4 36 13 33 21 C 37 30 27 37 20 34 C 12 37 4 30 7 21 C 4 13 10 5 20 5 Z" ' +
      'fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<ellipse cx="15" cy="14" rx="3" ry="2" fill="rgba(255,255,255,.55)"/>' +
      '<circle cx="31" cy="32" r="2.2" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.2"/>' +
      '</svg>';
  }

  // one blob per theme (colours read on the cream header background)
  var ICONS = {
    blue:   blob('rgba(27,58,94,.42)',   '#1b3a5e'),
    green:  blob('rgba(47,125,69,.42)',  '#2f7d45'),
    yellow: blob('rgba(169,121,26,.42)', '#a9791a'),
    red:    blob('rgba(196,59,39,.42)',  '#c43b27'),
    purple: blob('rgba(122,79,163,.42)', '#7a4fa3')
  };

  var host = document.getElementById("moving-bug");
  if (!host) return;

  var bug = document.createElement("div");
  bug.className = "bug";
  bug.setAttribute("aria-hidden", "true");
  host.appendChild(bug);

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function themeNow() {
    return document.body.dataset.theme || "blue";
  }

  function setIcon(theme) {
    if (bug.dataset.theme === theme) return;
    bug.innerHTML = ICONS[theme] || ICONS.blue;
    bug.dataset.theme = theme;
  }

  // geometry of the figure-8 (recomputed on resize): the blob's centre traces
  // a wide, flat lemniscate that loops around the two nav links
  var geo = { A: 8, cy: 0, H: 6 };
  function computeGeo() {
    var bw = bug.offsetWidth || 40;
    var bh = bug.offsetHeight || 40;
    geo.A = Math.max(8, (host.clientWidth - bw) / 2);
    geo.cy = Math.max(0, (host.clientHeight - bh) / 2);
    geo.H = Math.max(6, Math.min(geo.cy, geo.A * 0.3));
  }

  computeGeo();
  setIcon(themeNow());

  // recolour the blob whenever the active theme (body[data-theme]) changes
  if (window.MutationObserver) {
    var obs = new MutationObserver(function () { setIcon(themeNow()); });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
  }

  window.addEventListener("resize", computeGeo);
  bug.style.transition = "none"; // position is driven frame-by-frame

  if (reduceMotion) {
    bug.style.transform = "translate(" + geo.A.toFixed(1) + "px," + geo.cy.toFixed(1) + "px)";
    return;
  }

  // glide continuously along the figure-8 — no pauses
  var t = 0;
  var lastTs = null;
  var PERIOD = 18; // seconds for one full ∞ loop
  function frame(ts) {
    if (lastTs === null) lastTs = ts;
    var dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    t += (2 * Math.PI / PERIOD) * dt;
    if (t > 2 * Math.PI) t -= 2 * Math.PI;

    bug.style.transform =
      "translate(" + (geo.A * (1 + Math.sin(t))).toFixed(1) + "px," +
      (geo.cy + geo.H * Math.sin(2 * t)).toFixed(1) + "px)";

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
