"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PricePoint } from "@/types/etf";
import { formatKRW, formatChangeRate } from "@/lib/format";

interface PriceLineChartProps {
  data: PricePoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
  firstPrice,
  lineColor,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  firstPrice: number;
  lineColor: string;
}) {
  if (!active || !payload?.length) return null;

  const currentPrice = payload[0].value;
  const diff = currentPrice - firstPrice;
  const diffRate = (diff / firstPrice) * 100;
  const isUp = diff >= 0;

  return (
    <div className="rounded-xl border border-border bg-card/95 px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
      {/* Date */}
      <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
        {label}
      </p>

      {/* Price */}
      <p className="text-base font-bold text-foreground">
        {formatKRW(currentPrice)}
      </p>

      {/* Change from start */}
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className="inline-flex items-center gap-0.5 text-xs font-semibold"
          style={{ color: lineColor }}
        >
          {isUp ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {formatChangeRate(diffRate)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          ({isUp ? "+" : ""}{formatKRW(diff)})
        </span>
      </div>
    </div>
  );
}

export function PriceLineChart({ data }: PriceLineChartProps) {
  if (data.length === 0) return null;

  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const isPositive = lastPrice >= firstPrice;
  const lineColor = isPositive ? "#34d399" : "#f87171";

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1 || 100;

  return (
    <div className="h-[220px] w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.15} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(217 33% 17%)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
            axisLine={{ stroke: "hsl(217 33% 17%)" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice - padding, maxPrice + padding]}
            tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => v.toLocaleString("ko-KR")}
            width={56}
            className="hidden sm:block"
          />
          <YAxis
            yAxisId="mobile"
            domain={[minPrice - padding, maxPrice + padding]}
            hide
          />
          <ReferenceLine
            y={firstPrice}
            stroke="hsl(215 20% 55%)"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
          />
          <Tooltip
            content={
              <CustomTooltip firstPrice={firstPrice} lineColor={lineColor} />
            }
            cursor={{
              stroke: "hsl(215 20% 55%)",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 5,
              fill: lineColor,
              stroke: "hsl(222 47% 6%)",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
