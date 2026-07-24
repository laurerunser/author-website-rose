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

  // the blob traces a figure-8 built from two circles, one looping around
  // each nav link and meeting at the centre — each circle is centred *on*
  // its link (radius = the link's own offset from centre), so the loop is
  // tallest directly over the link instead of thinning out near it like a
  // plain lemniscate would. computeGeo() measures the links' actual boxes
  // each time and solves for a radius that clears all four edges
  // (left/right/top/bottom) with a margin, so it keeps working if font
  // size or container width changes.
  var linkAbout = host.querySelector(".loop-link--about");
  var linkStories = host.querySelector(".loop-link--stories");
  var MARGIN_X = 6; // px the loop clears past a link's left/right edge
  var MARGIN_Y = 6; // px the loop clears above/below a link's box
  var geo = { W: 0, H: 0, A: 34, bw: 40, bh: 40, D: 120, aboutOffset: 95 };

  function linkBox(el, hostRect) {
    if (!el) return null;
    var r = el.getBoundingClientRect();
    return {
      offset: Math.abs((r.left + r.right) / 2 - (hostRect.left + hostRect.width / 2)),
      halfW: r.width / 2,
      halfH: r.height / 2
    };
  }

  function computeGeo() {
    geo.bw = bug.offsetWidth || 40;
    geo.bh = bug.offsetHeight || 40;
    var bugVisR = geo.bw * 0.475; // the blob's own visual radius inside its box
    var hostRect = host.getBoundingClientRect();
    geo.W = hostRect.width;
    geo.H = hostRect.height;

    var aboutBox = linkBox(linkAbout, hostRect);
    var boxes = [aboutBox, linkBox(linkStories, hostRect)].filter(Boolean);
    geo.aboutOffset = aboutBox ? aboutBox.offset : 95;

    if (!boxes.length) {
      geo.D = Math.max(40, geo.W / 2 - geo.bw / 2 - 5);
      geo.A = Math.max(24, Math.min(geo.H / 2 - geo.bh / 2 - 2, 70));
      return;
    }

    boxes.forEach(function (b) {
      b.unsafeHalfW = b.halfW + bugVisR + MARGIN_X;
      b.unsafeHalfH = b.halfH + bugVisR + MARGIN_Y;
    });

    // each circle's radius = the average link offset, so both lobes stay
    // symmetric and the loop's tallest point sits right over each link
    var sum = 0;
    boxes.forEach(function (b) { sum += b.offset; });
    geo.D = Math.min(sum / boxes.length, Math.max(40, geo.W / 2 - geo.bw / 2 - 5));

    // amplitude needed so cy = D·(1-cosφ) → y = A·sinφ clears each link's
    // box at its inner/outer edges (the loop's weakest points there)
    var neededA = geo.bh / 2 + 10;
    boxes.forEach(function (b) {
      var ratio = Math.min(0.92, b.unsafeHalfW / geo.D);
      var s = Math.sqrt(Math.max(0, 1 - ratio * ratio));
      if (s > 0.02) neededA = Math.max(neededA, b.unsafeHalfH / s);
    });
    geo.A = Math.min(neededA, Math.max(24, geo.H / 2 - geo.bh / 2 - 2));
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
    bug.style.transform = "translate(" + (geo.W / 2 - geo.aboutOffset - geo.bw / 2).toFixed(1) +
      "px," + (geo.H / 2 - geo.bh / 2).toFixed(1) + "px)";
    return;
  }

  var t = 0;
  var lastTs = null;
  var PERIOD = 14; // seconds per full figure-8 loop (both circles)
  function frame(ts) {
    if (lastTs === null) lastTs = ts;
    var dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    t += (2 * Math.PI / PERIOD) * dt;
    if (t > 4 * Math.PI) t -= 4 * Math.PI;

    // right circle (phase 0..2π): centred on the "stories" link, radius D,
    // starts/ends at the crossing point (0,0); left circle is its mirror.
    // x = D(1-cosφ) → 0 at the crossing, 2D at the far side, D (its full
    // radius) directly over the link — so height there is D, not ~0 like
    // a lemniscate's pinched waist. y = A·sinφ is independent of x, so
    // amplitude can be tuned for clearance without fighting the reach.
    var onLeft = t >= 2 * Math.PI;
    var phase = onLeft ? t - 2 * Math.PI : t;
    var cx = geo.D * (1 - Math.cos(phase));
    var cy = geo.H / 2 + geo.A * Math.sin(phase);
    if (onLeft) cx = -cx;
    cx += geo.W / 2;

    bug.style.transform =
      "translate(" + (cx - geo.bw / 2).toFixed(1) + "px," + (cy - geo.bh / 2).toFixed(1) + "px)";
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
