import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import ChartCard from "./ChartCard";
import { vendorDistribution } from "../../data/analytics";

const COLORS = [
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#a855f7",
  "#22c55e",
];

export default function VendorChart() {
  return (
    <ChartCard
      title="Vendor Distribution"
      subtitle="Top invoice vendors"
    >
      <ResponsiveContainer width="100%" height={300}>

        <PieChart>

          <Pie
            data={vendorDistribution}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
          >

            {vendorDistribution.map((item, index) => (

              <Cell
                key={item.name}
                fill={COLORS[index % COLORS.length]}
              />

            ))}

          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>

      </ResponsiveContainer>
    </ChartCard>
  );
}