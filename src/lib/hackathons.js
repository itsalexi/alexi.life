import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export function getHackathonsDirectory() {
  return path.join(process.cwd(), "src/content/hackathons");
}

export function normalizeHighlights(highlights) {
  const normalizeHighlight = (highlight) => {
    if (typeof highlight === "string") return highlight.trim();
    if (highlight && typeof highlight === "object") {
      return Object.entries(highlight)
        .map(([key, value]) => `${key}: ${value}`)
        .join(" ")
        .trim();
    }
    return String(highlight || "").trim();
  };

  if (Array.isArray(highlights)) {
    return highlights.map(normalizeHighlight).filter(Boolean);
  }
  if (typeof highlights === "string") {
    return highlights
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** Gallery URLs: `images` list, or a single `image`, or newline-separated string (admin). */
export function normalizeGalleryImages(images, fallbackImage) {
  let arr = [];
  if (Array.isArray(images)) {
    arr = images
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (typeof images === "string") {
    arr = images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (arr.length === 0 && fallbackImage) {
    arr = [String(fallbackImage).trim()].filter(Boolean);
  }
  return arr;
}

/**
 * Full records for listing / detail (includes markdown body).
 */
export function loadAllHackathons() {
  const dir = getHackathonsDirectory();
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(".md", "");
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      const gallery = normalizeGalleryImages(data.images, data.image);
      return {
        slug,
        title: data.title || slug,
        date: data.date || "",
        event: data.event || "",
        result: data.result || "",
        organizer: data.organizer || "",
        image: data.image || gallery[0] || "",
        heroImage: data.heroImage || "",
        imageAlt: data.imageAlt || "",
        images: gallery,
        order: data.order ?? 999,
        highlights: normalizeHighlights(data.highlights),
        link: data.link || "",
        content: content.trim(),
      };
    })
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return (a.title || "").localeCompare(b.title || "");
    });
}

/**
 * Card preview on home: no need to ship full markdown.
 */
export function getHackathonBySlug(slug) {
  const dir = getHackathonsDirectory();
  const filePath = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const gallery = normalizeGalleryImages(data.images, data.image);
  return {
    slug,
    title: data.title || slug,
    date: data.date || "",
    event: data.event || "",
    result: data.result || "",
    organizer: data.organizer || "",
    image: data.image || gallery[0] || "",
    heroImage: data.heroImage || "",
    imageAlt: data.imageAlt || "",
    images: gallery,
    order: data.order ?? 999,
    highlights: normalizeHighlights(data.highlights),
    link: data.link || "",
    content: content.trim(),
  };
}

export function loadHackathonsForHome() {
  return loadAllHackathons().map(
    ({
      slug,
      title,
      date,
      event,
      result,
      organizer,
      image,
      imageAlt,
      images,
      highlights,
    }) => ({
      slug,
      title,
      date,
      event,
      result,
      organizer,
      image,
      imageAlt,
      images,
      highlights,
    }),
  );
}
