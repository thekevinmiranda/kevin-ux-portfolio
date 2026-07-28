# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hiring managers and recruiters evaluating Kevin Miranda for senior UI/UX & Interaction Designer roles. Secondary readers include peers/design-community visitors (Dribbble/LinkedIn referrals) who land here for portfolio inspiration rather than hiring intent.

## Product Purpose

A personal portfolio that proves Kevin is a senior-level UX/Interaction designer worth hiring full-time — not a freelance/consulting pitch. Success is a hiring manager or recruiter coming away convinced of his seniority and reaching out, primarily via the Contact section or LinkedIn.

## Positioning

Real, in-depth enterprise B2B case studies (13 FourKites projects) with named customers (Frito-Lay, TJX, Dow, Unilever, BRP, USA Truck) and quantified outcomes (e.g. 40–60% faster component development, 18% executive engagement increase, 11–13% geofence accuracy improvement) — not generic mockups or unverifiable claims. The differentiator is depth and evidence: 10+ years taking supply-chain-visibility SaaS products from 0→1 and through complex redesigns, backed by real metrics a competing portfolio without in-house enterprise experience couldn't truthfully match.

## Operating Context

Static two-page site (`index.html` homepage + `projects.html` case-study library), no build tools/framework/bundler. Hosted as static files (GitHub Pages/Netlify-style hosting or any static file server); viewable directly via `file://` for basic checks. Case-study content in `projects.html` was adapted from real internal FourKites research material (Confluence/Jira/Slack/meeting notes) and deliberately scrubbed of internal-only detail before publishing (see README.md "Content conventions").

## Capabilities and Constraints

- Plain HTML/CSS/JS only — no framework, no bundler, no build step. Keep new work consistent with that (no introducing React/build tooling).
- Two pages share one design system (`css/style.css` + `css/projects.css`), driven by CSS custom properties on `:root` — a palette/type change should only ever need to happen in one place.
- `projects.html` is single-project-at-a-time (sidebar switches visibility, not continuous scroll), with hash deep-linking (`projects.html#p9`).
- Homepage's project-teaser filter taxonomy (Product/Systems/AI) must stay consistent with how the same project is categorized on `projects.html`.
- All `placehold.co` placeholders have been removed sitewide (including the homepage's placeholder-only Photography section) — a project's "Photos" section only exists where real screenshots are in place. Treat missing photo sections as known gaps to fill with real images, not as content to invent around.
- Not currently open to new opportunities — the commented-out "Available for projects" badge in `index.html` is inert leftover template markup, not a fact to revive or treat as current messaging.

## Brand Commitments

Name: Kevin Miranda. Title: Sr. UI/UX & Interaction Designer, based in Chennai, India. Existing visual identity (palette, type, logo) is already established in the current implementation — this file does not restate the visual system; see DESIGN.md (via `/impeccable document`) if that gets captured separately.

## Evidence on Hand

- 13 real FourKites UX case studies with named enterprise customers and direct quotes (Frito-Lay, TJX, Dow, Unilever, BRP, USA Truck), plus real project screenshots under `projects/<slug>/`.
- Real quantified outcomes cited throughout (see Positioning above), sourced from internal FourKites data and cleaned for external sharing.
- Career history: FourKites India (Sr. Interaction Designer, 2019–present), Inatech India (Jr. Product Designer, 2016–2019), 4th Switch (UI/UX Dev Intern, 2015–2016). Two internal design awards (FourKites Dream Team, 2019 & 2021) and CEO/CPO-level recognition.
- Absence to not fabricate around: some case-study images are still placeholders (not yet real screenshots) — do not invent finished visuals or claim a placeholder is a real product screenshot.

## Product Principles

- Evidence over assertion: every claim of impact should trace to a real, named result already in the case studies — never invent metrics, testimonials, or clients.
- Seniority is shown, not stated: depth of process (Context → Role → Strategy → Process → Artifacts → Impact) across real enterprise complexity is the credibility mechanism, more than adjectives.
- One design system, two pages: never let `index.html` and `projects.html` drift into contradicting each other (category labels, nav items, tokens).
- Static-first: no framework or build step should be introduced to solve a content or design problem that plain HTML/CSS/JS can already solve.

## Accessibility & Inclusion

No formally required standard confirmed. Existing implementation already includes baseline accessibility practices (skip-link, `aria-label`s, `aria-pressed`/`aria-expanded` states, alt text on all images) — preserve these; no additional requirement established beyond continuing that baseline.
