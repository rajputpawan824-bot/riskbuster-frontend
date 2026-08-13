"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { KnowledgeArticleFormModalBody } from "@/components/knowledge/KnowledgeArticleFormModalBody";
import { useAuth } from "@/context/AuthContext";
import { startAuthenticatedDownload } from "@/lib/download";
import { apiDelete, apiGet, apiPostForm, apiPutForm } from "@/lib/api";
import type { Category, KnowledgeArticle, Template } from "@/types/models";

type SectionId = "introduction" | "categories" | "templates" | "knowledge" | "contact" | "downloads";
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
  "Knowledge should be shared, not restricted",
  "Prevention is always better than reaction",
  "Awareness is the first step toward safety",
];

const careerHighlights = [
  "United Nations Department of Safety and Security (UNDSS), India",
  "Large-scale international infrastructure projects in Bangladesh and Afghanistan",
  "Leading organizations including Nokia India and global joint ventures",
];

const platformTopics = [
  {
    title: "Security Risk Management",
    description:
      "Understanding threats, vulnerabilities, and risk mitigation strategies across industries.",
  },
  {
    title: "Intelligence & Threat Analysis",
    description:
      "Foundations of intelligence gathering, analysis, and situational awareness.",
  },
  {
    title: "Crisis & Disaster Management",
    description:
      "Practical approaches to emergency response, disaster preparedness, and business continuity.",
  },
  {
    title: "Security Systems & Audits",
    description:
      "Insights into physical and electronic security systems, audits, and best practices.",
  },
  {
    title: "Field-Based Learning",
    description: "Lessons drawn from real-world experiences in high-risk and conflict environments.",
  },
  {
    title: "Training & Awareness",
    description:
      "Guidance for building security awareness, preparedness, and resilience at individual and organizational levels.",
  },
];

