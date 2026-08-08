/* ==========================================================================
   Motion layer — GSAP + ScrollTrigger.

   DESIGN RULE: this file is PURELY ADDITIVE. It never touches anything the
   existing vanilla motion system in main.js already animates.

   main.js owns:
     - .reveal entrance opacity/transform (IntersectionObserver + CSS)
     - .hero-blobs drift phase
     - offscreen loop pausing
   CSS owns:
     - .work-card / .work-card img / .work-overlay hover transforms

   So this file deliberately animates only things nothing else claims:
     1. Hero depth parallax   — scrub, on .wf-figure and .hero-blobs
     2. Impact number count-up — text content of .impact-num
     3. Timeline rail draw     — the --draw custom property on .tl-rail
   (The header scroll-progress bar used to live here. It moved to
    js/main.js so projects.html and 404.html get it too — neither loads GSAP.)

   If GSAP fails to load (CDN blocked, offline, corporate proxy), this file
   returns immediately and the site behaves exactly as it did before. Every
   effect below also has a correct no-JS resting state in CSS.
   ========================================================================== */
(function () {
  "use strict";

  if (!window.gsap) return;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (!ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  /* All motion lives inside a matchMedia block keyed to no-preference, so
     GSAP automatically reverts every tween and ScrollTrigger created here
     the moment the user switches on "reduce motion" — no manual teardown,
     and no stale inline styles left behind. */
  var mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", function () {

    /* ------------------------------------------- 1. hero depth parallax --
       The hero copy keeps its existing .reveal entrance. This adds the layer
       underneath it: as you scroll away, the wireframe figure and the blurred
       blob backdrop travel at different rates, so the hero gains depth
       instead of sliding away as one flat plane.

       scrub: 0.6 rather than true — a little lag reads as weight, and it
       smooths out the coarse wheel deltas on Windows trackpads. */
    var fig = document.getElementById("wfFig");
    var hero = document.querySelector(".hero");

    if (fig && hero) {
      /* Entrance. #wfFig deliberately does NOT carry .reveal — see the note
         in index.html. Two systems writing `transform` to one node fight,
         and GSAP's inline style wins, so GSAP owns this element outright.
         `y` and `yPercent` are separate transform channels in GSAP, so this
         entrance and the scroll parallax below compose instead of clobbering
         each other. */
      gsap.from(fig, {
        autoAlpha: 0,
        y: 26,
        duration: 0.9,
        delay: 0.15,
        ease: "power3.out"
      });

      /* Parallax. At scroll 0 this resolves to yPercent:0 / scale:1, so it
         contributes nothing visible while the entrance above is still
         playing. */
      gsap.to(fig, {
        yPercent: 14,
        scale: 0.97,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.6
        }
      });
    }

    /* Parallax the blob CONTAINER, never the individual .hero-blobs span
       elements. Each span is driven by a CSS @keyframes animation that sets
       `transform` directly, and in the CSS cascade animation declarations
       outrank normal author declarations — including inline style. GSAP
       writes inline style, so anything it set on a span would be silently
       ignored for as long as the keyframes run. The container has no
       animation of its own, so it is safe to transform, and the per-blob
       organic drift keeps running untouched inside it. */
    var blobWrap = document.querySelector(".hero-blobs");
    if (blobWrap && hero) {
      /* Slight overscan first: the container is inset:0 with overflow:hidden,
         so translating it without this would drag its clipping edge into
         view and cut a visible band across the bottom of the hero. */
      gsap.set(blobWrap, { scale: 1.12, transformOrigin: "50% 50%" });

      gsap.fromTo(blobWrap,
        { yPercent: -3 },
        {
          yPercent: 7,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1
          }
        }
      );
    }

    /* ------------------------------------------ 2. impact number count-up
       .impact-num values are not plain integers — they are strings like
       "40–60%", "4–5X", "90%+", "286%". Rather than hardcoding, parse every
       numeric run out of the original string, keep the surrounding
       characters as a template, and tick all the numbers up together. That
       way "40–60%" counts both halves of the range and keeps its en dash
       and percent sign exactly as authored. */
    /* A character that cannot appear in the source strings, used to mark
       where each number sat so the surrounding characters survive intact.
       Written as an escape, never as a literal NUL byte: a raw 0x00 in a
       source file makes git treat it as binary and breaks many editors. */
    var SENTINEL = "\u0000";

    gsap.utils.toArray(".impact-num").forEach(function (el) {
      var original = el.textContent;
      var values = [];
      var decimals = [];

      var template = original.replace(/\d+(?:\.\d+)?/g, function (match) {
        values.push(parseFloat(match));
        var dot = match.indexOf(".");
        decimals.push(dot === -1 ? 0 : match.length - dot - 1);
        return SENTINEL;
      });

      if (!values.length) return;

      var parts = template.split(SENTINEL);
      var proxy = values.map(function () { return 0; });

      function render() {
        var out = parts[0];
        for (var i = 0; i < proxy.length; i++) {
          out += proxy[i].toFixed(decimals[i]) + (parts[i + 1] || "");
        }
        el.textContent = out;
      }

      /* Start at zero only once the card is actually about to be seen —
         otherwise the page shows a wall of "0%" to anyone who lands
         mid-page or uses in-page search. */
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: function () {
          render();
          gsap.to(proxy, {
            endArray: values,
            duration: 1.1,
            ease: "power2.out",
            onUpdate: render,
            onComplete: function () { el.textContent = original; }
          });
        }
      });
    });

    /* -------------------------------------------- 3. timeline rail draw --
       .tl-rail's connecting line is a ::before pseudo-element, which GSAP
       cannot target directly. Instead the CSS reads scaleY from a --draw
       custom property (defaulting to 1, so the rail is fully drawn with no
       JS at all) and this animates that property from 0 to 1 as each entry
       scrolls through. */
    gsap.utils.toArray(".tl-item .tl-rail").forEach(function (rail) {
      gsap.fromTo(rail,
        { "--draw": 0 },
        {
          "--draw": 1,
          ease: "none",
          scrollTrigger: {
            trigger: rail.closest(".tl-item") || rail,
            start: "top 78%",
            end: "bottom 60%",
            scrub: 0.4
          }
        }
      );
    });

    /* No cleanup function needed. GSAP reverts every tween and ScrollTrigger
       created in this block automatically when the media query stops
       matching, and nothing here injects DOM any more — the scroll progress
       bar moved to js/main.js so it could work on pages that never load
       GSAP. Do NOT reintroduce a `.scroll-progress` teardown here: that
       element now belongs to main.js, and removing it from this block would
       delete it the moment someone toggled reduce-motion.
     */
  });

  /* Late-loading images and web fonts change element positions after the
     ScrollTriggers above were measured. Re-measure once everything settles,
     otherwise the parallax and rail draw fire at the wrong scroll offsets. */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); })
      .catch(function () {});
  }
})();
