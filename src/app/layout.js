import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import BackgroundEffects from "../components/BackgroundEffects";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PageAtmosphere from "../components/PageAtmosphere";
import PageTransition from "../components/PageTransition";
import { Preloader } from "../components/ui/preloader";
import { siteConfig } from "../lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Alexi Canamo",
    "Alexi Canamo portfolio",
    "Alexi Canamo software engineer",
    "founder",
    "product engineer",
    "software developer",
    "web developer",
    "Philippines",
    "Computer Science",
    "Ateneo",
    "ADMU",
    "portfolio",
    "student developer",
    "React",
    "Next.js",
    "JavaScript",
    "DOST Scholar",
    "MISA",
    "Swarm",
    "NextPay",
    "Sip & Scale",
    "Hati app",
    "Enlistment Helper",
    "QPI Calculator",
    "One Big Match",
    "SALBAR",
    "Hakot",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Alexi Canamo - Founder and Product Engineer",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    creator: siteConfig.twitterHandle,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/avatar.webp",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="dark"
      data-preloader-ready="false"
      suppressHydrationWarning
    >
      <head>
        {/* Day or night before first paint: saved choice, else the system setting. */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Fixed local bootstrap; no interpolated data.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("alx-theme");document.documentElement.dataset.theme=t||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){}`,
          }}
        />
        {/* Structured Data - Person Schema */}
        <Script
          id="person-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from local metadata.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: siteConfig.name,
              alternateName: "Alexi Roth Luis Cañamo",
              url: siteConfig.url,
              image: `${siteConfig.url}${siteConfig.ogImage}`,
              jobTitle: "Founder and Product Engineer",
              description: siteConfig.description,
              alumniOf: {
                "@type": "CollegeOrUniversity",
                name: "Ateneo de Manila University",
                sameAs: "https://www.ateneo.edu",
              },
              knowsAbout: [
                "Software Development",
                "Product Engineering",
                "Web Development",
                "React",
                "Next.js",
                "JavaScript",
                "TypeScript",
                "Node.js",
                "Python",
                "PostgreSQL",
                "AI Agents",
                "iOS Development",
              ],
              sameAs: [
                "https://github.com/itsalexi",
                "https://linkedin.com/in/alexicanamo",
                "https://instagram.com/alexicanamo",
                "https://x.com/alexicanamo",
              ],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Manila",
                addressCountry: "PH",
              },
            }),
          }}
        />

        {/* Structured Data - Website Schema */}
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from local metadata.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteConfig.name,
              url: siteConfig.url,
              description: siteConfig.description,
              publisher: {
                "@type": "Person",
                name: siteConfig.name,
              },
              inLanguage: "en-US",
            }),
          }}
        />

        {/* Structured Data - Organization/Professional Service */}
        <Script
          id="professional-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from local metadata.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Alexi Canamo - Product Engineering",
              image: `${siteConfig.url}${siteConfig.ogImage}`,
              description:
                "Student tools, startup software, and community products by Alexi Canamo.",
              url: siteConfig.url,
              telephone: "",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Manila",
                addressCountry: "Philippines",
              },
              priceRange: "$$",
              openingHours: "Mo-Su",
            }),
          }}
        />

        {/* Cloudflare Analytics */}
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "86ec04c4f2cb40658a18c7523aa83bc2"}'
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[var(--portfolio-bg)] font-sans antialiased`}
      >
        <Preloader />
        {/* Start the visible signature without waiting for the React bundles. */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Fixed local bootstrap; no interpolated data.
          dangerouslySetInnerHTML={{
            __html: `requestAnimationFrame(function(){var path=document.querySelector('.loader-path');if(path)for(var animation of path.getAnimations()){if(animation.playState==='paused')animation.play();}});`,
          }}
        />
        <BackgroundEffects />
        <div className="relative z-10 isolate" data-portfolio-content inert>
          <PageAtmosphere />
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <Footer />
        </div>
      </body>
    </html>
  );
}
