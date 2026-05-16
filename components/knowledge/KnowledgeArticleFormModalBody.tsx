"use client";

import { useEffect, useState } from "react";
import { Calendar, FilePlus, X, FileText } from "lucide-react";
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

export function KnowledgeArticleFormModalBody({
  mode,
  initial,
  onCancel,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [postedDate, setPostedDate] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [removedExistingFiles, setRemovedExistingFiles] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urls: Record<string, string> = {};
    files.forEach((f, i) => {
      urls[`${f.name}-${i}`] = URL.createObjectURL(f);
    });

    setPreviews(urls);

    return () => {
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setCountry(initial.country || "");
      setPostedDate(initial.postedDate || "");
      setDescription(initial.description || "");
      setFiles([]);
    } else {
      setTitle("");
      setCountry("");
      setPostedDate(new Date().toISOString().slice(0, 10));
      setDescription("");
      setFiles([]);
    }
  }, [initial, mode]);

  const existingFiles =
    initial?.fileLinks && initial.fileLinks.length > 0
      ? initial.fileLinks
      : initial?.fileLink
      ? [initial.fileLink]
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

      for (const f of files) {
        fd.append("files", f);
      }

      // include any existing files the user removed so server can delete them
      for (const r of removedExistingFiles) {
        fd.append("removeFiles", r);
      }

      await onSubmit(fd);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col overflow-auto">
      <div className="overflow-auto flex flex-col px-4 py-2">
        <div className="flex flex-col gap-6">
          {/* Left files panel */}
          

          {/* Main form fields */}
          <div className="flex-1 space-y-4">
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
                <RichTextEditor value={description} onChange={setDescription} placeholder="Write the article content here…" minHeight={240} />
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Use the toolbar to format your text — headings, bold/italic, lists,
                links and quotes.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#001f3f]">
              <FilePlus className="h-4 w-4" />
              Files
            </label>

            <div className="mt-2 space-y-2">
              {/* existing files (filter out removed) */}
              {existingFiles.length > 0 &&
                existingFiles
                  .filter((u) => !removedExistingFiles.includes(u))
                  .map((url) => {
                    const fileName = url.split("/").pop();

                    return (
                      <div key={url} className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                        <a
                          href={`${API_BASE}${url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 truncate text-left text-sm text-gray-800 underline"
                        >
                          {fileName}
                        </a>

                        <button
                          type="button"
                          onClick={() => setRemovedExistingFiles((prev) => [...prev, url])}
                          title="Remove"
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}

              {/* newly selected files with download and remove */}
              {files.length > 0 && (
                <div className="space-y-1">
                  {files.map((f, i) => {
                    const key = `${f.name}-${i}`;
                    const url = previews[key];

                    return (
                      <div key={key} className="flex items-center gap-2 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-sm">
                        <a href={url} download={f.name} className="flex-1 truncate text-left text-sm text-blue-800 underline">
                          {f.name}
                        </a>

                        <button
                          type="button"
                          onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          title="Remove"
                          className="rounded p-1 hover:bg-blue-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* upload input */}
              <input
                className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />

              <p className="mt-1 text-xs text-gray-500">
                Optional. Existing files are kept; new uploads are appended.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap justify-end gap-3 border-t border-gray-100 px-3 py-2">
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
          {loading ? "…" : mode === "add"
            ? "Publish Article"
            : "Save changes"}
        </button>
      </div>
    </form>
  );
}