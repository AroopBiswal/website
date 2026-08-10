# CLAUDE.md — Aroop's Personal Website

> Claude should update this file after every significant iteration with new learnings, architectural decisions, and patterns discovered.

---

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 import + plain CSS classes in `globals.css` (the design system is mostly custom CSS, not Tailwind utilities)
- **Fonts**: Fredoka (hero/sticker buttons), DM Sans (body), Inter (cards/headings), Space Grotesk (nav / menu bar) via `next/font/google`
- **React**: v19

Run dev server: `npm run dev`

---

## Design (scroll-redesign branch, Aug 2026)

**Playful hero, modern everything else.** Originally ported from a Claude Design mockup at
`/Users/aroop/Documents/Programming/Designs/PersonalWebsiteRedesign/Aroop Site.dc.html` (still the reference for the playful bits), since evolved. The split (user-directed): the **hero/title area keeps the full neo-brutalist treatment** (outlined Fredoka name, googly eyes, blobs, hard-shadow stickers/chips), while the rest of the site is a clean product look — hairline borders, soft elevation, no hard offset shadows.

Key traits:
- Near-white neutral background (`#FAFAFB` light / `#101215` dark) — replaced the original warm cream to read more professional; cards separate via border + soft `--card-shadow`, not bg contrast
- **Top-only frame**: a 1.5px line across the top that rounds the corners, drops ~66px down each side, and ends with a round cap. Built as two fixed-size SVG end-pieces (`FrameEnd` in `shell.tsx`) + a stretchy `border-top` div between them, so the corner geometry never distorts with viewport width. No side/bottom borders. The nav "breaks" the line on desktop; on ≤860px the SVG ends are hidden (the wrapped nav covers the whole run, so drops would dangle unconnected) — mobile effectively has no frame. A spiral-curl variant of the ends was tried and rejected as fussy at 1.5px stroke.
- Hero only: thick black borders + hard offset shadows (`4px 4px 0`) on stickers/chips. Cards/nav/contact use `--hairline` borders + soft shadows (`--card-shadow`, `--card-shadow-hover`); nav active state is a solid ink pill; theme toggle is a ghost button; kickers are `--accent` (blue, lighter in dark mode); linked project rows get a muted ↗; contact card is border-less red with a red glow shadow (`box-shadow: none` in dark) and `.contact-link` white pills
- **Googly eyes that follow the cursor** everywhere — including as the "oo" in "Aroop" in the hero
- Floating blob characters with eyes on the home section
- **Two scrolling pages** (no longer a tabbed SPA): `/` scrolls Home → Work → Projects → Contact; `/about` is its own scrolling page. See "Scroll architecture" below.
- Light/Dark theme toggle (button in nav), applied as `html[data-theme="dark"]`. Priority (init script in `layout.tsx`, runs pre-paint to prevent flash): explicit toggle choice in `localStorage("site-theme")` → system `prefers-color-scheme` → **dark** as final fallback. Hero name keeps white fill + dark stroke in both themes (`--hero-fill`/`--hero-stroke` only set in `:root`).

### Tokens (CSS vars in `globals.css`)
| Var | Light | Dark |
|---|---|---|
| `--bg` | `#FAFAFB` | `#101215` |
| `--panel` | `#FFFFFF` | `#191C21` |
| `--ink` | `#14161A` | `#EEF0F4` |
| `--line` | `#14161A` | `#EEF0F4` |
| `--muted` | `#5F6672` | `#98A0AD` |
| `--shadow` | `#14161A` | `transparent` |
| `--card-shadow` | soft 2-layer | `none` |
| `--card-shadow-hover` | deeper 2-layer | `none` |
| `--hairline` | `rgba(20,22,26,.12)` | `rgba(238,240,244,.14)` |
| `--accent` | `#2E4BD8` | `#8B9DFF` |

Geometry vars (drive the fixed chrome): `--nav-top`, `--nav-h` (**measured at runtime**, see below), `--frame-inset-x`, `--frame-top`, `--content-pad-x`.

Accent palette (hard-coded, borders stay `#151310` in both themes): red `#E5372A`, blue `#2E4BD8`, yellow `#FFC93C`, green `#6FB92C`, orange `#F5821F`; interest chips use `#F59E0B` `#3B82F6` `#10B981` `#F43F5E` `#F97316`.

### Key CSS classes (`globals.css`)
`.site-root` / `.frame-top`(+`.frame-top-line`) / `.site-gutter-top` / `.site-nav` / `.site-content` (shell) · `.section`(+`.section-center`) · `.scroll-cue` · `.navbtn`(+`.active`) · `.theme-toggle` · `.eye`/`.pupil` · `.sticker` (big hero button w/ hard shadow, `--tilt` var controls hover rotation) · `.chip-btn` (small hero button) · `.card` / `.work-card` · `.project-row` · `.contact-link` · `.about-intro` · `.interest-chip` · `.dot` / `.about-dots`

### Scroll architecture (the non-obvious part)

The **document** scrolls; the frame and nav are `position: fixed` layers on top of it. Z-order matters:

