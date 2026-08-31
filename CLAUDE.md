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

## Design (scroll redesign, Aug 2026)

Playful **neo-brutalist** site, ported from the Claude Design artboard
**`Aroop Site.dc.html`** in `~/Code/Designs/Website frontend redesign.zip` (source of truth for
the look).

> **Pick the right artboard.** That zip holds four, and three of them are *not* the target:
> `Aroop Site (tabbed version)` (rounded frame, tab-swapped panels — the previous design),
> `Aroop Site (scroll version)` (sticky nav with a serif wordmark, a blue featured job card,
> long page scroll) and `Aroop Hero Options` (hero explorations). The live design is the
> plain **`Aroop Site.dc.html`**: one full-width rule at the top, nav breaking it on the left,
> and **white** cards throughout — there is no blue Google card.

Key traits:
- Cream background (`#FBF7EF`) with **one horizontal 2.5px rule across the top**; the nav sits on it and "breaks" it on the left
- Thick black borders + hard offset shadows (`5px 5px 0`) on buttons/stickers
- **Googly eyes that follow the cursor** everywhere — including as the "oo" in "Aroop" in the hero
- Floating blob characters with eyes on the home panel
- **One scroll, one panel**: Home / Work / Projects / Contact are stacked full-height sections inside a single `.scroll-view`; the nav scrolls to them and a scroll-spy lights the matching pill. **About Me is different** — it stays a swapped panel (hidden `.scroll-view`, `panelIn` animation) with its own 3-section track and side dots, which is why the nav separates it with a divider.
- Section headers are **centred** (label above title); there is no "Scroll ↓" hint
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
`.site-root` / `.site-rule` / `.site-header` / `.site-nav`(+`.site-nav-right`) / `.site-content` / `.scroll-view` / `.section`(+`.section-centered`) (shell) · `.navbtn`(+`.active`) · `.theme-toggle` · `.eye`/`.pupil` · `.sticker` (big button w/ shadow, `--tilt` var controls hover rotation) · `.chip-btn` (small) · `.card` / `.work-card` / `.job-bullets` · `.project-row` / `.proj-date` · `.about-scroll`/`.about-section` (scroll-snap) · `.interest-chip` · `.dot`

`.site-header` is a `display: contents` wrapper on desktop, so the two nav groups keep their
absolute placement over the rule. Below 860px it becomes a real flex container: the free-standing
`.site-rule` is hidden and the line is drawn as the header's own `border-bottom`, because a
wrapped two-row nav would otherwise sit on top of a rule fixed at 44px.

---

## File Structure

```
app/
  layout.tsx           # Fonts (Fredoka/DM Sans/Inter), metadata, theme no-flash init script
  page.tsx             # Renders <Site />
  globals.css          # Tokens, keyframes, all design-system classes, responsive rules
  about/page.tsx       # Redirects to /#about (old route kept alive)
  components/
    site.tsx           # THE site — client component: nav, theme, scroll sections + About panel, eye tracking
    googly.tsx         # <Eye> + useEyeTracking(), extracted so other pages get the eyes
  j9calculator/
    page.tsx           # /j9calculator route shell (force-static, metadata)
    calculator.tsx     # The calculator UI — client component
lib/
  notion.ts
  j9.ts                # End-date rule (pure, no React)
  j9-holidays.ts       # Holiday tables computed from the year
scripts/
  j9.test.ts           # `npm run test:j9`
public/photos/         # Carousel photos (photo1-3.jpg)
public/resume.pdf
```

`site.tsx` internals: **Work and Projects content comes from Notion at build time** (see below) — passed into `<Site work={...} projects={...} />` as props. The still-hardcoded consts are `INTERESTS`, `PHOTOS`, `GLANCE`, `LINKS` — edit those to change content. Sections are local components (`HomePanel`, `WorkPanel`, `ProjectsPanel`, `ContactPanel` — all mounted together inside `.scroll-view` — plus `AboutPanel`, mounted only when its tab is active). `goTo()` scrolls the view (or opens About); a rAF-throttled scroll listener drives the scroll-spy. `NavBtn` and `useTheme()` are module-level, not created during render.

## Data source (Notion, build-time)

Work & Projects content lives in two Notion databases, fetched **at build time only** — static HTML, no ISR/runtime fetching (deploy = manual redeploy to pick up edits).
- `lib/notion.ts` — `getWork()` → `{ featured, jobs }` (lowest `Order` = featured card), `getProjects()` → `Project[]` (`num` derived from `Order`). Uses `@notionhq/client` v5 (data-source API: resolves DB ID → data source via `databases.retrieve`, then `dataSources.query`). Throws a build-breaking error if env vars missing or a DB returns 0 rows (never ships an empty page).
- `app/page.tsx` — async Server Component, `export const dynamic = "force-static"`, fetches both in parallel, passes as props.
- **Env** (`.env.local`, git-ignored; also set in Vercel → Env Variables): `NOTION_TOKEN`, `NOTION_WORK_DB_ID` (`3a0e7c7c7bb480dc86a8da469436dfab`), `NOTION_PROJECTS_DB_ID` (`192d1b1ef9974e7496639f3efc7b4c4d`). Integration must be shared with **both** DBs.
- **Work DB** props: `Company` (title), `Role`, `Period`, `Blurb` (rich text), `Order` (number), **`Highlights` (rich text — one bullet per line, rendered under the featured card only)**. **Projects DB** props: `Title` (title), `Description` (rich text), `Tags` (multi-select), `Link` (url), `Date` (date — now shown under the project number), `Order` (number).
- `Highlights` is read by `readLines()` (splits on newlines, strips a leading `-`/`•`/`*`) and `Date` by `readMonthYear()` (hand-rolled "Jun 2026", never `Intl`). **Both degrade quietly**: a missing property yields `[]` / `null` and the row just omits them, so the build never breaks on a database that has not grown the column yet.
- **See an edit**: `npm run build` re-fetches; a refresh alone won't (baked). `npm run dev` re-runs per request, so dev + browser refresh works for quick iteration.

