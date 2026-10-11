import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";


const COLORS = [
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#ef4444",
];


export default function CompletenessDistribution({
  data = [],
}) {
  const hasData =
    data.some(
      (item) =>
        item.value > 0
    );


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

      <div>

        <h2
          className="
            font-semibold
            text-white
          "
        >
          Extraction Completeness
        </h2>


        <p
          className="
            mt-1
            text-sm
            text-gray-500
          "
        >
          Invoice distribution based on
          extracted field completeness.
        </p>

      </div>


      {!hasData ? (

        <div
          className="
            flex
            h-[300px]
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
            No completeness data yet.
          </p>
        </div>

      ) : (

        <>

          <div className="h-[220px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={85}
                  paddingAngle={3}
                >

                  {data.map(
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
                  formatter={(
                    value,
                    name
                  ) => [
                    `${value} invoice${
                      value === 1
                        ? ""
                        : "s"
                    }`,
                    name,
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


          <div
            className="
              mt-3
              grid
              grid-cols-2
              gap-3
            "
          >

            {data.map(
              (item, index) => (

                <div
                  key={item.name}
                  className="
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-[#080D18]
                    p-3
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        h-2
                        w-2
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
                        text-xs
                        text-gray-400
                      "
                    >
                      {item.name}
                    </span>

                  </div>


                  <p
                    className="
                      mt-2
                      text-lg
                      font-semibold
                      text-white
                    "
                  >
                    {item.value}
                  </p>


                  <p
                    className="
                      text-[10px]
                      text-gray-600
                    "
                  >
                    {item.range}
                  </p>

                </div>

              )
            )}

          </div>

        </>

      )}

    </div>
  );
}