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
import { RichTextView } from "@/components/ui/RichTextView";
import { KnowledgeArticleFormModalBody } from "@/components/knowledge/KnowledgeArticleFormModalBody";
import { useAuth } from "@/context/AuthContext";
import { apiDelete, apiGet, apiPutForm } from "@/lib/api";
import type { KnowledgeArticle } from "@/types/models";

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

export default function KnowledgeArticleDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { isEditable, ready } = useAuth();

  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
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
    apiGet<KnowledgeArticle>(`/api/knowledge-articles/${id}`)
      .then(setArticle)
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
      router.push("/knowledge");
    }
  };

  const images =
    article?.imageLinks && article.imageLinks.length > 0
      ? article.imageLinks
      : article?.imageLink
      ? [article.imageLink]
      : [];
  const imageUrls = images.map((u) => `${API_BASE}${u}`);

  return (
    <MainShell>
      <FlashMessage
        message={flash}
        tone={flash?.toLowerCase().includes("fail") ? "error" : "success"}
        onClose={() => setFlash(null)}
      />

      <article className="mx-auto w-full max-w-6xl pb-8 sm:pb-10 lg:pb-12">
        {/* Back + actions */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-md border-2 border-[#001f3f] bg-white px-3 py-2 text-sm font-semibold text-[#001f3f] shadow-sm transition hover:bg-[#001f3f] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#001f3f]/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {isEditable && article && (
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
        ) : !article ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
            Article not found.
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
                          alt={`${article.title} — image ${i + 1}`}
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
                <h1 className="text-2xl font-bold leading-tight text-[#001f3f] sm:text-3xl">
                  {article.title}
                </h1>

                <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
                    <Calendar className="h-4 w-4 text-[#001f3f]" />
                    <div className="min-w-0">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Posted Date
                      </dt>
                      <dd className="truncate text-sm font-medium text-gray-800">
                        {fmt(article.postedDate)}
                      </dd>
                    </div>
                  </div>
                  {article.country && (
                    <div className="flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
                      <Globe className="h-4 w-4 text-[#001f3f]" />
                      <div className="min-w-0">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          Country
                        </dt>
                        <dd className="truncate text-sm font-medium text-gray-800">
                          {article.country}
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>

                <div className="mt-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </h2>
                  <div className="mt-2">
                    <RichTextView html={article.description} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Image lightbox */}
      <Lightbox
        open={lightboxIndex != null}
        images={imageUrls}
        startIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        alt={article?.title}
      />

      {/* Edit modal */}
      <Modal
        open={editOpen}
        title="Edit Knowledge Article"
        onClose={() => setEditOpen(false)}
        size="lg"
      >
        {article && (
          <KnowledgeArticleFormModalBody
            mode="edit"
            initial={article}
            onCancel={() => setEditOpen(false)}
            onSubmit={async (data) => {
              await apiPutForm<KnowledgeArticle>(`/api/knowledge-articles/${article.id}`, data);
              setEditOpen(false);
              setFlash("Article updated successfully.");
              load();
            }}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete article"
        message={article ? `Are you sure you want to delete "${article.title}"?` : ""}
        confirmText="Yes, delete"
        tone="danger"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (!article) return;
          try {
            await apiDelete(`/api/knowledge-articles/${article.id}`);
            setFlash("Article deleted successfully.");
            setConfirmDelete(false);
            setTimeout(() => router.push("/knowledge"), 600);
          } catch (e: unknown) {
            setFlash(e instanceof Error ? e.message : "Delete failed");
            setConfirmDelete(false);
          }
        }}
      />
    </MainShell>
  );
}
