// Everything that moves on the home page. React renders the markup once; this wires the
// folders, the canvas zoom and the small Figma touches to it and returns a cleanup.
//
// Motion rules we tuned by measuring frames: springs with a damping ratio around 0.9 to 1
// (no overshoot), restDelta/restSpeed high enough that nothing crawls the last pixel, start
// transforms set before anything becomes visible, and stacking never changes mid-flight.
import { animate as motionAnimate } from "motion";

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
    set($b(i, ".print"), { y: 70, rotate: 2 });
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
      { y: show ? (lift ? -10 : 0) : 70, rotate: show ? (lift ? 1.5 : 4) : 2 },
      show ? spring(280, 29) : spring(320, 34),
    );
  };
  const tuck = (i) => {
    animate($b(i, ".papers"), { y: 18 }, TUCK);
    animate($b(i, ".print"), { y: 70, rotate: 2 }, TUCK);
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

  function layoutCanvas(i) {
    const c = cv[i];
    const W = c.el.clientWidth;
    const H = c.el.clientHeight;
    const n = c.frames.length;
    if (!W || !H || !n) return;
    const P = Math.max(28, W * 0.045);
    const PV = 30;
    const G = Math.max(24, W * 0.035);
    const GV = 54;
    const L = 28;
    let best = null;
    for (let cols = 1; cols <= n; cols++) {
      const rows = Math.ceil(n / cols);
      const w = Math.min(
        (W - 2 * P - (cols - 1) * G) / cols,
        ((H - 2 * PV - (rows - 1) * GV) / rows - L) * 1.6,
      );
      if (!best || w > best.w) best = { cols, rows, w };
    }
    const { cols, rows, w } = best;
    const h = w / 1.6;
    const top0 = (H - (rows * (h + L) + (rows - 1) * GV)) / 2 + L;
    c.frames.forEach((fr, k) => {
      const r = Math.floor(k / cols);
      const inRow = r === rows - 1 ? n - r * cols : cols;
      const left0 = (W - (inRow * w + (inRow - 1) * G)) / 2;
      const x = left0 + (k % cols) * (w + G);
      const y = top0 + r * (h + L + GV);
      Object.assign(fr.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
      });
      fr.querySelector(".dim").textContent =
        `${Math.round(w)} × ${Math.round(h)}`;
      c.rects[k] = { x, y, w, h };
    });
    if (c.at >= 0) camTo(i, c.at, true);
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
    let y = 0;
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
    c.el.classList.remove("zoomed");
    for (const fr of c.frames) fr.classList.remove("on");
    c.cap.classList.remove("on");
    c.cap.style.opacity = 0;
    camTo(i, -1, true);
  }

  cv.forEach((c, i) => {
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
  layoutTabs();
  units.forEach((u, i) => {
    set(u, { y: baseY() });
    showInsides(i, false);
  });
  zs();
  cv.forEach((_, i) => {
    layoutCanvas(i);
    resetCanvas(i);
  });

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
  const tick = () => {
    clock.textContent = `MANILA · ${fmt.format(new Date()).toUpperCase()}`;
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
  const copyTop = $('[data-role="copy-top"]');
  on(copyTop, "click", copy(copyTop, "Copy email", "Copied ✓"));
  const mail = $('[data-role="mail"]');
  on(mail, "click", (e) => {
    e.stopPropagation();
    copy(mail, email, "copied ✓")();
  });

  // ---------------- hover selection: thin blue box + size chip, glides between neighbours ----------------
  if (finePointer) {
    const hs = $(".hsel");
    const chip = hs.querySelector("span");
    let shown = false;
    let hideT;
    const targets =
      ".hero .pill, .hero .photo, .links a, .links .mail, header .hr a, header .hr button, header .me";
    on(document, "pointerover", (e) => {
      const el = e.target.closest?.(targets);
      if (!el || !root.contains(el) || open >= 0) return;
      cancel(hideT);
      const r = el.getBoundingClientRect();
      const p = 3;
      chip.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
      const box = {
        x: r.left - p,
        y: r.top - p,
        width: r.width + 2 * p,
        height: r.height + 2 * p,
      };
      if (!shown) {
        set(hs, box);
        animate(hs, { opacity: 1 }, { duration: 0.12 });
        shown = true;
      } else animate(hs, { ...box, opacity: 1 }, spring(520, 44));
    });
    on(document, "pointerout", (e) => {
      if (!e.target.closest?.(targets)) return;
      cancel(hideT);
      hideT = later(() => {
        shown = false;
        animate(hs, { opacity: 0 }, { duration: 0.15 });
      }, 90);
    });
  }

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

  // ---------------- Alexi's cursor wanders the hero (paused while a folder is open) ----------------
  if (!reduce && canHover) {
    const mp = $(".mp");
    const chat = mp.querySelector(".chat");
    let x = innerWidth * 0.72;
    let y = 260;
    set(mp, { x, y });
    const step = async () => {
      const els = [...root.querySelectorAll("[data-cur]")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width && r.bottom > 60 && r.top < innerHeight - 20;
      });
      if (els.length && open < 0) {
        const el = els[Math.floor(Math.random() * els.length)];
        const r = el.getBoundingClientRect();
        const tx = r.left + r.width * (0.35 + Math.random() * 0.3);
        const ty = r.top + r.height * 0.6;
        await motionAnimate(
          mp,
          {
            x: [x, (x + tx) / 2 + (Math.random() - 0.5) * 120, tx],
            y: [y, (y + ty) / 2 + (Math.random() - 0.5) * 80, ty],
          },
          {
            duration: Math.min(1.6, 0.6 + Math.hypot(tx - x, ty - y) / 1000),
            ease: [0.45, 0, 0.25, 1],
          },
        ).finished;
        if (!alive) return;
        x = tx;
        y = ty;
        if (el.dataset.cur && Math.random() < 0.55) {
          chat.textContent = el.dataset.cur;
          chat.classList.add("on");
          later(() => chat.classList.remove("on"), 2500);
        }
      }
      later(step, 2600 + Math.random() * 1800);
    };
    later(step, 1200);
  }

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
