"use client";

import { useState, useMemo } from "react";
import { CalendarDays, Coins, TrendingUp, Sparkles, Receipt } from "lucide-react";
import { Header } from "@/components/layout/header";
import { useShell } from "@/components/layout/shell";
import { usePortfolio } from "@/context/portfolio-context";
import { useAssetMap } from "@/lib/queries/use-asset-lookup";
import { formatKRW } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Asset } from "@/types/asset";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

/** 배당소득세율: 소득세 14% + 지방소득세 1.4% */
const TAX_RATE = 0.154;

/**
 * 배당 주기에 따라 지급 월(0-indexed) 목록 반환
 * - 월배당: 매월
 * - 분기배당: 3·6·9·12월
 * - 연배당: 주식→4월(index 3), ETF→12월(index 11)
 */
function getDividendMonths(cycle: string, type: "ETF" | "STOCK"): number[] {
  switch (cycle) {
    case "월배당":
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    case "분기배당":
      return [2, 5, 8, 11]; // 3, 6, 9, 12월
    case "연배당":
      return type === "STOCK" ? [3] : [11]; // 주식→4월, ETF→12월
    default:
      return [];
  }
}

interface MonthEntry {
  ticker: string;
  name: string;
  amount: number;
  type: "ETF" | "STOCK";
}

interface MonthData {
  monthIndex: number;
  label: string;
  total: number;
  entries: MonthEntry[];
}

