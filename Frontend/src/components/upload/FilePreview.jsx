import { FileText, Trash2 } from "lucide-react";

export default function FilePreview({
  file,
  onRemove,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 p-4">

      <div className="flex items-center gap-4">

        <FileText
          className="text-cyan-400"
          size={34}
        />

        <div>

          <h3 className="font-medium">
            {file.name}
          </h3>

          <p className="text-sm text-zinc-400">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>

        </div>

      </div>

      <button
        onClick={onRemove}
        className="text-red-400 hover:text-red-300"
      >
        <Trash2 size={20} />
      </button>

    </div>
  );
}