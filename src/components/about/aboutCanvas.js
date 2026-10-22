import { animate } from "motion";
import {
  getPreloaderReady,
  PRELOADER_READY_EVENT,
} from "../../hooks/usePreloaderReady";
import { softEnter } from "../../lib/canvas-nav";
import { pathSegments, SECTIONS, TOUR, WORLD } from "./content";

// The about page is a Figma file you can walk around in. Drag to pan (with momentum), pinch or
// ⌘/ctrl-scroll to zoom. Chapters start empty; Alexi's cursor builds them the way you'd build a
// page in Figma: drag out the section, draw each frame, let the image fill in, type the words,
// drop the comments. Pick things up, rotate them, delete them, undo. Leave your own comments.
// The tour never takes the canvas away from you: touch anything and it pauses.

const ZMIN = 0.12;
const ZMAX = 2.6;
const TOP = 84; // the header
const BOTTOM = 96; // the toolbar
const AUTO = 5200; // ms to linger on a finished chapter before moving on
const HAND_DRAWN = 3; // frames Alexi draws by hand per chapter; the rest get pasted
const clampZ = (z) => Math.min(ZMAX, Math.max(ZMIN, z));
const COMMENTS_KEY = "alx-about-comments";
const BUILT_KEY = "alx-about-built"; // what's been built this visit

const HELLOS = ["hii", "hey!", "oh hi", "hi :)", "busy, one sec"];
const CONFETTI = ["#5470ff", "#ffd34d", "#ff4f8b", "#9ee0b5", "#0d99ff"];
const TOOL = {
  frame: "F",
  text: "T",
  paste: "⌘V",
  comment: "C",
  section: "⇧S",
};

