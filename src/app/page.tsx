"use client";

import { useState, useMemo } from "react";
import { Search, CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Header } from "@/components/layout/header";
import { EtfRankingTable } from "@/components/etf-ranking-table";
import { FilterChips } from "@/components/filter-chips";
import { useShell } from "@/components/layout/shell";
import { useIssuers, useAssets } from "@/lib/queries/use-assets";
import { usePortfolio } from "@/context/portfolio-context";
import { useAssetMap } from "@/lib/queries/use-asset-lookup";
import type { Asset } from "@/types/asset";

const dividendCycles = ["월배당", "분기배당", "연배당"];

const DONUT_COLORS = ["#6366f1", "#10b981"];

function getNextDividendDate(cycle: string): Date | null {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth(); // 0-indexed

  if (cycle === "월배당") {
    return new Date(y, m + 1, 1);
  }
  if (cycle === "분기배당") {
    const quarterMonths = [2, 5, 8, 11]; // Mar, Jun, Sep, Dec
    for (const qm of quarterMonths) {
      const candidate = new Date(y, qm, 1);
      if (candidate > today) return candidate;
    }
    return new Date(y + 1, 2, 1);
  }
  if (cycle === "연배당") {
    const dec = new Date(y, 11, 1);
    return dec > today ? dec : new Date(y + 1, 11, 1);
  }
  return null;
}

function formatKRW(value: number): string {
  if (value >= 1_0000_0000) return `${(value / 1_0000_0000).toFixed(1)}억`;
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
  return value.toLocaleString("ko-KR");
}

