import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MonthlyInvoicesChart({
  data = [],
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.07]
        bg-[#111827]
        p-6
      "
    >
      <div className="mb-6">
        <h3 className="font-semibold text-white">
          Monthly Processing
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Number of invoices processed each month
        </p>
      </div>

      {data.length === 0 ? (
        <ChartEmptyState />
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f2937"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                stroke="#6b7280"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />

              <YAxis
                stroke="#6b7280"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                fontSize={12}
              />

              <Tooltip
                cursor={{
                  fill: "rgba(255,255,255,0.03)",
                }}
                contentStyle={{
                  backgroundColor: "#0B1120",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />

              <Bar
                dataKey="invoices"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                name="Invoices"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function ChartEmptyState() {
  return (
    <div
      className="
        flex
        h-[280px]
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        border-white/[0.07]
        bg-[#0B1120]
      "
    >
      <div className="text-center">
        <p className="text-sm font-medium text-gray-300">
          No processing data yet
        </p>

        <p className="mt-1 text-xs text-gray-600">
          Process invoices to generate this chart.
        </p>
      </div>
    </div>
  );
}