## Janine's end date calculator (`/j9calculator`)

A standalone page, not a tab on the SPA. Same neo-brutalist vocabulary, but it
scrolls normally instead of using the fixed-height `.site-*` shell, so it has its
own `.j9-*` block at the bottom of `globals.css`.

**The rule.** From a first day of work, find the Nth Friday actually worked (N
defaults to 16). **Only the Friday decides.** A week whose Friday is a holiday
does not count, so the term slides out by a week. Holidays falling Monday
through Thursday are days off that leave the end date alone, however many of
them there are. A weekend or holiday start rolls forward to the next working
day, which is where "if Monday is off, start Tuesday" comes from; note this
moves the reported start but not the end date, since the week still ends on a
worked Friday.

"A week whose Friday is off does not count" and "if the closing Friday is off,
move to the next Friday" are the same statement from either end, so the tail
guard in `calculate()` can never fire. It stays as a cheap assertion that the
two agree.

This was originally built as "any holiday in the week skips the week", which is
wrong: it made Labor Day cost a week. If it ever needs to change back, the whole
rule is the two lines around `fridayHolidays` in `calculate()`.

**Structure.** `lib/j9-holidays.ts` and `lib/j9.ts` are pure and React-free;
`app/j9calculator/calculator.tsx` is the only client-side piece. Everything runs
in the browser, with inputs remembered in `localStorage` under `j9calculator`.

**Gotchas learned here:**
- Every date is built and read in **UTC** (`Date.UTC` / `getUTC*`). A local-time
  `Date` crossing a DST boundary turns a Monday into a Sunday, silently.
- Holidays are **computed from the year**, never listed, so no one has to
  maintain a table. Weekend holidays shift to the nearest weekday and are then
  de-collided across the whole year range, so a Christmas/Boxing Day weekend
  still yields two separate days off.
- Dates are formatted with **hand-rolled month names, not `Intl`**, so the server
  HTML and the browser can never disagree.
- The page renders with empty state and fills in from `localStorage`/today in an
  effect. Reading either during render is a hydration mismatch.
- **Tailwind preflight strips `<ol>` markers.** `list-style: decimal` has to be
  asked for explicitly.
- `.j9-card` borders use `var(--line)`, not the hardcoded `#151310` the accent
  buttons use, or the cards vanish against the dark panel.
- `.j9-root` sets `color-scheme`, scoped to itself so the rest of the site is
  untouched, which is what makes the native date picker legible in dark mode.

**Tests.** `npm run test:j9` runs `scripts/j9.test.ts` on plain Node using its
native TypeScript stripping, so there is **no test framework dependency**. That
is why `lib/j9.ts` imports `./j9-holidays.ts` with an explicit extension and
`tsconfig.json` sets `allowImportingTsExtensions`. 60 assertions, including 800
randomized starts checking the answer is always a Friday closing exactly N clean
weeks, that no counted week ends on a holiday, and that no skipped week does
not. Several tests exist specifically to pin the Friday-only rule: Labor Day (a
Monday) must not move the end date, while Juneteenth (a Friday) must.

## Behaviors

- **Nav ↔ URL hash**: `/#work`, `/#about`, etc. deep-link (an instant jump on load, smooth thereafter); `go()` uses `history.replaceState`
- **Scroll spy**: whichever `[data-section]` has passed the halfway mark owns the active nav pill
- **Eyes**: one global `mousemove` listener + rAF updates every `.pupil` via DOM (re-bound on tab change)
- **About panel**: 3 full-height sections with CSS scroll-snap (intro/interests, photo carousel, at-a-glance) + side dots; photo carousel is translateX-based with real photos
- **Work/Projects**: no internal scrollers any more — the sections are full-height blocks in the page scroll
- **Responsive**: media query at 860px — the header becomes a bordered flex band with a wrapped two-row nav, content top offset drops to 104px, grids collapse to 1 column, decorative blobs hidden

## Content notes

