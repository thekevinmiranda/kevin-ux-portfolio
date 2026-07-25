(function () {
  "use strict";

  var triggers = Array.prototype.slice.call(document.querySelectorAll(".photo-trigger"));
  if (!triggers.length) return;

  var lightbox = document.getElementById("lightbox");
  var imgEl = document.getElementById("lightboxImg");
  var captionEl = document.getElementById("lightboxCaption");
  var closeBtn = document.getElementById("lightboxClose");
  var prevBtn = document.getElementById("lightboxPrev");
  var nextBtn = document.getElementById("lightboxNext");
  if (!lightbox || !imgEl || !closeBtn) return;

  var currentGroup = [];
  var currentIndex = -1;
  var lastFocused = null;

  /* --------------------------------------------------------- grouping --- */
  // Every trigger with the same data-gallery value belongs to the same
  // set, so prev/next only ever moves between images from the same
  // project's own gallery — not across the whole page. Triggers with no
  // data-gallery (standalone inline editorial images) form their own
  // one-item group, so prev/next simply won't show for those.
  function groupFor(trigger) {
    var key = trigger.getAttribute("data-gallery");
    if (!key) return [trigger];
    return triggers.filter(function (t) { return t.getAttribute("data-gallery") === key; });
  }

  function render() {
    var trigger = currentGroup[currentIndex];
    if (!trigger) return;
    var img = trigger.querySelector("img");
    if (!img) return;

    var fullSrc = trigger.getAttribute("data-full") || img.getAttribute("src");
    imgEl.src = fullSrc;
    imgEl.alt = img.getAttribute("alt") || "";

    if (captionEl) {
      var caption = trigger.getAttribute("data-caption") || img.getAttribute("alt") || "";
      captionEl.textContent = caption;
      captionEl.hidden = !caption;
    }

    var hasMultiple = currentGroup.length > 1;
    if (prevBtn) prevBtn.hidden = !hasMultiple;
    if (nextBtn) nextBtn.hidden = !hasMultiple;
  }

  function open(trigger) {
    try {
      currentGroup = groupFor(trigger);
      currentIndex = currentGroup.indexOf(trigger);
      if (currentIndex < 0) currentIndex = 0;
      lastFocused = trigger;

      render();

      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();

      document.addEventListener("keydown", onKeydown);
    } catch (err) {
      console.warn("Lightbox open failed silently:", err);
    }
  }

  function close() {
    try {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      imgEl.src = "";
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused) lastFocused.focus();
    } catch (err) {
      console.warn("Lightbox close failed silently:", err);
    }
  }

  function step(delta) {
    if (currentGroup.length < 2) return;
    currentIndex = (currentIndex + delta + currentGroup.length) % currentGroup.length;
    render();
  }

  function focusableInLightbox() {
    return [closeBtn, prevBtn, nextBtn].filter(function (el) {
      return el && !el.hidden && el.offsetParent !== null;
    });
  }

  function onKeydown(e) {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowLeft") { step(-1); return; }
    if (e.key === "ArrowRight") { step(1); return; }
    if (e.key === "Tab") {
      // Keep focus cycling within the lightbox's own controls instead of
      // letting Tab/Shift+Tab escape into the page underneath.
      var focusable = focusableInLightbox();
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      var active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (focusable.indexOf(active) === -1) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* ------------------------------------------------------------- wiring --- */
  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      open(trigger);
    });
  });

  closeBtn.addEventListener("click", close);
  if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });

  // Clicking the dark backdrop (but not the image/figure itself) closes.
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });
})();
