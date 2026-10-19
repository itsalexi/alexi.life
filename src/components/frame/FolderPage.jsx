import Image from "next/image";
import Link from "next/link";
import "../home/home.css";
import "./frame.css";
import FolderPageFx from "./FolderPageFx";
import LayersPanel from "./LayersPanel";
import SiteHeader from "./SiteHeader";

const pad = (n) => String(n).padStart(2, "0");

// Frame the hero by its real shape: wide images keep (close to) their own ratio instead of
// one fixed crop; portraits stand on the stage at their own shape rather than being cut down.
const heroShape = (size) =>
  size && size.w / size.h < 1.15 ? "portrait" : "wide";
const heroStyle = (size) => {
  if (!size) return undefined;
  const r = size.w / size.h;
  if (r < 1.15) return { aspectRatio: `${size.w} / ${size.h}` };
  return { aspectRatio: String(Math.min(2.1, Math.max(1.45, r))) };
};

const Cursor = ({ color, name, className }) => (
  <span className={className} aria-hidden="true">
    <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true">
      <path
        d="M1.5 1.5 L16 9.2 L9.4 10.8 L6.6 17.6 Z"
        fill={color}
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
    <span className="nm">{name}</span>
  </span>
);

// A detail page, laid out like an editorial post on the canvas (no boxes): a small mono
// label and the folder's tab up top, a big two-tone headline, the hero on a stage in the
// folder's color with Alexi's cursor on it, then the write-up in an off-center column with
// its contents alongside, and a big "Next" at the end.
export default function FolderPage({
  folder,
  index,
  item,
  next,
  hero,
  heroSize,
  heroKind = "ui",
  heroLogo,
  links = [],
  chips = [],
  headings = [],
  readTime,
  glance = [],
  gallery = [],
  children,
}) {
  const key = folder.name.toLowerCase();
  const label = [
    index >= 0 ? `${pad(index + 1)}/${pad(folder.items.length)}` : null,
    item.meta,
    item.when,
    readTime,
  ].filter(Boolean);
  // the rest of the folder, minus this file and the one "Next" already points to
  const siblings = folder.items
    .filter((f, k) => k !== index && f.href !== next?.href)
    .slice(0, 4);

  return (
    <div
      className="alx alx-page"
      style={{ "--c": folder.color, "--k": folder.ink }}
    >
      <SiteHeader />
      <main className="fp">
        <div className="fp-head">
          <div className="fp-kicker">
            <Link href={`/?folder=${key}`} className="fp-tab">
              <span aria-hidden="true">←</span> {folder.name}
            </Link>
            <p className="fp-label">
              {label.map((part, k) => (
                <span key={part}>
                  {k ? <i aria-hidden="true">·</i> : null}
                  {part}
                </span>
              ))}
            </p>
          </div>
          <h1 className="fp-title">
            <b>{item.title}.</b> {item.line}
          </h1>
          <div className="fp-byline">
            <span className="fp-author">
              <Image src="/avatar.webp" alt="" width={56} height={56} />
              <b>Alexi Canamo</b>
              <span>Product and AI engineer, Manila</span>
            </span>
            <span className="fp-actions">
              {chips.map((c) => (
                <span key={c} className="fp-tag">
                  {c}
                </span>
              ))}
              {item.res ? <span className="fp-res">{item.res}</span> : null}
              {links.map((l) =>
                l.href.startsWith("/") ? (
                  <Link key={l.href} href={l.href} className="fp-link">
                    {l.label} <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="fp-link"
                  >
                    {l.label} <span aria-hidden="true">↗</span>
                  </a>
                ),
              )}
            </span>
          </div>
        </div>

        {hero || heroLogo ? (
          <figure className="fp-hero">
            <div
              className={heroLogo ? "fp-stage brand" : "fp-stage"}
              style={heroLogo ? { background: heroLogo.bg } : undefined}
            >
              {heroLogo ? (
                <div className="fp-hero-logo">
                  <Image
                    src={heroLogo.logo}
                    alt={item.title}
                    width={heroLogo.wide ? 640 : 240}
                    height={heroLogo.wide ? 320 : 240}
                    className={heroLogo.wide ? "wide" : undefined}
                    priority
                  />
                </div>
              ) : (
                <div
                  className={`fp-hero-img ${heroShape(heroSize)} is-${heroKind}`}
                  style={heroStyle(heroSize)}
                  data-zoom
                >
                  <Image
                    src={hero}
                    alt={item.title}
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 1100px"
                  />
                </div>
              )}
              {item.note ? (
                <span className="fp-pin">
                  <Image src="/avatar.webp" alt="" width={52} height={52} />
                  <em>{item.note}</em>
                </span>
              ) : null}
              <Cursor color="#5470ff" name="Alexi" className="fp-hero-cursor" />
            </div>
          </figure>
        ) : null}

        <div className="fp-body">
          <LayersPanel
            headings={headings}
            folderName={folder.name}
            folderKey={key}
            siblings={siblings}
          />
          <article className="fp-prose">
            {glance.length ? (
              <ul className="fp-glance">
                {glance.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
            {children}
            {gallery.length ? (
              <div className="fp-gallery">
                {gallery.map((g, k) => (
                  <figure key={g.src} className="fp-shot" data-zoom>
                    <Image
                      src={g.src}
                      alt={`${item.title}, photo ${k + 1}`}
                      width={g.w || 1200}
                      height={g.h || 900}
                      sizes="(max-width: 900px) 50vw, 320px"
                    />
                  </figure>
                ))}
              </div>
            ) : null}
          </article>
        </div>

        {next ? (
          <Link href={next.href} className="fp-next">
            <span className="fp-next-label">Next in {folder.name}</span>
            <span className="fp-next-row">
              <span className="fp-next-title">
                {next.title} <span aria-hidden="true">→</span>
              </span>
              {next.img || next.logo ? (
                <span
                  className={`fp-next-img${next.logo ? " logo" : ""}${next.wide ? " wide" : ""}`}
                  style={
                    next.logo ? { background: next.bg } : { "--r": next.ratio }
                  }
                >
                  <Image
                    src={next.img || next.logo}
                    alt=""
                    width={320}
                    height={200}
                  />
                </span>
              ) : null}
            </span>
            <span className="fp-next-line">{next.line}</span>
          </Link>
        ) : null}
      </main>
      <div className="fp-progress" aria-hidden="true" />
      <div className="fp-zoom" aria-hidden="true">
        <p className="fp-zoom-fn">
          <span />
          <span>esc to zoom out</span>
        </p>
      </div>
      <div className="fp-alexi" aria-hidden="true">
        <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true">
          <path
            d="M1.5 1.5 L16 9.2 L9.4 10.8 L6.6 17.6 Z"
            fill="#5470ff"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <span className="nm">Alexi</span>
        <span className="chat" />
      </div>
      <FolderPageFx />
    </div>
  );
}
