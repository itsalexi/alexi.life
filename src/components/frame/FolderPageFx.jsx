"use client";

import { animate, stagger } from "motion";
import { useEffect } from "react";
import {
  getPreloaderReady,
  PRELOADER_READY_EVENT,
} from "../../hooks/usePreloaderReady";

// Same motion vocabulary as home: springs with ~0.9–1 damping ratio, no overshoot,
// coarse rest thresholds so nothing crawls the last pixel.
const spring = (stiffness, damping) => ({
  type: "spring",
  stiffness,
  damping,
  mass: 1,
  restDelta: 1,
  restSpeed: 30,
});
const SETTLE = spring(120, 19.5);
const GRAB = spring(420, 41);

// Everything that moves on a detail page: the arrival and scroll reveals, the reading bar,
// zoom-to-selection on images, and Alexi's cursor dropping by twice.
export default function FolderPageFx() {
  useEffect(() => {
    const root = document.querySelector(".alx-page");
    if (!root) return undefined;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const ac = new AbortController();
    const { signal } = ac;
    const timers = new Set();
    let alive = true;
    const later = (fn, ms) => {
      const t = setTimeout(() => {
        timers.delete(t);
        if (alive) fn();
      }, ms);
      timers.add(t);
      return t;
    };
    const on = (target, type, fn, opts = {}) =>
      target.addEventListener(type, fn, { ...opts, signal });
    const $ = (q) => root.querySelector(q);

    // ---------- arrival: the page settles in, then sections ease in as you reach them ----------
    const page = $(".fp");
    const tab = $(".fp-tab");
    const parts = [...root.querySelectorAll(".fp-head > *, .fp-hero")];
    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      page.style.opacity = 1;
      if (reduce) return;
      animate(
        parts,
        { opacity: [0, 1], y: [22, 0] },
        { ...SETTLE, delay: stagger(0.07, { startDelay: 0.06 }) },
      );
      animate(tab, { y: -8 }, GRAB);
      later(() => animate(tab, { y: 0 }, GRAB), 110);
    };
    if (getPreloaderReady()) open();
    else
      on(window, PRELOADER_READY_EVENT, () => later(open, 250), {
        once: true,
      });
    // never leave the page blank: if the ready signal was missed, open anyway
    const failsafe = setInterval(() => {
      if (opened) return clearInterval(failsafe);
      if (getPreloaderReady()) open();
    }, 600);
    signal.addEventListener("abort", () => clearInterval(failsafe));

    if (!reduce && "IntersectionObserver" in window) {
      const later_ = [
        ...root.querySelectorAll(
          ".fp-prose > h2, .fp-img, .fp-gallery, .fp-prose blockquote, .fp-next",
        ),
      ].filter((el) => el.getBoundingClientRect().top > innerHeight);
      for (const el of later_) {
        el.style.opacity = 0;
        el.style.transform = "translateY(18px)";
      }
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            io.unobserve(e.target);
            animate(e.target, { opacity: 1, y: [18, 0] }, SETTLE);
          }
        },
        { rootMargin: "0px 0px -12% 0px" },
      );
      for (const el of later_) io.observe(el);
      signal.addEventListener("abort", () => io.disconnect());
    }

    // ---------- reading bar, Figma blue, the same one the preloader uses ----------
    const bar = $(".fp-progress");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      bar.style.transform = `scaleX(${p})`;
      bar.style.opacity = scrollY > 40 ? 1 : 0;
    };
    on(window, "scroll", onScroll, { passive: true });
    onScroll();

    // ---------- zoom to selection: click an image and it fills the screen ----------
    const zoom = $(".fp-zoom");
    const zoomName = zoom.querySelector(".fp-zoom-fn span");
    let zoomed = null;
    const fit = (img) => {
      const ratio = (img.naturalWidth || 16) / (img.naturalHeight || 10);
      const maxW = innerWidth * 0.9;
      const maxH = innerHeight * 0.82;
      const w = Math.min(maxW, maxH * ratio);
      const h = w / ratio;
      return { x: (innerWidth - w) / 2, y: (innerHeight - h) / 2 + 12, w, h };
    };
    const place = (el, r) =>
      Object.assign(el.style, {
        left: `${r.x}px`,
        top: `${r.y}px`,
        width: `${r.w}px`,
        height: `${r.h}px`,
      });
    const tween = (a, b, el, opts) =>
      animate(0, 1, {
        ...opts,
        onUpdate: (p) =>
          place(el, {
            x: a.x + (b.x - a.x) * p,
            y: a.y + (b.y - a.y) * p,
            w: a.w + (b.w - a.w) * p,
            h: a.h + (b.h - a.h) * p,
          }),
      });
    const zoomIn = (frame) => {
      const src = frame.querySelector("img");
      if (!src || zoomed) return;
      const r = src.getBoundingClientRect();
      const from = { x: r.left, y: r.top, w: r.width, h: r.height };
      const to = fit(src);
      const copy = document.createElement("img");
      copy.src = src.currentSrc || src.src;
      copy.alt = "";
      copy.className = "fp-zoom-img";
      place(copy, from);
      zoom.appendChild(copy);
      zoomName.textContent = src.alt || "";
      zoom.dataset.open = "true";
      src.style.visibility = "hidden";
      zoomed = { src, copy, from };
      animate(zoom, { opacity: [0, 1] }, { duration: 0.25, ease: "easeOut" });
      tween(from, to, copy, reduce ? { duration: 0 } : spring(170, 25.5));
    };
    const zoomOut = async () => {
      if (!zoomed) return;
      const { src, copy } = zoomed;
      zoomed = null;
      const r = src.getBoundingClientRect();
      const to = { x: r.left, y: r.top, w: r.width, h: r.height };
      const c = copy.getBoundingClientRect();
      animate(
        zoom,
        { opacity: 0 },
        { duration: 0.3, ease: "easeIn", delay: 0.1 },
      );
      await tween(
        { x: c.left, y: c.top, w: c.width, h: c.height },
        to,
        copy,
        reduce ? { duration: 0 } : spring(220, 29),
      ).finished;
      src.style.visibility = "";
      copy.remove();
      zoom.dataset.open = "false";
    };
    for (const frame of root.querySelectorAll("[data-zoom]"))
      on(frame, "click", () => zoomIn(frame));
    on(zoom, "click", zoomOut);
    on(window, "keydown", (e) => {
      if (e.key === "Escape") zoomOut();
    });
    on(window, "scroll", () => zoomed && zoomOut(), { passive: true });

    // ---------- Alexi's cursor drops by: once at the live link, once at "Next" ----------
    if (finePointer && !reduce) {
      const cur = $(".fp-alexi");
      const chat = cur.querySelector(".chat");
      let x = innerWidth + 40;
      let y = innerHeight * 0.4;
      let busy = false;
      const setPos = (px, py) => {
        cur.style.transform = `translate(${px}px, ${py}px)`;
      };
      setPos(x, y);
      const travel = (tx, ty, duration = 1) => {
        const fx = x;
        const fy = y;
        const mx = (fx + tx) / 2 + (Math.random() - 0.5) * 80;
        const my = (fy + ty) / 2 - 40;
        x = tx;
        y = ty;
        return animate(0, 1, {
          duration,
          ease: [0.45, 0, 0.25, 1],
          onUpdate: (p) => {
            // a gentle arc, like a hand moving a mouse
            const q = 1 - p;
            setPos(
              q * q * fx + 2 * q * p * mx + p * p * tx,
              q * q * fy + 2 * q * p * my + p * p * ty,
            );
          },
        }).finished;
      };
      const visit = async (el, line) => {
        if (busy || !el) return;
        busy = true;
        // page coordinates, so the cursor scrolls with the page like a real collaborator's
        const r = el.getBoundingClientRect();
        const top = r.top + scrollY;
        x = innerWidth + 40;
        y = Math.max(scrollY + 40, top - 60);
        setPos(x, y);
        cur.style.opacity = 1;
        await travel(
          r.left + Math.min(r.width * 0.7, 120),
          top + r.height * 0.6,
        );
        if (!alive) return;
        chat.textContent = line;
        chat.classList.add("on");
        await new Promise((res) => later(res, 2600));
        chat.classList.remove("on");
        await travel(innerWidth + 40, y - 80, 0.9);
        cur.style.opacity = 0;
        busy = false;
      };
      const live = $(".fp-link");
      if (live) later(() => visit(live, "try it, it’s live"), 2600);
      const next = $(".fp-next");
      if (next) {
        const io = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            io.disconnect();
            later(() => visit(next, "this one’s good too"), 600);
          },
          { threshold: 0.6 },
        );
        io.observe(next);
        signal.addEventListener("abort", () => io.disconnect());
      }
    }

    return () => {
      alive = false;
      ac.abort();
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  return null;
}
