"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MainShell } from "@/components/site/MainShell";
import { BrandLogo } from "@/components/site/BrandLogo";
import Link from "next/link";
import { cleanErrorMessage } from "@/lib/api";
import { FlashMessage } from "@/components/ui/FlashMessage";

export default function LoginPage() {
  const { login, isAuthenticated, isAdmin, ready } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setToast(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
      router.refresh();
    } catch (ex: unknown) {
      const msg = cleanErrorMessage(ex, "Login failed");
      setErr(msg);
      setToast({ message: msg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <MainShell>
        <div className="mx-auto max-w-md py-8 text-center text-gray-600">Loading…</div>
      </MainShell>
    );
  }

  if (isAuthenticated) {
    return (
      <MainShell>
        <div className="mx-auto max-w-md py-8 text-center">
          <p className="text-[#001f3f] font-medium">
            You are signed in as <span className="font-semibold">{isAdmin ? "Admin" : "User"}</span>.
          </p>
          <Link href="/" className="mt-3 inline-block text-sm font-semibold text-blue-600 underline">
            Go to dashboard
          </Link>
        </div>
      </MainShell>
    );
  }

  return (
    <MainShell>
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandLogo />
          <h1 className="mt-4 text-xl font-bold text-[#001f3f]">Sign in</h1>
          <p className="mt-1 text-sm text-gray-600">
            Sign in with your credentials. Admins can create, edit, and delete content; regular users can preview, read, and download documents.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {err && (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {err}
            </p>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-[#001f3f]">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-[#001f3f]">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#001f3f] py-2.5 text-sm font-bold text-white hover:bg-[#002b52] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500">
          <Link href="/" className="text-blue-600 underline">
            Back to read-only view
          </Link>
        </p>
      </div>
      <FlashMessage
        message={toast?.message ?? null}
        tone={toast?.tone}
        onClose={() => setToast(null)}
      />
    </MainShell>
  );
}
