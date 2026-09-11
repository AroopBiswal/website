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
- **The header has two states.** The rule runs *through* the nav on the scrolling home
  page and sits *below* it everywhere else — the blog, the alligator, and the About panel.
  Moving between them slides the rule down (44px → 78px) and lifts the words, and reverses
  coming back.
- The two standalone routes animate that on arrival with keyframes. About is a panel on an
  already-mounted page, so it toggles `data-panel="about"` on `.site-root` and transitions
  **`top`** instead — the arrival keyframes hold a `transform` through their fill, which
  would win over anything a class tried to set.
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
`.site-root` / `.site-rule` / `.site-header` / `.site-nav`(+`.site-nav-right`) / `.site-content` / `.scroll-view` / `.section`(+`.section-centered`) (shell) · `.navbtn`(+`.active`) · `.theme-toggle` (38px round icon button; `.theme-icon-sun`/`-moon` both rendered, `html[data-theme]` picks one in CSS so hydration never mismatches) · `.eye`/`.pupil` · `.sticker` (big button w/ shadow, `--tilt` var controls hover rotation) · `.chip-btn` (small) · `.card` / `.work-card` / `.job-bullets` · `.project-row` / `.proj-date` · `.about-scroll`/`.about-section` (scroll-snap) · `.interest-chip` · `.dot`

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
    theme.ts           # useTheme() — reads html[data-theme], shared by every page
    page-shell.tsx     # Sticky nav bar + rule + back arrow + column, for every (chrome) route
    nav.tsx            # SiteNav — the header, buttons on the home page, links elsewhere
    theme-toggle.tsx   # <ThemeToggle /> — the sun/moon icon button, used by the site, the blog and the calculator
  (chrome)/            # Route group: shared PageShell layout, URLs unaffected
    layout.tsx         # Keeps the header mounted across /blog <-> /photos <-> /alligator
    alligator/
      page.tsx         # /alligator route shell (force-static, metadata)
      game.tsx         # The game — client component
    blog/
      page.tsx         # Index: post list from Notion
      [slug]/page.tsx  # One post, body rendered from Notion blocks
      blocks.tsx       # Notion blocks -> JSX
    photos/
      page.tsx         # /photos gallery (ISR, revalidated by the admin)
      gallery.tsx      # Grid + <dialog> lightbox — client component
    admin/
      page.tsx         # /admin: config check -> login form -> panel (force-dynamic)
      actions.ts       # Server actions: login/logout, record uploads, save, delete
      login-form.tsx   # Password form (useActionState)
      panel.tsx        # Drop zone, upload queue, editable rows, save bar — client component
  api/admin/
    upload/route.ts        # Blob client-upload token exchange (handleUpload), admin only
    upload-local/route.ts  # Dev stand-in: writes the posted file to .photos-local/
  photos-local/[...path]/route.ts  # Serves .photos-local/ in dev; 404 anywhere else
  j9calculator/
    page.tsx           # /j9calculator route shell (force-static, metadata)
    calculator.tsx     # The calculator UI — client component
