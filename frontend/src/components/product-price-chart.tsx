"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

interface PriceData {
  date: string;
  price: number;
}

export default function ProductPriceChart({ data }: { data: PriceData[] }) {
  const { theme } = useTheme();

  // Format data for Recharts
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    price: item.price,
  }));

  // Take every 10th data point to avoid overcrowding the chart
  const sampledData = chartData.filter((_, index) => index % 10 === 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={sampledData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={["auto", "auto"]} />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="price"
          name="Price"
          stroke="#0ea5e9"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
