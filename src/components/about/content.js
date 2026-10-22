// Everything on the about canvas, in world coordinates (px at 100% zoom). Chapters are
// Figma-style sections at different sizes and slight angles, strung along one path; each
// holds photos, toys and a short headline in its own local coordinates. Items with a pin
// carry Alexi's comment; `cur` is what his cursor says when it drifts by.

const A = "/images/about";
const L = "/images/about/life";
const H = "/images/hackathons";
const T = "/images/projects";

export const IMG = {
  baby: { src: `${A}/baby.webp`, w: 478, h: 666 },
  qpiTalk: { src: `${A}/image (1).webp`, w: 2141, h: 1019 },
  sponsors: { src: `${A}/image (2).webp`, w: 588, h: 616 },
  meFace: { src: `${A}/image (3).webp`, w: 470, h: 628 },
  dinner4: { src: `${A}/image (4).webp`, w: 1760, h: 1320 },
  karts: { src: `${A}/image (5).webp`, w: 536, h: 383 },
  formal: { src: `${A}/image (6).webp`, w: 1998, h: 1344 },
  lanyards: { src: `${A}/image (7).webp`, w: 945, h: 1144 },
  street: { src: `${A}/image (8).webp`, w: 1552, h: 935 },
  outreach: { src: `${A}/image (9).webp`, w: 1065, h: 799 },
  mountain: { src: `${A}/image (10).webp`, w: 1572, h: 2097 },
  podium: { src: `${A}/image (11).webp`, w: 1464, h: 976 },
  sose: { src: `${A}/image (12).webp`, w: 1464, h: 976 },
  shibuya: { src: `${L}/shibuya.webp`, w: 1350, h: 1800 },
  castle: { src: `${L}/tokyo-castle.webp`, w: 1350, h: 1800 },
  bench: { src: `${L}/tokyo-bench.webp`, w: 1350, h: 1800 },
  cooking: { src: `${L}/cooking.webp`, w: 844, h: 1125 },
  concert: { src: `${L}/concert.webp`, w: 1179, h: 1711 },
  balcony: { src: `${L}/balcony-night.webp`, w: 1800, h: 1198 },
  bar: { src: `${L}/bar-selfie.webp`, w: 1125, h: 1500 },
  chinatown: { src: `${L}/chinatown.webp`, w: 1350, h: 1800 },
  mall: { src: `${L}/mall-group.webp`, w: 844, h: 1500 },
  lunch: { src: `${L}/lunch-overhead.webp`, w: 1350, h: 1800 },
  ballroom: { src: `${L}/ballroom.webp`, w: 1350, h: 1800 },
  egov: { src: `${L}/egovph-medals.webp`, w: 1800, h: 1200 },
  naga: { src: `${L}/salbar-naga.webp`, w: 1350, h: 1800 },
  stairs: { src: `${L}/stairs-team.webp`, w: 1800, h: 1200 },
  me: { src: "/images/home/me-matcha.jpg", w: 389, h: 520 },
  yard: { src: `${H}/yardshtick.webp`, w: 1280, h: 1707 },
  hakot: { src: `${H}/hakot.jpeg`, w: 960, h: 1280 },
  crystal: { src: `${H}/crystal.webp`, w: 1280, h: 720 },
  talk: { src: `${T}/null-1762345062233.webp`, w: 1440, h: 1080 },
};

// p(img, x, y, width, extras): a photo frame
const p = (img, x, y, width, extra = {}) => ({
  ...IMG[img],
  key: `${img}-${x}`,
  x,
  y,
  width,
  height: Math.round((width * IMG[img].h) / IMG[img].w),
  rot: 0,
  ...extra,
});

