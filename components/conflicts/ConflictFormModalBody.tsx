"use client";

import { useState, useEffect } from "react";
import { Calendar, ImagePlus, X } from "lucide-react";
import { COUNTRY_FORM_OPTIONS } from "@/lib/countries";
import type { Conflict, ConflictStatus, ConflictType, Impact } from "@/types/models";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const statuses: ConflictStatus[] = ["Active", "Outdated"];
const conflictTypes: ConflictType[] = ["low", "medium", "high", "critical"];
const impacts: Impact[] = ["local", "regional", "global"];

type Props = {
  mode: "add" | "edit";
  initial?: Conflict;
  onCancel: () => void;
  /** Called with a FormData payload (so the API can store uploaded images). */
  onSubmit: (data: FormData) => Promise<void>;
};

export function ConflictFormModalBody({ mode, initial, onCancel, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<ConflictStatus>("Active");
  const [conflictType, setConflictType] = useState<ConflictType>("low");
  const [impact, setImpact] = useState<Impact | "">("");
  const [date, setDate] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description);
      const match = COUNTRY_FORM_OPTIONS.find(
        (c) => initial.country === c || initial.country.includes(c) || c.includes(initial.country)
      );
      setCountry(match || COUNTRY_FORM_OPTIONS[0] || "");
      setStatus(initial.status);
      setConflictType(initial.conflictType || "low");
      setImpact((initial.impact as Impact | null) || "");
      setDate(initial.date);
      setImages([]);
    } else {
      setTitle("");
      setDescription("");
      setCountry("");
      setStatus("Active");
      setConflictType("low");
      setImpact("");
      setDate(new Date().toISOString().slice(0, 10));
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
    if (!title.trim() || !description.trim() || !country || !date) {
      setErr("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("country", country.trim());
      fd.append("status", status);
      fd.append("conflictType", conflictType);
      fd.append("impact", impact || "");
      fd.append("date", date);
      for (const f of images) fd.append("images", f);
      await onSubmit(fd);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col overflow-auto grow">
      {err && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </p>
      )}
      <div className="space-y-4 px-4 py-2 overflow-auto grow">
        <div>
          <label className="text-sm font-medium text-[#001f3f]">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter conflict title"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#001f3f]">
            Description <span className="text-red-600">*</span>
          </label>
          <textarea
            className="mt-1 min-h-[88px] w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a brief description of the conflict..."
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#001f3f]">
            Country <span className="text-red-600">*</span>
          </label>
          <select
            className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          >
            <option value="">Select Country</option>
            {COUNTRY_FORM_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-[#001f3f]">
            Status <span className="text-red-600">*</span>
          </label>
          <select
            className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as ConflictStatus)}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-[#001f3f]">
            Severity <span className="text-red-600">*</span>
          </label>
          <select
            className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
            value={conflictType}
            onChange={(e) => setConflictType(e.target.value as ConflictType)}
          >
            {conflictTypes.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <p className="mt-0.5 text-xs text-gray-500">
            How severe the conflict is (low → critical).
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#001f3f]">Impact (Geographic Reach)</label>
          <select
            className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
            value={impact}
            onChange={(e) => setImpact(e.target.value as Impact | "")}
          >
            <option value="">— Not set —</option>
            {impacts.map((i) => (
              <option key={i} value={i}>
                {i.charAt(0).toUpperCase() + i.slice(1)}
              </option>
            ))}
          </select>
          <p className="mt-0.5 text-xs text-gray-500">
            How far the conflict&apos;s impact reaches: Local (one country), Regional (neighbouring
            countries), Global (worldwide).
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#001f3f]">
            Date <span className="text-red-600">*</span>
          </label>
          <div className="relative mt-1">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              className="w-full rounded border border-gray-300 py-2 pl-10 pr-3 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <p className="mt-0.5 text-xs text-gray-500">Select Date</p>
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
                    alt="Conflict"
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
            Optional. Pick one or more images to attach. Existing images are kept; new uploads are
            appended.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 px-4 py-2">
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
          {loading ? "…" : mode === "add" ? "Add Conflict" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
