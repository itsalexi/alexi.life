import HomeScreen from "@/components/home/HomeScreen";
import { loadHomeFolders } from "@/lib/content";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata = createMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
  image: "/og?page=home",
  absoluteTitle: true,
});

export default async function Home() {
  return <HomeScreen folders={await loadHomeFolders()} />;
}
