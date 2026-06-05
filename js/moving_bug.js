/* moving_bug — a small themed creature that drifts gently and randomly in the
   header gap between the name and the portrait. The icon changes with the
   active tab. Fully self-contained: it watches body[data-theme] (set by
   stories.js) so it needs no hooks elsewhere. */
(function () {
  "use strict";

  // one icon per theme, drawn in that tab's colour
  var ICONS = {
    blue:
      '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g fill="none" stroke="#1b3a5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M20 4 C 26 11 27 22 25 29 L 15 29 C 13 22 14 11 20 4 Z" fill="rgba(27,58,94,.12)"/>' +
      '<path d="M15 25 L 9 33 L 15 30"/><path d="M25 25 L 31 33 L 25 30"/>' +
      '<circle cx="20" cy="15" r="3.2"/>' +
      '<path d="M16.5 30 Q 20 38 23.5 30" stroke="#c43b27"/></g></svg>',

    green:
      '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g stroke="#2f7d45" stroke-width="1.5" stroke-linecap="round" fill="none">' +
      '<path d="M9 30 l -3 4 M9 30 l 0 5 M14 27 l -2 5 M14 27 l 2 5 M20 25 l -2 5 M20 25 l 2 5 ' +
      'M26 26 l -2 5 M26 26 l 2 5 M31 30 l 0 5 M31 30 l 3 4"/>' +
      '<path d="M31 25 l 3 -4 M31 25 l 0 -4"/></g>' +
      '<g fill="rgba(47,125,69,.18)" stroke="#2f7d45" stroke-width="1.5">' +
      '<circle cx="9" cy="29" r="3.2"/><circle cx="14" cy="26" r="3.4"/>' +
      '<circle cx="20" cy="24.5" r="3.5"/><circle cx="26" cy="25" r="3.4"/>' +
      '<circle cx="31" cy="28" r="3.6"/></g>' +
      '<circle cx="32" cy="28" r="0.9" fill="#2f7d45"/></svg>',

    yellow:
      '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g fill="rgba(169,121,26,.16)" stroke="#a9791a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M13 30 C 2 33 2 20 9 18" fill="none"/><circle cx="8.5" cy="17.5" r="2.3"/>' +
      '<ellipse cx="19" cy="27" rx="7" ry="8.5"/>' +
      '<path d="M15 34 L 22 38 L 13 37" fill="none"/>' +
      '<circle cx="26" cy="19" r="5"/>' +
      '<path d="M23 15 C 20 6 25 6 26 14 Z"/><path d="M27 14 C 28 5 33 8 30 15 Z"/>' +
      '<path d="M30 18 l 4 1.5 l -3.5 2 Z"/></g>' +
      '<circle cx="28" cy="19" r="0.9" fill="#a9791a"/></svg>',

    red:
      '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g stroke="#c43b27" stroke-width="1.5" stroke-linecap="round" fill="none">' +
      '<path d="M12 15 l -5 -3 M11 22 l -6 0 M12 29 l -5 3 M28 15 l 5 -3 M29 22 l 6 0 M28 29 l 5 3"/>' +
      '<path d="M17 6 l -3 -4 M23 6 l 3 -4"/></g>' +
      '<ellipse cx="20" cy="22" rx="9" ry="12" fill="#c43b27" stroke="#7a1d12" stroke-width="1.4"/>' +
      '<ellipse cx="20" cy="9" rx="4" ry="3.4" fill="#3a140e"/>' +
      '<line x1="20" y1="14" x2="20" y2="32" stroke="#3a140e" stroke-width="1.4"/>' +
      '<circle cx="15.5" cy="17" r="1.8" fill="#3a140e"/><circle cx="24.5" cy="17" r="1.8" fill="#3a140e"/>' +
      '<circle cx="15" cy="27" r="2.3" fill="#3a140e"/><circle cx="25" cy="27" r="2.3" fill="#3a140e"/></svg>',

    purple:
      '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M20 5 C 30 4 36 13 33 21 C 37 30 27 37 20 34 C 12 37 4 30 7 21 C 4 13 10 5 20 5 Z" ' +
      'fill="rgba(122,79,163,.45)" stroke="#7a4fa3" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<ellipse cx="15" cy="14" rx="3" ry="2" fill="rgba(255,255,255,.55)"/>' +
      '<circle cx="31" cy="32" r="2.2" fill="rgba(122,79,163,.45)" stroke="#7a4fa3" stroke-width="1.2"/></svg>'
  };

  var host = document.getElementById("moving-bug");
  if (!host) return;

  var bug = document.createElement("div");
  bug.className = "bug";
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
    applyFacing(theme);
  }

  function bounds() {
    var bw = bug.offsetWidth || 40;
    var bh = bug.offsetHeight || 40;
    return {
      maxX: Math.max(0, host.clientWidth - bw),
      maxY: Math.max(0, host.clientHeight - bh)
    };
  }

  // how each icon faces its heading. 'rotate' spins to the direction of
  // travel (top-down craft); 'flip' only mirrors left/right so side-on
  // critters never go belly-up; 'none' leaves it alone (the round blob just
  // wobbles). base = the angle the art is drawn pointing, in degrees.
  var FACING = {
    blue:   { mode: "rotate", base: -90 }, // spaceship — nose up
    green:  { mode: "flip" },              // millipede — head to the right
    yellow: { mode: "flip" },              // desert mouse — snout to the right
    red:    { mode: "rotate", base: -90 }, // firebug — head up
    purple: { mode: "none" }               // blob
  };

  var x = 0, y = 0;
  var lastDx = 0, lastDy = -1; // start pointing the way the art is drawn

  // turn the icon to face where it's going (applied to the inner svg so it
  // composes with the slow drift translate on .bug)
  function applyFacing(theme) {
    var svg = bug.firstElementChild;
    if (!svg) return;
    var f = FACING[theme] || FACING.blue;
    if (f.mode === "rotate") {
      var ang = Math.atan2(lastDy, lastDx) * 180 / Math.PI;
      svg.style.transform = "rotate(" + (ang - f.base).toFixed(1) + "deg)";
    } else if (f.mode === "flip") {
      svg.style.transform = "scaleX(" + (lastDx < 0 ? -1 : 1) + ")";
    } else {
      svg.style.transform = "";
    }
  }

  function moveTo(px, py, durMs) {
    x = px;
    y = py;
    bug.style.transitionDuration = (durMs / 1000) + "s";
    bug.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
  }

  // pick a new gentle, slow waypoint and return how long until the next hop
  function drift() {
    var b = bounds();
    var nx = Math.random() * b.maxX;
    var ny = Math.random() * b.maxY;
    lastDx = nx - x;
    lastDy = ny - y;
    applyFacing(bug.dataset.theme);
    var dur = 3500 + Math.random() * 3500; // 3.5–7s per glide
    moveTo(nx, ny, dur);
    return dur + 500 + Math.random() * 1500; // pause a beat, then glide again
  }

  setIcon(themeNow());

  // swap the icon whenever the active tab (body[data-theme]) changes
  if (window.MutationObserver) {
    var obs = new MutationObserver(function () { setIcon(themeNow()); });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
  }

  if (reduceMotion) {
    var b0 = bounds();
    bug.style.transform = "translate(" + (b0.maxX / 2).toFixed(1) + "px," + (b0.maxY / 2).toFixed(1) + "px)";
    return;
  }

  // start somewhere random without animating, then begin drifting
  var start = bounds();
  bug.style.transitionDuration = "0s";
  x = Math.random() * start.maxX;
  y = Math.random() * start.maxY;
  bug.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";

  requestAnimationFrame(function () {
    (function loop() {
      var wait = drift();
      setTimeout(loop, wait);
    })();
  });

  // keep the creature inside the box if the window resizes
  window.addEventListener("resize", function () {
    var b = bounds();
    x = Math.min(x, b.maxX);
    y = Math.min(y, b.maxY);
    bug.style.transitionDuration = "0.6s";
    bug.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
  });
})();
