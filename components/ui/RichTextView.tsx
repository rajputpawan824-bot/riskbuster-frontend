"use client";

type Props = {
  html: string;
  className?: string;
};

/**
 * Renders sanitized HTML produced by the rich-text editor with consistent
 * project typography. The HTML is sanitized server-side before storage.
 */
export function RichTextView({ html, className = "" }: Props) {
  return (
    <div
      className={`prose-rb max-w-none text-sm leading-relaxed text-gray-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
}
