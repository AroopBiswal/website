# CLAUDE.md — Aroop's Personal Website

> Claude should update this file after every significant iteration with new learnings, architectural decisions, and patterns discovered.

---

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 import + plain CSS classes in `globals.css` (the design system is mostly custom CSS, not Tailwind utilities)
- **Fonts**: Fredoka (display/buttons), DM Sans (body), Inter (cards/headings) via `next/font/google`
- **React**: v19

Run dev server: `npm run dev`

---

## Design (redesign branch, July 2026)

Playful **neo-brutalist** single-screen site, ported from a Claude Design mockup at
`/Users/aroop/Documents/Programming/Designs/PersonalWebsiteRedesign/Aroop Site.dc.html` (source of truth for the look).

Key traits:
- Cream background (`#FBF7EF`) with a rounded 2.5px border frame inset around the viewport; the nav "breaks" the top border
- Thick black borders + hard offset shadows (`5px 5px 0`) on buttons/stickers
- **Googly eyes that follow the cursor** everywhere — including as the "oo" in "Aroop" in the hero
- Floating blob characters with eyes on the home panel
- **Tab-based SPA**: no page scrolling between sections; nav switches panels (Home, Work, Projects, About, Contact) with a `panelIn` animation
- Light/Dark theme toggle (button in nav), applied as `html[data-theme="dark"]`. Priority (init script in `layout.tsx`, runs pre-paint to prevent flash): explicit toggle choice in `localStorage("site-theme")` → system `prefers-color-scheme` → **dark** as final fallback. Hero name keeps white fill + black stroke in both themes (`--hero-fill`/`--hero-stroke` only set in `:root`).

### Tokens (CSS vars in `globals.css`)
| Var | Light | Dark |
|---|---|---|
| `--bg` | `#FBF7EF` | `#17130E` |
| `--panel` | `#FFFFFF` | `#241E17` |
| `--ink` | `#151310` | `#FBF7EF` |
| `--line` | `#151310` | `#F2ECE0` |
| `--muted` | `#6F685D` | `#A79E8F` |
| `--shadow` | `#151310` | `transparent` |

Accent palette (hard-coded, borders stay `#151310` in both themes): red `#E5372A`, blue `#2E4BD8`, yellow `#FFC93C`, green `#6FB92C`, orange `#F5821F`; interest chips use `#F59E0B` `#3B82F6` `#10B981` `#F43F5E` `#F97316`.

### Key CSS classes (`globals.css`)
`.site-root` / `.site-frame` / `.site-nav` / `.site-content` (shell) · `.navbtn`(+`.active`) · `.theme-toggle` · `.eye`/`.pupil` · `.sticker` (big button w/ shadow, `--tilt` var controls hover rotation) · `.chip-btn` (small) · `.card` / `.work-card` · `.project-row` · `.about-scroll`/`.about-section` (scroll-snap) · `.interest-chip` · `.dot`

---

## File Structure

```
app/
  layout.tsx           # Fonts (Fredoka/DM Sans/Inter), metadata, theme no-flash init script
  page.tsx             # Renders <Site />
  globals.css          # Tokens, keyframes, all design-system classes, responsive rules
  about/page.tsx       # Redirects to /#about (old route kept alive)
  components/
    site.tsx           # THE site — client component: nav, theme, tabs, all 5 panels, eye tracking
public/photos/         # Carousel photos (photo1-3.jpg)
public/resume.pdf
```

`site.tsx` internals: **Work and Projects content comes from Notion at build time** (see below) — passed into `<Site work={...} projects={...} />` as props. The still-hardcoded consts are `INTERESTS`, `PHOTOS`, `GLANCE`, `LINKS` — edit those to change content. Panels are local components (`HomePanel`, `WorkPanel`, `ProjectsPanel`, `AboutPanel`, `ContactPanel`); `WorkPanel`/`ProjectsPanel` now take data as props. Only the active panel is mounted (so `panelIn` runs on switch).

## Data source (Notion, build-time)

