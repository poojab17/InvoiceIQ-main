import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "./ChartCard";
import { invoiceTrend } from "../../data/analytics";

export default function InvoiceTrendChart() {
  return (
    <ChartCard
      title="Invoice Processing Trend"
      subtitle="Monthly processed invoices"
    >
      <ResponsiveContainer width="100%" height={320}>

        <LineChart data={invoiceTrend}>

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

          <Line
            type="monotone"
            dataKey="invoices"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{ r: 5 }}
          />

        </LineChart>

      </ResponsiveContainer>
    </ChartCard>
  );
}