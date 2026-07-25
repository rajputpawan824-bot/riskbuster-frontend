const getBase = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rb_token");
}

export function authHeaders(): HeadersInit {
  const t = getToken();
  if (!t) return {};
  return { Authorization: `Bearer ${t}` };
}

async function handleResponseError(res: Response): Promise<never> {
  const text = await res.text();
  let message = text;
  try {
    const json = JSON.parse(text);
    if (json && typeof json.error === "string") {
      message = json.error;
    } else if (json && typeof json.message === "string") {
      message = json.message;
    }
  } catch {
    // text is plain text
  }

  if (typeof message === "string" && message.startsWith("{") && message.endsWith("}")) {
    try {
      const j = JSON.parse(message);
      if (j && typeof j.error === "string") message = j.error;
      else if (j && typeof j.message === "string") message = j.message;
    } catch {}
  }

  throw new Error(message || `Request failed with status ${res.status}`);
}

export function cleanErrorMessage(ex: unknown, fallback: string = "An error occurred"): string {
  if (!ex) return fallback;
  let raw = ex instanceof Error ? ex.message : String(ex);
  if (typeof raw === "string" && raw.startsWith("{") && raw.endsWith("}")) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.error === "string") return parsed.error;
      if (parsed && typeof parsed.message === "string") return parsed.message;
    } catch {}
  }
  return raw || fallback;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) await handleResponseError(res);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) await handleResponseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiPostForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "POST",
    headers: { ...authHeaders() },
    body,
  });
  if (!res.ok) await handleResponseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) await handleResponseError(res);
  return res.json() as Promise<T>;
}

export async function apiPutForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "PUT",
    headers: { ...authHeaders() },
    body,
  });
  if (!res.ok) await handleResponseError(res);
  return res.json() as Promise<T>;
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) await handleResponseError(res);
}
