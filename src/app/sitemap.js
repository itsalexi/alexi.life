import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { WORK } from "@/lib/home-folders";
import { siteConfig } from "@/lib/seo";

function fileModifiedAt(relativePath) {
  const filePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) return new Date();
  return fs.statSync(filePath).mtime;
}

function staticPage(route, filePath, priority, changeFrequency = "monthly") {
  return {
    url: `${siteConfig.url}${route}`,
    lastModified: fileModifiedAt(filePath),
    changeFrequency,
    priority,
  };
}

function contentPages(contentDir, routePrefix, priority) {
  const directory = path.join(process.cwd(), contentDir);
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .filter((file) => {
      const { data } = matter(
        fs.readFileSync(path.join(directory, file), "utf8"),
      );
      return !data.draft && !data.hidden;
    })
    .map((file) => {
      const slug = file.replace(".md", "");
      const filePath = path.join(directory, file);
      return {
        url: `${siteConfig.url}${routePrefix}/${slug}`,
        lastModified: fs.statSync(filePath).mtime,
        changeFrequency: "monthly",
        priority,
      };
    });
}

// /projects, /blog, /talks, /hackathons and /work only redirect into a home folder now, so
// they're left out; every page inside them is listed.
export default function sitemap() {
  return [
    staticPage("/", "src/app/page.js", 1, "weekly"),
    staticPage("/about", "src/components/about/content.js", 0.8),
    staticPage("/contact", "src/app/contact/page.js", 0.6),
    ...WORK.map((w) => staticPage(w.href, "src/lib/home-folders.js", 0.75)),
    ...contentPages("src/content/projects", "/projects", 0.75),
    ...contentPages("src/content/blogs", "/blog", 0.65),
    ...contentPages("src/content/talks", "/talks", 0.6),
    ...contentPages("src/content/hackathons", "/hackathons", 0.65),
  ];
}
