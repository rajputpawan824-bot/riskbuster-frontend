"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Book,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Home,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Shield,
  User,
  UserCircle,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "@/lib/api";
import type { Category } from "@/types/models";
import { Modal } from "@/components/ui/Modal";
import { EditCategoryForm } from "@/components/categories/EditCategoryForm";
import { BrandLogo } from "./BrandLogo";

const templatesItems = [
  { label: "Report template", href: "#" },
  { label: "Checklist template", href: "#" },
];

type CatModalMode = { type: "edit"; category: Category } | { type: "add" } | null;

export function TopNav() {
  const path = usePathname();
  const { isEditable, logout, email } = useAuth();
  const [openCat, setOpenCat] = useState(false);
  const [openTpl, setOpenTpl] = useState(false);
  const [openCatParentId, setOpenCatParentId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileTplOpen, setMobileTplOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catModal, setCatModal] = useState<CatModalMode>(null);
  const [mounted, setMounted] = useState(false); // ← fix for hydration
  const rCat = useRef<HTMLDivElement | null>(null);
  const rTpl = useRef<HTMLDivElement | null>(null);

  const catTree = useMemo(() => {
    const parents = categories.filter((c) => !c.parentId);
    const childrenByParent = new Map<string, Category[]>();
    for (const c of categories) {
      if (!c.parentId) continue;
      const pid = c.parentId;
      const arr = childrenByParent.get(pid) || [];
      arr.push(c);
      childrenByParent.set(pid, arr);
    }
    for (const [, arr] of childrenByParent) {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    }
    parents.sort((a, b) => a.title.localeCompare(b.title));
    return { parents, childrenByParent };
  }, [categories]);

  // Only render interactive/stateful UI after mount to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const loadCat = () => {
    apiGet<Category[]>("/api/categories").then(setCategories).catch(() => setCategories([]));
  };

  useEffect(() => {
    loadCat();
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rCat.current && !rCat.current.contains(e.target as Node)) {
        setOpenCat(false);
        setOpenCatParentId(null);
      }
      if (rTpl.current && !rTpl.current.contains(e.target as Node)) setOpenTpl(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  const isHome = path === "/";
  const isAbout = path === "/about";

  const desktopLink = (active: boolean) =>
    `flex items-center gap-1.5 px-2 py-3 text-xs font-bold uppercase tracking-wide text-white transition ${
      active
        ? "border-b-4 border-[#ffcc00] text-white"
        : "border-b-4 border-transparent text-white/90 hover:text-white"
    }`;
    if (!mounted) {
    return (
      <nav className="relative z-50 bg-[#001f3f]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 min-h-[48px]" />
      </nav>
    );
  }
  return (
    <>
      <nav className="relative z-50 bg-[#001f3f]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3">
          {/* Desktop nav links */}
          <div className="hidden min-w-0 flex-1 flex-wrap items-stretch pr-2 lg:flex">
            <Link href="/" className={desktopLink(isHome)}>
              <Home className="h-4 w-4" />
              Home
            </Link>

            <Link href="/about" className={desktopLink(isAbout)}>
              <User className="h-4 w-4" />
              About
            </Link>

            {/* Security Risk Categories dropdown */}
            <div className="relative" ref={rCat}>
              <button
                type="button"
                onClick={() => {
                  setOpenCat((o) => {
                    const next = !o;
                    if (!next) setOpenCatParentId(null);
                    return next;
                  });
                  setOpenTpl(false);
                }}
                className={desktopLink(false)}
              >
                <Shield className="h-4 w-4" />
                Security Risk Categories
                <ChevronDown className={`h-4 w-4 transition-transform ${openCat ? "rotate-180" : ""}`} />
              </button>
              {mounted && openCat && (
                <div
                  className="absolute left-0 top-full z-40 min-w-[240px] rounded-b-md border border-gray-200 bg-white py-2 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  {catTree.parents.map((p) => {
                    const kids = catTree.childrenByParent.get(p.id) || [];
                    const hasKids = kids.length > 0;
                    const open = openCatParentId === p.id;
                    return (
                      <div key={p.id} className="relative">
                        <div
                          className="group flex items-center justify-between gap-2 px-3 py-2 text-sm text-[#001f3f] hover:bg-gray-50"
                          role={hasKids ? "button" : undefined}
                          tabIndex={hasKids ? 0 : undefined}
                          onClick={() => {
                            if (!hasKids) return;
                            setOpenCatParentId((cur) => (cur === p.id ? null : p.id));
                          }}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <Shield className="h-4 w-4 shrink-0 text-[#001f3f]" />
                            <span className="truncate">{p.title}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            {p.fileLink?.trim() && (
                              <>
                                <a
                                  href={`${process.env.NEXT_PUBLIC_API_URL || "https://riskbuster-backend.onrender.com"}${p.fileLink}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="shrink-0 rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                  title="Preview file"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Eye className="h-4 w-4" />
                                </a>
                                <a
                                  href={`${process.env.NEXT_PUBLIC_API_URL || "https://riskbuster-backend.onrender.com"}${p.fileLink}`}
                                  download
                                  className="shrink-0 rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                  title="Download file"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </>
                            )}
                            {hasKids && <ChevronRight className="h-4 w-4 text-gray-400" />}
                            {isEditable && (
                              <button
                                type="button"
                                className="shrink-0 rounded p-1 text-[#2563eb] hover:bg-gray-100"
                                title="Edit category"
                                onClick={() => { setCatModal({ type: "edit", category: p }); setOpenCat(false); }}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            )}
                          </span>
                        </div>

                        {hasKids && (
                          <div
                            className={`absolute left-full top-0 z-50 min-w-[240px] rounded-md border border-gray-200 bg-white py-2 shadow-lg ${
                              open ? "visible opacity-100" : "invisible opacity-0"
                            } transition group-hover:visible group-hover:opacity-100`}
                          >
                            {kids.map((c) => (
                              <div
                                key={c.id}
                                className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-[#001f3f] hover:bg-gray-50"
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <Shield className="h-4 w-4 shrink-0 text-[#001f3f]" />
                                  <span className="truncate">{c.title}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  {c.fileLink?.trim() && (
                                    <>
                                      <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL || "https://riskbuster-backend.onrender.com"}${c.fileLink}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="shrink-0 rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        title="Preview file"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </a>
                                      <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL || "https://riskbuster-backend.onrender.com"}${c.fileLink}`}
                                        download
                                        className="shrink-0 rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        title="Download file"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </>
                                  )}
                                  {isEditable && (
                                    <button
                                      type="button"
                                      className="shrink-0 rounded p-1 text-[#2563eb] hover:bg-gray-100"
                                      title="Edit category"
                                      onClick={() => {
                                        setCatModal({ type: "edit", category: c });
                                        setOpenCat(false);
                                        setOpenCatParentId(null);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {isEditable && (
                    <div className="mt-1 border-t border-gray-200 pt-2">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-[#001f3f] hover:bg-gray-50"
                        onClick={() => { setCatModal({ type: "add" }); setOpenCat(false); }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Category
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Templates dropdown */}
            <div className="relative" ref={rTpl}>
              <button
                type="button"
                onClick={() => { setOpenTpl((o) => !o); setOpenCat(false); }}
                className={desktopLink(false)}
              >
                <FileText className="h-4 w-4" />
                Templates
                <ChevronDown className={`h-4 w-4 transition-transform ${openTpl ? "rotate-180" : ""}`} />
              </button>
              {mounted && openTpl && (
                <div className="absolute left-0 top-full z-40 min-w-[200px] rounded-b-md border border-gray-200 bg-white py-2 shadow-lg">
                  {templatesItems.map((t) => (
                    <a
                      key={t.label}
                      href={t.href}
                      className="block px-3 py-2 text-sm text-[#001f3f] hover:bg-gray-50"
                    >
                      {t.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <Link href="#" className={desktopLink(false)} onClick={(e) => e.preventDefault()}>
              <Book className="h-4 w-4" />
              Knowledge Articles
            </Link>
          </div>

          {/* Mobile: brand */}
          <div className="flex items-center gap-3 mr-4 border-r border-white/20 pr-4 lg:hidden">
                <BrandLogo />
              </div>

          {/* Right side: auth + hamburger */}
          <div className="flex shrink-0 items-center gap-2 lg:py-1">
            {isEditable && email && (
              <span className="hidden max-w-[120px] truncate text-xs text-white/80 sm:inline">
                {email}
              </span>
            )}
            {isEditable ? (
              <button
                type="button"
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 ring-1 ring-white/20 hover:bg-white/10"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 ring-1 ring-white/20 hover:bg-white/10"
                title="Log in for edit mode"
              >
                <UserCircle className="h-5 w-5" />
              </Link>
            )}

            {/* Hamburger — only render after mount to prevent SSR mismatch */}
            {mounted && (
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-white/90 hover:bg-white/10 lg:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile drawer — only rendered client-side after mount */}
        {mounted && mobileOpen && (
          <div className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-56px)] overflow-y-auto border-t border-white/10 bg-[#001f3f] shadow-2xl lg:hidden">
            <div className="divide-y divide-white/10">

              <Link
                href="/"
                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-semibold ${
                  isHome ? "text-[#ffcc00]" : "text-white/90"
                }`}
              >
                <Home className="h-4 w-4" />
                Home
                {isHome && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ffcc00]" />}
              </Link>

              <Link
                href="/about"
                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-semibold ${
                  isAbout ? "text-[#ffcc00]" : "text-white/90"
                }`}
              >
                <User className="h-4 w-4" />
                About
                {isAbout && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ffcc00]" />}
              </Link>

              {/* Security Risk Categories accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileCatOpen((o) => !o)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-semibold text-white/90"
                >
                  <Shield className="h-4 w-4" />
                  <span className="flex-1 text-left">Security Risk Categories</span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${mobileCatOpen ? "rotate-90" : ""}`} />
                </button>
                {mobileCatOpen && (
                  <div className="border-t border-white/10 bg-[#001630]">
                    {catTree.parents.map((p) => {
                      const kids = catTree.childrenByParent.get(p.id) || [];
                      return (
                        <div key={p.id}>
                          <div className="flex items-center justify-between gap-2 px-6 py-3 text-sm text-white/85">
                            <span className="flex min-w-0 items-center gap-2">
                              <Shield className="h-3.5 w-3.5 shrink-0 text-white/40" />
                              <span className="truncate font-semibold">{p.title}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              {p.fileLink?.trim() && (
                                <>
                                  <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL || "https://riskbuster-backend.onrender.com"}${p.fileLink}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="shrink-0 rounded p-1 text-white/70 hover:text-white"
                                    title="Preview file"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </a>
                                  <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL || "https://riskbuster-backend.onrender.com"}${p.fileLink}`}
                                    download
                                    className="shrink-0 rounded p-1 text-white/70 hover:text-white"
                                    title="Download file"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                </>
                              )}
                              {isEditable && (
                                <button
                                  type="button"
                                  className="shrink-0 rounded p-1 text-[#ffcc00]/80 hover:text-[#ffcc00]"
                                  title="Edit category"
                                  onClick={() => { setCatModal({ type: "edit", category: p }); setMobileOpen(false); }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </span>
                          </div>
                          {kids.length > 0 && (
                            <div className="pb-1">
                              {kids.map((c) => (
                                <div
                                  key={c.id}
                                  className="flex items-center justify-between gap-2 px-10 py-2.5 text-sm text-white/75"
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
                                    <span className="truncate">{c.title}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    {c.fileLink?.trim() && (
                                      <>
                                        <a
                                          href={`${process.env.NEXT_PUBLIC_API_URL || "https://riskbuster-backend.onrender.com"}${c.fileLink}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="shrink-0 rounded p-1 text-white/70 hover:text-white"
                                          title="Preview file"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </a>
                                        <a
                                          href={`${process.env.NEXT_PUBLIC_API_URL || "https://riskbuster-backend.onrender.com"}${c.fileLink}`}
                                          download
                                          className="shrink-0 rounded p-1 text-white/70 hover:text-white"
                                          title="Download file"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Download className="h-4 w-4" />
                                        </a>
                                      </>
                                    )}
                                    {isEditable && (
                                      <button
                                        type="button"
                                        className="shrink-0 rounded p-1 text-[#ffcc00]/80 hover:text-[#ffcc00]"
                                        title="Edit category"
                                        onClick={() => { setCatModal({ type: "edit", category: c }); setMobileOpen(false); }}
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {isEditable && (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-6 py-3 text-sm font-semibold text-[#ffcc00]"
                        onClick={() => { setCatModal({ type: "add" }); setMobileOpen(false); }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Category
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Templates accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileTplOpen((o) => !o)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-semibold text-white/90"
                >
                  <FileText className="h-4 w-4" />
                  <span className="flex-1 text-left">Templates</span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${mobileTplOpen ? "rotate-90" : ""}`} />
                </button>
                {mobileTplOpen && (
                  <div className="border-t border-white/10 bg-[#001630]">
                    {templatesItems.map((t) => (
                      <a
                        key={t.label}
                        href={t.href}
                        className="block px-6 py-3 text-sm text-white/80 hover:text-white"
                      >
                        {t.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-white/90"
              >
                <Book className="h-4 w-4" />
                Knowledge Articles
              </Link>

              {isEditable && email && (
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="truncate text-xs text-white/50">{email}</span>
                  <button
                    type="button"
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/20 hover:bg-white/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

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
            onSaved={() => { loadCat(); setCatModal(null); }}
          />
        )}
      </Modal>
    </>
  );
}