"use client";

import { useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { FlashMessage } from "@/components/ui/FlashMessage";
import { useAuth } from "@/context/AuthContext";
import { COUNTRY_FORM_OPTIONS } from "@/lib/countries";
import { cleanErrorMessage } from "@/lib/api";
import { BrandLogo } from "./BrandLogo";
import { Mail, Lock, User, Globe, ArrowRight } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type Mode = "register" | "login";

export function DownloadRegisterModal({ open, onClose, onSuccess }: Props) {
  const { register, login } = useAuth();
  const [mode, setMode] = useState<Mode>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setToast(null);
    setLoading(true);
    try {
      if (mode === "register") {
        await register(name, email, password, selectedCountry);
      } else {
        await login(email, password);
      }
      onSuccess();
    } catch (ex: unknown) {
      const msg = cleanErrorMessage(ex, `${mode === "register" ? "Registration" : "Login"} failed`);
      setErr(msg);
      setToast({ message: msg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "register" ? "login" : "register"));
    setErr(null);
    setToast(null);
    setName("");
    setEmail("");
    setPassword("");
    setSelectedCountry("");
  };

  return (
    <Modal
      open={open}
      title={mode === "register" ? "Register to Download" : "Sign In to Download"}
      onClose={onClose}
      bodyClassName="p-6 sm:p-8"
    >
      <div className="flex flex-col items-center text-center">
        <BrandLogo />
        <h3 className="mt-4 text-xl font-extrabold text-[#001f3f] tracking-tight">
          {mode === "register" ? "Create Your Account" : "Welcome Back"}
        </h3>
        <p className="mt-2 text-xs text-gray-500 max-w-xs">
          {mode === "register"
            ? "Sign up to instantly download security risk templates and documents."
            : "Sign in to your account to instantly resume your document downloads."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {err && (
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-xs text-red-800 backdrop-blur-sm">
            {err}
          </div>
        )}

        {mode === "register" && (
          <>
            <div>
              <label htmlFor="modal-name" className="text-xs font-semibold text-[#001f3f] block mb-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="modal-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-[#001f3f] focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="modal-country" className="text-xs font-semibold text-[#001f3f] block mb-1">
                Country
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Globe className="h-4 w-4" />
                </span>
                <select
                  id="modal-country"
                  required
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-[#001f3f] focus:outline-none focus:ring-1 focus:ring-[#001f3f] bg-white"
                >
                  <option value="">Select your country</option>
                  {COUNTRY_FORM_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        <div>
          <label htmlFor="modal-email" className="text-xs font-semibold text-[#001f3f] block mb-1">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="modal-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-[#001f3f] focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="modal-password" className="text-xs font-semibold text-[#001f3f] block mb-1">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="modal-password"
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-[#001f3f] focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#001f3f] to-[#003366] py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg focus:outline-none disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Authenticating...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              {mode === "register" ? "Register & Download" : "Sign In & Download"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">
        {mode === "register" ? (
          <p>
            Already registered?{" "}
            <button onClick={toggleMode} className="font-bold text-[#2563eb] hover:underline focus:outline-none">
              Sign in here
            </button>
          </p>
        ) : (
          <p>
            Need an account?{" "}
            <button onClick={toggleMode} className="font-bold text-[#2563eb] hover:underline focus:outline-none">
              Register here
            </button>
          </p>
        )}
      </div>
      <FlashMessage
        message={toast?.message ?? null}
        tone={toast?.tone}
        onClose={() => setToast(null)}
      />
    </Modal>
  );
}
