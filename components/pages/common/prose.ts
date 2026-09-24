/**
 * "Premium Calm" reading prose for Markdown / long-form content (blog
 * articles, legal pages). Geist at 17px with a generous line height, fg-2
 * body, fg headings, brand links. Apply to the element that directly wraps
 * the rendered blocks; keep the column ~680px wide.
 */
export const proseCalm = [
  "text-[17px] leading-[1.75] text-fg-2 tracking-[-0.005em]",
  "[&>*+*]:mt-6",
  "[&_h2]:mt-14 [&_h2]:text-[27px] [&_h2]:leading-[1.2] [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-fg [&_h2]:text-balance",
  "[&_h3]:mt-10 [&_h3]:text-[20px] [&_h3]:leading-snug [&_h3]:font-semibold [&_h3]:tracking-[-0.02em] [&_h3]:text-fg",
  "[&>h2:first-child]:mt-0 [&_h2+*]:mt-4 [&_h3+*]:mt-3",
  "[&_a]:font-medium [&_a]:text-brand [&_a]:underline [&_a]:decoration-brand/30 [&_a]:underline-offset-4 [&_a:hover]:decoration-brand",
  "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_li]:pl-1 [&_li]:marker:text-fg-3",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-5 [&_blockquote]:text-[19px] [&_blockquote]:leading-relaxed [&_blockquote]:text-fg",
  "[&_code]:rounded-md [&_code]:bg-soft [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-fg",
  "[&_strong]:font-semibold [&_strong]:text-fg",
  "[&_hr]:my-12 [&_hr]:border-hair",
].join(" ");
