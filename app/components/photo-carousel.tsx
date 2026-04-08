"use client";

import { useState } from "react";

const SLIDES = [
  { bg: "bg-rose-400/70", label: "Photo 1" },
  { bg: "bg-sky-400/70", label: "Photo 2" },
  { bg: "bg-emerald-400/70", label: "Photo 3" },
  { bg: "bg-amber-400/70", label: "Photo 4" },
  { bg: "bg-violet-400/70", label: "Photo 5" },
];

export default function PhotoCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-stone-700/60">
        {/* Slide */}
        <div
          className={`flex h-72 w-full items-center justify-center ${SLIDES[current].bg} transition-colors duration-300`}
        >
          <span className="text-lg font-medium text-white/80">{SLIDES[current].label}</span>
        </div>

        {/* Prev / Next buttons */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-stone-900/60 p-2 text-stone-200 backdrop-blur-sm transition hover:bg-stone-900/80"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-stone-900/60 p-2 text-stone-200 backdrop-blur-sm transition hover:bg-stone-900/80"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 w-2 rounded-full transition-all ${
              i === current ? "w-5 bg-stone-200" : "bg-stone-600 hover:bg-stone-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
