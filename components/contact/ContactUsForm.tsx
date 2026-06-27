"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { CheckCircle2 } from "lucide-react";
import { SearchableCountrySelect } from "../ui/SearchableCountrySelect";

type Props = {
  onCancel: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  subject: "",
  description: "",
};

export function ContactUsForm({ onCancel, onSuccess, onError }: Props) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const setField = (key: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await apiPost("/api/contact", form);
      const displayName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      setSubmittedName(displayName || "there");
      setForm(initialForm);
      onSuccess("Contact request sent successfully.");
    } catch (error: any) {
      console.error(error);
      const message = error?.message || "Failed to send contact request. Please try again.";
      setErr(message);
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  if (submittedName) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-[#001f3f]">Thank you, {submittedName}!</h3>
        <p className="mt-2 max-w-sm text-sm text-gray-600">
          Your message has been sent successfully. Our team will get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmittedName(null);
            onCancel();
          }}
          className="mt-6 rounded bg-[#001f3f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#002b52]"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col overflow-auto grow">
      <div className="grow space-y-4 overflow-auto px-3 py-2">
        {err && (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {err}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[#001f3f]">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#001f3f]">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[#001f3f]">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#001f3f]">
              Country <span className="text-red-600">*</span>
            </label>
            <SearchableCountrySelect
              value={form.country}
              onChange={(val) => setField("country", val)}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#001f3f]">
            Subject <span className="text-red-600">*</span>
          </label>
          <input
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={form.subject}
            onChange={(e) => setField("subject", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#001f3f]">
            Description <span className="text-red-600">*</span>
          </label>
          <textarea
            className="mt-1 min-h-[130px] w-full rounded border border-gray-300 px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mt-auto flex flex-wrap justify-end gap-3 border-t border-gray-100 px-4 py-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border-2 border-[#001f3f] bg-white px-4 py-2 text-sm font-semibold text-[#001f3f] hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[#001f3f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#002b52] disabled:opacity-60"
        >
          {loading ? "Sending..." : "Submit"}
        </button>
      </div>
    </form>
  );
}