| z | layer | why |
|---|---|---|
| 5 | `.site-content` | the scrolling content |
| 8 | `.site-gutter-top` | opaque `--bg` strip that hides content *before* it reaches the frame line (no bottom gutter — the frame is top-only) |
| 9 | `.frame-top` | the line + SVG curl end-pieces, drawn over the gutter so it stays crisp |
| 10 | `.site-nav` | its own `--bg` block is what "breaks" the top border |

Without the gutter, scrolling text would visibly cross the frame line. Its height is
`calc(var(--nav-top) + var(--nav-h) + 6px)`, so content disappears just under the nav.

**`--nav-h` is measured, not hardcoded** — the nav wraps to 2 rows on phones. `SiteNav` publishes
`el.offsetHeight` to `document.documentElement` via a `ResizeObserver`; the gutter height *and* every
`.section`'s top padding key off it. Hardcoding it breaks mobile.

Sections are `min-height: 100dvh` and grow when content is taller (Work does). Anchors work natively
(`html { scroll-behavior: smooth }` + `#work` hrefs) — no JS navigation, so deep links and SSR both just work.
`scroll-padding-top` is deliberately **0**: each section's own top padding already clears the nav.

---

## File Structure

```
app/
  layout.tsx           # Fonts (Fredoka/DM Sans/Inter/Space Grotesk), metadata, theme no-flash init script
  page.tsx             # Server Component: fetches Notion, renders <Site />
  globals.css          # Tokens, keyframes, all design-system classes, responsive rules
  about/page.tsx       # Real /about route (metadata) → renders <AboutView />
  components/
    shell.tsx          # SHARED by both pages: LINKS, <Eye>, useGooglyEyes, useScrollSpy,
                       #   useTheme, <SiteNav>, <ScrollCue>, <SiteChrome> (frame + gutters)
    site.tsx           # "/" — Home/Work/Projects/Contact sections in one scroll
    about-view.tsx     # "/about" — intro / photos / at-a-glance sections + side dots
public/photos/         # Carousel photos (photo1-3.jpg)
public/resume.pdf
```

- `site.tsx`: **Work and Projects content comes from Notion at build time** (see below), passed into `<Site work={...} projects={...} />` as props. Sections are local components (`HomeSection`, `WorkSection`, `ProjectsSection`, `ContactSection`) — all mounted at once, since the page scrolls.
- `about-view.tsx`: owns the still-hardcoded `INTERESTS`, `PHOTOS`, `GLANCE` consts — edit those to change About content.
- `shell.tsx`: owns `LINKS`. `<SiteNav page="home"|"about">` decides whether section links are `#work` or `/#work`, so the same nav serves both pages.

## Data source (Notion, build-time)

Work & Projects content lives in two Notion databases, fetched **at build time only** — static HTML, no ISR/runtime fetching (deploy = manual redeploy to pick up edits).
- `lib/notion.ts` — `getWork()` → `{ featured, jobs }` (lowest `Order` = featured card), `getProjects()` → `Project[]` (`num` derived from `Order`). Uses `@notionhq/client` v5 (data-source API: resolves DB ID → data source via `databases.retrieve`, then `dataSources.query`). Throws a build-breaking error if env vars missing or a DB returns 0 rows (never ships an empty page).
- `app/page.tsx` — async Server Component, `export const dynamic = "force-static"`, fetches both in parallel, passes as props.
- **Env** (`.env.local`, git-ignored; also set in Vercel → Env Variables): `NOTION_TOKEN`, `NOTION_WORK_DB_ID` (`3a0e7c7c7bb480dc86a8da469436dfab`), `NOTION_PROJECTS_DB_ID` (`192d1b1ef9974e7496639f3efc7b4c4d`). Integration must be shared with **both** DBs.
- **Work DB** props: `Company` (title), `Role`, `Period`, `Blurb` (rich text), `Order` (number). **Projects DB** props: `Title` (title), `Description` (rich text), `Tags` (multi-select), `Link` (url), `Date` (date — unused by site yet), `Order` (number).
- **See an edit**: `npm run build` re-fetches; a refresh alone won't (baked). `npm run dev` re-runs per request, so dev + browser refresh works for quick iteration.

## Behaviors

- **Nav = anchors**: plain `<a href="#work">` (or `/#work` from `/about`). `/#work`, `/#contact` deep-link natively; no JS routing, no `history` calls. The active pill comes from `useScrollSpy` (IntersectionObserver, `rootMargin: "-45% 0px -50% 0px"` — whichever section crosses the ~45% reading line wins). Scroll position is **not** written back to the hash (that reads as jarring).
- **Eyes**: one global `mousemove` listener + rAF updates every `.pupil` via DOM. The DOM is re-queried each frame, so eyes mounted later are picked up automatically — no dependency wiring needed.
- **`/about`**: 3 document-scrolled sections (intro/interests, photo carousel, at-a-glance) + fixed side dots driven by the same `useScrollSpy`; dots call `scrollIntoView`. Photo carousel is translateX-based with real photos. Scroll-snap was **removed** with the tab layout — full-height sections in a document scroll don't need it and it fought tall content.
- **Responsive**: media query at 860px — nav wraps (and `--nav-h` grows to match), grids collapse to 1 column, side dots + decorative blobs hidden, frame hugs the edge.
- **Scrollbars are hidden** (`html { scrollbar-width: none }`), matching the framed look; the "Scroll" cues at the bottom of the first screen are the affordance.

