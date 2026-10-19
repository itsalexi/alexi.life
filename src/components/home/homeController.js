// Everything that moves on the home page. React renders the markup once; this wires the
// folders, the canvas zoom and the small Figma touches to it and returns a cleanup.
//
// Motion rules we tuned by measuring frames: springs with a damping ratio around 0.9 to 1
// (no overshoot), restDelta/restSpeed high enough that nothing crawls the last pixel, start
// transforms set before anything becomes visible, and stacking never changes mid-flight.
import { animate as motionAnimate, stagger } from "motion";
import { PRELOADER_READY_EVENT } from "../../hooks/usePreloaderReady";

const spring = (stiffness, damping) => ({
  type: "spring",
  stiffness,
  damping,
  mass: 1,
  restDelta: 1,
  restSpeed: 30,
});
const DRAWER = spring(150, 22); // pulling a folder up
const DRAWER_BACK = spring(185, 24.5); // letting it drop back
const GRAB = spring(420, 41); // your hand on the tab
const SETTLE = spring(120, 19.5); // the canvas settling after the folder stops
const TUCK = spring(260, 29); // photo + papers slipping into the folder
const ZOOM = spring(150, 24.5); // canvas camera: a glide, no bounce
const PEEK_CLOSED = 66;
const TUCKED = 96; // far enough down that no edge of the photo shows above the folder
const FRONT = 3;

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );

