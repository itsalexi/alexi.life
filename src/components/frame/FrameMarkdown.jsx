import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getReactNodeText } from "@/lib/react-node-text";
import { createHeadingIdResolver } from "@/lib/table-of-contents.mjs";

// Article body on the light canvas. Images get their alt text as a caption underneath,
// unless that alt text is just a filename (never show those).
const isFilename = (alt = "") =>
  /\.(png|jpe?g|webp|gif|avif|svg|heic)$/i.test(alt.trim()) ||
  /^(img|image|screenshot|photo)[\s_-]*[\d_-]*$/i.test(alt.trim());
const caption = (alt) => (alt && !isFilename(alt) ? alt.trim() : "");
export default function FrameMarkdown({ content, headings, skip }) {
  const resolveId = createHeadingIdResolver(headings);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => (
          <h2 id={resolveId(2, getReactNodeText(children))}>{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 id={resolveId(3, getReactNodeText(children))}>{children}</h3>
        ),
        a: ({ node, href = "", ...props }) => {
          const external = /^https?:\/\//.test(href);
          return (
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              {...props}
            />
          );
        },
        img: ({ node, src, alt }) => {
          // the page's hero is already shown up top
          if (skip && src?.split("?")[0] === skip.split("?")[0]) return null;
          const name = caption(alt);
          return (
            <span className="fp-img" data-zoom>
              {/* biome-ignore lint/performance/noImgElement: markdown images have unknown sizes */}
              <img src={src} alt={name} loading="lazy" />
              {name ? <span className="fp-cap">{name}</span> : null}
            </span>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
