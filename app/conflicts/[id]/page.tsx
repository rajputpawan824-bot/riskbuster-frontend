"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Globe,
  ImageOff,
  Maximize2,
  Pencil,
  Trash2,
} from "lucide-react";
import { MainShell } from "@/components/site/MainShell";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FlashMessage } from "@/components/ui/FlashMessage";
import { Lightbox } from "@/components/ui/Lightbox";
import { ConflictFormModalBody } from "@/components/conflicts/ConflictFormModalBody";
import { useAuth } from "@/context/AuthContext";
import { apiDelete, apiGet, apiPutForm } from "@/lib/api";
import type { Conflict } from "@/types/models";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const fmt = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

const pillByImpact = (i: Conflict["impact"]) => {
  switch (i) {
    case "global":
      return "bg-indigo-100 text-indigo-900";
    case "regional":
      return "bg-sky-100 text-sky-900";
    case "local":
      return "bg-teal-100 text-teal-900";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ConflictDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { isEditable, ready } = useAuth();

  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    apiGet<Conflict>(`/api/conflicts/${id}`)
      .then((c) => setConflict(c))
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!ready) return;
    load();
  }, [load, ready]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const images =
    conflict?.imageLinks && conflict.imageLinks.length > 0
      ? conflict.imageLinks
      : conflict?.imageLink
      ? [conflict.imageLink]
      : [];
  const imageUrls = images.map((u) => `${API_BASE}${u}`);

  const typeLabel = conflict?.conflictType
    ? conflict.conflictType.charAt(0).toUpperCase() + conflict.conflictType.slice(1)
    : "";
  const impactLabel = conflict?.impact
    ? conflict.impact.charAt(0).toUpperCase() + conflict.impact.slice(1)
    : "";

  return (
    <MainShell>
      <FlashMessage
        message={flash}
        tone={flash?.toLowerCase().includes("fail") ? "error" : "success"}
        onClose={() => setFlash(null)}
      />

      <article className="mx-auto w-full max-w-6xl pb-8 sm:pb-10 lg:pb-12">
        {/* Back button — top-start, theme-matching */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-md border-2 border-[#001f3f] bg-white px-3 py-2 text-sm font-semibold text-[#001f3f] shadow-sm transition hover:bg-[#001f3f] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#001f3f]/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {isEditable && conflict && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-[#2563eb] shadow-sm hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
            Loading…
          </div>
        ) : err ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
            {err}
          </div>
        ) : !conflict ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
            Conflict not found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
              {/* Left — image gallery (click any image to open in lightbox) */}
              <div className="bg-gray-50 p-4 sm:p-5 md:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Images
                  </h2>
                  {images.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {images.length} {images.length === 1 ? "image" : "images"}
                    </span>
                  )}
                </div>

                {images.length === 0 ? (
                  <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-white text-gray-400">
                    <ImageOff className="h-10 w-10" />
                    <p className="text-sm">No images uploaded</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {images.map((url, i) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        className="group relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-white transition hover:border-[#001f3f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#001f3f]/40"
                        title="Open image"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${API_BASE}${url}`}
                          alt={`${conflict.title} — image ${i + 1}`}
                          className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                        />
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                          <Maximize2 className="h-5 w-5 text-white drop-shadow" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right — details */}
              <div className="p-5 sm:p-6 md:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      conflict.status === "Active"
                        ? "rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900"
                        : "rounded-md bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700"
                    }
                  >
                    {conflict.status}
                  </span>
                  {typeLabel && (
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${pillByConflictType(
                        conflict.conflictType
                      )}`}
                      title="Severity"
                    >
                      {typeLabel}
                    </span>
                  )}
                  {impactLabel && (
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${pillByImpact(
                        conflict.impact
                      )}`}
                      title="Impact (geographic reach)"
                    >
                      {impactLabel}
                    </span>
                  )}
                </div>

                <h1 className="mt-3 text-2xl font-bold leading-tight text-[#001f3f] sm:text-3xl">
                  {conflict.title}
                </h1>

                <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
                    <Globe className="h-4 w-4 text-[#001f3f]" />
                    <div className="min-w-0">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Country
                      </dt>
                      <dd className="truncate text-sm font-medium text-gray-800">
                        {conflict.country}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
                    <Calendar className="h-4 w-4 text-[#001f3f]" />
                    <div className="min-w-0">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </dt>
                      <dd className="truncate text-sm font-medium text-gray-800">
                        {fmt(conflict.date)}
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {conflict.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Edit modal */}
      <Modal open={editOpen} title="Edit Conflict" onClose={() => setEditOpen(false)}>
        {conflict && (
          <ConflictFormModalBody
            mode="edit"
            initial={conflict}
            onCancel={() => setEditOpen(false)}
            onSubmit={async (data) => {
              await apiPutForm<Conflict>(`/api/conflicts/${conflict.id}`, data);
              setEditOpen(false);
              setFlash("Conflict updated successfully.");
              load();
            }}
          />
        )}
      </Modal>

      {/* Image lightbox */}
      <Lightbox
        open={lightboxIndex != null}
        images={imageUrls}
        startIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        alt={conflict?.title}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete conflict"
        message={
          conflict ? `Are you sure you want to delete "${conflict.title}"?` : ""
        }
        confirmText="Yes, delete"
        tone="danger"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (!conflict) return;
          try {
            await apiDelete(`/api/conflicts/${conflict.id}`);
            setFlash("Conflict deleted successfully.");
            setConfirmDelete(false);
            setTimeout(() => router.push("/"), 600);
          } catch (e: unknown) {
            setFlash(e instanceof Error ? e.message : "Delete failed");
            setConfirmDelete(false);
          }
        }}
      />
    </MainShell>
  );
}
