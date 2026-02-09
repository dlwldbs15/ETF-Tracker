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
  Coins,
  CircleDollarSign,
  CalendarClock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceLineChart } from "@/components/chart/price-line-chart";
import { useShell } from "@/components/layout/shell";
import { usePortfolio } from "@/context/portfolio-context";
import { getEtfDetail, generatePriceHistory, getHoldings } from "@/lib/mock-data";
import { Holding, EtfDetail } from "@/types/etf";
import {
  formatKRW,
  formatMarketCap,
  formatChangeRate,
  formatExpenseRatio,
  formatVolume,
} from "@/lib/format";
import { cn } from "@/lib/utils";

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

        {/* Dividend Section */}
        <DividendSection etf={etf} />

        {/* Dividend Reinvestment Simulation */}
        <DividendReinvestSimulation etf={etf} />
      </div>
    </div>
  );
}

// ─── 예상 배당 정보 섹션 ─────────────────────────────────

function DividendSection({ etf }: { etf: EtfDetail }) {
  const { items } = usePortfolio();
  const portfolioItem = items.find((i) => i.ticker === etf.ticker);
  const quantity = portfolioItem?.quantity ?? 0;

  const totalInvestment = etf.price * quantity;
  const annualDividend = totalInvestment * (etf.dividendYield / 100);
  const annualExpense = totalInvestment * (etf.expenseRatio / 100);
  const isMonthly = etf.dividendCycle === "월배당";
  const monthlyDividend = annualDividend / 12;
  const coverageRatio = annualExpense > 0 ? annualDividend / annualExpense : 0;
  const hasDividend = etf.dividendYield > 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Coins className="h-5 w-5 text-amber-400" />
        <h2 className="text-sm font-semibold text-foreground">
          예상 배당 정보
        </h2>
        {hasDividend && (
          <Badge variant="secondary" className="text-[10px] font-normal">
            {etf.dividendCycle}
          </Badge>
        )}
      </div>

      {!hasDividend ? (
        <div className="flex flex-col items-center justify-center gap-2 py-6">
          <Coins className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            이 ETF는 배당금을 지급하지 않습니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Dividend info cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md bg-secondary/50 p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Percent className="h-3.5 w-3.5" />
                <span className="text-xs">배당수익률</span>
              </div>
              <p className="mt-1 text-sm font-bold text-amber-400 sm:text-base">
                {etf.dividendYield.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-md bg-secondary/50 p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                <span className="text-xs">배당 주기</span>
              </div>
              <p className="mt-1 text-sm font-bold text-foreground sm:text-base">
                {etf.dividendCycle}
              </p>
            </div>
            <div className="rounded-md bg-secondary/50 p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CircleDollarSign className="h-3.5 w-3.5" />
                <span className="text-xs">최근 1주 배당</span>
              </div>
              <p className="mt-1 text-sm font-bold text-foreground sm:text-base">
                {formatKRW(etf.lastDividendAmount)}
              </p>
            </div>
            <div className="rounded-md bg-secondary/50 p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-xs">배당 vs 수수료</span>
              </div>
              <p className={cn(
                "mt-1 text-sm font-bold sm:text-base",
                coverageRatio >= 1 ? "text-emerald-400" : "text-amber-400"
              )}>
                {coverageRatio > 0 ? `${coverageRatio.toFixed(1)}배` : "-"}
              </p>
            </div>
          </div>

          {/* My dividend estimate (quantity-based) */}
          {quantity > 0 ? (
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-amber-400">
                  내 예상 배당금 ({quantity}주 보유 기준)
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  투자금 {formatKRW(totalInvestment)}
                </span>
              </div>

              <div className={cn(
                "grid gap-3",
                isMonthly ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
              )}>
                <div>
                  <p className="text-xs text-muted-foreground">연간 예상 배당금</p>
                  <p className="mt-0.5 text-lg font-bold text-foreground sm:text-xl">
                    {formatKRW(Math.round(annualDividend))}
                  </p>
                </div>
                {isMonthly && (
                  <div>
                    <p className="text-xs text-muted-foreground">월 평균 배당금</p>
                    <p className="mt-0.5 text-lg font-bold text-amber-400 sm:text-xl">
                      {formatKRW(Math.round(monthlyDividend))}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">연간 수수료 (총보수)</p>
                  <p className="mt-0.5 text-lg font-bold text-red-400/80 sm:text-xl">
                    -{formatKRW(Math.round(annualExpense))}
                  </p>
                </div>
              </div>

              {/* Net summary */}
              <div className="mt-3 flex items-center justify-between border-t border-amber-400/10 pt-3">
                <span className="text-xs text-muted-foreground">
                  배당 - 수수료 (순 수익)
                </span>
                <span className={cn(
                  "font-mono text-sm font-bold",
                  annualDividend - annualExpense >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {annualDividend - annualExpense >= 0 ? "+" : ""}
                  {formatKRW(Math.round(annualDividend - annualExpense))}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <p className="text-xs text-muted-foreground">
                포트폴리오에 이 ETF를 담고 수량을 입력하면
              </p>
              <p className="text-xs text-muted-foreground">
                예상 배당금을 확인할 수 있습니다
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 배당 재투자 시뮬레이션 ──────────────────────────────

const MILESTONES = [1, 3, 5, 10, 20] as const;

function DividendReinvestSimulation({ etf }: { etf: EtfDetail }) {
  const { items } = usePortfolio();
  const portfolioItem = items.find((i) => i.ticker === etf.ticker);
  const quantity = portfolioItem?.quantity ?? 0;

  const hasDividend = etf.dividendYield > 0;
  if (!hasDividend) return null;

  const totalInvestment = etf.price * quantity;
  const rate = etf.dividendYield / 100;

  // 배당 주기에 따른 복리 횟수
  const compoundsPerYear =
    etf.dividendCycle === "월배당" ? 12 : etf.dividendCycle === "분기배당" ? 4 : 1;
  const periodicRate = rate / compoundsPerYear;

  // 시뮬레이션 결과 계산
  const simulations = MILESTONES.map((year) => {
    const periods = compoundsPerYear * year;
    // 재투자 (복리)
    const withReinvest = totalInvestment * Math.pow(1 + periodicRate, periods);
    // 단순 수령 (단리)
    const withoutReinvest = totalInvestment * (1 + rate * year);
    const extra = withReinvest - withoutReinvest;
    const extraPct =
      totalInvestment > 0
        ? ((withReinvest - totalInvestment) / totalInvestment) * 100
        : 0;
    const extraVsSimplePct =
      withoutReinvest > totalInvestment
        ? ((withReinvest - withoutReinvest) / (withoutReinvest - totalInvestment)) * 100
        : 0;

    return { year, withReinvest, withoutReinvest, extra, extraPct, extraVsSimplePct };
  });

  const tenYear = simulations.find((s) => s.year === 10)!;

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <RefreshCw className="h-5 w-5 text-emerald-400" />
        <h2 className="text-sm font-semibold text-foreground">
          배당 재투자 효과
        </h2>
        <Badge variant="secondary" className="text-[10px] font-normal">
          복리 시뮬레이션
        </Badge>
      </div>

      {/* Highlight message */}
      <div className="mb-4 rounded-lg bg-emerald-400/5 border border-emerald-400/20 p-3 sm:p-4">
        <p className="text-sm leading-relaxed text-foreground">
          {quantity > 0 ? (
            <>
              만약 받은 배당금을{" "}
              <span className="font-semibold text-emerald-400">
                {etf.dividendCycle === "월배당" ? "매달" : etf.dividendCycle === "분기배당" ? "매 분기" : "매년"} 재투자
              </span>
              한다면,{" "}
              <span className="font-semibold text-amber-400">10년 후</span> 단순
              배당 수령 대비 자산이 약{" "}
              <span className="font-bold text-emerald-400">
                {formatKRW(Math.round(tenYear.extra))}
              </span>{" "}
              더 늘어납니다.
            </>
          ) : (
            <>
              배당수익률{" "}
              <span className="font-semibold text-amber-400">
                {etf.dividendYield.toFixed(2)}%
              </span>
              로{" "}
              <span className="font-semibold text-emerald-400">
                {etf.dividendCycle === "월배당" ? "매달" : etf.dividendCycle === "분기배당" ? "매 분기" : "매년"} 재투자
              </span>
              하면,{" "}
              <span className="font-semibold text-amber-400">10년 후</span>{" "}
              총 수익이 약{" "}
              <span className="font-bold text-emerald-400">
                {tenYear.extraPct.toFixed(1)}%
              </span>{" "}
              증가합니다. 포트폴리오에 담으면 금액으로 확인할 수 있습니다.
            </>
          )}
        </p>
      </div>

      {/* Simulation table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left font-medium text-muted-foreground">기간</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">단순 수령</th>
              <th className="pb-2 text-right font-medium text-emerald-400/70">재투자 (복리)</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">복리 효과</th>
            </tr>
          </thead>
          <tbody>
            {simulations.map((sim) => (
              <tr key={sim.year} className="border-b border-border/50 last:border-b-0">
                <td className="py-2.5 font-medium text-foreground">{sim.year}년 후</td>
                <td className="py-2.5 text-right font-mono text-muted-foreground">
                  {quantity > 0 ? (
                    formatKRW(Math.round(sim.withoutReinvest))
                  ) : (
                    `+${(etf.dividendYield * sim.year).toFixed(1)}%`
                  )}
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">
                  {quantity > 0 ? (
                    formatKRW(Math.round(sim.withReinvest))
                  ) : (
                    `+${sim.extraPct.toFixed(1)}%`
                  )}
                </td>
                <td className="py-2.5 text-right font-mono text-amber-400">
                  {quantity > 0 ? (
                    `+${formatKRW(Math.round(sim.extra))}`
                  ) : (
                    `+${(sim.extraPct - etf.dividendYield * sim.year).toFixed(1)}%p`
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        * 배당수익률 {etf.dividendYield.toFixed(2)}% 고정, 주가 변동 미반영,
        세전 기준의 단순 시뮬레이션입니다. 실제 수익은 시장 상황에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}

// ─── Holdings List ───────────────────────────────────────

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
