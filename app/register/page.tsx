"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/site/BrandLogo";
import { MainShell } from "@/components/site/MainShell";
import { useAuth } from "@/context/AuthContext";
import { clearPendingDownload, replayPendingDownload, readPendingDownload } from "@/lib/download";
import { COUNTRY_FORM_OPTIONS } from "@/lib/countries";

export default function RegisterPage() {
  const { register, isAuthenticated, ready } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) return;
    const pending = readPendingDownload();
    if (!pending) {
      router.replace("/");
      return;
    }
    void replayPendingDownload();
  }, [isAuthenticated, ready, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register(name, email, password, selectedCountry);
      const didReplay = await replayPendingDownload();
      if (!didReplay) {
        clearPendingDownload();
        router.push("/");
        router.refresh();
      }
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Registration failed");
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

  if (isAuthenticated && !readPendingDownload()) {
    return (
      <MainShell>
        <div className="mx-auto max-w-md py-8 text-center">
          <p className="text-[#001f3f]">You are already signed in.</p>
          <Link href="/" className="mt-3 inline-block text-sm font-semibold text-blue-600 underline">
            Go to home
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
          <h1 className="mt-4 text-xl font-bold text-[#001f3f]">Register</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create your account to download documents.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {err && (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {err}
            </p>
          )}
          <div>
            <label htmlFor="name" className="text-sm font-medium text-[#001f3f]">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="country" className="text-sm font-medium text-[#001f3f]">
              Country
            </label>
            <select
              id="country"
              required
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              <option value="">Select your country</option>
              {COUNTRY_FORM_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-[#001f3f]">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
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
              autoComplete="new-password"
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
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500">
          Already registered?{" "}
          <Link href="/login" className="text-blue-600 underline">
            Sign in
          </Link>
        </p>
      </div>
    </MainShell>
  );
}
