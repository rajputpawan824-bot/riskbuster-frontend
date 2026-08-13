"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/site/BrandLogo";
import { MainShell } from "@/components/site/MainShell";
import { apiPost, cleanErrorMessage } from "@/lib/api";
import { FlashMessage } from "@/components/ui/FlashMessage";
import { ArrowLeft, CheckCircle, Lock } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "error" | "success" } | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSuccessMsg(null);
    setToast(null);

    if (!token) {
      setErr("Invalid or missing reset token.");
      return;
    }

    if (newPassword.length < 6) {
      setErr("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiPost<{ message: string }>("/api/auth/reset-password", {
        email,
        token,
        newPassword,
      });
      setSuccessMsg(res.message);
      setToast({ message: res.message, tone: "success" });
    } catch (ex: unknown) {
      const msg = cleanErrorMessage(ex, "Failed to reset password");
      setErr(msg);
      setToast({ message: msg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <BrandLogo />
        <h1 className="mt-4 text-xl font-bold text-[#001f3f]">Create new password</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter your new password below to regain access to your account.
        </p>
      </div>

      {successMsg ? (
        <div className="space-y-4 text-center">
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-left text-green-900">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div className="text-sm">
              <p className="font-semibold">Password Reset Successful!</p>
              <p className="mt-1 text-green-800">{successMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full rounded bg-[#001f3f] py-2.5 text-sm font-bold text-white hover:bg-[#002b52]"
          >
            Sign in with new password
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {err && (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {err}
            </p>
          )}

          <div>
            <label htmlFor="email" className="text-sm font-medium text-[#001f3f]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!tokenParam && (
            <div>
              <label htmlFor="token" className="text-sm font-medium text-[#001f3f]">
                Reset Code / Token
              </label>
              <input
                id="token"
                type="text"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className="text-sm font-medium text-[#001f3f]">
              New Password
            </label>
            <div className="relative mt-1">
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className="w-full rounded border border-gray-300 px-3 py-2 pl-9 text-sm"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-[#001f3f]">
              Confirm New Password
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="w-full rounded border border-gray-300 px-3 py-2 pl-9 text-sm"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#001f3f] py-2.5 text-sm font-bold text-white hover:bg-[#002b52] disabled:opacity-60"
          >
            {loading ? "Resetting password…" : "Reset Password"}
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        </form>
      )}

      <FlashMessage
        message={toast?.message ?? null}
        tone={toast?.tone}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <MainShell>
      <Suspense fallback={<div className="mx-auto max-w-md py-8 text-center text-gray-600">Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </MainShell>
  );
}
