"use client";

import { Globe, ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CountryFilter } from "@/lib/countries";
import type { Country } from "@/types/models";

type Props = {
  selected: CountryFilter;
  onSelect: (c: CountryFilter) => void;
  countries: Country[];
  isEditable?: boolean;
  onAdd?: () => void;
  onEdit?: (c: Country) => void;
  onDelete?: (c: Country) => void;
};

type Item = { id: CountryFilter; label: string; flag: string; raw?: Country };

export function CountrySidebar({
  selected,
  onSelect,
  countries,
  isEditable = false,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const [search, setSearch] = useState("");

  const items: Item[] = [
    { id: "all", label: "All Countries", flag: "🌐" },
    ...countries.map<Item>((c) => ({ id: c.label, label: c.label, flag: c.flag, raw: c })),
  ];

  const filtered = items.filter(
    (c) =>
      c.id === "all" ||
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      String(c.id).toLowerCase().includes(search.toLowerCase())
  );

  const selectedItem = items.find((c) => c.id === selected);

  return (
    <>
      {/* ── Mobile: styled select dropdown + edit controls ── */}
      <div className="md:hidden w-full">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#001f3f] shrink-0" />
            <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
              Filter by Country
            </span>
          </div>
          {isEditable && onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-1 rounded-md bg-[#001f3f] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#002b52]"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          )}
        </div>
        <div className="relative">
          <select
            value={selected}
            onChange={(e) => onSelect(e.target.value as CountryFilter)}
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-[#001f3f] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20 cursor-pointer"
          >
            {items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Active filter pill + edit/delete for selected country */}
        {selected !== "all" && (
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
              <span>{selectedItem?.flag}</span>
              <span>{selectedItem?.label || selected}</span>
            </span>
            <button
              type="button"
              onClick={() => onSelect("all")}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Clear
            </button>
            {isEditable && selectedItem?.raw && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit?.(selectedItem.raw!)}
                  className="rounded p-1 text-[#2563eb] hover:bg-gray-100"
                  title="Edit country"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(selectedItem.raw!)}
                  className="rounded p-1 text-red-600 hover:bg-red-50"
                  title="Delete country"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Desktop: full sidebar with CRUD controls ── */}
      <aside className="hidden md:block sticky top-0 h-fit w-full shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:max-w-[220px]">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
          <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            Countries
          </span>
          {isEditable && onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-1 rounded-md bg-[#001f3f] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#002b52]"
              title="Add country"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          )}
        </div>

        {/* Search */}
        <div className="px-2.5 pb-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M11 11L14.5 14.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-[13px] text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* List */}
        <ul className="max-h-[60vh] overflow-y-auto text-sm">
          {filtered.map((c) => {
            const isActive = selected === c.id;
            return (
              <li key={c.id} className="group">
                <div
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? "border-l-[2.5px] border-blue-600 bg-blue-50 font-medium text-gray-900"
                      : "border-l-[2.5px] border-transparent text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="w-[22px] shrink-0 text-center text-[13px]">
                      {c.id === "all" ? <Globe className="h-4 w-4 text-gray-700" /> : c.flag}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13px]">{c.label}</span>
                      {c.raw?.region && (
                        <span className="truncate text-[10.5px] font-medium uppercase tracking-wide text-gray-400">
                          {c.raw.region}
                        </span>
                      )}
                    </span>
                  </button>
                  {isEditable && c.id !== "all" && c.raw && (
                    <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={() => onEdit?.(c.raw!)}
                        className="rounded p-1 text-[#2563eb] hover:bg-gray-100"
                        title="Edit country"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(c.raw!)}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        title="Delete country"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-3 text-xs text-gray-500">No countries match your search.</li>
          )}
        </ul>
      </aside>
    </>
  );
}