export default function Home() {
  const { openSidebar } = useShell();
  const issuers = useIssuers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedDividend, setSelectedDividend] = useState<string | null>(null);

  const { items, totalAmount, getAmount } = usePortfolio();
  const { assetMap } = useAssetMap();
  const { data: allAssets = [] } = useAssets("ALL");
  const tableAssets = allAssets;

  // 오늘 평가손익 (changeRate 기반)
  const todayPnL = useMemo(() => {
    return items.reduce((sum, item) => {
      const asset = assetMap.get(item.ticker);
      if (!asset) return sum;
      return sum + (getAmount(item.ticker) * asset.changeRate) / 100;
    }, 0);
  }, [items, assetMap, getAmount]);

  // ETF vs 주식 비중 (포트폴리오 있으면 평가금액 기준, 없으면 시총 기준)
  const donutData = useMemo(() => {
    if (totalAmount > 0) {
      let etfAmt = 0;
      let stockAmt = 0;
      for (const item of items) {
        const asset = assetMap.get(item.ticker);
        if (!asset) continue;
        const amt = getAmount(item.ticker);
        if (asset.type === "ETF") etfAmt += amt;
        else stockAmt += amt;
      }
      return [
        { name: "ETF", value: etfAmt },
        { name: "주식", value: stockAmt },
      ];
    }
    // 포트폴리오 없으면 시총 기준 분포 표시
    const etfCap = allAssets
      .filter((a) => a.type === "ETF")
      .reduce((s, a) => s + a.marketCap, 0);
    const stockCap = allAssets
      .filter((a) => a.type === "STOCK")
      .reduce((s, a) => s + a.marketCap, 0);
    return [
      { name: "ETF", value: etfCap },
      { name: "주식", value: stockCap },
    ];
  }, [items, assetMap, getAmount, totalAmount, allAssets]);

  // D-Day: 가장 가까운 배당일 종목
  const nextDividend = useMemo(() => {
    const today = new Date();
    let closest: { asset: Asset; days: number } | null = null;
    for (const asset of allAssets) {
      if (asset.dividendYield === 0) continue;
      const cycle =
        asset.type === "ETF"
          ? asset.dividendCycle
          : asset.dividendYield > 0
          ? "연배당"
          : "미지급";
      if (cycle === "미지급") continue;
      const nextDate = getNextDividendDate(cycle);
      if (!nextDate) continue;
      const days = Math.ceil(
        (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (!closest || days < closest.days) {
        closest = { asset, days };
      }
    }
    return closest;
  }, [allAssets]);

  const filteredAssets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tableAssets.filter((asset) => {
      const matchesSearch =
        query === "" ||
        asset.ticker.toLowerCase().includes(query) ||
        asset.name.toLowerCase().includes(query);
      // 운용사·배당주기 필터는 ETF 전용 — 주식은 검색만 적용
      if (asset.type === "STOCK") return matchesSearch;
      const matchesProvider =
        selectedProvider === null || asset.issuer === selectedProvider;
      const matchesDividend =
        selectedDividend === null || asset.dividendCycle === selectedDividend;
      return matchesSearch && matchesProvider && matchesDividend;
    });
  }, [tableAssets, searchQuery, selectedProvider, selectedDividend]);

  return (
    <>
      <Header
        title="대시보드"
        description="시장 현황을 한눈에 확인하세요"
        onMenuClick={openSidebar}
      />
      <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          <TotalAssetCard
            totalAmount={totalAmount}
            todayPnL={todayPnL}
            hasPortfolio={items.length > 0}
          />
          <DonutCard data={donutData} hasPortfolio={totalAmount > 0} />
          <DDayCard nextDividend={nextDividend} />
        </div>

        {/* ETF Ranking Table */}
        <div className="rounded-lg border border-border bg-card">
          <div className="sticky top-0 z-10 rounded-t-lg border-b border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-foreground">
                종목 수익률 순위
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="티커 또는 종목명 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
            <div className="mb-3 flex flex-col gap-2.5">
              <div className="-mx-4 flex items-center gap-2.5 overflow-x-auto px-4 sm:-mx-0 sm:px-0">
                <span className="w-10 shrink-0 text-[11px] font-medium text-muted-foreground">운용사</span>
                <FilterChips
                  options={issuers}
                  selected={selectedProvider}
                  onSelect={setSelectedProvider}
                />
              </div>
              <div className="-mx-4 flex items-center gap-2.5 overflow-x-auto px-4 sm:-mx-0 sm:px-0">
                <span className="w-10 shrink-0 text-[11px] font-medium text-muted-foreground">배당</span>
                <FilterChips
                  options={dividendCycles}
                  selected={selectedDividend}
                  onSelect={setSelectedDividend}
                  variant="outline"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              총 {filteredAssets.length}개 종목
            </p>
          </div>
          <div className="p-4 pt-0 sm:p-5 sm:pt-0">
            <div className="hidden md:block -mx-4 overflow-x-auto sm:-mx-5">
              <div className="min-w-[850px] px-4 sm:px-5 pt-3">
                <EtfRankingTable data={filteredAssets} searchQuery={searchQuery} />
              </div>
            </div>
            <div className="pt-3 md:hidden">
              <EtfRankingTable data={filteredAssets} searchQuery={searchQuery} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Summary Card Components ──────────────────────────────────────────

function TotalAssetCard({
  totalAmount,
  todayPnL,
  hasPortfolio,
}: {
  totalAmount: number;
  todayPnL: number;
  hasPortfolio: boolean;
}) {
  const positive = todayPnL >= 0;
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <p className="text-xs text-muted-foreground sm:text-sm">총 자산</p>
      {hasPortfolio ? (
        <>
          <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
            {formatKRW(totalAmount)}원
          </p>
          <div className="mt-1 flex items-center gap-1">
            {positive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
            )}
            <p
              className={`text-xs font-medium sm:text-sm ${
                positive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              오늘 {positive ? "+" : ""}
              {formatKRW(Math.abs(todayPnL))}원
            </p>
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 text-xl font-bold text-muted-foreground sm:text-2xl">
            --
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            포트폴리오를 추가해주세요
          </p>
        </>
      )}
    </div>
  );
}

function DonutCard({
  data,
  hasPortfolio,
}: {
  data: { name: string; value: number }[];
  hasPortfolio: boolean;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const etfPct = total > 0 ? Math.round((data[0].value / total) * 100) : 0;
  const stockPct = total > 0 ? 100 - etfPct : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <p className="text-xs text-muted-foreground sm:text-sm">
        ETF vs 주식 비중
        {!hasPortfolio && (
          <span className="ml-1 text-[10px]">(시총 기준)</span>
        )}
      </p>
      <div className="mt-1 flex items-center gap-3">
        <div className="h-16 w-16 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number | undefined) =>
                  value !== undefined ? formatKRW(value) + "원" : ""
                }
                contentStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: DONUT_COLORS[0] }}
            />
            <span className="text-xs text-muted-foreground">ETF</span>
            <span className="text-xs font-semibold text-foreground">
              {etfPct}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: DONUT_COLORS[1] }}
            />
            <span className="text-xs text-muted-foreground">주식</span>
            <span className="text-xs font-semibold text-foreground">
              {stockPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DDayCard({
  nextDividend,
}: {
  nextDividend: { asset: Asset; days: number } | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <p className="text-xs text-muted-foreground sm:text-sm">다음 배당 D-Day</p>
      {nextDividend ? (
        <>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-xl font-bold text-foreground sm:text-2xl">
              D-{nextDividend.days}
            </p>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground truncate">
            {nextDividend.asset.name}
            {nextDividend.asset.type === "ETF" && (
              <span className="ml-1 text-indigo-400">
                ({nextDividend.asset.dividendCycle})
              </span>
            )}
          </p>
        </>
      ) : (
        <>
          <p className="mt-1 text-xl font-bold text-muted-foreground sm:text-2xl">
            --
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            배당 종목을 불러오는 중
          </p>
        </>
      )}
    </div>
  );
}
