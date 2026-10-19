// Home preloader choreography, after Alexi's cursor has drawn the signature:
// it drags a Figma marquee around it, handles pop on, the cursor chat types "hi",
// and on reveal the selection zooms out to frame the whole page.
import { animate, stagger } from "motion";

// The selection, in the signature box's own coordinates (the svg is 80×80).
const BOX = { left: -6, top: 4, width: 88, height: 68 };

const wait = (ms, signal) =>
  new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        resolve();
      },
      { once: true },
    );
  });

const penAt = (pen) => {
  const m = new DOMMatrix(getComputedStyle(pen).transform);
  return { x: m.e, y: m.f };
};
const placePen = (pen, x, y) => {
  pen.style.transform = `translate(${x}px, ${y}px)`;
};
// tween a 0→1 progress and let the caller lay things out from it
const tween = (opts, onUpdate) => animate(0, 1, { ...opts, onUpdate });

export async function selectSignature({ pen, select, bar, signal }) {
  if (!pen || !select) return;
  const chip = select.querySelector("em");
  const handles = select.querySelectorAll("i");
  const chat = pen.querySelector("em");
  const text = chat.textContent;
  chat.textContent = "";

  // 1. the cursor eases over to the top-left corner of where the selection will start
  const from = penAt(pen);
  const start = { x: BOX.left, y: BOX.top };
  await tween({ duration: 0.5, ease: [0.45, 0, 0.2, 1] }, (p) =>
    placePen(
      pen,
      from.x + (start.x - from.x) * p,
      from.y + (start.y - from.y) * p,
    ),
  ).finished;
  if (signal.aborted) return;

  // 2. it drags a marquee to the bottom-right; the box grows with the cursor
  Object.assign(select.style, {
    left: `${BOX.left}px`,
    top: `${BOX.top}px`,
    width: "0px",
    height: "0px",
    opacity: 1,
  });
  await tween({ duration: 0.75, ease: [0.3, 0, 0.2, 1] }, (p) => {
    const w = BOX.width * p;
    const h = BOX.height * p;
    select.style.width = `${w}px`;
    select.style.height = `${h}px`;
    placePen(pen, BOX.left + w, BOX.top + h);
  }).finished;
  if (signal.aborted) return;

  // the selection landing finishes the load
  if (bar)
    animate(bar, { scaleX: 1 }, { duration: 0.6, ease: [0.22, 1, 0.36, 1] });

  // 3. let go: the marquee fill clears, handles pop on one by one, the layer name slides in
  animate(
    select,
    { backgroundColor: "rgba(13, 153, 255, 0)" },
    { duration: 0.4 },
  );
  animate(
    handles,
    { scale: [0, 1] },
    { duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: stagger(0.05) },
  );
  animate(
    chip,
    { opacity: [0, 1], y: [-4, 0] },
    { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.18 },
  );

  // 4. the cursor steps off the corner and types into its chat
  const end = { x: BOX.left + BOX.width, y: BOX.top + BOX.height };
  tween({ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }, (p) =>
    placePen(pen, end.x + 16 * p, end.y + 10 * p),
  );
  await wait(320, signal);
  animate(
    chat,
    { opacity: [0, 1], scale: [0.9, 1] },
    { duration: 0.25, ease: "easeOut" },
  );
  for (let i = 1; i <= text.length && !signal.aborted; i++) {
    chat.textContent = text.slice(0, i);
    await wait(i === 1 ? 120 : 42, signal);
  }
  await wait(650, signal);
}

// Reveal: the selection grows out to frame the viewport, then lets go of the page.
export function zoomSelectionToFit({ wrapper, select, pen, bar }) {
  if (!wrapper || !select) return;
  // hand the cursor to the page: its own cursor starts exactly where this one stands
  if (pen) {
    const p = pen.getBoundingClientRect();
    window.__alxCursorHandoff = { x: p.left, y: p.top };
  }
  // the chat and the layer name drift up and fade (they were shown inline, so fade them here)
  const words = [pen?.querySelector("em"), select.querySelector("em")].filter(
    Boolean,
  );
  animate(
    words,
    { opacity: 0, y: -6, scale: 0.96 },
    { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  );
  // the loading bar is done; it fades as the page frames in
  if (bar) animate(bar, { opacity: 0 }, { duration: 0.4, ease: "easeOut" });
  const r = wrapper.getBoundingClientRect();
  const inset = 14;
  const a = {
    left: BOX.left,
    top: BOX.top,
    width: BOX.width,
    height: BOX.height,
  };
  const b = {
    left: inset - r.left,
    top: inset - r.top,
    width: innerWidth - inset * 2,
    height: innerHeight - inset * 2,
  };
  tween({ duration: 0.85, ease: [0.65, 0, 0.25, 1] }, (p) => {
    for (const k of ["left", "top", "width", "height"])
      select.style[k] = `${a[k] + (b[k] - a[k]) * p}px`;
  });
  animate(
    select,
    { opacity: 0 },
    { duration: 0.35, delay: 0.75, ease: "easeIn" },
  );
}
