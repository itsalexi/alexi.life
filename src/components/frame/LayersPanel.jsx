"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");

// The column beside the write-up: no box. The page's sections (the one you're reading is
// marked), then the rest of the folder as little frames, like the files on home, so this side
// is never empty. Tracks scroll position, so fast jumps never strand it.
export default function LayersPanel({
  headings = [],
  folderName,
  folderKey,
  siblings = [],
}) {
  const items = useMemo(
    () => headings.filter((h) => h.id && h.text && h.level === 2),
    [headings],
  );
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length < 2) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = innerHeight * 0.3;
      let current = items[0].id;
      for (const h of items) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= line) current = h.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    update();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <aside className="fp-side">
      <div className="fp-side-in">
        {items.length >= 2 ? (
          <nav aria-label="Sections">
            <p className="fp-side-h">Contents</p>
            <ol className="fp-toc">
              {items.map((h, k) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className={h.id === active ? "on" : undefined}
                    aria-current={h.id === active ? "true" : undefined}
                  >
                    <span aria-hidden="true">{pad(k + 1)}</span>
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        {siblings.length ? (
          <nav
            className={items.length >= 2 ? "fp-side-group" : undefined}
            aria-label={`More in ${folderName}`}
          >
            <p className="fp-side-h">
              <i className="fp-swatch" aria-hidden="true" />
              More in {folderName}
            </p>
            <ul className="fp-files">
              {siblings.map((s) => (
                <li key={s.title}>
                  <Link href={s.href}>
                    <span
                      className={`fp-file-thumb${s.logo ? " logo" : ""}${s.wide ? " wide" : ""}`}
                      style={
                        s.logo ? { background: s.bg } : { "--r": s.ratio }
                      }
                    >
                      <Image
                        src={s.img || s.logo}
                        alt=""
                        width={s.logo ? 40 : 128}
                        height={s.logo ? 40 : 80}
                      />
                    </span>
                    <span className="fp-file-text">
                      <b>{s.title}</b>
                      <small>
                        {[s.res || s.meta, s.when].filter(Boolean).join(" · ")}
                      </small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={`/?folder=${folderKey}`} className="fp-open">
              Open {folderName} <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        ) : null}
      </div>
    </aside>
  );
}
