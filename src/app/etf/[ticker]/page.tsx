"use client";

import { useState, useMemo } from "react";
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
  Lightbulb,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceLineChart } from "@/components/chart/price-line-chart";
import { useShell } from "@/components/layout/shell";
import { usePortfolio } from "@/context/portfolio-context";
import { getAssetDetail, generatePriceHistory, getHoldings } from "@/lib/mock-data";
import type { AssetDetail, EtfAssetDetail, StockAssetDetail } from "@/types/asset";
import type { Holding } from "@/types/etf";
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

  const etf = getAssetDetail(params.ticker);

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
                <span className={cn(
                  "rounded px-1.5 py-0.5 text-xs font-semibold",
                  etf.type === "ETF"
                    ? "bg-blue-500/15 text-blue-400"
                    : "bg-emerald-500/15 text-emerald-400"
                )}>
                  {etf.type === "ETF" ? "ETF" : "주식"}
                </span>
                <Badge variant="secondary">{etf.category}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {etf.ticker}{etf.type === "ETF" ? ` · ${etf.issuer}` : etf.type === "STOCK" ? ` · ${etf.sector}` : ""}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-2xl font-bold text-foreground sm:text-3xl">
                {formatKRW(etf.currentPrice)}
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
                {etf.type === "ETF" && (
                  <InfoCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="기초지수"
                    value={etf.benchmark}
                  />
                )}
                <InfoCard
                  icon={<Calendar className="h-4 w-4" />}
                  label="상장일"
                  value={etf.listingDate}
                />
                {etf.type === "ETF" ? (
                  <InfoCard
                    icon={<Percent className="h-4 w-4" />}
                    label="총보수"
                    value={formatExpenseRatio(etf.expenseRatio)}
                  />
                ) : (
                  <InfoCard
                    icon={<Percent className="h-4 w-4" />}
                    label="PER"
                    value={`${etf.per.toFixed(1)}배`}
                  />
                )}
                <InfoCard
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="거래량"
                  value={formatVolume(etf.volume)}
                />
                {etf.type === "ETF" ? (
                  <InfoCard
                    icon={<Building2 className="h-4 w-4" />}
                    label="운용사"
                    value={etf.issuer}
                  />
                ) : (
                  <InfoCard
                    icon={<Building2 className="h-4 w-4" />}
                    label="PBR"
                    value={`${etf.pbr.toFixed(2)}배`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Holdings List */}
          <div>
            <HoldingsList holdings={holdings} />
          </div>
        </div>

        {/* ETF 전용: 배당 + 분석기 */}
        {etf.type === "ETF" && (
          <>
            <DividendSection etf={etf} />
            <IntegratedAnalyzer etf={etf} />
          </>
        )}

        {/* 주식 전용: 주요 재무 지표 */}
        {etf.type === "STOCK" && (
          <StockFinancialSection stock={etf} />
        )}
      </div>
    </div>
  );
}

// ─── 예상 배당 정보 섹션 ─────────────────────────────────

