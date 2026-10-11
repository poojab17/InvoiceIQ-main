import { CheckCircle2 } from "lucide-react";

export default function UploadProgress({ progress }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">

      <div className="flex justify-between items-center mb-3">

        <h3 className="text-white font-semibold">
          Uploading Invoice
        </h3>

        <span className="text-blue-400 font-semibold">
          {progress}%
        </span>

      </div>

      <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden">

        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      <div className="mt-4 flex justify-between text-sm">

        <span className="text-gray-400">
          {progress < 100
            ? "Uploading..."
            : "Upload Completed"}
        </span>

        {progress === 100 && (
          <CheckCircle2
            className="text-green-400"
            size={20}
          />
        )}

      </div>

    </div>
  );
}