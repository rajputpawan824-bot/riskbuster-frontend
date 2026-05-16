"use client";

import { useEffect, useState } from "react";
import { WORLD_REGIONS } from "@/lib/countries";
import type { Country } from "@/types/models";

type Props = {
  mode: "add" | "edit";
  initial?: Country;
  onCancel: () => void;
  onSubmit: (data: { label: string; flag: string; region: string }) => Promise<void>;
};

export function CountryFormModalBody({ mode, initial, onCancel, onSubmit }: Props) {
  const [label, setLabel] = useState("");
  const [flag, setFlag] = useState("");
  const [region, setRegion] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setLabel(initial.label);
      setFlag(initial.flag || "");
      setRegion(initial.region || "");
    } else {
      setLabel("");
      setFlag("");
      setRegion("");
    }
  }, [initial, mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!label.trim()) {
      setErr("Country name is required.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ label: label.trim(), flag: flag.trim(), region: region.trim() });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col grow overflow-auto">
      <div className="overflow-auto space-y-4 px-4 py-2">
        {err && (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {err}
          </p>
        )}
        <div>
          <label className="text-sm font-medium text-[#001f3f]">
            Country Name <span className="text-red-600">*</span>
          </label>
          <input
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. India"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#001f3f]">Flag (optional)</label>
          <input
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder="e.g. 🇮🇳"
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste a flag emoji to display next to the country name.
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#001f3f]">Region</label>
          <select
            className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="">— Select a region —</option>
            {WORLD_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Used by the conflict list&apos;s &quot;Region&quot; filter to group countries
            geographically.
          </p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap justify-end gap-3 border-t border-gray-100 px-4 py-2">
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
          {loading ? "…" : mode === "add" ? "Add Country" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
