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
├── index.html              Homepage (hero, about, services, work teaser, testimonials, contact)
├── projects.html            Projects page — 13 FourKites case studies, sidebar-switched
├── css/
│   ├── style.css             Shared design system + all of index.html's page-specific styles
│   ├── projects.css          Everything specific to projects.html (sidebar, cards, lightbox, photo grids)
│   └── vendor/bootstrap.min.css   Reset + grid only — no Bootstrap components are used
├── js/
│   ├── main.js                Shared: sticky header, mobile nav, smooth-scroll, scrollspy, reveal-on-scroll,
│   │                           stat counters, testimonial carousel, work-grid filter (index.html only)
│   ├── projects.js            projects.html only: sidebar project switcher (see below)
│   ├── lightbox.js            projects.html only: click-to-enlarge image viewer
│   └── vendor/bootstrap.bundle.min.js
├── img/                      Template's own images (hero, about, homepage work-teaser tiles, testimonial headshots)
├── projects/                 ← Real project screenshots go here (currently empty — see "Images" below)
│   └── <project-slug>/         e.g. projects/workspace/flow.jpg
└── .gitignore
```

---

## `index.html` — Homepage

Standard one-pager: Hero → Tools marquee → About → Services → **Projects teaser**
(6 cards, filterable by category, each linking to a specific case study on
`projects.html#pN`) → Testimonials → Contact. Nav and footer are shared verbatim
with `projects.html` (same 5 items: Home / About / Projects / Services / Voices /
Contact — kept intentionally identical on both pages, see "Nav conventions" below).

## `projects.html` — Projects

This is the bulk of the custom work. Key architecture:

**Layout:** sticky left sidebar (project index, grouped into "Flagship Projects"
and "Additional Projects") + a content panel on the right. **Only one project is
rendered at a time** — clicking a sidebar link hides every other project and shows
just that one (`projects.js`), rather than a continuously-scrolling page. This
also supports hash deep-linking: `projects.html#p9` opens straight to project 9.

**Per-project structure** (`<article class="proj-entry" id="pN" data-group="...">`):
a one-liner, then `.proj-sub` blocks for Context, My Role, Design Strategy,
Process, Key Artifacts, Impact & Outcome, etc. — whichever apply. One project
(FourKites Redesign, `#p5`) has a nested sub-project card (`.proj-subcard`,
Saved Views) with its own sidebar entry.

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
   prev/next, since it illustrates one specific point in the text). Two live
   examples exist today: My Workspace (after the Process list) and Elemental
   Design System (in Design Strategy) — copy either one as a template.

**The lightbox** (`lightbox.js` + `#lightbox` markup at the end of `<body>`) is a
single reusable overlay for every clickable image on the page, gallery or inline.
Closes via ✕, backdrop click, or Escape; arrow keys navigate within a gallery.

---

## Nav conventions

Both pages share the exact same 5 nav items: **Home, About, Projects, Services,
Voices, Contact**. On `index.html` these are in-page anchors (`#home`, `#about`,
etc.) with a scroll-driven active state (`main.js`'s `initScrollSpy`). On
`projects.html`, "Home"/"About"/"Services"/"Voices"/"Contact" point back to
`index.html#...`, and "Projects" is a static self-link marked `class="active"`
(there's no scrollspy on this page for that item — it's just always active while
you're here). **Do not reintroduce a separate "Work" nav item** — the homepage's
project-teaser section was deliberately renamed from "Work" to "Projects" (`id`
included) so there's exactly one project-related nav concept across the site.

---

## Design system

Palette — deep-forest ink + warm marigold on warm paper:

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#14231C` | Footer, hero name, deepest text |
| `--forest` | `#1C3A2E` | Dark section backgrounds |
| `--forest-2` | `#244A3A` | Card surfaces on dark |
| `--paper` | `#F4F1E8` | Main light background |
| `--paper-2` | `#ECE7D9` | Alt light background / cards |
| `--marigold` | `#E6A017` | Primary accent (buttons, active states, links) |
| `--clay` | `#B0512C` | Rare secondary warm accent |
| `--sage` | `#6E8377` | Muted text on light backgrounds |

Type: **Bricolage Grotesque** (display — headings, quotes) + **Hanken Grotesk**
(body/UI). Both loaded via Google Fonts in each page's `<head>`.

All colors/fonts are CSS custom properties on `:root` in `style.css` —
`projects.css` reuses them rather than redefining anything, so a palette change
only ever needs to happen in one place.

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
- **Customer names, companies, and direct quotes are always kept and encouraged**
  — that's the strongest, most credible content on the page (e.g. Frito-Lay,
  TJX, Dow, Unilever, BRP, USA Truck all appear by name with real quotes).
- Don't add a subsection with no real content — omit it rather than showing an
  empty/placeholder label. **Real-Time Disruptions & Events** was cut entirely
  for this reason (no verified involvement found anywhere).

---

## Images

Two image sources are in play:

1. **`img/`** — the template's own homepage imagery (hero, about, work-teaser
   tiles, testimonial headshots). Leave these as-is unless redesigning the
   homepage itself.
2. **`projects/`** — currently empty, intended for real FourKites case-study
   screenshots, organized one subfolder per project (e.g.
   `projects/workspace/flow.jpg`, `projects/eds/color-tokens.jpg`).
   Every image in `projects.html` right now is a **placehold.co placeholder**
   (`https://placehold.co/600x400?text=Label`), one per project, labeled to
   match what it should eventually show. To replace one: swap the `src` on the
   relevant `<img>` to the local path (e.g.
   `src="projects/workspace/flow.jpg"`), and update its `alt` text to describe
   the real image. No other markup needs to change — same `<figure>`/`<button>`
   wrapper, same lightbox behavior.

---

## Housekeeping

`README.txt` is the original uiCookies template description (kept for
attribution/reference); this `README.md` is the canonical project doc going
forward.

---

## Adding a new project to `projects.html`

1. Duplicate an existing `<article class="proj-entry" id="pN" data-group="...">`
   block, give it the next `id` (e.g. `p14`) and the correct `data-group`
   (`"flagship"` or `"additional"`).
2. Add a matching `<li><a class="proj-nav-link" href="#p14">...</a></li>` to the
   sidebar list in the same file.
3. That's it — `projects.js` selects everything by class/attribute, not by a
   hardcoded list, so no JS changes are needed.
