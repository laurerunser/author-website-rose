/* 01_orbital_station.js — assembles the orbital-station blueprint as the cursor moves.

   The SVG is fetched + injected, then every drawable element is revealed
   along a shared 0..1 timeline (document order == build order):
     · stroked shapes "draw on" via stroke-dashoffset,
     · text / dotted construction marks / fills just ease their opacity.
   Progress is driven by how far the cursor has travelled, eased for smoothness,
   and only ever moves forward — so the ship slowly comes together as you
   explore the page and then stays built. */
(function () {
  "use strict";

  // "back" returns to wherever the egg was opened from — the page + tab, passed
  // as ?from=<route>[/<tab>] by the blob. Validate to a simple token first, then
  // point the back link at that spot in the single-page app (#route/tab).
  (function () {
    var from = new URLSearchParams(location.search).get("from");
    var back = document.querySelector(".back");
    if (back && from && /^[a-z]+(\/[a-z0-9]+)?$/i.test(from)) {
      back.setAttribute("href", "../../index.html#" + from);
    }
  })();

  var SVG_URL = "01_orbital_station.svg";
  var TRAVEL = 5500;   // px of cursor travel for a fully assembled drawing
  var WIN = 0.15;      // slice of the timeline each element takes to appear

  var sheet = document.getElementById("sheet");
  var hint = document.querySelector(".hint");
  var pctEl = document.querySelector(".readout .pct");
  var barEl = document.querySelector(".readout .bar-fill");
  var xhair = document.querySelector(".xhair");
  var xv = document.querySelector(".xhair-v");
  var xh = document.querySelector(".xhair-h");
  var xdot = document.querySelector(".xhair-dot");
  var root = document.documentElement;

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia &&
    window.matchMedia("(pointer: coarse)").matches;

  if (coarse && hint) hint.textContent = "drag across the screen to draft the ship";

  fetch(SVG_URL)
    .then(function (r) { return r.text(); })
    .then(function (txt) {
      sheet.innerHTML = txt;
      var svg = sheet.querySelector("svg");
      if (svg) init(svg);
    })
    .catch(function () {
      sheet.innerHTML = '<p style="color:#5d93d6;font-size:13px">the drawing ' +
        'could not be loaded — but you found the secret page all the same.</p>';
    });

  function smoothstep(t) { return t * t * (3 - 2 * t); }

  function isStrokeless(el) {
    var s = window.getComputedStyle(el).stroke;
    return !s || s === "none" || s === "rgba(0, 0, 0, 0)" || s === "transparent";
  }

  function init(svg) {
    var nodes = svg.querySelectorAll(
      "path,line,polyline,polygon,circle,ellipse,rect,text");
    var items = [];

    nodes.forEach(function (el) {
      // fade (opacity) for text, dashed construction marks, and pure fills;
      // draw-on (stroke-dashoffset) for everything else with a stroke
      var fade = el.tagName === "text" || el.closest(".fade") || isStrokeless(el);
      var len = 0;

      if (!fade && typeof el.getTotalLength === "function") {
        try { len = el.getTotalLength(); } catch (e) { fade = true; }
      }
      if (len === 0) fade = true;

      if (fade) {
        el.style.opacity = "0";
      } else {
        el.style.strokeDasharray = len + " " + len;
        el.style.strokeDashoffset = len;
      }
      items.push({ el: el, fade: fade, len: len, start: 0, end: 1 });
    });

    var N = items.length;
    items.forEach(function (it, i) {
      var c = N > 1 ? i / (N - 1) : 0;     // element's centre on the timeline
      it.start = c * (1 - WIN);
      it.end = it.start + WIN;
    });

    function apply(p) {
      for (var i = 0; i < N; i++) {
        var it = items[i];
        var local = (p - it.start) / (it.end - it.start);
        local = local < 0 ? 0 : local > 1 ? 1 : local;
        var e = smoothstep(local);
        if (it.fade) it.el.style.opacity = e.toFixed(3);
        else it.el.style.strokeDashoffset = (it.len * (1 - e)).toFixed(2);
      }
      var pct = Math.round(p * 100);
      if (pctEl) pctEl.textContent = p >= 0.999 ? "built ✓" : pct + "%";
      if (barEl) barEl.style.width = pct + "%";
      root.classList.toggle("near-done", p > 0.86);
    }

    // reduced motion: present the finished drawing, skip the interaction
    if (reduce) { apply(1); return; }

    apply(0);

    var target = 0, shown = 0;
    var moved = 0, lastX = null, lastY = null;

    function onMove(e) {
      var x = e.clientX, y = e.clientY;
      if (lastX !== null) moved += Math.hypot(x - lastX, y - lastY);
      lastX = x; lastY = y;
      target = Math.min(1, moved / TRAVEL);

      if (moved > 6 && hint && !hint.classList.contains("gone")) {
        hint.classList.add("gone");
      }
      if (!coarse && xhair) {
        xhair.classList.add("live");
        xv.style.left = x + "px";
        xh.style.top = y + "px";
        xdot.style.left = x + "px";
        xdot.style.top = y + "px";
      }
    }

    function onLeave() { if (xhair) xhair.classList.remove("live"); }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", function (e) {
      if (!e.relatedTarget) onLeave();
    });

    (function tick() {
      shown += (target - shown) * 0.12;          // ease the displayed progress
      if (Math.abs(target - shown) < 0.0004) shown = target;
      apply(shown);
      requestAnimationFrame(tick);
    })();
  }
})();
