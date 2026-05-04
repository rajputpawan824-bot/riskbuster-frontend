"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { COUNTRY_FORM_OPTIONS } from "@/lib/countries";
import type { Conflict, ConflictStatus, ConflictType } from "@/types/models";

const statuses: ConflictStatus[] = ["Active", "Outdated"];
const conflictTypes: ConflictType[] = ["low", "medium", "high", "critical"];

type Props = {
  mode: "add" | "edit";
  initial?: Conflict;
  onCancel: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    country: string;
    status: ConflictStatus;
    conflictType: ConflictType;
    date: string;
  }) => Promise<void>;
};

export function ConflictFormModalBody({ mode, initial, onCancel, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<ConflictStatus>("Active");
  const [conflictType, setConflictType] = useState<ConflictType>("low");
  const [date, setDate] = useState("");
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
      setDate(initial.date);
    } else {
      setTitle("");
      setDescription("");
      setCountry("");
      setStatus("Active");
      setConflictType("low");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [initial, mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!title.trim() || !description.trim() || !country || !date) {
      setErr("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        country: country.trim(),
        status,
        conflictType,
        date,
      });
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
          Conflict Type <span className="text-red-600">*</span>
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
      <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
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
