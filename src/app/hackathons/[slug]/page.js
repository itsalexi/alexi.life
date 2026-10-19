import fs from "node:fs";
import { notFound } from "next/navigation";
import FolderPage from "@/components/frame/FolderPage";
import FrameMarkdown from "@/components/frame/FrameMarkdown";
import { findInFolders, loadHomeFolders } from "@/lib/content";
import { getHackathonBySlug, getHackathonsDirectory } from "@/lib/hackathons";
import { firstSentence, shortDate } from "@/lib/home-folders";
import { imageSize } from "@/lib/image-size";
import { calculateReadingTime } from "@/lib/reading-time";
import { createMetadata, dateToIso } from "@/lib/seo";
import { extractMarkdownHeadings } from "@/lib/table-of-contents.mjs";

export async function generateStaticParams() {
  const dir = getHackathonsDirectory();
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({ slug: file.replace(".md", "") }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const hackathon = getHackathonBySlug(slug);
  if (!hackathon) {
    return { title: "Hackathon Not Found" };
  }
  const description =
    hackathon.highlights?.[0] ||
    `${hackathon.title} — ${hackathon.event} (${hackathon.result})`;
  const filePath = `${getHackathonsDirectory()}/${slug}.md`;
  const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;

  return createMetadata({
    title: hackathon.title,
    description,
    path: `/hackathons/${slug}`,
    image: `/hackathons/${slug}/opengraph-image`,
    type: "article",
    publishedTime: dateToIso(hackathon.date),
    modifiedTime: stats?.mtime.toISOString(),
  });
}

// The hackathon, opened from the Weekends folder on home.
export default async function HackathonDetailPage({ params }) {
  const { slug } = await params;
  const hackathon = getHackathonBySlug(slug);
  if (!hackathon) notFound();

  const folders = await loadHomeFolders();
  const found = findInFolders(folders, `/hackathons/${slug}`);
  const folder = found?.folder ?? folders.find((f) => f.name === "Weekends");
  const item = {
    title: hackathon.title,
    res: hackathon.result,
    meta: found?.item.meta ?? hackathon.event,
    when: found?.item.when ?? shortDate(hackathon.date),
    line: found?.item.line ?? firstSentence(hackathon.highlights?.[0]),
    note: found?.item.note,
  };
  const link = hackathon.link;
  const linkLabel = link?.includes("github.com")
    ? "Code"
    : link?.includes("linkedin.com")
      ? "LinkedIn post"
      : "Post";
  const headings = extractMarkdownHeadings(hackathon.content);
  const hero = hackathon.heroImage || hackathon.image || hackathon.images?.[0];

  const heroSrc = hero;
  const heroSize = await imageSize(heroSrc);
  const gallery = await Promise.all(
    (hackathon.images || [])
      .filter((src) => src !== hero)
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
      links={link ? [{ label: linkLabel, href: link }] : []}
      headings={headings}
      docLabel="Weekend build"
      readTime={calculateReadingTime(hackathon.content)}
      glance={hackathon.highlights || []}
      gallery={gallery}
    >
      <FrameMarkdown
        content={hackathon.content}
        headings={headings}
        skip={heroSrc}
      />
    </FolderPage>
  );
}
