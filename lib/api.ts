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

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    try {
      const j = JSON.parse(err);
      throw new Error(j.error || err);
    } catch {
      throw new Error(err);
    }
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiPostForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "POST",
    headers: { ...authHeaders() },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    try {
      const j = JSON.parse(err);
      throw new Error(j.error || err);
    } catch {
      throw new Error(err);
    }
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    try {
      const j = JSON.parse(err);
      throw new Error(j.error || err);
    } catch {
      throw new Error(err);
    }
  }
  return res.json() as Promise<T>;
}

export async function apiPutForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "PUT",
    headers: { ...authHeaders() },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    try {
      const j = JSON.parse(err);
      throw new Error(j.error || err);
    } catch {
      throw new Error(err);
    }
  }
  return res.json() as Promise<T>;
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}
