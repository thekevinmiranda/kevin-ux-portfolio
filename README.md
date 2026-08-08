# Kevin Miranda — UX Portfolio

Personal portfolio site for Kevin Miranda (UI/UX & Interaction Designer). Built on
the free "Persona" template by uiCookies and substantially customized to add a
dedicated **Projects** page with 13 in-depth FourKites UX case studies.

**No build tools, no framework, no bundler.** Two hand-written static HTML pages
sharing one design system. Open `index.html` directly in a browser, or serve the
folder with any static file server (e.g. `npx serve`, GitHub Pages, Netlify).

---

## Running locally

Opening `index.html` directly (double-clicking, or `file://` in the browser) works
for basic viewing, but some browsers restrict certain behavior on `file://` pages
(and it's generally worth testing over `http://` to match how it'll behave once
deployed). The simplest way to serve it locally is with `serve`, via `npx` — no
install, no config, nothing to add to the project:

```bash
# from the project's root folder (the one containing index.html)
npx serve
```

This starts a local static server and prints a URL (usually
`http://localhost:3000`) — open that in your browser. `npx` downloads `serve`
temporarily if it isn't already installed, so the only prerequisite is
[Node.js](https://nodejs.org) being installed. Stop the server with `Ctrl+C` in
the terminal when you're done.

A couple of optional flags:

```bash
npx serve -p 5000       # use a specific port instead of the default
npx serve -l tcp://0.0.0.0:3000   # listen on your local network too, e.g. to preview on your phone
```

---

## File structure

```
├── index.html              Homepage (hero, about, experience/education timeline,
│                             leadership & recognition, projects teaser, impact, contact)
├── projects.html            Projects page — 13 FourKites case studies, sidebar-switched
├── css/
│   ├── style.css             Shared design system + all of index.html's page-specific styles
│   ├── projects.css          Everything specific to projects.html (sidebar, cards, lightbox, photo grids, sticker sheet)
│   └── vendor/bootstrap.min.css   Reset + grid only — no Bootstrap components are used
├── js/
│   ├── main.js                Shared: sticky header, mobile nav, smooth-scroll, scrollspy,
│   │                           reveal-on-scroll, work-grid filter (index.html only)
│   ├── projects.js            projects.html only: sidebar project switcher (see below)
│   ├── lightbox.js            projects.html only: click-to-enlarge image viewer
│   └── vendor/bootstrap.bundle.min.js
├── img/                      Template's own images (hero, about photo, homepage work-teaser tiles)
├── projects/                 Real project screenshots, one subfolder per project
│   └── <project-slug>/         e.g. projects/workspace/flow.jpg
└── .gitignore
```

**Before committing:** run `git status` and check what's staged. Screenshots or
source material used while drafting a case study can occasionally land in the
project root during editing — review anything outside the established folders
(`css/`, `js/`, `img/`, `projects/`) before a blanket `git add .`.

---

## `index.html` — Homepage

One-pager: Hero → Tools marquee → About → **Experience** (a single timeline
mixing work history and education — see below) → Leadership & Recognition →
**Projects teaser** (6 cards, linking to the same 6 case studies highlighted on
`projects.html`, each tagged `#pN`) → Quantifiable Impact → Contact. Nav and
footer are shared with `projects.html` (see "Nav conventions" below).

The **Experience** timeline (`#experience`) lists work history newest-first,
then education — currently Kevin's MCA (2013–2016). Each entry (`.tl-item`) has
a date-range + duration badge, a title (`h3`), an employer/institution name
(`.tl-meta`, linked to the org's site where one exists — no link for 4th
Switch, which has none), an optional description, and a plain-text date range
(`.tl-range`).

The teaser section's filter buttons use a 3-category taxonomy that mirrors how
the case studies are framed: **Product**, **Systems**, **AI** (plus **All**).
Each `.work-card` carries `data-cat="product|systems|ai"` to match. Keep new
teaser cards' categories consistent with how the same project is framed on
`projects.html` — the two pages should never contradict each other on what a
project "is."

## `projects.html` — Projects

This is the bulk of the custom work. Key architecture:

**Layout:** sticky left sidebar (project index, grouped into "Highlighted
Projects" and "Additional Projects") + a content panel on the right. **Only one
project is rendered at a time** — clicking a sidebar link hides every other
project and shows just that one (`projects.js`), rather than a
continuously-scrolling page. This also supports hash deep-linking:
`projects.html#p9` opens straight to project 9.

The six **Highlighted Projects**, in order, are: Elemental Design System (`#p1`),
My Workspace (`#p2`), FourKites Redesign (`#p3`), FourSight AI (`#p4`), Address
Manager (`#p5`), Unified User Management (`#p6`). Everything else lives under
Additional Projects (`#p7`–`#p13`). Note the group is labeled "Highlighted
Projects" in the UI, but internally each `<article>`/nav link still uses
`data-group="flagship"` for that group (vs. `"additional"`) — this is just an
internal attribute value, not something users see, so it wasn't renamed when the
visible label changed. Don't be thrown by the mismatch in future edits.

**Per-project structure** (`<article class="proj-entry" id="pN" data-group="...">`):
a one-liner, then `.proj-sub` blocks for Context, My Role, Design Strategy,
Process, Key Artifacts, Impact & Outcome, etc. — whichever apply. One project
(FourKites Redesign, `#p3`) has a nested sub-project card (`.proj-subcard`,
`id="p3-saved-views"`) with its own sidebar entry.

**Photos, two kinds:**
1. **Gallery** — a "Photos" `.proj-sub` at the end of a project, containing any
   number of `.photo-card` thumbnails in a `.proj-photo-grid` (CSS `auto-fill`/
   `minmax`, so it adapts to 1 image or 8 without layout changes). Click a
   thumbnail to open it in the lightbox; if a project has multiple photos, ‹ ›
   arrows step through that project's own set only (grouped via
   `data-gallery="pN"` on each `.photo-trigger` button).
2. **Inline editorial image** — `.proj-inline-figure`, a full-width image dropped
   directly inside a `.proj-sub`'s prose (newspaper-article style), with an
   italic caption underneath. Also opens in the lightbox, but standalone (no
   prev/next, since it illustrates one specific point in the text). Add
   `proj-inline-figure--fit` alongside the base class when the image must show
   in full rather than being cropped to 16:9 (e.g. a tall diagram or IA tree) —
   it switches from `object-fit: cover` to `object-fit: contain`.

**The lightbox** (`lightbox.js` + `#lightbox` markup at the end of `<body>`) is a
single reusable overlay for every clickable image on the page, gallery or inline.
Closes via ✕, backdrop click, or Escape; arrow keys navigate within a gallery.

---

## Nav conventions

Both pages share the same 6 header nav items: **Home, About, Experience, Work,
Impact, Contact**. On `index.html` these are in-page anchors (`#home`, `#about`,
`#experience`, `#projects`, `#impact`, `#contact`) with a scroll-driven active
state (`main.js`'s `initScrollSpy`). "Work" points at the `#projects` id — same
label/id mismatch as `data-group="flagship"` above, so don't be thrown by it.

On `projects.html`, "Home" points to `index.html` (not an anchor), the rest
point back to `index.html#...`, and "Work" is a static self-link to
`projects.html` marked `class="active"` (no scrollspy needed — it's just
always active here).

The footer nav (`.footer-col`, both pages) repeats the same items minus Home,
since the footer's own logo/brand link already covers that.

Leadership & Recognition (`#leadership`) is a real homepage section, but isn't
in the nav or footer — it isn't distinct enough from Experience to warrant its
own slot.

---

## Design system

Palette — deep-forest ink + warm marigold on warm paper:

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#14231C` | Footer, hero name, deepest text, `.proj-sub h4` titles |
| `--forest` | `#1C3A2E` | Dark section backgrounds |
| `--forest-2` | `#244A3A` | Card surfaces on dark |
| `--paper` | `#F4F1E8` | Main light background |
| `--paper-2` | `#ECE7D9` | Alt light background / cards |
| `--marigold` | `#E6A017` | Primary accent — backgrounds, icons, borders, on-dark text only (fails 4.5:1 as text on light) |
| `--marigold-d` | `#C0810A` | Accent hover/darker — same usage rule as `--marigold` |
| `--marigold-t` | `#F6E4B4` | Light accent tint — callouts, active sidebar link background |
| `--marigold-text` | `#8A600D` | Marigold-family text color for light backgrounds — meets 4.5:1 where `--marigold`/`--marigold-d` don't |
| `--clay` | `#B0512C` | Rare secondary warm accent |
| `--sage` | `#58685F` | Muted text on light backgrounds — darkened from an earlier `#6E8377` to meet 4.5:1 on `--paper` |
| `--sage-d` | `#A9BBAF` | Muted text on dark backgrounds |

Type: **Bricolage Grotesque** (display — headings, quotes) + **Hanken Grotesk**
(body/UI), plus **Lato** (loaded specifically for the Component Sticker Sheet,
matching the source design system's own typeface). All loaded via Google Fonts
in each page's `<head>`.

All colors/fonts are CSS custom properties on `:root` in `style.css` —
`projects.css` reuses them rather than redefining anything (outside the sticker
sheet's intentionally-separate token block), so a palette change only ever needs
to happen in one place.

### Rule: the Component Sticker Sheet is always Lato

**Every piece of type inside `.sticker-sheet` must render in Lato**, because the
sheet is a live reproduction of the real Elemental Design System and Lato is that
system's official typeface. The site's own fonts (`--f-display` /
`--f-body` — Bricolage Grotesque and Hanken Grotesk) must never appear inside
the sheet.

This is enforced by a single scoped rule near the top of the sticker-sheet block
in `projects.css`:

```css
.sticker-sheet,
.sticker-sheet * { font-family: 'Lato', sans-serif; }
```

Consequences for future edits:

- New components added to the sheet **do not** need their own `font-family`
  declaration — they inherit Lato automatically.
- Never override `font-family` inside `.sticker-sheet` with a site font or a
  `var(--f-*)` token.
- Don't delete the rule on the assumption it's redundant. It isn't: several
  sheet elements (`.sticker-group-label`, `.eds-approx`, `.eds-caption`,
  `.swatch-name`, `.swatch-hex`, `.eds-caret`) have no `font-family` of their own
  and would silently fall back to the site's body font without it.
- Lato is loaded via the Google Fonts `<link>` in **`projects.html`'s `<head>`
  only** — that's the only page the sticker sheet lives on. `index.html` does
  not load Lato and doesn't need to. If a sticker sheet is ever added to another
  page, add Lato to that page's font link too, or the whole sheet silently falls
  back to a system sans.

---

## Known CSS gotchas

A couple of non-obvious behaviors that have caused real bugs in this codebase —
worth knowing before debugging something that looks like it "should" work:

- **`ul { list-style: none; }` is a global reset** in `style.css`, applied to
  every list on the site (used for nav lists, card grids, etc.). Any new prose
  content with a genuine bulleted list needs to explicitly restore markers in
  its own scope (see `.proj-sub ul` in `projects.css`) — otherwise the list
  renders with no visible bullets at all.
- **`overflow-y: auto` silently forces `overflow-x` to `auto` too** (per the CSS
  overflow spec, whenever one axis is non-`visible` and the other isn't set).
  `.proj-sidebar` relies on `overflow-y: auto` for its scrollable nav, which
  means anything relying on negative margins to "bleed" past its own box (a
  common trick for full-width hover/active pill backgrounds) gets silently
  clipped flush at the container edge — including any rounded corners on that
  edge. If a pill/highlight background looks flush and square no matter how
  much padding or border-radius you add, this is the first thing to check.
  `.proj-nav-link`'s active/hover background is sized with plain padding for
  this reason, not a margin bleed.
- **Visually-hidden checkboxes/radios need `position: relative` on the wrapping
  `<label>`.** The pattern used throughout (toggle/checkbox/radio, and the
  sticker sheet's controls) hides the real `<input>` with
  `position: absolute; opacity: 0`. Without `position: relative` on the label,
  the input's containing block becomes some distant ancestor instead, and its
  hit target can drift away from the visible control — the control looks
  present but stops responding to clicks.

---

## Content conventions (for editing case-study copy)

`projects.html`'s case studies were compiled from real internal FourKites
research (Confluence, Jira, Slack, meeting notes) and then deliberately cleaned
for an external audience. When editing or adding content, keep to these rules:

- **No internal ticket/issue IDs** (no `FD-###`, `TRACNG-#####`, Jira links, etc.)
  and no internal tool names in body copy (Confluence, Jira, Slack, "UXAT").
- **No named internal FourKites colleagues** — refer to "Product," "Engineering,"
  "the design team," or similar. Never a specific person's name unless they're a
  named product/company entity relevant externally.
- **No confidential or internal-only information** of any kind (roadmap details,
  internal metrics not meant for external sharing, screenshots containing
  internal usernames, etc.).
- **Customer names, companies, and direct quotes are always kept and encouraged**
  — that's the strongest, most credible content on the page (e.g. Frito-Lay,
  TJX, Dow, Unilever, BRP, USA Truck all appear by name with real quotes).
- Don't add a subsection with no real content — omit it rather than showing an
  empty/placeholder label. **Real-Time Disruptions & Events** was cut entirely
  for this reason (no verified involvement found anywhere).

---

## Images

Two image sources are in play:

1. **`img/`** — the template's own homepage imagery (hero, about photo,
   work-teaser tile icons). Leave these as-is unless redesigning the homepage
   itself.
2. **`projects/`** — real FourKites case-study screenshots, organized one
   subfolder per project (e.g. `projects/workspace/fourkites-ia.png`). All
   placehold.co placeholders have been removed sitewide — any project's
   "Photos" section without real screenshots yet was removed along with them
   rather than left empty. To add a new photo to a project: drop the image in
   its `projects/<name>/` subfolder and add a `<figure>`/`<button>` block
   (matching the pattern used elsewhere) with the real `src` and `alt` text —
   same lightbox behavior applies automatically via `data-gallery`.

---

## Working with an AI coding session

If you're picking this up in a fresh Claude/Cowork session with no memory of
prior edits: this file plus a `git status`/`git log` check should be enough
context to start. A couple of environment notes that otherwise cause confusion:

- A sandboxed session generally has **no GitHub push credentials** — it can
  edit files and commit locally (if working directly against your machine's
  copy of the repo), but pushing to GitHub has to be done by you afterward.
- Always confirm before committing/pushing anything — don't assume silence
  means "go ahead."

---

## Housekeeping

`README.txt` is the original uiCookies template description (kept for
attribution/reference); this `README.md` is the canonical project doc going
forward.

---

## Adding a new project to `projects.html`

1. Duplicate an existing `<article class="proj-entry" id="pN" data-group="...">`
   block, give it the next `id` (e.g. `p14`) and the correct `data-group`
   (`"flagship"` for Highlighted Projects, or `"additional"`).
2. Add a matching `<li><a class="proj-nav-link" href="#p14">...</a></li>` to the
   sidebar list in the same file.
3. That's it — `projects.js` selects everything by class/attribute, not by a
   hardcoded list, so no JS changes are needed.
