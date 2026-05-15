"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, Plus, Search, X, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiDelete, apiGet, apiPost, apiPostForm, apiPut, apiPutForm } from "@/lib/api";
import { filterByCountry, sortConflicts, topN } from "@/lib/conflictFilter";
import { WORLD_REGIONS, type CountryFilter } from "@/lib/countries";
import type { Conflict, Country } from "@/types/models";
import { CountrySidebar } from "./CountrySidebar";
import { ConflictItemRow } from "./ConflictItemRow";
import { CountryFormModalBody } from "./CountryFormModalBody";
import { Modal } from "@/components/ui/Modal";
import { ConflictFormModalBody } from "@/components/conflicts/ConflictFormModalBody";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FlashMessage } from "@/components/ui/FlashMessage";

type SortKey = "latest" | "oldest";

type FilterState = {
  status: string;
  region: string;
  impact: string;
  dateFrom: string;
  dateTo: string;
};

const DEFAULT_FILTERS: FilterState = {
  status: "",
  region: "",
  impact: "",
  dateFrom: "",
  dateTo: "",
};

/** Geographic reach of a conflict's impact. */
const IMPACTS = ["Local", "Regional", "Global"];
const STATUSES = ["Active", "Ceasefire", "Escalating", "De-escalating", "Resolved"];

