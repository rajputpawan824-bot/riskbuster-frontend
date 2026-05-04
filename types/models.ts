export type ConflictStatus = "Active" | "Outdated";

export type ConflictType = "high" | "low" | "medium" | "critical";

export type Conflict = {
  id: string;
  title: string;
  description: string;
  country: string;
  status: ConflictStatus;
  conflictType: ConflictType;
  date: string;
  region?: string;
  impact?: string;
};

export type Category = {
  id: string;
  title: string;
  creditTo: string;
  description: string;
  fileLink: string;
  /** If set, this row is a subcategory of the parent top-level category */
  parentId: string | null;
  /** Present when `parentId` is set (from API populate) */
  parentTitle?: string | null;
};
