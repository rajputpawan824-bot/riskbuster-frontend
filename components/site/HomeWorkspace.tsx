"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Book,
  Calendar,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Globe,
  Mail,
  Menu,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import { PageHeaderBlock } from "./PageHeaderBlock";
import { SiteFooter } from "./SiteFooter";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FlashMessage } from "@/components/ui/FlashMessage";
import { ContactUsForm } from "@/components/contact/ContactUsForm";
import { EditCategoryForm } from "@/components/categories/EditCategoryForm";
import { EditTemplateForm } from "@/components/templates/EditTemplateForm";
import { useAuth } from "@/context/AuthContext";
import { apiDelete, apiGet } from "@/lib/api";
import type { Category, KnowledgeArticle, Template } from "@/types/models";

type SectionId = "introduction" | "categories" | "templates" | "knowledge" | "contact";
type CatModalMode = { type: "edit"; category: Category } | { type: "add" } | null;
type TplModalMode = { type: "edit"; template: Template } | { type: "add" } | null;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const sections: { id: SectionId; label: string; icon: typeof User }[] = [
  { id: "introduction", label: "Introduction", icon: User },
  { id: "categories", label: "Security Risk Categories", icon: Shield },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "knowledge", label: "Knowledge Articles", icon: Book },
  { id: "contact", label: "Contact Us", icon: Mail },
];

const introHighlights = [
  "Knowledge-sharing first, not commercial noise",
  "Practical security guidance rooted in field experience",
  "A clear path to categories, templates, articles, and support",
];

const introTopics = [
  {
    title: "Security Threat and Risk Management",
    description: "Identify threats early, assess exposure, and build stronger mitigation plans.",
  },
  {
    title: "Intelligence and Awareness",
    description: "Turn real-world observations into situational awareness and better decisions.",
  },
  {
    title: "Preparedness and Continuity",
    description: "Use proven methods for response, resilience, and operational continuity.",
  },
];

const fmtDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const snippet = (html: string, max = 180) => {
  const text = (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

const isSectionId = (value: string | null): value is SectionId =>
  value === "introduction" ||
  value === "categories" ||
  value === "templates" ||
  value === "knowledge" ||
  value === "contact";

export function HomeWorkspace() {
  const { isEditable } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState<SectionId>("introduction");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingTpls, setLoadingTpls] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [searchArticles, setSearchArticles] = useState("");
  const [catModal, setCatModal] = useState<CatModalMode>(null);
  const [tplModal, setTplModal] = useState<TplModalMode>(null);
  const [confirm, setConfirm] = useState<{
    kind: "category" | "template";
    id: string;
    title: string;
    blocked?: boolean;
    blockedReason?: string;
  } | null>(null);
  const catTree = useMemo(() => {
    const parents = categories.filter((c) => !c.parentId);
    const childrenByParent = new Map<string, Category[]>();

    for (const c of categories) {
      if (!c.parentId) continue;
      const arr = childrenByParent.get(c.parentId) || [];
      arr.push(c);
      childrenByParent.set(c.parentId, arr);
    }

    parents.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    for (const [, arr] of childrenByParent) {
      arr.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    }

    return { parents, childrenByParent };
  }, [categories]);

  const loadCats = () => {
    setLoadingCats(true);
    apiGet<Category[]>("/api/categories")
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  };

  const loadTpls = () => {
    setLoadingTpls(true);
    apiGet<Template[]>("/api/templates")
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoadingTpls(false));
  };

  const loadArticles = () => {
    setLoadingArticles(true);
    apiGet<KnowledgeArticle[]>("/api/knowledge-articles")
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoadingArticles(false));
  };

  useEffect(() => {
    loadCats();
    loadTpls();
    loadArticles();
  }, []);

  const firstFileLink = (item: { fileLink?: string; fileLinks?: string[] }) => {
    const links = item.fileLinks && item.fileLinks.length > 0 ? item.fileLinks : item.fileLink?.trim() ? [item.fileLink] : [];
    return links[0] || null;
  };

  const onDeleteCategory = (c: Category) => {
    const hasKids = (catTree.childrenByParent.get(c.id) || []).length > 0;
    if (hasKids) {
      setConfirm({
        kind: "category",
        id: c.id,
        title: c.title,
        blocked: true,
        blockedReason: `"${c.title}" has subcategories and cannot be deleted.`,
      });
      return;
    }
    setConfirm({ kind: "category", id: c.id, title: c.title });
  };

  const onDeleteTemplate = (t: Template) => {
    setConfirm({ kind: "template", id: t.id, title: t.title });
  };

  const filteredArticles = useMemo(() => {
    const q = searchArticles.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.country?.toLowerCase().includes(q) ||
        snippet(a.description).toLowerCase().includes(q)
    );
  }, [articles, searchArticles]);

  const activeSectionLabel = sections.find((section) => section.id === active)?.label ?? "Workspace";

  useEffect(() => {
    const section = searchParams.get("section");
    setActive(isSectionId(section) ? section : "introduction");
  }, [searchParams]);

  const setSection = (section: SectionId) => {
    setActive(section);
    const params = new URLSearchParams(searchParams.toString());
    if (section === "introduction") params.delete("section");
    else params.set("section", section);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    if (window.innerWidth < 1024) setMobileSidebarOpen(false);
  };

  const SidebarButton = ({
    id,
    label,
    icon: Icon,
  }: {
    id: SectionId;
    label: string;
    icon: typeof User;
  }) => {
    const activeClass = active === id;
    return (
      <button
        type="button"
        onClick={() => setSection(id)}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
          activeClass
            ? "bg-white text-[#001f3f] shadow-sm"
            : "border border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(0,31,63,0.12),_transparent_42%),linear-gradient(180deg,#eef2f6_0%,#f7f9fb_100%)]">
      <PageHeaderBlock />

      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-3 sm:px-4 lg:px-6 lg:py-6">
        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="sticky top-2 z-30 rounded-2xl border border-white/70 bg-[#001f3f] p-3 text-white shadow-[0_16px_50px_rgba(0,31,63,0.18)] max-lg:w-full lg:top-4 lg:h-fit lg:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="mt-1 text-lg font-bold sm:text-xl">RiskBusters</h1>
                <p className="mt-1 text-xs leading-5 text-white/75 sm:text-sm">
                  Introduction, reference content, and contact access in one place.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen((open) => !open)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10 transition hover:bg-white/15 lg:hidden"
                aria-label={mobileSidebarOpen ? "Close workspace menu" : "Open workspace menu"}
                title={mobileSidebarOpen ? "Close" : "Open"}
              >
                {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <span className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 lg:flex">
                <Menu className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 lg:hidden">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white/80 uppercase">
                {activeSectionLabel}
              </span>
              <span className="text-[11px] text-white/50">Tap to switch</span>
            </div>

            <div className={`mt-3 lg:mt-4 ${mobileSidebarOpen ? "block" : "hidden lg:block"}`}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden">
                {sections.map((section) => (
                  <SidebarButton key={section.id} {...section} />
                ))}
              </div>

              <div className="mt-5 hidden space-y-2 lg:block">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    active === section.id
                      ? "bg-white text-[#001f3f]"
                      : "bg-white/5 text-white/88 hover:bg-white/10"
                  }`}
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{section.label}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                  </button>
              ))}
              </div>

              <div className="mt-5 hidden rounded-2xl border border-white/10 bg-white/5 p-4 sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                Quick notes
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/85">
                {introHighlights.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffcc00]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          </aside>

          <section className="min-w-0 rounded-2xl border border-gray-200/80 bg-white/90 p-3 shadow-sm backdrop-blur sm:p-5 lg:p-6">
            {active === "introduction" && (
              <div className="space-y-4 sm:space-y-5">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#001f3f] text-white shadow-sm">
                  <div className="p-4 sm:p-6 lg:p-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">
                          Introduction
                        </p>
                        <h2 className="mt-2 text-xl font-bold sm:text-3xl">
                          Security insight, practical guidance, and a cleaner path to the content.
                        </h2>
                      </div>
                      <div className="relative h-16 w-12 self-start overflow-hidden rounded-lg border border-white/15 bg-[#0b2c52] shadow-sm sm:h-24 sm:w-20">
                        <Image
                          src="/about-founder.jpeg"
                          alt="Portrait associated with RiskBusters founder materials"
                          fill
                          priority
                          sizes="(max-width: 640px) 48px, 80px"
                          className="object-cover object-top"
                        />
                      </div>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-white/82 sm:text-base">
                      RiskBusters is built to share field-tested knowledge in a simple, organized
                      interface. Use the sidebar to move between categories, templates, knowledge
                      articles, and contact support without losing context.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {introTopics.map((topic) => (
                    <article
                      key={topic.title}
                      className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4"
                    >
                      <h3 className="text-sm font-bold text-[#001f3f] sm:text-base">{topic.title}</h3>
                      <p className="mt-2 text-xs leading-6 text-gray-600 sm:text-sm">{topic.description}</p>
                    </article>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <article className="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4 sm:p-5">
                    <h3 className="text-base font-bold text-[#001f3f] sm:text-lg">What to expect here</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      The home screen now works like a workspace instead of a standard top-nav
                      landing page. The sections on the left control what you see on the right, so
                      the interface stays focused on the task you selected.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        "Security risk category management",
                        "Template library browsing",
                        "Knowledge article discovery",
                        "Direct contact form access",
                      ].map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                    <h3 className="text-base font-bold text-[#001f3f] sm:text-lg">Need the old pages?</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      The dedicated pages still exist for deeper reading and editing flows.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href="/knowledge"
                        className="inline-flex items-center gap-2 rounded-full bg-[#001f3f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#002b52]"
                      >
                        <Book className="h-4 w-4" />
                        Knowledge page
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSection("contact")}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#001f3f] hover:bg-gray-50"
                      >
                        <Mail className="h-4 w-4" />
                        Contact form
                      </button>
                    </div>
                  </article>
                </div>
              </div>
            )}

            {active === "categories" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Security Risk Categories
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-[#001f3f]">Browse the category tree</h2>
                    <p className="mt-2 text-sm text-gray-600">
                      Parent categories and subcategories are shown here with the same edit,
                      delete, preview, and download actions used elsewhere in the site.
                    </p>
                  </div>
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => setCatModal({ type: "add" })}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#002b52]"
                    >
                      <Plus className="h-4 w-4" />
                      Add Category
                    </button>
                  )}
                </div>

                {loadingCats ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                    Loading categories...
                  </div>
                ) : catTree.parents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                    No categories available yet.
                  </div>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {catTree.parents.map((parent) => {
                      const kids = catTree.childrenByParent.get(parent.id) || [];
                      const link = firstFileLink(parent);
                      return (
                        <article
                          key={parent.id}
                          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-bold text-[#001f3f]">{parent.title}</h3>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">
                                {kids.length > 0 ? `${kids.length} subcategories` : "Top-level category"}
                              </p>
                            </div>
                            <Shield className="h-5 w-5 text-[#001f3f]" />
                          </div>

                          <p className="mt-3 text-sm leading-6 text-gray-600">
                            {parent.description || "No description provided."}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            {link && (
                              <>
                                <a
                                  href={`${API_BASE}${link}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="h-4 w-4" />
                                  Preview
                                </a>
                                <a
                                  href={`${API_BASE}${link}`}
                                  download
                                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </a>
                              </>
                            )}
                            {isEditable && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setCatModal({ type: "edit", category: parent })}
                                  className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteCategory(parent)}
                                  className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>

                          {kids.length > 0 && (
                            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                              {kids.map((child) => {
                                const childLink = firstFileLink(child);
                                return (
                                  <div
                                    key={child.id}
                                    className="rounded-xl border border-gray-100 bg-[#f8fafc] p-3"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[#001f3f]">
                                          {child.title}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                          {child.description || "No description provided."}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {childLink && (
                                          <>
                                            <a
                                              href={`${API_BASE}${childLink}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="rounded p-1 text-gray-500 hover:bg-white hover:text-gray-900"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </a>
                                            <a
                                              href={`${API_BASE}${childLink}`}
                                              download
                                              className="rounded p-1 text-gray-500 hover:bg-white hover:text-gray-900"
                                            >
                                              <Download className="h-4 w-4" />
                                            </a>
                                          </>
                                        )}
                                        {isEditable && (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => setCatModal({ type: "edit", category: child })}
                                              className="rounded p-1 text-blue-600 hover:bg-white"
                                            >
                                              <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => onDeleteCategory(child)}
                                              className="rounded p-1 text-red-600 hover:bg-white"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {active === "templates" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Templates
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-[#001f3f]">Template library</h2>
                    <p className="mt-2 text-sm text-gray-600">
                      Browse templates in the right panel while keeping the sidebar visible.
                    </p>
                  </div>
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => setTplModal({ type: "add" })}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#002b52]"
                    >
                      <Plus className="h-4 w-4" />
                      Add Template
                    </button>
                  )}
                </div>

                {loadingTpls ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                    Loading templates...
                  </div>
                ) : templates.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                    No templates available yet.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {templates.map((tpl) => {
                      const link = firstFileLink(tpl);
                      return (
                        <article
                          key={tpl.id}
                          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-bold text-[#001f3f]">{tpl.title}</h3>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">
                                Template
                              </p>
                            </div>
                            <FileText className="h-5 w-5 text-[#001f3f]" />
                          </div>

                          <p className="mt-3 text-sm leading-6 text-gray-600">
                            {tpl.description || "No description provided."}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            {link && (
                              <>
                                <a
                                  href={`${API_BASE}${link}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="h-4 w-4" />
                                  Preview
                                </a>
                                <a
                                  href={`${API_BASE}${link}`}
                                  download
                                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </a>
                              </>
                            )}
                            {isEditable && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setTplModal({ type: "edit", template: tpl })}
                                  className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteTemplate(tpl)}
                                  className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {active === "knowledge" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Knowledge Articles
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-[#001f3f]">Reading list and briefs</h2>
                    <p className="mt-2 text-sm text-gray-600">
                      Use the right pane to preview articles, then jump into the dedicated
                      knowledge page when you want the full editor and CRUD flow.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[#001f3f]">
                  <Search className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchArticles}
                    onChange={(e) => setSearchArticles(e.target.value)}
                    className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                  />
                </div>

                {loadingArticles ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                    Loading knowledge articles...
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                    {searchArticles
                      ? "No articles match your search."
                      : "No knowledge articles yet."}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredArticles.map((article) => (
                      <article
                        key={article.id}
                        className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <Link href={`/knowledge/${article.id}`} className="block">
                          <h3 className="line-clamp-2 text-lg font-bold text-[#001f3f] hover:underline">
                            {article.title}
                          </h3>
                        </Link>
                        <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {fmtDate(article.postedDate)}
                          </span>
                          {article.country && (
                            <span className="inline-flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5" />
                              {article.country}
                            </span>
                          )}
                        </p>
                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-gray-600">
                          {snippet(article.description, 220)}
                        </p>
                        <div className="mt-auto pt-4">
                          <Link
                            href={`/knowledge/${article.id}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#001f3f] hover:underline"
                          >
                            Read article
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {active === "contact" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Contact Us
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-[#001f3f]">Send a message</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    The contact form opens directly in the main content area so users do not need
                    to hunt for a separate page.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <ContactUsForm
                    onCancel={() => setSection("introduction")}
                    onSuccess={(message) => setFlash(message)}
                    onError={(message) => setFlash(`Failed: ${message}`)}
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />

      <FlashMessage
        message={flash}
        tone={flash?.toLowerCase().includes("fail") ? "error" : "success"}
        onClose={() => setFlash(null)}
      />

      <Modal
        open={catModal != null}
        title={catModal?.type === "add" ? "Add Security Category" : "Edit Security Category"}
        onClose={() => setCatModal(null)}
        size="lg"
      >
        {catModal && (
          <EditCategoryForm
            mode={catModal.type}
            initial={catModal.type === "edit" ? catModal.category : undefined}
            allCategories={categories}
            onCancel={() => setCatModal(null)}
            onSaved={() => {
              loadCats();
              setCatModal(null);
              setFlash("Category saved successfully.");
            }}
          />
        )}
      </Modal>

      <Modal
        open={tplModal != null}
        title={tplModal?.type === "add" ? "Add Template" : "Edit Template"}
        onClose={() => setTplModal(null)}
        size="lg"
      >
        {tplModal && (
          <EditTemplateForm
            mode={tplModal.type}
            initial={tplModal.type === "edit" ? tplModal.template : undefined}
            onCancel={() => setTplModal(null)}
            onSaved={() => {
              loadTpls();
              setTplModal(null);
              setFlash("Template saved successfully.");
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={confirm != null}
        title="Delete"
        message={
          confirm?.blocked
            ? confirm.blockedReason || "This item cannot be deleted."
            : confirm
              ? `Are you sure you want to delete "${confirm.title}"?`
              : ""
        }
        confirmText={confirm?.blocked ? "OK" : "Yes, delete"}
        cancelText="Cancel"
        tone={confirm?.blocked ? "default" : "danger"}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const c = confirm;
          if (!c) return;
          if (c.blocked) {
            setConfirm(null);
            return;
          }
          try {
            await apiDelete(`/api/${c.kind === "category" ? "categories" : "templates"}/${c.id}`);
            setFlash("Deleted successfully.");
            if (c.kind === "category") loadCats();
            else loadTpls();
          } catch (e: unknown) {
            setFlash(e instanceof Error ? e.message : "Delete failed");
          } finally {
            setConfirm(null);
          }
        }}
      />
    </div>
  );
}