## Content notes

- Hero + featured Work card say **Google (SWE, Google Cloud, 2026—Now)** — came from the newer design mockup, not the old site (which said Meta). Google card has only a one-line blurb; add real bullets when available.
- Contact links: aroopbiswal@gmail.com, github.com/AroopBiswal, linkedin.com/in/AroopBiswal, /resume.pdf

---

## Iteration Log

| Date | Change |
|---|---|
| Initial | Dark charcoal multi-page site (hero, experience, projects, contact + /about page) |
| … | (see git history for pre-redesign iterations) |
| Jul 2026 | **Full redesign** on `redesign` branch: ported neo-brutalist Claude Design mockup — tabbed single-screen SPA, googly eyes, light/dark toggle, Fredoka/DM Sans/Inter. Old Navbar/AccentWheel/PhotoCarousel components deleted; /about now redirects to /#about. Populated with real content (Meta $59M, Aggieworks, Meaku, Valley Tech, Intel; Notion Budget Sync, Clubly, Expense Splitter). |
| Jul 2026 | **Notion data source** on `notion-db` branch: Work & Projects content moved out of hardcoded consts into two Notion DBs, fetched at build time via `lib/notion.ts` (`@notionhq/client` v5) + `app/page.tsx` (`force-static` async Server Component, props into client `<Site>`). Fully static, manual-redeploy strategy — no ISR/runtime fetching. Loud-fail on missing env / empty DB. Verified: live content bakes into static `index.html`. |
| Aug 2026 | **Top-only frame** (same branch): the full viewport border became a top-only line — across the top, rounded corners, short drops on each side. First iteration ended the drops in spiral curls (user request), then user delegated the call and the curls were dropped as fussy — final: ~66px drops with round caps (`FrameEnd` SVGs + stretchy `border-top` div), SVG ends hidden ≤860px. `.site-frame`, `.site-gutter-bottom`, `--frame-bottom` removed. |
| Aug 2026 | **Modern pass** (same branch): hero kept fully neo-brutalist per user; everything else refined — nav active = solid ink pill (no border/offset shadow), ghost theme toggle, cards on hairline borders + soft/hover elevation, blue `--accent` kickers (Space Grotesk, larger clamp()ed titles), linked project titles get ↗, contact card rebuilt (border-less red w/ red-glow shadow, "Let's connect" heading + `.contact-link` white pills), frame thinned to 1.5px/24px radius. |
| Aug 2026 | **Scroll redesign** on `scroll-redesign` branch: killed the tabbed SPA. `/` is now one continuous scroll (Home → Work → Projects → Contact) and **About moved to its own scrolling page at `/about`** (was a redirect to `/#about`). Nav became plain anchors + `useScrollSpy`; shared chrome extracted to `components/shell.tsx`; new `components/about-view.tsx`. Fixed frame/nav over a scrolling document needs the `.site-gutter` strips + measured `--nav-h` (see "Scroll architecture"). Nav/menu font → **Space Grotesk**. Light mode moved off cream to near-white `#FAFAFB` (dark → neutral `#101215`) with soft card elevation + hairline rules, for a more professional read. Section headers are stacked kickers (small uppercase label above the title, e.g. "EXPERIENCE" / "What I do") — the inline "— 01" numbered labels were dropped as unprofessional (user-picked via options). Removed: `.panel`, `panelIn`, `.about-scroll`/`.about-section` snap, Work's "Scroll ↓" overflow hint, `.no-scrollbar`. Verified: lint clean, build static (`/` + `/about`), no h-overflow at 1440 or 390, Notion content still bakes in. **Gotcha**: Chrome's `--headless --screenshot` flag renders *scrolled* pages wrong (fixed layers get painted at the scroll offset, content goes blank) — drive it over CDP instead (`Emulation.setDeviceMetricsOverride` + `scrollIntoView` + `Page.captureScreenshot`), which also makes narrow-width captures honest. |
| Jul 2026 | **Mobile fixes**: hero name is now fully em-based (eyes, strokes, "A" triangle scale with clamp()ed font-size) and theme-aware via `--hero-fill`/`--hero-stroke` (dark mode gets visible outlines); About sections free-scroll on ≤860px (snap off, `height:auto`, side dots hidden) so tall content isn't clipped; Home/Contact panels use `margin:auto` + `overflow:auto` so short screens can scroll; contact card padding shrinks on mobile; nav divider hidden on mobile; mobile frame hugs the edge (`inset: 44px 14px 18px`) with content inset to 32px so nothing sits on the frame lines; scrollable panels use `.no-scrollbar`. User-verified on device (dark mode, all tabs). **Gotcha**: macOS headless Chrome can't screenshot <500px windows honestly (layout renders wider than capture) — verify mobile with real devices/devtools. Also: stale `next-server` processes hold the port and 500 new CSS chunks — `pkill -f next-server` before restarting. |
