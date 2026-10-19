"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { usePreloaderReady } from "../hooks/usePreloaderReady";
import { isCanvasPage } from "../lib/canvas-pages";
import MoonlitSky from "./MoonlitSky";
import skyStyles from "./MoonlitSky.module.css";

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const isReady = usePreloaderReady();
  const hasAtmosphere = !pathname?.startsWith("/admin");
  const hasMoonlitSky = hasAtmosphere && !isCanvasPage(pathname);

  return (
    <motion.div
      key={pathname}
      className={hasAtmosphere ? skyStyles.shell : undefined}
      initial={isReady ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.52,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {hasMoonlitSky ? <MoonlitSky className={skyStyles.sky} /> : null}
      {children}
    </motion.div>
  );
}
