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

type AuthState = {
  isEditable: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  ready: boolean;
};

const Ctx = createContext<AuthState | null>(null);
const TOKEN_KEY = "rb_token";
const EMAIL_KEY = "rb_email";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY));
    setEmail(localStorage.getItem(EMAIL_KEY));
    setReady(true);
  }, []);

  const login = useCallback(async (e: string, password: string) => {
    const { token: t, user } = await apiPost<{ token: string; user: { email: string } }>(
      "/api/auth/login",
      { email: e, password }
    );
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(EMAIL_KEY, user.email);
    setToken(t);
    setEmail(user.email);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken(null);
    setEmail(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      isEditable: Boolean(token),
      email,
      login,
      logout,
      ready,
    }),
    [token, email, login, logout, ready]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