export function mountAbout(root) {
  if (!root) return undefined;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fromHome = softEnter(); // came from home: no empty pause, start building
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
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
  const wait = (ms) => new Promise((r) => later(r, reduce ? 0 : ms));
  const on = (target, type, fn, opts = {}) =>
    target.addEventListener(type, fn, { ...opts, signal });
  const $ = (q) => root.querySelector(q);

  const vp = $(".ac-vp");
  const world = $(".ac-world");
  const bar = $(".ac-bar");
  const zoomEl = $(".ac-zoom");
  const miniVp = $(".ac-mini-vp");
  const fx = $(".ac-fx");
  const you = $(".ac-you");
  const hintEl = $(".ac-hint");
  const alexi = $(".ac-alexi");
  const chat = alexi.querySelector(".chat");
  const toolBadge = alexi.querySelector(".tool");
  const chapName = $(".ac-chap b");
  const chapNum = $(".ac-chap small");
  const chapDot = $(".ac-chap > i");
  const prog = $(".ac-prog i");
  const layerList = $(".ac-layer-list");
  // a fresh start each mount (dev mounts twice): no rows or layer links left from the last one
  layerList.replaceChildren();
  for (const el of root.querySelectorAll("[data-b]")) delete el._layer;
  const props = $(".ac-props");
  const cmts = $(".ac-cmts");
  const SEC = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));
  const CH = TOUR.map((id) => SEC[id]);
  const secEl = (id) => root.querySelector(`[data-sec="${id}"]`);

  // ---------------- the phone layout ----------------
  // A desktop-sized canvas is unreadable on a phone, so there the same file gets its mobile
  // frames: every chapter becomes a phone-width section (words on top, photos two to a row),
  // stacked down a gently winding path. CSS does the reflow (.is-phone); this measures it and
  // moves the sections, the path and the world to match.
  const PHONE_W = 400;
  const ORIG = SECTIONS.map((s) => ({
    x: s.x,
    y: s.y,
    w: s.w,
    h: s.h,
    rot: s.rot || 0,
  }));
  const ORIG_WORLD = { ...WORLD };
  let phoneMode = null;
  function layoutFor(isPhone) {
    if (isPhone === phoneMode) return false;
    phoneMode = isPhone;
    root.classList.toggle("is-phone", isPhone);
    let y = 0;
    SECTIONS.forEach((s, k) => {
      const el = secEl(s.id);
      if (isPhone) {
        s.rot = 0;
        s.w = PHONE_W;
        s.x = 0;
        s.y = y;
        el.style.width = `${s.w}px`;
        el.style.height = "auto";
        el.style.left = `${s.x}px`;
        el.style.top = `${s.y}px`;
        s.h = el.offsetHeight;
        el.style.height = `${s.h}px`;
        y += s.h + 150;
      } else {
        Object.assign(s, ORIG[k]);
        Object.assign(el.style, {
          left: `${s.x}px`,
          top: `${s.y}px`,
          width: `${s.w}px`,
          height: `${s.h}px`,
        });
      }
    });
    if (isPhone) {
      WORLD.w = PHONE_W;
      WORLD.h = y;
    } else Object.assign(WORLD, ORIG_WORLD);
    world.style.width = `${WORLD.w}px`;
    world.style.height = `${WORLD.h}px`;
    // the path between the chapters follows them
    const svg = world.querySelector(".ac-path");
    svg.setAttribute("width", WORLD.w);
    svg.setAttribute("height", WORLD.h);
    svg.setAttribute("viewBox", `0 0 ${WORLD.w} ${WORLD.h}`);
    const segs = pathSegments(isPhone);
    for (const cls of [".base", ".seg"])
      svg.querySelectorAll(cls).forEach((path, k) => {
        path.setAttribute("d", segs[k]);
      });
    return true;
  }
  layoutFor(vp.clientWidth < 700);

  // ---------------- the camera ----------------
  const cam = { x: 0, y: 0, z: 1 };
  const watchers = [];
  const size = () => ({ W: vp.clientWidth, H: vp.clientHeight });

  function clampCam(c) {
    const { W, H } = size();
    const m = 260;
    const cx = Math.min(WORLD.w + m, Math.max(-m, (W / 2 - c.x) / c.z));
    const cy = Math.min(WORLD.h + m, Math.max(-m, (H / 2 - c.y) / c.z));
    c.x = W / 2 - cx * c.z;
    c.y = H / 2 - cy * c.z;
    // a phone reads like one column: centered, and it only slides sideways when zoomed in
    if (phoneMode) {
      const ww = WORLD.w * c.z;
      c.x =
        ww <= W - 24 ? (W - ww) / 2 : Math.min(12, Math.max(W - 12 - ww, c.x));
    }
    return c;
  }

  // Alexi's chat bubble hangs off his cursor's right, sliding back in when it'd run off screen
  let chatW = 0;
  let chatShift = 0;
  function fitChat() {
    const from = cam.x + ax.x * cam.z + 14;
    const shift = Math.round(
      Math.max(10 - from, Math.min(0, innerWidth - 10 - chatW - from)),
    );
    if (shift === chatShift) return;
    chatShift = shift;
    chat.style.transform = shift ? `translateX(${shift}px)` : "";
  }
  // --z (the zoom, for things that keep a constant on-screen size) is read by a lot of the
  // canvas, so rewriting it while the camera moves restyles and repaints all of it every
  // frame. While moving, only the few things that must stay readable get it (on themselves);
  // the rest catch up once the camera settles. Alexi's cursor is scaled directly.
  let zSet = 0;
  let camMoving = false;
  let zSettleT = null;
  let live = null;
  let liveZ = 0;
  const writeZ = (force) => {
    if (!force) {
      if (cam.z === liveZ) return;
      liveZ = cam.z;
      // same sizes as the CSS gives them; ghosts only while their section is still empty
      live ??= [
        ...[...world.querySelectorAll(".ac-label")].map((el) => [el, 0.4]),
        ...[...world.querySelectorAll('[data-state="ghost"] .ac-ghost')].map(
          (el) => [el, 0.55],
        ),
        ...[...world.querySelectorAll(".ac-cmt")].map((el) => [el, 0]),
      ];
      for (const [el, k] of live)
        el.style.scale = k ? Math.max(1, k / cam.z) : 1 / cam.z;
      return;
    }
    const lz = Math.log(cam.z);
    if (lz !== zSet) {
      zSet = lz;
      world.style.setProperty("--z", cam.z);
      // the big path drawing reads --zs, which only changes once the camera settles
      world.style.setProperty("--zs", cam.z);
    }
    if (live) for (const [el] of live) el.style.scale = "";
    live = null;
    liveZ = 0;
  };
  // The dot grid is its own GPU layer: panning and zooming only move and scale it. It's only
  // repainted when the zoom drifts far enough that the dots would look off (and it thins out
  // when you zoom far out, like Figma).
  const dots = $(".ac-dots");
  let dotBase = 0;
  let zoomShown = "";
  function placeDots() {
    const g = 22 * cam.z * (cam.z < 0.45 ? 2 : 1);
    if (!dotBase || g / dotBase > 1.5 || g / dotBase < 0.67) {
      dotBase = g;
      dots.style.backgroundSize = `${g}px ${g}px`;
    }
    const ox = (((cam.x % g) + g) % g) - g;
    const oy = (((cam.y % g) + g) % g) - g;
    dots.style.transform = `translate3d(${ox}px, ${oy}px, 0) scale(${g / dotBase})`;
  }
  function apply() {
    world.style.transform = `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.z})`;
    alexi.style.scale = String(1 / cam.z);
    if (chatW) fitChat();
    writeZ(!camMoving);
    if (camMoving) {
      cancel(zSettleT);
      zSettleT = later(() => {
        camMoving = false;
        writeZ(true);
      }, 140);
    }
    placeDots();
    const zt = `${Math.round(cam.z * 100)}%`;
    if (zt !== zoomShown) {
      zoomShown = zt;
      zoomEl.textContent = zt;
    }
    const { W, H } = size();
    const ms = 150 / WORLD.w;
    Object.assign(miniVp.style, {
      left: `${(-cam.x / cam.z) * ms}px`,
      top: `${(-cam.y / cam.z) * ms}px`,
      width: `${(W / cam.z) * ms}px`,
      height: `${(H / cam.z) * ms}px`,
    });
    for (const w of watchers) w();
  }

  // the room the canvas has to show things in: between the header and the toolbar, and beside
  // the side panels when they're showing
  const room = () => {
    const { W, H } = size();
    const wide = W >= 1100;
    const left = wide ? 252 : 0;
    const right = wide && props.dataset.open === "true" ? 252 : 0;
    return { W, H, left, right };
  };
  function frameFor(r, pad = 56) {
    const { W, H, left, right } = room();
    const p = W < 700 ? 14 : pad;
    const aw = W - left - right - 2 * p;
    const ah = H - TOP - BOTTOM - p;
    const z = clampZ(Math.min(aw / r.w, ah / r.h));
    return {
      z,
      x: left + (W - left - right) / 2 - (r.x + r.w / 2) * z,
      y: TOP + (H - TOP - BOTTOM) / 2 - (r.y + r.h / 2) * z,
    };
  }

  // a camera flight: glides in log-zoom and pulls back a little on long jumps, so you see
  // where you're going (the way Figma's zoom-to-selection feels)
  let flight = null;
  let lastFlight = 0;
  let inertia = 0;
  function stopAll() {
    flight?.stop();
    flight = null;
    cancelAnimationFrame(inertia);
    inertia = 0;
  }
  function fly(to, duration, ease) {
    stopAll();
    if (reduce) {
      Object.assign(cam, to);
      apply();
      return Promise.resolve();
    }
    const { W, H } = size();
    const from = { ...cam };
    const c0 = { x: (W / 2 - from.x) / from.z, y: (H / 2 - from.y) / from.z };
    const c1 = { x: (W / 2 - to.x) / to.z, y: (H / 2 - to.y) / to.z };
    const dist = Math.hypot(c1.x - c0.x, c1.y - c0.y);
    const span = Math.max(W / from.z, W / to.z);
    // (a phone reads like a page: no pulling back, just a glide)
    const bump = phoneMode ? 0 : Math.min(0.45, (dist / span) * 0.35);
    const lz0 = Math.log(from.z);
    const lz1 = Math.log(to.z);
    camMoving = true;
    lastFlight = duration ?? Math.min(1.6, 0.85 + dist / 5200);
    const f = animate(0, 1, {
      duration: lastFlight,
      ease: ease ?? (phoneMode ? [0.3, 0, 0.15, 1] : [0.5, 0, 0.2, 1]),
      onUpdate: (p) => {
        const z =
          Math.exp(lz0 + (lz1 - lz0) * p) * (1 - bump * Math.sin(Math.PI * p));
        cam.z = z;
        cam.x = W / 2 - (c0.x + (c1.x - c0.x) * p) * z;
        cam.y = H / 2 - (c0.y + (c1.y - c0.y) * p) * z;
        apply();
      },
    });
    flight = f;
    return f.finished;
  }
  function zoomAt(sx, sy, factor) {
    camMoving = true;
    const z = clampZ(cam.z * factor);
    cam.x = sx - (sx - cam.x) * (z / cam.z);
    cam.y = sy - (sy - cam.y) * (z / cam.z);
    cam.z = z;
    clampCam(cam);
    apply();
  }
  function zoomBy(factor) {
    const { W, H } = size();
    const z = clampZ(cam.z * factor);
    fly(
      {
        z,
        x: W / 2 - (W / 2 - cam.x) * (z / cam.z),
        y: H / 2 - (H / 2 - cam.y) * (z / cam.z),
      },
      0.45,
    );
  }
  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    const v = vp.getBoundingClientRect();
    return {
      x: (r.left - v.left - cam.x) / cam.z,
      y: (r.top - v.top - cam.y) / cam.z,
      w: r.width / cam.z,
      h: r.height / cam.z,
    };
  };
  // an element's box inside its section (the section may be rotated; this is pre-rotation)
  const localRect = (el, sec) => {
    let x = 0;
    let y = 0;
    let n = el;
    while (n && n !== sec) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  };
  // On a phone the canvas reads like a page: one zoom (the column's width), and the camera
  // only ever glides up and down. readView(y) puts world-y at the top of the reading area.
  const readZ = () => clampZ((size().W - 28) / PHONE_W);
  const readView = (y) => {
    const z = readZ();
    return clampCam({ z, x: 0, y: TOP + 8 - y * z });
  };
  // a chapter on screen: the whole thing on a desktop; on a phone its width, from the top
  const chapterView = (s) => {
    if (!phoneMode) return frameFor(s, 48);
    return readView(s.y - 64);
  };
  // "Fit": everything on a desktop; on a phone, the chapter you're in (everything is a blur)
  const fitAll = () =>
    phoneMode
      ? fly(chapterView(CH[mostVisible()]))
      : fly(frameFor({ x: 0, y: 0, w: WORLD.w, h: WORLD.h }, 40));
  const goSection = (id) => fly(chapterView(SEC[id]));
  const flyToEl = (el) => {
    const r = rectOf(el);
    return fly(
      frameFor({ x: r.x - 40, y: r.y - 50, w: r.w + 80, h: r.h + 100 }),
    );
  };

  // ---------------- tools ----------------
  let tool = "move";
  function setTool(t) {
    tool = t;
    root.dataset.using = t;
    for (const b of root.querySelectorAll("button[data-tool]"))
      b.classList.toggle("on", b.dataset.tool === t);
    if (t !== "move") select(null);
  }
  setTool("move");

  // ---------------- input: pan, pinch, wheel ----------------
  let spaceDown = false;
  let kb = false;
  let touched = false;
  // anything you do pauses the tour (never stops it): the canvas is always yours
  function userTouched() {
    if (!touched) {
      touched = true;
      hintEl.classList.add("gone");
    }
    if (tour >= 0 && autoOn) pauseAuto();
  }

  const pointers = new Map();
  let panning = false;
  let last = null;
  let lastT = 0;
  let vel = { x: 0, y: 0 };
  let pinch = null;
  const pinchOf = () => {
    const [a, b] = [...pointers.values()];
    return {
      d: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      mx: (a.x + b.x) / 2,
      my: (a.y + b.y) / 2,
    };
  };
  const handMode = () => spaceDown || tool === "hand";
  let tap = null; // where a press started, to tell a click from a drag

  on(vp, "pointerdown", (e) => {
    kb = false;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    userTouched();
    if (
      tool === "comment" &&
      !e.target.closest(".ac-label, .ac-ghost, .ac-cmt")
    ) {
      e.preventDefault();
      placeComment(e);
      return;
    }
    // dragging anywhere looks around, photos included; a photo you've selected moves instead
    if (
      !handMode() &&
      e.target.closest(
        "button, a, input, label, [data-nopan], [data-drag].is-sel, .ac-cmt",
      )
    )
      return;
    tap = {
      x: e.clientX,
      y: e.clientY,
      fr: handMode() ? null : e.target.closest("[data-drag]"),
    };
    if (!handMode() && !e.target.closest("[data-b]")) select(null);
    stopAll();
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    vp.setPointerCapture?.(e.pointerId);
    if (pointers.size === 2) {
      panning = false;
      pinch = pinchOf();
    } else {
      panning = true;
      last = { x: e.clientX, y: e.clientY };
      lastT = performance.now();
      vel = { x: 0, y: 0 };
      root.classList.add("grabbing");
    }
  });
  on(vp, "pointermove", (e) => {
    moveYou(e);
    noticeAlexi(e);
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size >= 2 && pinch) {
      const now = pinchOf();
      const v = vp.getBoundingClientRect();
      zoomAt(now.mx - v.left, now.my - v.top, now.d / pinch.d);
      cam.x += now.mx - pinch.mx;
      cam.y += now.my - pinch.my;
      clampCam(cam);
      apply();
      pinch = now;
      return;
    }
    if (!panning) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    vel = { x: (dx / dt) * 16, y: (dy / dt) * 16 };
    lastT = now;
    last = { x: e.clientX, y: e.clientY };
    cam.x += dx;
    cam.y += dy;
    clampCam(cam);
    apply();
  });
  const endPointer = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 1) {
      const [p] = [...pointers.values()];
      last = { ...p };
      lastT = performance.now();
      panning = true;
      return;
    }
    if (pointers.size === 0) {
      // barely moved: that was a click on a photo, so select it
      if (tap?.fr && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 5) {
        const fr = tap.fr;
        select(fr);
        if (fr.hasAttribute("data-confetti")) {
          burst(e.clientX, e.clientY);
          fr.classList.remove("popped");
          void fr.offsetWidth;
          fr.classList.add("popped");
        }
      }
      tap = null;
      root.classList.remove("grabbing");
      if (panning && performance.now() - lastT < 80) glide();
      panning = false;
    }
  };
  on(vp, "pointerup", endPointer);
  on(vp, "pointercancel", endPointer);
  // let go mid-swipe and the canvas keeps drifting, then settles
  function glide() {
    if (reduce) return;
    const v = { ...vel };
    const step = () => {
      v.x *= 0.92;
      v.y *= 0.92;
      if (Math.hypot(v.x, v.y) < 0.35) {
        inertia = 0;
        return;
      }
      cam.x += v.x;
      cam.y += v.y;
      clampCam(cam);
      apply();
      inertia = requestAnimationFrame(step);
    };
    inertia = requestAnimationFrame(step);
  }
  let wheelAcc = null;
  function flushWheel() {
    const w = wheelAcc;
    wheelAcc = null;
    if (!w || !alive) return;
    if (w.zoom !== 1) zoomAt(w.sx, w.sy, w.zoom);
    if (w.dx || w.dy) {
      cam.x -= w.dx;
      cam.y -= w.dy;
      clampCam(cam);
      apply();
    }
  }
  on(
    vp,
    "wheel",
    (e) => {
      e.preventDefault();
      userTouched();
      stopAll();
      // trackpads send wheel events faster than the screen redraws: gather them and apply
      // them once per frame
      const v = vp.getBoundingClientRect();
      if (!wheelAcc) {
        wheelAcc = { zoom: 1, dx: 0, dy: 0, sx: 0, sy: 0 };
        requestAnimationFrame(flushWheel);
      }
      wheelAcc.sx = e.clientX - v.left;
      wheelAcc.sy = e.clientY - v.top;
      if (e.ctrlKey || e.metaKey) wheelAcc.zoom *= Math.exp(-e.deltaY * 0.01);
      else {
        const k = e.deltaMode === 1 ? 32 : 1;
        wheelAcc.dx += e.deltaX * k;
        wheelAcc.dy += e.deltaY * k;
      }
    },
    { passive: false },
  );

  // ---------------- selection, the Design panel, undo ----------------
  let sel = null;
  const selBox = document.createElement("div");
  selBox.className = "ac-sel";
  selBox.innerHTML =
    '<b></b><b></b><b></b><b></b><span class="ac-sel-name"></span><span class="ac-sel-dim"></span>';
  const pOut = (k) => props.querySelector(`[data-p="${k}"]`);
  const rotOf = (el) =>
    Number.parseFloat(el.style.getPropertyValue("--r")) || 0;
  function placeSel() {
    if (!sel) return;
    const sec = sel.closest("[data-sec]");
    if (selBox.parentNode !== sec) sec.appendChild(selBox);
    const r = localRect(sel, sec);
    Object.assign(selBox.style, {
      left: `${r.x}px`,
      top: `${r.y}px`,
      width: `${r.w}px`,
      height: `${r.h}px`,
    });
    selBox.style.setProperty("--r", `${rotOf(sel)}deg`);
    selBox.querySelector(".ac-sel-name").textContent = sel.dataset.name || "";
    selBox.querySelector(".ac-sel-dim").textContent =
      `${Math.round(r.w)} × ${Math.round(r.h)}`;
    pOut("x").textContent = Math.round(r.x);
    pOut("y").textContent = Math.round(r.y);
    pOut("w").textContent = Math.round(r.w);
    pOut("h").textContent = Math.round(r.h);
    const rin = pOut("r");
    if (document.activeElement !== rin) rin.value = Math.round(rotOf(sel));
    rin.disabled = !sel.matches(".ac-ph");
  }
  function select(el) {
    if (el === sel) return;
    sel?.classList.remove("is-sel");
    sel = el;
    for (const li of layerList.querySelectorAll(".on"))
      li.classList.remove("on");
    if (!el) {
      selBox.remove();
      props.dataset.open = "false";
      return;
    }
    el.classList.add("is-sel");
    props.dataset.open = "true";
    props.querySelector(".ac-props-name").textContent = el.dataset.name || "";
    props.querySelector(".ac-props-kind").textContent =
      { image: "Image", component: "Component", text: "Text", group: "Group" }[
        el.dataset.kind
      ] || "Layer";
    el._layer?.classList.add("on");
    el._layer?.scrollIntoView({ block: "nearest" });
    placeSel();
    selBox.classList.remove("pop");
    void selBox.offsetWidth;
    selBox.classList.add("pop");
  }
  const undos = [];
  const redos = [];
  function act(a) {
    a.redo();
    undos.push(a);
    redos.length = 0;
  }
  function undo() {
    const a = undos.pop();
    if (!a) return say("nothing to undo", 1400);
    a.undo();
    redos.push(a);
  }
  function redo() {
    const a = redos.pop();
    if (!a) return;
    a.redo();
    undos.push(a);
  }
  function del(el) {
    if (!el || !el.matches("[data-b]")) return;
    act({
      redo: () => {
        el.classList.add("gone");
        el._layer?.classList.add("gone");
        if (sel === el) select(null);
      },
      undo: () => {
        el.classList.remove("gone");
        el._layer?.classList.remove("gone");
      },
    });
    say(
      ["hey, i liked that one", "rude", "⌘Z, quick", "bold choice"][
        Math.floor(Math.random() * 4)
      ],
      1800,
    );
  }
  pOut("r").addEventListener(
    "change",
    () => {
      if (!sel?.matches(".ac-ph")) return;
      const el = sel;
      const from = rotOf(el);
      const to = Math.max(-45, Math.min(45, Number(pOut("r").value) || 0));
      act({
        redo: () => {
          el.style.setProperty("--r", `${to}deg`);
          placeSel();
        },
        undo: () => {
          el.style.setProperty("--r", `${from}deg`);
          placeSel();
        },
      });
    },
    { signal },
  );

  // ---------------- keys ----------------
  const typing = (t) =>
    t?.closest?.("input, textarea, select, [contenteditable]");
  on(window, "keydown", (e) => {
    if (e.key === "Tab") kb = true;
    if (typing(e.target)) return;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "z") {
      e.preventDefault();
      return e.shiftKey ? redo() : undo();
    }
    if (e.code === "Space" && !e.target.closest?.("button, a")) {
      e.preventDefault();
      if (!spaceDown) {
        spaceDown = true;
        root.classList.add("space");
      }
      return;
    }
    if (mod) return;
    const k = e.key.toLowerCase();
    if (k === "v") return setTool("move");
    if (k === "h") return setTool("hand");
    if (k === "c") return setTool("comment");
    if ((e.key === "Delete" || e.key === "Backspace") && sel) {
      e.preventDefault();
      return del(sel);
    }
    if (sel && e.key.startsWith("Arrow") && sel.matches("[data-drag]")) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const dx =
        e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
      const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
      sel.style.left = `${Number.parseFloat(sel.style.left) + dx}px`;
      sel.style.top = `${Number.parseFloat(sel.style.top) + dy}px`;
      return placeSel();
    }
    if (e.key === "ArrowRight" && tour >= 0) return goChapter(tour + 1, false);
    if (e.key === "ArrowLeft" && tour >= 0) return goChapter(tour - 1, false);
    if (e.key === "Escape") {
      if (sel) return select(null);
      if (tool !== "move") return setTool("move");
      return tour >= 0 ? stopTour() : fitAll();
    }
    if (e.key === "+" || e.key === "=") return zoomBy(1.4);
    if (e.key === "-" || e.key === "_") return zoomBy(1 / 1.4);
    if (e.key === "0" || (e.shiftKey && e.key === "!")) return fitAll();
  });
  on(window, "keyup", (e) => {
    if (e.code === "Space") {
      spaceDown = false;
      root.classList.remove("space");
    }
  });
  // tabbing into something off screen brings the camera to it
  on(world, "focusin", (e) => {
    if (!kb) return;
    const r = e.target.getBoundingClientRect();
    const { W, H } = size();
    if (r.top > TOP && r.bottom < H - BOTTOM && r.left > 0 && r.right < W)
      return;
    const sec = e.target.closest("[data-sec]");
    if (sec) goSection(sec.dataset.sec);
  });

  // ---------------- frames: click to select, drag to move, double-click to zoom ----------------
  let drag = null;
  let zTop = 10;
  on(world, "pointerdown", (e) => {
    if (handMode() || tool === "comment") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // a toy's name tag selects the toy; everything else inside a toy is the toy's
    const tag = e.target.closest(".ac-toy > .ac-fn");
    if (tag) {
      select(tag.parentElement);
      return;
    }
    const fr = e.target.closest("[data-drag]");
    if (!fr?.classList.contains("is-sel")) return;
    stopAll();
    drag = {
      fr,
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      l: Number.parseFloat(fr.style.left),
      t: Number.parseFloat(fr.style.top),
      moved: false,
    };
    fr.setPointerCapture?.(e.pointerId);
  });
  on(world, "pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = (e.clientX - drag.sx) / cam.z;
    const dy = (e.clientY - drag.sy) / cam.z;
    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
      drag.moved = true;
      drag.fr.classList.add("dragging");
      drag.fr.style.zIndex = ++zTop;
      select(drag.fr);
    }
    drag.fr.style.left = `${Math.round(drag.l + dx)}px`;
    drag.fr.style.top = `${Math.round(drag.t + dy)}px`;
    placeSel();
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { fr, moved, l, t } = drag;
    drag = null;
    fr.classList.remove("dragging");
    if (moved) {
      const to = { l: fr.style.left, t: fr.style.top };
      undos.push({
        redo: () => {
          fr.style.left = to.l;
          fr.style.top = to.t;
          placeSel();
        },
        undo: () => {
          fr.style.left = `${l}px`;
          fr.style.top = `${t}px`;
          placeSel();
        },
      });
      redos.length = 0;
      fr.classList.remove("dropped");
      void fr.offsetWidth;
      fr.classList.add("dropped");
    } else {
      select(fr);
      if (fr.hasAttribute("data-confetti")) {
        burst(e.clientX, e.clientY);
        fr.classList.remove("popped");
        void fr.offsetWidth;
        fr.classList.add("popped");
      }
    }
  };
  on(world, "pointerup", endDrag);
  on(world, "pointercancel", endDrag);
  on(vp, "dblclick", (e) => {
    if (tool === "comment" || e.target.closest("button, a, input, label, .toy"))
      return;
    const fr = e.target.closest("[data-frame], [data-b]");
    if (fr) return flyToEl(fr);
    const v = vp.getBoundingClientRect();
    const sx = e.clientX - v.left;
    const sy = e.clientY - v.top;
    const z = clampZ(cam.z * 1.8);
    fly(
      {
        z,
        x: sx - (sx - cam.x) * (z / cam.z),
        y: sy - (sy - cam.y) * (z / cam.z),
      },
      0.5,
    );
  });

  function burst(x, y) {
    if (reduce) return;
    for (let k = 0; k < 30; k++) {
      const bit = document.createElement("i");
      bit.style.left = `${x}px`;
      bit.style.top = `${y}px`;
      bit.style.background = CONFETTI[k % CONFETTI.length];
      if (k % 3 === 0) bit.style.borderRadius = "50%";
      fx.appendChild(bit);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const v = 140 + Math.random() * 220;
      animate(
        bit,
        {
          x: [0, Math.cos(a) * v * 0.7, Math.cos(a) * v],
          y: [0, Math.sin(a) * v * 0.8, Math.sin(a) * v + 260],
          rotate: [0, (Math.random() - 0.5) * 720],
          opacity: [1, 1, 0],
        },
        { duration: 1.2 + Math.random() * 0.5, ease: [0.2, 0.6, 0.4, 1] },
      ).finished.then(() => bit.remove());
    }
  }

  // ---------------- comments: leave your own (they stay in your browser) ----------------
  const loadComments = () => {
    try {
      return JSON.parse(localStorage.getItem(COMMENTS_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const saveComments = (list) => {
    try {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(list.slice(-40)));
    } catch {
      // private mode: comments just won't survive a reload
    }
  };
  let comments = loadComments();
  function renderComment(c) {
    const el = document.createElement("div");
    el.className = "ac-cmt";
    el.style.left = `${c.x}px`;
    el.style.top = `${c.y}px`;
    el.innerHTML =
      '<span class="ac-cmt-pin">Y</span><p></p><button type="button" aria-label="Delete comment">×</button>';
    el.querySelector("p").textContent = c.text;
    el.querySelector("button").addEventListener(
      "click",
      () => {
        comments = comments.filter((x) => x !== c);
        saveComments(comments);
        el.remove();
      },
      { signal },
    );
    cmts.appendChild(el);
    return el;
  }
  for (const c of comments) renderComment(c);
  let draft = null;
  function placeComment(e) {
    draft?.remove();
    const v = vp.getBoundingClientRect();
    const x = Math.round((e.clientX - v.left - cam.x) / cam.z);
    const y = Math.round((e.clientY - v.top - cam.y) / cam.z);
    const el = document.createElement("form");
    el.className = "ac-cmt draft";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.innerHTML =
      '<span class="ac-cmt-pin">Y</span><input type="text" maxlength="140" placeholder="Add a comment…" aria-label="Your comment" /><button type="submit" aria-label="Post">↑</button>';
    cmts.appendChild(el);
    draft = el;
    const input = el.querySelector("input");
    later(() => input.focus(), 30);
    el.addEventListener(
      "submit",
      (ev) => {
        ev.preventDefault();
        const text = input.value.trim();
        el.remove();
        draft = null;
        if (!text) return;
        const c = { x, y, text };
        comments.push(c);
        saveComments(comments);
        const shown = renderComment(c);
        shown.classList.add("new");
        setTool("move");
        later(
          () =>
            say(
              ["noted!", "love that", "haha true", "pinned it"][
                Math.floor(Math.random() * 4)
              ],
              2000,
            ),
          500,
        );
      },
      { signal },
    );
    input.addEventListener(
      "keydown",
      (ev) => {
        if (ev.key === "Escape") {
          el.remove();
          draft = null;
          setTool("move");
        }
      },
      { signal },
    );
  }

  // ---------------- your cursor, and Alexi's ----------------
  let youOn = false;
  function moveYou(e) {
    if (!fine) return;
    if (!youOn) {
      youOn = true;
      you.classList.add("on");
    }
    you.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 14}px)`;
  }
  on(vp, "pointerleave", () => {
    youOn = false;
    you.classList.remove("on");
  });

  // Alexi's cursor moves like a hand on a mouse: minimum-jerk paths (eases out and in, no lag,
  // no overshoot), timed by Fitts's law, with a slight arc. A new move starts from the current
  // velocity, so changing plans mid-move never jerks. Whatever he drags is tied to the cursor
  // itself, so the two can't drift apart.
  const ax = { x: 640, y: 760 };
  const av = { x: 0, y: 0 }; // world px per second
  let mv = null;
  let mvRaf = 0;
  let bendSide = 1;
  const placeA = () => {
    alexi.style.translate = `${ax.x}px ${ax.y}px`;
    if (chatW) fitChat();
  };
  placeA();
  const setAlexiTool = (t) => {
    toolBadge.textContent = t ? TOOL[t] : "";
    alexi.classList.toggle("has-tool", !!t);
  };
  const press = () => {
    alexi.classList.remove("press");
    void alexi.offsetWidth;
    alexi.classList.add("press");
  };
  // a fifth-order ease from p0 (moving at v0) to p1 (at rest), over T seconds
  const quintic = (p0, v0, p1, T) => {
    const d = p1 - p0;
    const c1 = v0 * T;
    const c3 = 10 * d - 6 * c1;
    const c4 = -15 * d + 8 * c1;
    const c5 = 6 * d - 3 * c1;
    return {
      p: (u) => p0 + u * (c1 + u * u * (c3 + u * (c4 + u * c5))),
      v: (u) => (c1 + u * u * (3 * c3 + u * (4 * c4 + 5 * c5 * u))) / T,
    };
  };
  function stepMove(now) {
    const m = mv;
    if (!m) {
      mvRaf = 0;
      return;
    }
    const u = Math.min(1, Math.max(0, (now - m.t0) / (m.T * 1000)));
    const k = 16 * u * u * (1 - u) * (1 - u);
    const dk = (32 * u * (1 - u) * (1 - 2 * u)) / m.T;
    ax.x = m.qx.p(u) + m.nx * m.b * k;
    ax.y = m.qy.p(u) + m.ny * m.b * k;
    av.x = m.qx.v(u) + m.nx * m.b * dk;
    av.y = m.qy.v(u) + m.ny * m.b * dk;
    placeA();
    m.onFrame?.(ax.x, ax.y);
    if (u >= 1) {
      mv = null;
      mvRaf = 0;
      av.x = 0;
      av.y = 0;
      m.done();
      return;
    }
    mvRaf = requestAnimationFrame(stepMove);
  }
  // how long a hand takes to cover d screen px (Fitts's law), with a floor and a ceiling
  const fitts = (d) => Math.min(0.9, 0.18 + 0.115 * Math.log2(1 + d / 40));
  function travel(tx, ty, { T, arc = 1, onFrame } = {}) {
    const prev = mv;
    if (reduce) {
      setA(tx, ty);
      onFrame?.(tx, ty);
      return Promise.resolve();
    }
    const dx = tx - ax.x;
    const dy = ty - ax.y;
    const d = Math.hypot(dx, dy);
    const dur = Math.max(0.08, T ?? fitts(d * cam.z));
    bendSide = -bendSide;
    const b = bendSide * arc * Math.min(d * 0.06, 50 / cam.z);
    return new Promise((done) => {
      mv = {
        t0: performance.now(),
        T: dur,
        qx: quintic(ax.x, av.x, tx, dur),
        qy: quintic(ax.y, av.y, ty, dur),
        nx: d ? -dy / d : 0,
        ny: d ? dx / d : 0,
        b,
        onFrame,
        done,
      };
      prev?.done(); // a move that got replaced is over
      if (!mvRaf) mvRaf = requestAnimationFrame(stepMove);
    });
  }
  function setA(x, y) {
    const prev = mv;
    mv = null;
    prev?.done();
    ax.x = x;
    ax.y = y;
    av.x = 0;
    av.y = 0;
    placeA();
  }
  let sayT = null;
  function say(line, ms = 2600) {
    if (!line) return;
    chat.textContent = line;
    chatW = chat.offsetWidth;
    fitChat();
    chat.classList.add("on");
    cancel(sayT);
    sayT = later(() => chat.classList.remove("on"), ms);
  }
  const spotOf = (el) => {
    const r = rectOf(el);
    return {
      x: r.x + Math.min(r.w * 0.62, 260),
      y: r.y + Math.min(r.h * 0.55, 200),
    };
  };
  async function goTo(el, line, ms) {
    const s = spotOf(el);
    const run = cursorRun;
    await travel(s.x, s.y);
    if (alive && line && run === cursorRun) say(line, ms);
  }
  // when nothing's going on, Alexi drifts to something on screen and says something about it
  let wanderT = null;
  let noticedAt = 0;
  let busy = 0; // building, so the cursor's taken
  function wander() {
    wanderT = later(wander, 4600 + Math.random() * 2600);
    if (busy || tour >= 0 || document.hidden) return;
    if (performance.now() - noticedAt < 3000) return;
    const { W, H } = size();
    const els = [...world.querySelectorAll("[data-cur]")].filter((el) => {
      if (!el.closest('[data-state="built"]')) return false;
      const r = el.getBoundingClientRect();
      return (
        r.width > 20 &&
        r.right > 40 &&
        r.left < W - 40 &&
        r.bottom > TOP &&
        r.top < H - BOTTOM
      );
    });
    if (!els.length) return;
    const el = els[Math.floor(Math.random() * els.length)];
    goTo(el, Math.random() < 0.6 ? el.dataset.cur : null);
  }
  function noticeAlexi(e) {
    if (!fine || busy || tour >= 0) return;
    if (performance.now() - noticedAt < 6000) return;
    const r = alexi.getBoundingClientRect();
    if (Math.hypot(r.left - e.clientX, r.top - e.clientY) > 60) return;
    noticedAt = performance.now();
    const away = 70 / cam.z;
    const ang = Math.atan2(r.top - e.clientY, r.left - e.clientX);
    travel(ax.x + Math.cos(ang) * away, ax.y + Math.sin(ang) * away);
    say(HELLOS[Math.floor(Math.random() * HELLOS.length)], 1800);
  }

  // ---------------- counters tick up the first time you see them ----------------
  const counted = new Set();
  const built = new Set();
  watchers.push(() => {
    for (const s of SECTIONS) {
      if (!s.counters || counted.has(s.id) || !built.has(s.id)) continue;
      const { W, H } = size();
      const x0 = cam.x + s.x * cam.z;
      const y0 = cam.y + s.y * cam.z;
      const ix = Math.max(0, Math.min(W, x0 + s.w * cam.z) - Math.max(0, x0));
      const iy = Math.max(0, Math.min(H, y0 + s.h * cam.z) - Math.max(0, y0));
      const fits = Math.min(s.w * cam.z, W) * Math.min(s.h * cam.z, H);
      if ((ix * iy) / fits < 0.45) continue;
      counted.add(s.id);
      // too far out to watch them count: just show the numbers
      const far = cam.z < 0.28;
      for (const el of root.querySelectorAll(
        `[data-sec="${s.id}"] [data-count]`,
      )) {
        const to = Number(el.dataset.count);
        const fmt = (v) =>
          `${el.dataset.pre}${Math.round(v).toLocaleString("en-US")}${el.dataset.post}`;
        if (reduce || far) {
          el.textContent = fmt(to);
          continue;
        }
        animate(0, to, {
          duration: 1.6,
          ease: [0.2, 0.7, 0.2, 1],
          onUpdate: (v) => {
            el.textContent = fmt(v);
          },
        });
      }
    }
  });

  // ---------------- layers: a live list that fills in as things get built ----------------
  const ICON = { image: "▣", component: "◆", text: "T", group: "▤" };
  const secLayers = {};
  for (const s of SECTIONS) {
    const li = document.createElement("li");
    li.className = "ac-lay-sec empty";
    li.innerHTML = `<button type="button"><i>#</i><span></span><small>empty</small></button><ul></ul>`;
    li.querySelector("span").textContent = s.chapter;
    li.querySelector("i").style.color = s.color || "var(--gray)";
    li.querySelector("button").addEventListener(
      "click",
      () => {
        userTouched();
        goSection(s.id);
      },
      { signal },
    );
    layerList.appendChild(li);
    secLayers[s.id] = li;
  }
  function addLayer(secId, el) {
    if (el._layer) return;
    const li = document.createElement("li");
    li.className = "ac-lay new";
    li.innerHTML = `<button type="button"><i></i><span></span></button>`;
    li.querySelector("i").textContent = ICON[el.dataset.kind] || "▢";
    li.querySelector("span").textContent = el.dataset.name || "Layer";
    const b = li.querySelector("button");
    b.addEventListener(
      "click",
      () => {
        userTouched();
        setTool("move");
        select(el);
        flyToEl(el);
      },
      { signal },
    );
    b.addEventListener("mouseenter", () => el.classList.add("hl"), { signal });
    b.addEventListener("mouseleave", () => el.classList.remove("hl"), {
      signal,
    });
    const sec = secLayers[secId];
    sec.classList.remove("empty");
    sec.querySelector("small").textContent = "";
    sec.querySelector("ul").prepend(li); // Figma lists the newest layer on top
    el._layer = li;
  }

  // ---------------- building: the Figma way ----------------
  const segEls = [...world.querySelectorAll(".ac-path .seg")];
  // the drawing box: blue outline, corner handles, the live size, the layer's name
  const newBox = () => {
    const box = document.createElement("div");
    box.className = "ac-draw";
    box.innerHTML =
      '<b></b><b></b><b></b><b></b><span class="ac-draw-name"></span><span class="ac-draw-dim"></span>';
    return box;
  };
  let cursorRun = 0; // whoever owns Alexi's cursor right now
  let epoch = 0; // bumps on skip/reset, so builds in flight stand down

  // a point inside a (possibly rotated) section, in world coordinates; pure math, no layout
  // reads, so it's cheap to call every frame
  const toWorld = (sd, lx, ly) => {
    const r = ((sd.rot || 0) * Math.PI) / 180;
    const dx = lx - sd.w / 2;
    const dy = ly - sd.h / 2;
    return {
      x: sd.x + sd.w / 2 + dx * Math.cos(r) - dy * Math.sin(r),
      y: sd.y + sd.h / 2 + dx * Math.sin(r) + dy * Math.cos(r),
    };
  };

  // drag out a rectangle inside a section: the box's corner IS the cursor, every frame
  async function drawRect(sec, r, name, run) {
    const sd = SEC[sec.dataset.sec];
    const drawBox = newBox();
    const drawDim = drawBox.querySelector(".ac-draw-dim");
    drawBox.querySelector(".ac-draw-name").textContent = name;
    const size = (w, h) => {
      drawBox.style.width = `${w}px`;
      drawBox.style.height = `${h}px`;
      drawDim.textContent = `${Math.round(w)} × ${Math.round(h)}`;
    };
    drawBox.style.left = `${r.x}px`;
    drawBox.style.top = `${r.y}px`;
    size(0, 0);
    const mine = () => run === cursorRun;
    if (mine()) {
      const tl = toWorld(sd, r.x, r.y);
      await travel(tl.x, tl.y);
      if (!alive) return drawBox;
      press();
      await wait(45);
    }
    sec.appendChild(drawBox);
    if (mine()) {
      const rad = ((sd.rot || 0) * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const cx = sd.x + sd.w / 2;
      const cy = sd.y + sd.h / 2;
      const br = toWorld(sd, r.x + r.w, r.y + r.h);
      const diag = Math.hypot(r.w, r.h) * cam.z;
      await travel(br.x, br.y, {
        T: Math.min(0.8, 0.28 + 0.1 * Math.log2(1 + diag / 40)),
        arc: 0.2,
        onFrame: (x, y) => {
          // the cursor, back in the section's own (unrotated) frame
          const dx = x - cx;
          const dy = y - cy;
          const lx = dx * cos + dy * sin + sd.w / 2;
          const ly = -dx * sin + dy * cos + sd.h / 2;
          size(
            Math.max(0, Math.min(r.w, lx - r.x)),
            Math.max(0, Math.min(r.h, ly - r.y)),
          );
        },
      });
    } else {
      await animate(0, 1, {
        duration: 0.45,
        ease: [0.33, 0, 0.12, 1],
        onUpdate: (p) => size(r.w * p, r.h * p),
      }).finished;
    }
    size(r.w, r.h);
    return drawBox;
  }
  const hideDraw = (box) => {
    if (!box) return;
    box.classList.add("out");
    later(() => box.remove(), 400);
  };

  // the text tool: characters arrive at a typing rhythm (a little uneven, pausing after
  // spaces and punctuation), revealed on animation frames; the caret floats above the text so
  // nothing reflows, and the mouse cursor stays parked, like it would while you type
  function splitChars(el) {
    if (el._chars) return el._chars;
    const chars = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const t of nodes) {
      if (!t.textContent.trim() || t.parentElement.closest("[data-count]"))
        continue;
      const frag = document.createDocumentFragment();
      for (const part of t.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          continue;
        }
        const w = document.createElement("span");
        w.className = "ac-w";
        for (const ch of Array.from(part)) {
          const c = document.createElement("span");
          c.className = "ac-c";
          c.textContent = ch;
          w.appendChild(c);
          chars.push(c);
        }
        frag.appendChild(w);
      }
      t.replaceWith(frag);
    }
    el._chars = chars;
    return chars;
  }
  async function typeIn(el) {
    const chars = splitChars(el);
    el.classList.add("typing", "shown");
    if (!chars.length) return;
    if (getComputedStyle(el).position === "static")
      el.style.position = "relative";
    const caret = document.createElement("i");
    caret.className = "ac-caret";
    el.appendChild(caret);
    const big = el.matches("h1, .ac-words");
    const base = big ? 30 : 11;
    const times = [];
    let t = 0;
    chars.forEach((c, k) => {
      t += base * (0.55 + Math.random() * 0.9);
      const endOfWord = c === c.parentElement.lastChild;
      if (endOfWord) t += base * 1.1;
      if (/[.,!?:]/.test(c.textContent)) t += base * 3.5;
      times[k] = t;
    });
    const ep = epoch;
    let lastY = null;
    await new Promise((res) => {
      let i = 0;
      const t0 = performance.now();
      const step = (now) => {
        if (!alive || ep !== epoch) {
          caret.remove();
          return res();
        }
        const el0 = now - t0;
        const from = i;
        while (i < chars.length && times[i] <= el0)
          chars[i++].classList.add("on");
        if (i > from) {
          // a thin caret the height of the letters, centered on the line; it glides along
          // the line and only jumps when the text wraps
          const c = chars[i - 1];
          const w = c.parentElement;
          if (!w._fs) w._fs = Number.parseFloat(getComputedStyle(w).fontSize);
          const h = w._fs * 0.98;
          const x = c.offsetLeft + c.offsetWidth + w._fs * 0.03;
          const y = c.offsetTop + (c.offsetHeight - h) / 2;
          caret.classList.toggle(
            "jump",
            lastY !== null && Math.abs(y - lastY) > 2,
          );
          caret.style.translate = `${x}px ${y}px`;
          caret.style.height = `${h}px`;
          lastY = y;
        }
        if (i < chars.length) requestAnimationFrame(step);
        else res();
      };
      requestAnimationFrame(step);
    });
    el.classList.remove("typing");
    later(() => caret.remove(), 520);
  }

  // decode a chapter's images before they're revealed, so nothing stutters as they appear
  function warm(id) {
    const imgs = [...secEl(id).querySelectorAll("img")];
    for (const i of imgs) i.loading = "eager";
    return Promise.race([
      Promise.all(imgs.map((i) => i.decode?.().catch(() => {}))),
      wait(1200),
    ]);
  }

  function finishItem(el, secId) {
    el.classList.add("shown", "pinned");
    el.classList.remove("unrot");
    addLayer(secId, el);
  }

  // a frame: draw it, let the image fill in, let it settle into its angle, drop the comment
  async function drawFrame(el, sec, secId, run) {
    const r = localRect(el, sec);
    el.classList.add("unrot");
    const box = await drawRect(sec, r, el.dataset.name || "Frame", run);
    if (!alive) return;
    el.classList.add("shown", "filling");
    addLayer(secId, el);
    hideDraw(box);
    // the image fills in, the print settles into its angle, the comment drops in, all while
    // the hand is already on its way to the next thing
    later(() => el.classList.remove("unrot"), 280);
    // the comment drops in, opens so you can read it, then tucks itself away
    if (el.querySelector(".ac-pin")) {
      later(() => el.classList.add("pinned", "pin-open"), 560);
      later(() => el.classList.remove("pin-open"), 3400);
    } else el.classList.add("pinned");
    later(() => el.classList.remove("filling"), 900);
  }

  function drawPaths(instant) {
    segEls.forEach((seg, k) => {
      if (seg.dataset.drawn || !built.has(TOUR[k]) || !built.has(TOUR[k + 1]))
        return;
      seg.dataset.drawn = "1";
      if (instant || reduce) {
        seg.style.strokeDashoffset = "0";
        return;
      }
      animate(1, 0, {
        duration: 1.4,
        ease: [0.45, 0, 0.2, 1],
        onUpdate: (v) => {
          seg.style.strokeDashoffset = String(v);
        },
      });
    });
  }
  const saveBuilt = () => {
    try {
      sessionStorage.setItem(BUILT_KEY, JSON.stringify([...built]));
    } catch {
      // private mode: it'll just build again next time
    }
  };
  function markBuilt(id) {
    built.add(id);
    saveBuilt();
    secEl(id).dataset.state = "built";
    drawPaths();
    root.classList.toggle("all-built", built.size === TOUR.length);
    apply();
    if (tour >= 0 && CH[tour].id === id) chapterReady();
    const next = TOUR[TOUR.indexOf(id) + 1];
    if (next) later(() => warm(next), 400);
  }

  // On a phone, while the tour plays, the page scrolls along with the hand: it only moves when
  // the next piece isn't on screen yet, and never zooms.
  const phone = () => size().W < 700;
  const following = (id) =>
    phone() && tour >= 0 && autoOn && CH[tour]?.id === id;
  const readH = () => (size().H - TOP - BOTTOM) / readZ();
  const viewTop = () => (TOP + 8 - cam.y) / cam.z;
  const focusOn = (el) => {
    const r = rectOf(el);
    const vis = readH();
    const top = viewTop();
    const zoomed = Math.abs(cam.z - readZ()) > 0.01;
    if (!zoomed && r.y >= top && r.y + r.h <= top + vis - 8)
      return Promise.resolve();
    // tall things: from their top; the rest sit a bit above the middle
    const y = r.h > vis * 0.7 ? r.y - 24 : r.y + r.h / 2 - vis * 0.42;
    const to = readView(y);
    return fly(to, Math.min(1.8, 0.6 + Math.abs(to.y - cam.y) / 1100));
  };

  // build one chapter. withCursor: Alexi does it by hand (presses the placeholder so it fills
  // in, types the words, draws a few frames, pastes the rest), every step flowing into the
  // next; otherwise it cascades in. Never blocks you: pan, click, play meanwhile.
  async function build(id, withCursor, { wordsIn = false } = {}) {
    const sec = secEl(id);
    if (built.has(id) || sec.dataset.state === "building") return;
    const items = [...sec.querySelectorAll("[data-b]")];
    const s = SEC[id];
    if (!withCursor || reduce) {
      sec.dataset.state = "building";
      items.forEach((el, k) => {
        later(
          () => {
            finishItem(el, id);
            if (!reduce) el.classList.add("filling");
          },
          reduce ? 0 : 120 + k * 50,
        );
      });
      await wait(items.length * 50 + 400);
      markBuilt(id);
      return;
    }
    const run = ++cursorRun;
    const ep = epoch;
    chat.classList.remove("on");
    const stop = () => {
      if (!alive || ep !== epoch) {
        busy = Math.max(0, busy - 1);
        return true;
      }
      return false;
    };
    const mine = () => run === cursorRun;
    busy++;
    alexi.classList.add("on");
    warm(id);
    // 1. the placeholder becomes the section: press its +, the color spreads out from there
    if (!s.bare && sec.dataset.state === "ghost" && mine()) {
      const p = toWorld(s, s.w / 2, s.h / 2);
      await travel(p.x, p.y);
      if (stop()) return;
      press();
      await wait(70);
    }
    sec.dataset.state = "building";
    await wait(s.bare ? 60 : 300);
    const text = items.filter((el) => el.dataset.kind === "text");
    const rest = items.filter((el) => el.dataset.kind !== "text");
    // on a phone, the piece Alexi shows off is made first, so he can play with it while it's
    // on screen; then the page scrolls on down through the rest
    demoed.delete(id);
    const star =
      following(id) && DEMO_AT[id]
        ? sec.querySelector(DEMO_AT[id])?.closest("[data-b]")
        : null;
    if (following(id)) {
      const top = new Map(rest.map((el) => [el, localRect(el, sec).y]));
      rest.sort((a, b) => top.get(a) - top.get(b));
      // the star among the hand-drawn ones: whatever sits above it is drawn first
      const k = star ? rest.indexOf(star) : -1;
      if (k >= HAND_DRAWN) rest.splice(HAND_DRAWN - 1, 0, ...rest.splice(k, 1));
    }
    // 2. the words: click where they start, type, slide the mouse out of the way. Arriving
    // from home they rise in at once instead, the way home's hero just lifted out.
    if (wordsIn) {
      text.forEach((el, k) => {
        finishItem(el, id);
        animate(
          el,
          { opacity: [0, 1], y: [16, 0], filter: ["blur(6px)", "blur(0px)"] },
          { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: k * 0.06 },
        ).finished.then(() => {
          el.style.filter = "";
          el.style.transform = "";
        });
      });
      text.length = 0;
      await wait(260);
    }
    for (const el of text) {
      if (stop()) return;
      if (following(id)) await focusOn(el.closest(".ac-col") || el);
      if (mine()) {
        setAlexiTool("text");
        const r = localRect(el, sec);
        const at = toWorld(s, r.x + 2, r.y + Math.min(r.h * 0.4, 30));
        await travel(at.x, at.y);
        if (stop()) return;
        press();
        await wait(40);
      }
      const typing = typeIn(el);
      if (mine()) {
        const r = localRect(el, sec);
        const off = toWorld(s, r.x - 30, r.y + r.h + 30);
        travel(off.x, off.y, { arc: 0.4 });
      }
      await typing;
      addLayer(id, el);
      el.classList.add("pinned");
      await wait(50);
    }
    // 3. a few frames, drawn by hand
    const hand = rest.slice(0, HAND_DRAWN);
    const paste = rest.slice(HAND_DRAWN);
    for (const el of hand) {
      if (stop()) return;
      if (el.dataset.kind === "group") {
        finishItem(el, id);
        el.classList.add("filling");
        continue;
      }
      if (mine()) setAlexiTool("frame");
      if (following(id)) await focusOn(el);
      await drawFrame(el, sec, id, run);
      await wait(40 + Math.random() * 60);
    }
    if (star && following(id) && mine()) {
      demoed.add(id);
      setAlexiTool(null);
      await DEMO[id](sec, tourRun);
      if (stop()) return;
    }
    // 4. the rest, pasted in: they come out of the cursor, nearest first, and glide to their
    // spots, each with a brief "just pasted" outline; their comments land a beat later
    if (paste.length) {
      const scroll = following(id);
      if (mine()) {
        setAlexiTool("paste");
        press();
        say(`pasting ${paste.length} more`, 1600);
      }
      // the cursor, in the section's own (unrotated) frame
      const rad = ((s.rot || 0) * Math.PI) / 180;
      const dx = ax.x - (s.x + s.w / 2);
      const dy = ax.y - (s.y + s.h / 2);
      const from = {
        x: dx * Math.cos(rad) + dy * Math.sin(rad) + s.w / 2,
        y: -dx * Math.sin(rad) + dy * Math.cos(rad) + s.h / 2,
      };
      const order = paste
        .map((el) => {
          const r = localRect(el, sec);
          const c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
          return { el, ox: from.x - c.x, oy: from.y - c.y };
        })
        .sort((a, b) => Math.hypot(a.ox, a.oy) - Math.hypot(b.ox, b.oy));
      // on a phone they drop in top to bottom, each as the page scrolls down to it
      let due = null;
      if (scroll) {
        for (const o of order) {
          o.top = rectOf(o.el).y;
          o.ox = 0;
          o.oy = 28;
        }
        order.sort((a, b) => a.top - b.top);
        const vis = readH();
        const y0 = viewTop();
        const y1 = Math.max(y0, s.y + s.h - vis + 40);
        // unhurried: about 650px of screen a second at most
        const D = Math.max(
          1.1,
          order.length * 0.2,
          ((y1 - y0) * readZ()) / 650,
        );
        fly(readView(y1), D, [0.45, 0, 0.55, 1]);
        const t0 = performance.now();
        due = (o) =>
          t0 +
          D *
            1000 *
            Math.min(
              1,
              Math.max(0, (o.top + 60 - (y0 + vis)) / Math.max(1, y1 - y0)),
            );
      }
      await wait(120);
      for (const o of order) {
        const { el, ox, oy } = o;
        if (due) await wait(Math.max(0, due(o) - performance.now()));
        if (stop()) return;
        el.style.opacity = "0";
        finishItem(el, id);
        el.classList.remove("pinned");
        el.classList.add("just-pasted");
        animate(
          el,
          {
            x: [ox * 0.9, 0],
            y: [oy * 0.9, 0],
            scale: [scroll ? 0.94 : 0.3, 1],
            opacity: [0, 1],
          },
          { duration: 0.62, ease: [0.18, 0.8, 0.25, 1] },
        ).finished.then(() => {
          el.style.transform = "";
          el.style.opacity = "";
        });
        later(() => el.classList.add("pinned"), 520);
        later(() => el.classList.remove("just-pasted"), 900);
        if (scroll && mine()) {
          const r = rectOf(el);
          travel(r.x + r.w * 0.7, r.y + r.h * 0.6, { arc: 0.3 });
        }
        await wait(scroll ? 70 : 110);
      }
      await wait(500);
    }
    await wait(160);
    busy = Math.max(0, busy - 1);
    if (!alive || ep !== epoch) return;
    if (mine()) setAlexiTool(null);
    markBuilt(id);
  }
  function buildAll() {
    TOUR.forEach((id, k) => {
      if (!built.has(id)) later(() => build(id, false), k * 140);
    });
  }
  function unbuildAll() {
    epoch++;
    select(null);
    for (const id of TOUR) {
      if (id === "hello") continue;
      built.delete(id);
      const sec = secEl(id);
      sec.dataset.state = "ghost";
      for (const el of sec.querySelectorAll("[data-b]")) {
        el.classList.remove(
          "shown",
          "pinned",
          "pin-open",
          "filling",
          "pasted",
          "gone",
        );
        el._layer?.remove();
        el._layer = null;
        for (const c of el._chars || []) c.classList.remove("on");
      }
      const li = secLayers[id];
      li.classList.add("empty");
      li.querySelector("small").textContent = "empty";
    }
    for (const seg of segEls) {
      delete seg.dataset.drawn;
      seg.style.strokeDashoffset = "";
    }
    counted.clear();
    for (const el of root.querySelectorAll("[data-count]"))
      el.textContent = `${el.dataset.pre}0${el.dataset.post}`;
    root.classList.remove("all-built");
    saveBuilt();
  }
  // coming back this visit: what you'd already built is simply there
  function restore() {
    let ids = [];
    try {
      ids = JSON.parse(sessionStorage.getItem(BUILT_KEY) || "[]");
    } catch {
      ids = [];
    }
    for (const id of ids) {
      const sec = secEl(id);
      if (!sec || built.has(id)) continue;
      for (const el of sec.querySelectorAll("[data-b]")) {
        el.classList.add("shown", "pinned");
        addLayer(id, el);
      }
      sec.dataset.state = "built";
      built.add(id);
      counted.add(id); // numbers you've already seen count up don't do it again
      for (const b of sec.querySelectorAll("[data-count]"))
        b.textContent = `${b.dataset.pre}${Number(b.dataset.count).toLocaleString("en-US")}${b.dataset.post}`;
    }
    drawPaths(true);
    root.classList.toggle("all-built", built.size === TOUR.length);
    return built.size;
  }

  // ---------------- the tour: a presentation you can interrupt any time ----------------
  let tour = -1;
  let autoOn = false;
  let autoT = null;
  let tourRun = 0;
  function setMode(m) {
    bar.dataset.mode = m;
    root.classList.toggle("touring", m === "tour");
  }
  function setPaused(p) {
    bar.classList.toggle("paused", p);
  }
  function pauseAuto() {
    autoOn = false;
    cancel(autoT);
    resetProg();
    setPaused(true);
  }
  // the chapter's done: Alexi shows you the fun part (clicks a toy, pops the confetti), then
  // the tour lingers a moment before moving on
  async function chapterReady(seen) {
    const s = CH[tour];
    const tr = tourRun;
    cancel(autoT);
    resetProg();
    if (!busy && !demoed.has(s.id)) {
      if (!seen && DEMO[s.id]) await DEMO[s.id](secEl(s.id), tr);
      else {
        const sec = secEl(s.id);
        const lead =
          sec.querySelector(".ac-toy[data-cur]") ||
          sec.querySelector("[data-cur]") ||
          sec.querySelector("[data-b]");
        if (lead) await goTo(lead, s.say, 2800);
      }
    }
    if (!alive || tr !== tourRun) return;
    // a beat to take it in (counted from when the show-and-tell ends), then on to the next;
    // the hand rests but doesn't freeze
    scheduleNext(seen ? 1500 : 1900);
    if (!busy && !reduce) {
      const a = Math.random() * Math.PI * 2;
      const d = 26 / cam.z;
      travel(ax.x + Math.cos(a) * d, ax.y + Math.sin(a) * d, {
        T: 1.7,
        arc: 0.6,
      });
    }
  }
  // click something like a person would: go there, press, then it happens
  async function clickAt(el, tr, line) {
    if (!el || tr !== tourRun) return false;
    // on a phone the page only moves forward: no scrolling back up to show something off
    if (phone() && autoOn) {
      const r = rectOf(el.closest(".ac-fr") || el);
      if (r.y < viewTop() - 40) return false;
      await focusOn(el.closest(".ac-fr") || el);
    }
    const r = rectOf(el);
    await travel(r.x + r.w / 2, r.y + r.h / 2);
    if (!alive || tr !== tourRun) return false;
    press();
    if (line) say(line, 2600);
    return true;
  }
  const DEMO_AT = {
    origins: ".vb",
    ateneo: ".qpi-row",
    weekends: "[data-confetti]",
    off: ".pile-go",
  };
  const demoed = new Set();
  const DEMO = {
    origins: async (sec, tr) => {
      const radios = sec.querySelectorAll(".vb input");
      if (await clickAt(radios[1], tr, "click one, the picture changes"))
        radios[1].click();
      await wait(650);
      if (await clickAt(radios[2], tr)) radios[2].click();
    },
    ateneo: async (sec, tr) => {
      const b = sec.querySelectorAll(".qpi-row button")[0];
      if (await clickAt(b, tr, "try the what-if")) b.click();
    },
    weekends: async (sec, tr) => {
      const ph = sec.querySelector("[data-confetti]");
      if (await clickAt(ph, tr, "we actually won this one")) {
        const r = ph.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height * 0.4);
        ph.classList.add("pin-open");
        later(() => ph.classList.remove("pin-open"), 3200);
        ph.classList.remove("popped");
        void ph.offsetWidth;
        ph.classList.add("popped");
      }
    },
    off: async (sec, tr) => {
      const go = sec.querySelector(".pile-go");
      if (await clickAt(go, tr, "watch this")) shuffle(go, false, true);
      await wait(1500);
      const tidy = sec.querySelector(".pile-tidy");
      if (await clickAt(tidy, tr)) shuffle(tidy, true, true);
    },
  };
  // the progress line under the chapter name fills while it lingers
  const resetProg = () => {
    prog.style.transition = "none";
    prog.style.transform = "scaleX(0)";
  };
  function scheduleNext(ms = AUTO) {
    cancel(autoT);
    resetProg();
    if (!autoOn || tour < 0) return;
    void prog.offsetWidth;
    prog.style.transition = `transform ${ms}ms linear`;
    prog.style.transform = "scaleX(1)";
    autoT = later(() => goChapter(tour + 1, true), ms);
  }
  // which chapter you're looking at right now
  function mostVisible() {
    const { W, H } = size();
    let best = 0;
    let bestA = -1;
    CH.forEach((s, k) => {
      const x0 = Math.max(0, cam.x + s.x * cam.z);
      const y0 = Math.max(TOP, cam.y + s.y * cam.z);
      const x1 = Math.min(W, cam.x + (s.x + s.w) * cam.z);
      const y1 = Math.min(H - BOTTOM, cam.y + (s.y + s.h) * cam.z);
      const a = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
      if (a > bestA) {
        bestA = a;
        best = k;
      }
    });
    return best;
  }
  const showChapter = (k) => {
    const s = CH[k];
    chapName.textContent = s.chapter;
    chapNum.textContent = `${k + 1} / ${CH.length}`;
    chapDot.style.background = s.color || "var(--ink)";
  };
  // while paused, the bar follows you around: Resume picks up from wherever you've wandered
  watchers.push(() => {
    if (tour >= 0 && !autoOn) showChapter(mostVisible());
  });
  function resume() {
    autoOn = true;
    setPaused(false);
    const here = mostVisible();
    if (tour < 0 || here !== tour) return goChapter(here, true);
    if (built.has(CH[tour].id)) scheduleNext(1400);
    else build(CH[tour].id, true);
  }
  async function goChapter(i, auto) {
    if (i >= CH.length) return stopTour(true);
    tour = Math.max(0, i);
    autoOn = auto;
    const run = ++tourRun;
    const s = CH[tour];
    setMode("tour");
    setPaused(!auto);
    showChapter(tour);
    cancel(autoT);
    resetProg();
    select(null);
    warm(s.id);
    if (CH[tour + 1]) later(() => warm(CH[tour + 1].id), 1500);
    const flight = fly(chapterView(s));
    // the hand sets off while the camera is still arriving, so the two read as one motion
    if (!built.has(s.id)) {
      later(
        () => {
          if (alive && run === tourRun) build(s.id, true);
        },
        lastFlight * 1000 * 0.55,
      );
      return;
    }
    await flight;
    if (!alive || run !== tourRun) return;
    chapterReady(true);
  }
  // start at the first chapter that isn't there yet (Hello builds itself on arrival, so a press
  // during that skips straight on and lets it finish)
  function startTour() {
    userTouched();
    if (built.size === TOUR.length) {
      unbuildAll();
      return goChapter(0, true);
    }
    const k = TOUR.findIndex(
      (id) => !built.has(id) && secEl(id).dataset.state !== "building",
    );
    goChapter(k < 0 ? 0 : k, true);
  }
  function stopTour(keep) {
    tour = -1;
    tourRun++;
    autoOn = false;
    cancel(autoT);
    resetProg();
    setMode("free");
    setPaused(false);
    if (!keep) fitAll();
  }
  function skip() {
    userTouched();
    stopTour(true);
    cursorRun++;
    epoch++;
    busy = 0;
    setAlexiTool(null);
    for (const b of world.querySelectorAll(".ac-draw, .ac-caret")) b.remove();
    for (const id of TOUR) {
      const sec = secEl(id);
      if (sec.dataset.state !== "built") {
        for (const el of sec.querySelectorAll("[data-b]")) {
          for (const c of el._chars || []) c.classList.add("on");
          el.classList.remove("typing");
        }
        sec.dataset.state = "ghost";
      }
    }
    buildAll();
    later(fitAll, 300);
    say("okay, here’s everything", 2400);
  }

  // ---------------- buttons ----------------
  on(root, "click", (e) => {
    const toolBtn = e.target.closest("button[data-tool]");
    if (toolBtn) return setTool(toolBtn.dataset.tool);
    const ghost = e.target.closest("[data-build]");
    if (ghost) {
      userTouched();
      const id = ghost.dataset.build;
      goSection(id).then(() => build(id, true));
      return;
    }
    const go = e.target.closest("[data-go]");
    if (go) {
      userTouched();
      goSection(go.dataset.go);
      return;
    }
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const a = b.dataset.act;
    if (a === "play") startTour();
    else if (a === "toggle") (autoOn ? pauseAuto : resume)();
    else if (a === "skip") skip();
    else if (a === "restart") {
      stopTour(true);
      unbuildAll();
      goChapter(0, true);
    } else if (a === "stop") stopTour();
    else if (a === "next") goChapter(tour + 1, autoOn);
    else if (a === "prev") goChapter(tour - 1, autoOn);
    else if (a === "in") zoomBy(1.4);
    else if (a === "out") zoomBy(1 / 1.4);
    else if (a === "fit") fitAll();
    else if (a === "history") toggleHist();
    else if (a === "delete") del(sel);
    else if (a === "zoomsel" && sel) flyToEl(sel);
    else if (a === "shuffle" || a === "tidy") shuffle(b, a === "tidy");
    else if (a === "bio") copyBio(b);
  });

  // the bio card at the end: one click puts it on your clipboard
  async function copyBio(btn) {
    const text = btn.closest(".ac-bio").querySelector("p").textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const r = document.createRange();
      r.selectNodeContents(btn.closest(".ac-bio").querySelector("p"));
      getSelection().removeAllRanges();
      getSelection().addRange(r);
      return;
    }
    btn.classList.add("done");
    later(() => btn.classList.remove("done"), 2000);
    say("copied! paste away", 1800);
  }

  // ---------------- version history: scrub through every version of the page ----------------
  // Dragging the slider builds chapters up to that point (and takes later ones back down to
  // placeholders), then the camera frames the version you're on.
  const hist = $(".ac-hist");
  const histRange = hist.querySelector("input");
  const histV = hist.querySelector(".ac-hist-v");
  const ticks = [...hist.querySelectorAll(".ac-hist-ticks i")];
  const lastBuilt = () => TOUR.reduce((m, id, k) => (built.has(id) ? k : m), 0);
  function syncHist() {
    const k = Number(histRange.value);
    histV.textContent = `v${k} · ${CH[k].chapter}`;
    ticks.forEach((t, j) => {
      t.classList.toggle("on", built.has(TOUR[j]));
      t.classList.toggle("at", j === k);
    });
  }
  // finish a chapter that was mid-build, right now
  function finishNow(id) {
    const sec = secEl(id);
    for (const el of sec.querySelectorAll("[data-b]")) {
      for (const c of el._chars || []) c.classList.add("on");
      el.classList.remove("typing");
      finishItem(el, id);
    }
    if (!built.has(id)) markBuilt(id);
  }
  // take a chapter back down to its placeholder
  function unbuildOne(id) {
    if (id === "hello" || !built.has(id)) return;
    const sec = secEl(id);
    built.delete(id);
    if (sel && sec.contains(sel)) select(null);
    for (const el of sec.querySelectorAll("[data-b]")) {
      el.classList.remove("shown", "pinned", "filling", "pasted", "gone");
      el._layer?.remove();
      el._layer = null;
    }
    sec.dataset.state = "ghost";
    const li = secLayers[id];
    li.classList.add("empty");
    li.querySelector("small").textContent = "empty";
    const k = TOUR.indexOf(id);
    for (const j of [k - 1, k]) {
      const seg = segEls[j];
      if (!seg?.dataset.drawn) continue;
      delete seg.dataset.drawn;
      seg.style.strokeDashoffset = "1";
    }
    counted.delete(id);
    for (const b of sec.querySelectorAll("[data-count]"))
      b.textContent = `${b.dataset.pre}0${b.dataset.post}`;
    root.classList.remove("all-built");
    saveBuilt();
  }
  let histFlyT = null;
  function setVersion(k) {
    // the scrubber takes over: no tour, no hand-building in flight
    if (tour >= 0) stopTour(true);
    cursorRun++;
    epoch++;
    busy = 0;
    setAlexiTool(null);
    for (const b of world.querySelectorAll(".ac-draw, .ac-caret")) b.remove();
    TOUR.forEach((id, j) => {
      const state = secEl(id).dataset.state;
      if (j <= k) {
        if (state === "building") finishNow(id);
        else if (!built.has(id)) build(id, false);
      } else if (built.has(id) || state === "building") {
        if (state === "building") built.add(id);
        unbuildOne(id);
      }
    });
    syncHist();
    cancel(histFlyT);
    histFlyT = later(() => {
      if (phoneMode) return fly(chapterView(CH[k]), 0.9);
      const shown = CH.slice(0, k + 1);
      const x0 = Math.min(...shown.map((s) => s.x));
      const y0 = Math.min(...shown.map((s) => s.y));
      const x1 = Math.max(...shown.map((s) => s.x + s.w));
      const y1 = Math.max(...shown.map((s) => s.y + s.h));
      fly(
        frameFor({ x: x0, y: y0 - 60, w: x1 - x0, h: y1 - y0 + 60 }, 40),
        0.9,
      );
    }, 260);
  }
  on(histRange, "input", () => {
    userTouched();
    setVersion(Number(histRange.value));
  });
  function toggleHist(open) {
    const next = open ?? hist.dataset.open !== "true";
    hist.dataset.open = String(next);
    root.querySelector(".ac-hist-btn")?.classList.toggle("on", next);
    if (next) {
      histRange.value = String(lastBuilt());
      syncHist();
      say("drag through time", 1800);
    }
  }
  watchers.push(() => {
    if (hist.dataset.open === "true") syncHist();
  });

  // the pile toy: scatter the section's photos somewhere new, or put them back
  const homes = new Map();
  function shuffle(btn, tidy, byAlexi) {
    if (!byAlexi) userTouched();
    const sec = btn.closest("[data-sec]");
    const s = SEC[sec.dataset.sec];
    const photos = [...sec.querySelectorAll(".ac-ph")];
    photos.forEach((ph, k) => {
      if (!homes.has(ph))
        homes.set(ph, {
          l: ph.style.left,
          t: ph.style.top,
          r: ph.style.getPropertyValue("--r"),
        });
      const home = homes.get(ph);
      ph.style.setProperty("--d", `${k * 28}ms`);
      ph.classList.add("flying");
      if (tidy) {
        ph.style.left = home.l;
        ph.style.top = home.t;
        ph.style.setProperty("--r", home.r);
      } else {
        const w = ph.offsetWidth;
        const h = ph.offsetHeight;
        ph.style.left = `${Math.round(40 + Math.random() * (s.w - w - 80))}px`;
        ph.style.top = `${Math.round(60 + Math.random() * (s.h - h - 100))}px`;
        ph.style.setProperty("--r", `${(Math.random() - 0.5) * 18}deg`);
        ph.style.zIndex = ++zTop;
      }
    });
    later(
      () => {
        for (const ph of photos) ph.classList.remove("flying");
        placeSel();
      },
      900 + photos.length * 28,
    );
    if (byAlexi && !tidy) return;
    say(
      tidy
        ? "much better"
        : ["chaos", "nice", "better, actually", "again?"][
            Math.floor(Math.random() * 4)
          ],
      1800,
    );
  }

  // keep the view steady when the window changes size
  let lastSize = size();
  on(window, "resize", () => {
    if (layoutFor(vp.clientWidth < 700)) {
      lastSize = size();
      const v = chapterView(CH[Math.max(0, mostVisible())]);
      Object.assign(cam, v);
      apply();
      return;
    }
    const s = size();
    cam.x += (s.W - lastSize.W) / 2;
    cam.y += (s.H - lastSize.H) / 2;
    lastSize = s;
    clampCam(cam);
    apply();
  });

  // ---------------- arrival: the hello chapter builds itself, the rest wait as ghosts ----------------
  const firstView = () => {
    const h = SEC.hello;
    return phoneMode
      ? chapterView(h)
      : frameFor({ x: h.x - 60, y: h.y + 20, w: h.w + 300, h: h.h - 60 });
  };

  {
    const v = firstView();
    const { W, H } = size();
    // from home it opens almost where it'll rest, so the hero seems to turn into it
    const z = v.z * (phoneMode || fromHome ? 0.96 : 0.8);
    const cx = (W / 2 - v.x) / v.z;
    const cy = (H / 2 - v.y) / v.z;
    Object.assign(cam, { z, x: W / 2 - cx * z, y: H / 2 - cy * z });
    apply();
  }
  const restored = restore();
  let arrived = false;
  async function arrive() {
    if (arrived || !alive) return;
    arrived = true;
    root.classList.add("in");
    if (restored) {
      // a return visit: everything you'd built is here; show you the lot
      fly(
        restored === TOUR.length
          ? frameFor({ x: 0, y: 0, w: WORLD.w, h: WORLD.h }, 40)
          : firstView(),
        1.5,
      );
      await wait(1100);
      if (!alive) return;
      const play = root.querySelector(".ac-play-big");
      setA(spotOf(play).x + 300, spotOf(play).y + 200);
      alexi.classList.add("on");
      goTo(
        play,
        restored === TOUR.length
          ? "welcome back. want to watch it again?"
          : "welcome back, let’s keep going",
        3600,
      );
      if (!reduce) later(wander, 8000);
      later(() => hintEl.classList.add("gone"), 9000);
      return;
    }
    fly(firstView(), fromHome ? 0.8 : 1.5);
    await wait(fromHome ? 60 : 900);
    const h1 = root.querySelector(".ac-hello h1");
    const s = spotOf(h1);
    setA(s.x + (fromHome ? 520 : 260), s.y + (fromHome ? 200 : 340));
    alexi.classList.add("on");
    await build("hello", true, { wordsIn: fromHome });
    if (!alive) return;
    if (tour < 0 && !busy) {
      const play = root.querySelector(".ac-play-big");
      goTo(play, "want the tour? i’ll build the rest as we go", 4200);
    }
    if (!reduce) later(wander, 8000);
    later(() => hintEl.classList.add("gone"), 12000);
  }
  if (getPreloaderReady()) arrive();
  else
    on(window, PRELOADER_READY_EVENT, () => later(arrive, 150), { once: true });
  const failsafe = setInterval(() => {
    if (arrived) return clearInterval(failsafe);
    if (getPreloaderReady()) arrive();
  }, 600);
  signal.addEventListener("abort", () => clearInterval(failsafe));

  if (process.env.NODE_ENV !== "production")
    window.__about = () => ({
      busy,
      tour,
      autoOn,
      cursorRun,
      built: [...built],
    });

  return () => {
    alive = false;
    ac.abort();
    stopAll();
    cancelAnimationFrame(mvRaf);
    for (const t of timers) clearTimeout(t);
    cancel(wanderT);
  };
}
