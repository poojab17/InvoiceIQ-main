import { UploadCloud } from "lucide-react";

export default function UploadButton({ files }) {
  return (
    <button
      disabled={files.length === 0}
      className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="flex items-center justify-center gap-3">
        <UploadCloud size={20} />
        Analyze {files.length} File{files.length !== 1 ? "s" : ""}
      </div>
    </button>
  );
}