export const SECTIONS = [
  {
    id: "hello",
    x: 0,
    y: 350,
    w: 1300,
    h: 920,
    bare: true,
    chapter: "Hello",
    say: "hey! i’ll build this as we go",
    photos: [
      p("shibuya", 840, 60, 340, {
        rot: 2.5,
        name: "me.jpg",
        pin: "hi, that’s me",
        cur: "Shibuya, Jul 2026",
      }),
      p("me", 1010, 580, 180, { rot: -4, name: "also-me.jpg", cur: "also me" }),
    ],
  },
  {
    id: "origins",
    x: 1450,
    y: 0,
    w: 1270,
    h: 1120,
    rot: -1.2,
    label: "Origins",
    color: "#ffd34d",
    ink: "#1d1d1f",
    chapter: "Origins",
    say: "where it all started",
    mono: "Age 7 → 2020",
    title: "It started with three radio buttons.",
    line: "Click one, a picture changed. I was 7.",
    words: { x: 60, y: 60, w: 720 },
    photos: [
      p("baby", 60, 290, 240, {
        name: "v0.jpg",
        pin: "version zero",
        cur: "no features yet",
      }),
    ],
    toys: [
      {
        kind: "vb",
        x: 340,
        y: 290,
        w: 400,
        name: "Form1.frm",
        when: "Age 7",
        pin: "my aunts and uncles made this in Visual Basic",
      },
      {
        kind: "icy",
        x: 790,
        y: 290,
        w: 400,
        name: "icyfox.exe",
        when: "Soon after",
        pin: "my Firefox copy. seven versions of it",
      },
      {
        kind: "wix",
        x: 60,
        y: 700,
        w: 580,
        name: "my-first-site.wix",
        when: "Age 9-ish",
        pin: "Wix pages about games and toys i liked",
      },
      {
        kind: "sketch",
        x: 930,
        y: 700,
        w: 270,
        name: "sketch.html",
        when: "2020",
        pin: "The Odin Project, during the pandemic",
      },
    ],
  },
  {
    id: "ateneo",
    x: 3000,
    y: 250,
    w: 1250,
    h: 1100,
    rot: 1,
    label: "Ateneo",
    color: "#0d99ff",
    ink: "#ffffff",
    chapter: "Ateneo",
    say: "try the what-if",
    mono: "2024 → now · CS at Ateneo · DOST scholar",
    title: "Tools for my classmates.",
    line: "Enlistment, grades, finals week. Problems I had too.",
    link: { label: "Open Built", href: "/?folder=built" },
    words: { x: 60, y: 60, w: 560 },
    photos: [
      p("qpiTalk", 660, 60, 530, {
        name: "qpi-calculator.jpg",
        pin: "9,600+ sessions, #2 on Google",
        cur: "the QPI Calculator, on a big screen",
      }),
      p("podium", 60, 400, 320, { rot: -1.5, name: "talk.jpg" }),
      p("lanyards", 940, 400, 250, { rot: 2, name: "org-life.jpg" }),
      p("stairs", 60, 780, 330, {
        rot: 1,
        name: "org-team.jpg",
        cur: "the stairwell photoshoot",
      }),
      p("sose", 430, 780, 290, { rot: -1.2, name: "sose.jpg" }),
      p("outreach", 770, 790, 260, {
        rot: 1.8,
        name: "outreach.jpg",
        cur: "Christmas outreach",
      }),
    ],
    toys: [
      {
        kind: "qpi",
        x: 420,
        y: 400,
        w: 480,
        name: "qpi-whatif.html",
        when: "Finals week",
      },
    ],
  },
  {
    id: "work",
    x: 4400,
    y: 0,
    w: 1250,
    h: 850,
    rot: -0.8,
    label: "Work",
    color: "#5470ff",
    ink: "#ffffff",
    chapter: "Work",
    say: "what i’m working on now",
    mono: "2025 → now",
    title: "Building AI products at Casper.",
    line: "Before that, fintech at NextPay and compliance at Swarm.",
    link: { label: "See the work", href: "/?folder=work" },
    words: { x: 60, y: 60, w: 600 },
    logos: [
      {
        name: "Casper Studios",
        when: "Now",
        src: "/images/home/casper.jpg",
        bg: "linear-gradient(120deg,#6d2cf5,#d63af0)",
        href: "/work/casper-studios",
        pin: "building here now",
      },
      {
        name: "NextPay",
        when: "2025 – 26",
        src: "/images/logos/nextpay.webp",
        bg: "#5470ff",
        href: "/work/nextpay",
      },
      {
        name: "Swarm",
        when: "2026",
        src: "/images/logos/swarm.webp",
        bg: "#0b0b18",
        href: "/work/swarm",
      },
      {
        name: "Bytespace",
        when: "2026",
        src: "/images/logos/bytespace.webp",
        bg: "#f1ead9",
        href: "/work/bytespace",
      },
    ],
    logosAt: { x: 60, y: 300 },
    points: [
      "Cut manual processing by 75% at NextPay (YC W21)",
      "A compliance graph over 2,711 requirements at Swarm",
      "8 product improvements in under a month at Bytespace",
    ],
    pointsAt: { x: 60, y: 560, w: 580 },
    photos: [
      p("ballroom", 700, 70, 270, {
        rot: 1.5,
        name: "dressed-up.jpg",
        cur: "dressed up",
      }),
      p("street", 1010, 70, 200, { rot: -2.5, name: "after-work.jpg" }),
      p("dinner4", 1010, 290, 200, { rot: 2, name: "the-usual.jpg" }),
    ],
  },
  {
    id: "weekends",
    x: 4300,
    y: 1350,
    w: 1300,
    h: 990,
    rot: 1.2,
    label: "Weekends",
    color: "#ff4f8b",
    ink: "#ffffff",
    chapter: "Weekends",
    say: "click the winner",
    mono: "2026 · Hackathons",
    title: "Weekends became hackathons.",
    line: "Ideas on Friday, demos by Sunday.",
    link: { label: "Open Weekends", href: "/?folder=weekends" },
    words: { x: 60, y: 60, w: 580 },
    counters: [
      { to: 100000, pre: "₱", label: "grant, eGovPH win" },
      { to: 200, post: "+", label: "teams in Naga, Top 5" },
      { to: 250, post: "+", label: "builders, 3rd place" },
    ],
    countersAt: { x: 60, y: 300 },
    photos: [
      p("egov", 680, 60, 580, {
        name: "egovph-2026.jpg",
        pin: "we actually won this one",
        confetti: true,
        cur: "click it",
      }),
      p("naga", 690, 520, 240, {
        rot: -2,
        name: "naga.jpg",
        cur: "Naga, with Mayor Leni",
      }),
      p("yard", 970, 520, 230, {
        rot: 2,
        name: "yardshtick.jpg",
        cur: "OpenAI Build Week",
      }),
      p("hakot", 60, 576, 230, {
        rot: -1.5,
        name: "hakot.jpg",
        pin: "my first overnight hackathon",
      }),
      p("crystal", 330, 620, 320, { rot: 1.5, name: "crystal.jpg" }),
    ],
  },
  {
    id: "off",
    x: 2700,
    y: 1480,
    w: 1380,
    h: 1170,
    rot: -1,
    label: "Off the clock",
    color: "#9ee0b5",
    ink: "#10301e",
    chapter: "Off the clock",
    say: "the fun part",
    mono: "Off the clock",
    title: "Mostly friends and food.",
    line: "And a trip to Tokyo.",
    words: { x: 60, y: 60, w: 520 },
    toys: [
      {
        kind: "pile",
        col: true,
        x: 60,
        y: 250,
        w: 460,
        name: "pile.tsx",
        when: "Any time",
      },
    ],
    photos: [
      p("castle", 620, 60, 210, {
        rot: -2,
        name: "tokyo.jpg",
        cur: "Tokyo, at night",
      }),
      p("cooking", 860, 60, 210, {
        rot: 2,
        name: "eggs.jpg",
        pin: "breakfast",
      }),
      p("bench", 1100, 60, 210, {
        rot: -1,
        name: "bench.jpg",
        cur: "a bench in Tokyo",
      }),
      p("concert", 620, 410, 210, { rot: -2, name: "concert.jpg" }),
      p("bar", 860, 410, 210, { rot: 2, name: "friday.jpg" }),
      p("chinatown", 1100, 410, 210, {
        rot: -1.5,
        name: "chinatown.jpg",
        cur: "Chinatown",
      }),
      p("lunch", 620, 780, 210, {
        rot: 2,
        name: "lunch.jpg",
        pin: "lunch, from above",
      }),
      p("mountain", 860, 760, 210, { rot: 1.5, name: "up-north.jpg" }),
      p("formal", 1100, 760, 210, { rot: -1, name: "formal.jpg" }),
      p("balcony", 60, 445, 300, {
        rot: 1.5,
        name: "balcony.jpg",
        cur: "the barkada",
      }),
      p("mall", 390, 445, 190, { rot: 1, name: "holidays.jpg" }),
      p("karts", 60, 715, 280, { rot: -1, name: "karts.jpg", cur: "go-karts" }),
      p("sponsors", 380, 875, 200, { rot: -2, name: "booth.jpg" }),
    ],
  },
  {
    id: "beliefs",
    x: 1300,
    y: 1450,
    w: 1250,
    h: 640,
    rot: 0.8,
    label: "Beliefs",
    color: "#9747ff",
    ink: "#ffffff",
    chapter: "Beliefs",
    say: "what i keep coming back to",
    mono: "Beliefs",
    title: "Two things I keep coming back to.",
    line: "",
    words: { x: 60, y: 60, w: 700 },
    beliefs: [
      {
        title: "Code for others.",
        line: "Ateneo talks a lot about being a person for others. That clicked for me through software. The QPI Calculator was a small tool, but the thank-yous during finals week stuck with me.",
      },
      {
        title: "We can just do things.",
        line: "If something should exist, I’d rather make a rough first version than keep talking about it. Starting usually teaches me what the next version should be.",
      },
    ],
    beliefsAt: { x: 60, y: 210 },
    photos: [
      p("talk", 830, 70, 360, {
        rot: 2,
        name: "talk.jpg",
        pin: "i gave a whole talk about this one",
        cur: "Ateneo Computer Club, Oct 2025",
      }),
    ],
  },
  {
    id: "end",
    x: 0,
    y: 1500,
    w: 1150,
    h: 720,
    bare: true,
    anchor: { x: 800, y: 540 }, // the path lands on the bio card, clear of the links
    chapter: "Say hi",
    say: "that’s it for now!",
  },
];

