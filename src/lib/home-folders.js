import { getProjectTechLabels } from "./tech-stack";

// The four folders on the home page. What's in them comes from src/content/* (so anything
// added there, or through /admin, shows up on its own): projects in their admin `order`,
// everything else newest first. Leave something out with `draft: true` or `hidden: true`.
// The maps below are optional: the short home-page copy (line, points, meta) per slug.

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function shortDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// Work is curated here (each role gets a page at /work/<slug>); `bg` and `ink` color its cover.
export const WORK = [
  {
    title: "Casper Studios",
    href: "/work/casper-studios",
    slug: "casper-studios",
    meta: "AI Engineering",
    when: "Now",
    logo: "/images/home/casper.jpg",
    bg: "linear-gradient(120deg,#6d2cf5,#d63af0)",
    ink: "#ffffff",
    line: "Building AI products, right now.",
  },
  {
    title: "NextPay",
    href: "/work/nextpay",
    slug: "nextpay",
    points: [
      "Shipped SME dashboard features with a team of 5+ engineers",
      "Cut manual processing by 75% across money movement and onboarding",
      "Launched a marketing site for acquisition experiments",
    ],
    experience: "NextPay (YC W21)",
    related: { label: "Read the story", href: "/blog/nextpay-internship" },
    meta: "YC W21 · SWE Intern",
    when: "2025 – 2026",
    logo: "/images/logos/nextpay.webp",
    bg: "#5470ff",
    ink: "#ffffff",
    line: "A class paper, a cold message, and one risky question turned into my first startup internship.",
  },
  {
    title: "Swarm",
    href: "/work/swarm",
    slug: "swarm",
    points: [
      "A compliance graph over 2,711 requirements from 7 frameworks",
      "2,182 scored links, so evidence gathered once gets reused",
    ],
    experience: "Swarm",
    meta: "SWE Intern",
    when: "2026",
    logo: "/images/logos/swarm.webp",
    bg: "#0b0b18",
    ink: "#ffffff",
    line: "Compliance tooling that maps overlapping privacy and security frameworks into one graph.",
  },
  {
    title: "Bytespace",
    href: "/work/bytespace",
    slug: "bytespace",
    points: [
      "8 product improvements to Bot0 in under a month",
      "5 integration and workflow reliability upgrades in one week",
    ],
    experience: "Bytespace",
    meta: "Product Engineer",
    when: "2026",
    logo: "/images/logos/bytespace.webp",
    bg: "#f1ead9",
    ink: "#1d1d1f",
    line: "Core Bot0 platform work: product improvements and reliability upgrades.",
    note: "8 product improvements in under a month",
  },
  {
    title: "Sip & Scale",
    href: "/work/sip-and-scale",
    slug: "sip-and-scale",
    points: [
      "Set the technical roadmap for the site and internal tools",
      "Built a site that ranks #1 for branded search",
      "Turned community operations into lightweight product systems",
    ],
    experience: "Sip & Scale",
    meta: "Head of Product & Engineering",
    when: "2026",
    logo: "/images/logos/sip-scale-wordmark.webp",
    wide: true,
    bg: "#f7f3ea",
    ink: "#1d1d1f",
    line: "Product systems for a community of builders across events and cities.",
    note: "1,000+ builders, 50+ events, 20+ cities",
  },
  {
    title: "Ateneo MISA",
    href: "/work/ateneo-misa",
    slug: "ateneo-misa",
    points: [
      "Ran a 4-part web dev workshop series for 20+ students",
      "Built a registration system that made check-ins 75% faster",
    ],
    experience: "Ateneo MISA",
    related: {
      label: "See the registration system",
      href: "/projects/misa-registration-system",
    },
    meta: "AVP for IT Skills & Development",
    when: "2025 – 2026",
    logo: "/images/logos/misa.webp",
    bg: "#1ea5ad",
    ink: "#ffffff",
    line: "Taught student developers and built the org’s registration system.",
  },
];

const listed = (item) => !item.draft && !item.hidden;
const byNewest = (a, b) => new Date(b.date) - new Date(a.date);

