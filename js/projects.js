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
