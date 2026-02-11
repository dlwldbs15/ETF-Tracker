"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Flame,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  GitCompareArrows,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { useShell } from "@/components/layout/shell";
import { usePortfolio } from "@/context/portfolio-context";
import { mockEtfs, mockAssets, getHoldings } from "@/lib/mock-data";
import {
  formatKRW,
  formatChangeRate,
  formatVolume,
  formatExpenseRatio,
  formatMarketCap,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { Highlight } from "@/components/ui/highlight";
import type { Asset, EtfAsset } from "@/types/asset";

/* ── 자산 유형 탭 ──────────────────────────────────── */
type AssetTab = "ALL" | "ETF" | "STOCK";
const assetTabs: { key: AssetTab; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "ETF", label: "ETF" },
  { key: "STOCK", label: "주식" },
];

/* ── 테마 칩 정의 ──────────────────────────────────── */
interface ThemeChip {
  key: string;
  label: string;
  filter: (etf: EtfAsset) => boolean;
}

const themeChips: ThemeChip[] = [
  { key: "all", label: "전체", filter: () => true },
  {
    key: "monthly-div",
    label: "월배당",
    filter: (e) => e.dividendCycle === "월배당",
  },
  {
    key: "semiconductor",
    label: "반도체",
    filter: (e) => e.name.includes("반도체"),
  },
  {
    key: "us",
    label: "미국형",
    filter: (e) => e.name.includes("미국"),
  },
  {
    key: "dividend",
    label: "고배당",
    filter: (e) => e.dividendYield >= 1.5,
  },
  {
    key: "battery",
    label: "2차전지",
    filter: (e) => e.name.includes("2차전지") || e.name.includes("전기차"),
  },
  {
    key: "index",
    label: "지수추종",
    filter: (e) =>
      e.name.includes("200") ||
      e.name.includes("S&P") ||
      e.name.includes("나스닥"),
  },
];

/* ── AUM 옵션 ──────────────────────────────────────── */
const aumOptions = [
  { label: "전체", value: 0 },
  { label: "1,000억 이상", value: 1000_0000_0000 },
  { label: "5,000억 이상", value: 5000_0000_0000 },
  { label: "1조 이상", value: 1_0000_0000_0000 },
  { label: "3조 이상", value: 3_0000_0000_0000 },
];

/* ── 배당 주기 옵션 ────────────────────────────────── */
const dividendCycleOptions = [
  { label: "월배당", value: "월배당" },
  { label: "분기배당", value: "분기배당" },
  { label: "연배당", value: "연배당" },
];

/* ── 기본 필터 값 ──────────────────────────────────── */
const DEFAULT_MAX_EXPENSE = 1.0;
const DEFAULT_MIN_AUM = 0;

