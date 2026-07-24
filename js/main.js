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

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          var active = map[entry.target.id];
          if (active) active.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { obs.observe(s); });
  }

  /* -------------------------------------------------- scroll reveal ---- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
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

  /* ------------------------------------------------- count-up stats ---- */
  function initCounters() {
    var nums = document.querySelectorAll(".num[data-count]");
    if (!nums.length) return;

    var run = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var valEl = el.querySelector(".val");
      if (!valEl) return;
      if (prefersReduced) { valEl.textContent = String(target); return; }
      var start = null;
      var dur = 1400;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        valEl.textContent = String(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(step);
        else valEl.textContent = String(target);
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      nums.forEach(run);
      return;
    }
    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          o.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { obs.observe(n); });
  }

  /* ------------------------------------------------- work filtering ---- */
  function initFilters() {
    var buttons = document.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll(".work-card");
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        cards.forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-cat") === filter;
          card.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  /* --------------------------------------------- testimonials slider --- */
  function initTestimonials() {
    var track = document.getElementById("tstTrack");
    var prev = document.getElementById("tstPrev");
    var next = document.getElementById("tstNext");
    var dotsWrap = document.getElementById("tstDots");
    if (!track) return;
    var cards = track.querySelectorAll(".tst-card");
    if (!cards.length) return;

    var scrollAmt = function () {
      var card = cards[0];
      var gap = parseFloat(getComputedStyle(track).columnGap || "24") || 24;
      return card.getBoundingClientRect().width + gap;
    };

    // build dots
    var dots = [];
    if (dotsWrap) {
      cards.forEach(function (_, i) {
        var d = document.createElement("button");
        d.type = "button";
        d.setAttribute("aria-label", "Go to testimonial " + (i + 1));
        d.addEventListener("click", function () {
          track.scrollTo({ left: scrollAmt() * i, behavior: prefersReduced ? "auto" : "smooth" });
        });
        dotsWrap.appendChild(d);
        dots.push(d);
      });
    }

    var updateUI = function () {
      var idx = Math.round(track.scrollLeft / scrollAmt());
      dots.forEach(function (d, i) { d.classList.toggle("active", i === idx); });
      var maxScroll = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= maxScroll;
    };

    if (prev) prev.addEventListener("click", function () {
      track.scrollBy({ left: -scrollAmt(), behavior: prefersReduced ? "auto" : "smooth" });
    });
    if (next) next.addEventListener("click", function () {
      track.scrollBy({ left: scrollAmt(), behavior: prefersReduced ? "auto" : "smooth" });
    });

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { updateUI(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", updateUI);
    updateUI();
  }

  /* ------------------------------------------------- contact form ------ */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    var note = document.getElementById("formNote");

    var setInvalid = function (input, bad) {
      var field = input.closest(".field") || (input.parentNode && input.parentNode.closest(".field"));
      if (field) field.classList.toggle("invalid", bad);
    };

    var validateEmail = function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#cf-name");
      var email = form.querySelector("#cf-email");
      var msg = form.querySelector("#cf-msg");
      var ok = true;

      if (name && !name.value.trim()) { setInvalid(name, true); ok = false; } else if (name) setInvalid(name, false);
      if (email && !validateEmail(email.value.trim())) { setInvalid(email, true); ok = false; } else if (email) setInvalid(email, false);
      if (msg && msg.value.trim().length < 2) { setInvalid(msg, true); ok = false; } else if (msg) setInvalid(msg, false);

      if (!ok) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid textarea");
        if (firstBad) firstBad.focus();
        if (note) note.classList.remove("show");
        return;
      }

      if (note) note.classList.add("show");
      form.reset();
    });

    // clear invalid state as the user fixes fields
    form.addEventListener("input", function (e) {
      var field = e.target.closest && e.target.closest(".field.invalid");
      if (field) field.classList.remove("invalid");
    });
  }

  /* ----------------------------------------------------------- boot ---- */
  function boot() {
    initStickyHeader();
    initMobileNav();
    initSmoothScroll();
    initScrollSpy();
    initReveal();
    initCounters();
    initFilters();
    initTestimonials();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
