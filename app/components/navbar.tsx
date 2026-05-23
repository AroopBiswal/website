"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AccentWheel from "./accent-wheel";

const NAV_GROUPS = [
  {
    page: "Home",
    items: [
      { label: "About Me", href: "/#about" },
      { label: "Experience", href: "/#experience" },
      { label: "Projects", href: "/#projects" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    page: "Me",
    items: [{ label: "Me", href: "/about" }],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-20 mx-auto w-full max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AccentWheel />
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 px-6 py-2.5 text-sm text-stone-300 backdrop-blur-sm md:flex">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.page} className="flex items-center gap-8">
              {gi > 0 && <div className="h-4 w-px bg-stone-700" />}
              {group.items.map(({ label, href }) => {
                const isActive =
                  href === "/about" ? pathname === "/about" : pathname === "/" && href === "/#about";
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`relative transition-colors duration-150 ${
                      isActive ? "text-stone-100" : "text-stone-300 hover:text-stone-100"
                    }`}
                  >
                    {label}
                    {isActive && (
                      <span
                        className="absolute -bottom-1 left-1/2 h-px w-4 -translate-x-1/2 rounded-full transition-all duration-300"
                        style={{ backgroundColor: "var(--accent)" }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col justify-center gap-[5px] p-2 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-px w-5 rounded-full bg-stone-300 transition-all duration-200 ${
              mobileOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-5 rounded-full bg-stone-300 transition-all duration-200 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-px w-5 rounded-full bg-stone-300 transition-all duration-200 ${
              mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <nav
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-4 flex flex-col rounded-2xl border border-stone-800 bg-stone-900/90 px-6 py-5 backdrop-blur-sm">
          {ALL_NAV_ITEMS.map(({ label, href }) => {
            const isActive =
              href === "/about" ? pathname === "/about" : pathname === "/" && href === "/#about";
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`border-b border-stone-800 py-3 text-sm transition-colors duration-150 last:border-0 ${
                  isActive ? "text-stone-100" : "text-stone-400 hover:text-stone-100"
                }`}
                style={isActive ? { color: "var(--accent)" } : undefined}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
