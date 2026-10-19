import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import FolderPage from "@/components/frame/FolderPage";
import FrameMarkdown from "@/components/frame/FrameMarkdown";
import { findInFolders, loadHomeFolders } from "@/lib/content";
import { firstSentence, shortDate } from "@/lib/home-folders";
import { imageSize } from "@/lib/image-size";
import { calculateReadingTime } from "@/lib/reading-time";
import { createMetadata, dateToIso } from "@/lib/seo";
import { extractMarkdownHeadings } from "@/lib/table-of-contents.mjs";

// Generate metadata for each talk
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const talksDirectory = path.join(process.cwd(), "src/content/talks");
  const filePath = path.join(talksDirectory, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return {
      title: "Talk Not Found",
    };
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data: frontmatter } = matter(fileContents);
  const stats = fs.statSync(filePath);
  const description =
    frontmatter.shortDescription ||
    `${frontmatter.title} by Alexi Canamo at ${frontmatter.event}.`;

  return createMetadata({
    title: frontmatter.title,
    description,
    path: `/talks/${slug}`,
    image: `/talks/${slug}/opengraph-image`,
    type: "article",
    publishedTime: dateToIso(frontmatter.date),
    modifiedTime: stats.mtime.toISOString(),
  });
}

// Generate static params for all talks
export async function generateStaticParams() {
  const talksDirectory = path.join(process.cwd(), "src/content/talks");

  if (!fs.existsSync(talksDirectory)) {
    return [];
  }

  const files = fs.readdirSync(talksDirectory);

  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({
      slug: file.replace(".md", ""),
    }));
}

// Server component - reads file at build time
// The talk, opened from the Writing folder on home.
export default async function TalkDetailPage({ params }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "src/content/talks", `${slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const { data: talk, content } = matter(fs.readFileSync(filePath, "utf8"));
  const folders = await loadHomeFolders();
  const found = findInFolders(folders, `/talks/${slug}`);
  const folder = found?.folder ?? folders.find((f) => f.name === "Writing");
  const item = {
    title: talk.title,
    meta: `Talk · ${talk.event}`,
    when: shortDate(talk.date),
    line: found?.item.line ?? firstSentence(talk.shortDescription),
  };
  const headings = extractMarkdownHeadings(content);
  const images = talk.images || [];

  const heroSrc = talk.heroImage || images[0];
  const heroSize = await imageSize(heroSrc);
  const gallery = await Promise.all(
    images
      .filter((src) => src !== heroSrc)
      .map(async (src) => ({ src, ...(await imageSize(src)) })),
  );
  return (
    <FolderPage
      folder={folder}
      index={found?.index ?? -1}
      item={item}
      next={found?.next ?? (found ? null : folder.items[0])}
      hero={heroSrc}
      heroSize={heroSize}
      heroKind="photo"
      links={talk.link ? [{ label: "Watch", href: talk.link }] : []}
      chips={(talk.topics || []).slice(0, 4)}
      chipsLabel="Topics"
      headings={headings}
      docLabel="Talk notes"
      readTime={calculateReadingTime(content)}
      gallery={gallery}
    >
      <FrameMarkdown content={content} headings={headings} skip={heroSrc} />
    </FolderPage>
  );
}
