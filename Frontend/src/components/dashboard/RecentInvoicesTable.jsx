import Card from "../ui/Card";
import { recentInvoices } from "../../data/recentInvoices";

export default function RecentInvoicesTable() {
  return (
    <Card className="p-6">

      <h2 className="text-xl font-semibold text-white mb-5">
        Recent Invoices
      </h2>

      <table className="w-full">

        <thead>

          <tr className="text-zinc-500 border-b border-zinc-800">

            <th className="text-left py-3">Invoice</th>
            <th className="text-left">Vendor</th>
            <th className="text-left">Amount</th>
            <th className="text-left">Confidence</th>
            <th className="text-left">Status</th>

          </tr>

        </thead>

        <tbody>

          {recentInvoices.map((invoice) => (

            <tr
              key={invoice.id}
              className="border-b border-zinc-900 hover:bg-zinc-900 transition"
            >

              <td className="py-4">{invoice.id}</td>

              <td>{invoice.vendor}</td>

              <td>{invoice.amount}</td>

              <td className="text-cyan-400">
                {invoice.confidence}
              </td>

              <td>

                <span
                  className={`px-3 py-1 rounded-full text-xs

                  ${
                    invoice.status === "Approved"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {invoice.status}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </Card>
  );
}