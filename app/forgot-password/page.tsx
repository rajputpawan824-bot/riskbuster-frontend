"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/site/BrandLogo";
import { MainShell } from "@/components/site/MainShell";
import { apiPost, cleanErrorMessage } from "@/lib/api";
import { FlashMessage } from "@/components/ui/FlashMessage";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "error" | "success" } | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSuccessMsg(null);
    setToast(null);
    setLoading(true);

    try {
      const res = await apiPost<{ message: string }>("/api/auth/forgot-password", {
        email,
      });
      setSuccessMsg(res.message);
      setToast({ message: res.message, tone: "success" });
    } catch (ex: unknown) {
      const msg = cleanErrorMessage(ex, "Failed to request password reset");
      setErr(msg);
      setToast({ message: msg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainShell>
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandLogo />
          <h1 className="mt-4 text-xl font-bold text-[#001f3f]">Forgot password</h1>
          <p className="mt-1 text-sm text-gray-600">
            Enter your account email address below to receive password reset instructions.
          </p>
        </div>

        {successMsg ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div className="text-sm">
                <p className="font-semibold">Reset email sent!</p>
                <p className="mt-1 text-green-800">{successMsg}</p>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="text-blue-600 underline font-medium"
              >
                try again
              </button>
              .
            </p>
            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to sign in
              </Link>
            </div>
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
              <div className="relative mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded border border-gray-300 px-3 py-2 pl-9 text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-[#001f3f] py-2.5 text-sm font-bold text-white hover:bg-[#002b52] disabled:opacity-60"
            >
              {loading ? "Sending reset link…" : "Send Reset Link"}
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
      </div>

      <FlashMessage
        message={toast?.message ?? null}
        tone={toast?.tone}
        onClose={() => setToast(null)}
      />
    </MainShell>
  );
}
