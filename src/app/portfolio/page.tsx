"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trash2,
  PieChart as PieChartIcon,
  TrendingUp,
  Wallet,
  Briefcase,
  Minus,
  Plus,
  Coins,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { useShell } from "@/components/layout/shell";
import { usePortfolio } from "@/context/portfolio-context";
import { mockAssets } from "@/lib/mock-data";
import {
  formatKRW,
  formatChangeRate,
  formatExpenseRatio,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Asset } from "@/types/asset";

/* ── 자산 필터 탭 ───────────────────────────────────── */
type AssetFilter = "ALL" | "ETF" | "STOCK";
const filterTabs: { key: AssetFilter; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "ETF", label: "ETF만" },
  { key: "STOCK", label: "주식만" },
];

/* ── 월 라벨 ────────────────────────────────────────── */
const MONTH_LABELS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

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

  const [assetFilter, setAssetFilter] = useState<AssetFilter>("ALL");

  /* ── 보유 자산 룩업 ─────────────────────────────────── */
  const portfolioAssets = useMemo(() => {
    return items
      .map((item) => {
        const asset = mockAssets.find((a) => a.ticker === item.ticker);
        return asset ? { item, asset } : null;
      })
      .filter(Boolean) as { item: typeof items[number]; asset: Asset }[];
  }, [items]);

  /* ── 자산유형별 비중 데이터 (ETF vs 주식 파이) ──────── */
  const typeComposition = useMemo(() => {
    if (totalAmount <= 0) return [];
    let etfAmount = 0;
    let stockAmount = 0;
    for (const { item, asset } of portfolioAssets) {
      const amount = asset.currentPrice * item.quantity;
      if (asset.type === "ETF") etfAmount += amount;
      else stockAmount += amount;
    }
    const result = [];
    if (etfAmount > 0) result.push({ name: "ETF", value: etfAmount, pct: (etfAmount / totalAmount) * 100, color: "#60a5fa" });
    if (stockAmount > 0) result.push({ name: "주식", value: stockAmount, pct: (stockAmount / totalAmount) * 100, color: "#34d399" });
    return result;
  }, [portfolioAssets, totalAmount]);

  /* ── 월별 현금흐름 데이터 ───────────────────────────── */
  const monthlyCashFlow = useMemo(() => {
    const etfByMonth = new Array(12).fill(0);
    const stockByMonth = new Array(12).fill(0);

    for (const { item, asset } of portfolioAssets) {
      if (item.quantity <= 0 || asset.dividendYield <= 0) continue;
      const investedAmount = asset.currentPrice * item.quantity;
      const annualDiv = investedAmount * (asset.dividendYield / 100);

      if (asset.type === "ETF") {
        if (asset.dividendCycle === "월배당") {
          const monthly = annualDiv / 12;
          for (let i = 0; i < 12; i++) etfByMonth[i] += monthly;
        } else if (asset.dividendCycle === "분기배당") {
          const quarterly = annualDiv / 4;
          for (const m of [2, 5, 8, 11]) etfByMonth[m] += quarterly;
        } else if (asset.dividendCycle === "연배당") {
          etfByMonth[11] += annualDiv;
        }
      } else {
        // 주식: 보통 연 1~4회 → 분기 가정
        const quarterly = annualDiv / 4;
        for (const m of [2, 5, 8, 11]) stockByMonth[m] += quarterly;
      }
    }

    return MONTH_LABELS.map((label, i) => ({
      month: label,
      etf: Math.round(etfByMonth[i]),
      stock: Math.round(stockByMonth[i]),
      total: Math.round(etfByMonth[i] + stockByMonth[i]),
    }));
  }, [portfolioAssets]);

  const totalAnnualDiv = monthlyCashFlow.reduce((s, m) => s + m.total, 0);

  /* ── 필터링된 포트폴리오 아이템 ─────────────────────── */
  const filteredPortfolio = useMemo(() => {
    if (assetFilter === "ALL") return portfolioAssets;
    return portfolioAssets.filter((p) => p.asset.type === assetFilter);
  }, [portfolioAssets, assetFilter]);

  const etfCount = portfolioAssets.filter((p) => p.asset.type === "ETF").length;
  const stockCount = portfolioAssets.filter((p) => p.asset.type === "STOCK").length;

  return (
    <>
      <Header
        title="내 포트폴리오"
        description="보유 종목 현황과 수익률을 확인하세요"
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
              sub={etfCount > 0 && stockCount > 0
                ? `ETF ${etfCount}개 · 주식 ${stockCount}개`
                : `총 투자금액 ${formatKRW(totalAmount)}`}
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
              icon={<Coins className="h-4 w-4" />}
              label="연간 예상 배당"
              value={totalAnnualDiv > 0 ? formatKRW(totalAnnualDiv) : "-"}
              sub={estimatedReturn.weightedExpense > 0
                ? `가중 총보수 ${formatExpenseRatio(estimatedReturn.weightedExpense)}`
                : "수량 입력 시 계산"}
            />
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="rounded-lg border border-border bg-card">
            <div className="flex flex-col items-center justify-center gap-3 p-12">
              <div className="rounded-full bg-secondary p-3">
                <PieChartIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                아직 담은 종목이 없습니다
              </p>
              <Link href="/explore">
                <Button variant="secondary" size="sm">
                  종목 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── 자산 구성 + 비중 배분 (2-column) ──── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Left: 자산 유형 파이 차트 (ETF vs 주식) */}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15">
                    <PieChartIcon className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    자산 구성
                  </span>
                </div>

                {totalAmount > 0 && typeComposition.length > 0 ? (
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                    <div className="h-[180px] w-[180px] shrink-0 sm:h-[200px] sm:w-[200px]">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                          <Pie
                            data={typeComposition}
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="90%"
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {typeComposition.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<TypePieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-row gap-4 sm:flex-col sm:gap-3">
                      {typeComposition.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {entry.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.pct.toFixed(1)}% · {formatKRW(Math.round(entry.value))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                    수량을 입력하면 자산 구성이 표시됩니다
                  </div>
                )}
              </div>

              {/* Right: 종목별 비중 배분 (도넛) */}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15">
                      <PieChartIcon className="h-3.5 w-3.5 text-violet-400" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      종목별 비중
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    수량 기반
                  </span>
                </div>

                {totalAmount > 0 ? (
                  <>
                    <div className="mx-auto h-[180px] w-full max-w-[240px] sm:h-[200px] sm:max-w-[260px]">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                          <Pie
                            data={portfolioAssets
                              .map((p, idx) => ({
                                name: p.asset.name.slice(0, 10),
                                value: getWeight(p.item.ticker),
                                ticker: p.item.ticker,
                                color: getColorByIndex(idx),
                              }))
                              .filter((d) => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius="55%"
                            outerRadius="85%"
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {portfolioAssets.map((_, idx) => (
                              <Cell key={idx} fill={getColorByIndex(idx)} />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                      {portfolioAssets.map((p, idx) => {
                        const weight = getWeight(p.item.ticker);
                        if (weight <= 0) return null;
                        return (
                          <div key={p.item.ticker} className="flex items-center gap-1.5">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: getColorByIndex(idx) }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {p.asset.name.slice(0, 10)} {weight.toFixed(1)}%
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
            </div>

            {/* ── 월별 현금흐름 (막대 그래프) ─────────── */}
            {totalAnnualDiv > 0 && (
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15">
                    <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    월별 예상 현금흐름
                  </span>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">
                  연간 합계 {formatKRW(totalAnnualDiv)} (세전)
                </p>

                <div className="h-[220px] w-full sm:h-[260px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={monthlyCashFlow} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                        axisLine={{ stroke: "hsl(217 33% 17%)" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) =>
                          v >= 10000 ? `${Math.round(v / 10000)}만` : v.toLocaleString("ko-KR")
                        }
                        width={48}
                      />
                      <RechartsTooltip content={<CashFlowTooltip />} />
                      <Bar dataKey="etf" name="ETF 분배금" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="stock" name="주식 배당금" stackId="a" fill="#34d399" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 flex justify-center gap-5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-sm bg-[#60a5fa]" />
                    <span className="text-xs text-muted-foreground">ETF 분배금</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-sm bg-[#34d399]" />
                    <span className="text-xs text-muted-foreground">주식 배당금</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── 포트폴리오 구성 (필터 탭 포함) ──────── */}
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">
                    포트폴리오 구성
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {filteredPortfolio.length}개 종목
                  </span>
                </div>

                {/* 필터 탭 */}
                {etfCount > 0 && stockCount > 0 && (
                  <div className="mt-3 flex gap-1 rounded-lg border border-border bg-secondary/30 p-1">
                    {filterTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setAssetFilter(tab.key)}
                        className={cn(
                          "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                          assetFilter === tab.key
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ul>
                {filteredPortfolio.map(({ item, asset }, idx) => {
                  const isPositive = asset.changeRate >= 0;
                  const amount = getAmount(item.ticker);
                  const weight = getWeight(item.ticker);

                  return (
                    <li
                      key={item.ticker}
                      className="border-b border-border p-4 last:border-b-0"
                    >
                      {/* Top row: 종목 info + remove */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: getColorByIndex(portfolioAssets.indexOf(filteredPortfolio[idx])) }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/etf/${asset.ticker}`}
                                tabIndex={-1}
                                className="truncate text-sm font-medium text-foreground hover:underline"
                              >
                                {asset.name}
                              </Link>
                              <span className={cn(
                                "shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold",
                                asset.type === "ETF"
                                  ? "bg-blue-500/15 text-blue-400"
                                  : "bg-emerald-500/15 text-emerald-400"
                              )}>
                                {asset.type === "ETF" ? "ETF" : "주식"}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">
                                {asset.ticker}
                              </span>
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  isPositive ? "text-emerald-400" : "text-red-400"
                                )}
                              >
                                {isPositive ? "+" : ""}{asset.changeRate.toFixed(2)}%
                              </span>
                              {asset.dividendYield > 0 && (
                                <span className="text-[10px] font-medium text-amber-400">
                                  배당 {asset.dividendYield.toFixed(2)}%
                                </span>
                              )}
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
          </>
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

/* ── Tooltip: 자산유형 파이 ─────────────────────────── */
function TypePieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { pct: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const { pct } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="mb-0.5 text-xs font-medium text-muted-foreground">{name}</p>
      <p className="text-sm font-bold text-foreground">{pct.toFixed(1)}%</p>
      <p className="text-xs text-muted-foreground">{formatKRW(Math.round(value))}</p>
    </div>
  );
}

/* ── Tooltip: 종목별 비중 파이 ──────────────────────── */
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

/* ── Tooltip: 월별 현금흐름 ─────────────────────────── */
function CashFlowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="rounded-lg border border-border bg-card/95 px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
      <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{label}</p>
      {payload.filter(p => p.value > 0).map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="text-[11px]" style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {formatKRW(entry.value)}
          </span>
        </div>
      ))}
      {payload.length > 1 && total > 0 && (
        <div className="mt-1 border-t border-border/50 pt-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-muted-foreground">합계</span>
            <span className="font-mono text-xs font-bold text-foreground">
              {formatKRW(total)}
            </span>
          </div>
        </div>
      )}
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
