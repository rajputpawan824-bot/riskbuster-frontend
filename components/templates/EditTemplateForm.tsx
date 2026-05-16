"use client";

import { useEffect, useState } from "react";
import { apiPostForm, apiPutForm } from "@/lib/api";
import type { Template } from "@/types/models";

type Props = {
  mode: "add" | "edit";
  initial?: Template;
  onCancel: () => void;
  onSaved: () => void;
};

export function EditTemplateForm({ mode, initial, onCancel, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileLink, setFileLink] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description);
      setFileLink(initial.fileLink);
      setFiles([]);
    } else {
      setTitle("");
      setDescription("");
      setFileLink("");
      setFiles([]);
    }
  }, [initial, mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("fileLink", fileLink);
      for (const f of files) fd.append("files", f);

      if (mode === "add") {
        await apiPostForm<Template>("/api/templates", fd);
      } else if (initial) {
        await apiPutForm<Template>(`/api/templates/${initial.id}`, fd);
      }
      onSaved();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const currentLinks =
    initial?.fileLinks && initial.fileLinks.length > 0
      ? initial.fileLinks
      : initial?.fileLink?.trim()
        ? [initial.fileLink]
        : [];

  return (
    <form onSubmit={submit} className="space-y-4 flex flex-col grow overflow-auto">
      {err && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p>
      )}
      <div className="px-4 py-2 overflow-auto">
        <div>
          <label className="text-sm font-medium text-[#001f3f]">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#001f3f]">
            Description <span className="text-red-600">*</span>
          </label>
          <textarea
            className="mt-1 min-h-[100px] w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
        <label className="text-sm font-medium text-[#001f3f]">Upload Files</label>
        {currentLinks.length > 0 && (
          <div className="mt-1 space-y-1 text-xs text-gray-600">
            <p className="font-medium">Current files:</p>
            <ul className="list-disc pl-5">
              {currentLinks.map((l) => (
                <li key={l}>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${l}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline"
                  >
                    View file
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <input
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        <p className="mt-1 text-xs text-gray-500">
          Choose one or more files to upload (optional). Existing uploads are kept.
        </p>
      </div>
        </div>
      <div className="mt-auto flex justify-end gap-3 border-t border-gray-100 px-3 py-2">
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
          {loading ? "…" : mode === "add" ? "Add Template" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