lib/
  notion.ts
  photos.ts            # Photo store (Blob or local disk) + manifest reconcile — server only (imports fs)
  photos-shared.ts     # Photo types, limits, name helpers — safe for client components
  admin-auth.ts        # ADMIN_PASSWORD check + signed session cookie
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
- **Env** (`.env.local`, git-ignored; also set in Vercel → Env Variables): `NOTION_TOKEN`, `NOTION_WORK_DB_ID` (`3a0e7c7c7bb480dc86a8da469436dfab`), `NOTION_PROJECTS_DB_ID` (`192d1b1ef9974e7496639f3efc7b4c4d`), `NOTION_BLOG_DB_ID` (`887b64c1aada49ee842921fc65b42ed2`). The photo gallery adds `BLOB_READ_WRITE_TOKEN` and `ADMIN_PASSWORD` (see the Photos section). The integration must be shared with **all three** DBs — a database created through the Notion MCP connector is *not* automatically shared with the site's integration, and the build 404s until it is.
- **Work DB** props: `Company` (title), `Role`, `Period`, `Blurb` (rich text), `Order` (number), **`Highlights` (rich text — one bullet per line, rendered under the featured card only)**. **Projects DB** props: `Title` (title), `Description` (rich text), `Tags` (multi-select), `Link` (url), `Date` (date — now shown under the project number), `Order` (number).
- `Highlights` is read by `readLines()` (splits on newlines, strips a leading `-`/`•`/`*`) and `Date` by `readMonthYear()` (hand-rolled "Jun 2026", never `Intl`). **Both degrade quietly**: a missing property yields `[]` / `null` and the row just omits them, so the build never breaks on a database that has not grown the column yet.
- **See an edit**: `npm run build` re-fetches; a refresh alone won't (baked). **All three fetchers are memoized for the life of the process** (`memo()` in `lib/notion.ts`), so in dev a Notion edit needs the dev server restarted, or a code edit that makes HMR re-evaluate `lib/notion.ts`. This is deliberate: without it every client-side navigation onto `/` waited ~400ms for four Notion calls, which read as a lag in the nav transition coming back from the blog. A rejected fetch is dropped from the cache so a transient Notion error does not stick.

## Pages outside the home scroll (`app/(chrome)/`)

`/blog`, `/photos`, `/alligator` and `/admin` live in a route group sharing
`app/(chrome)/layout.tsx`, which renders `PageShell`. **That grouping is load-bearing, not tidiness:** Next keeps a layout
mounted across navigations inside it, so going blog → alligator leaves the header's DOM
alone and its arrival animation cannot replay. Before the group, every hop replayed a
movement between two states that were already identical. The shell reads the active nav
item from `usePathname()` rather than a prop, since one layout now serves them all;
`/admin` lights nothing (it has no nav item), and the photo pages get `.page-wrap-wide`
(1120px) instead of the blog's 780px reading column.

## Blog (`/blog`)

Its own route rather than a section of the scroll, so posts get real URLs.
`app/blog/page.tsx` is the index, `app/blog/[slug]/page.tsx` a post, and both wrap
`app/blog/shell.tsx` (client — sticky bar with the back link and the theme toggle).
`app/blog/blocks.tsx` turns the flattened Notion blocks into JSX. `useTheme()` moved
to `app/components/theme.ts` so the blog and the main site share one implementation.

- **Content lives in a third Notion database, `Blog`** (`NOTION_BLOG_DB_ID`,
  `887b64c1aada49ee842921fc65b42ed2`), next to Work and Projects under
  Career / Tech / Projects / Personal Website. Props: `Title` (title), `Slug`, `Summary`
  (rich text), `Date` (date), `Tags` (multi-select), `Published` (checkbox — unchecked
  rows are drafts and never ship). A blank `Slug` falls back to a slug made from the title.
- **The page body is the post.** `getPostBlocks()` walks `blocks.children.list`
  (paginated, recursing two levels for nested lists) and flattens it to the `Block`
  union: heading 1–3, paragraph, quote, code, divider, and list (consecutive items are
  grouped into one `<ul>`/`<ol>`). Inline bold/italic/strikethrough/code/links survive as
  `RichText` runs. **Anything else is silently dropped.**
- **Images are deliberately not rendered.** Notion's file URLs are signed and expire about
  an hour after they are issued; this site bakes HTML at build time, so a baked URL is a
  broken image shortly after deploy. Supporting them means downloading the files at build.
- **Reading time** is computed from the body at 200 wpm, so nothing to maintain by hand.
- **This one does not loud-fail.** Unlike `getWork`/`getProjects`, a missing
  `NOTION_BLOG_DB_ID` logs a warning and returns `[]`, because a blog legitimately starts
  empty and the branch had to build before the variable existed.
- `getPosts` is wrapped in the same `memo()` as Work and Projects, and `blocksPromises`
  holds each body, for the life of a build — the index, `generateStaticParams`, every
  `generateMetadata` and every post page all read the same rows.

## Alligator (`/alligator`)

Crocodile dentist, in the site's vocabulary. `app/alligator/page.tsx` is the route
shell; `app/alligator/game.tsx` holds the whole game as one client component. Styles
live in the `.gator-*` / `.tooth` block at the bottom of `globals.css`.

