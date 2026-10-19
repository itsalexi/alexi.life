"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { socials } from "../../config/socials";
import { beginSceneLoad } from "../../lib/sceneReadiness";
import { mountHome } from "./homeController";
import "./home.css";

const pad = (n) => String(n).padStart(2, "0");

const PILLS = [
  {
    name: "Casper Studios",
    logo: "/images/home/casper.jpg",
    bg: "linear-gradient(120deg,#6d2cf5,#d63af0)",
    ink: "#fff",
  },
  {
    name: "NextPay",
    logo: "/images/logos/nextpay.webp",
    bg: "#5470ff",
    ink: "#fff",
    alt: true,
  },
  {
    name: "Swarm",
    logo: "/images/logos/swarm.webp",
    bg: "#0b0b18",
    ink: "#fff",
  },
  {
    name: "Bytespace",
    logo: "/images/logos/bytespace.webp",
    bg: "#f1ead9",
    ink: "#1d1d1f",
    alt: true,
  },
];

function Pill({ pill }) {
  return (
    <button
      type="button"
      className={pill.alt ? "pill alt" : "pill"}
      data-open="0"
      data-cur=""
      style={{ "--b": pill.bg, "--i": pill.ink }}
    >
      <Image src={pill.logo} alt="" width={40} height={40} />
      {pill.name}
    </button>
  );
}

function Cursor({ color, children }) {
  return (
    <>
      <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true">
        <path
          d="M1.5 1.5 L16 9.2 L9.4 10.8 L6.6 17.6 Z"
          fill={color}
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </>
  );
}

function FrameMedia({ item, className, sizes }) {
  if (item.logo) {
    return (
      <div
        className={`${className} logo${item.wide ? " wide" : ""}`}
        style={{ background: item.bg }}
      >
        <Image
          src={item.logo}
          alt=""
          width={240}
          height={item.wide ? 120 : 240}
        />
      </div>
    );
  }
  return (
    <div className={className}>
      <Image src={item.img} alt="" fill sizes={sizes} />
    </div>
  );
}

function Folder({ folder }) {
  const lead = folder.items[0];
  return (
    <div className="unit" style={{ "--c": folder.color, "--k": folder.ink }}>
      <button
        type="button"
        className="tab"
        role="tab"
        aria-selected="false"
        data-cur={folder.chat}
      >
        {folder.name}
        <small>{pad(folder.items.length)}</small>
      </button>
      <div className="body">
        <div className="papers" aria-hidden="true">
          <i />
          <i />
        </div>
        <div
          className={lead.logo ? "print logo" : "print"}
          style={lead.logo ? { background: lead.bg } : undefined}
          aria-hidden="true"
        >
          <Image src={lead.logo || lead.img} alt="" width={300} height={188} />
        </div>
        <div className="band">
          <span className="blurb">{folder.blurb}</span>
          <span className="end">
            <span className="files">{pad(folder.items.length)} FILES</span>
            <button type="button" className="x" aria-label="Close folder">
              ✕
            </button>
          </span>
        </div>
        <div className="sheet">
          <div className="inner">
            <div className="canvas">
              <div className="world">
                {folder.items.map((item, k) => (
                  // biome-ignore lint/a11y/useSemanticElements: a frame holds block content (label, image, pin); the controller handles click and Enter.
                  <div
                    key={item.title}
                    className="frame"
                    data-k={k}
                    role="button"
                    tabIndex={-1}
                    aria-label={`${item.title}, ${item.meta}`}
                  >
                    <div className="fn">
                      <span>{item.title}</span>
                      <span>{item.res || item.when}</span>
                    </div>
                    <FrameMedia
                      item={item}
                      className="fb"
                      sizes="(max-width: 900px) 90vw, 60vw"
                    />
                    <div className="ol">
                      <b />
                      <b />
                      <b />
                      <b />
                    </div>
                    <span className="dim" />
                    {item.note ? (
                      <span className="pin">
                        <Image
                          src="/avatar.webp"
                          alt=""
                          width={52}
                          height={52}
                        />
                        <em>{item.note}</em>
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="cap" />
              <button type="button" className="zoom">
                100%
              </button>
            </div>
            <div className="grid">
              <div className="rest-list">
                {folder.items.map((item) => (
                  <Link key={item.title} className="row" href={item.href}>
                    <FrameMedia item={item} className="thumb" sizes="90vw" />
                    <div>
                      <p className="t">
                        <b>{item.title}.</b> {item.line}
                      </p>
                      <div className="rm">
                        {item.res ? (
                          <>
                            <span>{item.res}</span>·
                          </>
                        ) : null}
                        <span>{item.meta}</span>
                        <span className="when">{item.when}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeScreen({ folders }) {
  const rootRef = useRef(null);
  const router = useRouter();

  // The preloader waits for the home "scene"; this page has no 3D, so it's ready once mounted.
  useEffect(() => {
    beginSceneLoad("home")("ready");
  }, []);

  useEffect(
    () =>
      mountHome(rootRef.current, {
        folders,
        email: socials.email,
        navigate: (href) => router.push(href),
      }),
    [folders, router],
  );

  return (
    <div className="alx" ref={rootRef}>
      <header>
        <div className="me">
          <Image src="/avatar.webp" alt="" width={56} height={56} />
          Alexi Canamo
        </div>
        <div className="clock" data-role="clock">
          MANILA
        </div>
        <div className="hr">
          <a href={socials.resume} target="_blank" rel="noreferrer">
            Résumé
          </a>
          <button type="button" data-role="copy-top">
            Copy email
          </button>
        </div>
      </header>

      <section className="hero">
        <h1>
          I{" "}
          <span
            className="photo"
            role="img"
            aria-label="Alexi, drinking matcha"
            data-cur="that's me, matcha in hand"
          />{" "}
          build things people{" "}
          <span className="sel" data-cur="">
            actually use.
            <i />
            <b />
            <b />
            <b />
            <b />
            <em>Headline</em>
          </span>
        </h1>
        <p className="para">
          <strong>I’m Alexi, 19, a product and AI engineer in Manila.</strong>{" "}
          Right now I’m an AI engineering intern at <Pill pill={PILLS[0]} />.
          Before that, I built at <Pill pill={PILLS[1]} />,{" "}
          <Pill pill={PILLS[2]} /> and <Pill pill={PILLS[3]} />.
        </p>
        <p className="links">
          <a href={socials.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={socials.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <button type="button" className="mail" data-role="mail">
            {socials.email}
          </button>
          <span className="kb">
            press <kbd>/</kbd> to say hi
          </span>
        </p>
      </section>

      <section className="drawer" aria-label="Folders">
        <div className="col" role="tablist">
          {folders.map((folder) => (
            <Folder key={folder.name} folder={folder} />
          ))}
        </div>
      </section>

      <div className="you">
        <Cursor color="#ff4f8b">
          <span className="bub">
            <input
              maxLength={80}
              placeholder="Say something"
              aria-label="Message Alexi"
            />
          </span>
          <span className="sz" />
          <span className="tip">enter to email it · esc</span>
        </Cursor>
      </div>
      <div className="hsel" aria-hidden="true">
        <span />
      </div>
      <output className="toast">
        <span>Copied to clipboard</span>
        <em>{socials.email}</em>
      </output>
      <div className="mp" aria-hidden="true">
        <Cursor color="#5470ff">
          <span className="nm">Alexi</span>
          <span className="chat" />
        </Cursor>
      </div>
    </div>
  );
}
