// The four folders on the home page. Content comes from src/content/*; this file only
// picks what goes in each folder, in what order, and the short home-page copy for it.

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

const BUILT = {
  bluefolio: {
    meta: "Career network",
    when: "2026",
    line: "A verified, portfolio-first career network for the Ateneo community.",
  },
  hati: {
    meta: "iOS app",
    when: "2025",
    line: "Splitting bills with friends, without the awkward math.",
    note: "200+ splits, 156 downloads",
  },
  "ateneo-qpi-calculator": {
    title: "QPI Calculator",
    meta: "Campus tool",
    when: "2024",
    line: "A grade calculator Ateneans actually use during finals.",
    note: "9,600+ sessions, #2 on Google",
  },
  "ateneo-enlistment-helper": {
    title: "Enlistment Helper",
    meta: "Campus tool",
    when: "2024",
    line: "Helps students plan their schedules during enlistment week.",
    note: "Helped 500+ students plan",
  },
  "one-big-match": {
    meta: "Event product",
    when: "2025",
    line: "Led a small team through live event pilots.",
    note: "10-person team, 4 live pilots",
  },
  "tedx-admu": {
    title: "TEDxAteneoDeManila",
    meta: "Event site",
    when: "2024",
    line: "The event website for TEDxAteneoDeManila.",
  },
};

const WEEKENDS = {
  esalba: {
    meta: "eGovPH 2026",
    line: "An offline-first emergency triage system for LGUs.",
  },
  yardshtick: {
    line: "One photo of a pile of stuff becomes a shareable garage sale.",
  },
  hakot: {
    meta: "Ship or Be Shipped",
    line: "An AI-assisted logistics marketplace.",
  },
  crystal: {
    meta: "StartupQC",
    line: "Shared team memory and faster context recovery.",
  },
  salbar: {
    meta: "Naga Mayoral Hackathon",
    line: "Built over a weekend in Naga.",
  },
};

const WRITING_BLOGS = {
  "start-now": {
    line: "Start before the requirement, leave evidence, listen for signal, repeat what gives back.",
  },
  "nextpay-internship": {
    line: "Struggling through math while shipping code, and the risky question that changed it.",
  },
  "college-perspective-shift": {
    line: "There’s a whole world outside org life I hadn’t made space for.",
  },
};

const WRITING_TALKS = {
  "you-can-just-do-things": {
    line: "On agency, small annoyances, and not waiting to feel ready.",
  },
};

export const firstSentence = (text) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s/)[0];

export function buildHomeFolders({ projects, hackathons, blogs, talks }) {
  const projectBySlug = new Map(projects.map((p) => [p.slug, p]));
  const built = Object.entries(BUILT)
    .map(([slug, copy]) => {
      const p = projectBySlug.get(slug);
      if (!p) return null;
      return {
        title: copy.title || p.title,
        meta: copy.meta,
        when: copy.when,
        img: p.image,
        line: copy.line || firstSentence(p.tagline),
        note: copy.note,
        href: `/projects/${slug}`,
      };
    })
    .filter(Boolean);

  const weekends = hackathons
    .filter((h) => WEEKENDS[h.slug])
    .map((h) => {
      const copy = WEEKENDS[h.slug];
      return {
        title: h.title,
        res: h.result,
        meta: copy.meta || h.event,
        when: shortDate(h.date),
        img: h.image,
        line: copy.line || firstSentence(h.highlights?.[0]),
        href: `/hackathons/${h.slug}`,
      };
    });

  const writing = [
    ...blogs
      .filter((b) => WRITING_BLOGS[b.slug])
      .map((b) => ({
        title: b.title,
        meta: "Essay",
        date: b.date,
        img: b.image,
        line: WRITING_BLOGS[b.slug].line || firstSentence(b.excerpt),
        href: `/blog/${b.slug}`,
      })),
    ...talks
      .filter((t) => WRITING_TALKS[t.slug])
      .map((t) => ({
        title: t.title,
        meta: `Talk · ${t.event}`,
        date: t.date,
        img: t.images?.[0],
        line: WRITING_TALKS[t.slug].line || firstSentence(t.shortDescription),
        href: `/talks/${t.slug}`,
      })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
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
