# CLAUDE.md — Aroop's Personal Website

> Claude should update this file after every significant iteration with new learnings, architectural decisions, and patterns discovered.

---

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (imported via `@import "tailwindcss"` in `globals.css` — no `tailwind.config.js` needed)
- **Fonts**: Geist Sans + Geist Mono (via `next/font/google`)
- **React**: v19

Run dev server: `npm run dev`

---

## File Structure

```
app/
  layout.tsx           # Root layout — sets fonts, bg-charcoal, metadata
  page.tsx             # Home page (About Me hero, Experience, Projects, Contact sections)
  globals.css          # CSS variables, Tailwind import, custom classes
  about/
    page.tsx           # Me page (bio, at-a-glance card, photo carousel)
  components/
    accent-wheel.tsx   # Color picker button (client component)
    navbar.tsx         # Shared nav (client component — uses usePathname for active state)
    photo-carousel.tsx # Photo carousel with prev/next + dots (client component)
```

---

## Design System

### Colors (defined in `globals.css` `@theme`)
| Token | Value | Usage |
|---|---|---|
| `charcoal` | `#0c0f10` | Page background |
| `ember` | `#f5b163` | Default accent |
| `azure` | `#4fa2b2` | Decorative blobs |
| `--accent` | CSS variable | Dynamic accent, set by AccentWheel |

### Key Tailwind Classes
- `bg-charcoal` — page background
- `accent-bg` — accent-colored button (dark text on accent bg)
- `color-wheel` / `color-wheel-orbit` — the animated color picker button

### Decorative Background (used on every page)
Both pages share this fixed background pattern — replicate it on any new page:
```tsx
<div className="pointer-events-none fixed inset-0 overflow-hidden">
  <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[120px]"
    style={{ backgroundColor: "var(--accent)", opacity: 0.2 }} />
  <div className="absolute bottom-0 right-[-10%] h-[420px] w-[420px] rounded-full bg-azure/15 blur-[140px]" />
</div>
```

---

## Navigation

Tab order (defined once in `components/navbar.tsx` `NAV_ITEMS` array):
1. About Me → `/#about` (home hero section)
2. Experience → `/#experience` (home anchor)
3. Projects → `/#projects` (home anchor)
4. Me → `/about` (separate route — bio + carousel page)
5. Contact → `/#contact` (home anchor)

Active tab styling: `text-stone-100` (bright)
Inactive tab styling: `hover:text-stone-100` (muted, inherits `text-stone-300` from nav)

Active state logic (in `navbar.tsx`): "Me" tab is active when `pathname === "/about"`; "About Me" tab is active when on `/`. All anchor tabs are never highlighted as active since scroll tracking isn't implemented.

**Important**: Nav is now a shared component — only edit `components/navbar.tsx` to change tabs. Both pages import it.

---

## Components

### `Navbar` (`components/navbar.tsx`)
- Client component — uses `usePathname()` to set the active tab
- `NAV_ITEMS` array is the single source of truth for tab order and hrefs
- To add/remove/rename tabs, edit only this array
- "Me" tab (`/about`) gets `text-stone-100` when on that route; "About Me" gets it on `/`

### `AccentWheel` (`components/accent-wheel.tsx`)
- Client component — cycles through 6 accent colors on click
- Persists selection to `localStorage` under key `"site-accent-index"`
- Sets `--accent` CSS variable on `document.documentElement`
- Accent colors: `#f5b163`, `#7bdff2`, `#ff7ab2`, `#9adf7d`, `#f4e77d`, `#c4a1ff`

### `PhotoCarousel` (`components/photo-carousel.tsx`)
- Client component — carousel with prev/next arrows and animated dot indicators
- Currently uses placeholder colored slides (`SLIDES` array)
- To add real photos: replace the `SLIDES` array entries — swap `bg` color class for an `<img>` or `next/image` element
- Dots animate width (`w-2` → `w-5`) to indicate active slide

---

## Patterns & Conventions

- **Client components**: Any component with state or browser APIs needs `"use client"` at the top
- **Section labels**: Use `<p className="text-xs uppercase tracking-[0.4em] text-stone-400">` above section headings
- **Cards**: `rounded-2xl border border-stone-800 bg-stone-900/70 p-6`
- **Hero card**: `rounded-3xl border border-stone-700/60 bg-stone-900/60 p-6 shadow-[0_0_60px_rgba(0,0,0,0.35)]`
- **Max width container**: `mx-auto w-full max-w-6xl px-6`
- **New pages**: Copy the header + background blobs from an existing page; use `relative z-10` on header and main

---

## Iteration Log

| Date | Change |
|---|---|
| Initial | Home page with hero, experience, projects, contact sections |
| +AccentWheel | Color picker in header top-left; accent persisted to localStorage |
| +About page | `/about` route with bio and at-a-glance card |
| +Nav tab | About tab added to nav; later renamed "About Me" |
| +Reorder nav | About Me moved to third position (Experience, Projects, About Me, Contact) |
| +PhotoCarousel | Carousel with 5 placeholder color slides added to About Me page |
| +Navbar component | Extracted shared `Navbar` component; nav is now single source of truth |
| +About Me tab | Added "About Me" as first tab → `/#about`; hero section given `id="about"` |
| Rename tab | `/about` page tab renamed from "About Me" to "Me" |
