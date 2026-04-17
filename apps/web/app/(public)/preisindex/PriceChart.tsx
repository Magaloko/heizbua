"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  date: string;
  avgPrice: number;
};

type Props = {
  data: DataPoint[];
  unit: string;
  color?: string;
};

export function PriceChart({ data, unit, color = "#2563eb" }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Noch keine Preisdaten vorhanden.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `${v.toFixed(2)} €`}
          width={70}
        />
        <Tooltip
          formatter={(value) => [`${(value as number).toFixed(3)} €/${unit}`, "Ø Preis"]}
        />
        <Line
          type="monotone"
          dataKey="avgPrice"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
