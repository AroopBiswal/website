import Navbar from "./components/navbar";

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

      <Navbar />

      <main className="page-enter relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-24">
        <section id="about" className="grid gap-10 pt-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <p className="text-lg font-semibold text-stone-100">SWE @ Meta</p>
            <h1 className="text-4xl font-semibold leading-tight text-stone-50 md:text-5xl">Hi I&apos;m Aroop</h1>
            <p className="text-base leading-7 text-stone-300">
              Software engineer at Meta, based in San Francisco.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">Systems Design</span>
              <span className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">Product Engineering</span>
              <span className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">Data Platforms</span>
            </div>
          </div>
          <div className="rounded-3xl border border-stone-700/60 bg-stone-900/60 p-6 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Jan 2025 - Now</p>
            <h3 className="mt-4 text-lg font-semibold text-stone-100">Meta · Software Engineer, Monetization</h3>
            <p className="mt-4 text-lg text-stone-100">
              Shipping ad delivery optimizations and internal AI tooling for a 100+ engineer Ads org
            </p>
            <ul className="mt-6 space-y-2 text-sm text-stone-300">
              <li>Shipped ad delivery optimizations driving $59M in annual revenue.</li>
              <li>Built the org-wide AI agent (54+ users), saving 4,500+ hours/year on experiment analysis.</li>
              <li>Extended code maintenance tooling, achieving 39x more stale code removal.</li>
              <li>Built a latency dashboard that cut time-to-insight by 80%.</li>
            </ul>
          </div>
        </section>

        <section id="experience" className="space-y-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-stone-400">Past Experience</p>
              <h2 className="mt-3 text-2xl font-semibold text-stone-50">What I used to do</h2>
            </div>
            <p className="hidden text-sm text-stone-400 md:block">2022 - 2024</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-700 hover:shadow-lg hover:shadow-black/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-100">Meaku AI · ML Engineer Intern</h3>
                <span className="text-xs text-stone-400">Aug 2024 - Sep 2024</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <li>Launched a RAG agent on a client site with 20k+ monthly visitors.</li>
                <li>Dynamic prompt generation cut response latency by 15%.</li>
                <li>Fine-tuned OpenAI and Anthropic LLMs on 150 curated conversations.</li>
                <li>Built an automated knowledge base pipeline with Firecrawl.</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-700 hover:shadow-lg hover:shadow-black/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-100">Aggieworks · Full Stack Engineer</h3>
                <span className="text-xs text-stone-400">Mar 2023 - Jun 2024</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <li>Grew Clubly from 0 to 2,000+ student users.</li>
                <li>Built semantic search using pgvector and Go.</li>
                <li>Led Svelte frontend and added Amplitude Analytics.</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-700 hover:shadow-lg hover:shadow-black/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-100">Valley Tech Systems · Software Engineer Intern</h3>
                <span className="text-xs text-stone-400">Jun 2023 - Sep 2023</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <li>Led 3 interns building a pipeline to collect and label 4,000+ training images.</li>
                <li>Trained a TensorFlow model to 0.86 accuracy and shipped it to the commercial product.</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-700 hover:shadow-lg hover:shadow-black/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-100">Intel Corporation · Software Engineer Intern</h3>
                <span className="text-xs text-stone-400">Jun 2022 - Sep 2022</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <li>Built a GStreamer video-processing pipeline for video chat.</li>
                <li>Wrote a Python extension for AI inferencing and real-time video effects.</li>
                <li>Containerized and ported the pipeline from Linux to WSL 2.0 with Docker.</li>
              </ul>
            </article>
          </div>
        </section>

        <section id="projects" className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-stone-400">Projects</p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-50">Some of the things I&apos;ve made</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Notion Budget Sync",
                desc: "Import bank transactions (CSV, XLSX, any format) into a Notion budget database. An LLM detects the file format on first run and caches the mapping — every subsequent sync is free and deterministic. Ships as a web UI and CLI.",
                tags: ["Python", "Flask", "LangChain", "Notion API"],
                href: "https://github.com/AroopBiswal/notion-budget-sync",
                linkLabel: "GitHub ↗",
              },
              {
                title: "Clubly",
                desc: "Student club discovery platform built with Aggieworks. Grew from 0 to 2,000+ UC Davis students. Features semantic search powered by pgvector and Amplitude Analytics for usage insights.",
                tags: ["Go", "Svelte", "pgvector", "Postgres"],
                href: "https://clubly.org/",
                linkLabel: "Website ↗",
              },
              {
                title: "Expense Splitter",
                desc: "A utility for splitting shared expenses across groups, tracking balances, and settling up — built for clarity when money gets complicated.",
                tags: ["TypeScript", "React", "Finance"],
                href: null,
                linkLabel: null,
              },
            ].map((project) => (
              <article
                key={project.title}
                className="flex h-full flex-col justify-between rounded-2xl border border-stone-800 bg-stone-900/70 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-700 hover:shadow-lg hover:shadow-black/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-stone-100">{project.title}</h3>
                    {project.href && project.linkLabel && (
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 shrink-0 text-xs text-stone-400 underline underline-offset-2 hover:text-stone-200"
                      >
                        {project.linkLabel}
                      </a>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-stone-300">{project.desc}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-stone-400">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-stone-700 px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="rounded-3xl border border-stone-800 bg-stone-900/80 p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-stone-400">Contact</p>
              <h2 className="mt-3 text-2xl font-semibold text-stone-50">Let&apos;s build something thoughtful</h2>
              <p className="mt-2 text-sm text-stone-300">
                Email, calendar, or a quick DM works. I respond within 48 hours.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a className="accent-bg rounded-full px-5 py-2 text-sm font-medium transition" href="mailto:aroopbiswal@gmail.com">
                Email me
              </a>
              <a
                className="rounded-full border border-stone-600 px-5 py-2 text-sm text-stone-200 transition hover:border-stone-300"
                href="https://linkedin.com/in/AroopBiswal/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                className="rounded-full border border-stone-600 px-5 py-2 text-sm text-stone-200 transition hover:border-stone-300"
                href="https://github.com/AroopBiswal"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <a
                className="rounded-full border border-stone-600 px-5 py-2 text-sm text-stone-200 transition hover:border-stone-300"
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Resume
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
