import Link from "next/link";

import AccentWheel from "./components/accent-wheel";

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
          <AccentWheel />
        </div>
        <nav className="hidden items-center gap-8 text-sm text-stone-300 md:flex">
          <Link className="hover:text-stone-100" href="/about">
            About
          </Link>
          <a className="text-stone-100" href="#experience">
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
            <p className="text-lg font-semibold text-stone-100">SWE @ Meta</p>
            <h1 className="text-4xl font-semibold leading-tight text-stone-50 md:text-5xl">Hi I&apos;m Aroop</h1>
            <p className="text-base leading-7 text-stone-300">
              I&apos;m Aroop, a software engineer focused on thoughtful product
              experiences, data-informed decisions, and infrastructure that keeps
              teams moving fast.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">Systems Design</span>
              <span className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">Product Engineering</span>
              <span className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">Data Platforms</span>
            </div>
          </div>
          <div className="rounded-3xl border border-stone-700/60 bg-stone-900/60 p-6 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Jan 2025 - Now</p>
            <h3 className="mt-4 text-lg font-semibold text-stone-100">Meta · Software Engineer</h3>
            <p className="mt-4 text-lg text-stone-100">
              Driving performance improvements across backend services for Facebook and Instagram Ads
            </p>
            <ul className="mt-6 space-y-2 text-sm text-stone-300">
              <li>Improving backend performance for Facebook and Instagram Ads.</li>
              <li>Building AI-enabled internal tooling for faster engineering workflows.</li>
              <li>Strengthening reliability and observability across core services.</li>
            </ul>
          </div>
        </section>

        <section id="experience" className="space-y-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-stone-400">Past Experience</p>
              <h2 className="mt-3 text-2xl font-semibold text-stone-50">What I used to do</h2>
            </div>
            <p className="hidden text-sm text-stone-400 md:block">2018 - 2024</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-100">Meaku AI · AI Engineer</h3>
                <span className="text-xs text-stone-400">Aug 2024 - Oct 2024</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <li>Led development of a RAG agent with dynamic LLM controls (top-k, temperature, response length).</li>
                <li>Implemented context-aware prompt generation and fine-tuned OpenAI and Anthropic models on 150 curated conversations.</li>
                <li>Oversaw integration and public launch on a client website serving 20k+ monthly visitors.</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-100">Valley Tech Systems · ML Software Intern</h3>
                <span className="text-xs text-stone-400">Jun 2023 - Sep 2023</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <li>Served as primary ML software developer and led a team of three interns.</li>
                <li>Built a Python data pipeline to collect and prepare 10,000+ images for training.</li>
                <li>Trained and integrated a TensorFlow CNN for object classification into the existing product.</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-100">Intel Corporation · Software Engineer Intern</h3>
                <span className="text-xs text-stone-400">Jun 2022 - Sep 2022</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <li>Built a video-processing ML pipeline using Intel DLStreamer and OpenVINO models in the Client Computing Group.</li>
                <li>Independently delivered the pipeline and supporting workflows for end-user platforms.</li>
                <li>Authored porting docs for Windows, helping enable future development and official platform support.</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-100">Intel Corporation · Software Engineering Intern</h3>
                <span className="text-xs text-stone-400">Jun 2019 - Aug 2019</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <li>Retrained an image classification model on target objects and evaluated performance on Intel silicon with OpenVINO.</li>
                <li>Provided software support for the Intel Aero drone across 30+ client support tickets.</li>
                <li>Built hands-on experience in ML, computer vision, and customer-facing software support.</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6 md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-100">Intel Corporation · Technical Support Intern</h3>
                <span className="text-xs text-stone-400">Jun 2018 - Aug 2018</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <li>Managed daily technical escalations for Intel&apos;s development boards, drones, and camera products.</li>
                <li>Automated large-scale customer data transfer into a new database to streamline migration.</li>
                <li>Delivered Linux-based software fixes for external support tickets with timely resolution.</li>
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
                  <h3 className="text-lg font-semibold text-stone-100">{project.title}</h3>
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