export const TOUR = SECTIONS.map((s) => s.id);

// the short bio, for event organizers and anyone introducing Alexi (copied from the end card)
export const BIO =
  "Alexi Cañamo is a 19-year-old product and AI engineer in Manila, studying Computer Science at Ateneo de Manila University as a DOST Merit Scholar. He builds AI products at Casper Studios and is part of StellarPH’s PH100 2026, the annual list of the brightest minds under 30 in the Philippines. Before Casper, he shipped at NextPay (YC W21), Swarm and Bytespace. His work includes Ateneo’s QPI Calculator and Enlistment Helper, Hati, Bluefolio and Subtext.";

export const WORLD = { w: 5700, h: 2750 };

// the path through the chapters, through each section's center (or its `anchor`), as smooth
// curves. On a
// phone the chapters are one column, so it just links each one's bottom to the next's top.
export function pathSegments(stacked = false) {
  if (stacked)
    return SECTIONS.slice(0, -1).map((s, i) => {
      const x = s.x + s.w / 2;
      return `M${x} ${s.y + s.h} L${x} ${SECTIONS[i + 1].y}`;
    });
  const pts = SECTIONS.map((s) =>
    s.anchor
      ? { x: s.x + s.anchor.x, y: s.y + s.anchor.y }
      : { x: s.x + s.w / 2, y: s.y + s.h / 2 },
  );
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    segs.push(
      `M${p1.x} ${p1.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`,
    );
  }
  return segs;
}
