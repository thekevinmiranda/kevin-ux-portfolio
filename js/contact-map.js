/* ==========================================================================
   Contact section map — Leaflet + CARTO's free Positron ("no labels") tiles.
   Toned-down road colours, no street/highway labels, no zoom controls, fully
   static (no drag/scroll/zoom interaction). A "labels" overlay is stacked on
   top so place names (city/region) still show, just not road names/numbers.
   ========================================================================== */
(function () {
  "use strict";

  function initChennaiMap() {
    var el = document.getElementById("chennaiMap");
    if (!el || typeof L === "undefined") return;

    var chennai = [13.0827, 80.2707];

    var map = L.map(el, {
      center: chennai,
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      tap: false
    });

    // base: muted grey basemap, no road/highway labels
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    // overlay: place names only (city/region) — no street-level labels
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
      pane: "overlayPane"
    }).addTo(map);

    // custom red pin (kept red on purpose — distinct from the site's marigold/clay accents)
    var pinIcon = L.divIcon({
      className: "chennai-pin",
      html:
        '<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">' +
        '<path d="M12 22c5-4.5 7.5-8 7.5-11a7.5 7.5 0 0 0-15 0c0 3 2.5 6.5 7.5 11Z" fill="#DC2626" stroke="#F4F1E8" stroke-width="1.5"/>' +
        '<circle cx="12" cy="11" r="3" fill="#F4F1E8"/>' +
        "</svg>",
      iconSize: [34, 34],
      iconAnchor: [17, 32]
    });

    L.marker(chennai, { icon: pinIcon, interactive: false, keyboard: false }).addTo(map);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChennaiMap);
  } else {
    initChennaiMap();
  }
})();
