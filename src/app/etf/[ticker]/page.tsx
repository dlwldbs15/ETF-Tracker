"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  BarChart3,
  Calendar,
  Percent,
  TrendingUp,
  DollarSign,
  Menu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceLineChart } from "@/components/chart/price-line-chart";
import { useShell } from "@/components/layout/shell";
import { getEtfDetail, generatePriceHistory, getHoldings } from "@/lib/mock-data";
import { Holding } from "@/types/etf";
import {
  formatKRW,
  formatMarketCap,
  formatChangeRate,
  formatExpenseRatio,
  formatVolume,
} from "@/lib/format";

export default function EtfDetailPage() {
  const params = useParams<{ ticker: string }>();
  const router = useRouter();
  const { openSidebar } = useShell();

  const etf = getEtfDetail(params.ticker);

  if (!etf) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-lg text-muted-foreground">
          종목을 찾을 수 없습니다 ({params.ticker})
        </p>
        <Button variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
      </div>
    );
  }

  const priceHistory = generatePriceHistory(etf.ticker);
  const holdings = getHoldings(etf.ticker);
  const isPositive = etf.changeRate >= 0;

  return (
    <div>
      {/* Mobile top bar */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4 sm:px-6 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={openSidebar}
          className="text-muted-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="truncate text-sm font-medium text-foreground">
          {etf.name}
        </span>
      </div>

      <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Back Button + Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-3 text-muted-foreground hover:text-foreground sm:mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로가기
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
                  {etf.name}
                </h1>
                <Badge variant="secondary">{etf.category}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {etf.ticker} · {etf.provider}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-2xl font-bold text-foreground sm:text-3xl">
                {formatKRW(etf.price)}
              </p>
              <p
                className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${
                  isPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {formatChangeRate(etf.changeRate)}
              </p>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="rounded-lg border border-border bg-card p-3 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
            1개월 가격 추이
          </h2>
          <PriceLineChart data={priceHistory} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Info Cards */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
                주요 정보
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                <InfoCard
                  icon={<DollarSign className="h-4 w-4" />}
                  label="시가총액"
                  value={formatMarketCap(etf.marketCap)}
                />
                <InfoCard
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="기초지수"
                  value={etf.benchmark}
                />
                <InfoCard
                  icon={<Calendar className="h-4 w-4" />}
                  label="상장일"
                  value={etf.listingDate}
                />
                <InfoCard
                  icon={<Percent className="h-4 w-4" />}
                  label="총보수"
                  value={formatExpenseRatio(etf.expenseRatio)}
                />
                <InfoCard
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="거래량"
                  value={formatVolume(etf.volume)}
                />
                <InfoCard
                  icon={<Building2 className="h-4 w-4" />}
                  label="운용사"
                  value={etf.provider}
                />
              </div>
            </div>
          </div>

          {/* Holdings List */}
          <div>
            <HoldingsList holdings={holdings} />
          </div>
        </div>
      </div>
    </div>
  );
}

const COLLAPSED_COUNT = 5;

function HoldingsList({ holdings }: { holdings: Holding[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = holdings.length > COLLAPSED_COUNT;
  const visible = expanded ? holdings : holdings.slice(0, COLLAPSED_COUNT);
  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0);

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h2 className="text-sm font-semibold text-foreground">
          구성 종목
        </h2>
        <span className="text-xs text-muted-foreground">
          총 {holdings.length}개
        </span>
      </div>

      <ul className="space-y-3">
        {visible.map((holding, idx) => (
          <li
            key={holding.ticker}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {holding.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {holding.ticker}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-sm font-semibold text-foreground">
                {holding.weight.toFixed(1)}%
              </span>
              <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-secondary sm:w-20">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(holding.weight * 3, 100)}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Total weight + expand toggle */}
      <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {expanded ? "전체" : `상위 ${COLLAPSED_COUNT}개`} 비중 합계
          </span>
          <span className="font-semibold text-foreground">
            {visible.reduce((s, h) => s + h.weight, 0).toFixed(1)}%
            {!expanded && hasMore && (
              <span className="ml-1 font-normal text-muted-foreground">
                / {totalWeight.toFixed(1)}%
              </span>
            )}
          </span>
        </div>

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium text-primary transition-colors hover:bg-secondary"
          >
            {expanded ? (
              <>
                접기
                <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                {holdings.length - COLLAPSED_COUNT}개 더보기
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-secondary/50 p-2.5 sm:p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-foreground sm:mt-1.5">
        {value}
      </p>
    </div>
  );
}
