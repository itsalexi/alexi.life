import { notFound } from "next/navigation";
import FolderPage from "@/components/frame/FolderPage";
import FrameMarkdown from "@/components/frame/FrameMarkdown";
import experience from "@/data/experience.json";
import { findInFolders, loadHomeFolders } from "@/lib/content";
import { WORK } from "@/lib/home-folders";
import { createMetadata } from "@/lib/seo";
import { extractMarkdownHeadings } from "@/lib/table-of-contents.mjs";

const findExperience = (company) =>
  company
    ? experience.experiences
        .flatMap((year) => year.items)
        .find((e) => e.company === company)
    : null;

export function generateStaticParams() {
  return WORK.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const role = WORK.find((w) => w.slug === slug);
  if (!role) return { title: "Not found" };
  const exp = findExperience(role.experience);
  return createMetadata({
    title: `${role.title} · ${role.meta}`,
    description: exp?.summary || role.line,
    path: `/work/${slug}`,
  });
}

// A role, opened from the Work folder on home: the company's logo on its brand color,
// the summary as the lede, what shipped as the list, and anything related linked up top.
export default async function WorkPage({ params }) {
  const { slug } = await params;
  const role = WORK.find((w) => w.slug === slug);
  if (!role) notFound();

  const exp = findExperience(role.experience);
  const folders = await loadHomeFolders();
  const found = findInFolders(folders, `/work/${slug}`);
  const item = {
    title: role.title,
    meta: exp?.title || role.meta,
    when: exp?.duration || role.when,
    line: role.line,
  };
  // the summary leads, then what shipped
  const body = [
    exp?.summary || role.line,
    exp?.details?.length
      ? `## What I did\n\n${exp.details.map((d) => `- ${d}`).join("\n")}`
      : null,
    exp?.location ? `*${exp.location}*` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <FolderPage
      folder={found.folder}
      index={found.index}
      item={item}
      next={found.next}
      heroLogo={{ logo: role.logo, bg: role.bg, wide: Boolean(role.wide) }}
      links={role.related ? [role.related] : []}
      chips={(exp?.skills || []).slice(0, 4)}
    >
      <FrameMarkdown content={body} headings={extractMarkdownHeadings(body)} />
    </FolderPage>
  );
}
