"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiPost } from "@/lib/api";
import { DownloadTarget, startAuthenticatedDownload } from "@/lib/download";
import { DownloadRegisterModal } from "@/components/site/DownloadRegisterModal";

type AuthState = {
  isAuthenticated: boolean;
  isEditable: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, country?: string) => Promise<void>;
  logout: () => void;
  ready: boolean;
  pendingDownload: DownloadTarget | null;
  setPendingDownload: (target: DownloadTarget | null) => void;
};

const Ctx = createContext<AuthState | null>(null);
const TOKEN_KEY = "rb_token";
const EMAIL_KEY = "rb_email";
const ROLE_KEY = "rb_role";

type AuthResponse = {
  token: string;
  user: { email: string; role?: string; name?: string };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<DownloadTarget | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedEmail = localStorage.getItem(EMAIL_KEY);
    const storedRole = localStorage.getItem(ROLE_KEY);
    setToken(storedToken);
    setEmail(storedEmail);
    setRole(storedRole || (storedEmail?.toLowerCase() === "admin@riskbusters.com" ? "admin" : null));
    setReady(true);
  }, []);

  const setSession = useCallback((auth: AuthResponse) => {
    const nextRole = auth.user.role || "user";
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(EMAIL_KEY, auth.user.email);
    localStorage.setItem(ROLE_KEY, nextRole);
    setToken(auth.token);
    setEmail(auth.user.email);
    setRole(nextRole);
  }, []);

  const login = useCallback(async (e: string, password: string) => {
    const auth = await apiPost<AuthResponse>(
      "/api/auth/login",
      { email: e, password }
    );
    setSession(auth);
  }, [setSession]);

  const register = useCallback(async (name: string, e: string, password: string, country?: string) => {
    const auth = await apiPost<AuthResponse>("/api/auth/register", {
      name,
      email: e,
      password,
      country,
    });
    setSession(auth);
  }, [setSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(ROLE_KEY);
    setToken(null);
    setEmail(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated: Boolean(token),
      isEditable: Boolean(token) && role === "admin",
      email,
      login,
      register,
      logout,
      ready,
      pendingDownload,
      setPendingDownload,
    }),
    [token, role, email, login, register, logout, ready, pendingDownload]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {pendingDownload && (
        <DownloadRegisterModal
          open={Boolean(pendingDownload)}
          onClose={() => setPendingDownload(null)}
          onSuccess={async () => {
            if (pendingDownload) {
              await startAuthenticatedDownload(pendingDownload);
              setPendingDownload(null);
            }
          }}
        />
      )}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