export default function DividendCalendarPage() {
  const { openSidebar } = useShell();
  const { items } = usePortfolio();
  const { assetMap } = useAssetMap();

  const [withTax, setWithTax] = useState(false);
  const currentMonth = new Date().getMonth();

  // 포트폴리오에서 배당 있는 종목만 (ETF·주식 모두)
  const portfolioAssets = useMemo(() => {
    return items
      .map((item) => {
        const asset = assetMap.get(item.ticker);
        if (!asset || asset.dividendYield === 0) return null;
        if (asset.dividendCycle === "미지급") return null;
        return { ...asset, quantity: item.quantity };
      })
      .filter(Boolean) as (Asset & { quantity: number })[];
  }, [items, assetMap]);

  // 월별 배당 데이터 (세금 적용 여부 반영)
  const monthlyGrid: MonthData[] = useMemo(() => {
    const months: MonthData[] = MONTH_LABELS.map((label, i) => ({
      monthIndex: i,
      label,
      total: 0,
      entries: [],
    }));

    const taxMultiplier = withTax ? 1 - TAX_RATE : 1;

    for (const asset of portfolioAssets) {
      // dividendCycle은 이제 ETF·주식 모두 보유
      const divMonths = getDividendMonths(asset.dividendCycle, asset.type);
      if (divMonths.length === 0) continue;

      const investAmount = asset.currentPrice * asset.quantity;
      // 세전 연간 배당금 × 세후 비율 → 지급 횟수로 나눔
      const annualDividend = investAmount * (asset.dividendYield / 100);
      const perPayment = Math.round((annualDividend * taxMultiplier) / divMonths.length);

      for (const m of divMonths) {
        months[m].entries.push({
          ticker: asset.ticker,
          name: asset.name,
          amount: perPayment,
          type: asset.type,
        });
        months[m].total += perPayment;
      }
    }

    return months;
  }, [portfolioAssets, withTax]);

  const annualTotal = useMemo(
    () => monthlyGrid.reduce((sum, m) => sum + m.total, 0),
    [monthlyGrid]
  );
  const monthlyAverage = Math.round(annualTotal / 12);
  const maxMonthTotal = useMemo(
    () => Math.max(...monthlyGrid.map((m) => m.total)),
    [monthlyGrid]
  );

  const hasPortfolio = items.length > 0;
  const hasDividendAssets = portfolioAssets.length > 0;

  return (
    <>
      <Header
        title="배당 캘린더"
        description="포트폴리오 월별 예상 배당금을 확인하세요"
        onMenuClick={openSidebar}
      />
      <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* 상단 통계 + 세금 토글 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
          <div className="grid grid-cols-2 gap-3 flex-1 sm:gap-4">
            <Card className="border-border">
              <CardHeader className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="h-4 w-4" />
                  <span className="text-xs font-medium">연간 총 배당금</span>
                </div>
                <CardTitle className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
                  {formatKRW(annualTotal)}
                </CardTitle>
                {withTax && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">세후 기준</p>
                )}
              </CardHeader>
            </Card>
            <Card className="border-border">
              <CardHeader className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium">월평균 배당금</span>
                </div>
                <CardTitle className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
                  {formatKRW(monthlyAverage)}
                </CardTitle>
                {withTax && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">세후 기준</p>
                )}
              </CardHeader>
            </Card>
          </div>

          {/* 배당소득세 토글 카드 */}
          <button
            onClick={() => setWithTax((v) => !v)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border p-4 text-left transition-colors sm:w-52 sm:flex-col sm:items-start sm:justify-start",
              withTax
                ? "border-amber-400/40 bg-amber-400/[0.06]"
                : "border-border bg-card hover:bg-secondary/50"
            )}
          >
            <div className="flex items-center gap-2">
              <Receipt className={cn("h-4 w-4 shrink-0", withTax ? "text-amber-400" : "text-muted-foreground")} />
              <span className={cn("text-xs font-medium", withTax ? "text-amber-400" : "text-muted-foreground")}>
                배당소득세 차감
              </span>
            </div>
            <div className="flex items-center gap-2 sm:mt-auto">
              <span className={cn("text-xs font-semibold tabular-nums", withTax ? "text-amber-400" : "text-muted-foreground")}>
                15.4%
              </span>
              <div
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  withTax ? "bg-amber-400" : "bg-secondary"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    withTax ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </div>
            </div>
          </button>
        </div>

        {/* 안내 메시지 (포트폴리오 없을 때) */}
        {!hasPortfolio ? (
          <Card className="border-dashed border-border">
            <CardContent className="flex h-48 items-center justify-center p-6">
              <p className="text-sm text-muted-foreground">
                포트폴리오에 종목을 담고 수량을 입력하면 월별 배당금을 확인할 수 있습니다
              </p>
            </CardContent>
          </Card>
        ) : !hasDividendAssets ? (
          <Card className="border-dashed border-border">
            <CardContent className="flex h-48 items-center justify-center p-6">
              <p className="text-sm text-muted-foreground">
                배당이 있는 종목이 포트폴리오에 없습니다
              </p>
            </CardContent>
          </Card>
        ) : (
          /* 12개월 그리드 */
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {monthlyGrid.map((month) => {
              const isCurrent = month.monthIndex === currentMonth;
              const isBonus = month.total > 0 && month.total === maxMonthTotal;
              const hasEntries = month.entries.length > 0;

              return (
                <Card
                  key={month.monthIndex}
                  className={cn(
                    "relative overflow-hidden transition-colors",
                    isCurrent && "ring-1 ring-amber-400/50",
                    isBonus && !isCurrent && "ring-1 ring-emerald-400/40",
                    isBonus && "border-emerald-400/30 bg-emerald-400/[0.03]",
                    !hasEntries && "opacity-50"
                  )}
                >
                  {isBonus && hasEntries && (
                    <div className="absolute right-2.5 top-2.5">
                      <div className="flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5">
                        <Sparkles className="h-3 w-3 text-emerald-400" />
                        <span className="text-[10px] font-semibold text-emerald-400">MAX</span>
                      </div>
                    </div>
                  )}
                  {isCurrent && !isBonus && (
                    <div className="absolute right-2.5 top-2.5">
                      <div className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5">
                        <CalendarDays className="h-3 w-3 text-amber-400" />
                        <span className="text-[10px] font-semibold text-amber-400">NOW</span>
                      </div>
                    </div>
                  )}

                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-baseline justify-between pr-14">
                      <CardTitle
                        className={cn(
                          "text-base font-bold",
                          isCurrent ? "text-amber-400" : "text-foreground"
                        )}
                      >
                        {month.label}
                      </CardTitle>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-lg font-bold tabular-nums sm:text-xl",
                        month.total > 0
                          ? isBonus ? "text-emerald-400" : "text-foreground"
                          : "text-muted-foreground/40"
                      )}
                    >
                      {month.total > 0 ? formatKRW(month.total) : "-"}
                    </p>
                    {maxMonthTotal > 0 && (
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            isBonus ? "bg-emerald-400" : isCurrent ? "bg-amber-400" : "bg-primary/60"
                          )}
                          style={{ width: `${(month.total / maxMonthTotal) * 100}%` }}
                        />
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-4 pt-2">
                    {hasEntries ? (
                      <ul className="space-y-1.5">
                        {month.entries.map((entry) => (
                          <li key={entry.ticker} className="flex items-center justify-between">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span
                                className={cn(
                                  "shrink-0 rounded px-1 py-0.5 text-[9px] font-semibold leading-none",
                                  entry.type === "ETF"
                                    ? "bg-blue-500/15 text-blue-400"
                                    : "bg-emerald-500/15 text-emerald-400"
                                )}
                              >
                                {entry.type === "ETF" ? "E" : "S"}
                              </span>
                              <span className="truncate text-xs text-muted-foreground">
                                {entry.name}
                              </span>
                            </div>
                            <span className="ml-2 shrink-0 font-mono text-xs font-medium text-foreground">
                              {formatKRW(entry.amount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="py-2 text-center text-xs text-muted-foreground/50">
                        배당 없음
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
