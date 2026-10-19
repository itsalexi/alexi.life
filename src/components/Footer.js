"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { socials } from "../config/socials";
import { isCanvasPage } from "../lib/canvas-pages";

const links = [
  { name: "Projects", href: "/projects" },
  { name: "Writing", href: "/blog" },
  { name: "Talks", href: "/talks" },
  { name: "Hackathons", href: "/hackathons" },
  { name: "About", href: "/about" },
];

const socialLinks = [
  { name: "GitHub", href: socials.github },
  { name: "LinkedIn", href: socials.linkedin },
  { name: "Instagram", href: socials.instagram },
  { name: "Discord", href: socials.discord },
  { name: "Email", href: `mailto:${socials.email}` },
];

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Canvas pages end on their own footer (or none, on home).
  if (isCanvasPage(pathname)) return null;

  return (
    <footer className="relative z-10 mx-auto mt-24 w-full max-w-6xl px-5 pb-10 pt-12 sm:px-8 lg:px-10">
      <div className="border-t border-white/[0.08] pt-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="text-sm font-semibold text-[var(--portfolio-ink)] transition-colors duration-150 hover:text-white"
            >
              Alexi Canamo
            </Link>
          </div>

          <div>
            <p className="quiet-label mb-3">Index</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 md:flex-col">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--portfolio-ink-faint)] transition-colors duration-150 hover:text-[var(--portfolio-ink)]"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="quiet-label mb-3">Connect</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 md:flex-col">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={
                    link.href.startsWith("mailto:") ? undefined : "_blank"
                  }
                  rel={
                    link.href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="text-sm text-[var(--portfolio-ink-faint)] transition-colors duration-150 hover:text-[var(--portfolio-ink)]"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 text-xs text-[var(--portfolio-ink-faint)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} Alexi Canamo.</p>
        </div>
      </div>
    </footer>
  );
}
