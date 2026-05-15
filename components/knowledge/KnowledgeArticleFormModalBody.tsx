"use client";

import { useEffect, useState } from "react";
import { Calendar, ImagePlus, X } from "lucide-react";
import { COUNTRY_FORM_OPTIONS } from "@/lib/countries";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import type { KnowledgeArticle } from "@/types/models";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Props = {
  mode: "add" | "edit";
  initial?: KnowledgeArticle;
  onCancel: () => void;
  onSubmit: (data: FormData) => Promise<void>;
};

export function KnowledgeArticleFormModalBody({ mode, initial, onCancel, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [postedDate, setPostedDate] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setCountry(initial.country || "");
      setPostedDate(initial.postedDate || "");
      setDescription(initial.description || "");
      setImages([]);
    } else {
      setTitle("");
      setCountry("");
      setPostedDate(new Date().toISOString().slice(0, 10));
      setDescription("");
      setImages([]);
    }
  }, [initial, mode]);

  const existingImages =
    initial?.imageLinks && initial.imageLinks.length > 0
      ? initial.imageLinks
      : initial?.imageLink
      ? [initial.imageLink]
      : [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const plain = description.replace(/<[^>]+>/g, "").trim();
    if (!title.trim() || !postedDate || !plain) {
      setErr("Title, posted date and description are required.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("country", country.trim());
      fd.append("postedDate", postedDate);
      fd.append("description", description);
      for (const f of images) fd.append("images", f);
      await onSubmit(fd);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
      {err && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </p>
      )}
      <div>
        <label className="text-sm font-medium text-[#001f3f]">
          Title <span className="text-red-600">*</span>
        </label>
        <input
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter article title"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-[#001f3f]">Country</label>
          <select
            className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">— Optional —</option>
            {COUNTRY_FORM_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-[#001f3f]">
            Posted Date <span className="text-red-600">*</span>
          </label>
          <div className="relative mt-1">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              className="w-full rounded border border-gray-300 py-2 pl-10 pr-3 text-sm"
              value={postedDate}
              onChange={(e) => setPostedDate(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#001f3f]">
          Description <span className="text-red-600">*</span>
        </label>
        <div className="mt-1">
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Write the article content here…"
            minHeight={240}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Use the toolbar to format your text — headings, bold/italic, lists, links and quotes.
        </p>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-[#001f3f]">
          <ImagePlus className="h-4 w-4" />
          Images
        </label>
        {existingImages.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {existingImages.map((url) => (
              <a
                key={url}
                href={`${API_BASE}${url}`}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded border border-gray-200 bg-gray-50"
                title="Open image"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${API_BASE}${url}`}
                  alt="Article"
                  className="h-20 w-full object-cover transition group-hover:opacity-90"
                />
              </a>
            ))}
          </div>
        )}
        <input
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files || []))}
        />
        {images.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {images.map((f, i) => (
              <span
                key={`${f.name}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-800"
              >
                {f.name}
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="rounded-full p-0.5 hover:bg-blue-100"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Optional. Existing images are kept; new uploads are appended.
        </p>
      </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border-2 border-[#001f3f] bg-white px-4 py-2 text-sm font-semibold text-[#001f3f] hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[#001f3f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#002b52] disabled:opacity-60"
        >
          {loading ? "…" : mode === "add" ? "Publish Article" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
