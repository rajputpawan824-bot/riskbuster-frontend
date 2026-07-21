const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const TOKEN_KEY = "rb_token";
const PENDING_KEY = "rb_pending_download";

export type DownloadTarget = {
  href: string;
  documentType: string;
  documentId?: string;
  title?: string;
  fileLink: string;
};

function storageAvailable() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function savePendingDownload(target: DownloadTarget) {
  if (!storageAvailable()) return;
  localStorage.setItem(PENDING_KEY, JSON.stringify(target));
}

export function readPendingDownload(): DownloadTarget | null {
  if (!storageAvailable()) return null;
  const raw = localStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DownloadTarget;
  } catch {
    return null;
  }
}

export function clearPendingDownload() {
  if (!storageAvailable()) return;
  localStorage.removeItem(PENDING_KEY);
}

export async function startAuthenticatedDownload(target: DownloadTarget) {
  if (!storageAvailable()) return false;

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    savePendingDownload(target);
    return false;
  }

  const res = await fetch(`${API_BASE}/api/downloads/record`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      documentType: target.documentType,
      documentId: target.documentId || "",
      title: target.title || "",
      fileLink: target.fileLink,
    }),
  });

  if (res.status === 401) {
    savePendingDownload(target);
    localStorage.removeItem(TOKEN_KEY);
    return false;
  }

  if (!res.ok) {
    throw new Error(await res.text());
  }

  try {
    const fileRes = await fetch(target.href);
    if (!fileRes.ok) throw new Error("File fetch failed");
    const blob = await fileRes.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = target.href.substring(target.href.lastIndexOf("/") + 1).split("?")[0] || "document";
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to download file via Blob, falling back to location.href", err);
    window.location.href = target.href;
  }
  return true;
}

export async function replayPendingDownload() {
  const target = readPendingDownload();
  if (!target) return false;
  clearPendingDownload();
  return startAuthenticatedDownload(target);
}