- Hero + featured Work card say **Google (SWE, Google Cloud, 2026—Now)** — came from the newer design mockup, not the old site (which said Meta). Google card has only a one-line blurb; add real bullets when available.
- Contact links: aroopbiswal@gmail.com, github.com/AroopBiswal, linkedin.com/in/AroopBiswal, /resume.pdf
- Nav has two external links, both `target="_blank"`: **GitHub** (github.com/AroopBiswal) in the left group, and **Trading** (`https://aroopbiswal.com/trading` — the absolute URL, not the `/trading` rewrite path) sitting just left of About Me in the right group.

---

## Iteration Log

| Date | Change |
|---|---|
| Aug 2026 | **Scroll redesign**: ported `Aroop Site.dc.html` from `~/Code/Designs/Website frontend redesign.zip`. Frame → one top rule; Home/Work/Projects/Contact became stacked sections in a single scroll view with a scroll-spy nav, while About stayed a swapped panel; section headers centred and the "Scroll ↓" hint dropped. `Job` gained `highlights` (new `Highlights` rich-text prop → bullets on the featured card) and `Project` gained `date` (the `Date` prop that already existed and was unused). Also cleared the file's standing lint errors: `NavBtn` hoisted out of render, theme read via `useSyncExternalStore` instead of setState-in-effect (7 errors → 0). **Verified**: tsc + eslint clean, and rendered against the artboard at desktop, dark mode and a real 390px viewport. **Not verified locally**: `npm run build`, which needs the Notion env vars this checkout does not have. **Wrong turn worth remembering**: the first port used `Aroop Site (scroll version).dc.html` — sticky serif-wordmark nav, blue featured card — and had to be reverted. Check the artboard name before porting. |
| Initial | Dark charcoal multi-page site (hero, experience, projects, contact + /about page) |
| … | (see git history for pre-redesign iterations) |
| Jul 2026 | **Full redesign** on `redesign` branch: ported neo-brutalist Claude Design mockup — tabbed single-screen SPA, googly eyes, light/dark toggle, Fredoka/DM Sans/Inter. Old Navbar/AccentWheel/PhotoCarousel components deleted; /about now redirects to /#about. Populated with real content (Meta $59M, Aggieworks, Meaku, Valley Tech, Intel; Notion Budget Sync, Clubly, Expense Splitter). |
| Jul 2026 | **Notion data source** on `notion-db` branch: Work & Projects content moved out of hardcoded consts into two Notion DBs, fetched at build time via `lib/notion.ts` (`@notionhq/client` v5) + `app/page.tsx` (`force-static` async Server Component, props into client `<Site>`). Fully static, manual-redeploy strategy — no ISR/runtime fetching. Loud-fail on missing env / empty DB. Verified: live content bakes into static `index.html`. |
| Aug 2026 | **`/trading` rewrite** in `next.config.ts`: `/trading/:path*` proxies to the Bull and Bear dashboard, a **separate Vercel project** built from `AroopBiswal/BullAndBear` (root dir `web`). Deliberately not merged into this repo, so a broken dashboard build can't take the site down; cost is one proxy hop. **Two gotchas**: (1) the destination keeps the `/trading` prefix, because that project sets `basePath: "/trading"` — stripping it 404s everything; (2) `DASHBOARD` is hardcoded to `bullandbear-dashboard.vercel.app`, so the Vercel project must be named that, or update the const. The dashboard proxies onward to a Mac mini over a Cloudflare Tunnel server-side, so the whole path is same-origin and the tunnel hostname never reaches a browser. Nothing else here needs to know about it. |
| Aug 2026 | **Friday-only rule correction** for the calculator: a week is skipped only when **its Friday** is a holiday, not when the week contains any holiday. The first version made Labor Day cost a full week. Tests, UI copy, and the rules list all rewritten to match. |
| Aug 2026 | **Janine's end date calculator** at `/j9calculator`: pure date logic in `lib/j9.ts` + `lib/j9-holidays.ts`, GUI in `app/j9calculator/`, styles in the `.j9-*` block of `globals.css`, googly eyes extracted to `app/components/googly.tsx`. Dependency-free test suite via Node's native type stripping (`npm run test:j9`). See the section above for the rule and the gotchas. **Verified**: 60 tests green, light and dark, and a real 390px viewport (measured in an iframe, since `resize_window` does not actually resize this Chrome and small-window screenshots lie, per the mobile note below). |
| Jul 2026 | **Mobile fixes**: hero name is now fully em-based (eyes, strokes, "A" triangle scale with clamp()ed font-size) and theme-aware via `--hero-fill`/`--hero-stroke` (dark mode gets visible outlines); About sections free-scroll on ≤860px (snap off, `height:auto`, side dots hidden) so tall content isn't clipped; Home/Contact panels use `margin:auto` + `overflow:auto` so short screens can scroll; contact card padding shrinks on mobile; nav divider hidden on mobile; mobile frame hugs the edge (`inset: 44px 14px 18px`) with content inset to 32px so nothing sits on the frame lines; scrollable panels use `.no-scrollbar`. User-verified on device (dark mode, all tabs). **Gotcha**: macOS headless Chrome can't screenshot <500px windows honestly (layout renders wider than capture) — verify mobile with real devices/devtools. Also: stale `next-server` processes hold the port and 500 new CSS chunks — `pkill -f next-server` before restarting. |
