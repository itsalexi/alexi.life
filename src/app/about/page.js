import AboutPage from "@/components/about/AboutPage";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About",
  description:
    "About Alexi Canamo, a 19-year-old product and AI engineer in Manila: every version so far, from three radio buttons to building AI products.",
  path: "/about",
  image: "/og?page=about",
});

export default function Page() {
  return <AboutPage />;
}