**The rule.** You pick the number of teeth (4–20, default 10). Starting a round draws
one tooth at random as the trap. Pressing a safe tooth sinks it into the gum; pressing
the trap drops the upper jaw. Pressing every safe tooth — `count - 1` of them — wins.

- **The trap is drawn on start, not during render.** Randomness in a render would differ
  between the server and the browser, and drawing it lazily on the first press would mean
  the round is settled as you go rather than decided up front.
- **The teeth split across both jaws** — `ceil(count / 2)` up top, the rest below, odd
  counts putting the extra one up top. Every one of them is clickable and they share one
  numbering, so the trap can be on either jaw. The mouth holds exactly the number you
  picked: the lower jaw once carried a *decorative* second row, which made it show twice.
- **The jaw** is two absolutely positioned blocks with a gap; losing translates the upper
  one down by `--close` so the two rows of teeth meet. `--close` is the resting gap between
  the rows — 74px desktop, 62px mobile — so it has to be re-measured whenever the jaw
  heights, the tooth length or the container height change.

**Gotcha, twice now.** `.tooth-row-lower` must reset `bottom: auto` in *every* place
`.tooth-row` sets `bottom` — the base rule and the 860px block both do. Leaving `top` and
`bottom` both set on an auto-height absolute box stretches it and drops the teeth below
the jaw.
- The trap tooth stays put and turns red when it fires — `.tooth[data-trap]` overrides the
  pressed transform, so it does not retract like the safe ones.

## Photos (`/photos`) and the admin behind it (`/admin`)

A photo gallery whose content changes **without a deploy**: sign in at `/admin`, drop
photos in, write captions, reorder, save, and `/photos` shows it within seconds. This is
the one part of the site that is not baked at build time, and it is confined to these two
routes on purpose.

**Where the bytes live.** A **Vercel Blob** store (public access). Images sit under
`photos/` with a random suffix on the name; one small JSON file beside them,
`photos-manifest.json`, holds the order and captions. Blob went in over Notion because
Notion's file URLs expire after an hour, so a baked page would have to re-download every
photo on every build; over `public/` because every new photo would be a commit; over
Cloudinary/R2 because the site is already on Vercel and Blob needs no extra account.

**Two sources of truth, reconciled.** The store decides what *exists*; the manifest
decides how it is *presented*. `getPhotos()` in `lib/photos.ts` lists the store, walks the
manifest in order, drops rows whose file is gone, and appends any file the manifest has
not heard of (newest first, no caption, size 0×0). So a photo dropped in from the Vercel
dashboard still shows up, one deleted there quietly leaves, and a corrupt manifest just
loses captions rather than the gallery. URLs always come from the store, never from the
manifest, so a hand-edited manifest cannot point the page anywhere else.

**How it gets to the browser.** `/photos` is ISR (`revalidate = 3600`) and every admin
write ends with `revalidatePath("/photos")`, so the page is cached between edits and still
fresh seconds after one; the hour is only a backstop for dashboard uploads. `/admin` is
`force-dynamic` since it reads the cookie. **The photo fetcher is deliberately not
`memo()`d** like the Notion ones: a process-lifetime cache would make the admin's own
edits invisible in dev.

**Uploads go browser → Blob directly.** A Vercel function body is capped at 4.5MB and a
phone photo is often bigger, so files never pass through the site. The browser calls
`upload()` from `@vercel/blob/client`, which asks `app/api/admin/upload/route.ts` for a
short-lived token; that route (`handleUpload`) hands one out only to a signed-in admin,
only for an image type in `ALLOWED_TYPES`, only under `photos/`, capped at `MAX_BYTES`
(50MB). The write token never leaves the server. Vercel's `onUploadCompleted` callback is
**not used**: it cannot reach a dev server, and the browser already knows the result, so
the panel files the batch itself through `recordUploadsAction`, which `head()`s each
pathname before trusting it. The browser measures each image with `createImageBitmap`
first so the manifest carries real dimensions; photos that arrive without one are measured
on the next save.

