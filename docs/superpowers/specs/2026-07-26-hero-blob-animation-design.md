# Hero blob animation redesign

## Problem
The hero section's ambient background (`.hero::before`, `.hero-blobs .b1`, `.hero-blobs .b2` in `css/style.css`) uses only 2-3 blurred circles on fixed, simple keyframe loops. Movement feels mechanical and sparse rather than organic.

## Solution
Replace with 5 independently-animated blurred gradient circles, pure CSS, no JS.

- **Markup**: extend `.hero-blobs` in `index.html` to 5 `<span>` elements (`b1`-`b5`), still `aria-hidden`.
- **Palette**: reuse existing tokens — marigold (`--marigold`, `--marigold-t`), the rust tone already used (`rgba(176,81,44,…)`), plus a sage-tinted variant (`--sage`) for variety. No new colors introduced.
- **Sizes**: 2 large circles (30–38vw), 3 smaller (16–22vw), mixed opacity/blur so they layer without looking uniform.
- **Movement**: each circle has its own `@keyframes` with 4-5 irregular waypoints (translate X/Y + scale, slight rotate on a couple), distinct duration (18s-38s) and delay so cycles never sync — this produces the "random floating" look without JS randomization.
- **Containment**: `.hero` keeps `overflow: hidden`; circles may wander near/past edges and get clipped cleanly.
- **Performance**: animate only `transform`/`opacity` (compositor-friendly), `filter: blur()` applied once per element, `will-change: transform`. At `max-width: 640px`, drop to 3 circles and reduce blur radius for low-power mobile GPUs.
- **Accessibility**: extend the existing `prefers-reduced-motion: reduce` rule to freeze all 5 circles (currently only covers `.hero::before` and `.hero-blobs span`, which will still match).
- **Browser support**: only `transform`, `opacity`, `filter: blur()`, `border-radius`, `radial-gradient` — no `backdrop-filter` or newer CSS needed.

## Out of scope
- No JS-based randomization (explicitly deferred per user preference for pure CSS reliability).
- No changes to hero copy, layout, or other sections.
