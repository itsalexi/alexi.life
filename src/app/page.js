import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import HomeScreen from "@/components/home/HomeScreen";
import { loadAllHackathons } from "@/lib/hackathons";
import { buildHomeFolders } from "@/lib/home-folders";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata = createMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
  image: "/og?page=home",
  absoluteTitle: true,
});

function loadFrontmatter(folder) {
  const directory = path.join(process.cwd(), "src/content", folder);
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { data } = matter(
        fs.readFileSync(path.join(directory, file), "utf8"),
      );
      return { slug: file.replace(".md", ""), ...data };
    });
}

export default function Home() {
  const folders = buildHomeFolders({
    projects: loadFrontmatter("projects"),
    hackathons: loadAllHackathons(),
    blogs: loadFrontmatter("blogs").filter((blog) => !blog.draft),
    talks: loadFrontmatter("talks"),
  });

  return <HomeScreen folders={folders} />;
}
