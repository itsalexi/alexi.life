import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { loadAllHackathons } from "./hackathons";
import { buildHomeFolders } from "./home-folders";
import { imageSize } from "./image-size";
import { calculateReadingTime } from "./reading-time";

export function loadFrontmatter(folder) {
  const directory = path.join(process.cwd(), "src/content", folder);
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(
        fs.readFileSync(path.join(directory, file), "utf8"),
      );
      return {
        slug: file.replace(".md", ""),
        readTime: calculateReadingTime(content),
        ...data,
      };
    });
}

// The four home folders, built from everything in src/content. Each file carries its picture's
// real shape (`ratio`), so frames and thumbnails show it whole instead of one fixed crop.
export async function loadHomeFolders() {
  const folders = buildHomeFolders({
    projects: loadFrontmatter("projects"),
    hackathons: loadAllHackathons(),
    blogs: loadFrontmatter("blogs").filter((blog) => !blog.draft),
    talks: loadFrontmatter("talks"),
  });
  for (const folder of folders) {
    for (const item of folder.items) {
      const size = item.img && !item.logo ? await imageSize(item.img) : null;
      item.ratio = size ? Math.round((size.w / size.h) * 1000) / 1000 : 1.6;
    }
  }
  return folders;
}

// Which folder a detail page lives in, and what comes next in it.
export function findInFolders(folders, href) {
  for (const folder of folders) {
    const index = folder.items.findIndex((item) => item.href === href);
    if (index < 0) continue;
    const next = folder.items[(index + 1) % folder.items.length];
    return {
      folder,
      item: folder.items[index],
      index,
      next: next.href === href ? null : next,
    };
  }
  return null;
}
