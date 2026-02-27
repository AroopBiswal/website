export default function Home() {
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
          <span className="text-xs uppercase tracking-[0.35em] text-stone-100 rainbow-name">
            Aroop
          </span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-stone-300 md:flex">
          <a className="hover:text-stone-100" href="#experience">
            Experience
          </a>
          <a className="hover:text-stone-100" href="#projects">
            Projects
          </a>
          <a className="hover:text-stone-100" href="#contact">
            Contact
          </a>
        </nav>
        <a
          className="rounded-full border border-stone-600/60 px-4 py-2 text-sm text-stone-200 transition hover:border-stone-300 hover:text-stone-50"
          href="#contact"
        >
          Let&apos;s talk
        </a>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-24">
        <section className="grid gap-10 pt-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-stone-400">
              SWE @ Meta
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-stone-50 md:text-5xl">
              HI I&apos;m aroop
            </h1>
            <p className="text-base leading-7 text-stone-300">
              I&apos;m Aroop, a software engineer focused on thoughtful product
              experiences, data-informed decisions, and infrastructure that keeps
              teams moving fast.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">
                Systems Design
              </span>
              <span className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">
                Product Engineering
              </span>
              <span className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">
                Data Platforms
              </span>
            </div>
          </div>
          <div className="rounded-3xl border border-stone-700/60 bg-stone-900/60 p-6 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
              Now
            </p>
            <p className="mt-4 text-lg text-stone-100">
              Driving performance improvements across backend services for Facebook and Instagram Ads
            </p>
            <div className="mt-6 space-y-3 text-sm text-stone-300">
              <div className="flex items-center justify-between">
                <span>Focus</span>
                <span className="text-stone-200">AI-enabled tooling</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Location</span>
                <span className="text-stone-200">San Francisco, CA</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Open to</span>
                <span className="text-stone-200">Advising, mentoring</span>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="space-y-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-stone-400">
                Past Experience
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-stone-50">
                Building outcomes across product, data, and infrastructure
              </h2>
            </div>
            <p className="hidden text-sm text-stone-400 md:block">
              2019 - Present
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-100">
                  Meta · Software Engineer
                </h3>
                <span className="text-xs text-stone-400">2022 - Now</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-300">
                Led reliability improvements for experimentation tooling,
                reducing time-to-insight for product teams while improving
                observability across platforms.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <li>Scaled data pipelines supporting 100M+ daily events.</li>
                <li>Designed guardrails for safe, rapid feature launches.</li>
                <li>Partnered with PMs to deliver measurable growth wins.</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-100">
                  Template Role · Company
                </h3>
                <span className="text-xs text-stone-400">2020 - 2022</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-300">
                Placeholder for a prior role focused on building customer-facing
                experiences and backend services that improved retention.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <li>Owned end-to-end delivery for a key product surface.</li>
                <li>Introduced analytics instrumentation for better insights.</li>
                <li>Mentored junior engineers and drove code quality.</li>
              </ul>
            </article>
          </div>
        </section>

        <section id="projects" className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-stone-400">
              Projects
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-50">
              Selected work and experiments
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Atlas",
                desc: "A platform for curated analytics narratives with fast, reliable data refreshes.",
                tags: ["Next.js", "Data", "Product"],
              },
              {
                title: "Signal Room",
                desc: "Internal tool that aggregates operational signals and surfaces anomalies.",
                tags: ["TypeScript", "Infra", "UX"],
              },
              {
                title: "Pulse",
                desc: "A lightweight experimentation dashboard for fast iteration cycles.",
                tags: ["React", "Observability", "Systems"],
              },
            ].map((project) => (
              <article
                key={project.title}
                className="flex h-full flex-col justify-between rounded-2xl border border-stone-800 bg-stone-900/70 p-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-stone-100">
                    {project.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-stone-300">
                    {project.desc}
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-stone-400">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-stone-700 px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="rounded-3xl border border-stone-800 bg-stone-900/80 p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-stone-400">
                Contact
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-stone-50">
                Let&apos;s build something thoughtful
              </h2>
              <p className="mt-2 text-sm text-stone-300">
                Email, calendar, or a quick DM works. I respond within 48 hours.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a className="accent-bg rounded-full px-5 py-2 text-sm font-medium transition" href="mailto:hello@aroop.dev">
                Email me
              </a>
              <a
                className="rounded-full border border-stone-600 px-5 py-2 text-sm text-stone-200 transition hover:border-stone-300"
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                className="rounded-full border border-stone-600 px-5 py-2 text-sm text-stone-200 transition hover:border-stone-300"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