export default function ExplorePage() {
  const { openSidebar } = useShell();
  const { addItem, items } = usePortfolio();
  const [assetTab, setAssetTab] = useState<AssetTab>("ALL");
  const [activeTheme, setActiveTheme] = useState("all");

  /* ── 검색 상태 ────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");

  /* ── 상세 필터 상태 ──────────────────────────────── */
  const [maxExpense, setMaxExpense] = useState(DEFAULT_MAX_EXPENSE);
  const [minAum, setMinAum] = useState(DEFAULT_MIN_AUM);
  const [selectedCycles, setSelectedCycles] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  /* ── 비교 상태 ───────────────────────────────────── */
  const [compareTickers, setCompareTickers] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const toggleCompare = useCallback((ticker: string) => {
    setCompareTickers((prev) => {
      if (prev.includes(ticker)) return prev.filter((t) => t !== ticker);
      if (prev.length >= 2) return prev;
      return [...prev, ticker];
    });
  }, []);

  const toggleCycle = useCallback((cycle: string) => {
    setSelectedCycles((prev) =>
      prev.includes(cycle) ? prev.filter((c) => c !== cycle) : [...prev, cycle]
    );
  }, []);

  const resetFilters = useCallback(() => {
    setMaxExpense(DEFAULT_MAX_EXPENSE);
    setMinAum(DEFAULT_MIN_AUM);
    setSelectedCycles([]);
  }, []);

  const hasActiveFilters =
    maxExpense < DEFAULT_MAX_EXPENSE ||
    minAum > DEFAULT_MIN_AUM ||
    selectedCycles.length > 0;

  const isEtfView = assetTab !== "STOCK";

  /* ── 필터링된 자산 ────────────────────────────────── */
  const filteredAssets = useMemo(() => {
    // 1. 자산 유형 필터
    let result: Asset[] =
      assetTab === "ETF" ? mockEtfs
        : assetTab === "STOCK" ? [...mockAssets.filter((a) => a.type === "STOCK")]
        : [...mockAssets];

    // 2. 테마 칩 (ETF 전용) — 주식 탭에서는 무시
    if (isEtfView && activeTheme !== "all") {
      const chip = themeChips.find((c) => c.key === activeTheme);
      if (chip) {
        result = result.filter((a) => a.type === "ETF" && chip.filter(a));
      }
    }

    // 3. 검색어
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.ticker.toLowerCase().includes(q)
      );
    }

    // 4. ETF 전용 필터 — 주식에는 적용하지 않음
    if (isEtfView) {
      result = result.filter((e) =>
        e.type === "STOCK" || (e.type === "ETF" && e.expenseRatio <= maxExpense)
      );
    }

    if (minAum > 0) {
      result = result.filter((e) => e.marketCap >= minAum);
    }

    if (isEtfView && selectedCycles.length > 0) {
      result = result.filter((e) =>
        e.type === "STOCK" || (e.type === "ETF" && selectedCycles.includes(e.dividendCycle))
      );
    }

    return result;
  }, [assetTab, isEtfView, activeTheme, searchQuery, maxExpense, minAum, selectedCycles]);

  /* ── 지금 뜨는 종목: 거래량 상위 3개 ──────────────── */
  const trendingAssets = useMemo(
    () => [...mockAssets].sort((a, b) => b.volume - a.volume).slice(0, 3),
    []
  );

  const isInPortfolio = (ticker: string) =>
    items.some((i) => i.ticker === ticker);

  /* ── 필터 패널 콘텐츠 (desktop sidebar / mobile drawer 공용) */
  const filterContent = (
    <div className="space-y-6">
      {/* 보수 (Expense Ratio) — ETF 전용 */}
      {isEtfView && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              총보수 (Expense Ratio)
            </span>
            <span className="font-mono text-xs font-semibold text-[hsl(var(--sidebar-active))]">
              &le; {maxExpense.toFixed(2)}%
            </span>
          </div>
          <input
            type="range"
            min={0.01}
            max={1.0}
            step={0.01}
            value={maxExpense}
            onChange={(e) => setMaxExpense(parseFloat(e.target.value))}
            className="custom-slider w-full"
          />
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
            <span>0.01%</span>
            <span>1.00%</span>
          </div>
        </div>
      )}

      {/* 운용 자산 (AUM) / 시가총액 */}
      <div>
        <span className="mb-3 block text-xs font-medium text-foreground">
          {isEtfView ? "운용 자산 (AUM)" : "시가총액"}
        </span>
        <div className="space-y-1.5">
          {aumOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMinAum(opt.value)}
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-xs font-medium transition-colors",
                minAum === opt.value
                  ? "bg-[hsl(var(--sidebar-active))]/15 text-[hsl(var(--sidebar-active))]"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 배당 주기 — ETF 전용 */}
      {isEtfView && (
        <div>
          <span className="mb-3 block text-xs font-medium text-foreground">
            배당 주기
          </span>
          <div className="space-y-2">
            {dividendCycleOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2.5"
                onClick={() => toggleCycle(opt.value)}
              >
                <div
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                    selectedCycles.includes(opt.value)
                      ? "border-[hsl(var(--sidebar-active))] bg-[hsl(var(--sidebar-active))]"
                      : "border-input bg-background"
                  )}
                >
                  {selectedCycles.includes(opt.value) && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 초기화 */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" />
          필터 초기화
        </button>
      )}
    </div>
  );

  return (
    <>
      <Header
        title="종목 탐색"
        description="ETF와 주식을 검색하고 비교하세요"
        onMenuClick={openSidebar}
      />

      {/* ── Mobile filter drawer backdrop ───────────── */}
      {filterDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setFilterDrawerOpen(false)}
        />
      )}

      {/* ── Mobile filter drawer ────────────────────── */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-border bg-[hsl(var(--sidebar))] transition-transform duration-200 ease-in-out lg:hidden",
          filterDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[hsl(var(--sidebar-active))]" />
            <span className="text-sm font-semibold text-foreground">
              상세 필터
            </span>
          </div>
          <button
            onClick={() => setFilterDrawerOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filterContent}
        </div>
      </aside>

      {/* ── Main 2-column layout ────────────────────── */}
      <div className="flex">
        {/* Desktop: filter sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border lg:block">
          <div className="sticky top-0 p-5">
            <div className="mb-5 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[hsl(var(--sidebar-active))]" />
              <span className="text-sm font-semibold text-foreground">
                상세 필터
              </span>
            </div>
            {filterContent}
          </div>
        </aside>

        {/* Right: content */}
        <div className={cn("min-w-0 flex-1 space-y-6 p-4 sm:p-6", compareTickers.length > 0 && "pb-24 md:pb-20")}>
          {/* Mobile filter toggle */}
          <div className="flex items-center justify-between lg:hidden">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setFilterDrawerOpen(true)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              필터
              {hasActiveFilters && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--sidebar-active))] text-[10px] font-bold text-white">
                  !
                </span>
              )}
            </Button>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                초기화
              </button>
            )}
          </div>

          {/* ── 자산 유형 탭 ──────────────────────────── */}
          <div className="flex gap-1 rounded-lg border border-border bg-secondary/30 p-1">
            {assetTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setAssetTab(tab.key);
                  if (tab.key === "STOCK") setActiveTheme("all");
                }}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  assetTab === tab.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── 지금 뜨는 종목 ─────────────────────────── */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-400" />
              <h2 className="text-sm font-semibold text-foreground sm:text-base">
                지금 뜨는 종목
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {trendingAssets.map((etf, idx) => {
                const isPositive = etf.changeRate >= 0;
                return (
                  <Link
                    key={etf.ticker}
                    href={`/etf/${etf.ticker}`}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30 sm:p-5"
                  >
                    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-orange-400/15 text-xs font-bold text-orange-400">
                      {idx + 1}
                    </span>

                    <p className="mb-1 line-clamp-1 pr-8 text-sm font-semibold text-foreground">
                      {etf.name}
                    </p>
                    <p className="mb-3 font-mono text-xs text-muted-foreground">
                      {etf.ticker}
                    </p>

                    <p className="text-lg font-bold text-foreground">
                      {formatKRW(etf.currentPrice)}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between">
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-sm font-semibold",
                          isPositive ? "text-emerald-400" : "text-red-400"
                        )}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {formatChangeRate(etf.changeRate)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        거래량 {formatVolume(etf.volume)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── 검색 입력 ─────────────────────────────── */}
          <section>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="티커 또는 종목명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>

          {/* ── 인기 테마 칩 (ETF 전용) ──────────────── */}
          {assetTab !== "STOCK" && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[hsl(var(--sidebar-active))]" />
                <h2 className="text-sm font-semibold text-foreground sm:text-base">
                  인기 테마
                </h2>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {themeChips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => setActiveTheme(chip.key)}
                    className={cn(
                      "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      activeTheme === chip.key
                        ? "border-[hsl(var(--sidebar-active))] bg-[hsl(var(--sidebar-active))]/15 text-[hsl(var(--sidebar-active))]"
                        : "border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ── 필터 결과 리스트 ──────────────────────── */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {filteredAssets.length}개 종목
              </span>
              {compareTickers.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  비교 {compareTickers.length}/2 선택
                </span>
              )}
            </div>

            {filteredAssets.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border">
                <p className="text-sm text-muted-foreground">
                  {searchQuery.trim()
                    ? "검색 결과가 없습니다. 다른 검색어를 입력해 보세요."
                    : "조건에 맞는 종목이 없습니다"}
                </p>
                {searchQuery.trim() && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setSearchQuery("")}
                  >
                    <RotateCcw className="h-3 w-3" />
                    검색 초기화
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((etf) => {
                  const isPositive = etf.changeRate >= 0;
                  const inPortfolio = isInPortfolio(etf.ticker);
                  const isCompareSelected = compareTickers.includes(etf.ticker);
                  const compareDisabled =
                    !isCompareSelected && compareTickers.length >= 2;
                  return (
                    <div
                      key={etf.ticker}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border bg-card p-3 sm:p-4",
                        isCompareSelected
                          ? "border-[hsl(var(--sidebar-active))]/50"
                          : "border-border"
                      )}
                    >
                      {/* 비교 체크박스 */}
                      <button
                        onClick={() => toggleCompare(etf.ticker)}
                        disabled={compareDisabled}
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                          isCompareSelected
                            ? "border-[hsl(var(--sidebar-active))] bg-[hsl(var(--sidebar-active))]"
                            : compareDisabled
                              ? "border-input/50 bg-background opacity-30"
                              : "border-input bg-background hover:border-muted-foreground"
                        )}
                      >
                        {isCompareSelected && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </button>

                      <Link
                        href={`/etf/${etf.ticker}`}
                        className="min-w-0 flex-1"
                      >
                        <p className="truncate text-sm font-medium text-foreground hover:underline">
                          <Highlight text={etf.name} query={searchQuery} />
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            <Highlight text={etf.ticker} query={searchQuery} />
                          </span>
                          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {etf.category}
                          </span>
                          <span className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                            etf.type === "ETF"
                              ? "bg-blue-500/15 text-blue-400"
                              : "bg-emerald-500/15 text-emerald-400"
                          )}>
                            {etf.type === "ETF" ? "ETF" : "주식"}
                          </span>
                          {etf.type === "ETF" && etf.dividendCycle === "월배당" && (
                            <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                              월배당
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="shrink-0 text-right">
                        <p className="font-mono text-sm font-medium text-foreground">
                          {formatKRW(etf.currentPrice)}
                        </p>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isPositive ? "text-emerald-400" : "text-red-400"
                          )}
                        >
                          {formatChangeRate(etf.changeRate)}
                        </span>
                      </div>

                      <div className="hidden w-16 shrink-0 text-right sm:block">
                        <p className="text-xs text-muted-foreground">배당률</p>
                        <p className="font-mono text-sm text-foreground">
                          {etf.dividendYield > 0
                            ? `${etf.dividendYield.toFixed(2)}%`
                            : "-"}
                        </p>
                      </div>

                      <Button
                        variant={inPortfolio ? "secondary" : "outline"}
                        size="sm"
                        className="h-8 shrink-0"
                        disabled={inPortfolio}
                        onClick={() => addItem(etf.ticker)}
                      >
                        {inPortfolio ? (
                          "담김"
                        ) : (
                          <>
                            <Plus className="mr-1 h-3 w-3" />
                            담기
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── 비교 바 (하단 고정) ────────────────────────── */}
      {compareTickers.length > 0 && (
        <div className="fixed bottom-14 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm md:bottom-0 lg:left-60">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              {compareTickers.map((ticker) => {
                const etf = mockAssets.find((e) => e.ticker === ticker);
                return (
                  <div
                    key={ticker}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1"
                  >
                    <span className="max-w-[120px] truncate text-xs font-medium text-foreground sm:max-w-none">
                      {etf?.name}
                    </span>
                    <button
                      onClick={() => toggleCompare(ticker)}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {compareTickers.length < 2 && (
                <span className="text-xs text-muted-foreground">
                  1개 더 선택해주세요
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={() => setCompareTickers([])}
              >
                취소
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1.5"
                disabled={compareTickers.length < 2}
                onClick={() => setCompareModalOpen(true)}
              >
                <GitCompareArrows className="h-3.5 w-3.5" />
                비교하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 비교 모달 ─────────────────────────────────── */}
      {compareModalOpen && compareTickers.length === 2 && (
        <CompareModal
          tickerA={compareTickers[0]}
          tickerB={compareTickers[1]}
          onClose={() => setCompareModalOpen(false)}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   비교 모달 컴포넌트
   ══════════════════════════════════════════════════════ */
function CompareModal({
  tickerA,
  tickerB,
  onClose,
}: {
  tickerA: string;
  tickerB: string;
  onClose: () => void;
}) {
  const assetA = mockAssets.find((e) => e.ticker === tickerA);
  const assetB = mockAssets.find((e) => e.ticker === tickerB);
  if (!assetA || !assetB) return null;

  const bothEtf = assetA.type === "ETF" && assetB.type === "ETF";
  const holdingsA = bothEtf ? getHoldings(tickerA).slice(0, 5) : [];
  const holdingsB = bothEtf ? getHoldings(tickerB).slice(0, 5) : [];

  const rows: { label: string; a: string; b: string; better?: "a" | "b" | null }[] = [
    {
      label: "현재가",
      a: formatKRW(assetA.currentPrice),
      b: formatKRW(assetB.currentPrice),
    },
    {
      label: "등락률",
      a: formatChangeRate(assetA.changeRate),
      b: formatChangeRate(assetB.changeRate),
      better: assetA.changeRate > assetB.changeRate ? "a" : assetA.changeRate < assetB.changeRate ? "b" : null,
    },
    {
      label: "배당 수익률",
      a: assetA.dividendYield > 0 ? `${assetA.dividendYield.toFixed(2)}%` : "-",
      b: assetB.dividendYield > 0 ? `${assetB.dividendYield.toFixed(2)}%` : "-",
      better: assetA.dividendYield > assetB.dividendYield ? "a" : assetA.dividendYield < assetB.dividendYield ? "b" : null,
    },
    {
      label: "시가총액",
      a: formatMarketCap(assetA.marketCap),
      b: formatMarketCap(assetB.marketCap),
      better: assetA.marketCap > assetB.marketCap ? "a" : assetA.marketCap < assetB.marketCap ? "b" : null,
    },
    {
      label: "거래량",
      a: formatVolume(assetA.volume),
      b: formatVolume(assetB.volume),
      better: assetA.volume > assetB.volume ? "a" : assetA.volume < assetB.volume ? "b" : null,
    },
  ];

  // ETF 전용 행 추가
  if (bothEtf) {
    rows.splice(2, 0, {
      label: "총보수",
      a: formatExpenseRatio(assetA.expenseRatio),
      b: formatExpenseRatio(assetB.expenseRatio),
      better: assetA.expenseRatio < assetB.expenseRatio ? "a" : assetA.expenseRatio > assetB.expenseRatio ? "b" : null,
    });
    rows.splice(4, 0, {
      label: "배당 주기",
      a: assetA.dividendCycle,
      b: assetB.dividendCycle,
    });
  }

  // 주식 전용 행 추가
  const bothStock = assetA.type === "STOCK" && assetB.type === "STOCK";
  if (bothStock) {
    rows.splice(2, 0, {
      label: "PER",
      a: `${assetA.per.toFixed(1)}배`,
      b: `${assetB.per.toFixed(1)}배`,
      better: assetA.per < assetB.per ? "a" : assetA.per > assetB.per ? "b" : null,
    });
    rows.splice(3, 0, {
      label: "PBR",
      a: `${assetA.pbr.toFixed(2)}배`,
      b: `${assetB.pbr.toFixed(2)}배`,
      better: assetA.pbr < assetB.pbr ? "a" : assetA.pbr > assetB.pbr ? "b" : null,
    });
  }

  const subtitle = (asset: Asset) => {
    if (asset.type === "ETF") return `${asset.ticker} · ${asset.issuer}`;
    return `${asset.ticker} · ${asset.sector}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 z-50 flex items-start justify-center overflow-y-auto pt-8 sm:inset-8 sm:pt-12">
        <div
          className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5 text-[hsl(var(--sidebar-active))]" />
              <h2 className="text-base font-semibold text-foreground">
                종목 비교
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 종목 이름 헤더 */}
          <div className="grid grid-cols-[1fr_1fr] gap-px border-b border-border bg-border">
            {[assetA, assetB].map((asset) => (
              <div key={asset.ticker} className="bg-card px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">
                    {asset.name}
                  </p>
                  <span className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold",
                    asset.type === "ETF"
                      ? "bg-blue-500/15 text-blue-400"
                      : "bg-emerald-500/15 text-emerald-400"
                  )}>
                    {asset.type === "ETF" ? "ETF" : "주식"}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {subtitle(asset)}
                </p>
              </div>
            ))}
          </div>

          {/* 비교 표 */}
          <div className="divide-y divide-border">
            {rows.map((row) => (
              <div key={row.label} className="grid grid-cols-[1fr_1fr] gap-px bg-border">
                <div className="bg-card px-4 py-2.5 sm:px-5">
                  <p className="mb-0.5 text-[10px] text-muted-foreground">
                    {row.label}
                  </p>
                  <p
                    className={cn(
                      "font-mono text-sm font-medium",
                      row.better === "a"
                        ? "text-[hsl(var(--sidebar-active))]"
                        : "text-foreground"
                    )}
                  >
                    {row.a}
                    {row.better === "a" && (
                      <span className="ml-1.5 text-[10px] font-semibold text-[hsl(var(--sidebar-active))]">
                        WIN
                      </span>
                    )}
                  </p>
                </div>
                <div className="bg-card px-4 py-2.5 sm:px-5">
                  <p className="mb-0.5 text-[10px] text-muted-foreground">
                    {row.label}
                  </p>
                  <p
                    className={cn(
                      "font-mono text-sm font-medium",
                      row.better === "b"
                        ? "text-[hsl(var(--sidebar-active))]"
                        : "text-foreground"
                    )}
                  >
                    {row.b}
                    {row.better === "b" && (
                      <span className="ml-1.5 text-[10px] font-semibold text-[hsl(var(--sidebar-active))]">
                        WIN
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 주요 구성 종목 (ETF끼리 비교 시에만) */}
          {bothEtf && (
            <div className="border-t border-border">
              <div className="px-4 py-3 sm:px-5">
                <p className="text-xs font-semibold text-foreground">
                  주요 구성 종목 (Top 5)
                </p>
              </div>
              <div className="grid grid-cols-[1fr_1fr] gap-px border-t border-border bg-border">
                <div className="bg-card px-4 pb-4 pt-2 sm:px-5">
                  <ul className="space-y-1.5">
                    {holdingsA.map((h) => (
                      <li
                        key={h.ticker}
                        className="flex items-center justify-between"
                      >
                        <span className="truncate text-xs text-muted-foreground">
                          {h.name}
                        </span>
                        <span className="ml-2 shrink-0 font-mono text-xs text-foreground">
                          {h.weight.toFixed(1)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-card px-4 pb-4 pt-2 sm:px-5">
                  <ul className="space-y-1.5">
                    {holdingsB.map((h) => (
                      <li
                        key={h.ticker}
                        className="flex items-center justify-between"
                      >
                        <span className="truncate text-xs text-muted-foreground">
                          {h.name}
                        </span>
                        <span className="ml-2 shrink-0 font-mono text-xs text-foreground">
                          {h.weight.toFixed(1)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end border-t border-border px-5 py-3">
            <Button variant="secondary" size="sm" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
