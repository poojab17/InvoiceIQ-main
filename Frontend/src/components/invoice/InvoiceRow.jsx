import { Eye, Download } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

export default function InvoiceRow({ invoice }) {
  return (
    <tr className="border-b border-gray-800 hover:bg-[#1A2235] transition">

      <td className="py-4 px-5 text-white font-medium">
        {invoice.id}
      </td>

      <td className="py-4 px-5 text-gray-300">
        {invoice.vendor}
      </td>

      <td className="py-4 px-5 text-gray-400">
        {invoice.date}
      </td>

      <td className="py-4 px-5 text-white">
        {invoice.amount}
      </td>

      <td className="py-4 px-5">
        <StatusBadge status={invoice.status} />
      </td>

      <td className="py-4 px-5 text-green-400 font-medium">
        {invoice.confidence}%
      </td>

      <td className="py-4 px-5">

        <div className="flex gap-3">

          <Link
            to={`/invoice/${invoice.id}`}
            className="text-blue-400 hover:text-blue-300"
          >
            <Eye size={18} />
          </Link>

          <button className="text-gray-400 hover:text-white">
            <Download size={18} />
          </button>

        </div>

      </td>

    </tr>
  );
}