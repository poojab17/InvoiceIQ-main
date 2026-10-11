import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


export default function FieldCoverageChart({
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

        <h2
          className="
            font-semibold
            text-white
          "
        >
          Field Extraction Coverage
        </h2>


        <p
          className="
            mt-1
            text-sm
            text-gray-500
          "
        >
          Percentage of invoices where
          each field contains extracted
          data.
        </p>

      </div>


      {data.length === 0 ? (

        <EmptyState />

      ) : (

        <div className="h-[360px]">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={data}
              layout="vertical"
              margin={{
                left: 30,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f2937"
                horizontal={false}
              />


              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="#6b7280"
                tickLine={false}
                axisLine={false}
                tickFormatter={(
                  value
                ) => `${value}%`}
                fontSize={12}
              />


              <YAxis
                type="category"
                dataKey="field"
                width={120}
                stroke="#6b7280"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />


              <Tooltip
                formatter={(value) => [
                  `${value}%`,
                  "Coverage",
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


              <Bar
                dataKey="coverage"
                fill="#6366f1"
                radius={[
                  0,
                  6,
                  6,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      )}

    </div>
  );
}


function EmptyState() {
  return (
    <div
      className="
        flex
        h-[360px]
        items-center
        justify-center
        text-center
      "
    >
      <p
        className="
          text-sm
          text-gray-500
        "
      >
        No extraction data yet.
      </p>
    </div>
  );
}