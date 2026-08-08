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

  /* ------------------------------------------------ hero blob drift ---- */
  /* Randomize each blob's starting phase so the loop never opens the same
     way twice — pure CSS keeps driving the motion afterward, so this costs
     one negative animation-delay per blob, once, and nothing at runtime. */
  function initHeroBlobDrift() {
    if (prefersReduced) return;
    var blobs = document.querySelectorAll(".hero-blobs span");
    blobs.forEach(function (b) {
      var duration = parseFloat(getComputedStyle(b).animationDuration) || 30;
      b.style.animationDelay = (-Math.random() * duration).toFixed(2) + "s";
    });
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

  /* ------------------------------------------------- impact card glow --
     A spotlight that tracks the cursor across each Quantifiable Impact card,
     like a torch played over the surface.

     Lives here rather than in js/motion.js on purpose: this is a hover
     affordance, not a motion flourish, so it must not disappear when the
     GSAP CDN is blocked. It needs no library — two custom properties per
     pointermove, and CSS draws the gradient.

     Skipped entirely on touch and under reduced motion. In both cases
     --gx/--gy keep their CSS defaults of 50%, so hovering (or focusing via
     keyboard) still lights the card from its centre — the effect degrades to
     a static glow rather than vanishing. */
  function initImpactGlow() {
    if (prefersReduced) return;
    if (window.matchMedia && !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll(".impact-card"));
    if (!cards.length) return;

    function track(card, e) {
      /* Measured per event rather than cached: these cards shift on every
         scroll, and a stale rect leaves the glow trailing the cursor. */
      var r = card.getBoundingClientRect();
      if (!r.width || !r.height) return;
      card.style.setProperty("--gx", (((e.clientX - r.left) / r.width) * 100).toFixed(2) + "%");
      card.style.setProperty("--gy", (((e.clientY - r.top) / r.height) * 100).toFixed(2) + "%");
    }

    cards.forEach(function (card) {
      /* Set the position on ENTER as well as move, so the glow fades up
         exactly where the cursor crossed the edge instead of showing one
         stale frame at wherever it was last time. */
      card.addEventListener("pointerenter", function (e) { track(card, e); }, { passive: true });
      card.addEventListener("pointermove", function (e) { track(card, e); }, { passive: true });

      /* Deliberately NO pointerleave reset. Clearing --gx/--gy on exit snaps
         the gradient back to its 50% default instantly, while the opacity is
         still fading out over --d-2 (260ms) — so you see the light jump to
         the middle of the card as it dims. Leaving the values alone lets it
         fade out exactly where the cursor left, which is what a torch being
         carried off the edge actually looks like. */
    });
  }

  /* ------------------------------------------- hero name letter fill ---
     "Miranda." holds as an outline, then fills one letter at a time. This
     only flips a class; CSS owns the stagger via a per-letter
     transition-delay (see #hero-name.is-lit in css/style.css).

     The 1s is measured from the moment the name has actually APPEARED, not
     from DOMContentLoaded. The h1 fades in over 760ms via .reveal, so timing
     from document load would spend most of the outline phase behind an
     element still at opacity 0 — the reader would never see it. Waiting for
     .is-visible guarantees a full second of visible outline.

     Under reduced motion nothing is scheduled: the CSS already lands the
     letters filled, so adding the class would be a no-op anyway. */
  function initHeroNameFill() {
    var name = document.getElementById("hero-name");
    if (!name) return;
    if (prefersReduced) { name.classList.add("is-lit"); return; }

    var HOLD = 1000;
    var timer = null;

    function light() {
      if (timer) return;
      timer = window.setTimeout(function () { name.classList.add("is-lit"); }, HOLD);
    }

    if (name.classList.contains("is-visible")) {
      light();
      return;
    }
    /* initReveal() adds .is-visible from an IntersectionObserver callback, so
       watch the attribute rather than racing it. */
    if (!("MutationObserver" in window)) { light(); return; }
    var obs = new MutationObserver(function () {
      if (name.classList.contains("is-visible")) { obs.disconnect(); light(); }
    });
    obs.observe(name, { attributes: true, attributeFilter: ["class"] });

    /* Belt and braces: if .is-visible somehow never lands (observer support
       quirk, element clipped), fill anyway rather than leaving the name
       outlined forever at 1:1 contrast against the page. */
    window.setTimeout(function () { obs.disconnect(); light(); }, 3000);
  }

  /* ------------------------------------------------- scroll progress ---
     Thin marigold line across the bottom of the fixed header, tracking how
     far down the document you are.

     Lives here rather than in js/motion.js because it needs to work on EVERY
     page. projects.html and 404.html deliberately never load GSAP — none of
     motion.js's other targets exist on them — so a GSAP-driven bar appeared
     on index.html only, and vanished when you navigated. This version costs
     one element and one rAF-throttled scroll listener.

     The element is created here rather than sitting in the markup so it
     simply does not exist when it cannot work — nothing decorative left in
     the DOM for a screen reader to meet. */
  function initScrollProgress() {
    if (prefersReduced) return;
    var header = document.getElementById("siteHeader");
    if (!header) return;
    if (document.querySelector(".scroll-progress")) return;   // never double-inject

    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    header.appendChild(bar);

    var queued = null;

    function update() {
      queued = null;
      /* scrollHeight is read every time on purpose. projects.html shows one
         project at a time, so the document height changes whenever you switch
         — caching the max here would leave the bar reporting the previous
         project's length. */
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    }

    function schedule() {
      if (queued) return;
      queued = window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    /* Height changes that are not scrolls or resizes: switching project on
       projects.html, opening the mobile nav, a lazy image landing. */
    if ("ResizeObserver" in window) {
      new ResizeObserver(schedule).observe(document.body);
    }

    update();
  }

  /* ----------------------------------------------------------- boot ---- */
  function boot() {
    initStickyHeader();
    initMobileNav();
    initSmoothScroll();
    initScrollSpy();
    initReveal();
    initHeroBlobDrift();
    initOffscreenPause();
    initFilters();
    initImageProtection();
    initImpactGlow();
    initHeroNameFill();
    initScrollProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
