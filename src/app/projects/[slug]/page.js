import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import FolderPage from "@/components/frame/FolderPage";
import FrameMarkdown from "@/components/frame/FrameMarkdown";
import { findInFolders, loadHomeFolders } from "@/lib/content";
import { imageSize } from "@/lib/image-size";
import { calculateReadingTime } from "@/lib/reading-time";
import { createMetadata } from "@/lib/seo";
import { extractMarkdownHeadings } from "@/lib/table-of-contents.mjs";
import { getProjectTechLabels } from "@/lib/tech-stack";

// Generate metadata for each project
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const projectsDirectory = path.join(process.cwd(), "src/content/projects");
  const filePath = path.join(projectsDirectory, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return {
      title: "Project Not Found",
    };
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data: frontmatter } = matter(fileContents);
  const stats = fs.statSync(filePath);

  return createMetadata({
    title: frontmatter.title,
    description:
      frontmatter.tagline ||
      frontmatter.shortDescription ||
      frontmatter.description ||
      `${frontmatter.title} is a project by Alexi Canamo.`,
    path: `/projects/${slug}`,
    image: `/projects/${slug}/opengraph-image`,
    type: "article",
    modifiedTime: stats.mtime.toISOString(),
  });
}

// Generate static params for all projects
export async function generateStaticParams() {
  const projectsDirectory = path.join(process.cwd(), "src/content/projects");

  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  const files = fs.readdirSync(projectsDirectory);

  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({
      slug: file.replace(".md", ""),
    }));
}

const firstSentence = (text) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s/)[0];

// The project, opened from its folder on home (Built, or Work for org systems).
export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const filePath = path.join(
    process.cwd(),
    "src/content/projects",
    `${slug}.md`,
  );
  if (!fs.existsSync(filePath)) notFound();

  const { data: project, content } = matter(fs.readFileSync(filePath, "utf8"));
  const folders = await loadHomeFolders();
  const found = findInFolders(folders, `/projects/${slug}`);
  const folder = found?.folder ?? folders.find((f) => f.name === "Built");
  const item = {
    title: project.title,
    line: found?.item.line ?? firstSentence(project.tagline),
    meta: found?.item.meta ?? "Project",
    when: found?.item.when ?? "",
    note: found?.item.note,
  };
  const links = [
    project.liveUrl && { label: "Live site", href: project.liveUrl },
    project.githubUrl && { label: "Code", href: project.githubUrl },
  ].filter(Boolean);
  const headings = extractMarkdownHeadings(content);

  const heroSrc = project.heroImage || project.image;
  const heroSize = await imageSize(heroSrc);
  return (
    <FolderPage
      folder={folder}
      index={found?.index ?? -1}
      item={item}
      next={found?.next ?? (found ? null : folder.items[0])}
      hero={heroSrc}
      heroSize={heroSize}
      heroKind="ui"
      links={links}
      chips={getProjectTechLabels(project.techStack || []).slice(0, 6)}
      chipsLabel="Stack"
      headings={headings}
      docLabel="Case study"
      readTime={calculateReadingTime(content)}
    >
      <FrameMarkdown content={content} headings={headings} skip={heroSrc} />
    </FolderPage>
  );
}
