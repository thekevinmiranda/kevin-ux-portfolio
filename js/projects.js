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
  // Default to whatever the first sidebar link points at, so reordering the
  // groups in projects.html doesn't leave a stale hard-coded default here.
  var initialHref = links[0].getAttribute("href") || "#p1";
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

  // Scoped to #p12 — the Vibe-Coding project below reuses the same
  // .dp-node/.dp-circle/.dp-detail styling for its own step rail, and an
  // unscoped page-wide selector here would wire this widget's click
  // handling onto that project's nodes too.
  var allPhaseEls = Array.prototype.slice.call(document.querySelectorAll("#p12 .dp-node, #p12 .dp-segment"));

  function setActivePhase(phase) {
    allPhaseEls.forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-phase") === phase);
    });
  }

  allPhaseEls.forEach(function (el) {
    el.addEventListener("click", function () {
      var phase = el.getAttribute("data-phase");
      setActivePhase(phase);
      showDetail(phase);
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

/* ============================================================================
   Back to top — fixed circular button that appears once the user has
   scrolled down a bit, and scrolls back to the top of the page on click.
   ============================================================================ */
(function () {
  "use strict";

  var btn = document.getElementById("backToTop");
  if (!btn) return;

  var SHOW_AFTER = 480; // px scrolled before the button appears

  function toggleVisibility() {
    var scrolled = window.scrollY || document.documentElement.scrollTop || 0;
    btn.classList.toggle("is-visible", scrolled > SHOW_AFTER);
  }

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();

  btn.addEventListener("click", function () {
    try {
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    } catch (err) {
      console.warn("Back to top scroll failed silently:", err);
      window.scrollTo(0, 0);
    }
  });
})();

/* ============================================================================
   Vibe-Coding process rail (Vibe-Coding with Claude — "Process"). Same
   widget pattern as the Design Process project's Interactive Process Map
   (click a node, render its detail into the panel below) — scoped to its
   own #vcFlow/#vcDetail elements so the two widgets can't collide even
   though they share the same .dp-node/.dp-detail styling.
   ============================================================================ */
(function () {
  "use strict";

  var flow = document.getElementById("vcFlow");
  var detail = document.getElementById("vcDetail");
  if (!flow || !detail) return;

  var steps = {
    1: { tag: "manual", title: "Analyze incoming requests", text: "Requests come from the community forum, or from long-outstanding UI/UX issues that never made it up the engineering priority list — done solo, no Claude involved." },
    2: { tag: "solo", title: "Gather usage data with AI", text: "Before touching any code, use AI to pull usage data and other supporting evidence for the request." },
    3: { tag: "solo", title: "Decide the right approach", text: "Decide the right approach based on that evidence — not a guess." },
    4: { tag: "solo", title: "Design a solution", text: "Design the actual fix, shaping the UX before any code gets written." },
    5: { tag: "solo", title: "Vibe-code it", text: "Vibe-code the solution directly in the app's repository, using Claude Code." },
    6: { tag: "solo", title: "Test locally, raise a PR", text: "Test it locally, then raise a pull request — handing it to engineering as a ready-to-review change." },
    7: { tag: "eng",  title: "Engineering reviews & releases", text: "Engineering reviews, merges, tests, and releases it to production." },
    8: { tag: "manual", title: "Follow up with the customer", text: "Once it's live, follow up with the customer who posted the original request to let them know it's been delivered — done solo, no Claude involved." }
  };

  var tagLabels = { solo: "Solo · with Claude", manual: "Solo", eng: "Engineering" };

  function showDetail(step) {
    try {
      var info = steps[step];
      if (!info) return;
      var isEng = info.tag === "eng";
      var tagClass = isEng ? "dp-detail-tag dp-detail-tag--eng" : "dp-detail-tag";
      var tagLabel = tagLabels[info.tag] || "Solo";
      detail.innerHTML =
        '<span class="' + tagClass + '">' + tagLabel + '</span>' +
        '<p class="dp-detail-title">' + info.title + '</p>' +
        '<p class="dp-detail-step">' + info.text + '</p>';
    } catch (err) {
      console.warn("Vibe-coding detail render failed silently:", err);
    }
  }

  var nodes = Array.prototype.slice.call(flow.querySelectorAll(".dp-node"));

  nodes.forEach(function (el) {
    el.addEventListener("click", function () {
      nodes.forEach(function (n) { n.classList.toggle("is-active", n === el); });
      showDetail(el.getAttribute("data-vc-step"));
    });
  });
})();