const BUILT = {
  bluefolio: {
    points: [
      "One verified link per Atenean: work, orgs, awards, skills",
      "Students verify by signing in; alumni upload proof",
      "Launched publicly on October 3, 2026",
    ],
    meta: "Career network",
    when: "2026",
    line: "A verified, portfolio-first career network for the Ateneo community.",
  },
  subtext: {
    points: [
      "A one-line read of what they meant, plus a reply in your own voice",
      "Lives inside Messenger and Instagram, and never sends for you",
      "Private by default: chat memory stays in your browser",
    ],
    meta: "Chrome extension",
    when: "2026",
    line: "For the messages you don’t know how to answer.",
  },
  hati: {
    points: [
      "Only the organizer needs the app; everyone else gets a link",
      "Shared dishes and service charge, split fairly",
      "A native SwiftUI app plus a web page for the group",
    ],
    meta: "iOS app",
    when: "2025",
    line: "Splitting bills with friends, without the awkward math.",
    note: "200+ splits, 156 downloads",
  },
  "ateneo-qpi-calculator": {
    points: [
      "Saves your courses and auto-fills them by degree program",
      "Answers the finals question: what do I still need?",
      "Spread by word of mouth to 131,000+ interactions",
    ],
    title: "QPI Calculator",
    meta: "Campus tool",
    when: "2024",
    line: "A grade calculator Ateneans actually use during finals.",
    note: "9,600+ sessions, #2 on Google",
  },
  "ateneo-enlistment-helper": {
    points: [
      "Search courses, filter sections, build a visual timetable",
      "A scraper pulls class data the portal never exposed",
      "GitHub Actions refreshes it every few hours",
    ],
    title: "Enlistment Helper",
    meta: "Campus tool",
    when: "2024",
    line: "Helps students plan their schedules during enlistment week.",
    note: "Helped 500+ students plan",
  },
  "one-big-match": {
    points: [
      "Jackbox-style icebreakers: phones in hand, host on the big screen",
      "A real-time lobby over WebSockets, built with JJ and Abby",
      "4 student-event pilots with 80+ users",
    ],
    meta: "Event product",
    when: "2025",
    line: "Led a small team through live event pilots.",
    note: "10-person team, 4 live pilots",
  },
  "tedx-admu": {
    points: [
      "Built by a team of three; I led the technical side",
      "Design mockups turned into real, interactive pages",
      "Images and code tuned so it loads fast for everyone",
    ],
    title: "TEDxAteneoDeManila",
    meta: "Event site",
    when: "2024",
    line: "The official site for TEDxAteneoDeManilaU 2025.",
  },
  "misa-registration-system": {
    points: [
      "One place for check-ins, attendance and voting eligibility",
      "I was one of two lead developers on the team",
      "Became the standard check-in flow for MISA events",
    ],
    title: "MISA Registration",
    meta: "Org system",
    when: "2025",
    line: "Event check-ins and records for a 550-member org.",
    note: "Check-ins 75% faster",
  },
  "axie-ui": {
    points: [
      "Buttons with weight, fields with clear states, useful overlays",
      "Docs, a playground, recipes and full-page templates",
      "A place to practice the small details",
    ],
    meta: "Component library",
    when: "2026",
    line: "A React component library I made for fun.",
  },
  "portfolio-website": {
    title: "This site",
    meta: "Portfolio",
    when: "2026",
    line: "The site you’re on, and every version before it.",
  },
};

const WEEKENDS = {
  esalba: {
    points: [
      "Won, with a ₱100,000 finalist grant",
      "Offline-first triage, so reports reach LGUs when data drops",
      "About 12 hours of building, plus an 8-minute pitch video",
    ],
    meta: "eGovPH 2026",
    line: "An offline-first emergency triage system for LGUs.",
  },
  yardshtick: {
    points: [
      "The first OpenAI hackathon in the Philippines, 250+ builders",
      "One photo becomes items, listings, prices and a garage sale",
      "Vision models plus SAM 2 segmentation, built in one day",
    ],
    line: "One photo of a pile of stuff becomes a shareable garage sale.",
  },
  hakot: {
    points: [
      "My first overnight hackathon, at Kaya Founders",
      "An AI logistics marketplace for farmers and truck drivers",
      "Three pivots in 24 hours",
    ],
    meta: "Ship or Be Shipped",
    line: "An AI-assisted logistics marketplace.",
  },
  crystal: {
    points: [
      "Shared team memory, so decisions and notes don’t get lost",
      "Finalist at StartupQC Squad 3",
    ],
    meta: "StartupQC",
    line: "Shared team memory and faster context recovery.",
  },
  salbar: {
    points: [
      "Top 5 of 200+ teams",
      "An offline-first emergency health protocol for when systems fail",
      "Team qtr.zip with Edward, Eduardo and Abby",
    ],
    meta: "Naga Mayoral Hackathon",
    line: "Built over a weekend in Naga.",
  },
};

const WRITING_BLOGS = {
  "start-now": {
    points: [
      "Why college makes waiting easy",
      "Surface area first, then motion",
      "Leave evidence, then repeat what gives back",
    ],
    line: "Start before the requirement, leave evidence, listen for signal, repeat what gives back.",
  },
  "nextpay-internship": {
    points: [
      "A SocSc paper that turned into a cold message",
      "Shipping fintech code while failing math",
      "The one risky question that changed it",
    ],
    line: "Struggling through math while shipping code, and the risky question that changed it.",
  },
  "canteen-vulnerability-disclosure": {
    points: [
      "A new cafeteria loyalty app, and some curiosity",
      "One API request made me an admin",
      "Reported it, and the endpoint came down fast",
    ],
    meta: "Security",
    line: "How a campus loyalty app let anyone sign up as admin, and how I reported it.",
  },
  "welcome-to-my-blog": {
    line: "A short hello, and what this blog is for.",
  },
  "college-perspective-shift": {
    points: [
      "Missing the leadership spot I wanted",
      "Three weeks at the ASES 0 to 1 bootcamp",
      "Meeting builders from UP, DLSU, UST and more",
    ],
    line: "There’s a whole world outside org life I hadn’t made space for.",
  },
};

