import Navbar from "../components/navbar";
import PhotoCarousel from "../components/photo-carousel";

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

      <Navbar />

      <main className="page-enter relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24">
        <section className="grid gap-10 pt-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-stone-400">About Me</p>
            <h1 className="text-4xl font-semibold leading-tight text-stone-50 md:text-5xl">
              Hi, I&apos;m Aroop
            </h1>
            <p className="text-base leading-7 text-stone-300">
              In my free time I like playing basketball, going to concerts, and trying new food in SF.
            </p>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-stone-400">Things I like to do</p>
              <div className="flex flex-wrap gap-3">
                {[
                  "Basketball",
                  "Snowboarding",
                  "Hike (if it's not too hot outside)",
                  "Chess",
                  "EDM",
                  "Doomscroll",
                  "Try new food",
                  "Be Spontaneous",
                  "Cook",
                  "Weightlift",
                  "Run",
                ].map((item) => (
                  <span key={item} className="rounded-full bg-stone-800/80 px-4 py-2 text-xs text-stone-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-700/60 bg-stone-900/60 p-6 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">At A Glance</p>
            <ul className="mt-4 space-y-3 text-sm text-stone-300">
              <li>Software Engineer, Monetization @ Meta — shipping ad delivery optimizations and internal AI tooling.</li>
              <li>UC Davis BS Computer Science & Engineering — Regents Scholar, Honors Program, Dean&apos;s Honor List.</li>
              <li>Built and launched production RAG + LLM systems, a 2,000-user app, and ML pipelines across internships.</li>
              <li>Based in Menlo Park, CA.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-stone-400">Photos</p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-50">A few moments</h2>
          </div>
          <PhotoCarousel />
        </section>
      </main>
    </div>
  );
}