export function OngoingDashboard() {
  const { isEditable, ready } = useAuth();
  const [raw, setRaw] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Conflict | null>(null);
  const [country, setCountry] = useState<CountryFilter>("all");
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryModal, setCountryModal] = useState<
    { type: "add" } | { type: "edit"; country: Country } | null
  >(null);
  const [countryConfirm, setCountryConfirm] = useState<Country | null>(null);
  const [sort, setSort] = useState<SortKey>("latest");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState<Conflict | null>(null);
  const [mounted, setMounted] = useState(false);



  const activeFilters = Object.values(filters).filter(Boolean).length;

  const load = useCallback(() => {
    setLoading(true);
    setErr(null);
    apiGet<Conflict[]>("/api/conflicts")
      .then(setRaw)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const loadCountries = useCallback(() => {
    apiGet<Country[]>("/api/countries")
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (!ready) return;
    load();
    loadCountries();
  }, [load, loadCountries, ready]);

  useEffect(() => {
  setMounted(true);
}, []);

  /** Lookup: country label (lowercased) → region. */
  const regionByCountry = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of countries) {
      if (c.region) m.set(c.label.toLowerCase(), c.region);
    }
    return m;
  }, [countries]);

  /**
   * Resolve a region for a conflict's country string.
   * Conflict country labels can be compound (e.g. "Israel / Palestine") — pick
   * the first matching country we have a region for.
   */
  const regionForCountryString = useCallback(
    (countryStr: string): string | null => {
      if (!countryStr) return null;
      const parts = countryStr.split("/").map((s) => s.trim().toLowerCase());
      for (const p of parts) {
        const r = regionByCountry.get(p);
        if (r) return r;
      }
      return regionByCountry.get(countryStr.toLowerCase()) || null;
    },
    [regionByCountry]
  );

  const list = useMemo(() => {
    let f = filterByCountry(raw, country);
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }
    if (filters.status) f = f.filter((c) => c.status === filters.status);
    if (filters.region)
      f = f.filter((c) => regionForCountryString(c.country) === filters.region);
    if (filters.impact)
      f = f.filter((c) => (c.impact || "").toLowerCase() === filters.impact.toLowerCase());
    if (filters.dateFrom) f = f.filter((c) => new Date(c.date) >= new Date(filters.dateFrom));
    if (filters.dateTo) f = f.filter((c) => new Date(c.date) <= new Date(filters.dateTo));
    return topN(sortConflicts(f, sort), 10);
  }, [raw, country, sort, search, filters, regionForCountryString]);

  const onDelete = async (c: Conflict) => {
    setConfirm(c);
  };

  const confirmDelete = async () => {
    const c = confirm;
    if (!c) return;
    try {
      await apiDelete(`/api/conflicts/${c.id}`);
      setFlash("Deleted successfully.");
      load();
    } catch (e: unknown) {
      setFlash(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const openFilterModal = () => {
    setPendingFilters(filters);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setPendingFilters(DEFAULT_FILTERS);
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPendingFilters(DEFAULT_FILTERS);
    setSearch("");
  };

  if (!ready) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
        Loading…
      </div>
    );
  }

  return (
    <div>
      <FlashMessage message={flash} tone={flash?.toLowerCase().includes("fail") ? "error" : "success"} onClose={() => setFlash(null)} />
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-base font-bold text-[#001f3f] sm:text-xl">Ongoing Conflicts</h1>
          <p className="text-xs text-gray-600 sm:text-sm">
            Global overview of current conflicts and security situations.
          </p>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 self-start">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[#001f3f]">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Search conflicts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-36 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none sm:w-48"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")}>
                <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter button */}
          <button
            type="button"
            onClick={openFilterModal}
            className={`inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold shadow-sm cursor-pointer transition-colors ${
              activeFilters > 0
                ? "border-[#001f3f] bg-[#001f3f] text-white hover:bg-[#002b52]"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="max-lg:hidden">Filter</span>
            {activeFilters > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#001f3f]">
                {activeFilters}
              </span>
            )}
          </button>

          {/* Add Conflict */}
          {isEditable && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#002b52] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Conflict
            </button>
          )}
        </div>
      </div>

      {/* Active filter pills */}
      {activeFilters > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {Object.entries(filters).map(([key, val]) =>
            val ? (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {key === "dateFrom" ? `From: ${val}` : key === "dateTo" ? `To: ${val}` : val}
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, [key]: "" }))}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : null
          )}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            Clear all
          </button>
        </div>
      )}

      {err && (
        <p className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {err} — is the API running on port 3001?
        </p>
      )}

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <CountrySidebar
          selected={country}
          onSelect={setCountry}
          countries={countries}
          isEditable={isEditable}
          onAdd={() => setCountryModal({ type: "add" })}
          onEdit={(c) => setCountryModal({ type: "edit", country: c })}
          onDelete={(c) => setCountryConfirm(c)}
        />
        <section className="min-w-0 flex-1">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold text-[#001f3f]">Top 10 Conflicts</h2>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <span>Sort by:</span>
              <select
                className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <p className="p-6 text-center text-gray-500">Loading conflicts…</p>
            ) : list.length === 0 ? (
              <p className="p-6 text-center text-gray-500">No conflicts match this filter.</p>
            ) : (
              <ul className="divide-y-0">
                {list.map((c) => (
                  <ConflictItemRow
                    key={c.id}
                    conflict={c}
                    isEditable={isEditable}
                    onEdit={(x) => setEdit(x)}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* ── Filter Modal ── */}
      {mounted && filterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFilterOpen(false)}
          />
          {/* Panel */}
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-bold text-[#001f3f]">Filters</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Reset
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <select
                  value={pendingFilters.status}
                  onChange={(e) => setPendingFilters((p) => ({ ...p, status: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20"
                >
                  <option value="">All Statuses</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Region + Impact Level */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Region</label>
                  <select
                    value={pendingFilters.region}
                    onChange={(e) => setPendingFilters((p) => ({ ...p, region: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20"
                  >
                    <option value="">All Regions</option>
                    {WORLD_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <p className="text-[11px] text-gray-500">
                    Based on each country&apos;s region. Set it in the country&apos;s Add/Edit dialog.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Impact (Geographic Reach)
                  </label>
                  <select
                    value={pendingFilters.impact}
                    onChange={(e) => setPendingFilters((p) => ({ ...p, impact: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20"
                  >
                    <option value="">All Impacts</option>
                    {IMPACTS.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500">
                    Local = single country, Regional = neighbouring countries, Global = worldwide.
                  </p>
                </div>
              </div>

              {/* Date Range */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Date Range</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={pendingFilters.dateFrom}
                      onChange={(e) => setPendingFilters((p) => ({ ...p, dateFrom: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-8 pr-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20"
                    />
                  </div>
                  <span className="text-gray-400 text-sm">—</span>
                  <div className="relative flex-1">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={pendingFilters.dateTo}
                      onChange={(e) => setPendingFilters((p) => ({ ...p, dateTo: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-8 pr-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="rounded-lg bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#002b52]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modals */}
      <Modal open={addOpen} title="Add New Conflict" onClose={() => setAddOpen(false)}>
        <ConflictFormModalBody
          mode="add"
          onCancel={() => setAddOpen(false)}
          onSubmit={async (data) => {
            await apiPostForm<Conflict>("/api/conflicts", data);
            setAddOpen(false);
            setFlash("Conflict added successfully.");
            load();
          }}
        />
      </Modal>

      <Modal open={edit != null} title="Edit Conflict" onClose={() => setEdit(null)}>
        {edit && (
          <ConflictFormModalBody
            mode="edit"
            initial={edit}
            onCancel={() => setEdit(null)}
            onSubmit={async (data) => {
              await apiPutForm<Conflict>(`/api/conflicts/${edit.id}`, data);
              setEdit(null);
              setFlash("Conflict updated successfully.");
              load();
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={confirm != null}
        title="Delete conflict"
        message={confirm ? `Are you sure you want to delete "${confirm.title}"?` : ""}
        confirmText="Yes, delete"
        tone="danger"
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          await confirmDelete();
          setConfirm(null);
        }}
      />

      {/* Country Add/Edit Modal */}
      <Modal
        open={countryModal != null}
        title={countryModal?.type === "add" ? "Add Country" : "Edit Country"}
        onClose={() => setCountryModal(null)}
      >
        {countryModal && (
          <CountryFormModalBody
            mode={countryModal.type}
            initial={countryModal.type === "edit" ? countryModal.country : undefined}
            onCancel={() => setCountryModal(null)}
            onSubmit={async (data) => {
              try {
                if (countryModal.type === "add") {
                  await apiPost<Country>("/api/countries", data);
                  setFlash("Country added successfully.");
                } else {
                  await apiPut<Country>(`/api/countries/${countryModal.country.id}`, data);
                  setFlash("Country updated successfully.");
                  if (country === countryModal.country.label && data.label !== countryModal.country.label) {
                    setCountry(data.label);
                  }
                }
                setCountryModal(null);
                loadCountries();
              } catch (e: unknown) {
                throw e instanceof Error ? e : new Error("Request failed");
              }
            }}
          />
        )}
      </Modal>

      {/* Country Delete Confirm */}
      <ConfirmDialog
        open={countryConfirm != null}
        title="Delete country"
        message={
          countryConfirm
            ? `Are you sure you want to delete "${countryConfirm.label}"?`
            : ""
        }
        confirmText="Yes, delete"
        tone="danger"
        onCancel={() => setCountryConfirm(null)}
        onConfirm={async () => {
          const c = countryConfirm;
          if (!c) return;
          try {
            await apiDelete(`/api/countries/${c.id}`);
            setFlash("Country deleted successfully.");
            if (country === c.label) setCountry("all");
            loadCountries();
          } catch (e: unknown) {
            setFlash(e instanceof Error ? e.message : "Delete failed");
          } finally {
            setCountryConfirm(null);
          }
        }}
      />
    </div>
  );
}