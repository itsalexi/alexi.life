"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SiteHeader from "../frame/SiteHeader";
import "../home/home.css";
import "../frame/frame.css";
import "./about.css";
import { socials } from "../../config/socials";
import { mountAbout } from "./aboutCanvas";
import { BIO, IMG, pathSegments, SECTIONS, TOUR, WORLD } from "./content";

const AVATAR = "/avatar.webp";

// ---------- the toys: small things from each era that still work ----------

// Age 7: the Visual Basic form. Three radio buttons, one picture.
function VBToy() {
  const pics = [IMG.baby, IMG.meFace, IMG.castle];
  const [k, setK] = useState(0);
  return (
    <div className="toy vb">
      <div className="vb-bar">
        <span>Form1</span>
        <span className="vb-x" aria-hidden="true">
          <i>_</i>
          <i>□</i>
          <i>×</i>
        </span>
      </div>
      <div className="vb-body">
        <div className="vb-pic">
          {pics.map((pic, j) => (
            <Image
              key={pic.src}
              src={pic.src}
              alt=""
              width={pic.w}
              height={pic.h}
              sizes="240px"
              className={j === k ? "on" : undefined}
            />
          ))}
        </div>
        <fieldset className="vb-opts">
          <legend>Frame1</legend>
          {["Option1", "Option2", "Option3"].map((label, j) => (
            <label key={label}>
              <input
                type="radio"
                name="vb"
                checked={j === k}
                onChange={() => setK(j)}
              />
              {label}
            </label>
          ))}
        </fieldset>
      </div>
    </div>
  );
}

// IcyFox: a browser copied seven times over.
const ICY_NOTES = [
  "a homepage, mostly",
  "it has tabs now",
  "tabs that close!",
  "bookmarks",
  "a logo, finally",
  "faster, I think",
  "basically Firefox. basically.",
];
function IcyToy() {
  const [v, setV] = useState(7);
  return (
    <div className="toy icy">
      <div className="icy-tabs">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            key={n}
            type="button"
            className={n === v ? "on" : undefined}
            onClick={() => setV(n)}
            aria-pressed={n === v}
          >
            v{n}
          </button>
        ))}
      </div>
      <div className="icy-url">
        <span aria-hidden="true">←</span>
        <span aria-hidden="true">→</span>
        <span className="icy-addr">icyfox://home</span>
      </div>
      <div className="icy-page" style={{ "--v": v }}>
        <p className="icy-logo" key={v}>
          IcyFox
        </p>
        <p className="icy-ver">version {v} of 7</p>
        <p className="icy-note">{ICY_NOTES[v - 1]}</p>
      </div>
    </div>
  );
}

// 2020: the Odin Project sketchpad, a "hi" already on it.
const HI = [
  "................",
  "................",
  "................",
  "...#.......#....",
  "...#............",
  "...#.......#....",
  "...###.....#....",
  "...#..#....#....",
  "...#..#....#....",
  "...#..#....#....",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
]
  .join("")
  .split("")
  .map((c) => (c === "#" ? 3 : 0));
function SketchToy() {
  const grid = useRef(null);
  const down = useRef(false);
  const [cells, setCells] = useState(HI);
  const paint = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const i = el?.dataset?.i;
    if (i == null || !grid.current?.contains(el)) return;
    setCells((c) => {
      if (c[i] >= 3) return c;
      const next = c.slice();
      next[i] += 1;
      return next;
    });
  };
  return (
    <div className="toy sk">
      <div
        ref={grid}
        className="sk-grid"
        onPointerDown={(e) => {
          down.current = true;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          paint(e);
        }}
        onPointerMove={(e) => down.current && paint(e)}
        onPointerUp={() => {
          down.current = false;
        }}
        role="img"
        aria-label="A sketchpad you can draw on"
      >
        {cells.map((c, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a fixed grid, cells never move
          <i key={i} data-i={i} data-c={c} />
        ))}
      </div>
      <div className="sk-bar">
        <span>16 × 16</span>
        <button type="button" onClick={() => setCells(new Array(256).fill(0))}>
          Clear
        </button>
      </div>
    </div>
  );
}

