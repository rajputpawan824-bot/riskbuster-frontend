"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "md" | "lg";
  bodyClassName?: string;
};

export function Modal({
  open,
  title,
  onClose,
  children,
  size = "md",
  bodyClassName,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // outside click
  const handleOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      onMouseDown={handleOutside}
    >
      <div
        ref={modalRef}
        className={`${
          size === "lg" ? "max-w-2xl" : "max-w-md"
        } w-full h-[90vh] flex flex-col rounded-xl bg-white shadow-xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-bold text-[#001f3f]">{title}</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body (NO scroll, fits inside) */}
        <div className="flex-1 flex flex-col overflow-auto">
          <div className={`flex flex-col grow overflow-auto ${bodyClassName ?? ""}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}