function DividendSection({ etf }: { etf: EtfAssetDetail }) {
  const { items } = usePortfolio();
  const portfolioItem = items.find((i) => i.ticker === etf.ticker);
  const quantity = portfolioItem?.quantity ?? 0;

  const totalInvestment = etf.currentPrice * quantity;
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
                포트폴리오에 이 종목을 담고 수량을 입력하면
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

// ─── 장기 비용/수익 통합 분석기 ──────────────────────────

const YEARS_RANGE = Array.from({ length: 20 }, (_, i) => i + 1);
const MILESTONES = [1, 3, 5, 10, 20] as const;
const DIVIDEND_TAX_RATE = 0.154; // 배당소득세 15.4%

interface SimPoint {
  year: number;
  simple: number;
  reinvest: number;
  realNet: number;
}

function IntegratedAnalyzer({ etf }: { etf: EtfAssetDetail }) {
  const { items } = usePortfolio();
  const portfolioItem = items.find((i) => i.ticker === etf.ticker);
  const quantity = portfolioItem?.quantity ?? 0;

  const hasDividend = etf.dividendYield > 0;
  if (!hasDividend) return null;

  const totalInvestment = etf.currentPrice * quantity;
  const divRate = etf.dividendYield / 100;
  const expRate = etf.expenseRatio / 100;

  const compoundsPerYear =
    etf.dividendCycle === "월배당" ? 12 : etf.dividendCycle === "분기배당" ? 4 : 1;
  const periodicDivRate = divRate / compoundsPerYear;
  const periodicExpRate = expRate / compoundsPerYear;

  const cycleLabel =
    etf.dividendCycle === "월배당" ? "매달" : etf.dividendCycle === "분기배당" ? "매 분기" : "매년";

  // 차트 데이터: 1~20년
  const chartData: SimPoint[] = useMemo(() => {
    const useAmount = quantity > 0;
    const base = useAmount ? totalInvestment : 100; // 수량 없으면 100 기준 (%)

    return YEARS_RANGE.map((year) => {
      const periods = compoundsPerYear * year;

      // 단순 투자 (배당 수령만, 재투자 X, 보수 차감 X)
      const simple = base * (1 + divRate * year);

      // 배당 재투자 (복리, 보수 차감 X)
      const reinvest = base * Math.pow(1 + periodicDivRate, periods);

      // 배당 재투자 + 보수 차감 (실질 순가치)
      const netPeriodicRate = periodicDivRate - periodicExpRate;
      const realNet = base * Math.pow(1 + netPeriodicRate, periods);

      return {
        year,
        simple: Math.round(simple),
        reinvest: Math.round(reinvest),
        realNet: Math.round(realNet),
      };
    });
  }, [totalInvestment, quantity, divRate, periodicDivRate, periodicExpRate, compoundsPerYear]);

  // 마일스톤 테이블 데이터
  const milestoneData = useMemo(() => {
    return MILESTONES.map((year) => {
      const point = chartData[year - 1];
      return {
        ...point,
        expenseCost: point.reinvest - point.realNet,
        reinvestGain: point.reinvest - point.simple,
      };
    });
  }, [chartData]);

  // 인사이트 계산 (10년 기준)
  const tenYear = milestoneData.find((m) => m.year === 10)!;
  const expenseCost10y = tenYear.reinvest - tenYear.realNet;
  const reinvestGain10y = tenYear.reinvest - tenYear.simple;
  const expenseOffsetPct = expenseCost10y > 0
    ? ((reinvestGain10y / expenseCost10y) * 100)
    : 0;

  // ISA 절세 효과
  const base = quantity > 0 ? totalInvestment : 0;
  const annualDividend10y = base > 0 ? base * divRate * 10 : 0;
  const taxSaved = annualDividend10y * DIVIDEND_TAX_RATE;
  const isaBoostPct = base > 0 ? (taxSaved / base) * 100 : divRate * 10 * DIVIDEND_TAX_RATE * 100;

  const hasQuantity = quantity > 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <RefreshCw className="h-5 w-5 text-emerald-400" />
        <h2 className="text-sm font-semibold text-foreground">
          장기 비용/수익 통합 분석
        </h2>
        <Badge variant="secondary" className="text-[10px] font-normal">
          복리 시뮬레이션
        </Badge>
      </div>

      {/* 비교 차트 */}
      <div className="mb-5">
        <h3 className="mb-3 text-xs font-medium text-muted-foreground">
          20년 자산 가치 비교 {!hasQuantity && "(100 기준)"}
        </h3>
        <div className="h-[240px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                axisLine={{ stroke: "hsl(217 33% 17%)" }}
                tickLine={false}
                tickFormatter={(v: number) => `${v}년`}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  hasQuantity
                    ? v >= 10000 ? `${Math.round(v / 10000)}만` : v.toLocaleString("ko-KR")
                    : `${v}`
                }
                width={52}
              />
              <RechartsTooltip content={<AnalyzerTooltip hasQuantity={hasQuantity} />} />
              <Legend
                verticalAlign="top"
                height={30}
                formatter={(value: string) => (
                  <span style={{ fontSize: 11, color: "hsl(215 20% 65%)" }}>{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="simple"
                name="단순 투자"
                stroke="hsl(215 20% 55%)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="reinvest"
                name="배당 재투자"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="realNet"
                name="재투자 + 보수 차감"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 마일스톤 테이블 */}
      <div className="mb-5 overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left font-medium text-muted-foreground">기간</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">단순 투자</th>
              <th className="pb-2 text-right font-medium text-emerald-400/70">배당 재투자</th>
              <th className="pb-2 text-right font-medium text-amber-400/70">실질 순가치</th>
              <th className="pb-2 text-right font-medium text-red-400/70">보수 누적</th>
            </tr>
          </thead>
          <tbody>
            {milestoneData.map((row) => (
              <tr key={row.year} className="border-b border-border/50 last:border-b-0">
                <td className="py-2.5 font-medium text-foreground">{row.year}년</td>
                <td className="py-2.5 text-right font-mono text-muted-foreground">
                  {hasQuantity ? formatKRW(row.simple) : row.simple}
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">
                  {hasQuantity ? formatKRW(row.reinvest) : row.reinvest}
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-amber-400">
                  {hasQuantity ? formatKRW(row.realNet) : row.realNet}
                </td>
                <td className="py-2.5 text-right font-mono text-red-400">
                  -{hasQuantity ? formatKRW(row.expenseCost) : row.expenseCost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 인사이트 메시지 */}
      <div className="space-y-2.5">
        {/* 보수 기회비용 */}
        <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-3">
          <p className="text-sm leading-relaxed text-foreground">
            <span className="font-semibold text-amber-400">10년</span> 투자 시, 총보수(
            {formatExpenseRatio(etf.expenseRatio)})로 인해 약{" "}
            <span className="font-bold text-red-400">
              {hasQuantity ? formatKRW(expenseCost10y) : `${((tenYear.reinvest - tenYear.realNet) / tenYear.reinvest * 100).toFixed(1)}%`}
            </span>
            의 기회비용이 발생합니다.
          </p>
        </div>

        {/* 재투자 상쇄 효과 */}
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-3">
          <p className="text-sm leading-relaxed text-foreground">
            {cycleLabel} 배당 재투자가 보수 비용을{" "}
            <span className="font-bold text-emerald-400">
              {expenseOffsetPct.toFixed(0)}%
            </span>{" "}
            상쇄합니다.
            {hasQuantity && (
              <>
                {" "}재투자 복리 효과:{" "}
                <span className="font-semibold text-emerald-400">
                  +{formatKRW(reinvestGain10y)}
                </span>
              </>
            )}
          </p>
        </div>

        {/* ISA 절세 팁 */}
        <div className="rounded-lg border border-blue-400/20 bg-blue-400/5 p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold text-blue-400">ISA 계좌</span> 이용 시
              배당소득세 15.4%를 절약하여 10년간 수익률을{" "}
              <span className="font-bold text-blue-400">
                {isaBoostPct.toFixed(1)}%
              </span>{" "}
              더 높일 수 있습니다.
              {hasQuantity && (
                <>
                  {" "}(절세 효과: 약{" "}
                  <span className="font-semibold text-blue-400">
                    {formatKRW(Math.round(taxSaved))}
                  </span>
                  )
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        * 배당수익률 {etf.dividendYield.toFixed(2)}%, 총보수 {formatExpenseRatio(etf.expenseRatio)} 고정 가정.
        주가 변동 미반영, 세전 기준의 단순 시뮬레이션입니다. ISA 비과세 한도(200~400만 원/연)는 별도 확인이 필요합니다.
      </p>
    </div>
  );
}

function AnalyzerTooltip({
  active,
  payload,
  label,
  hasQuantity,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
  hasQuantity: boolean;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card/95 px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
      <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{label}년 후</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="text-[11px]" style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {hasQuantity ? formatKRW(entry.value) : entry.value}
          </span>
        </div>
      ))}
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

// ─── 주식 주요 재무 지표 섹션 ─────────────────────────────

function StockFinancialSection({ stock }: { stock: StockAssetDetail }) {
  const operatingMargin = stock.revenue > 0 ? (stock.operatingProfit / stock.revenue) * 100 : 0;
  const netMargin = stock.revenue > 0 ? (stock.netIncome / stock.revenue) * 100 : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── 기업 개요 ────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
            <Building2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">기업 개요</h2>
            <span className="text-[11px] text-muted-foreground">{stock.sector} 섹터</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {stock.description}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span>상장일 {stock.listingDate}</span>
          <span>·</span>
          <span>임직원 {stock.employees.toLocaleString("ko-KR")}명</span>
        </div>
      </div>

      {/* ── 핵심 지표 2x2 그리드 ─────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* PER */}
        <div className="group relative overflow-hidden rounded-xl border border-violet-500/20 bg-card p-4 sm:p-5">
          <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-violet-500/5" />
          <div className="relative">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15">
              <BarChart3 className="h-4.5 w-4.5 text-violet-400" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">PER</p>
            <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              {stock.per.toFixed(1)}
              <span className="ml-0.5 text-sm font-medium text-muted-foreground">배</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {stock.per < 10 ? "저평가 구간" : stock.per < 20 ? "적정 수준" : "성장주 프리미엄"}
            </p>
          </div>
        </div>

        {/* PBR */}
        <div className="group relative overflow-hidden rounded-xl border border-blue-500/20 bg-card p-4 sm:p-5">
          <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-blue-500/5" />
          <div className="relative">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15">
              <TrendingUp className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">PBR</p>
            <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              {stock.pbr.toFixed(2)}
              <span className="ml-0.5 text-sm font-medium text-muted-foreground">배</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {stock.pbr < 1 ? "순자산 이하 거래" : stock.pbr < 2 ? "적정 수준" : "프리미엄 거래"}
            </p>
          </div>
        </div>

        {/* 배당수익률 */}
        <div className="group relative overflow-hidden rounded-xl border border-amber-500/20 bg-card p-4 sm:p-5">
          <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-amber-500/5" />
          <div className="relative">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
              <Coins className="h-4.5 w-4.5 text-amber-400" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">배당수익률</p>
            <p className={cn(
              "mt-1 text-xl font-bold sm:text-2xl",
              stock.dividendYield > 0 ? "text-amber-400" : "text-muted-foreground"
            )}>
              {stock.dividendYield > 0 ? (
                <>
                  {stock.dividendYield.toFixed(2)}
                  <span className="ml-0.5 text-sm font-medium">%</span>
                </>
              ) : "-"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {stock.dividendYield >= 3 ? "고배당주" : stock.dividendYield >= 1 ? "배당 지급" : "배당 미미"}
            </p>
          </div>
        </div>

        {/* 시가총액 */}
        <div className="group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-card p-4 sm:p-5">
          <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-emerald-500/5" />
          <div className="relative">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
              <DollarSign className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">시가총액</p>
            <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              {formatMarketCap(stock.marketCap)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {stock.marketCap >= 100_0000_0000_0000 ? "초대형주" : stock.marketCap >= 10_0000_0000_0000 ? "대형주" : "중형주"}
            </p>
          </div>
        </div>
      </div>

      {/* ── 손익 현황 ────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">손익 현황</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-secondary/30 p-3.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="text-xs">매출액</span>
            </div>
            <p className="mt-2 font-mono text-base font-bold text-foreground sm:text-lg">
              {formatMarketCap(stock.revenue)}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3.5">
            <div className="flex items-center gap-1.5 text-emerald-400/80">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs">영업이익</span>
            </div>
            <p className="mt-2 font-mono text-base font-bold text-emerald-400 sm:text-lg">
              {formatMarketCap(stock.operatingProfit)}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-400/70">
              마진 {operatingMargin.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border border-blue-500/15 bg-blue-500/5 p-3.5">
            <div className="flex items-center gap-1.5 text-blue-400/80">
              <Percent className="h-3.5 w-3.5" />
              <span className="text-xs">순이익</span>
            </div>
            <p className="mt-2 font-mono text-base font-bold text-blue-400 sm:text-lg">
              {formatMarketCap(stock.netIncome)}
            </p>
            <p className="mt-0.5 text-[11px] text-blue-400/70">
              마진 {netMargin.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* 수익성 인사이트 */}
        {stock.revenue > 0 && (
          <div className="mt-3 rounded-lg border border-violet-400/20 bg-violet-400/5 p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
              <p className="text-sm leading-relaxed text-foreground">
                영업이익률{" "}
                <span className="font-bold text-emerald-400">
                  {operatingMargin.toFixed(1)}%
                </span>
                , 순이익률{" "}
                <span className="font-bold text-blue-400">
                  {netMargin.toFixed(1)}%
                </span>
                {operatingMargin >= 15
                  ? " — 우수한 수익 구조를 보유하고 있습니다."
                  : operatingMargin >= 5
                    ? " — 안정적인 수익 구조입니다."
                    : " — 수익성 개선 여지가 있습니다."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── 배당 시뮬레이션 (배당이 있는 주식만) ──────── */}
      {stock.dividendYield > 0 && (
        <StockDividendSimulator stock={stock} />
      )}
    </div>
  );
}

// ─── 주식 세후 배당 재투자 시뮬레이터 ────────────────────

const STOCK_YEARS_RANGE = Array.from({ length: 20 }, (_, i) => i + 1);
const STOCK_MILESTONES = [1, 3, 5, 10, 20] as const;
const STOCK_DIVIDEND_TAX = 0.154; // 배당소득세 15.4%

interface StockSimPoint {
  year: number;
  simple: number;
  reinvestPre: number;
  reinvestPost: number;
}

function StockDividendSimulator({ stock }: { stock: StockAssetDetail }) {
  const { items } = usePortfolio();
  const portfolioItem = items.find((i) => i.ticker === stock.ticker);
  const quantity = portfolioItem?.quantity ?? 0;

  const totalInvestment = stock.currentPrice * quantity;
  const divRate = stock.dividendYield / 100;
  const hasQuantity = quantity > 0;

  const chartData: StockSimPoint[] = useMemo(() => {
    const base = hasQuantity ? totalInvestment : 100;

    return STOCK_YEARS_RANGE.map((year) => {
      // 단순 투자 (배당 수령, 재투자 X)
      const simple = base * (1 + divRate * year);

      // 배당 재투자 (세전, 연복리)
      const reinvestPre = base * Math.pow(1 + divRate, year);

      // 배당 재투자 (세후 15.4% 차감)
      const afterTaxDivRate = divRate * (1 - STOCK_DIVIDEND_TAX);
      const reinvestPost = base * Math.pow(1 + afterTaxDivRate, year);

      return {
        year,
        simple: Math.round(simple),
        reinvestPre: Math.round(reinvestPre),
        reinvestPost: Math.round(reinvestPost),
      };
    });
  }, [totalInvestment, hasQuantity, divRate]);

  const milestoneData = useMemo(() => {
    return STOCK_MILESTONES.map((year) => {
      const point = chartData[year - 1];
      const base = hasQuantity ? totalInvestment : 100;
      return {
        ...point,
        taxCost: point.reinvestPre - point.reinvestPost,
        reinvestGain: point.reinvestPost - point.simple,
        yieldPct: ((point.reinvestPost - base) / base * 100),
      };
    });
  }, [chartData, hasQuantity, totalInvestment]);

  // 10년 기준 인사이트
  const tenYear = milestoneData.find((m) => m.year === 10)!;
  const base = hasQuantity ? totalInvestment : 100;
  const totalReturn10y = ((tenYear.reinvestPost - base) / base * 100);
  const taxLoss10y = tenYear.reinvestPre - tenYear.reinvestPost;

  // 연간 세후 배당금
  const annualDivAfterTax = hasQuantity
    ? totalInvestment * divRate * (1 - STOCK_DIVIDEND_TAX)
    : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
          <RefreshCw className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            세후 배당 재투자 시뮬레이션
          </h2>
          <span className="text-[11px] text-muted-foreground">
            배당소득세 15.4% 적용
          </span>
        </div>
      </div>

      {/* 배당 요약 카드 */}
      {hasQuantity && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-amber-500/15 bg-amber-500/5 p-3">
            <p className="text-[11px] text-muted-foreground">연간 배당 (세전)</p>
            <p className="mt-1 font-mono text-sm font-bold text-foreground">
              {formatKRW(Math.round(totalInvestment * divRate))}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3">
            <p className="text-[11px] text-muted-foreground">연간 배당 (세후)</p>
            <p className="mt-1 font-mono text-sm font-bold text-emerald-400">
              {formatKRW(Math.round(annualDivAfterTax))}
            </p>
          </div>
          <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-3 col-span-2 sm:col-span-1">
            <p className="text-[11px] text-muted-foreground">연간 배당소득세</p>
            <p className="mt-1 font-mono text-sm font-bold text-red-400">
              -{formatKRW(Math.round(totalInvestment * divRate * STOCK_DIVIDEND_TAX))}
            </p>
          </div>
        </div>
      )}

      {/* 비교 차트 */}
      <div className="mb-5">
        <h3 className="mb-3 text-xs font-medium text-muted-foreground">
          20년 자산 가치 비교 {!hasQuantity && "(100 기준)"}
        </h3>
        <div className="h-[240px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                axisLine={{ stroke: "hsl(217 33% 17%)" }}
                tickLine={false}
                tickFormatter={(v: number) => `${v}년`}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  hasQuantity
                    ? v >= 10000 ? `${Math.round(v / 10000)}만` : v.toLocaleString("ko-KR")
                    : `${v}`
                }
                width={52}
              />
              <RechartsTooltip content={<StockSimTooltip hasQuantity={hasQuantity} />} />
              <Legend
                verticalAlign="top"
                height={30}
                formatter={(value: string) => (
                  <span style={{ fontSize: 11, color: "hsl(215 20% 65%)" }}>{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="simple"
                name="단순 투자"
                stroke="hsl(215 20% 55%)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="reinvestPre"
                name="재투자 (세전)"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="reinvestPost"
                name="재투자 (세후)"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 마일스톤 테이블 */}
      <div className="mb-5 overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left font-medium text-muted-foreground">기간</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">단순 투자</th>
              <th className="pb-2 text-right font-medium text-emerald-400/70">세전 재투자</th>
              <th className="pb-2 text-right font-medium text-amber-400/70">세후 재투자</th>
              <th className="pb-2 text-right font-medium text-red-400/70">세금 누적</th>
            </tr>
          </thead>
          <tbody>
            {milestoneData.map((row) => (
              <tr key={row.year} className="border-b border-border/50 last:border-b-0">
                <td className="py-2.5 font-medium text-foreground">{row.year}년</td>
                <td className="py-2.5 text-right font-mono text-muted-foreground">
                  {hasQuantity ? formatKRW(row.simple) : row.simple}
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">
                  {hasQuantity ? formatKRW(row.reinvestPre) : row.reinvestPre}
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-amber-400">
                  {hasQuantity ? formatKRW(row.reinvestPost) : row.reinvestPost}
                </td>
                <td className="py-2.5 text-right font-mono text-red-400">
                  -{hasQuantity ? formatKRW(row.taxCost) : row.taxCost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 인사이트 */}
      <div className="space-y-2.5">
        {/* 세후 수익률 */}
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3">
          <div className="flex items-start gap-2">
            <Coins className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold text-amber-400">10년</span> 세후 배당 재투자 시
              총 수익률{" "}
              <span className="font-bold text-amber-400">
                +{totalReturn10y.toFixed(1)}%
              </span>
              , 배당소득세로 인해{" "}
              <span className="font-bold text-red-400">
                {hasQuantity ? formatKRW(taxLoss10y) : `${((taxLoss10y / base) * 100).toFixed(1)}%`}
              </span>
              의 차이가 발생합니다.
            </p>
          </div>
        </div>

        {/* ISA 절세 팁 */}
        <div className="rounded-lg border border-blue-400/20 bg-blue-400/5 p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold text-blue-400">ISA 계좌</span>를 활용하면
              배당소득세 15.4%를 절약할 수 있습니다.
              {hasQuantity && (
                <>
                  {" "}10년간 절세 효과: 약{" "}
                  <span className="font-semibold text-blue-400">
                    {formatKRW(taxLoss10y)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        * 배당수익률 {stock.dividendYield.toFixed(2)}% 고정 가정. 주가 변동 미반영, 연 1회 복리 기준 단순 시뮬레이션입니다.
        ISA 비과세 한도(200~400만 원/연)는 별도 확인이 필요합니다.
      </p>
    </div>
  );
}

function StockSimTooltip({
  active,
  payload,
  label,
  hasQuantity,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
  hasQuantity: boolean;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card/95 px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
      <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{label}년 후</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="text-[11px]" style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {hasQuantity ? formatKRW(entry.value) : entry.value}
          </span>
        </div>
      ))}
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
