"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { EtfRankingTable } from "@/components/etf-ranking-table";
import { FilterChips } from "@/components/filter-chips";
import { useShell } from "@/components/layout/shell";
import { useEtfs, useIssuers } from "@/lib/queries/use-assets";

const dividendCycles = ["월배당", "분기배당", "연배당"];

export default function Home() {
  const { openSidebar } = useShell();
  const { data: mockEtfs = [] } = useEtfs();
  const issuers = useIssuers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedDividend, setSelectedDividend] = useState<string | null>(null);

  const filteredEtfs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return mockEtfs.filter((etf) => {
      const matchesSearch =
        query === "" ||
        etf.ticker.toLowerCase().includes(query) ||
        etf.name.toLowerCase().includes(query);

      const matchesProvider =
        selectedProvider === null || etf.issuer === selectedProvider;

      const matchesDividend =
        selectedDividend === null || etf.dividendCycle === selectedDividend;

      return matchesSearch && matchesProvider && matchesDividend;
    });
  }, [mockEtfs, searchQuery, selectedProvider, selectedDividend]);

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
          <SummaryCard label="KOSPI" value="2,687.45" change="+1.23%" positive />
          <SummaryCard label="KOSDAQ" value="872.31" change="-0.45%" positive={false} />
          <SummaryCard label="S&P 500" value="5,234.18" change="+0.67%" positive />
        </div>

        {/* ETF Ranking Table */}
        <div className="rounded-lg border border-border bg-card">
          {/* Sticky: 검색 + 필터 */}
          <div className="sticky top-0 z-10 rounded-t-lg border-b border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-foreground">
                종목 수익률 순위
              </h2>

              {/* Search Input */}
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

            {/* Filters */}
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

            {/* Result Count */}
            <p className="text-xs text-muted-foreground">
              총 {filteredEtfs.length}개 종목
            </p>
          </div>

          {/* Table / Card list */}
          <div className="p-4 pt-0 sm:p-5 sm:pt-0">
            {/* Desktop: horizontal scroll for wide table */}
            <div className="hidden md:block -mx-4 overflow-x-auto sm:-mx-5">
              <div className="min-w-[850px] px-4 sm:px-5 pt-3">
                <EtfRankingTable data={filteredEtfs} searchQuery={searchQuery} />
              </div>
            </div>
            {/* Mobile: card list, no horizontal scroll */}
            <div className="pt-3 md:hidden">
              <EtfRankingTable data={filteredEtfs} searchQuery={searchQuery} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{value}</p>
      <p
        className={`mt-1 text-xs font-medium sm:text-sm ${
          positive ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {change}
      </p>
    </div>
  );
}
