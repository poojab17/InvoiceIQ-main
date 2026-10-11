import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
];

export default function VendorDistribution({
  data = [],
}) {
  const chartData = data
    .slice(0, 6)
    .map((vendor) => ({
      name: vendor.name,
      value: vendor.count,
    }));

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
      <div className="mb-4">
        <h3 className="font-semibold text-white">
          Vendor Distribution
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Invoice volume by extracted vendor
        </p>
      </div>

      {chartData.length === 0 ? (
        <ChartEmptyState />
      ) : (
        <>
          <div className="h-[220px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {chartData.map(
                    (_, index) => (
                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip
                  formatter={(value) => [
                    `${value} invoice${
                      value === 1 ? "" : "s"
                    }`,
                    "Count",
                  ]}
                  contentStyle={{
                    backgroundColor:
                      "#0B1120",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                    borderRadius:
                      "12px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-3">
            {chartData.map(
              (vendor, index) => (
                <div
                  key={vendor.name}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                    "
                  >
                    <span
                      className="
                        h-2.5
                        w-2.5
                        shrink-0
                        rounded-full
                      "
                      style={{
                        backgroundColor:
                          COLORS[
                            index %
                              COLORS.length
                          ],
                      }}
                    />

                    <span
                      className="
                        truncate
                        text-sm
                        text-gray-400
                      "
                    >
                      {vendor.name}
                    </span>
                  </div>

                  <span
                    className="
                      text-sm
                      font-medium
                      text-white
                    "
                  >
                    {vendor.value}
                  </span>
                </div>
              )
            )}
          </div>
        </>
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
        text-center
      "
    >
      <div>
        <p className="text-sm font-medium text-gray-300">
          No vendor data yet
        </p>

        <p className="mt-1 text-xs text-gray-600">
          Extracted vendors will appear here.
        </p>
      </div>
    </div>
  );
}