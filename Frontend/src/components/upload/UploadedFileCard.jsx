import {
  FileText,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function UploadedFileCard({
  file,
  progress = 0,
  onRemove,
}) {
  const actualFile = file?.[0] || file;

  if (!actualFile) {
    return null;
  }

  const fileName = actualFile.name || "Selected Invoice";

  const fileSize = actualFile.size
    ? (actualFile.size / 1024 / 1024).toFixed(2)
    : "0.00";

  return (
    <div
      className="
        w-full
        bg-[#111827]
        border
        border-blue-500/30
        rounded-2xl
        p-5
      "
    >

      <div className="flex items-center justify-between gap-4">

        <div className="flex items-center gap-4 min-w-0">

          <div
            className="
              w-14
              h-14
              shrink-0
              rounded-xl
              bg-blue-600/20
              flex
              items-center
              justify-center
            "
          >
            <FileText
              size={28}
              className="text-blue-400"
            />
          </div>

          <div className="min-w-0">

            <h3 className="text-white font-semibold truncate">
              {fileName}
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              {fileSize} MB
            </p>

          </div>

        </div>

        {progress >= 100 ? (
          <CheckCircle2
            size={28}
            className="text-green-400 shrink-0"
          />
        ) : (
          <span className="text-blue-400 text-sm">
            {progress}%
          </span>
        )}

      </div>

      <div className="mt-5">

        <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">

          <div
            className="
              h-full
              bg-blue-500
              transition-all
              duration-300
            "
            style={{
              width: `${Math.min(progress, 100)}%`,
            }}
          />

        </div>

      </div>

      <div className="flex items-center justify-between mt-5 gap-4">

        <span className="text-sm text-gray-400">
          {progress >= 100
            ? "Ready for AI Processing"
            : "Uploading..."}
        </span>

        <button
          type="button"
          onClick={onRemove}
          className="
            flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            bg-red-600
            hover:bg-red-700
            transition
            text-white
            text-sm
          "
        >
          <Trash2 size={16} />
          Remove
        </button>

      </div>

    </div>
  );
}