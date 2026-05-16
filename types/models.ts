export type ConflictStatus = "Active" | "Outdated";

export type ConflictType = "high" | "low" | "medium" | "critical";

/** Geographic reach of the conflict's impact. */
export type Impact = "local" | "regional" | "global";

export type Conflict = {
  id: string;
  title: string;
  description: string;
  country: string;
  status: ConflictStatus;
  conflictType: ConflictType;
  /** Geographic reach: local / regional / global. */
  impact?: Impact | null;
  date: string;
  region?: string;
  /** Primary image (kept for backward compatibility). */
  imageLink?: string;
  /** All uploaded images for this conflict. */
  imageLinks?: string[];
};

export type Category = {
  id: string;
  title: string;
  creditTo: string;
  description: string;
  fileLink: string;
  fileLinks?: string[];
  /** If set, this row is a subcategory of the parent top-level category */
  parentId: string | null;
  /** Present when `parentId` is set (from API populate) */
  parentTitle?: string | null;
};

export type Template = {
  id: string;
  title: string;
  description: string;
  fileLink: string;
  fileLinks?: string[];
};

export type KnowledgeArticle = {
  id: string;
  title: string;
  /** Rich-text description stored as sanitized HTML. */
  description: string;
  country: string;
  /** Posted/published date as YYYY-MM-DD. */
  postedDate: string;
  imageLink?: string;
  imageLinks?: string[];
  /** Primary uploaded file (kept for backward compatibility). */
  fileLink?: string;
  /** All uploaded files for this article. */
  fileLinks?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type Country = {
  id: string;
  label: string;
  flag: string;
  /** Geographic world region the country belongs to. */
  region?: string;
};
