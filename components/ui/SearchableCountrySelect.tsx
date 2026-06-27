"use client";

import React, { useState, useRef, useEffect } from "react";
import { COUNTRY_FORM_OPTIONS } from "@/lib/countries";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

export function SearchableCountrySelect({
  value,
  onChange,
  placeholder = "Select Country",
  required = false,
  className = "",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCountries = COUNTRY_FORM_OPTIONS.filter((country) =>
    country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mt-1 flex w-full items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-left text-sm text-[#001f3f] shadow-sm hover:bg-gray-50 focus:border-[#001f3f] focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>

      {/* Required Hidden Input for form submission validity */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          className="absolute inset-x-0 bottom-0 h-0 w-0 opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      )}

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          {/* Search Input Box */}
          <div className="border-b border-gray-100 bg-gray-50 p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-[#001f3f] focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
            />
          </div>

          {/* Option List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => {
                    onChange(country);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                    value === country
                      ? "bg-blue-50 font-semibold text-blue-900"
                      : "text-gray-700"
                  }`}
                >
                  <span>{country}</span>
                  {value === country && <span className="text-blue-600 text-xs">✓</span>}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-center text-sm text-gray-500">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