// Wix days: a page about games and toys, in full 2010s glory.
function WixToy() {
  const [hits, setHits] = useState(1337);
  return (
    <div className="toy wix">
      <div className="wix-top">
        <span>★ ALEXI’S GAMES &amp; TOYS ★</span>
      </div>
      <div className="wix-marq" aria-hidden="true">
        <span>
          welcome to my website!!! &nbsp; new: lego reviews &nbsp; coming soon:
          more games &nbsp; sign my guestbook &nbsp; welcome to my website!!!
          &nbsp; new: lego reviews &nbsp;
        </span>
      </div>
      <div className="wix-body">
        <ul>
          <li>My favorite games</li>
          <li>Toys I want</li>
          <li>Cheat codes (real)</li>
        </ul>
        <div className="wix-side">
          <p className="wix-uc">UNDER CONSTRUCTION</p>
          <button type="button" onClick={() => setHits((h) => h + 1)}>
            visitors: <b>{String(hits).padStart(6, "0")}</b>
          </button>
        </div>
      </div>
    </div>
  );
}

// The QPI what-if: tap a grade to cycle it, watch the QPI move.
const GRADES = [
  ["A", 4],
  ["B+", 3.5],
  ["B", 3],
  ["C+", 2.5],
  ["C", 2],
  ["D", 1],
  ["F", 0],
];
const COURSES = [
  ["Data Structures", 3],
  ["Calculus", 3],
  ["Theology", 3],
  ["PE", 2],
];
const vibe = (q) =>
  q >= 3.87
    ? "summa vibes"
    : q >= 3.5
      ? "magna vibes"
      : q >= 3.2
        ? "cum laude vibes"
        : q >= 2.5
          ? "you’re fine"
          : "it’s okay, finals exist";
function QPIToy() {
  const [g, setG] = useState([1, 0, 2, 0]);
  const units = COURSES.reduce((t, c) => t + c[1], 0);
  const qpi =
    COURSES.reduce((t, c, i) => t + c[1] * GRADES[g[i]][1], 0) / units;
  return (
    <div className="toy qpi">
      <div className="qpi-list">
        {COURSES.map(([name, u], i) => (
          <div key={name} className="qpi-row">
            <span>
              {name}
              <small>{u} units</small>
            </span>
            <button
              type="button"
              onClick={() =>
                setG((cur) =>
                  cur.map((x, j) => (j === i ? (x + 1) % GRADES.length : x)),
                )
              }
              aria-label={`${name}: ${GRADES[g[i]][0]}, tap to change`}
              data-g={GRADES[g[i]][0]}
            >
              {GRADES[g[i]][0]}
            </button>
          </div>
        ))}
      </div>
      <div className="qpi-out">
        <small>Your QPI</small>
        <b key={qpi.toFixed(2)}>{qpi.toFixed(2)}</b>
        <span>{vibe(qpi)}</span>
      </div>
    </div>
  );
}

// Off the clock: the photos are a pile. Shake it up, or put it back.
function PileToy() {
  return (
    <div className="toy pile">
      <button type="button" className="pile-go" data-act="shuffle">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 3h5v5" />
          <path d="M4 20 21 3" />
          <path d="M21 16v5h-5" />
          <path d="M15 15l6 6" />
          <path d="M4 4l5 5" />
        </svg>
        Shuffle the pile
      </button>
      <button type="button" className="pile-tidy" data-act="tidy">
        Tidy up
      </button>
    </div>
  );
}

const TOYS = {
  vb: [VBToy, "click the radios"],
  icy: [IcyToy, "flip through the versions"],
  sketch: [SketchToy, "draw something"],
  wix: [WixToy, "it has a visitor counter"],
  qpi: [QPIToy, "tap a grade"],
  pile: [PileToy, "go ahead, shuffle them"],
};

