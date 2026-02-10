'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';

interface ChartData {
  date: string;
  close: number;
  ma20: number | null;
  ma50: number | null;
}

interface PriceChartProps {
  data: ChartData[];
  symbol: string;
}

export function PriceChart({ data, symbol }: PriceChartProps) {
  const [colors, setColors] = useState({
    price: '#3b82f6',
    ma20: '#22c55e',
    ma50: '#ef4444',
    border: '#ccc',
    fg: '#888',
    bg: '#fff',
  });

  // ✅ Resolve CSS variables for SVG (Recharts can't read var())
  useEffect(() => {
    const getCssVar = (name: string) =>
      getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();

    setColors({
      price: getCssVar('--color-chart-1') || '#3b82f6',
      ma20: getCssVar('--color-chart-2') || '#22c55e',
      ma50: getCssVar('--color-chart-3') || '#ef4444',
      border: getCssVar('--color-border') || '#ccc',
      fg: getCssVar('--color-foreground') || '#888',
      bg: getCssVar('--color-background') || '#fff',
    });
  }, []);

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No data available</p>
      </Card>
    );
  }

  // ✅ Show last 100 days & format date
  const displayData = data.slice(-100).map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    close: Number(item.close.toFixed(2)),
    ma20: item.ma20 !== null ? Number(item.ma20.toFixed(2)) : null,
    ma50: item.ma50 !== null ? Number(item.ma50.toFixed(2)) : null,
  }));

  // ✅ Correct Y-axis domain calculation (no fake zeros)
  const allValues = displayData
    .flatMap((d) => [d.close, d.ma20, d.ma50])
    .filter((v): v is number => v !== null && !isNaN(v));

  const minPrice = Math.min(...allValues);
  const maxPrice = Math.max(...allValues);
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">
        {symbol} Price Chart (Last 100 Days)
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={displayData}
          margin={{ top: 5, right: 30, left: 0, bottom: 60 }}
        >
          <CartesianGrid
            stroke={colors.border}
            strokeDasharray="3 3"
            opacity={0.3}
          />

          <XAxis
            dataKey="date"
            tick={{ fill: colors.fg, fontSize: 12 }}
            interval={Math.floor(displayData.length / 8)}
            angle={-45}
            textAnchor="end"
            height={80}
          />

          <YAxis
            tick={{ fill: colors.fg, fontSize: 12 }}
            domain={[minPrice - padding, maxPrice + padding]}
            label={{
              value: 'Price ($)',
              angle: -90,
              position: 'insideLeft',
              fill: colors.fg,
            }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
            }}
            labelStyle={{ color: colors.fg }}
            formatter={(value: number | null) =>
              value !== null ? `$${value.toFixed(2)}` : 'N/A'
            }
          />

          <Legend verticalAlign="top" height={36} />

          <Line
            type="monotone"
            dataKey="close"
            stroke={colors.price}
            strokeWidth={2}
            dot={false}
            name="Price"
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="ma20"
            stroke={colors.ma20}
            strokeWidth={2}
            strokeDasharray="8 4"
            dot={false}
            name="20-Day MA"
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="ma50"
            stroke={colors.ma50}
            strokeWidth={2}
            strokeDasharray="8 4"
            dot={false}
            name="50-Day MA"
            isAnimationActive={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
