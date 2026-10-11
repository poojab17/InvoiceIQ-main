import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Pagination() {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-t border-gray-800">

      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition">

        <ChevronLeft size={18} />

        Previous

      </button>

      <div className="flex items-center gap-2">

        <button className="w-10 h-10 rounded-lg bg-blue-600 text-white">
          1
        </button>

        <button className="w-10 h-10 rounded-lg bg-[#1F2937] text-gray-300 hover:bg-gray-700">
          2
        </button>

        <button className="w-10 h-10 rounded-lg bg-[#1F2937] text-gray-300 hover:bg-gray-700">
          3
        </button>

      </div>

      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition">

        Next

        <ChevronRight size={18} />

      </button>

    </div>
  );
}