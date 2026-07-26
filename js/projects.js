(function () {
  "use strict";

  /* -------------------------------------------------- header height --- */
  // The site header is fixed, so the sidebar (and the "scroll main content
  // into view" step below) need to know its real height. Measure it and
  // expose it as a CSS variable, re-measuring on resize/font-load since it
  // can shift slightly.
  var header = document.getElementById("siteHeader");

  function setHeaderHeightVar() {
    if (!header) return;
    document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  }

  setHeaderHeightVar();
  window.addEventListener("resize", setHeaderHeightVar);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setHeaderHeightVar).catch(function () {});
  }
  window.setTimeout(setHeaderHeightVar, 500);

  /* -------------------------------------------------------- elements --- */
  var sidebar = document.getElementById("projSidebar");
  var navToggle = document.getElementById("projNavToggle");
  var navList = document.getElementById("projNavList");
  var projMain = document.querySelector(".proj-main");
  var links = Array.prototype.slice.call(document.querySelectorAll(".proj-nav-link"));
  var entries = Array.prototype.slice.call(document.querySelectorAll(".proj-entry"));
  var groups = Array.prototype.slice.call(document.querySelectorAll(".proj-group"));

  if (!sidebar || !links.length || !entries.length) return;

  /* ---------------------------------------------------- mobile toggle --- */
  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      var isOpen = navList.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    if (window.innerWidth > 900) navList.classList.add("is-open");
  }

  /* --------------------------------------------------- active sidebar --- */
  function setActiveLink(href) {
    links.forEach(function (l) {
      l.classList.toggle("active", l.getAttribute("href") === href);
    });
  }

  /* ---------------------------------------------- show one project only --- */
  // `targetId` is whatever the clicked link points at — usually a
  // .proj-entry id (e.g. "p9"), but for the Saved Views sub-link it's the
  // id of a .proj-subcard nested *inside* a .proj-entry (e.g.
  // "p5-saved-views"). Either way we resolve up to the containing entry,
  // show only that entry, show the matching group divider, and — if the
  // target itself wasn't the entry (i.e. it's the nested sub-project) —
  // scroll down to that nested card once it's visible.
  function showProject(targetId) {
    var targetEl = document.getElementById(targetId);
    if (!targetEl) return false;

    var entry = targetEl.classList.contains("proj-entry") ? targetEl : targetEl.closest(".proj-entry");
    if (!entry) return false;

    entries.forEach(function (e) {
      e.classList.toggle("is-active", e === entry);
    });

    var activeGroup = entry.getAttribute("data-group");
    groups.forEach(function (g) {
      g.classList.toggle("is-visible", g.getAttribute("data-group") === activeGroup);
    });

    return { entry: entry, isSubTarget: targetEl !== entry, targetEl: targetEl };
  }

  function goToProject(href, opts) {
    opts = opts || {};
    try {
      var id = href.replace(/^#/, "");
      var result = showProject(id);
      if (!result) return;

      setActiveLink(href);

      try {
        history.replaceState(null, "", href);
      } catch (err) {
        /* opaque-origin / sandboxed viewer: URL bar update is optional, ignore */
      }

      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Bring the new content into view. If it's the nested sub-project
      // (Saved Views), scroll to that specific card; otherwise scroll the
      // top of the project list into view — useful mainly on mobile where
      // the sidebar sits above the content.
      var scrollTarget = result.isSubTarget ? result.targetEl : (opts.userInitiated ? projMain : null);
      if (scrollTarget) {
        scrollTarget.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }

      if (window.innerWidth <= 900 && navList && opts.userInitiated) {
        navList.classList.remove("is-open");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
      }
    } catch (err) {
      console.warn("Project switch failed silently:", err);
    }
  }

  /* ------------------------------------------------------ click wiring --- */
  links.forEach(function (link) {
    link.addEventListener("click", function (e) {
      try {
        e.preventDefault();
        e.stopPropagation();
        goToProject(link.getAttribute("href"), { userInitiated: true });
      } catch (err) {
        console.warn("Project sidebar click handling failed silently:", err);
      }
    });
  });

  /* --------------------------------------------------------- initial --- */
  // Support deep-linking: if the page was loaded with a hash matching one
  // of the sidebar links (e.g. shared as projects.html#p9), open straight
  // to that project. Otherwise default to the first one.
  var initialHref = "#p1";
  if (window.location.hash) {
    var matchesKnownLink = links.some(function (l) { return l.getAttribute("href") === window.location.hash; });
    if (matchesKnownLink) initialHref = window.location.hash;
  }
  goToProject(initialHref, { userInitiated: false });
})();

/* ============================================================================
   Design Process project — interactive process-map widget
   (My Design Process, "Interactive Process Map"). Self-contained IIFE so
   showDetail can't collide with anything else on the page.
   ============================================================================ */
