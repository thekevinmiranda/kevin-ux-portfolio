/* ==========================================================================
   Persona — vanilla JS only (no libraries). Every init guards its elements.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* --------------------------------------------------- sticky header --- */
  function initStickyHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------ mobile nav --- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("primaryNav");
    if (!toggle || !nav) return;

    var close = function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };
    var open = function () {
      nav.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    };

    toggle.addEventListener("click", function () {
      if (nav.classList.contains("open")) { close(); } else { open(); }
    });

    // close after tapping a link
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    // close on escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        close();
        toggle.focus();
      }
    });
  }

  /* ---------------------------------------------------- smooth-scroll --- */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#" || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: top, behavior: prefersReduced ? "auto" : "smooth" });
      });
    });
  }

  /* ---------------------------------------------------- scroll spy ----- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav-links a[href^="#"]')
    );
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (l) {
      var sel = l.getAttribute("href");
      var sec = sel && sel.length > 1 ? document.querySelector(sel) : null;
      if (sec) map[sec.id] = l;
    });
    var sections = Object.keys(map).map(function (id) {
      return document.getElementById(id);
    });
    if (!sections.length) return;

    /* One winner per callback. Looping and setting active on every
       intersecting entry let the last entry in array order win, which is not
       necessarily the topmost — the indicator flickered on fast scroll. */
    var visible = new Set();
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { visible.add(entry.target.id); }
        else { visible.delete(entry.target.id); }
      });
      if (!visible.size) return;
      var top = sections
        .filter(function (s) { return visible.has(s.id); })
        .sort(function (a, b) {
          return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        })[0];
      links.forEach(function (l) { l.classList.remove("active"); });
      if (top && map[top.id]) map[top.id].classList.add("active");
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { obs.observe(s); });
  }

  /* -------------------------------------------------- scroll reveal ---- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!els.length) return;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    /* Stagger index, derived from position among revealing siblings rather
       than the hand-written data-delay attributes — those gave the work grid
       1,2,1,2 instead of a cascade. Capped at 5 so a long list never runs
       past the ~500ms stagger budget. */
    var seen = new Map();
    els.forEach(function (el) {
      var parent = el.parentNode;
      var n = seen.get(parent) || 0;
      seen.set(parent, n + 1);
      el.style.setProperty("--i", Math.min(n, 5));
    });

    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          o.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ------------------------------------------ pause offscreen loops ---- */
  /* The hero blobs (five blurred 65vw layers) and the logo marquee animate
     forever. Neither is worth a single frame once it is scrolled past, and
     the blobs are the biggest paint cost on the page. */
  function initOffscreenPause() {
    if (prefersReduced || !("IntersectionObserver" in window)) return;
    var targets = document.querySelectorAll(".hero, .marquee");
    if (!targets.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
      });
    }, { rootMargin: "120px" });
    targets.forEach(function (t) { obs.observe(t); });
  }

  /* ------------------------------------------------- work filtering ---- */
  function initFilters() {
    var buttons = document.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll(".work-card");
    if (!buttons.length || !cards.length) return;

    /* Naming each card lets the View Transitions API morph survivors to their
       new grid positions instead of snapping — real FLIP, no library. */
    cards.forEach(function (card, i) {
      card.style.viewTransitionName = "work-card-" + i;
    });

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");
        buttons.forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");

        var apply = function () {
          cards.forEach(function (card) {
            var match = filter === "all" || card.getAttribute("data-cat") === filter;
            card.classList.toggle("is-hidden", !match);
          });
        };

        if (!prefersReduced && document.startViewTransition) {
          document.startViewTransition(apply);
        } else {
          apply();
        }
      });
    });
  }

  /* ------------------------------------------- image download deterrents --
     Casual-download prevention only — right-click "save image", drag-to-
     desktop, and mobile long-press-save. This can't stop a determined
     visitor (devtools, view-source, network tab), but it removes the
     one-click paths most people would actually use. Delegated on document
     so it also covers images added later (lightbox, etc). */
  function initImageProtection() {
    document.addEventListener("contextmenu", function (e) {
      if (e.target && e.target.tagName === "IMG") e.preventDefault();
    });
    document.addEventListener("dragstart", function (e) {
      if (e.target && e.target.tagName === "IMG") e.preventDefault();
    });
    document.querySelectorAll("img").forEach(function (img) {
      img.setAttribute("draggable", "false");
    });
  }

  /* ----------------------------------------------------------- boot ---- */
  function boot() {
    initStickyHeader();
    initMobileNav();
    initSmoothScroll();
    initScrollSpy();
    initReveal();
    initOffscreenPause();
    initFilters();
    initImageProtection();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
