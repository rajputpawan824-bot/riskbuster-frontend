import { MetadataRoute } from "next";

/**
 * Dynamic Next.js sitemap – served at /sitemap.xml
 * Google Search Console compatible (Sitemaps Protocol 0.9)
 *
 * Static pages are always included.
 * Dynamic pages (/conflicts/[id] and /knowledge/[id]) are fetched
 * from the backend API at build time so every published item is indexed.
 */

const BASE_URL = "https://www.riskbusters.co.in";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ConflictItem {
  _id?: string;
  id?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface KnowledgeItem {
  _id?: string;
  id?: string;
  updatedAt?: string;
  createdAt?: string;
  postedDate?: string;
}

/** Safely fetch a JSON array; returns [] on any error. */
async function safeFetch<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // re-generate at most once per hour
    });
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static routes ──────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/knowledge`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/conflicts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ── Dynamic: /conflicts/[id] ───────────────────────────────────
  const conflicts = await safeFetch<ConflictItem>(
    `${API_URL}/api/conflicts`
  );
  const conflictRoutes: MetadataRoute.Sitemap = conflicts.map((c) => ({
    url: `${BASE_URL}/conflicts/${c._id ?? c.id}`,
    lastModified: c.updatedAt
      ? new Date(c.updatedAt)
      : c.createdAt
      ? new Date(c.createdAt)
      : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // ── Dynamic: /knowledge/[id] ───────────────────────────────────
  const articles = await safeFetch<KnowledgeItem>(
    `${API_URL}/api/knowledge-articles`
  );
  const knowledgeRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/knowledge/${a._id ?? a.id}`,
    lastModified: a.updatedAt
      ? new Date(a.updatedAt)
      : a.postedDate
      ? new Date(a.postedDate)
      : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...conflictRoutes, ...knowledgeRoutes];
}
