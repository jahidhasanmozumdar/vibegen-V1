import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Tiny, safe Markdown renderer for CMS content. It produces React elements
 * (so everything is escaped) and supports exactly the subset the CMS
 * documents: ## / ### headings, paragraphs, - and 1. lists, > quotes, ---,
 * **bold**, *italic*, `code` and [links](url). Raw HTML is never rendered.
 */

type Block =
  | { type: "h2" | "h3" | "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "hr" };

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "p", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{2,3})\s+(.*)$/))) {
      flushParagraph();
      flushList();
      blocks.push({ type: m[1].length === 2 ? "h2" : "h3", text: m[2] });
    } else if (/^(-{3,}|\*{3,})$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "hr" });
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", text: m[1] });
    } else if ((m = line.match(/^[-*]\s+(.*)$/))) {
      flushParagraph();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(m[1]);
    } else if ((m = line.match(/^\d+[.)]\s+(.*)$/))) {
      flushParagraph();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(m[1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

function isSafeHref(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#") || /^https?:\/\//i.test(href) || href.startsWith("mailto:");
}

/** Inline formatting: links, bold, italic, code. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${i++}`;
    if (match[1] !== undefined) {
      const href = match[2];
      if (!isSafeHref(href)) out.push(match[1]);
      else if (href.startsWith("/")) out.push(<Link key={key} href={href}>{match[1]}</Link>);
      else out.push(<a key={key} href={href} rel="noopener noreferrer" target="_blank">{match[1]}</a>);
    } else if (match[3] !== undefined) out.push(<strong key={key}>{match[3]}</strong>);
    else if (match[4] !== undefined) out.push(<em key={key}>{match[4]}</em>);
    else if (match[5] !== undefined) out.push(<code key={key}>{match[5]}</code>);
    last = pattern.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*`[\]()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function Markdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  return (
    <>
      {blocks.map((block, i) => {
        const key = `b${i}`;
        switch (block.type) {
          case "h2":
            return (
              <h2 key={key} id={slugifyHeading(block.text)}>
                {renderInline(block.text, key)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={key} id={slugifyHeading(block.text)}>
                {renderInline(block.text, key)}
              </h3>
            );
          case "quote":
            return <blockquote key={key}>{renderInline(block.text, key)}</blockquote>;
          case "hr":
            return <hr key={key} />;
          case "ul":
          case "ol": {
            const Tag = block.type;
            return (
              <Tag key={key}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </Tag>
            );
          }
          default:
            return <p key={key}>{renderInline(block.text, key)}</p>;
        }
      })}
    </>
  );
}

/** h2 headings for a table of contents. */
export function extractHeadings(source: string): { id: string; text: string }[] {
  return parseBlocks(source)
    .filter((b): b is { type: "h2"; text: string } => b.type === "h2")
    .map((b) => ({ id: slugifyHeading(b.text), text: b.text.replace(/[*`]/g, "") }));
}

export function readingMinutes(source: string): number {
  return Math.max(1, Math.ceil(source.split(/\s+/).filter(Boolean).length / 220));
}
