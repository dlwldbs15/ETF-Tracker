"use client";

import Link from "next/link";
import {
  Trash2,
  PieChart,
  TrendingUp,
  TrendingDown,
  Wallet,
  Briefcase,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

        {/* Weight Distribution Bar */}
        {items.length > 0 && totalAmount > 0 && (
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  비중 배분
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                수량 기반 자동 계산
              </span>
            </div>

            {/* Stacked bar */}
            <div className="flex h-3 overflow-hidden rounded-full bg-secondary">
              {items.map((item) => {
                const weight = getWeight(item.ticker);
                if (weight <= 0) return null;
                return (
                  <div
                    key={item.ticker}
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${weight}%`,
                      backgroundColor: getBarColor(item.ticker),
                    }}
                    title={`${mockEtfs.find((e) => e.ticker === item.ticker)?.name} ${weight.toFixed(1)}%`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {items.map((item) => {
                const weight = getWeight(item.ticker);
                if (weight <= 0) return null;
                const etf = mockEtfs.find((e) => e.ticker === item.ticker);
                return (
                  <div key={item.ticker} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getBarColor(item.ticker) }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {etf?.name?.slice(0, 10)} {weight.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Portfolio Items */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-foreground">
              포트폴리오 구성
            </h2>
            {items.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {items.length}개 종목
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12">
              <div className="rounded-full bg-secondary p-3">
                <PieChart className="h-6 w-6 text-muted-foreground" />
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
          ) : (
            <ul>
              {items.map((item) => {
                const etf = mockEtfs.find((e) => e.ticker === item.ticker);
                if (!etf) return null;
                const isPositive = etf.changeRate >= 0;
                const amount = getAmount(item.ticker);
                const weight = getWeight(item.ticker);

                return (
                  <li
                    key={item.ticker}
                    className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    {/* Left: ETF info */}
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/etf/${etf.ticker}`}
                          className="truncate text-sm font-medium text-foreground hover:underline"
                        >
                          {etf.name}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {etf.ticker}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            {etf.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Right: price, quantity, amount, weight, actions */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Current price & change */}
                      <div className="hidden text-right sm:block">
                        <p className="font-mono text-sm text-foreground">
                          {formatKRW(etf.price)}
                        </p>
                        <p
                          className={cn(
                            "flex items-center justify-end gap-0.5 text-xs font-medium",
                            isPositive ? "text-emerald-400" : "text-red-400"
                          )}
                        >
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatChangeRate(etf.changeRate)}
                        </p>
                      </div>

                      {/* Quantity input */}
                      <div className="flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={item.quantity || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            updateQuantity(item.ticker, isNaN(v) ? 0 : Math.max(0, v));
                          }}
                          className="h-8 w-16 rounded-md border border-input bg-background px-2 text-right font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <span className="text-xs text-muted-foreground">주</span>
                      </div>

                      {/* Calculated amount & weight */}
                      <div className="text-right">
                        <p className="font-mono text-sm text-foreground">
                          {formatKRW(amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {weight > 0 ? `${weight.toFixed(1)}%` : "-"}
                        </p>
                      </div>

                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-400"
                        onClick={() => removeItem(item.ticker)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

const BAR_COLORS = [
  "#34d399", "#60a5fa", "#f472b6", "#fbbf24",
  "#a78bfa", "#fb923c", "#2dd4bf", "#e879f9",
  "#4ade80", "#f87171", "#38bdf8", "#facc15",
  "#c084fc", "#fb7185", "#22d3ee",
];

function getBarColor(ticker: string): string {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BAR_COLORS[Math.abs(hash) % BAR_COLORS.length];
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
