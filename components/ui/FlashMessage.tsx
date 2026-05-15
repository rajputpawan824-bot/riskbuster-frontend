type Props = {
  message: string | null;
  tone?: "success" | "error";
  onClose?: () => void;
};

export function FlashMessage({ message, tone = "success", onClose }: Props) {
  if (!message) return null;
  return (
    <div className="fixed inset-x-0 bottom-3 z-[60] flex justify-center px-3 sm:bottom-4">
      <div
        className={`flex w-full max-w-md items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm shadow-lg ${
          tone === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-red-200 bg-red-50 text-red-900"
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="min-w-0">{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded px-2 py-1 text-xs font-semibold opacity-80 hover:opacity-100"
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
}

