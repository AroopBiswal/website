import Link from "next/link";

import AccentWheel from "../components/accent-wheel";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-charcoal text-stone-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ backgroundColor: "var(--accent)", opacity: 0.2 }}
        />
        <div className="absolute bottom-0 right-[-10%] h-[420px] w-[420px] rounded-full bg-azure/15 blur-[140px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-10">
        <div className="flex items-center gap-3">
          <AccentWheel />
        </div>
        <nav className="hidden items-center gap-8 text-sm text-stone-300 md:flex">
          <Link className="text-stone-100" href="/about">
            About
          </Link>
          <Link className="hover:text-stone-100" href="/">
            Experience
          </Link>
          <Link className="hover:text-stone-100" href="/#projects">
            Projects
          </Link>
          <Link className="hover:text-stone-100" href="/#contact">
            Contact
          </Link>
        </nav>
        <Link
          className="rounded-full border border-stone-600/60 px-4 py-2 text-sm text-stone-200 transition hover:border-stone-300 hover:text-stone-50"
          href="/#contact"
        >
          Let&apos;s talk
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24">
        <section className="grid gap-10 pt-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-stone-400">About Me</p>
            <h1 className="text-4xl font-semibold leading-tight text-stone-50 md:text-5xl">
              I build software that turns complex systems into practical outcomes.
            </h1>
            <p className="text-base leading-7 text-stone-300">
              I&apos;m Aroop, a software engineer focused on backend performance,
              machine-learning-driven features, and product experiences that stay
              reliable as they scale.
            </p>
            <p className="text-base leading-7 text-stone-300">
              I enjoy collaborating across engineering, product, and data teams to
              ship tools that improve both user impact and developer velocity.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">Backend Systems</span>
              <span className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">Applied AI</span>
              <span className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">Product Engineering</span>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-700/60 bg-stone-900/60 p-6 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">At A Glance</p>
            <ul className="mt-4 space-y-3 text-sm text-stone-300">
              <li>SWE @ Meta working on Ads backend performance.</li>
              <li>Built and launched RAG + LLM workflows in production.</li>
              <li>Background across ML internships and systems engineering.</li>
              <li>Based in San Francisco, CA.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
