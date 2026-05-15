"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Book,
  Calendar,
  Globe,
  ImageOff,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { MainShell } from "@/components/site/MainShell";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FlashMessage } from "@/components/ui/FlashMessage";
import { KnowledgeArticleFormModalBody } from "@/components/knowledge/KnowledgeArticleFormModalBody";
import { useAuth } from "@/context/AuthContext";
import { apiDelete, apiGet, apiPostForm, apiPutForm } from "@/lib/api";
import type { KnowledgeArticle } from "@/types/models";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const fmt = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const snippet = (html: string, max = 160) => {
  const text = (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

export default function KnowledgeArticlesPage() {
  const { isEditable, ready } = useAuth();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState<KnowledgeArticle | null>(null);
  const [confirm, setConfirm] = useState<KnowledgeArticle | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setErr(null);
    apiGet<KnowledgeArticle[]>("/api/knowledge-articles")
      .then(setArticles)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!ready) return;
    load();
  }, [load, ready]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.country?.toLowerCase().includes(q) ||
        snippet(a.description).toLowerCase().includes(q)
    );
  }, [articles, search]);

  return (
    <MainShell>
      <FlashMessage
        message={flash}
        tone={flash?.toLowerCase().includes("fail") ? "error" : "success"}
        onClose={() => setFlash(null)}
      />

      <div className="mx-auto w-full max-w-6xl pb-8 sm:pb-10 lg:pb-12">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#001f3f] text-white">
              <Book className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-base font-bold text-[#001f3f] sm:text-xl">
                Knowledge Articles
              </h1>
              <p className="text-xs text-gray-600 sm:text-sm">
                In-depth write-ups, briefs and reference reading.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[#001f3f]">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-40 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none sm:w-56"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} title="Clear">
                  <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {isEditable && (
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#002b52]"
              >
                <Plus className="h-4 w-4" />
                Add Article
              </button>
            )}
          </div>
        </div>

        {err && (
          <p className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {err}
          </p>
        )}

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
            Loading…
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500 shadow-sm">
            <Book className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm">
              {search ? "No articles match your search." : "No knowledge articles yet."}
            </p>
            {isEditable && !search && (
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#001f3f] bg-white px-3 py-2 text-sm font-semibold text-[#001f3f] hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                Add the first article
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => {
              const cover =
                a.imageLinks && a.imageLinks.length > 0
                  ? a.imageLinks[0]
                  : a.imageLink
                  ? a.imageLink
                  : null;
              return (
                <article
                  key={a.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <Link
                    href={`/knowledge/${a.id}`}
                    className="block aspect-[16/10] w-full overflow-hidden bg-gray-50"
                  >
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${API_BASE}${cover}`}
                        alt={a.title}
                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400">
                        <ImageOff className="h-7 w-7" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </Link>

                  <div className="flex min-h-0 flex-1 flex-col p-4">
                    <Link href={`/knowledge/${a.id}`} className="min-w-0">
                      <h3 className="line-clamp-2 text-base font-bold text-[#001f3f] group-hover:underline">
                        {a.title}
                      </h3>
                    </Link>
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {fmt(a.postedDate)}
                      </span>
                      {a.country && (
                        <span className="inline-flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" />
                          {a.country}
                        </span>
                      )}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                      {snippet(a.description, 200)}
                    </p>

                    {isEditable && (
                      <div className="mt-3 flex items-center justify-end gap-1 border-t border-gray-100 pt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setEdit(a);
                          }}
                          className="rounded border border-gray-200 p-1.5 text-[#2563eb] hover:bg-gray-50"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setConfirm(a);
                          }}
                          className="rounded border border-gray-200 p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal open={addOpen} title="Add Knowledge Article" onClose={() => setAddOpen(false)} size="lg">
        <KnowledgeArticleFormModalBody
          mode="add"
          onCancel={() => setAddOpen(false)}
          onSubmit={async (data) => {
            await apiPostForm<KnowledgeArticle>("/api/knowledge-articles", data);
            setAddOpen(false);
            setFlash("Article published successfully.");
            load();
          }}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={edit != null}
        title="Edit Knowledge Article"
        onClose={() => setEdit(null)}
        size="lg"
      >
        {edit && (
          <KnowledgeArticleFormModalBody
            mode="edit"
            initial={edit}
            onCancel={() => setEdit(null)}
            onSubmit={async (data) => {
              await apiPutForm<KnowledgeArticle>(`/api/knowledge-articles/${edit.id}`, data);
              setEdit(null);
              setFlash("Article updated successfully.");
              load();
            }}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirm != null}
        title="Delete article"
        message={
          confirm ? `Are you sure you want to delete "${confirm.title}"?` : ""
        }
        confirmText="Yes, delete"
        tone="danger"
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const c = confirm;
          if (!c) return;
          try {
            await apiDelete(`/api/knowledge-articles/${c.id}`);
            setFlash("Article deleted successfully.");
            load();
          } catch (e: unknown) {
            setFlash(e instanceof Error ? e.message : "Delete failed");
          } finally {
            setConfirm(null);
          }
        }}
      />
    </MainShell>
  );
}