const philosophy = [
  "Knowledge should be shared, not restricted",
  "Prevention is always better than reaction",
  "Awareness is the first step toward safety",
  "Real-world experience is the most valuable teacher",
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
  value === "contact" ||
  value === "downloads";

export function HomeWorkspace() {
  const { isEditable, isAdmin, isAuthenticated, email, logout, setPendingDownload } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState<SectionId>("introduction");
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const visibleSections = useMemo(() => {
    const list = [
      { id: "introduction" as SectionId, label: "Introduction", icon: User },
      { id: "categories" as SectionId, label: "Security Risk Categories", icon: Shield },
      { id: "templates" as SectionId, label: "Templates", icon: FileText },
      { id: "knowledge" as SectionId, label: "Knowledge Articles", icon: Book },
      { id: "contact" as SectionId, label: "Contact Us", icon: Mail },
    ];
    if (isAdmin) {
      list.push({ id: "downloads" as SectionId, label: "Downloads List", icon: Download });
    }
    return list;
  }, [isAdmin]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingTpls, setLoadingTpls] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [searchCategories, setSearchCategories] = useState("");
  const [searchArticles, setSearchArticles] = useState("");
  const [catModal, setCatModal] = useState<CatModalMode>(null);
  const [tplModal, setTplModal] = useState<TplModalMode>(null);
  const [addArticleOpen, setAddArticleOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<KnowledgeArticle | null>(null);
  const [confirmArticleDelete, setConfirmArticleDelete] = useState<KnowledgeArticle | null>(null);
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

  const loadCats = useCallback((query = "") => {
    setLoadingCats(true);
    const q = query.trim();
    const url = q ? `/api/categories?search=${encodeURIComponent(q)}` : "/api/categories";
    apiGet<Category[]>(url)
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, []);

  const loadTpls = useCallback(() => {
    setLoadingTpls(true);
    apiGet<Template[]>("/api/templates")
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoadingTpls(false));
  }, []);

  const loadArticles = useCallback((query = "") => {
    setLoadingArticles(true);
    const q = query.trim();
    const url = q ? `/api/knowledge-articles?search=${encodeURIComponent(q)}` : "/api/knowledge-articles";
    apiGet<KnowledgeArticle[]>(url)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoadingArticles(false));
  }, []);

  useEffect(() => {
    loadTpls();
  }, [loadTpls]);

  useEffect(() => {
    if (active !== "categories") return;
    const timer = setTimeout(() => {
      loadCats(searchCategories);
    }, 250);
    return () => clearTimeout(timer);
  }, [active, loadCats, searchCategories]);

  useEffect(() => {
    if (active !== "knowledge") return;
    const timer = setTimeout(() => {
      loadArticles(searchArticles);
    }, 250);
    return () => clearTimeout(timer);
  }, [active, loadArticles, searchArticles]);

  const firstFileLink = (item: { fileLink?: string; fileLinks?: string[] }) => {
    const links = item.fileLinks && item.fileLinks.length > 0 ? item.fileLinks : item.fileLink?.trim() ? [item.fileLink] : [];
    return links[0] || null;
  };

  const fileHref = (fileLink: string, download = false) => {
    const url = `${API_BASE}${fileLink}`;
    return download ? `${url}${url.includes("?") ? "&" : "?"}download=1` : url;
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

  const activeSectionLabel = visibleSections.find((section) => section.id === active)?.label ?? "Workspace";

  useEffect(() => {
    const section = searchParams.get("section");
    setActive(isSectionId(section) ? section : "introduction");
  }, [searchParams]);

  useEffect(() => {
    if (active === "downloads" && isAdmin) {
      setLoadingUsers(true);
      apiGet<any[]>("/api/auth/users")
        .then((data) => {
          setUsers(data);
          if (data.length > 0 && !selectedUserId) {
            setSelectedUserId(data[0].id);
          }
        })
        .catch((err) => console.error("Failed to load users", err))
        .finally(() => setLoadingUsers(false));
    }
  }, [active, isAdmin]);

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
                {visibleSections.map((section) => (
                  <SidebarButton key={section.id} {...section} />
                ))}
              </div>

              <div className="mt-5 hidden space-y-2 lg:block">
              {visibleSections.map((section) => (
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

              {/* Profile Card & Logout */}
              {isAuthenticated ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-white/15 ring-1 ring-white/10 flex items-center justify-center text-white shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Logged In</p>
                      <p className="text-xs font-semibold text-white truncate" title={email || ""}>
                        {email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full text-center py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition duration-200"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-white/10 bg-[#f8fafc]/5 p-3 flex flex-col gap-2">
                  <p className="text-[11px] text-white/70 text-center font-medium">Unlock templates & risk downloads</p>
                  <Link
                    href="/login"
                    className="w-full text-center py-2 px-3 rounded-xl bg-white text-[#001f3f] hover:bg-white/90 font-semibold text-xs transition duration-200"
                  >
                    Sign In
                  </Link>
                </div>
              )}
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
                          Welcome to Riskbusters.co.in
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
                    <p className="mt-3 max-w-4xl text-sm leading-6 text-white/82 sm:text-base">
                      <a
                        href="https://riskbusters.co.in"
                        className="font-bold text-white underline-offset-2 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Riskbusters.co.in
                      </a>{" "}
                      is a knowledge-driven platform dedicated to sharing insights, best practices,
                      and real-world experience across the full spectrum of{" "}
                      <strong className="font-semibold text-white">
                        Security Threat and Risk Management
                      </strong>
                      .
                    </p>
                    <p className="mt-3 max-w-4xl text-sm leading-6 text-white/82 sm:text-base">
                      This initiative has been created with a clear purpose: to{" "}
                      <strong className="font-semibold text-white">
                        impart practical, experience-based knowledge freely
                      </strong>{" "}
                      to professionals, students, organizations, and anyone interested in
                      understanding and managing security risks in today&apos;s complex world.
                    </p>
                  </div>
                </div>

                <section
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                  aria-labelledby="founder-heading"
                >
                  <h3
                    id="founder-heading"
                    className="text-lg font-bold text-[#001f3f] sm:text-xl"
                  >
                    Our Founder
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">
                    Riskbusters is founded by{" "}
                    <strong className="font-semibold text-[#001f3f]">Sureinder Kumar</strong>, a
                    former{" "}
                    <strong className="font-semibold text-[#001f3f]">
                      United Nations Security Professional
                    </strong>{" "}
                    with over{" "}
                    <strong className="font-semibold text-[#001f3f]">
                      40 years of distinguished experience
                    </strong>{" "}
                    in security risk management, intelligence analysis, and administration across
                    national and international environments.
                  </p>
                  <p className="mt-3 text-sm font-medium text-gray-800 sm:text-base">
                    His career spans assignments with:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700 marker:text-[#001f3f] sm:text-base">
                    {careerHighlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">
                    During his tenure with the United Nations, he maintained a{" "}
                    <strong className="font-semibold text-[#001f3f]">
                      zero-security-incident record over five consecutive years
                    </strong>
                    , reflecting a strong foundation in proactive risk management and operational
                    excellence.
                  </p>
                </section>

                <section
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                  aria-labelledby="platform-heading"
                >
                  <h3
                    id="platform-heading"
                    className="text-lg font-bold text-[#001f3f] sm:text-xl"
                  >
                    What This Platform Offers
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">
                    Riskbusters.co.in is{" "}
                    <strong className="font-semibold text-[#001f3f]">
                      not a commercial venture
                    </strong>
                    . It is a{" "}
                    <strong className="font-semibold text-[#001f3f]">
                      knowledge-sharing initiative
                    </strong>{" "}
                    designed to make high-quality security insights accessible to all.
                  </p>
                  <p className="mt-3 text-sm font-medium text-gray-800 sm:text-base">
                    The platform will cover:
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {platformTopics.map(({ title, description }) => (
                      <div
                        key={title}
                        className="rounded-lg border border-gray-100 bg-[#f8fafc] p-4"
                      >
                        <h4 className="text-sm font-bold text-[#001f3f] sm:text-base">{title}</h4>
                        <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                          {description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section
                  className="rounded-2xl border border-[#001f3f]/15 bg-[#001f3f] p-4 text-white shadow-sm sm:p-5"
                  aria-labelledby="philosophy-heading"
                >
                  <h3
                    id="philosophy-heading"
                    className="text-lg font-bold sm:text-xl"
                  >
                    Our Philosophy
                  </h3>
                  <p className="mt-3 text-sm text-white/90 sm:text-base">We believe that:</p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed sm:text-base">
                    {philosophy.map((line) => (
                      <li key={line} className="flex gap-3">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffcc00]"
                          aria-hidden
                        />
                        <span className="text-white/95">
                          <strong className="font-semibold text-white">{line}</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

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
                    <h3 className="text-base font-bold text-[#001f3f] sm:text-lg">Prefer the full pages?</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      The dedicated pages are still available for deeper reading and editing.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href="/?section=knowledge"
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

                <div className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus-within:ring-1 focus-within:ring-[#001f3f]">
                  <Search className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchCategories}
                    onChange={(e) => setSearchCategories(e.target.value)}
                    className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                  />
                  {searchCategories && (
                    <button
                      type="button"
                      onClick={() => setSearchCategories("")}
                      title="Clear search"
                    >
                      <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {loadingCats ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                    Loading categories...
                  </div>
                ) : catTree.parents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                    {searchCategories.trim()
                      ? "No categories match your search."
                      : "No categories available yet."}
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
                                  href={fileHref(link)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const target = {
                                      href: fileHref(link),
                                      documentType: "category",
                                      documentId: parent.id,
                                      title: parent.title,
                                      fileLink: link,
                                      isPreview: true,
                                    };
                                    startAuthenticatedDownload(target).then((success) => {
                                      if (!success) setPendingDownload(target);
                                    });
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  Preview
                                </a>
                                <a
                                  href={fileHref(link, true)}
                                  download
                                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const target = {
                                      href: fileHref(link, true),
                                      documentType: "category",
                                      documentId: parent.id,
                                      title: parent.title,
                                      fileLink: link,
                                    };
                                    startAuthenticatedDownload(target).then((success) => {
                                      if (!success) setPendingDownload(target);
                                    });
                                  }}
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
                                              href={fileHref(childLink)}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="rounded p-1 text-gray-500 hover:bg-white hover:text-gray-900"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                const target = {
                                                  href: fileHref(childLink),
                                                  documentType: "category",
                                                  documentId: child.id,
                                                  title: child.title,
                                                  fileLink: childLink,
                                                  isPreview: true,
                                                };
                                                startAuthenticatedDownload(target).then((success) => {
                                                  if (!success) setPendingDownload(target);
                                                });
                                              }}
                                            >
                                              <Eye className="h-4 w-4" />
                                            </a>
                                            <a
                                              href={fileHref(childLink, true)}
                                              download
                                              className="rounded p-1 text-gray-500 hover:bg-white hover:text-gray-900"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                const target = {
                                                  href: fileHref(childLink, true),
                                                  documentType: "category",
                                                  documentId: child.id,
                                                  title: child.title,
                                                  fileLink: childLink,
                                                };
                                                startAuthenticatedDownload(target).then((success) => {
                                                  if (!success) setPendingDownload(target);
                                                });
                                              }}
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
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const target = {
                                      href: `${API_BASE}${link!}`,
                                      documentType: "template",
                                      documentId: tpl.id,
                                      title: tpl.title,
                                      fileLink: link!,
                                      isPreview: true,
                                    };
                                    startAuthenticatedDownload(target).then((success) => {
                                      if (!success) setPendingDownload(target);
                                    });
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  Preview
                                </a>
                                <a
                                  href={`${API_BASE}${link}${link.includes("?") ? "&" : "?"}download=1`}
                                  download
                                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const target = {
                                      href: `${API_BASE}${link!}${link!.includes("?") ? "&" : "?"}download=1`,
                                      documentType: "template",
                                      documentId: tpl.id,
                                      title: tpl.title,
                                      fileLink: link!,
                                    };
                                    startAuthenticatedDownload(target).then((success) => {
                                      if (!success) setPendingDownload(target);
                                    });
                                  }}
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
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => setAddArticleOpen(true)}
                      className="inline-flex items-center justify-center gap-2 shrink-0 rounded-md bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#002b52]"
                    >
                      <Plus className="h-4 w-4" />
                      Add Article
                    </button>
                  )}
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
                ) : articles.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                    {searchArticles
                      ? "No articles match your search."
                      : "No knowledge articles yet."}
                    {isEditable && !searchArticles && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => setAddArticleOpen(true)}
                          className="inline-flex items-center gap-2 rounded-md border border-[#001f3f] bg-white px-3 py-2 text-sm font-semibold text-[#001f3f] hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4" />
                          Add the first article
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {articles.map((article) => (
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
                        <div className="mt-auto flex items-center justify-between pt-4">
                          <Link
                            href={`/knowledge/${article.id}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#001f3f] hover:underline"
                          >
                            Read article
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                          {isEditable && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setEditArticle(article);
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
                                  setConfirmArticleDelete(article);
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

            {active === "downloads" && isAdmin && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Downloads History
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-[#001f3f]">Registered User Downloads</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    View download activity and document logs across registered users.
                  </p>
                </div>

                {loadingUsers ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                    Loading registered users...
                  </div>
                ) : users.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                    No registered users found.
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left/Middle: User List */}
                    <div className="lg:col-span-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm h-[600px] overflow-y-auto space-y-2">
                      <p className="text-xs font-bold text-[#001f3f] border-b pb-2">Users ({users.length})</p>
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUserId(u.id)}
                          className={`w-full text-left p-3 rounded-xl transition-all ${
                            selectedUserId === u.id
                              ? "bg-[#001f3f] text-white shadow-sm"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <p className="font-semibold text-sm truncate">{u.name}</p>
                          <p className={`text-xs mt-0.5 truncate ${selectedUserId === u.id ? "text-white/70" : "text-gray-400"}`}>
                            {u.country || "Unknown Country"}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Right: Selected User Detail & Download Log */}
                    <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm min-h-[400px]">
                      {(() => {
                        const selectedUser = users.find((u) => u.id === selectedUserId);
                        if (!selectedUser) {
                          return (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                              Select a user to view details and history.
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-xl font-bold text-[#001f3f]">{selectedUser.name}</h3>
                              <p className="text-xs text-gray-500 mt-1">Email: {selectedUser.email}</p>
                              <p className="text-xs text-gray-500">Country: {selectedUser.country || "N/A"}</p>
                              <p className="text-xs text-gray-500">Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div className="border-t pt-4">
                              <h4 className="text-sm font-bold text-[#001f3f] mb-3">Download History ({selectedUser.download_document?.length || 0})</h4>
                              {!selectedUser.download_document || selectedUser.download_document.length === 0 ? (
                                <p className="text-xs text-gray-500 italic">No files downloaded yet.</p>
                              ) : (
                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                  {selectedUser.download_document.map((doc: any, index: number) => (
                                    <div key={index} className="p-3 rounded-lg border border-gray-100 bg-[#f8fafc] text-xs">
                                      <div className="flex justify-between items-start gap-2">
                                        <p className="font-semibold text-[#001f3f] truncate flex-1">{doc.title || "Untitled Document"}</p>
                                        <span className="text-[10px] uppercase font-bold text-[#2563eb] bg-blue-50 px-1.5 py-0.5 rounded">
                                          {doc.documentType}
                                        </span>
                                      </div>
                                      <p className="text-gray-400 mt-1 font-mono truncate">{doc.fileLink}</p>
                                      <p className="text-[10px] text-gray-400 mt-1">
                                        Downloaded: {new Date(doc.downloadedAt).toLocaleString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
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

      {/* Add Knowledge Article Modal */}
      <Modal open={addArticleOpen} title="Add Knowledge Article" onClose={() => setAddArticleOpen(false)} size="lg">
        <KnowledgeArticleFormModalBody
          mode="add"
          onCancel={() => setAddArticleOpen(false)}
          onSubmit={async (data) => {
            await apiPostForm<KnowledgeArticle>("/api/knowledge-articles", data);
            setAddArticleOpen(false);
            setFlash("Article published successfully.");
            loadArticles(searchArticles);
          }}
        />
      </Modal>

      {/* Edit Knowledge Article Modal */}
      <Modal
        open={editArticle != null}
        title="Edit Knowledge Article"
        onClose={() => setEditArticle(null)}
        size="lg"
      >
        {editArticle && (
          <KnowledgeArticleFormModalBody
            mode="edit"
            initial={editArticle}
            onCancel={() => setEditArticle(null)}
            onSubmit={async (data) => {
              await apiPutForm<KnowledgeArticle>(`/api/knowledge-articles/${editArticle.id}`, data);
              setEditArticle(null);
              setFlash("Article updated successfully.");
              loadArticles(searchArticles);
            }}
          />
        )}
      </Modal>

      {/* Delete Knowledge Article Confirm Dialog */}
      <ConfirmDialog
        open={confirmArticleDelete != null}
        title="Delete article"
        message={
          confirmArticleDelete ? `Are you sure you want to delete "${confirmArticleDelete.title}"?` : ""
        }
        confirmText="Yes, delete"
        tone="danger"
        onCancel={() => setConfirmArticleDelete(null)}
        onConfirm={async () => {
          const a = confirmArticleDelete;
          if (!a) return;
          try {
            await apiDelete(`/api/knowledge-articles/${a.id}`);
            setFlash("Article deleted successfully.");
            loadArticles(searchArticles);
          } catch (e: unknown) {
            setFlash(e instanceof Error ? e.message : "Delete failed");
          } finally {
            setConfirmArticleDelete(null);
          }
        }}
      />
    </div>
  );
}