// ---------- pieces of the canvas ----------
// Everything that gets "built" carries data-b; the controller reveals those one by one.

function Pin({ text }) {
  return (
    <span className="ac-pin">
      <Image src={AVATAR} alt="" width={52} height={52} />
      <em>{text}</em>
    </span>
  );
}

function Photo({ ph }) {
  return (
    <figure
      className={`ac-fr ac-ph${ph.w / ph.h > 1.25 ? " is-wide" : ""}`}
      data-b
      data-kind="image"
      data-name={ph.name}
      data-drag
      data-frame
      data-cur={ph.cur}
      data-confetti={ph.confetti ? "" : undefined}
      style={{
        left: ph.x,
        top: ph.y,
        width: ph.width,
        "--r": `${ph.rot}deg`,
      }}
    >
      <figcaption className="ac-fn">{ph.name}</figcaption>
      <div
        className="ac-img"
        style={{ height: ph.height, "--ar": `${ph.w} / ${ph.h}` }}
      >
        <Image
          src={ph.src}
          alt={ph.name?.replace(/\.[a-z]+$/, "").replace(/-/g, " ") || ""}
          width={ph.w}
          height={ph.h}
          sizes={`${Math.round(ph.width * 1.6)}px`}
          draggable={false}
        />
      </div>
      {ph.pin ? <Pin text={ph.pin} /> : null}
      <span className="ac-dim" />
    </figure>
  );
}

function Toy({ t, inCol }) {
  const [Comp, line] = TOYS[t.kind];
  return (
    <div
      className={`ac-fr ac-toy is-${t.kind}${inCol ? " in-col" : ""}`}
      data-b
      data-kind="component"
      data-name={t.name}
      data-frame
      data-nopan
      data-cur={line}
      style={inCol ? undefined : { left: t.x, top: t.y, width: t.w }}
    >
      <p className="ac-fn">
        <span>{t.name}</span>
        <span>{t.when}</span>
      </p>
      <Comp />
      {t.pin ? <Pin text={t.pin} /> : null}
    </div>
  );
}

