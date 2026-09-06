import { Fragment } from "react";
import type { Block, RichText } from "@/lib/notion";

/** Notion's inline formatting, as spans and links. */
function Text({ runs }: { runs: RichText[] }) {
  return (
    <>
      {runs.map((run, i) => {
        let node = <>{run.text}</>;
        if (run.code) node = <code className="blog-code-inline">{node}</code>;
        if (run.bold) node = <strong>{node}</strong>;
        if (run.italic) node = <em>{node}</em>;
        if (run.strikethrough) node = <s>{node}</s>;
        if (run.href) {
          node = (
            <a
              className="blog-link"
              href={run.href}
              target={run.href.startsWith("/") ? undefined : "_blank"}
              rel={run.href.startsWith("/") ? undefined : "noreferrer"}
            >
              {node}
            </a>
          );
        }
        return <Fragment key={i}>{node}</Fragment>;
      })}
    </>
  );
}

/** Renders the flattened block list from `getPostBlocks`. */
export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading": {
            const H = `h${block.level + 1}` as "h2" | "h3" | "h4";
            return (
              <H key={i} className={`blog-h${block.level}`}>
                <Text runs={block.text} />
              </H>
            );
          }
          case "paragraph":
            return (
              <p key={i} className="blog-p">
                <Text runs={block.text} />
              </p>
            );
          case "quote":
            return (
              <blockquote key={i} className="blog-quote">
                <Text runs={block.text} />
              </blockquote>
            );
          case "code":
            return (
              <pre key={i} className="blog-pre">
                <code>{block.text}</code>
              </pre>
            );
          case "divider":
            return <hr key={i} className="blog-hr" />;
          case "list": {
            const L = block.ordered ? "ol" : "ul";
            return (
              <L key={i} className="blog-list">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Text runs={item.text} />
                    {item.children.length > 0 && <Blocks blocks={item.children} />}
                  </li>
                ))}
              </L>
            );
          }
        }
      })}
    </>
  );
}
