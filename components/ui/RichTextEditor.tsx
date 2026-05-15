"use client";

import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

/**
 * Lightweight rich-text editor built on `contenteditable` + `document.execCommand`.
 * No external deps. Output is HTML that the backend sanitizes before storing.
 */
export function RichTextEditor({ value, onChange, placeholder, minHeight = 220 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isEmpty, setIsEmpty] = useState(!value || value.trim() === "");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if ((value || "") !== el.innerHTML) {
      el.innerHTML = value || "";
      setIsEmpty(!el.textContent?.trim());
    }
  }, [value]);

  const exec = useCallback(
    (command: string, arg?: string) => {
      ref.current?.focus();
      try {
        document.execCommand(command, false, arg);
      } catch {
        // ignore — execCommand is deprecated but still works
      }
      const el = ref.current;
      if (el) {
        onChange(el.innerHTML);
        setIsEmpty(!el.textContent?.trim());
      }
    },
    [onChange]
  );

  const handleInput = () => {
    const el = ref.current;
    if (!el) return;
    onChange(el.innerHTML);
    setIsEmpty(!el.textContent?.trim());
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL", "https://");
    if (!url) return;
    const safe = url.trim();
    if (!safe || safe.toLowerCase().startsWith("javascript:")) return;
    exec("createLink", safe);
  };

  const setBlock = (tag: string) => {
    exec("formatBlock", `<${tag}>`);
  };

  const btn =
    "inline-flex h-8 w-8 items-center justify-center rounded border border-transparent text-gray-600 hover:bg-gray-100 hover:text-[#001f3f] focus:outline-none focus-visible:border-[#001f3f]/40";

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <select
          className="h-8 rounded border border-gray-200 bg-white px-2 text-xs text-gray-700 hover:bg-gray-50"
          value=""
          onChange={(e) => {
            const v = e.target.value;
            if (v) setBlock(v);
            e.currentTarget.value = "";
          }}
          title="Heading"
        >
          <option value="">Style</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="pre">Code block</option>
        </select>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <button type="button" className={btn} onClick={() => exec("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onClick={() => exec("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onClick={() => exec("underline")} title="Underline">
          <Underline className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => exec("strikeThrough")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <button
          type="button"
          className={btn}
          onClick={() => exec("insertUnorderedList")}
          title="Bulleted list"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => exec("insertOrderedList")}
          title="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => setBlock("blockquote")}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <button type="button" className={btn} onClick={insertLink} title="Insert link">
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => exec("removeFormat")}
          title="Clear formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <button type="button" className={btn} onClick={() => exec("undo")} title="Undo">
          <Undo2 className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onClick={() => exec("redo")} title="Redo">
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        {isEmpty && placeholder && (
          <p className="pointer-events-none absolute left-3 top-2 text-sm text-gray-400">
            {placeholder}
          </p>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleInput}
          className="prose-rb min-h-[var(--rt-min-h)] max-w-none px-3 py-2 text-sm text-[#1f2937] focus:outline-none"
          style={{ ["--rt-min-h" as string]: `${minHeight}px` }}
        />
      </div>
    </div>
  );
}