export function mountHome(root, { folders, email, navigate }) {
  if (!root) return () => {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
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
  const cancel = (t) => {
    clearTimeout(t);
    timers.delete(t);
  };
  const on = (target, type, fn, opts = {}) =>
    target.addEventListener(type, fn, { ...opts, signal });
  const animate = (...args) => {
    const controls = motionAnimate(...args);
    if (reduce) controls.speed = 6;
    return controls;
  };
  const set = (el, values) => motionAnimate(el, values, { duration: 0 });
  const $ = (q) => root.querySelector(q);

  const col = $(".col");
  const units = [...root.querySelectorAll(".unit")];
  const tabs = units.map((u) => u.querySelector(".tab"));
  const bodies = units.map((u) => u.querySelector(".body"));
  const $b = (i, q) => bodies[i].querySelector(q);

  // ---------------- drawer ----------------
  let open = -1;
  let busy = false;
  let queued = null;
  let hovered = -1;
  let hoverT = null;
  // Alexi's cursor doubles as a guide; set up further down (no-op on touch / reduced motion)
  let hint = () => {};
  const baseY = () => col.offsetHeight - PEEK_CLOSED;

  const layoutTabs = () => {
    let x = innerWidth < 600 ? 10 : 24;
    for (const t of tabs) {
      t.style.left = `${x}px`;
      x += t.offsetWidth + 6;
    }
  };

  // stacking: the folder that's out is on top; in the drawer, the front one is next, then the rest
  const zs = () =>
    units.forEach((u, i) => {
      u.classList.toggle("front-of-drawer", i === (open === FRONT ? 2 : FRONT));
      u.style.zIndex = i === open ? 2 : 10 + i;
      u.classList.toggle("is-open", i === open);
      tabs[i].setAttribute("aria-selected", String(i === open));
    });
  // i just landed back in the drawer; if it became the front one, crossfade the strip instead of swapping colors in a frame
  const restack = (i) => {
    const was = units.findIndex((u) => u.classList.contains("front-of-drawer"));
    zs();
    const now = units.findIndex((u) => u.classList.contains("front-of-drawer"));
    if (i === now && was !== now)
      animate(
        bodies[i],
        { opacity: [0, 1] },
        { duration: 0.22, ease: "easeOut" },
      );
  };
  const tuckInstant = (i) => {
    set($b(i, ".papers"), { y: 18 });
    set($b(i, ".print"), { y: TUCKED, rotate: 2 });
  };
  const showInsides = (i, opened) => {
    $b(i, ".sheet .inner").style.opacity = opened ? 1 : 0;
    const peek = !opened && i === FRONT;
    $b(i, ".print").style.opacity = peek ? 1 : 0;
    $b(i, ".papers").style.opacity = peek ? 1 : 0;
    if (peek) {
      set($b(i, ".papers"), { y: 0 });
      set($b(i, ".print"), { y: 0, rotate: 4 });
    } else tuckInstant(i);
  };
  const showPeekers = (i, show, lift) => {
    const pa = $b(i, ".papers");
    const pr = $b(i, ".print");
    if (show) {
      pa.style.opacity = 1;
      pr.style.opacity = 1;
    }
    animate(
      pa,
      { y: show ? (lift ? -5 : 0) : 18 },
      show ? spring(300, 30) : spring(320, 34),
    );
    animate(
      pr,
      {
        y: show ? (lift ? -10 : 0) : TUCKED,
        rotate: show ? (lift ? 1.5 : 4) : 2,
      },
      show ? spring(280, 29) : spring(320, 34),
    );
  };
  const tuck = (i) => {
    animate($b(i, ".papers"), { y: 18 }, TUCK);
    animate($b(i, ".print"), { y: TUCKED, rotate: 2 }, TUCK);
  };
  const settleIn = (i, delay) => {
    const g = $b(i, ".sheet .inner");
    g.style.opacity = 1;
    animate(g, { opacity: [0, 1] }, { duration: 0.22, delay });
    animate(g, { y: [16, 0] }, { ...SETTLE, delay });
  };
  const grab = (i) => {
    animate(tabs[i], { y: -8 }, GRAB);
    later(() => animate(tabs[i], { y: 0 }, GRAB), reduce ? 20 : 110);
  };

  async function openF(i) {
    if (hovered >= 0 && hovered !== i) liftOff(hovered, true);
    hovered = -1;
    busy = true;
    open = i;
    root.classList.add("open");
    zs();
    grab(i);
    tuck(i);
    units.forEach((u, j) => {
      if (j !== i) animate(u, { y: baseY() }, spring(260, 32));
    });
    const d = animate(units[i], { y: 0 }, { ...DRAWER, delay: 0.07 });
    settleIn(i, 0.26);
    await d.finished;
    if (!alive) return;
    busy = false;
    if (cv[i].el.offsetParent)
      hint(
        "zoom-in",
        () => cv[i].frames[1] ?? cv[i].frames[0],
        "click one to zoom in",
      );
    flush();
  }

  async function closeF() {
    busy = true;
    const i = open;
    open = -1;
    // the front folder's photo stays tucked until the one you closed has landed, then slides up
    const pa = $b(FRONT, ".papers");
    const pr = $b(FRONT, ".print");
    pa.style.opacity = 0;
    pr.style.opacity = 0;
    tuckInstant(FRONT);
    root.classList.remove("open");
    // keep its place in the stack (behind the drawer's tabs) on the way down; restack once it's home
    units[i].classList.remove("is-open");
    tabs[i].setAttribute("aria-selected", "false");
    const d = animate(units[i], { y: baseY() }, DRAWER_BACK);
    await d.finished;
    if (!alive) return;
    restack(i);
    resetCanvas(i);
    $b(i, ".sheet .inner").style.opacity = 0;
    tuckInstant(i);
    showPeekers(FRONT, true, false);
    for (const t of tabs) {
      if (t.matches(":hover")) {
        t.classList.add("rest");
        t.addEventListener("pointerleave", () => t.classList.remove("rest"), {
          once: true,
          signal,
        });
      }
    }
    busy = false;
    flush();
  }

  // switching: the one you clicked is pulled up while the open one is put back, both behind the drawer's tabs
  async function swapF(j) {
    hovered = -1;
    busy = true;
    const i = open;
    open = j;
    units.forEach((u, k) => {
      u.style.zIndex = k === j ? 3 : k === i ? 2 : 10 + k;
      u.classList.toggle("is-open", k === j);
      tabs[k].setAttribute("aria-selected", String(k === j));
    });
    tuckInstant(j);
    animate(
      $b(i, ".sheet .inner"),
      { opacity: 0 },
      { duration: 0.25, delay: 0.1 },
    );
    // put back: eases in (no jolt off the top), glides down alongside the one coming up, lands soft
    const back = animate(
      units[i],
      { y: baseY() },
      { duration: 0.76, ease: [0.42, 0, 0.22, 1], delay: 0.06 },
    );
    grab(j);
    settleIn(j, 0.18);
    await Promise.all([
      animate(units[j], { y: 0 }, spring(150, 22)).finished,
      back.finished,
    ]);
    if (!alive) return;
    showInsides(i, false);
    restack(i);
    resetCanvas(i);
    busy = false;
    flush();
  }

  // hover a folder in the drawer: it lifts a little where it is; nothing reorders, so nothing pops
  function liftOn(i) {
    if (busy || i === open) return;
    if (hovered >= 0 && hovered !== i) liftOff(hovered, true);
    hovered = i;
    animate(units[i], { y: baseY() - 14 }, spring(320, 28));
    // the folder feels full: its file count ticks up and the papers inside rustle
    const count = tabs[i].querySelector("small");
    const n = folders[i].items.length;
    animate(0, n, {
      duration: 0.42,
      ease: "easeOut",
      onUpdate: (v) => {
        count.textContent = String(Math.round(v)).padStart(2, "0");
      },
    });
    animate(
      $b(i, ".papers i:nth-child(2)"),
      { rotate: [-0.8, -2.6, 0.4, -0.8] },
      { duration: 0.55, ease: "easeInOut" },
    );
    if (open < 0) showPeekers(i, true, true);
    if (open < 0 && i !== FRONT) showPeekers(FRONT, false);
  }
  function liftOff(i, quiet) {
    if (busy || i === open) return;
    if (hovered === i) hovered = -1;
    animate(units[i], { y: baseY() }, spring(320, 32));
    if (open < 0) {
      if (i !== FRONT) showPeekers(i, false);
      else showPeekers(i, true, false);
      if (!quiet && i !== FRONT) showPeekers(FRONT, true, false);
    }
  }

  function onTab(i) {
    cancel(hoverT);
    if (busy) {
      queued = i; // last click wins, never dropped
      return;
    }
    if (open < 0) openF(i);
    else if (i === open) closeF();
    else swapF(i);
  }
  function flush() {
    if (queued == null) return;
    const q = queued;
    queued = null;
    onTab(q);
  }

  // ---------------- canvas: frames laid out like a Figma page; click one to zoom to it ----------------
  const cv = folders.map((folder, i) => ({
    folder,
    el: $b(i, ".canvas"),
    world: $b(i, ".world"),
    cap: $b(i, ".cap"),
    zoomChip: $b(i, ".zoom"),
    frames: [...bodies[i].querySelectorAll(".frame")],
    rects: [],
    at: -1,
    z: 1,
    cam: null,
    zc: null,
    sc: null,
  }));

  // every order of 0..n-1 that's at most two swaps from the original (files mostly keep their place)
  const orders = (n) => {
    const out = [];
    const walk = (left, acc) => {
      if (!left.length) return out.push(acc);
      for (const k of left) walk(left.filter((j) => j !== k), [...acc, k]);
    };
    walk([...Array(n).keys()], []);
    return out
      .map((o) => ({
        o,
        swaps: o.reduce(
          (t, a, i) => t + o.slice(i + 1).filter((b) => b < a).length,
          0,
        ),
      }))
      .filter((x) => x.swaps <= 2);
  };

  // Frames keep their pictures' own shapes and sit in justified rows: every row spans the
  // same width, so there are no orphans floating in the middle and no wide promo cut in half.
  // Tries every way to break the files into rows (nudging the order a little if that evens
  // them out). If everything fits at a comfortable size it all sits on screen; if not (short
  // laptop screens) frames keep that size and the canvas scrolls, like a Figma page that runs
  // past the window.
  function layoutCanvas(i) {
    const c = cv[i];
    const W = c.el.clientWidth;
    const H = c.el.clientHeight;
    const n = c.frames.length;
    if (!W || !H || !n) return;
    const P = Math.max(28, W * 0.05);
    const PV = Math.max(24, H * 0.045);
    const G = Math.max(22, W * 0.028);
    const GV = 40;
    const L = 30;
    const ratio = c.frames.map((fr) => +fr.dataset.r || 1.6);
    const availW = W - 2 * P;
    const availH = H - 2 * PV;
    const T = Math.max(160, Math.min(210, availH * 0.36)); // comfortable row height
    let best = null;
    for (const { o, swaps } of orders(n)) {
      const ar = o.map((k) => ratio[k]);
      for (let mask = 0; mask < 1 << (n - 1); mask++) {
        const rows = [[0]];
        for (let k = 1; k < n; k++) {
          if (mask & (1 << (k - 1))) rows.push([k]);
          else rows[rows.length - 1].push(k);
        }
        const sums = rows.map((r) => r.reduce((t, k) => t + ar[k], 0));
        // the row width that fills the height exactly (heights are linear in it)
        const fixed = rows.length * L + (rows.length - 1) * GV;
        const inv = sums.reduce((t, S) => t + 1 / S, 0);
        const gapH = rows.reduce(
          (t, r, j) => t + ((r.length - 1) * G) / sums[j],
          0,
        );
        const fitW = (availH - fixed + gapH) / inv;
        // the row width that keeps the shortest row at a comfortable height
        const wantW = Math.min(
          availW,
          Math.max(...rows.map((r, j) => T * sums[j] + (r.length - 1) * G)),
        );
        // nearly fits: shrink a touch and keep it all on screen; otherwise scroll
        const rw = fitW >= wantW * 0.9 ? Math.min(fitW, availW) : wantW;
        const hs = rows.map((r, j) => (rw - (r.length - 1) * G) / sums[j]);
        const total =
          hs.reduce((t, h) => t + h + L, 0) + (rows.length - 1) * GV;
        let score = 0.96 ** swaps;
        // even rows read calmer than a big row over a strip of small ones
        if (Math.max(...hs) / Math.min(...hs) > 1.3) score *= 0.6;
        if (n > 2 && rows.some((r) => r.length === 1)) score *= 0.85;
        // a frame too narrow for its own name reads as a mistake
        if (rows.some((r, j) => r.some((k) => hs[j] * ar[k] < 150)))
          score *= 0.5;
        score *=
          Math.sqrt(rw / availW) * // spanning the canvas beats a block floating in the middle
          Math.min(1, Math.min(...hs) / T) ** 2 * // small frames are the worst outcome
          Math.min(1, availH / total) ** 0.7 * // scrolling is fine, but less is better
          Math.sqrt(Math.min(1, total / availH)); // and a thin strip in a tall canvas looks lost
        if (!best || score > best.score)
          best = { rows: rows.map((r) => r.map((k) => o[k])), hs, rw, score };
      }
    }
    const { rows, hs, rw } = best;
    const total = hs.reduce((t, h) => t + h + L, 0) + (rows.length - 1) * GV;
    let y = Math.max(PV, (H - total) / 2) + L;
    c.maxPan = Math.max(0, total + 2 * PV - H);
    c.pan = Math.min(0, Math.max(-c.maxPan, c.pan || 0));
    const left = (W - rw) / 2;
    rows.forEach((row, j) => {
      const h = hs[j];
      let x = left;
      for (const k of row) {
        const w = h * ratio[k];
        const fr = c.frames[k];
        Object.assign(fr.style, {
          left: `${x}px`,
          top: `${y}px`,
          width: `${w}px`,
        });
        fr.querySelector(".dim").textContent =
          `${Math.round(w)} × ${Math.round(h)}`;
        c.rects[k] = { x, y, w, h };
        x += w + G;
      }
      y += h + L + GV;
    });
    if (c.at >= 0) camTo(i, c.at, true);
    else panTo(i, c.pan, true);
  }

  // scrolling a canvas that runs past the window: the wheel (or a trackpad) moves the page of
  // frames; soft fades at the edges say there's more that way
  function panTo(i, y, instant) {
    const c = cv[i];
    c.pan = Math.min(0, Math.max(-(c.maxPan || 0), y));
    c.el.classList.toggle("more-below", c.pan > -(c.maxPan || 0) + 2);
    c.el.classList.toggle("more-above", c.pan < -2);
    c.cam?.stop();
    if (instant) set(c.world, { y: c.pan });
    else
      c.cam = animate(c.world, { y: c.pan }, { duration: 0.22, ease: "easeOut" });
  }

  const setZ = (c, z) => {
    c.z = z;
    c.world.style.setProperty("--z", z);
    c.zoomChip.textContent = `${Math.round(z * 100)}%`;
  };

  function camTo(i, k, instant) {
    const c = cv[i];
    const W = c.el.clientWidth;
    const H = c.el.clientHeight;
    let x = 0;
    let y = c.pan || 0;
    let z = 1;
    if (k >= 0 && c.rects[k]) {
      const r = c.rects[k];
      const narrow = W < 760;
      const aw = narrow ? W * 0.88 : W * 0.54;
      const ah = narrow ? H * 0.5 : H * 0.74;
      const ax = narrow ? W * 0.06 : W * 0.05;
      const ay = narrow ? H * 0.08 : (H - ah) / 2;
      z = Math.min(aw / r.w, ah / r.h);
      x = ax + (aw - r.w * z) / 2 - r.x * z;
      y = ay + (ah - r.h * z) / 2 - r.y * z;
    }
    c.cam?.stop();
    c.sc?.stop();
    c.zc?.stop();
    if (instant) {
      set(c.world, { x, y, scale: z });
      setZ(c, z);
      return;
    }
    const fine = { ...ZOOM, restDelta: 0.001, restSpeed: 0.02 }; // same spring, finer stop for a unitless scale
    c.cam = animate(c.world, { x, y }, ZOOM);
    c.sc = animate(c.world, { scale: z }, fine);
    c.zc = animate(c.z, z, { ...fine, onUpdate: (v) => setZ(c, v) });
  }

  const capHTML = (folder, item, k) =>
    `<div class="meta"><span class="l">${item.res ? `<span class="res">${esc(item.res)}</span>` : ""}<span>${esc(item.meta)}</span></span><span class="when">${esc(item.when)}</span></div>
    <p class="two"><b>${esc(item.title)}.</b> ${esc(item.line)}</p><a class="view" href="${esc(item.href)}">${esc(folder.view)} ›</a>
    <div class="hint"><kbd>←</kbd><kbd>→</kbd> ${k + 1} of ${folder.items.length} &nbsp;·&nbsp; <kbd>esc</kbd> zoom out</div>`;

  function zoomTo(i, k) {
    const c = cv[i];
    if (k === c.at) return;
    const first = c.at < 0;
    if (k >= 0)
      hint("flip", () => c.cap.querySelector(".hint"), "← → to flip through");
    c.at = k;
    c.el.classList.toggle("zoomed", k >= 0);
    c.frames.forEach((fr, j) => {
      fr.classList.toggle("on", j === k);
    });
    camTo(i, k);
    // words: out quickly, swap, back in once the camera is nearly there
    animate(
      c.cap,
      { opacity: 0, x: k >= 0 && !first ? -8 : 0 },
      { duration: 0.12 },
    ).finished.then(() => {
      if (!alive || c.at !== k) return;
      c.cap.classList.toggle("on", k >= 0);
      if (k < 0) return;
      c.cap.innerHTML = capHTML(c.folder, c.folder.items[k], k);
      animate(
        c.cap,
        { opacity: [0, 1], x: [14, 0] },
        { duration: 0.4, delay: first ? 0.16 : 0.06, ease: [0.2, 0.7, 0.2, 1] },
      );
    });
    // pins land the first time you see their frame up close
    const pin = k >= 0 && c.frames[k].querySelector(".pin");
    if (pin && !pin.dataset.seen) {
      pin.dataset.seen = "1";
      pin.classList.remove("ping");
      void pin.offsetWidth;
      pin.classList.add("ping");
    }
  }

  function resetCanvas(i) {
    const c = cv[i];
    c.at = -1;
    c.pan = 0;
    c.el.classList.remove("zoomed");
    for (const fr of c.frames) fr.classList.remove("on");
    c.cap.classList.remove("on");
    c.cap.style.opacity = 0;
    camTo(i, -1, true);
    panTo(i, 0, true);
  }

  cv.forEach((c, i) => {
    on(
      c.el,
      "wheel",
      (e) => {
        if (c.at >= 0 || !c.maxPan) return;
        e.preventDefault();
        const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
        panTo(i, c.pan - dy, Math.abs(dy) < 40);
      },
      { passive: false },
    );
    on(c.el, "click", (e) => {
      const view = e.target.closest(".view");
      if (view) {
        e.preventDefault();
        navigate(view.getAttribute("href"));
        return;
      }
      if (e.target.closest(".cap.on") || e.target.closest(".pin")) return;
      if (e.target.closest(".zoom")) return zoomTo(i, -1);
      const fr = e.target.closest(".frame");
      zoomTo(i, fr ? Number(fr.dataset.k) : -1);
    });
  });

  // ---------------- wire up ----------------
  // First load: the page assembles as the preloader clears (hero rises in, folders slide up
  // into the drawer). Coming back to / later, everything is simply already there.
  const intro =
    !reduce && document.documentElement.dataset.preloaderReady !== "true";
  layoutTabs();
  units.forEach((u, i) => {
    set(u, { y: intro ? col.offsetHeight + 40 : baseY() });
    showInsides(i, false);
  });
  zs();
  cv.forEach((_, i) => {
    layoutCanvas(i);
    resetCanvas(i);
  });

  const runIntro = () => {
    busy = true;
    const parts = [$("header"), ...root.querySelectorAll(".hero > *")];
    parts.forEach((el, k) => {
      animate(
        el,
        { opacity: [0, 1], y: [16, 0], filter: ["blur(6px)", "blur(0px)"] },
        { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.3 + k * 0.07 },
      );
    });
    $(".drawer").style.opacity = 1;
    const lands = units.map((u, i) =>
      animate(
        u,
        { y: baseY() },
        { ...spring(170, 25), delay: 0.52 + i * 0.06 },
      ),
    );
    Promise.all(lands.map((a) => a.finished)).then(() => {
      if (!alive) return;
      for (const el of parts) el.style.filter = "";
      busy = false;
      flush();
    });
  };
  if (intro) on(window, PRELOADER_READY_EVENT, runIntro, { once: true });

  tabs.forEach((t, i) => {
    on(t, "click", () => onTab(i));
    if (canHover) {
      on(t, "pointerenter", () => {
        cancel(hoverT);
        hoverT = later(() => liftOn(i), 40);
      });
      on(t, "pointerleave", () => {
        cancel(hoverT);
        liftOff(i);
      });
    }
  });
  units.forEach((u, i) => {
    on(u.querySelector(".x"), "click", (e) => {
      e.stopPropagation();
      if (open === i && !busy) closeF();
    });
  });
  on($(".hero"), "click", (e) => {
    if (open < 0 || e.target.closest("[data-open]")) return;
    if (busy) queued = open;
    else closeF();
  });
  for (const b of root.querySelectorAll("[data-open]")) {
    on(b, "click", (e) => {
      e.stopPropagation();
      onTab(Number(b.dataset.open));
    });
  }
  on(window, "keydown", (e) => {
    if (e.target.closest?.("input, textarea")) return;
    const c = open >= 0 && cv[open].el.offsetParent ? cv[open] : null;
    if (c && c.at >= 0 && !busy) {
      const n = c.frames.length;
      if (e.key === "Escape") return zoomTo(open, -1);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft")
        return zoomTo(open, (c.at + (e.key === "ArrowRight" ? 1 : n - 1)) % n);
    }
    if (
      c &&
      c.at < 0 &&
      !busy &&
      e.key === "Enter" &&
      !e.target.closest?.("button, a")
    )
      return zoomTo(open, 0);
    if (e.key === "Escape" && open >= 0) onTab(open);
    if (open >= 0 && (e.key === "ArrowRight" || e.key === "ArrowLeft"))
      onTab(
        (open + (e.key === "ArrowRight" ? 1 : folders.length - 1)) %
          folders.length,
      );
  });
  on(window, "resize", () => {
    if (busy) return;
    layoutTabs();
    units.forEach((u, i) => {
      set(u, { y: i === open ? 0 : baseY() });
    });
    cv.forEach((_, i) => {
      layoutCanvas(i);
    });
  });

  // ---------------- header ----------------
  const clock = $('[data-role="clock"]');
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
  });
  const hourFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    hourCycle: "h23",
  });
  // what Alexi's probably doing right now, by Manila time
  const quip = (h) =>
    h < 5
      ? "should be asleep"
      : h < 9
        ? "on matcha #1"
        : h < 12
          ? "deep in the code"
          : h < 14
            ? "lunch, probably"
            : h < 18
              ? "shipping"
              : h < 22
                ? "still shipping"
                : "should be asleep";
  const tick = () => {
    const now = new Date();
    const hour = Number(hourFmt.format(now));
    clock.innerHTML = `<span>${fmt.format(now)}</span><span class="loc">&nbsp;in Manila</span><span>&nbsp;·&nbsp;${quip(hour)}</span>`;
  };
  tick();
  const clockT = setInterval(tick, 15000);

  // toast: Figma's dark pill, for copies
  const toastEl = $(".toast");
  let toastT;
  const toast = () => {
    cancel(toastT);
    animate(
      toastEl,
      { opacity: 1, y: [12, 0], scale: [0.96, 1] },
      spring(380, 34),
    );
    toastT = later(
      () =>
        animate(
          toastEl,
          { opacity: 0, y: 6 },
          { duration: 0.18, ease: "easeIn" },
        ),
      2200,
    );
  };
  const copy = (btn, label, done) => () => {
    navigator.clipboard?.writeText(email).catch(() => {});
    toast();
    btn.textContent = done;
    cancel(btn._t);
    btn._t = later(() => {
      btn.textContent = label;
    }, 1600);
  };
  // ---------------- "Say hi": a dark contact screen that spreads out of the button ----------------
  const sayHi = $('[data-role="say-hi"]');
  const hello = $(".hello");
  const helloParts = [...hello.querySelectorAll(".hello-anim")];
  const helloMail = $('[data-role="hello-mail"]');
  const helloTime = $('[data-role="hello-time"]');
  let helloOpen = false;
  let helloAnim = null;
  hello.inert = true;
  const circle = (r, x, y) => `circle(${r}px at ${x}px ${y}px)`;
  const origin = () => {
    const r = sayHi.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    return {
      x,
      y,
      r0: r.height / 2,
      R: Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)),
    };
  };
  // The circle's center is pinned to the button; only the radius animates (a plain number,
  // written every frame), so it grows out of "Say hi" in every browser.
  let helloR = 0;
  const grow = (from, to, opts) => {
    const { x, y } = origin();
    helloAnim?.stop();
    hello.style.clipPath = circle(from, x, y);
    helloAnim = animate(from, to, {
      ...opts,
      onUpdate: (r) => {
        helloR = r;
        hello.style.clipPath = circle(r, x, y);
      },
    });
    return helloAnim;
  };
  const openHello = () => {
    if (helloOpen) return;
    helloOpen = true;
    const { r0, R } = origin();
    helloTime.textContent = `It’s ${fmt.format(new Date())} in Manila`;
    animate(
      sayHi,
      { scale: [1, 0.92, 1] },
      { duration: 0.32, ease: "easeOut" },
    );
    grow(r0, R, { duration: 0.85, ease: [0.22, 1, 0.36, 1] });
    hello.inert = false;
    hello.dataset.open = "true";
    startHello();
    for (const el of helloParts) el.style.opacity = 0;
    animate(
      helloParts,
      { opacity: [0, 1], y: [22, 0] },
      {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay: stagger(0.05, { startDelay: 0.22 }),
      },
    );
    later(
      () => hello.querySelector(".hello-x").focus({ preventScroll: true }),
      300,
    );
  };
  const closeHello = async () => {
    if (!helloOpen) return;
    helloOpen = false;
    stopHello();
    const { r0, R } = origin();
    animate(helloParts, { opacity: 0, y: 8 }, { duration: 0.18 });
    const anim = grow(helloR || R, r0, {
      duration: 0.6,
      ease: [0.55, 0, 0.45, 1],
      delay: 0.06,
    });
    hello.inert = true;
    sayHi.focus({ preventScroll: true });
    await anim.finished;
    if (alive && !helloOpen) hello.dataset.open = "false";
  };
  // ---- the contact screen is a multiplayer Figma file: you join, Alexi selects the
  // headline, then parks by the comment thread and reacts while you write ----
  const note = $('[data-role="hello-note"]');
  const noteText = note.querySelector("textarea");
  const sendBtn = note.querySelector('button[type="submit"]');
  const hAlexi = hello.querySelector(".hello-alexi");
  const hChat = hAlexi.querySelector(".chat");
  const hYou = hello.querySelector(".hello-you");
  const hJoined = hello.querySelector(".hello-joined");
  const hSel = hello.querySelector(".hello-sel");
  const hSelBox = hSel.querySelector("i");
  const hHandles = [...hSel.querySelectorAll("b")];
  const hChip = hSel.querySelector("em");
  let hRun = 0; // bumps on open/close so a running sequence knows to stop
  let hx = 0;
  let hy = 0;
  let typedOnce = false;
  const hPlace = (x, y) => {
    hAlexi.style.transform = `translate(${x}px, ${y}px)`;
  };
  const hMove = (tx, ty, duration = 0.7) => {
    const fx = hx;
    const fy = hy;
    hx = tx;
    hy = ty;
    return animate(0, 1, {
      duration,
      ease: [0.45, 0, 0.2, 1],
      onUpdate: (p) => hPlace(fx + (tx - fx) * p, fy + (ty - fy) * p),
    }).finished;
  };
  const hSay = (text, ms) => {
    hChat.textContent = text;
    hChat.classList.add("on");
    if (ms)
      later(() => {
        if (hChat.textContent === text) hChat.classList.remove("on");
      }, ms);
  };
  const resetSel = () => {
    hSelBox.style.clipPath = "inset(0 100% 100% 0)";
    hSelBox.style.backgroundColor = "";
    for (const b of hHandles) b.style.transform = "scale(0)";
    hChip.style.opacity = 0;
  };
  // drag a marquee over "Say hi.", the same way the preloader selects the signature
  const drawSel = async (run, withCursor) => {
    const r = hSel.getBoundingClientRect();
    const x0 = r.left;
    const y0 = r.top + r.height * 0.08;
    if (withCursor) {
      await hMove(x0, y0, 0.6);
      if (run !== hRun) return;
    }
    await animate(0, 1, {
      duration: 0.75,
      ease: [0.3, 0, 0.2, 1],
      onUpdate: (p) => {
        const left = 100 - 100 * p;
        hSelBox.style.clipPath = `inset(0 ${left}% ${left}% 0)`;
        if (withCursor) hPlace(x0 + r.width * p, y0 + r.height * 0.9 * p);
      },
    }).finished;
    if (run !== hRun) return;
    if (withCursor) {
      hx = x0 + r.width;
      hy = y0 + r.height * 0.9;
    }
    animate(
      hSelBox,
      { backgroundColor: "rgba(13, 153, 255, 0)" },
      { duration: 0.4 },
    );
    animate(
      hHandles,
      { scale: [0, 1] },
      { duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: stagger(0.05) },
    );
    animate(
      hChip,
      { opacity: [0, 1], y: [-4, 0] },
      { duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
    );
  };
  const startHello = () => {
    const run = ++hRun;
    typedOnce = false;
    resetSel();
    hChat.classList.remove("on");
    animate(
      hJoined,
      { opacity: [0, 1], y: [-8, 0] },
      { duration: 0.4, delay: 0.55, ease: [0.22, 1, 0.36, 1] },
    );
    later(() => {
      if (run === hRun)
        animate(hJoined, { opacity: 0, y: -6 }, { duration: 0.35 });
    }, 3400);
    if (!finePointer) {
      later(() => run === hRun && drawSel(run, false), 650);
      return;
    }
    // Alexi comes out of the button you pressed
    const { x, y } = origin();
    hx = x;
    hy = y;
    hPlace(x, y);
    animate(hAlexi, { opacity: [0, 1] }, { duration: 0.3, delay: 0.35 });
    later(async () => {
      if (run !== hRun) return;
      await drawSel(run, true);
      if (run !== hRun) return;
      await new Promise((r) => later(r, 450));
      if (run !== hRun) return;
      const t = note.getBoundingClientRect();
      await hMove(t.right + 4, t.top + 14, 0.8);
      if (run !== hRun) return;
      hSay("reply right here, I’ll see it");
    }, 600);
  };
  const stopHello = () => {
    hRun++;
    animate([hAlexi, hYou, hJoined], { opacity: 0 }, { duration: 0.15 });
    hChat.classList.remove("on");
  };
  // your own name tag follows your pointer while you're in the file
  if (finePointer)
    on(hello, "pointermove", (e) => {
      hYou.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 18}px)`;
      if (helloOpen && hYou.style.opacity !== "1") hYou.style.opacity = 1;
    });
  on(
    noteText,
    "focus",
    () => helloOpen && finePointer && hSay("ooh, tell me more"),
  );
  on(noteText, "input", () => {
    sendBtn.disabled = !noteText.value.trim();
    if (!finePointer) return;
    const n = noteText.value.length;
    if (n > 0 && !typedOnce) {
      typedOnce = true;
      hSay("I’m listening");
    } else if (n > 140 && hChat.textContent !== "keep going, this is good")
      hSay("keep going, this is good");
  });
  // Enter sends (Shift+Enter for a new line), like a Figma comment
  on(noteText, "keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      note.requestSubmit();
    }
  });
  on(note, "submit", (e) => {
    e.preventDefault();
    const body = noteText.value.trim();
    if (!body) {
      noteText.focus();
      animate(
        note,
        { x: [0, -6, 6, -3, 0] },
        { duration: 0.32, ease: "easeOut" },
      );
      return;
    }
    if (finePointer) hSay("off to your mail app", 2400);
    window.location.href = `mailto:${email}?subject=${encodeURIComponent("Hi from alexi.life")}&body=${encodeURIComponent(body)}`;
  });
  on(sayHi, "click", openHello);
  on(hello.querySelector(".hello-x"), "click", closeHello);
  on(helloMail, "click", () => {
    navigator.clipboard?.writeText(email).catch(() => {});
    toast();
    const tag = helloMail.querySelector("em");
    tag.textContent = "Copied ✓";
    later(() => {
      tag.textContent = "Copy";
    }, 1600);
  });
  on(
    window,
    "keydown",
    (e) => {
      if (!helloOpen) return;
      if (e.key === "Escape") closeHello();
      e.stopImmediatePropagation();
    },
    { capture: true },
  );
  const mail = $('[data-role="mail"]');
  on(mail, "click", (e) => {
    e.stopPropagation();
    copy(mail, email, "copied ✓")();
  });

  // ---------------- cursor chat: press / and type, like Figma; Enter opens an email ----------------
  $(".you").inert = true;
  if (finePointer) {
    const you = $(".you");
    const inp = you.querySelector("input");
    const sz = you.querySelector(".sz");
    let mx = innerWidth / 2;
    let my = innerHeight / 2;
    let chatting = false;
    on(window, "pointermove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (chatting) set(you, { x: mx, y: my });
    });
    const fit = () => {
      sz.textContent = inp.value || inp.placeholder;
      you.style.setProperty("--w", `${Math.ceil(sz.offsetWidth) + 2}px`);
    };
    const openChat = () => {
      chatting = true;
      you.inert = false;
      inp.value = "";
      fit();
      set(you, { x: mx, y: my });
      animate(you, { opacity: 1, scale: [0.85, 1] }, spring(420, 32));
      later(() => inp.focus(), 0);
    };
    const closeChat = () => {
      chatting = false;
      inp.blur();
      you.inert = true;
      animate(you, { opacity: 0, scale: 0.9 }, { duration: 0.14 });
    };
    on(inp, "input", fit);
    on(inp, "keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Escape") closeChat();
      if (e.key === "Enter" && inp.value.trim()) {
        window.location.href = `mailto:${email}?subject=${encodeURIComponent("Hi from alexi.life")}&body=${encodeURIComponent(inp.value.trim())}`;
        closeChat();
      }
    });
    on(inp, "blur", () => {
      if (chatting)
        later(
          () => chatting && document.activeElement !== inp && closeChat(),
          120,
        );
    });
    on(window, "keydown", (e) => {
      if (e.key !== "/" || chatting || e.metaKey || e.ctrlKey) return;
      if (e.target.closest?.("input, textarea, [contenteditable]")) return;
      e.preventDefault();
      openChat();
    });
  }

  // ---------------- Alexi's cursor: wanders the hero, and guides you the first time ----------------
  if (!reduce && canHover) {
    const mp = $(".mp");
    const chat = mp.querySelector(".chat");
    let x = innerWidth * 0.72;
    let y = 260;
    let travel = null;
    let wake = null;
    let stepT = null;
    let stepping = false;
    let noticedAt = 0;
    const queue = [];
    const seen = new Set(
      (() => {
        try {
          return JSON.parse(sessionStorage.getItem("alx-hints") || "[]");
        } catch {
          return [];
        }
      })(),
    );
    set(mp, { x, y });
    const say = (text, ms = 2200) => {
      chat.textContent = text;
      chat.classList.add("on");
      later(() => chat.classList.remove("on"), ms);
    };
    const visible = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width && r.bottom > 40 && r.top < innerHeight - 10;
    };
    // a hint is shown once per visit; it jumps the queue and wakes the cursor up
    hint = (key, target, line) => {
      if (seen.has(key)) return;
      seen.add(key);
      try {
        sessionStorage.setItem("alx-hints", JSON.stringify([...seen]));
      } catch {}
      queue.push({ target, line });
      if (!stepping) {
        cancel(stepT);
        stepT = later(step, 350);
      }
    };
    const travelTo = async (tx, ty) => {
      travel = motionAnimate(
        mp,
        {
          x: [x, (x + tx) / 2 + (Math.random() - 0.5) * 120, tx],
          y: [y, (y + ty) / 2 + (Math.random() - 0.5) * 80, ty],
        },
        {
          duration: Math.min(1.5, 0.55 + Math.hypot(tx - x, ty - y) / 1100),
          ease: [0.45, 0, 0.25, 1],
        },
      );
      // a hello can interrupt the trip; don't rely on a stopped animation's promise
      await Promise.race([
        travel.finished,
        new Promise((resolve) => {
          wake = resolve;
        }),
      ]);
      wake = null;
      if (performance.now() - noticedAt < 3000) return false;
      x = tx;
      y = ty;
      return true;
    };
    // bump into Alexi's cursor and it turns to you, says hi, and steps aside
    on(window, "pointermove", (e) => {
      if (open >= 0 || performance.now() - noticedAt < 7000) return;
      const r = mp.getBoundingClientRect();
      const dx = r.left - e.clientX;
      const dy = r.top - e.clientY;
      const d = Math.hypot(dx, dy);
      if (d > 70 || d < 1) return;
      noticedAt = performance.now();
      travel?.stop();
      wake?.();
      x = r.left + (dx / d) * 46;
      y = r.top + (dy / d) * 30;
      travel = animate(mp, { x, y }, spring(260, 24));
      animate(
        mp,
        { rotate: [0, -14, 0] },
        { duration: 0.45, ease: "easeInOut" },
      );
      say(
        ["oh hi", "hey!", "you found me", "hi :)"][
          Math.floor(Math.random() * 4)
        ],
      );
    });
    const step = async () => {
      stepT = null;
      stepping = true;
      await guideOrWander();
      stepping = false;
    };
    const guideOrWander = async () => {
      // guide first: point at the thing and say what it does
      while (queue.length) {
        const { target, line } = queue.shift();
        const el = target();
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        const arrived = await travelTo(
          r.left + Math.min(r.width * 0.6, 60),
          r.top + r.height * 0.55,
        );
        if (!alive) return;
        if (arrived) say(line, 2800);
        stepT = later(step, 3000);
        return;
      }
      if (open < 0) {
        const els = [...root.querySelectorAll("[data-cur]")].filter(visible);
        if (els.length) {
          const el = els[Math.floor(Math.random() * els.length)];
          const r = el.getBoundingClientRect();
          const arrived = await travelTo(
            r.left + r.width * (0.35 + Math.random() * 0.3),
            r.top + r.height * 0.6,
          );
          if (!alive) return;
          if (arrived && el.dataset.cur && Math.random() < 0.55)
            say(el.dataset.cur, 2500);
        }
      }
      stepT = later(step, 2600 + Math.random() * 1800);
    };
    // the first-visit tour, once the page has settled
    const tour = () => {
      // a folder may already be open (deep link): then these point at things that aren't there
      hint("tabs", () => (open < 0 ? tabs[1] : null), "open a folder");
      hint(
        "casper",
        () => (open < 0 ? root.querySelector(".hero .pill") : null),
        "where I’m building now",
      );
      if (finePointer)
        hint("chat", () => root.querySelector(".links .kb"), "or just say hi");
    };
    // First load: pick up exactly where the preloader's cursor stands, so it reads as
    // the same cursor, and only start wandering once the page has assembled.
    const begin = () => {
      const handoff = window.__alxCursorHandoff;
      window.__alxCursorHandoff = undefined;
      if (handoff) {
        x = handoff.x;
        y = handoff.y;
        set(mp, { x, y });
      }
      later(tour, 1800);
      stepT = later(step, 2400);
    };
    if (intro) on(window, PRELOADER_READY_EVENT, begin, { once: true });
    else begin();
  }

  // double-click the canvas: drop a comment pin from Alexi that floats away
  on(root, "dblclick", (e) => {
    if (open >= 0 || e.target.closest("button, a, input, .unit, header"))
      return;
    window.getSelection()?.removeAllRanges();
    const pin = document.createElement("span");
    pin.className = "stamp";
    pin.innerHTML = '<img src="/avatar.webp" alt=""><em>hi from Manila</em>';
    pin.style.left = `${e.clientX}px`;
    pin.style.top = `${e.clientY}px`;
    root.appendChild(pin);
    animate(pin, { scale: [0, 1], opacity: [0, 1] }, spring(420, 26));
    later(async () => {
      await animate(
        pin,
        { y: -28, opacity: 0 },
        { duration: 0.5, ease: "easeIn" },
      ).finished;
      pin.remove();
    }, 1700);
  });

  // deep links from other pages: /?folder=built opens that folder, /?hi=1 opens Say hi
  const params = new URLSearchParams(window.location.search);
  const wantFolder = folders.findIndex(
    (f) => f.name.toLowerCase() === params.get("folder"),
  );
  // tidy the URL once this mount is really live (a dev-mode remount would otherwise
  // lose the request before the real mount sees it)
  if (params.has("folder") || params.has("hi"))
    later(
      () => window.history.replaceState(null, "", window.location.pathname),
      0,
    );
  if (wantFolder >= 0) {
    if (intro)
      queued = wantFolder; // opens as soon as the entrance finishes
    else later(() => onTab(wantFolder), 120);
  }
  if (params.get("hi")) later(openHello, intro ? 2600 : 250);

  // decode folder images while idle so the first open never stutters
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  idle(() => {
    if (!alive) return;
    for (const img of root.querySelectorAll(".frame img"))
      img.decode?.().catch(() => {});
  });

  return () => {
    alive = false;
    ac.abort();
    clearInterval(clockT);
    for (const t of timers) clearTimeout(t);
    timers.clear();
  };
}
