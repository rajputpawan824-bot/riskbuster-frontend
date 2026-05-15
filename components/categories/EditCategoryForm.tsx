"use client";

import { useState, useEffect, useMemo } from "react";
import { apiPost, apiPostForm, apiPut, apiPutForm } from "@/lib/api";
import type { Category } from "@/types/models";

type Props = {
  mode: "add" | "edit";
  initial?: Category;
  /** All categories (e.g. from nav) — used to build parent dropdown (top-level only) */
  allCategories: Category[];
  onCancel: () => void;
  onSaved: () => void;
};

export function EditCategoryForm({ mode, initial, allCategories, onCancel, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [creditTo, setCreditTo] = useState("");
  const [description, setDescription] = useState("");
  const [fileLink, setFileLink] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [parentId, setParentId] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parentOptions = useMemo(() => {
    const excludeId = mode === "edit" && initial ? initial.id : null;
    return allCategories.filter((c) => !c.parentId && (!excludeId || c.id !== excludeId));
  }, [allCategories, mode, initial]);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setCreditTo(initial.creditTo);
      setDescription(initial.description);
      setFileLink(initial.fileLink);
      setFiles([]);
      setParentId(initial.parentId ?? "");
    } else {
      setTitle("");
      setCreditTo("");
      setDescription("");
      setFileLink("");
      setFiles([]);
      setParentId("");
    }
  }, [initial, mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const trimmedParent = parentId.trim() ? parentId.trim() : "";
      const useMultipart = files.length > 0;

      if (useMultipart) {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("creditTo", creditTo);
        fd.append("description", description);
        fd.append("fileLink", fileLink);
        fd.append("parentId", trimmedParent);
        for (const f of files) fd.append("files", f);
        if (mode === "add") {
          await apiPostForm<Category>("/api/categories", fd);
        } else if (initial) {
          await apiPutForm<Category>(`/api/categories/${initial.id}`, fd);
        }
      } else {
        const body = {
          title,
          creditTo,
          description,
          fileLink,
          parentId: trimmedParent ? trimmedParent : null,
        };
        if (mode === "add") {
          await apiPost<Category>("/api/categories", body);
        } else if (initial) {
          await apiPut<Category>(`/api/categories/${initial.id}`, body);
        }
      }
      onSaved();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </p>
      )}
      <div>
        <label htmlFor="cat-parent" className="text-sm font-medium text-[#001f3f]">
          Parent category
        </label>
        <select
          id="cat-parent"
          className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
        >
          <option value="">None — top-level category</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          If you pick a category above, this entry is saved as a <strong>subcategory</strong> of that
          parent. Leave &quot;None&quot; for a new top-level category.
        </p>
      </div>
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
          Credit To <span className="text-red-600">*</span>
        </label>
        <input
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={creditTo}
          onChange={(e) => setCreditTo(e.target.value)}
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
        {!!(initial?.fileLinks?.length || initial?.fileLink?.trim()) && (
          <div className="mt-1 space-y-1 text-xs text-gray-600">
            <p className="font-medium">Current files:</p>
            <ul className="list-disc pl-5">
              {(initial?.fileLinks?.length ? initial.fileLinks : initial?.fileLink?.trim() ? [initial.fileLink] : []).map(
                (l) => (
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
                )
              )}
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
          Choose one or more files to upload (optional). If you don’t select files, existing uploads are kept.
        </p>
      </div>
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
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
          {loading ? "…" : mode === "add" ? "Add Category" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
