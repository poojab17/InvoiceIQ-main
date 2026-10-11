import {
  AlertTriangle,
  X,
} from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/70
        px-4
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-white/[0.08]
          bg-[#111827]
          p-6
          shadow-2xl
        "
      >
        <div className="flex items-start justify-between gap-4">

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-red-500/10
            "
          >
            <AlertTriangle
              size={21}
              className="text-red-400"
            />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close confirmation dialog"
            className="
              rounded-lg
              p-2
              text-gray-500
              transition
              hover:bg-white/5
              hover:text-white
              disabled:opacity-40
            "
          >
            <X size={18} />
          </button>

        </div>

        <h2
          id="confirm-modal-title"
          className="
            mt-5
            text-lg
            font-semibold
            text-white
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-gray-400
          "
        >
          {description}
        </p>

        <div
          className="
            mt-6
            flex
            items-center
            justify-end
            gap-3
          "
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              rounded-xl
              border
              border-white/[0.08]
              px-4
              py-2.5
              text-sm
              text-gray-300
              transition
              hover:bg-white/5
              disabled:opacity-50
            "
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              rounded-xl
              bg-red-600
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              transition
              hover:bg-red-500
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "Deleting..."
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}