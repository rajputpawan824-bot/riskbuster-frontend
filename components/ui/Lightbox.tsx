"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  open: boolean;
  images: string[];
  /** Index to show first when opening. */
  startIndex?: number;
  onClose: () => void;
  /** Optional caption / alt text base, e.g. the title of the parent entity. */
  alt?: string;
};

/**
 * Full-screen image viewer with prev/next navigation, keyboard support and
 * tap-to-close on the backdrop. Renders nothing when `open` is false.
 */
export function Lightbox({ open, images, startIndex = 0, onClose, alt }: Props) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    if (open) setIndex(Math.min(Math.max(startIndex, 0), Math.max(images.length - 1, 0)));
  }, [open, startIndex, images.length]);

  const next = useCallback(() => {
    if (images.length === 0) return;
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    if (images.length === 0) return;
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, next, prev, onClose]);

  if (!open || images.length === 0) return null;

  const current = images[index];
  const showNav = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20"
        title="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {showNav && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20 sm:left-6"
          title="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {showNav && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20 sm:right-6"
          title="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <figure
        className="relative flex max-h-full max-w-full items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={alt ? `${alt} — image ${index + 1}` : `Image ${index + 1}`}
          className="max-h-[88vh] max-w-[92vw] rounded-md object-contain shadow-2xl"
        />
        {showNav && (
          <figcaption className="absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {index + 1} / {images.length}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