(function () {
  "use strict";

  var labels = { discover: "Discover", diagnose: "Diagnose", ideate: "Ideate", validate: "Validate", build: "Build", ship: "Ship" };
  var aiAssisted = { discover: false, diagnose: true, ideate: true, validate: true, build: false, ship: false };
  var nums = {
    pre: { discover: "01", diagnose: "02", ideate: "03–04", validate: "05–09", build: "10–12", ship: "13" },
    ai:  { discover: "01", diagnose: "02", ideate: "03",         validate: "04–08", build: "09–11", ship: "12" }
  };
  var steps = {
    discover: { pre: ["Find a problem"], ai: ["Find a problem"] },
    diagnose: { pre: ["Understand root cause & customer pain points"], ai: ["Understand root cause & customer pain points, aided by AI analysis"] },
    ideate: { pre: ["Brainstorm multiple solutions", "Evolve & iterate on the strongest idea"], ai: ["Leverage AI to research & generate solutions"] },
    validate: {
      pre: ["Create lo-fi wireframes", "Present lo-fi & gather UX/Product/Eng feedback", "Design hi-fi prototype, present & gather feedback", "Present hi-fi to customers & gather feedback", "Iterate on customer feedback"],
      ai: ["AI-generate lo-fi prototypes", "Review the AI artifact with UX & Product", "Iterate on feedback with AI, until approved", "AI-build a hi-fi prototype in the design system", "Gather feedback from stakeholders & customers"]
    },
    build: { pre: ["Final prototype, sign-off & handoff specs", "Hand over to Product & Engineering", "Run UXAT with engineering, fix issues"], ai: ["Create engineering handoff specs", "Hand over designs & assets to Engineering", "Run UXAT with engineering, fix issues"] },
    ship: { pre: ["Sign off & release to production"], ai: ["Sign off & release to production"] }
  };

  var detail = document.getElementById("dpDetail");
  if (!detail) return;

  function showDetail(phase) {
    try {
      var assisted = aiAssisted[phase];
      var html = '<p class="dp-detail-title">' + labels[phase] + '</p>';
      if (assisted) html += '<p class="dp-detail-tag">AI-assisted in the AI era</p>';
      html += '<div class="dp-detail-grid">';
      html += '<div><p class="dp-detail-col-label">Pre-AI &middot; ' + nums.pre[phase] + '</p>' +
        steps[phase].pre.map(function (s) { return '<p class="dp-detail-step">' + s + '</p>'; }).join('') + '</div>';
      html += '<div><p class="dp-detail-col-label">AI era &middot; ' + nums.ai[phase] + '</p>' +
        steps[phase].ai.map(function (s) { return '<p class="dp-detail-step">' + s + '</p>'; }).join('') + '</div>';
      html += '</div>';
      detail.innerHTML = html;
    } catch (err) {
      console.warn("Design process detail render failed silently:", err);
    }
  }

  document.querySelectorAll(".dp-node, .dp-segment").forEach(function (el) {
    el.addEventListener("click", function () {
      showDetail(el.getAttribute("data-phase"));
    });
  });
})();

/* ============================================================================
   Before/After compare slider (FourKites Redesign — "Before & After").
   Drag — mouse, touch, or pen, unified via the Pointer Events API — to
   reveal more or less of the "before" image layered over the "after"
   image. The handle is a native role="slider", fully operable from the
   keyboard (Arrow keys, Shift+Arrow for a bigger step, Home/End for the
   ends). Self-contained IIFE, vanilla JS, no dependencies.
   ============================================================================ */
(function () {
  "use strict";

  function setupSlider(root) {
    var beforeWrap = root.querySelector(".compare-slider__before-wrap");
    var handle = root.querySelector(".compare-slider__handle");
    if (!beforeWrap || !handle) return;

    var pos = 50;
    var dragging = false;

    function setPos(next) {
      pos = Math.min(100, Math.max(0, next));
      root.style.setProperty("--pos", pos + "%");
      handle.setAttribute("aria-valuenow", String(Math.round(pos)));
    }

    function posFromClientX(clientX) {
      var rect = root.getBoundingClientRect();
      if (!rect.width) return pos;
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function onPointerDown(e) {
      dragging = true;
      try { root.setPointerCapture(e.pointerId); } catch (err) {}
      setPos(posFromClientX(e.clientX));
      handle.focus();
      e.preventDefault();
    }
    function onPointerMove(e) {
      if (!dragging) return;
      setPos(posFromClientX(e.clientX));
    }
    function onPointerUp(e) {
      dragging = false;
      try { root.releasePointerCapture(e.pointerId); } catch (err) {}
    }

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);

    handle.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 10 : 3;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setPos(pos - step); e.preventDefault(); }
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") { setPos(pos + step); e.preventDefault(); }
      else if (e.key === "Home") { setPos(0); e.preventDefault(); }
      else if (e.key === "End") { setPos(100); e.preventDefault(); }
    });

    setPos(pos);
  }

  document.querySelectorAll("[data-compare-slider]").forEach(function (el) {
    try { setupSlider(el); } catch (err) { console.warn("Compare slider init failed silently:", err); }
  });
})();
