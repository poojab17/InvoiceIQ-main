import {
  FileSearch,
} from "lucide-react";

export default function EmptyTable() {
  return (
    <div className="py-20 flex flex-col items-center">

      <FileSearch
        size={60}
        className="text-gray-600"
      />

      <h3 className="text-white text-xl font-semibold mt-5">
        No Invoices Found
      </h3>

      <p className="text-gray-400 mt-2">
        Try changing your search or filters.
      </p>

    </div>
  );
}