"use client";

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

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-10">
      <div className="flex items-center gap-3">
        <AccentWheel />
      </div>
      <nav className="hidden items-center gap-8  px-6 py-2.5 text-sm text-stone-300 backdrop-blur-sm md:flex">
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
                  className={isActive ? "text-stone-100" : "hover:text-stone-100"}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <Link
        className="rounded-full border border-stone-600/60 px-4 py-2 text-sm text-stone-200 transition hover:border-stone-300 hover:text-stone-50"
        href="/#contact"
      >
        Let&apos;s talk
      </Link>
    </header>
  );
}
