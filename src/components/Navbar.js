"use client";

import { IconArrowLeft, IconChevronDown } from "@tabler/icons-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { socials } from "../config/socials";
import { isCanvasPage } from "../lib/canvas-pages";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  Navbar,
  NavbarButton,
} from "./ui/resizable-navbar";

const STORIES_LINKS = [
  { name: "Writing", link: "/blog" },
  { name: "Talks", link: "/talks" },
  { name: "Hackathons", link: "/hackathons" },
];

const TOP_LINKS = [
  { name: "Projects", link: "/projects" },
  { name: "About", link: "/about" },
];

function pathMatchesStories(pathname) {
  if (!pathname) return false;
  return STORIES_LINKS.some(
    (item) => pathname === item.link || pathname.startsWith(`${item.link}/`),
  );
}

function isActive(pathname, link) {
  if (!pathname) return false;
  return pathname === link || pathname.startsWith(`${link}/`);
}

export default function PortfolioNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [referrer, setReferrer] = useState(null);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [mobileStoriesOpen, setMobileStoriesOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const storiesRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  const isDetailPage =
    pathname?.startsWith("/projects/") ||
    pathname?.startsWith("/talks/") ||
    pathname?.startsWith("/blog/") ||
    pathname?.startsWith("/hackathons/");
  const storiesActive = pathMatchesStories(pathname);

  useEffect(() => {
    if (!pathname) return;
    if (typeof window !== "undefined" && document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        const currentUrl = new URL(window.location.href);
        if (referrerUrl.origin === currentUrl.origin) {
          setReferrer(referrerUrl.pathname);
        }
      } catch {
        setReferrer(null);
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (!pathname) return;
    setIsOpen(false);
    setStoriesOpen(false);
    setMobileStoriesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!storiesOpen) return;

    const close = (event) => {
      if (storiesRef.current && !storiesRef.current.contains(event.target)) {
        setStoriesOpen(false);
      }
    };

    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [storiesOpen]);

  const handleNavClick = (event, link) => {
    event.preventDefault();
    setIsOpen(false);
    setStoriesOpen(false);
    router.push(link);
  };

  const handleBackClick = (event) => {
    event.preventDefault();
    setIsOpen(false);

    if (referrer === "/") {
      router.push("/", { scroll: false });
      return;
    }

    router.back();
  };

  const navPillClass =
    "tap-scale relative flex h-9 items-center px-3 text-sm text-[var(--portfolio-ink-muted)] transition-[color,scale] duration-150 ease-out hover:text-[var(--portfolio-ink)]";

  // Canvas pages (home, rebuilt detail pages) bring their own header.
  if (isCanvasPage(pathname)) return null;

  return (
    <Navbar className="fixed top-4">
      <NavBody className="max-w-[940px]">
        <div className="relative z-20 flex min-w-0 items-center gap-2">
          <Link
            href="/"
            className="tap-scale flex h-10 items-center rounded-full px-3 text-sm font-semibold tracking-[-0.018em] text-[var(--portfolio-ink)] transition-[background-color,color,scale] duration-150 ease-out hover:bg-white/[0.05] hover:text-white"
            aria-label="Alexi Canamo home"
          >
            Alexi
          </Link>

          {isDetailPage
            ? <button
                type="button"
                onClick={handleBackClick}
                className="tap-scale hidden h-9 items-center gap-1.5 rounded-full px-3 text-sm text-[var(--portfolio-ink-muted)] transition-[background-color,color,scale] duration-150 ease-out hover:bg-white/[0.05] hover:text-[var(--portfolio-ink)] sm:flex"
              >
                <IconArrowLeft className="h-4 w-4" stroke={1.8} />
                Back
              </button>
            : null}
        </div>

        <motion.div
          onMouseLeave={() => setHoveredIdx(null)}
          className="absolute inset-0 z-10 hidden flex-1 flex-row items-center justify-center gap-0 lg:flex"
        >
          <a
            href={TOP_LINKS[0].link}
            onMouseEnter={() => setHoveredIdx(0)}
            onClick={(event) => handleNavClick(event, TOP_LINKS[0].link)}
            className={cn(
              navPillClass,
              isActive(pathname, TOP_LINKS[0].link) &&
                "text-[var(--portfolio-ink)]",
            )}
          >
            {hoveredIdx === 0
              ? <motion.span
                  layoutId="navHover"
                  className="absolute inset-0 rounded-full bg-white/[0.07]"
                  transition={{ type: "spring", duration: 0.38, bounce: 0 }}
                />
              : null}
            <span className="relative z-20">{TOP_LINKS[0].name}</span>
          </a>

          <div className="relative" ref={storiesRef}>
            <button
              type="button"
              aria-expanded={storiesOpen}
              aria-haspopup="menu"
              onMouseEnter={() => setHoveredIdx(1)}
              onClick={() => setStoriesOpen((open) => !open)}
              className={cn(
                navPillClass,
                "gap-1",
                (storiesActive || storiesOpen) && "text-[var(--portfolio-ink)]",
              )}
            >
              {hoveredIdx === 1 || storiesOpen
                ? <motion.span
                    layoutId="navHover"
                    className="absolute inset-0 rounded-full bg-white/[0.07]"
                    transition={{ type: "spring", duration: 0.38, bounce: 0 }}
                  />
                : null}
              <span className="relative z-20">Stories</span>
              <IconChevronDown
                className={cn(
                  "relative z-20 h-3.5 w-3.5 opacity-70 transition-transform duration-200 ease-[var(--ease-out-expo)]",
                  storiesOpen ? "rotate-180" : "",
                )}
                stroke={1.8}
              />
            </button>

            {storiesOpen
              ? <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                  className="absolute left-1/2 top-[calc(100%+0.65rem)] z-[70] min-w-44 -translate-x-1/2 rounded-[16px] bg-[rgba(17,17,15,0.94)] p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-xl"
                >
                  {STORIES_LINKS.map((item) => (
                    <a
                      key={item.link}
                      role="menuitem"
                      href={item.link}
                      onClick={(event) => handleNavClick(event, item.link)}
                      className={cn(
                        "tap-scale flex h-10 items-center rounded-[11px] px-3 text-sm text-[var(--portfolio-ink-muted)] transition-[background-color,color,scale] duration-150 ease-out hover:bg-white/[0.055] hover:text-[var(--portfolio-ink)]",
                        isActive(pathname, item.link) &&
                          "text-[var(--portfolio-ink)]",
                      )}
                    >
                      {item.name}
                    </a>
                  ))}
                </motion.div>
              : null}
          </div>

          <a
            href={TOP_LINKS[1].link}
            onMouseEnter={() => setHoveredIdx(2)}
            onClick={(event) => handleNavClick(event, TOP_LINKS[1].link)}
            className={cn(
              navPillClass,
              isActive(pathname, TOP_LINKS[1].link) &&
                "text-[var(--portfolio-ink)]",
            )}
          >
            {hoveredIdx === 2
              ? <motion.span
                  layoutId="navHover"
                  className="absolute inset-0 rounded-full bg-white/[0.07]"
                  transition={{ type: "spring", duration: 0.38, bounce: 0 }}
                />
              : null}
            <span className="relative z-20">{TOP_LINKS[1].name}</span>
          </a>
        </motion.div>

        <div className="relative z-20 hidden items-center gap-1 lg:flex">
          <NavbarButton as={Link} variant="secondary" href="/contact">
            Contact
          </NavbarButton>
          <NavbarButton
            variant="dark"
            href={socials.resume}
            target="_blank"
            rel="noopener noreferrer"
          >
            Resume
          </NavbarButton>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <div className="relative z-20 flex min-w-0 items-center gap-2">
            <Link
              href="/"
              className="tap-scale flex h-10 items-center rounded-full px-3 text-sm font-semibold tracking-[-0.018em] text-[var(--portfolio-ink)]"
              aria-label="Alexi Canamo home"
            >
              Alexi
            </Link>

            {isDetailPage
              ? <button
                  type="button"
                  onClick={handleBackClick}
                  className="tap-scale flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-[var(--portfolio-ink-muted)] transition-[background-color,color,scale] duration-150 ease-out hover:bg-white/[0.05] hover:text-[var(--portfolio-ink)]"
                >
                  <IconArrowLeft className="h-4 w-4" stroke={1.8} />
                  Back
                </button>
              : null}
          </div>

          <MobileNavToggle
            isOpen={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          />
        </MobileNavHeader>

        <MobileNavMenu isOpen={isOpen}>
          <a
            href={TOP_LINKS[0].link}
            className="text-[var(--portfolio-ink-muted)]"
            onClick={(event) => handleNavClick(event, TOP_LINKS[0].link)}
          >
            {TOP_LINKS[0].name}
          </a>

          <div className="flex w-full flex-col gap-1">
            <button
              type="button"
              onClick={() => setMobileStoriesOpen((open) => !open)}
              className="flex min-h-10 w-full items-center justify-between text-left text-[var(--portfolio-ink-muted)]"
            >
              <span>Stories</span>
              <IconChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200 ease-[var(--ease-out-expo)]",
                  mobileStoriesOpen ? "rotate-180" : "",
                )}
                stroke={1.8}
              />
            </button>

            {mobileStoriesOpen
              ? <div className="ml-3 flex flex-col gap-3 border-l border-white/[0.08] pl-3">
                  {STORIES_LINKS.map((item) => (
                    <a
                      key={item.link}
                      href={item.link}
                      className="text-sm text-[var(--portfolio-ink-faint)]"
                      onClick={(event) => handleNavClick(event, item.link)}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              : null}
          </div>

          <a
            href={TOP_LINKS[1].link}
            className="text-[var(--portfolio-ink-muted)]"
            onClick={(event) => handleNavClick(event, TOP_LINKS[1].link)}
          >
            {TOP_LINKS[1].name}
          </a>

          <a
            href="/contact"
            className="text-[var(--portfolio-ink-muted)]"
            onClick={(event) => handleNavClick(event, "/contact")}
          >
            Contact
          </a>

          <a
            href={socials.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--portfolio-ink-muted)]"
            onClick={() => setIsOpen(false)}
          >
            Resume
          </a>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
