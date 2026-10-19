"use client";

import { useEffect, useState } from "react";

const KEY = "alx-theme";

// Day / night. The new theme spreads out from the button (the same move as Say hi),
// remembered across visits; the first paint is set by a tiny script in the layout.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "light");
  }, []);

  const toggle = (e) => {
    const next = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(KEY, next);
      } catch {}
      setTheme(next);
    };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) return apply();
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const R = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );
    document.documentElement.dataset.themeSwitch = "true";
    const t = document.startViewTransition(apply);
    t.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${R}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
    t.finished.finally(() => {
      delete document.documentElement.dataset.themeSwitch;
    });
  };

  const dark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
      title={dark ? "Day mode" : "Night mode"}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        {dark ? (
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
          </g>
        ) : (
          <path
            d="M20.2 14.6A8.3 8.3 0 0 1 9.4 3.8a8.3 8.3 0 1 0 10.8 10.8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}
