"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { socials } from "../../config/socials";
import ThemeToggle from "./ThemeToggle";

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
// what Alexi's probably doing right now, by Manila time (same as home)
const quip = (h) =>
  h < 5
    ? "should be asleep"
    : h < 9
      ? "waking up"
      : h < 12
        ? "deep in the code"
        : h < 14
          ? "lunch, probably"
          : h < 18
            ? "shipping"
            : h < 22
              ? "still shipping"
              : "should be asleep";

// The home page's header, for the other canvas pages. Say hi opens the contact screen on home.
export default function SiteHeader() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <header>
      <Link href="/" className="me" aria-label="Alexi Canamo, home">
        <span className="av">
          <Image src="/avatar.webp" alt="" width={68} height={68} priority />
        </span>
        <span className="who">
          <b>Alexi Canamo</b>
          <span className="status">
            {now ? (
              <>
                <span>{fmt.format(now)}</span>
                <span className="loc">&nbsp;in Manila</span>
                <span>&nbsp;·&nbsp;{quip(Number(hourFmt.format(now)))}</span>
              </>
            ) : (
              "Manila"
            )}
          </span>
        </span>
      </Link>
      <div className="hr">
        <ThemeToggle />
        <Link href="/about">About</Link>
        <a href={socials.resume} target="_blank" rel="noreferrer">
          Résumé
        </a>
        <Link href="/?hi=1" className="hi">
          Say hi
        </Link>
      </div>
    </header>
  );
}
