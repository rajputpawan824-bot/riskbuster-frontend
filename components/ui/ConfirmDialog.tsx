import { Modal } from "./Modal";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "danger" | "default";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title = "Confirm",
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="flex flex-col grow">
        <div className="px-4 py-2 grid place-content-center">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <div className="mt-auto flex justify-end gap-3 border-t border-gray-100 px-4 py-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            className={`rounded px-4 py-2 text-sm font-semibold text-white ${
              tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-[#001f3f] hover:bg-[#002b52]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