Work & Projects content lives in two Notion databases, fetched **at build time only** — static HTML, no ISR/runtime fetching (deploy = manual redeploy to pick up edits).
- `lib/notion.ts` — `getWork()` → `{ featured, jobs }` (lowest `Order` = featured card), `getProjects()` → `Project[]` (`num` derived from `Order`). Uses `@notionhq/client` v5 (data-source API: resolves DB ID → data source via `databases.retrieve`, then `dataSources.query`). Throws a build-breaking error if env vars missing or a DB returns 0 rows (never ships an empty page).
- `app/page.tsx` — async Server Component, `export const dynamic = "force-static"`, fetches both in parallel, passes as props.
- **Env** (`.env.local`, git-ignored; also set in Vercel → Env Variables): `NOTION_TOKEN`, `NOTION_WORK_DB_ID` (`3a0e7c7c7bb480dc86a8da469436dfab`), `NOTION_PROJECTS_DB_ID` (`192d1b1ef9974e7496639f3efc7b4c4d`). Integration must be shared with **both** DBs.
- **Work DB** props: `Company` (title), `Role`, `Period`, `Blurb` (rich text), `Order` (number). **Projects DB** props: `Title` (title), `Description` (rich text), `Tags` (multi-select), `Link` (url), `Date` (date — unused by site yet), `Order` (number).
- **See an edit**: `npm run build` re-fetches; a refresh alone won't (baked). `npm run dev` re-runs per request, so dev + browser refresh works for quick iteration.

## Behaviors

- **Tabs ↔ URL hash**: `/#work`, `/#about`, etc. deep-link; `go()` uses `history.replaceState`
- **Eyes**: one global `mousemove` listener + rAF updates every `.pupil` via DOM (re-bound on tab change)
- **About panel**: 3 full-height sections with CSS scroll-snap (intro/interests, photo carousel, at-a-glance) + side dots; photo carousel is translateX-based with real photos
- **Work/Projects**: internal scrollers; Work shows a "Scroll ↓" hint only when content overflows, hidden after scrolling
- **Responsive**: media query at 860px — nav shrinks/wraps, content top offset grows, grids collapse to 1 column, decorative blobs hidden

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
| Aug 2026 | **`/trading` rewrite** in `next.config.ts`: `/trading/:path*` proxies to the Bull and Bear dashboard, a **separate Vercel project** built from `AroopBiswal/BullAndBear` (root dir `web`). Deliberately not merged into this repo, so a broken dashboard build can't take the site down; cost is one proxy hop. **Two gotchas**: (1) the destination keeps the `/trading` prefix, because that project sets `basePath: "/trading"` — stripping it 404s everything; (2) `DASHBOARD` is hardcoded to `bullandbear-dashboard.vercel.app`, so the Vercel project must be named that, or update the const. The dashboard proxies onward to a Mac mini over a Cloudflare Tunnel server-side, so the whole path is same-origin and the tunnel hostname never reaches a browser. Nothing else here needs to know about it. |
| Jul 2026 | **Mobile fixes**: hero name is now fully em-based (eyes, strokes, "A" triangle scale with clamp()ed font-size) and theme-aware via `--hero-fill`/`--hero-stroke` (dark mode gets visible outlines); About sections free-scroll on ≤860px (snap off, `height:auto`, side dots hidden) so tall content isn't clipped; Home/Contact panels use `margin:auto` + `overflow:auto` so short screens can scroll; contact card padding shrinks on mobile; nav divider hidden on mobile; mobile frame hugs the edge (`inset: 44px 14px 18px`) with content inset to 32px so nothing sits on the frame lines; scrollable panels use `.no-scrollbar`. User-verified on device (dark mode, all tabs). **Gotcha**: macOS headless Chrome can't screenshot <500px windows honestly (layout renders wider than capture) — verify mobile with real devices/devtools. Also: stale `next-server` processes hold the port and 500 new CSS chunks — `pkill -f next-server` before restarting. |
