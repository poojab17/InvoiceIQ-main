import {
  CheckCircle2,
  Eye,
  UploadCloud,
} from "lucide-react";

export default function UploadSuccess({
  file,
  onView,
  onUploadAgain,
}) {
  return (
    <div className="bg-[#111827] border border-green-500/20 rounded-2xl p-8 text-center">

      <div className="w-20 h-20 rounded-full bg-green-500/20 mx-auto flex items-center justify-center">

        <CheckCircle2
          size={50}
          className="text-green-400"
        />

      </div>

      <h2 className="text-2xl font-bold text-white mt-6">
        Upload Successful
      </h2>

      <p className="text-gray-400 mt-2">
        Your invoice has been processed successfully.
      </p>

      <div className="mt-6 p-4 rounded-xl bg-[#0F172A] border border-gray-800">

        <p className="text-white font-medium">
          {file?.name}
        </p>

        <p className="text-gray-400 text-sm mt-1">
          Ready for AI Insights
        </p>

      </div>

      <div className="flex gap-4 mt-8">

        <button
          onClick={onView}
          className="
            flex-1
            flex
            justify-center
            items-center
            gap-2
            bg-blue-600
            hover:bg-blue-700
            py-3
            rounded-xl
            text-white
            transition
          "
        >
          <Eye size={18} />

          View Invoice

        </button>

        <button
          onClick={onUploadAgain}
          className="
            flex-1
            flex
            justify-center
            items-center
            gap-2
            bg-gray-800
            hover:bg-gray-700
            py-3
            rounded-xl
            text-white
            transition
          "
        >
          <UploadCloud size={18} />

          Upload Another

        </button>

      </div>

    </div>
  );
}