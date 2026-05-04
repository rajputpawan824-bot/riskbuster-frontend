"use client";

import { Globe, ChevronDown } from "lucide-react";
import { useState } from "react";
import { COUNTRY_ITEMS, type CountryFilter } from "@/lib/countries";

type Props = {
  selected: CountryFilter;
  onSelect: (c: CountryFilter) => void;
};

export function CountrySidebar({ selected, onSelect }: Props) {
  const [search, setSearch] = useState("");

  const filtered = COUNTRY_ITEMS.filter(
    (c) =>
      c.id === "all" ||
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItem = COUNTRY_ITEMS.find((c) => c.id === selected);

  return (
    <>
      {/* ── Mobile: styled select dropdown ── */}
      <div className="md:hidden w-full">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="h-4 w-4 text-[#001f3f] shrink-0" />
          <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Filter by Country
          </span>
        </div>
        <div className="relative">
          <select
            value={selected}
            onChange={(e) => onSelect(e.target.value as CountryFilter)}
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-[#001f3f] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20 cursor-pointer"
          >
            {COUNTRY_ITEMS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Active filter pill */}
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
          </div>
        )}
      </div>

      {/* ── Desktop: full sidebar ── */}
      <aside className="hidden md:block sticky top-0 h-fit w-full shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:max-w-[220px]">
        {/* Header */}
        <div className="px-3.5 pt-3 pb-2 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
          Countries
        </div>

        {/* Search */}
        <div className="px-2.5 pb-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
        <ul className="text-sm">
          {filtered.map((c) => {
            const isActive = selected === c.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? "border-l-[2.5px] border-blue-600 bg-blue-50 font-medium text-gray-900"
                      : "border-l-[2.5px] border-transparent text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="w-[22px] shrink-0 text-center text-[13px]">
                    {c.id === "all" ? <Globe className="h-4 w-4 text-gray-700" /> : c.flag}
                  </span>
                  <span className="flex-1 truncate text-[13px]">{c.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="p-2.5">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2.5 text-[13px] text-gray-500 transition-colors hover:bg-gray-100"
          >
            View all countries
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}