const WRITING_TALKS = {
  "you-can-just-do-things": {
    points: [
      "My first talk, for Ateneo Junior High students",
      "Human agency: you don’t need to feel ready",
      "Start with a small annoyance, like the QPI Calculator",
    ],
    line: "On agency, small annoyances, and not waiting to feel ready.",
  },
  "misa-python-workshop": {
    points: [
      "Co-taught with Edward Diesta, for MISA",
      "Variables, loops and functions in 90 minutes",
      "Everyone left with a QPI calculator that worked",
    ],
    line: "Half a semester of Python in 90 minutes, ending in a working QPI calculator.",
  },
};

export const firstSentence = (text) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s/)[0];

// what an outside link is, from where it goes
const linkLabel = (href) => {
  if (href.includes("github.com")) return "Code";
  if (href.includes("linkedin.com")) return "LinkedIn post";
  if (/youtu\.?be/.test(href)) return "Watch";
  try {
    return new URL(href).host.replace(/^www\./, "");
  } catch {
    return "Visit";
  }
};
const ext = (href) => (href ? { label: linkLabel(href), href } : undefined);

// Each file also carries a few `facts` (label, value) and an outside link, for the card that
// opens beside it when you zoom in on home.
export function buildHomeFolders({ projects, hackathons, blogs, talks }) {
  const built = projects
    .filter(listed)
    .sort(
      (a, b) =>
        (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title),
    )
    .map((p) => {
      const slug = p.slug;
      const copy = BUILT[slug] || {};
      return {
        title: copy.title || p.title,
        meta: copy.meta,
        when: copy.when,
        img: p.image,
        line: copy.line || firstSentence(p.tagline),
        note: copy.note,
        points: copy.points,
        href: `/projects/${slug}`,
        facts: [
          [
            "Stack",
            getProjectTechLabels(p.techStack, { limit: 3 }).join(" · "),
          ],
          ["Status", p.liveUrl ? "Live" : "Shipped"],
        ].filter(([, v]) => v),
        ext: ext(p.liveUrl || p.githubUrl),
      };
    });

  const weekends = hackathons
    .filter(listed)
    .sort(byNewest)
    .map((h) => {
      const copy = WEEKENDS[h.slug] || {};
      return {
        title: h.title,
        res: h.result,
        meta: copy.meta || h.event,
        when: shortDate(h.date),
        img: h.image,
        line: copy.line || firstSentence(h.highlights?.[0]),
        href: `/hackathons/${h.slug}`,
        points: copy.points,
        facts: [
          ["Event", h.event],
          ["Hosted by", h.organizer],
        ].filter(([, v]) => v),
        shots: (h.images || []).filter((src) => src !== h.image).slice(0, 3),
        ext: ext(h.link),
      };
    });

  const writing = [
    ...blogs.filter(listed).map((b) => {
      const copy = WRITING_BLOGS[b.slug] || {};
      return {
        title: b.title,
        meta: copy.meta || "Essay",
        date: b.date,
        img: b.image,
        line: copy.line || firstSentence(b.excerpt),
        href: `/blog/${b.slug}`,
        points: copy.points,
        facts: [
          ["Read", b.readTime?.replace(/ read$/, "")],
          ["Topics", (b.tags || []).slice(0, 3).join(" · ")],
        ].filter(([, v]) => v),
      };
    }),
    ...talks.filter(listed).map((t) => {
      const copy = WRITING_TALKS[t.slug] || {};
      return {
        title: t.title,
        meta: `Talk · ${t.event}`,
        date: t.date,
        img: t.images?.[0],
        line: copy.line || firstSentence(t.shortDescription),
        href: `/talks/${t.slug}`,
        points: copy.points,
        facts: [
          ["Event", t.event],
          ["Topics", (t.topics || []).slice(0, 3).join(" · ")],
        ].filter(([, v]) => v),
        shots: (t.images || []).slice(1, 4),
        ext: ext(t.link),
      };
    }),
  ]
    .sort(byNewest)
    .map(({ date, ...item }) => ({ ...item, when: shortDate(date) }));

  return [
    {
      name: "Work",
      color: "#5470ff",
      ink: "#ffffff",
      blurb: "Where I’ve shipped, and who with.",
      chat: "work stuff",
      view: "See the role",
      items: WORK,
    },
    {
      name: "Built",
      color: "#ffd34d",
      ink: "#1d1d1f",
      blurb: "Things people actually use.",
      chat: "open one",
      view: "View project",
      items: built,
    },
    {
      name: "Weekends",
      color: "#ff4f8b",
      ink: "#ffffff",
      blurb: "Hackathons. 48 hours, too much coffee.",
      chat: "weekend stuff",
      view: "Read about it",
      items: weekends,
    },
    {
      name: "Writing",
      color: "#9ee0b5",
      ink: "#10301e",
      blurb: "Notes, talks, and things I wish I knew earlier.",
      chat: "some notes",
      view: "Read it",
      items: writing,
    },
  ];
}