**Dev without a token.** `storeMode()` is `blob` when `BLOB_READ_WRITE_TOKEN` is set,
`local` in development without it, and `off` in production without it (empty gallery,
admin says so). Local mode keeps files in **`.photos-local/`** (git-ignored), served by
`app/photos-local/[...path]/route.ts` and written by `app/api/admin/upload-local/route.ts`;
both refuse to run in any other mode. The panel branches on the mode it is given: Blob
client upload, or a plain `POST` of the file. Everything above — reconcile, captions,
order, delete, revalidate — is exercised end to end against the local store, which is how
this was built and tested before a real store existed.

**The gate.** `lib/admin-auth.ts`. One password in `ADMIN_PASSWORD`; unset it and `/admin`
says the admin is off. On success a cookie `admin-session` = `<expiry>.<hmac>` is set
(httpOnly, SameSite=Lax, Secure in prod, 30 days), keyed from a hash of the password
itself, so changing the password signs everyone out and nothing secret is stored outside
the environment. Comparisons go through `timingSafeEqual` on hashes; a wrong guess sleeps
800ms. Every server action and both upload routes call `requireAdmin()`/`isAdmin()`; the
Blob token route checks it *before* handing the request to the SDK, so an anonymous call
is a 401 rather than whatever the SDK says about tokens.

**Setup on Vercel** (not yet done as of this writing): Storage → Create → Blob, public,
connect it to the project with Production/Preview/Development so `BLOB_READ_WRITE_TOKEN`
lands in the env; add `ADMIN_PASSWORD`; redeploy. Locally, `vercel env pull` or paste the
token into `.env.local` to point dev at the real store. `next.config.ts` allows
`*.public.blob.vercel-storage.com` for `next/image`; local-store URLs render `unoptimized`.

**Gotchas learned here:**
- **A client component must not import `lib/photos.ts`**: it imports `fs`, and Turbopack
  fails the whole app with "Module not found: Can't resolve 'fs'". Types, limits and name
  helpers live in `lib/photos-shared.ts` for that reason; `lib/photos.ts` re-exports them.
- **`position: fixed` inside `.page-wrap` is not fixed to the viewport.** The arrival
  keyframe holds a `transform` through its fill, which makes the column the containing
  block. The admin save bar is `createPortal`led to `document.body` (after a mounted
  check, to keep SSR identical).
- The Blob CDN caches objects for at least 60s, so the manifest is fetched with a fresh
  `?v=` query and `cache: "no-store"`, or a save would not show on the next render.
- `.photo-lightbox-nav.prev/.next` need both classes named in the mobile media query too,
  or the desktop centring rule (higher specificity) wins and the arrows stay mid-screen.
- Every write returns `getPhotos()` (the reconciled view), not the raw manifest, so the
  admin's list matches the gallery and never shows a dead row with an empty `src`.
- Delete is a two-step in-page confirm rather than `window.confirm`, which blocks headless
  and extension-driven browsers alike.

**Testing without the Chrome extension.** The extension needed a browser pick that an
unattended session cannot make. Headless Chrome driven over the DevTools Protocol from a
dependency-free Node script (Node 24 has `WebSocket` built in; `DOM.setFileInputFiles`
feeds the file input; `Emulation.setDeviceMetricsOverride` for 390px) covered sign-in,
uploads, captions, reorder, save, delete and screenshots in both themes.

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
- Nav has two external links, both `target="_blank"`: **GitHub** (github.com/AroopBiswal) in the left group, and **Trading** (`https://aroopbiswal.com/trading` — the absolute URL, not the `/trading` rewrite path) in the right group. The right group runs Trading · Blog · Photos · Alligator · About Me · theme toggle.

---

## Iteration Log

