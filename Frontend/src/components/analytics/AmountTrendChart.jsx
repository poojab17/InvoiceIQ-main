import {
  LineChart,
  Line,
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

export default function AmountTrendChart({
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
          Invoice Amount Trend
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Extracted invoice values over time
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
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f2937"
                vertical={false}
              />

              <XAxis
                dataKey="label"
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
                  "Amount",
                ]}
                labelFormatter={(
                  label,
                  payload
                ) => {
                  const vendor =
                    payload?.[0]
                      ?.payload?.vendor;

                  return vendor
                    ? `${label} • ${vendor}`
                    : label;
                }}
                contentStyle={{
                  backgroundColor: "#0B1120",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />

              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#8b5cf6",
                }}
                activeDot={{
                  r: 6,
                }}
                name="Amount"
              />
            </LineChart>
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
          No amount trend yet
        </p>

        <p className="mt-1 text-xs text-gray-600">
          Extracted invoice totals will appear here.
        </p>
      </div>
    </div>
  );
}