function Words({ s }) {
  return (
    <div className="ac-words" data-b data-kind="text" data-name="Headline">
      <p className="ac-mono">{s.mono}</p>
      <h2>
        <b>{s.title}</b> {s.line}
      </h2>
      {s.link ? (
        <Link href={s.link.href} className="ac-link">
          {s.link.label} <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </div>
  );
}

function Hello() {
  return (
    <div className="ac-hello">
      <p className="ac-mono" data-b data-kind="text" data-name="Kicker">
        Manila · 19 · product engineer · PH100 2026
      </p>
      <h1 data-b data-kind="text" data-name="Hello">
        <b>Hi, I’m Alexi.</b> I build software for problems I’ve seen up close.
      </h1>
      <div
        className="ac-hello-cta"
        data-b
        data-kind="group"
        data-name="Buttons"
      >
        <button type="button" className="ac-play-big" data-act="play">
          <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 1.5 L10.5 6 L2.5 10.5 Z" fill="currentColor" />
          </svg>
          <span className="ac-new">Show me around</span>
          <span className="ac-again-l">Watch it again</span>
        </button>
        <button type="button" className="ac-skip" data-act="skip">
          or just show me everything
        </button>
      </div>
    </div>
  );
}

function End() {
  return (
    <div className="ac-end">
      <p className="ac-mono" data-b data-kind="text" data-name="Kicker">
        Manila · always building
      </p>
      <h2 data-b data-kind="text" data-name="Sign-off">
        <b>That’s it for now.</b> If you’re building something, I’d love to hear
        about it.
      </h2>
      <div className="ac-end-links" data-b data-kind="group" data-name="Links">
        <Link href="/?hi=1" className="ac-hi">
          Say hi <span aria-hidden="true">→</span>
        </Link>
        <a href={socials.github} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <a href={socials.linkedin} target="_blank" rel="noreferrer">
          LinkedIn ↗
        </a>
        <a href={socials.instagram} target="_blank" rel="noreferrer">
          Instagram ↗
        </a>
        <button type="button" data-act="restart" className="ac-again">
          Watch it again
        </button>
      </div>
      <figure className="ac-bio" data-b data-kind="group" data-name="bio.txt">
        <figcaption>
          <span>bio.txt</span>
          <button type="button" data-act="bio">
            <span className="ac-bio-copy">Copy bio</span>
            <span className="ac-bio-done">Copied</span>
          </button>
        </figcaption>
        <p>{BIO}</p>
      </figure>
    </div>
  );
}

function Section({ s, i }) {
  return (
    <section
      className={`ac-sec${s.bare ? " bare" : ""}`}
      data-sec={s.id}
      data-state="ghost"
      aria-label={s.chapter}
      style={{
        left: s.x,
        top: s.y,
        width: s.w,
        height: s.h,
        "--sc": s.color,
        "--sk": s.ink,
        "--sr": `${s.rot || 0}deg`,
        "--i": i,
      }}
    >
      {s.label ? (
        <button type="button" className="ac-label" data-go={s.id}>
          {s.label}
        </button>
      ) : null}
      {s.id !== "hello" ? (
        <button type="button" className="ac-ghost" data-build={s.id}>
          <span aria-hidden="true">+</span>
          Build {s.chapter === "Say hi" ? "the ending" : s.chapter}
        </button>
      ) : null}

      {s.id === "hello" ? <Hello /> : null}
      {s.id === "end" ? <End /> : null}
      {s.words ? (
        // the words and everything that hangs off them flow in one column, so nothing collides
        <div
          className="ac-col"
          style={{ left: s.words.x, top: s.words.y, width: s.words.w }}
        >
          <Words s={s} />

          {s.beliefs ? (
            <div className="ac-beliefs">
              {s.beliefs.map((b) => (
                <div
                  key={b.title}
                  className="ac-belief"
                  data-b
                  data-kind="component"
                  data-name={b.title.replace(/\.$/, "")}
                  data-cur="◆ main component"
                >
                  <span className="ac-comp">
                    <i aria-hidden="true">◆</i> Component
                  </span>
                  <p className="ac-belief-h">{b.title}</p>
                  <p className="ac-belief-p">{b.line}</p>
                </div>
              ))}
            </div>
          ) : null}

          {s.logos ? (
            <div className="ac-logos">
              {s.logos.map((l) => (
                <Link
                  key={l.name}
                  href={l.href}
                  className="ac-logo"
                  data-b
                  data-kind="image"
                  data-name={l.name}
                  data-cur={l.pin}
                >
                  <span className="ac-logo-ic" style={{ background: l.bg }}>
                    <Image src={l.src} alt="" width={120} height={120} />
                  </span>
                  <b>{l.name}</b>
                  <small>{l.when}</small>
                  {l.pin ? <Pin text={l.pin} /> : null}
                </Link>
              ))}
            </div>
          ) : null}

          {s.points ? (
            <ul
              className="ac-points"
              data-b
              data-kind="text"
              data-name="Highlights"
            >
              {s.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          ) : null}

          {s.counters ? (
            <div
              className="ac-counters"
              data-b
              data-kind="text"
              data-name="Numbers"
            >
              {s.counters.map((c) => (
                // each number keeps the width of its final value, so counting never reflows
                <div
                  key={c.label}
                  style={{
                    "--final": `${`${c.pre || ""}${c.to.toLocaleString("en-US")}${c.post || ""}`.length}ch`,
                  }}
                >
                  <b
                    data-count={c.to}
                    data-pre={c.pre || ""}
                    data-post={c.post || ""}
                  >
                    {c.pre || ""}0{c.post || ""}
                  </b>
                  <small>{c.label}</small>
                </div>
              ))}
            </div>
          ) : null}
          {s.toys
            ?.filter((t) => t.col)
            .map((t) => (
              <Toy key={t.kind} t={t} inCol />
            ))}
        </div>
      ) : null}

      {s.photos?.map((ph) => (
        <Photo key={ph.key} ph={ph} />
      ))}
      {s.toys
        ?.filter((t) => !t.col)
        .map((t) => (
          <Toy key={t.kind} t={t} />
        ))}
    </section>
  );
}

export default function AboutPage() {
  const root = useRef(null);
  useEffect(() => mountAbout(root.current), []);
  const ms = 150 / WORLD.w;
  const segs = pathSegments();

  return (
    <div className="alx alx-page ac-page" ref={root}>
      <SiteHeader />
      <div className="ac-vp">
        <div className="ac-dots" aria-hidden="true" />
        <div className="ac-world" style={{ width: WORLD.w, height: WORLD.h }}>
          <svg
            className="ac-path"
            width={WORLD.w}
            height={WORLD.h}
            viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
            aria-hidden="true"
          >
            {segs.map((d) => (
              <path key={`b${d}`} d={d} className="base" />
            ))}
            {segs.map((d, k) => (
              <path
                key={`s${d}`}
                d={d}
                className="seg"
                data-seg={k}
                pathLength="1"
              />
            ))}
          </svg>
          {SECTIONS.map((s, i) => (
            <Section key={s.id} s={s} i={i} />
          ))}
          <div className="ac-cmts" />
          <div className="ac-alexi" aria-hidden="true">
            <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true">
              <path
                d="M1.5 1.5 L16 9.2 L9.4 10.8 L6.6 17.6 Z"
                fill="#5470ff"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            <span className="nm">
              <i className="tool" />
              Alexi
            </span>
            <span className="chat" />
          </div>
        </div>
      </div>

      <div className="ac-fx" aria-hidden="true" />
      <span className="ac-you" aria-hidden="true">
        <span>You</span>
      </span>

      <p className="ac-hint" aria-hidden="true">
        <span className="h-desk">
          drag anywhere to look around · click a photo to pick it up · ⌘-scroll
          to zoom
        </span>
        <span className="h-touch">
          drag to look around · pinch to zoom · tap a photo
        </span>
      </p>

      <div className="ac-bar" data-mode="free">
        <div className="ac-free">
          <span className="ac-tools">
            <button
              type="button"
              data-tool="move"
              className="on"
              aria-label="Move (V)"
              title="Move · V"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 3l14 7.5-6.2 1.6L10 18.5z" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              data-tool="hand"
              aria-label="Hand (H)"
              title="Hand · H"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 11V6a2 2 0 0 0-4 0v1" />
                <path d="M14 10V4a2 2 0 0 0-4 0v2" />
                <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
            </button>
            <button
              type="button"
              data-tool="comment"
              aria-label="Comment (C)"
              title="Comment · C"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3a8.5 8.5 0 0 0-8.5 8.5c0 4.7 3.8 8.5 8.5 8.5H20.5v-8.5A8.5 8.5 0 0 0 12 3z" />
              </svg>
            </button>
          </span>
          <i className="ac-sep" />
          <button
            type="button"
            data-act="history"
            className="ac-hist-btn"
            aria-label="Version history"
            title="Version history"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l3 2" />
            </svg>
          </button>
          <button type="button" className="ac-play" data-act="play">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2.5 1.5 L10.5 6 L2.5 10.5 Z" fill="currentColor" />
            </svg>
            <span className="ac-long ac-new">Show me around</span>
            <span className="ac-long ac-again-l">Watch it again</span>
            <span className="ac-short">Play</span>
          </button>
          <button type="button" data-act="skip" className="ac-txt ac-skip-btn">
            Skip
          </button>
          <i className="ac-sep" />
          <button type="button" data-act="out" aria-label="Zoom out">
            −
          </button>
          <span className="ac-zoom">100%</span>
          <button type="button" data-act="in" aria-label="Zoom in">
            +
          </button>
          <i className="ac-sep" />
          <button type="button" data-act="fit" className="ac-txt">
            Fit
          </button>
        </div>
        <div className="ac-tour">
          <button type="button" data-act="prev" aria-label="Previous chapter">
            ‹
          </button>
          <span className="ac-chap">
            <i />
            <b>Hello</b>
            <small>1 / {TOUR.length}</small>
            <span className="ac-prog">
              <i />
            </span>
          </span>
          <button type="button" data-act="next" aria-label="Next chapter">
            ›
          </button>
          <button
            type="button"
            data-act="toggle"
            className="ac-toggle"
            aria-label="Pause"
          >
            <svg
              className="i-pause"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden="true"
            >
              <rect
                x="2.5"
                y="2"
                width="3"
                height="10"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="8.5"
                y="2"
                width="3"
                height="10"
                rx="1"
                fill="currentColor"
              />
            </svg>
            <svg
              className="i-play"
              width="14"
              height="14"
              viewBox="0 0 12 12"
              aria-hidden="true"
            >
              <path d="M2.5 1.5 L10.5 6 L2.5 10.5 Z" fill="currentColor" />
            </svg>
            <span>Resume</span>
          </button>
          <i className="ac-sep" />
          <button type="button" data-act="skip" className="ac-txt">
            Skip
          </button>
          <button type="button" data-act="stop" className="ac-txt">
            Done
          </button>
        </div>
      </div>

      <div className="ac-hist" data-open="false">
        <p className="ac-hist-h">
          <span>Version history</span>
          <output className="ac-hist-v">Hello</output>
        </p>
        <div className="ac-hist-track">
          <input
            type="range"
            min={0}
            max={TOUR.length - 1}
            step={1}
            defaultValue={0}
            aria-label="Scrub through every version"
          />
          <div className="ac-hist-ticks" aria-hidden="true">
            {SECTIONS.map((s, k) => (
              <i
                key={s.id}
                data-k={k}
                style={{
                  left: `${(k / (SECTIONS.length - 1)) * 100}%`,
                  "--sc": s.color || "var(--gray)",
                }}
              />
            ))}
          </div>
        </div>
        <p className="ac-hist-ends" aria-hidden="true">
          <span>First version</span>
          <span>Latest</span>
        </p>
      </div>

      <aside className="ac-layers" aria-label="Layers">
        <p className="ac-panel-h">
          <span>Layers</span>
          <small>about.fig</small>
        </p>
        <ul className="ac-layer-list" />
      </aside>

      <aside className="ac-props" aria-label="Design" data-open="false">
        <p className="ac-panel-h">
          <span className="ac-props-name">Frame</span>
          <small className="ac-props-kind">Image</small>
        </p>
        <div className="ac-props-grid">
          <label>
            <span>X</span>
            <output data-p="x">0</output>
          </label>
          <label>
            <span>Y</span>
            <output data-p="y">0</output>
          </label>
          <label>
            <span>W</span>
            <output data-p="w">0</output>
          </label>
          <label>
            <span>H</span>
            <output data-p="h">0</output>
          </label>
          <label className="wide">
            <span>↻</span>
            <input data-p="r" type="number" step="1" />
            <em>°</em>
          </label>
        </div>
        <div className="ac-props-acts">
          <button type="button" data-act="zoomsel">
            Zoom to
          </button>
          <button type="button" data-act="delete">
            Delete
          </button>
        </div>
        <p className="ac-props-hint">drag to move · ⌫ delete · ⌘Z undo</p>
      </aside>

      <nav className="ac-mini" aria-label="Minimap">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            data-go={s.id}
            aria-label={`Go to ${s.chapter}`}
            style={{
              left: s.x * ms,
              top: s.y * ms,
              width: s.w * ms,
              height: s.h * ms,
              "--sc": s.color || "var(--mute)",
            }}
          />
        ))}
        <i className="ac-mini-vp" />
      </nav>
    </div>
  );
}
