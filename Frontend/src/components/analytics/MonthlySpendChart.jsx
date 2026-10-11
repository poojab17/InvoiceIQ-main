import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatAmount = (value) =>
  `₹${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;

export default function MonthlySpendChart({
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
          Monthly Spend
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Extracted invoice totals grouped by month
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
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id="spendGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#10b981"
                    stopOpacity={0.3}
                  />

                  <stop
                    offset="95%"
                    stopColor="#10b981"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

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
                fontSize={12}
                tickFormatter={formatAmount}
              />

              <Tooltip
                formatter={(value) => [
                  formatAmount(value),
                  "Spend",
                ]}
                contentStyle={{
                  backgroundColor: "#0B1120",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />

              <Area
                type="monotone"
                dataKey="spending"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#spendGradient)"
                name="Spend"
              />
            </AreaChart>
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
          No spending data yet
        </p>

        <p className="mt-1 text-xs text-gray-600">
          Valid extracted totals will appear here.
        </p>
      </div>
    </div>
  );
}