| Date | Change |
|---|---|
| Sep 2026 | **Photos** at `/photos` with an **admin** at `/admin`, in four commits: gallery (Vercel Blob + JSON manifest reconciled in `lib/photos.ts`, ISR page, multi-column grid, `<dialog>` lightbox, local-disk store for dev), password gate (signed cookie keyed from `ADMIN_PASSWORD`), browser-to-Blob uploads (token exchange in `app/api/admin/upload`, local `POST` fallback), then captions/reorder/delete with a portalled save bar. New nav item between Blog and Alligator. `@vercel/blob` added. Needs a Blob store connected and `ADMIN_PASSWORD` set in Vercel before it does anything in production. See the Photos section for the design and its gotchas. |
| Sep 2026 | **Header states tidied**: the About panel now makes the same rule-drop move the blog and alligator make, via a `data-panel` attribute and a `top` transition. And `/blog` + `/alligator` moved into the `app/(chrome)/` route group so a shared layout keeps the header mounted between them — hopping between the two used to replay an arrival animation between two identical states. |
| Sep 2026 | **Alligator** at `/alligator`: crocodile dentist with a chosen number of teeth and one random trap. Added a nav item for it, and pulled the blog's chrome out to `app/components/page-shell.tsx` (`.blog-root/-bar/-rule/-wrap/-back` renamed to `.page-*`) so the two routes share one shell rather than duplicating it. See the Alligator section above for the rule and the two layout gotchas. |
| Sep 2026 | **Nav transition lag fixed** on `feature/nav-transition`: blog → home lagged while home → blog did not, because the dev server re-ran `getWork`/`getProjects` (four Notion calls, ~400ms) on every request while the blog memoized `getPosts`. All three fetchers now share `memo()` in `lib/notion.ts`; the home page's RSC payload dropped from ~430ms to ~7ms on repeat requests. Production was never affected (built once, `force-static`). Cost: a Notion edit needs a dev-server restart to show up. Same branch: a **thin stroked back arrow** (`.blog-back`, inline SVG, 56×24, 1.5px stroke) under the rule at the top left of every blog page, always to `/`. Absolute at desktop so the centred masthead stays put, in flow below 860px. Verified in headless Chrome at 1280px and in a 390px iframe. Also the **theme toggle became an icon**: `app/components/theme-toggle.tsx` renders a round button with a sun (while dark) or moon (while light), replacing the "Light"/"Dark" text pill on the site, the blog and the calculator; the calculator's private copy of the toggle logic went away with it. **Dev-server gotcha**: after a rewrite of `globals.css`, Turbopack kept serving the old stylesheet through a restart and a `touch`; only a real content change to the file made it recompile (append a comment, then delete it). It struck again after a branch switch + merge, and an unstyled inline SVG renders at 300×150, so **every inline SVG carries `width`/`height` attributes** as a floor; CSS still sizes them. **Nav hover**: an inactive `.navbtn` becomes a ghost of the active sticker on hover (panel fill, ink border, hard shadow, 2px lift with a 1.5° tilt) and on `:focus-visible` (no lift). Every item reserves a transparent 3px border with 3px less padding than the active pill, so the row never shifts; the hover is gated on `(hover: hover)` so a tap never sticks, and reduced motion drops the lift. **Trading** carries `.navbtn-ext`: an outward arrow (`.navbtn-ext-arrow`, tucked in the top-right corner) fades in with the hover to say it opens a new tab, plus an `.sr-only` note for screen readers; its 7px of extra right padding is reserved at rest so the width never changes. |
| Sep 2026 | **Blog** on `feature/blog`: nav button between Trading and About Me, `/blog` index and `/blog/[slug]` post pages, content from a new `Blog` Notion database with the page body rendered from Notion blocks. Index styled from a reference the user supplied — centred masthead, rules between rows, date left and computed reading time right. `useTheme()` extracted to `app/components/theme.ts`. See the Blog section above for the schema, what renders, and why images are excluded. |
| Aug 2026 | **Scroll redesign**: ported `Aroop Site.dc.html` from `~/Code/Designs/Website frontend redesign.zip`. Frame → one top rule; Home/Work/Projects/Contact became stacked sections in a single scroll view with a scroll-spy nav, while About stayed a swapped panel; section headers centred and the "Scroll ↓" hint dropped. `Job` gained `highlights` (new `Highlights` rich-text prop → bullets on the featured card) and `Project` gained `date` (the `Date` prop that already existed and was unused). Also cleared the file's standing lint errors: `NavBtn` hoisted out of render, theme read via `useSyncExternalStore` instead of setState-in-effect (7 errors → 0). **Verified**: tsc + eslint clean, and rendered against the artboard at desktop, dark mode and a real 390px viewport. **Not verified locally**: `npm run build`, which needs the Notion env vars this checkout does not have. **Wrong turn worth remembering**: the first port used `Aroop Site (scroll version).dc.html` — sticky serif-wordmark nav, blue featured card — and had to be reverted. Check the artboard name before porting. |
| Initial | Dark charcoal multi-page site (hero, experience, projects, contact + /about page) |
| … | (see git history for pre-redesign iterations) |
| Jul 2026 | **Full redesign** on `redesign` branch: ported neo-brutalist Claude Design mockup — tabbed single-screen SPA, googly eyes, light/dark toggle, Fredoka/DM Sans/Inter. Old Navbar/AccentWheel/PhotoCarousel components deleted; /about now redirects to /#about. Populated with real content (Meta $59M, Aggieworks, Meaku, Valley Tech, Intel; Notion Budget Sync, Clubly, Expense Splitter). |
| Jul 2026 | **Notion data source** on `notion-db` branch: Work & Projects content moved out of hardcoded consts into two Notion DBs, fetched at build time via `lib/notion.ts` (`@notionhq/client` v5) + `app/page.tsx` (`force-static` async Server Component, props into client `<Site>`). Fully static, manual-redeploy strategy — no ISR/runtime fetching. Loud-fail on missing env / empty DB. Verified: live content bakes into static `index.html`. |
| Aug 2026 | **`/trading` rewrite** in `next.config.ts`: `/trading/:path*` proxies to the Bull and Bear dashboard, a **separate Vercel project** built from `AroopBiswal/BullAndBear` (root dir `web`). Deliberately not merged into this repo, so a broken dashboard build can't take the site down; cost is one proxy hop. **Two gotchas**: (1) the destination keeps the `/trading` prefix, because that project sets `basePath: "/trading"` — stripping it 404s everything; (2) `DASHBOARD` is hardcoded to `bullandbear-dashboard.vercel.app`, so the Vercel project must be named that, or update the const. The dashboard proxies onward to a Mac mini over a Cloudflare Tunnel server-side, so the whole path is same-origin and the tunnel hostname never reaches a browser. Nothing else here needs to know about it. |
| Aug 2026 | **Friday-only rule correction** for the calculator: a week is skipped only when **its Friday** is a holiday, not when the week contains any holiday. The first version made Labor Day cost a full week. Tests, UI copy, and the rules list all rewritten to match. |
| Aug 2026 | **Janine's end date calculator** at `/j9calculator`: pure date logic in `lib/j9.ts` + `lib/j9-holidays.ts`, GUI in `app/j9calculator/`, styles in the `.j9-*` block of `globals.css`, googly eyes extracted to `app/components/googly.tsx`. Dependency-free test suite via Node's native type stripping (`npm run test:j9`). See the section above for the rule and the gotchas. **Verified**: 60 tests green, light and dark, and a real 390px viewport (measured in an iframe, since `resize_window` does not actually resize this Chrome and small-window screenshots lie, per the mobile note below). |
| Jul 2026 | **Mobile fixes**: hero name is now fully em-based (eyes, strokes, "A" triangle scale with clamp()ed font-size) and theme-aware via `--hero-fill`/`--hero-stroke` (dark mode gets visible outlines); About sections free-scroll on ≤860px (snap off, `height:auto`, side dots hidden) so tall content isn't clipped; Home/Contact panels use `margin:auto` + `overflow:auto` so short screens can scroll; contact card padding shrinks on mobile; nav divider hidden on mobile; mobile frame hugs the edge (`inset: 44px 14px 18px`) with content inset to 32px so nothing sits on the frame lines; scrollable panels use `.no-scrollbar`. User-verified on device (dark mode, all tabs). **Gotcha**: macOS headless Chrome can't screenshot <500px windows honestly (layout renders wider than capture) — verify mobile with real devices/devtools. Also: stale `next-server` processes hold the port and 500 new CSS chunks — `pkill -f next-server` before restarting. |
