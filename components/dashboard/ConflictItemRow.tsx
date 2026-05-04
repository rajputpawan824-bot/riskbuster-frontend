"use client";

import { Globe, Pencil, Trash2 } from "lucide-react";
import type { Conflict } from "@/types/models";

const fmt = (iso: string) => {
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
};

const colorByConflictType = (t: Conflict["conflictType"]) => {
  switch (t) {
    case "high":
      return "bg-red-600";
    case "medium":
      return "bg-yellow-400";
    case "low":
      return "bg-green-600";
    case "critical":
      return "bg-purple-700";
    default:
      return "bg-gray-300";
  }
};

const pillByConflictType = (t: Conflict["conflictType"]) => {
  switch (t) {
    case "critical":
      return "bg-purple-100 text-purple-900";
    case "high":
      return "bg-red-100 text-red-900";
    case "medium":
      return "bg-yellow-100 text-yellow-900";
    case "low":
      return "bg-green-100 text-green-900";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

type Props = {
  conflict: Conflict;
  isEditable: boolean;
  onEdit: (c: Conflict) => void;
  onDelete: (c: Conflict) => void;
};

export function ConflictItemRow({ conflict, isEditable, onEdit, onDelete }: Props) {
  const active = conflict.status === "Active";
  const bar = active ? colorByConflictType(conflict.conflictType) : "bg-gray-300";
  const typeLabel = conflict.conflictType
    ? conflict.conflictType.charAt(0).toUpperCase() + conflict.conflictType.slice(1)
    : "Type";

  return (
    <li className="flex min-h-[4.5rem] border-b border-gray-200 last:border-0">
      <div className={`w-1.5 shrink-0 self-stretch ${bar}`} aria-hidden />
      <div className="grid min-w-0 flex-1 grid-cols-1 items-start gap-3 py-3 pl-3 pr-2 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:pr-3">
        <div className="min-w-0 pr-0 sm:pr-4">
          <h3 className="font-bold text-[#001f3f]">{conflict.title}</h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">{conflict.description}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
            <Globe className="h-3.5 w-3.5 shrink-0" />
            {conflict.country}
          </p>
        </div>
        <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-center">
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span
              className={
                active
                  ? "w-fit rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900"
                  : "w-fit rounded-md bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700"
              }
            >
              {conflict.status}
            </span>
            <span
              className={`w-fit rounded-md px-2.5 py-0.5 text-xs font-semibold ${pillByConflictType(
                conflict.conflictType
              )}`}
              title="Conflict type"
            >
              {typeLabel}
            </span>
          </div>
          <time className="whitespace-nowrap text-xs text-gray-500" dateTime={conflict.date}>
            {fmt(conflict.date)}
          </time>
        </div>
        {isEditable && (
          <div className="flex shrink-0 items-center justify-end gap-1 sm:justify-end">
            <button
              type="button"
              onClick={() => onEdit(conflict)}
              className="rounded border border-gray-200 p-2 text-[#2563eb] hover:bg-gray-50"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(conflict)}
              className="rounded border border-gray-200 p-2 text-red-600 hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
