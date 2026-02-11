"use client";

import Link from "next/link";
import {
  Trash2,
  PieChart as PieChartIcon,
  TrendingUp,
  Wallet,
  Briefcase,
  Minus,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { useShell } from "@/components/layout/shell";
import { usePortfolio } from "@/context/portfolio-context";
import { mockEtfs } from "@/lib/mock-data";
import {
  formatKRW,
  formatChangeRate,
  formatExpenseRatio,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export default function PortfolioPage() {
  const { openSidebar } = useShell();
  const {
    items,
    removeItem,
    updateQuantity,
    getAmount,
    getWeight,
    totalAmount,
    estimatedReturn,
  } = usePortfolio();

  return (
    <>
      <Header
        title="내 포트폴리오"
        description="보유 ETF 현황과 수익률을 확인하세요"
        onMenuClick={openSidebar}
      />
      <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Summary Cards */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            <SummaryCard
              icon={<Briefcase className="h-4 w-4" />}
              label="보유 종목"
              value={`${items.length}개`}
              sub={`총 투자금액 ${formatKRW(totalAmount)}`}
            />
            <SummaryCard
              icon={<Wallet className="h-4 w-4" />}
              label="총 평가금액"
              value={formatKRW(totalAmount)}
              sub="현재가 기준"
            />
            <SummaryCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="1주 예상 수익률"
              value={formatChangeRate(estimatedReturn.rate1w)}
              valueColor={estimatedReturn.rate1w >= 0}
              sub="비중 가중 평균"
            />
            <SummaryCard
              icon={<PieChart className="h-4 w-4" />}
              label="1개월 예상 수익률"
              value={formatChangeRate(estimatedReturn.rate1m)}
              valueColor={estimatedReturn.rate1m >= 0}
              sub={`가중 총보수 ${formatExpenseRatio(estimatedReturn.weightedExpense)}`}
            />
          </div>
        )}

        {/* 비중 배분 + 포트폴리오 구성 (2-column) */}
        {items.length === 0 ? (
          <div className="rounded-lg border border-border bg-card">
            <div className="flex flex-col items-center justify-center gap-3 p-12">
              <div className="rounded-full bg-secondary p-3">
                <PieChartIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                아직 담은 ETF가 없습니다
              </p>
              <Link href="/">
                <Button variant="secondary" size="sm">
                  ETF 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Left: 비중 배분 (도넛 차트) */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    비중 배분
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  수량 기반 자동 계산
                </span>
              </div>

              {totalAmount > 0 ? (
                <>
                  {/* Donut Chart */}
                  <div className="mx-auto h-[220px] w-full max-w-[280px] sm:h-[260px] sm:max-w-[320px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie
                          data={items
                            .map((item, idx) => {
                              const etf = mockEtfs.find((e) => e.ticker === item.ticker);
                              const weight = getWeight(item.ticker);
                              return {
                                name: etf?.name?.slice(0, 10) ?? item.ticker,
                                value: weight,
                                ticker: item.ticker,
                                color: getColorByIndex(idx),
                              };
                            })
                            .filter((d) => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius="55%"
                          outerRadius="85%"
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {items.map((_, idx) => (
                            <Cell
                              key={idx}
                              fill={getColorByIndex(idx)}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                    {items.map((item, idx) => {
                      const weight = getWeight(item.ticker);
                      if (weight <= 0) return null;
                      const etf = mockEtfs.find((e) => e.ticker === item.ticker);
                      return (
                        <div key={item.ticker} className="flex items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: getColorByIndex(idx) }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {etf?.name?.slice(0, 10)} {weight.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                  수량을 입력하면 비중이 계산됩니다
                </div>
              )}
            </div>

            {/* Right: 포트폴리오 구성 */}
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-foreground">
                  포트폴리오 구성
                </h2>
                <span className="text-xs text-muted-foreground">
                  {items.length}개 종목
                </span>
              </div>

              <ul>
                {items.map((item, idx) => {
                  const etf = mockEtfs.find((e) => e.ticker === item.ticker);
                  if (!etf) return null;
                  const isPositive = etf.changeRate >= 0;
                  const amount = getAmount(item.ticker);
                  const weight = getWeight(item.ticker);

                  return (
                    <li
                      key={item.ticker}
                      className="border-b border-border p-4 last:border-b-0"
                    >
                      {/* Top row: ETF info + remove */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: getColorByIndex(idx) }}
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/etf/${etf.ticker}`}
                              tabIndex={-1}
                              className="truncate text-sm font-medium text-foreground hover:underline"
                            >
                              {etf.name}
                            </Link>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">
                                {etf.ticker}
                              </span>
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  isPositive ? "text-emerald-400" : "text-red-400"
                                )}
                              >
                                {isPositive ? "+" : ""}{etf.changeRate.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          tabIndex={-1}
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-red-400"
                          onClick={() => removeItem(item.ticker)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Bottom row: quantity stepper, amount, weight */}
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="flex items-center">
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() =>
                              updateQuantity(item.ticker, Math.max(0, item.quantity - 1))
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-l-md border border-input bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            tabIndex={0}
                            value={item.quantity || ""}
                            placeholder="0"
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10);
                              updateQuantity(item.ticker, isNaN(v) ? 0 : Math.max(0, v));
                            }}
                            className="h-7 w-14 border-y border-input bg-background px-1 text-center font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() =>
                              updateQuantity(item.ticker, item.quantity + 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-r-md border border-input bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <span className="ml-1.5 text-xs text-muted-foreground">주</span>
                        </div>
                        <div className="ml-auto text-right">
                          <span className="font-mono text-sm text-foreground">
                            {formatKRW(amount)}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {weight > 0 ? `${weight.toFixed(1)}%` : "-"}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/** 색상환에서 최대한 멀리 떨어진 색을 순서대로 배정 */
const PIE_COLORS = [
  "#34d399", // emerald
  "#60a5fa", // blue
  "#f472b6", // pink
  "#fbbf24", // amber
  "#a78bfa", // violet
  "#fb923c", // orange
  "#2dd4bf", // teal
  "#e879f9", // fuchsia
  "#38bdf8", // sky
  "#f87171", // red
  "#4ade80", // green
  "#facc15", // yellow
  "#c084fc", // purple
  "#22d3ee", // cyan
  "#fb7185", // rose
];

function getColorByIndex(index: number): string {
  return PIE_COLORS[index % PIE_COLORS.length];
}

function PieTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { ticker: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="mb-0.5 text-xs font-medium text-muted-foreground">{name}</p>
      <p className="text-sm font-bold text-foreground">{value.toFixed(1)}%</p>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  valueColor,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: boolean;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p
        className={cn(
          "mt-1.5 text-lg font-bold sm:text-xl",
          valueColor === undefined
            ? "text-foreground"
            : valueColor
              ? "text-emerald-400"
              : "text-red-400"
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
