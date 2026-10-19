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
import { absoluteUrl, createMetadata, dateToIso } from "@/lib/seo";
import { extractMarkdownHeadings } from "@/lib/table-of-contents.mjs";

// Generate static params for all blogs
export async function generateStaticParams() {
  const blogsDirectory = path.join(process.cwd(), "src/content/blogs");

  if (!fs.existsSync(blogsDirectory)) {
    return [];
  }

  const files = fs.readdirSync(blogsDirectory);

  return files
    .filter((file) => file.endsWith(".md"))
    .filter((file) => {
      const { data } = matter(
        fs.readFileSync(path.join(blogsDirectory, file), "utf8"),
      );
      return !data.draft;
    })
    .map((file) => ({
      slug: file.replace(".md", ""),
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const blogsDirectory = path.join(process.cwd(), "src/content/blogs");
  const filePath = path.join(blogsDirectory, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return {
      title: "Blog Not Found",
    };
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data: frontmatter } = matter(fileContents);
  const stats = fs.statSync(filePath);

  const ogImage = `/blog/${slug}/opengraph-image`;
  const metadata = createMetadata({
    title: frontmatter.title,
    description: frontmatter.excerpt || "Blog post by Alexi Canamo.",
    path: `/blog/${slug}`,
    image: ogImage,
    type: "article",
    publishedTime: dateToIso(frontmatter.date),
    modifiedTime: stats.mtime.toISOString(),
  });

  metadata.openGraph.images = [
    {
      url: absoluteUrl(ogImage),
      alt: `${frontmatter.title} preview`,
      width: 1200,
      height: 630,
      type: "image/png",
    },
  ];
  metadata.twitter.images = [absoluteUrl(ogImage)];

  return metadata;
}

// Server component - reads file at build time
// The post, opened from the Writing folder on home.
export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "src/content/blogs", `${slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const { data: blog, content } = matter(fs.readFileSync(filePath, "utf8"));
  // Drafts are previewable in dev only.
  if (blog.draft && process.env.NODE_ENV === "production") notFound();

  const folders = await loadHomeFolders();
  const found = findInFolders(folders, `/blog/${slug}`);
  const folder = found?.folder ?? folders.find((f) => f.name === "Writing");
  const item = {
    title: blog.title,
    meta: "Essay",
    when: shortDate(blog.date),
    line: blog.subtitle ?? found?.item.line ?? firstSentence(blog.excerpt),
  };
  const headings = extractMarkdownHeadings(content);

  const heroSrc = blog.heroImage || blog.image;
  const heroSize = await imageSize(heroSrc);
  return (
    <FolderPage
      folder={folder}
      index={found?.index ?? -1}
      item={item}
      next={found?.next ?? (found ? null : folder.items[0])}
      hero={heroSrc}
      heroSize={heroSize}
      heroKind="photo"
      chips={(blog.tags || []).slice(0, 4)}
      chipsLabel="Tags"
      headings={headings}
      docLabel="Essay"
      readTime={calculateReadingTime(content)}
    >
      <FrameMarkdown content={content} headings={headings} skip={heroSrc} />
    </FolderPage>
  );
}
