import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "./ChartCard";
import { monthlySpend } from "../../data/analytics";

export default function MonthlySpendChart() {
  return (
    <ChartCard
      title="Monthly Spending"
      subtitle="Invoice expenses over time"
    >
      <ResponsiveContainer width="100%" height={300}>

        <AreaChart data={monthlySpend}>

          <defs>

            <linearGradient
              id="spendGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
            </linearGradient>

          </defs>

          <CartesianGrid
            stroke="#27272a"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="month"
            stroke="#71717a"
          />

          <YAxis
            stroke="#71717a"
          />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="spend"
            stroke="#06b6d4"
            fill="url(#spendGradient)"
            strokeWidth={3}
          />

        </AreaChart>

      </ResponsiveContainer>
    </ChartCard>
  );
}