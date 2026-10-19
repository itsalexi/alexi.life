"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isCanvasPage } from "../lib/canvas-pages";
import styles from "./PageAtmosphere.module.css";

// Integer hashing produces identical positions during SSR and hydration.
const random = (seed) => {
  let value = (seed + 0x9e3779b9) | 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  return ((value ^ (value >>> 15)) >>> 0) / 4294967296;
};
const stars = Array.from({ length: 90 }, (_, index) => {
  const x = Math.round(random(index + 1) * 1600);
  const y = Math.round(random(index + 181) * 1200);
  const radius = index % 11 === 0 ? 1.05 : 0.6;
  const opacity = 0.13 + random(index + 351) * 0.28;
  return `<circle cx="${x}" cy="${y}" r="${radius}" opacity="${opacity.toFixed(2)}"/>`;
}).join("");
const starField = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><g fill="#d1d5c5">${stars}</g></svg>`)}")`;

const bandSlots = Array.from({ length: 24 }, (_, index) => ({
  id: `sky-band-${index}`,
  index,
}));
const fireflySlots = Array.from({ length: 16 }, (_, index) => index);
const twinkleSlots = Array.from({ length: 20 }, (_, index) => index);

function AtmosphereBand({ index, total }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        node.dataset.visible = entry.isIntersecting ? "true" : "false";
      },
      { rootMargin: "100px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={styles.band}
      style={{ top: `${((index + 0.45) / total) * 100}%` }}
    >
      {fireflySlots.map((fly) => (
        <span
          key={fly}
          className={styles.firefly}
          data-side={fly < 8 ? "left" : "right"}
          style={{
            "--x": `${fly < 8 ? 3 + random(index * 17 + fly) * 7 : 90 + random(index * 17 + fly) * 7}%`,
            "--y": `${random(index * 11 + fly + 40) * 78}%`,
            "--delay": `${-random(index + fly + 80) * 18}s`,
            "--duration": `${9 + random(index + fly + 30) * 9}s`,
            "--drift": `${fly % 2 ? -16 : 13}px`,
            "--glow": fly % 2 ? "#b4c982" : "#d4b779",
          }}
        />
      ))}
      {twinkleSlots.map((star) => (
        <span
          key={star}
          className={styles.twinkle}
          style={{
            "--x": `${4 + random(index * 21 + star + 510) * 92}%`,
            "--y": `${random(index * 17 + star + 610) * 90}%`,
            "--delay": `${-random(index + star + 720) * 15}s`,
            "--duration": `${5 + random(index + star + 760) * 8}s`,
          }}
        />
      ))}
      {[0, 1].map((light) => (
        <span
          key={light}
          className={styles.distantLight}
          style={{
            "--x": `${light === 0 ? 68 + random(index + 950) * 14 : 12 + random(index + 960) * 14}%`,
            "--y": `${12 + random(index + light + 951) * 64}%`,
            "--delay": `${-(light * 17 + random(index + 952) * 34)}s`,
          }}
        />
      ))}
      {[0, 1].map((meteor) => (
        <span
          key={meteor}
          className={styles.meteor}
          style={{
            "--x": `${meteor === 0 ? 58 + random(index + 900) * 20 : 10 + random(index + 940) * 20}%`,
            "--y": `${meteor === 0 ? 7 + random(index + 901) * 20 : 44 + random(index + 941) * 20}%`,
            "--delay": `${-(meteor * 3 + random(index + 903) * 4)}s`,
            "--duration": `${6.5 + random(index + meteor + 904) * 2.5}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Page-anchored accents: no full-page canvas and no scroll animation loop. */
export default function PageAtmosphere() {
  const pathname = usePathname();
  const home = pathname === "/";
  const enabled = !pathname?.startsWith("/admin") && !isCanvasPage(pathname);
  const hostRef = useRef(null);
  const [bands, setBands] = useState(3);
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !enabled) return;
    const observer = new ResizeObserver(() => {
      const count = Math.max(
        1,
        Math.min(24, Math.ceil(host.clientHeight / 950)),
      );
      setBands((current) => (current === count ? current : count));
    });
    observer.observe(host);
    const visibility = () => {
      host.dataset.hidden = document.hidden ? "true" : "false";
    };
    document.addEventListener("visibilitychange", visibility);
    visibility();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [enabled]);
  if (!enabled) return null;
  return (
    <div
      ref={hostRef}
      className={`${styles.atmosphere} ${home ? styles.home : ""}`}
      aria-hidden="true"
      style={{ backgroundImage: starField }}
    >
      {bandSlots.slice(0, bands).map((band) => (
        <AtmosphereBand key={band.id} index={band.index} total={bands} />
      ))}
    </div>
  );
}
